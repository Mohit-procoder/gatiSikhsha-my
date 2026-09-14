from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import (
    api_response, api_error, generate_team_code, generate_hierarchical_team_id,
    generate_student_id, generate_mentor_id, generate_user_id, hash_password
)
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

teams_bp = Blueprint("teams", __name__, url_prefix="/api/v1/teams")

@teams_bp.route("", methods=["POST"])
@role_required("mentor")
def create_team():
    user_id = get_jwt_identity()
    db = get_db()
    mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor profile not found.", status_code=404)

    # Enforce strict 1-team maximum limit per mentor
    existing_teams_count = db.teams.count_documents({"mentor_id": mentor["_id"]})
    if existing_teams_count >= 1:
        return api_error("TEAM_LIMIT_EXCEEDED", "Each mentor can create at most 1 team. You have already formed a team.", status_code=400)

    school = db.schools.find_one({"_id": mentor.get("school_id")})
    if not school:
        return api_error("NOT_FOUND", "Mentor's associated school not found.", status_code=404)

    if school.get("status") != "approved":
        return api_error("FORBIDDEN", "Only approved schools with an active School Code can form competition teams.", status_code=403)

    data = request.get_json() or {}
    team_name = data.get("team_name", "").strip()
    category = data.get("category", "").strip()
    
    # Leader required fields (* marked)
    leader_name = data.get("leader_name", "").strip()
    leader_email = data.get("leader_email", "").strip().lower()
    leader_phone = data.get("leader_phone", "").strip() or data.get("leader_mobile_no", "").strip()
    leader_grade = data.get("leader_grade", "").strip()
    leader_photo = data.get("leader_photo", "").strip()
    leader_father_name = data.get("leader_father_name", "").strip()
    leader_mother_name = data.get("leader_mother_name", "").strip()
    
    members = data.get("members", [])  # list of {name, email, phone, grade, photo, father_name, mother_name}

    if not team_name or not category:
        return api_error("VALIDATION_ERROR", "Team name and category are required.", status_code=400)

    allowed_cats = ["VI-VIII", "IX-X", "XI-XII"]
    if category not in allowed_cats:
        return api_error("VALIDATION_ERROR", f"Category must be one of {allowed_cats}", status_code=400)

    # Validate Team Leader mandatory fields (* marked)
    if not leader_name or not leader_email or not leader_phone or not leader_grade or not leader_photo or not leader_father_name or not leader_mother_name:
        return api_error("VALIDATION_ERROR", "All Team Leader fields (Full Name, Grade, Student Photo, Father's Name, Mother's Name, Mobile No, Email ID) are mandatory.", status_code=400)

    # Configurable Team size validation (min 1 leader + up to 4 members = max 5)
    valid_members = [m for m in members if m.get("name") and m.get("name").strip()]
    total_students = 1 + len(valid_members)
    if total_students > 5:
        return api_error("TEAM_LIMIT_EXCEEDED", "Team cannot have more than 5 student members (1 leader + up to 4 members).", status_code=400)

    # Validate all member mandatory fields (* marked)
    for idx, m in enumerate(valid_members):
        m_name = m.get("name", "").strip()
        m_grade = m.get("grade", "").strip()
        m_photo = m.get("photo", "").strip()
        m_father = m.get("father_name", "").strip()
        m_mother = m.get("mother_name", "").strip()
        m_phone = m.get("phone", "").strip() or m.get("mobile_no", "").strip()
        m_email = m.get("email", "").strip().lower()

        if not m_name or not m_grade or not m_photo or not m_father or not m_mother or not m_phone or not m_email:
            return api_error("VALIDATION_ERROR", f"All fields (Full Name, Grade, Student Photo, Father's Name, Mother's Name, Mobile No, Email ID) are mandatory for Member #{idx + 1}.", status_code=400)

    now = datetime.now(timezone.utc)
    school_district = school.get("district", mentor.get("district", "Kamrup"))
    school_id_tag = school.get("school_code") or school.get("school_custom_id") or str(school["_id"])

    assigned_mentor_id = mentor["_id"]
    assigned_mentor_name = mentor.get("full_name", "")

    # Server-generated unique Team ID and Code
    count = db.teams.count_documents({}) + 1
    team_code = generate_team_code(count)
    while db.teams.find_one({"team_code": team_code}):
        count += 1
        team_code = generate_team_code(count)

    school_teams_count = db.teams.count_documents({"school_id": school["_id"]}) + 1
    team_custom_id = generate_hierarchical_team_id(school_district, school_id_tag, school_teams_count)
    while db.teams.find_one({"team_custom_id": team_custom_id}):
        school_teams_count += 1
        team_custom_id = generate_hierarchical_team_id(school_district, school_id_tag, school_teams_count)

    # Create team document
    team_doc = {
        "team_custom_id": team_custom_id,
        "team_code": team_code,
        "team_name": team_name,
        "school_id": school["_id"],
        "school_name": school.get("school_name", ""),
        "district": school_district,
        "category": category,
        "mentor_id": assigned_mentor_id,
        "mentor_name": assigned_mentor_name,
        "status": "active",
        "competition_stage": "district_shortlisting",
        "qualification_status": "qualified",
        "project_id": None,
        "created_at": now,
        "updated_at": now
    }
    team_result = db.teams.insert_one(team_doc)
    team_id = team_result.inserted_id

    # Create or update team leader student account
    leader_user = db.users.find_one({"email": leader_email})
    if not leader_user:
        default_pwd = data.get("leader_password") or "Student@123"
        total_u = db.users.count_documents({}) + 1
        u_custom_id = generate_user_id("student", total_u)
        user_res = db.users.insert_one({
            "user_id": u_custom_id,
            "email": leader_email,
            "phone": leader_phone,
            "password_hash": hash_password(default_pwd),
            "role": "student",
            "name": leader_name,
            "district": school_district,
            "status": "active",
            "is_verified": True,
            "created_at": now,
            "updated_at": now
        })
        leader_user_id = user_res.inserted_id
    else:
        leader_user_id = leader_user["_id"]

    stu_count = db.students.count_documents({}) + 1
    leader_stu_id = generate_student_id(stu_count)
    leader_doc = {
        "student_custom_id": leader_stu_id,
        "user_id": leader_user_id,
        "team_id": team_id,
        "school_id": school["_id"],
        "district": school_district,
        "full_name": leader_name,
        "email": leader_email,
        "phone": leader_phone,
        "grade": leader_grade,
        "photo": leader_photo,
        "father_name": leader_father_name,
        "mother_name": leader_mother_name,
        "is_leader": True,
        "created_at": now,
        "updated_at": now
    }
    db.students.insert_one(leader_doc)

    # Insert additional team members with all mandatory fields
    for m in valid_members:
        m_name = m.get("name", "").strip()
        m_email = m.get("email", "").strip().lower()
        m_phone = m.get("phone", "").strip() or m.get("mobile_no", "").strip()
        m_grade = m.get("grade", leader_grade).strip()
        m_photo = m.get("photo", "").strip()
        m_father = m.get("father_name", "").strip()
        m_mother = m.get("mother_name", "").strip()

        m_user_id = None
        if m_email:
            existing = db.users.find_one({"email": m_email})
            if not existing:
                tot_u = db.users.count_documents({}) + 1
                m_u_custom = generate_user_id("student", tot_u)
                u_res = db.users.insert_one({
                    "user_id": m_u_custom,
                    "email": m_email,
                    "phone": m_phone,
                    "password_hash": hash_password("Student@123"),
                    "role": "student",
                    "name": m_name,
                    "district": school_district,
                    "status": "active",
                    "is_verified": True,
                    "created_at": now,
                    "updated_at": now
                })
                m_user_id = u_res.inserted_id
            else:
                m_user_id = existing["_id"]

        stu_count = db.students.count_documents({}) + 1
        m_stu_id = generate_student_id(stu_count)
        db.students.insert_one({
            "student_custom_id": m_stu_id,
            "user_id": m_user_id,
            "team_id": team_id,
            "school_id": school["_id"],
            "district": school_district,
            "full_name": m_name,
            "email": m_email,
            "phone": m_phone,
            "grade": m_grade,
            "photo": m_photo,
            "father_name": m_father,
            "mother_name": m_mother,
            "is_leader": False,
            "created_at": now,
            "updated_at": now
        })

    log_audit_event(
        str(user_id), "mentor", "TEAM_CREATED", "teams", str(team_id),
        {"team_code": team_code, "team_custom_id": team_custom_id, "team_name": team_name, "district": school_district}
    )

    return api_response(
        data={
            "team_id": str(team_id),
            "team_custom_id": team_custom_id,
            "team_code": team_code,
            "team_name": team_name,
            "category": category,
            "mentor_id": str(assigned_mentor_id),
            "mentor_name": assigned_mentor_name
        },
        message=f"Team '{team_name}' created successfully with code {team_code}!",
        status_code=201
    )

