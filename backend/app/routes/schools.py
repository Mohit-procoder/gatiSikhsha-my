from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, hash_password, generate_school_id, generate_user_id, generate_mentor_id, generate_student_id
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event
from app.services.udise_service import UDISEVerificationService

schools_bp = Blueprint("schools", __name__, url_prefix="/api/v1/schools")

ASSAM_DISTRICTS = {
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar',
    'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh',
    'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat',
    'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
    'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar',
    'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
}

@schools_bp.route("/register", methods=["POST"])
def register_school():
    data = request.get_json() or {}

    # Strict Assam-only validation: Never trust frontend
    state = data.get("state", "Assam")
    if state != "Assam":
        return api_error("ELIGIBILITY_ERROR", "Registration is strictly restricted to schools located in Assam.", status_code=400)

    district = data.get("district", "").strip()
    if not district or district not in ASSAM_DISTRICTS:
        return api_error("VALIDATION_ERROR", "Invalid district. Please select one of the 33 official Assam districts.", status_code=400)

    # Validation
    required_fields = [
        "school_name", "udise_school_id", "school_type", "district", "pin_code",
        "official_email", "official_phone", "principal_name",
        "password", "confirm_password"
    ]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return api_error("VALIDATION_ERROR", f"Missing required fields: {', '.join(missing)}", status_code=400)

    if data.get("password") != data.get("confirm_password"):
        return api_error("VALIDATION_ERROR", "Passwords do not match.", status_code=400)

    # Password security check
    password = data.get("password", "")
    if len(password) < 8:
        return api_error("WEAK_PASSWORD", "Password must be at least 8 characters in length.", status_code=400)

    # Mandatory UDISE format check via UDISEVerificationService
    udise = str(data.get("udise_school_id", "")).strip()
    is_valid_udise, udise_err = UDISEVerificationService.validate_format(udise)
    if not is_valid_udise:
        return api_error(
            "INVALID_UDISE",
            udise_err or "Please enter a valid 11-digit UDISE School ID for Assam (must start with state code '18').",
            status_code=400
        )

    verification_result = UDISEVerificationService.verify_school_udise(udise, data.get("school_name", ""), district)

    db = get_db()

    # Duplicate UDISE check
    if db.schools.find_one({"udise_school_id": udise}):
        return api_error("DUPLICATE_UDISE", "This UDISE School ID is already registered.", status_code=409)

    email = data.get("official_email", "").strip().lower()
    if db.users.find_one({"email": email}):
        return api_error("DUPLICATE_EMAIL", "A school account with this official email already exists.", status_code=409)

    now = datetime.now(timezone.utc)
    total_users_count = db.users.count_documents({}) + 1
    user_custom_id = generate_user_id("school", total_users_count)

    # Create user with status 'pending'
    user_doc = {
        "user_id": user_custom_id,
        "email": email,
        "phone": data.get("official_phone", "").strip(),
        "password_hash": hash_password(password),
        "role": "school",
        "name": data["school_name"].strip(),
        "status": "pending",
        "is_verified": False,
        "last_login": None,
        "created_at": now,
        "updated_at": now
    }
    user_result = db.users.insert_one(user_doc)
    user_id = user_result.inserted_id

    # Server-generated unique School ID (e.g. AFIP-SCH-000001)
    school_count = db.schools.count_documents({}) + 1
    unique_school_id = generate_school_id(school_count)
    while db.schools.find_one({"school_custom_id": unique_school_id}):
        school_count += 1
        unique_school_id = generate_school_id(school_count)

    # Create school document with UDISE verification status
    school_doc = {
        "user_id": user_id,
        "school_custom_id": unique_school_id,
        "school_name": data["school_name"].strip(),
        "udise_school_id": udise,
        "udise_verification_status": verification_result.get("status", "format_valid"),
        "udise_verified_at": None,
        "udise_verified_by": None,
        "udise_verification_source": verification_result.get("verified_source", "Format Validation (Prefix 18 Check)"),
        "school_type": data.get("school_type", "Government Model School"),
        "board": data.get("board", "SEBA"),
        "district": district,
        "block": data.get("block", "").strip() or data.get("address_line_2", "").strip() or "Central Block",
        "address_line_1": data.get("address_line_1", "").strip() or data.get("address", "").strip(),
        "address_line_2": data.get("address_line_2", "").strip(),
        "state": "Assam",
        "pin_code": data.get("pin_code", "").strip(),
        "official_email": email,
        "official_phone": data.get("official_phone", "").strip(),
        "website": data.get("website", "").strip(),
        "principal": {
            "name": data.get("principal_name", "").strip(),
            "email": data.get("principal_email", "").strip() or email,
            "phone": data.get("principal_phone", "").strip() or data.get("official_phone", "").strip()
        },
        "coordinator": {
            "name": data.get("coordinator_name", "").strip() or data.get("principal_name", "").strip(),
            "email": data.get("coordinator_email", "").strip() or email,
            "phone": data.get("coordinator_phone", "").strip() or data.get("official_phone", "").strip(),
            "designation": data.get("coordinator_designation", "Innovation Mentor")
        },
        "status": "pending",
        "rejection_reason": None,
        "created_at": now,
        "updated_at": now
    }
    school_result = db.schools.insert_one(school_doc)

    # In-app notification for admin
    db.notifications.insert_one({
        "recipient_role": "admin",
        "recipient_id": None,
        "title": "New School Registration",
        "message": f"'{data['school_name']}' (UDISE: {udise}) from {district} has registered and is awaiting approval.",
        "type": "registration",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(
        str(user_id), "school", "SCHOOL_REGISTERED", "schools", str(school_result.inserted_id),
        {"udise": udise, "school_id": unique_school_id, "district": district}
    )

    return api_response(
        data={
            "school_id": str(school_result.inserted_id),
            "school_custom_id": unique_school_id,
            "udise_school_id": udise,
            "status": "pending"
        },
        message="Registration submitted successfully. Your application is under review by the administration.",
        status_code=201
    )

@schools_bp.route("/me", methods=["GET"])
@role_required("school")
def get_my_school():
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School details not found.", status_code=404)

    # Compute stats
    school_id = school["_id"]
    teams_count = db.teams.count_documents({"school_id": school_id})
    team_ids = [t["_id"] for t in db.teams.find({"school_id": school_id}, {"_id": 1})]
    students_count = db.students.count_documents({"team_id": {"$in": team_ids}})
    projects_count = db.projects.count_documents({"school_id": school_id})
    quiz_attempts_count = db.quiz_attempts.count_documents({"team_id": {"$in": team_ids}})

    data = serialize_doc(school)
    data["stats"] = {
        "total_teams": teams_count,
        "total_students": students_count,
        "projects_submitted": projects_count,
        "quiz_attempts": quiz_attempts_count
    }
    return api_response(data=data)

@schools_bp.route("/my-teams", methods=["GET"])
@role_required("school")
def get_school_teams():
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School record not found.", status_code=404)

    teams = list(db.teams.find({"school_id": school["_id"]}).sort("created_at", -1))
    
    # Enrich teams with members, leader and project status
    enriched = []
    for team in teams:
        team_doc = serialize_doc(team)
        members = list(db.students.find({"team_id": team["_id"]}))
        team_doc["members_detail"] = serialize_doc(members)
        project = db.projects.find_one({"team_id": team["_id"]})
        team_doc["project"] = serialize_doc(project) if project else None
        enriched.append(team_doc)

    return api_response(data=enriched)

@schools_bp.route("/mentors", methods=["GET"])
@role_required("school")
def get_school_mentors():
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    mentors = list(db.mentors.find({"school_id": school["_id"]}).sort("created_at", -1))
    enriched = []
    for m in mentors:
        m_doc = serialize_doc(m)
        # Count teams assigned to this mentor
        teams_assigned = list(db.teams.find({"mentor_id": m["_id"]}, {"team_name": 1, "team_code": 1, "team_custom_id": 1, "category": 1}))
        m_doc["assigned_teams_count"] = len(teams_assigned)
        m_doc["assigned_teams"] = serialize_doc(teams_assigned)
        enriched.append(m_doc)

    return api_response(data=enriched)

@schools_bp.route("/mentors", methods=["POST"])
@role_required("school")
def create_school_mentor():
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    if school.get("status") != "approved":
        return api_error("FORBIDDEN", "Only approved schools can create and onboard mentors.", status_code=403)

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    designation = data.get("designation", "Innovation Mentor").strip()
    password = data.get("password") or "Mentor@123"

    if not name or not email:
        return api_error("VALIDATION_ERROR", "Mentor name and email are required.", status_code=400)

    # Check duplicate email
    if db.users.find_one({"email": email}):
        return api_error("DUPLICATE_EMAIL", "A user account with this email already exists.", status_code=409)

    now = datetime.now(timezone.utc)

    # Server-generated unique Mentor ID (e.g. AFIP-MEN-000123)
    mentor_count = db.mentors.count_documents({}) + 1
    mentor_custom_id = generate_mentor_id(mentor_count)
    while db.mentors.find_one({"mentor_custom_id": mentor_custom_id}):
        mentor_count += 1
        mentor_custom_id = generate_mentor_id(mentor_count)

    # Create user record
    total_users_count = db.users.count_documents({}) + 1
    user_custom_id = generate_user_id("mentor", total_users_count)
    user_doc = {
        "user_id": user_custom_id,
        "email": email,
        "phone": phone,
        "password_hash": hash_password(password),
        "role": "mentor",
        "name": name,
        "district": school.get("district", ""),
        "status": "active",
        "is_verified": True,
        "last_login": None,
        "created_at": now,
        "updated_at": now
    }
    user_res = db.users.insert_one(user_doc)
    m_user_id = user_res.inserted_id

    # Create mentor record
    mentor_doc = {
        "user_id": m_user_id,
        "mentor_custom_id": mentor_custom_id,
        "school_id": school["_id"],
        "school_name": school.get("school_name", ""),
        "district": school.get("district", ""),
        "full_name": name,
        "email": email,
        "phone": phone,
        "designation": designation,
        "status": "active",
        "created_at": now,
        "updated_at": now
    }
    mentor_res = db.mentors.insert_one(mentor_doc)
    mentor_id = mentor_res.inserted_id

    # In-app notification for mentor
    db.notifications.insert_one({
        "recipient_role": "mentor",
        "recipient_id": m_user_id,
        "title": "Welcome to Assam Future Innovation Program",
        "message": f"You have been onboarded as an Innovation Mentor for '{school.get('school_name')}'.",
        "type": "welcome",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(
        str(user_id), "school", "MENTOR_CREATED", "mentors", str(mentor_id),
        {"mentor_id": mentor_custom_id, "school_id": str(school["_id"]), "name": name, "email": email}
    )

    return api_response(
        data={
            "mentor_id": str(mentor_id),
            "mentor_custom_id": mentor_custom_id,
            "name": name,
            "email": email,
            "designation": designation
        },
        message=f"Mentor '{name}' created successfully with ID {mentor_custom_id}.",
        status_code=201
    )

@schools_bp.route("/students", methods=["GET"])
@role_required("school")
def get_school_students():
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    students = list(db.students.find({"school_id": school["_id"]}).sort("created_at", -1))
    enriched = []
    for s in students:
        s_doc = serialize_doc(s)
        if s.get("team_id"):
            team = db.teams.find_one({"_id": s["team_id"]}, {"team_name": 1, "team_code": 1, "team_custom_id": 1, "category": 1})
            s_doc["team"] = serialize_doc(team) if team else None
        else:
            s_doc["team"] = None
        enriched.append(s_doc)

    return api_response(data=enriched)

@schools_bp.route("/students", methods=["POST"])
@role_required("school")
def add_school_student():
    return api_error("FORBIDDEN", "Student registration and team formation is now exclusively managed by your school's Teacher Mentors.", status_code=403)

@schools_bp.route("/students/<student_id>", methods=["PUT"])
@role_required("school")
def update_school_student(student_id):
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    s_oid = parse_object_id(student_id)
    student = db.students.find_one({"_id": s_oid, "school_id": school["_id"]})
    if not student:
        return api_error("NOT_FOUND", "Student record not found in your school.", status_code=404)

    data = request.get_json() or {}
    update_fields = {}
    for f in ["full_name", "grade", "phone", "gender", "age"]:
        if f in data:
            update_fields[f] = data[f]

    if "team_id" in data:
        t_id_str = data["team_id"]
        if t_id_str:
            t_oid = parse_object_id(t_id_str)
            team = db.teams.find_one({"_id": t_oid, "school_id": school["_id"]})
            if not team:
                return api_error("VALIDATION_ERROR", "Selected team does not belong to your school.", status_code=400)
            update_fields["team_id"] = t_oid
        else:
            update_fields["team_id"] = None

    update_fields["updated_at"] = datetime.now(timezone.utc)
    db.students.update_one({"_id": s_oid}, {"$set": update_fields})

    log_audit_event(
        str(user_id), "school", "STUDENT_UPDATED", "students", str(s_oid),
        {"student_id": student.get("student_custom_id"), "school_id": str(school["_id"])}
    )

    return api_response(message="Student information updated successfully.")

@schools_bp.route("/students/<student_id>", methods=["DELETE"])
@role_required("school")
def remove_school_student(student_id):
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    s_oid = parse_object_id(student_id)
    student = db.students.find_one({"_id": s_oid, "school_id": school["_id"]})
    if not student:
        return api_error("NOT_FOUND", "Student record not found in your school.", status_code=404)

    # Check if team is locked
    if student.get("team_id"):
        team = db.teams.find_one({"_id": student["team_id"]})
        if team and team.get("status") == "locked":
            return api_error("FORBIDDEN", "Cannot remove student from a locked competition team.", status_code=403)

    db.students.delete_one({"_id": s_oid})

    log_audit_event(
        str(user_id), "school", "STUDENT_REMOVED", "students", str(s_oid),
        {"student_id": student.get("student_custom_id"), "name": student.get("full_name")}
    )

    return api_response(message="Student removed successfully.")

@schools_bp.route("/profile", methods=["PUT"])
@role_required("school")
def update_school_profile():
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    data = request.get_json() or {}
    now = datetime.now(timezone.utc)

    update_fields = {"updated_at": now}
    if "official_phone" in data:
        update_fields["official_phone"] = data["official_phone"].strip()
    if "website" in data:
        update_fields["website"] = data["website"].strip()
    if "address_line_1" in data:
        update_fields["address_line_1"] = data["address_line_1"].strip()
    if "address_line_2" in data:
        update_fields["address_line_2"] = data["address_line_2"].strip()
    if "pin_code" in data:
        update_fields["pin_code"] = data["pin_code"].strip()

    if "principal" in data and isinstance(data["principal"], dict):
        update_fields["principal"] = {
            "name": data["principal"].get("name", "").strip(),
            "email": data["principal"].get("email", "").strip(),
            "phone": data["principal"].get("phone", "").strip()
        }
    if "coordinator" in data and isinstance(data["coordinator"], dict):
        update_fields["coordinator"] = {
            "name": data["coordinator"].get("name", "").strip(),
            "email": data["coordinator"].get("email", "").strip(),
            "phone": data["coordinator"].get("phone", "").strip(),
            "designation": data["coordinator"].get("designation", "Innovation Mentor").strip()
        }

    db.schools.update_one({"_id": school["_id"]}, {"$set": update_fields})

    log_audit_event(
        str(user_id), "school", "SCHOOL_PROFILE_UPDATED", "schools", str(school["_id"])
    )

    return api_response(message="School profile updated successfully.")