@teams_bp.route("/my-team", methods=["GET"])
@role_required("student")
def get_my_team():
    user_id = get_jwt_identity()
    db = get_db()
    student = db.students.find_one({"user_id": parse_object_id(user_id)})
    if not student:
        return api_error("NOT_FOUND", "Student record not found.", status_code=404)

    team_id = student.get("team_id")
    if not team_id:
        return api_error("NOT_FOUND", "Student is not enrolled in an active team.", status_code=404)

    team = db.teams.find_one({"_id": team_id})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    school = db.schools.find_one({"_id": team.get("school_id")})
    members = list(db.students.find({"team_id": team_id}))
    project = db.projects.find_one({"team_id": team_id})
    quiz_attempt = db.quiz_attempts.find_one({"team_id": team_id})

    # Global active stage
    settings = db.settings.find_one({"key": "competition"}) or {}
    active_stage = settings.get("current_stage", team.get("competition_stage", "district_shortlisting"))

    payload = {
        "team": serialize_doc(team),
        "school": serialize_doc(school),
        "student": serialize_doc(student),
        "members": serialize_doc(members),
        "project": serialize_doc(project),
        "quiz_attempt": serialize_doc(quiz_attempt),
        "current_stage": active_stage
    }
    return api_response(data=payload)

@teams_bp.route("/<team_id>", methods=["GET"])
@jwt_required()
def get_team_by_id(team_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    db = get_db()

    oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    # Strict RBAC / IDOR Authorization
    if role == "school":
        school = db.schools.find_one({"user_id": parse_object_id(user_id)})
        if not school or str(school["_id"]) != str(team["school_id"]):
            return api_error("FORBIDDEN", "You are not authorized to view teams from another school.", status_code=403)
    elif role == "mentor":
        mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
        if not mentor or str(team.get("mentor_id")) != str(mentor["_id"]):
            return api_error("FORBIDDEN", "You are not authorized to view unassigned teams.", status_code=403)
    elif role == "district":
        district_user = db.users.find_one({"_id": parse_object_id(user_id)})
        user_district = (district_user.get("district") if district_user else "") or claims.get("district", "")
        if not user_district or user_district.lower() != str(team.get("district", "")).lower():
            return api_error("FORBIDDEN", "You are not authorized to view teams outside your district.", status_code=403)
    elif role == "student":
        student = db.students.find_one({"user_id": parse_object_id(user_id)})
        if not student or str(student.get("team_id")) != str(team["_id"]):
            return api_error("FORBIDDEN", "You are not authorized to view other teams.", status_code=403)
    elif role not in ["admin", "evaluator", "jury", "state_jury"]:
        return api_error("FORBIDDEN", "Unauthorized access.", status_code=403)

    members = list(db.students.find({"team_id": team["_id"]}))
    project = db.projects.find_one({"team_id": team["_id"]})
    school = db.schools.find_one({"_id": team.get("school_id")})
    mentor = db.mentors.find_one({"_id": team.get("mentor_id")}) if team.get("mentor_id") else None

    payload = serialize_doc(team)
    payload["members"] = serialize_doc(members)
    payload["project"] = serialize_doc(project) if project else None
    payload["school"] = serialize_doc(school) if school else None
    payload["mentor"] = serialize_doc(mentor) if mentor else None

    return api_response(data=payload)

@teams_bp.route("/<team_id>", methods=["PUT"])
@role_required("school")
def update_team(team_id):
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": oid, "school_id": school["_id"]})
    if not team:
        return api_error("NOT_FOUND", "Team not found in your school.", status_code=404)

    data = request.get_json() or {}
    update_fields = {"updated_at": datetime.now(timezone.utc)}

    if "team_name" in data:
        update_fields["team_name"] = data["team_name"].strip()
    if "category" in data:
        update_fields["category"] = data["category"].strip()
    if "mentor_id" in data:
        m_oid = parse_object_id(data["mentor_id"]) if data["mentor_id"] else None
        update_fields["mentor_id"] = m_oid
        if m_oid:
            m_rec = db.mentors.find_one({"_id": m_oid})
            update_fields["mentor_name"] = m_rec.get("full_name", "") if m_rec else ""

    db.teams.update_one({"_id": oid}, {"$set": update_fields})
    log_audit_event(str(user_id), "school", "TEAM_UPDATED", "teams", str(oid))

    return api_response(message="Team updated successfully.")

@teams_bp.route("/<team_id>/assign-mentor", methods=["POST"])
@role_required("school")
def assign_team_mentor(team_id):
    user_id = get_jwt_identity()
    db = get_db()
    school = db.schools.find_one({"user_id": parse_object_id(user_id)})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": oid, "school_id": school["_id"]})
    if not team:
        return api_error("NOT_FOUND", "Team not found in your school.", status_code=404)

    data = request.get_json() or {}
    mentor_id_str = data.get("mentor_id")
    if not mentor_id_str:
        return api_error("VALIDATION_ERROR", "Mentor ID is required.", status_code=400)

    m_oid = parse_object_id(mentor_id_str)
    mentor = db.mentors.find_one({"_id": m_oid, "school_id": school["_id"]})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor record not found in your school.", status_code=404)

    now = datetime.now(timezone.utc)
    db.teams.update_one({"_id": oid}, {"$set": {
        "mentor_id": m_oid,
        "mentor_name": mentor.get("full_name", ""),
        "updated_at": now
    }})

    # Notify mentor
    if mentor.get("user_id"):
        db.notifications.insert_one({
            "recipient_role": "mentor",
            "recipient_id": mentor["user_id"],
            "title": "Team Assigned",
            "message": f"You have been assigned as Mentor to Team '{team.get('team_name')}'.",
            "type": "team_assignment",
            "is_read": False,
            "created_at": now
        })

    log_audit_event(
        str(user_id), "school", "MENTOR_ASSIGNED", "teams", str(oid),
        {"mentor_id": str(m_oid), "team_name": team.get("team_name")}
    )

    return api_response(message=f"Mentor '{mentor.get('full_name')}' assigned to team successfully.")

@teams_bp.route("/<team_id>/members", methods=["POST"])
@jwt_required()
def add_team_member(team_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    db = get_db()

    oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    # Permission check: School owning team or Student leader of this team
    if role == "school":
        school = db.schools.find_one({"user_id": parse_object_id(user_id)})
        if not school or str(school["_id"]) != str(team["school_id"]):
            return api_error("FORBIDDEN", "Not authorized to modify this team.", status_code=403)
    elif role == "student":
        student = db.students.find_one({"user_id": parse_object_id(user_id)})
        if not student or str(student.get("team_id")) != str(team["_id"]) or not student.get("is_leader"):
            return api_error("FORBIDDEN", "Only the designated team leader may add team members.", status_code=403)
    elif role != "admin":
        return api_error("FORBIDDEN", "Insufficient permissions.", status_code=403)

    # Validate team size limit
    current_members_count = db.students.count_documents({"team_id": team["_id"]})
    if current_members_count >= 5:
        return api_error("LIMIT_EXCEEDED", "Maximum team size of 5 students has been reached.", status_code=400)

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    grade = data.get("grade", "")
    phone = data.get("phone", "")

    if not name:
        return api_error("VALIDATION_ERROR", "Member name is required.", status_code=400)

    now = datetime.now(timezone.utc)
    m_user_id = None
    if email:
        existing = db.users.find_one({"email": email})
        if not existing:
            tot_u = db.users.count_documents({}) + 1
            m_u_custom = generate_user_id("student", tot_u)
            u_res = db.users.insert_one({
                "user_id": m_u_custom,
                "email": email,
                "phone": phone,
                "password_hash": hash_password("Student@123"),
                "role": "student",
                "name": name,
                "district": team.get("district", "Kamrup"),
                "status": "active",
                "is_verified": True,
                "created_at": now,
                "updated_at": now
            })
            m_user_id = u_res.inserted_id
        else:
            m_user_id = existing["_id"]

    stu_count = db.students.count_documents({}) + 1
    m_stu_id = generate_student_id(stu_count)
    new_member = {
        "student_custom_id": m_stu_id,
        "user_id": m_user_id,
        "team_id": team["_id"],
        "school_id": team["school_id"],
        "district": team.get("district", "Kamrup"),
        "full_name": name,
        "email": email,
        "phone": phone,
        "grade": grade,
        "is_leader": False,
        "created_at": now,
        "updated_at": now
    }
    s_res = db.students.insert_one(new_member)

    log_audit_event(
        str(user_id), role, "STUDENT_ADDED", "students", str(s_res.inserted_id),
        {"team_id": str(team["_id"]), "name": name}
    )

    return api_response(message="Team member added successfully.")

@teams_bp.route("/<team_id>/members/<student_id>", methods=["DELETE"])
@jwt_required()
def remove_team_member(team_id, student_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    db = get_db()

    t_oid = parse_object_id(team_id)
    s_oid = parse_object_id(student_id)

    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    if team.get("status") == "locked":
        return api_error("FORBIDDEN", "Cannot modify members of a locked team.", status_code=403)

    if role == "school":
        school = db.schools.find_one({"user_id": parse_object_id(user_id)})
        if not school or str(school["_id"]) != str(team["school_id"]):
            return api_error("FORBIDDEN", "Not authorized to modify this team.", status_code=403)
    elif role == "student":
        leader = db.students.find_one({"user_id": parse_object_id(user_id), "team_id": t_oid, "is_leader": True})
        if not leader:
            return api_error("FORBIDDEN", "Only the school or team leader can remove members.", status_code=403)
    elif role != "admin":
        return api_error("FORBIDDEN", "Unauthorized access.", status_code=403)

    student = db.students.find_one({"_id": s_oid, "team_id": t_oid})
    if not student:
        return api_error("NOT_FOUND", "Student member not found in this team.", status_code=404)

    if student.get("is_leader"):
        return api_error("FORBIDDEN", "Cannot remove the team leader. Transfer leadership or disband team.", status_code=400)

    # Disassociate from team (keep in school student records)
    db.students.update_one({"_id": s_oid}, {"$set": {"team_id": None, "updated_at": datetime.now(timezone.utc)}})

    log_audit_event(
        str(user_id), role, "STUDENT_REMOVED", "students", str(s_oid),
        {"team_id": str(t_oid), "student_id": student.get("student_custom_id")}
    )

    return api_response(message="Member removed from team successfully.")

