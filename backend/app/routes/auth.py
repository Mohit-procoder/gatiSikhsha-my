from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, verify_password, hash_password, generate_team_code
from app.utils.audit import log_audit_event

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

# Defined roles supported in AFIP RBAC
ALLOWED_ROLES = [
    "admin", "school", "mentor", "evaluator", "district", "jury", "state_jury", "student"
]

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    target_role = data.get("role")  # optional filter

    if not email or not password:
        return api_error("VALIDATION_ERROR", "Email and password are required.", status_code=400)

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user:
        return api_error("INVALID_CREDENTIALS", "Invalid email or password.", status_code=401)

    if not verify_password(password, user.get("password_hash", "")):
        return api_error("INVALID_CREDENTIALS", "Invalid email or password.", status_code=401)

    role = str(user.get("role", "")).lower()
    if target_role:
        target_role_clean = str(target_role).strip().lower()
        if target_role_clean != role:
            return api_error("ROLE_MISMATCH", f"This account is registered as a {role}, not as {target_role}.", status_code=403)

    user_status = str(user.get("status", "active")).lower()
    if user_status == "pending":
        return api_error("ACCOUNT_PENDING", "Your account registration is currently pending administrative review.", status_code=403)
    elif user_status in ["rejected", "suspended", "deactivated"]:
        rejection_note = f" Reason: {user.get('rejection_reason')}" if user.get("rejection_reason") else ""
        return api_error("ACCOUNT_SUSPENDED", f"Your account status is '{user_status}'.{rejection_note} Please contact administration.", status_code=403)

    user_id_str = str(user["_id"])
    now = datetime.now(timezone.utc)

    # Update last_login timestamp
    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": now, "updated_at": now}})

    # Fetch associated role profile
    profile_data = {}
    if role == "school":
        school = db.schools.find_one({"user_id": user["_id"]})
        if school:
            profile_data["school"] = serialize_doc(school)
    elif role == "student":
        student = db.students.find_one({"user_id": user["_id"]})
        if student:
            profile_data["student"] = serialize_doc(student)
            if student.get("team_id"):
                team = db.teams.find_one({"_id": student["team_id"]})
                if team:
                    profile_data["team"] = serialize_doc(team)
                    if team.get("school_id"):
                        school = db.schools.find_one({"_id": team["school_id"]})
                        if school:
                            profile_data["school"] = serialize_doc(school)
    elif role == "evaluator":
        evaluator = db.evaluators.find_one({"user_id": user["_id"]})
        if evaluator:
            profile_data["evaluator"] = serialize_doc(evaluator)
    elif role == "mentor":
        mentor = db.mentors.find_one({"user_id": user["_id"]})
        if mentor:
            m_doc = serialize_doc(mentor)
            if mentor.get("school_id"):
                school = db.schools.find_one({"_id": mentor["school_id"]})
                if school:
                    m_doc["school"] = serialize_doc(school)
            profile_data["mentor"] = m_doc
    elif role == "district":
        district_name = user.get("district") or "Kamrup"
        from app.utils.helpers import generate_district_id
        profile_data["district"] = {
            "district_name": district_name,
            "district_id": generate_district_id(district_name),
            "state": "Assam"
        }
    elif role == "jury":
        profile_data["jury"] = {
            "jury_id": user.get("user_id") or f"AFIP-JUR-{str(user['_id'])[-6:].upper()}",
            "name": user.get("name"),
            "email": user.get("email"),
            "role": "jury"
        }
    elif role == "state_jury":
        profile_data["state_jury"] = {
            "state_jury_id": user.get("user_id") or f"AFIP-STJ-{str(user['_id'])[-6:].upper()}",
            "name": user.get("name"),
            "email": user.get("email"),
            "role": "state_jury",
            "panel": "State Grand Jury & Awards Council"
        }

    # Create JWT
    additional_claims = {
        "role": role,
        "email": email,
        "name": user.get("name", ""),
        "district": user.get("district", "")
    }
    access_token = create_access_token(identity=user_id_str, additional_claims=additional_claims)

    log_audit_event(user_id_str, role, "USER_LOGIN", "users", user_id_str, {"email": email})

    response_data = {
        "token": access_token,
        "user": {
            "id": user_id_str,
            "user_id": user.get("user_id") or user_id_str,
            "email": user["email"],
            "name": user.get("name", ""),
            "phone": user.get("phone", ""),
            "role": role,
            "district": user.get("district", ""),
            "status": user.get("status", "active"),
            "last_login": now.isoformat(),
            "is_verified": user.get("is_verified", True if role == "admin" else False)
        },
        **profile_data
    }
    return api_response(data=response_data, message="Login successful")

@auth_bp.route("/logout", methods=["POST"])
@jwt_required(optional=True)
def logout():
    user_id = get_jwt_identity()
    claims = get_jwt() or {}
    role = claims.get("role", "user")
    if user_id:
        log_audit_event(user_id, role, "USER_LOGOUT", "users", user_id)
    return api_response(data=None, message="Logged out successfully.")

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": parse_object_id(user_id)})
    if not user:
        return api_error("NOT_FOUND", "User profile not found", status_code=404)

    role = user.get("role")
    profile_data = {}
    if role == "school":
        school = db.schools.find_one({"user_id": user["_id"]})
        if school:
            profile_data["school"] = serialize_doc(school)
    elif role == "student":
        student = db.students.find_one({"user_id": user["_id"]})
        if student:
            profile_data["student"] = serialize_doc(student)
            if student.get("team_id"):
                team = db.teams.find_one({"_id": student["team_id"]})
                if team:
                    profile_data["team"] = serialize_doc(team)
                    if team.get("school_id"):
                        school = db.schools.find_one({"_id": team["school_id"]})
                        if school:
                            profile_data["school"] = serialize_doc(school)
    elif role == "evaluator":
        evaluator = db.evaluators.find_one({"user_id": user["_id"]})
        if evaluator:
            profile_data["evaluator"] = serialize_doc(evaluator)
    elif role == "mentor":
        mentor = db.mentors.find_one({"user_id": user["_id"]})
        if mentor:
            m_doc = serialize_doc(mentor)
            if mentor.get("school_id"):
                school = db.schools.find_one({"_id": mentor["school_id"]})
                if school:
                    m_doc["school"] = serialize_doc(school)
            profile_data["mentor"] = m_doc
    elif role == "district":
        district_name = user.get("district") or "Kamrup"
        from app.utils.helpers import generate_district_id
        profile_data["district"] = {
            "district_name": district_name,
            "district_id": generate_district_id(district_name),
            "state": "Assam"
        }
    elif role == "jury":
        profile_data["jury"] = {
            "jury_id": user.get("user_id") or f"AFIP-JUR-{str(user['_id'])[-6:].upper()}",
            "name": user.get("name"),
            "email": user.get("email"),
            "role": "jury"
        }
    elif role == "state_jury":
        profile_data["state_jury"] = {
            "state_jury_id": user.get("user_id") or f"AFIP-STJ-{str(user['_id'])[-6:].upper()}",
            "name": user.get("name"),
            "email": user.get("email"),
            "role": "state_jury",
            "panel": "State Grand Jury & Awards Council"
        }

    user_info = {
        "id": str(user["_id"]),
        "user_id": user.get("user_id") or str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),
        "role": role,
        "status": user.get("status", "active"),
        "created_at": user.get("created_at"),
        "last_login": user.get("last_login"),
        "is_verified": user.get("is_verified", True if role == "admin" else False)
    }

    return api_response(data={"user": user_info, **profile_data})

@auth_bp.route("/register-student", methods=["POST"])
def register_student():
    data = request.get_json() or {}
    required_fields = [
        "school_code", "team_name", "category",
        "leader_name", "leader_email", "leader_grade",
        "password", "confirm_password"
    ]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return api_error("VALIDATION_ERROR", f"Missing required fields: {', '.join(missing)}", status_code=400)

    if data.get("password") != data.get("confirm_password"):
        return api_error("VALIDATION_ERROR", "Passwords do not match.", status_code=400)

    password = data.get("password", "")
    if len(password) < 8:
        return api_error("WEAK_PASSWORD", "Password must be at least 8 characters long.", status_code=400)

    category = data.get("category", "").strip()
    if category not in ["VI-VIII", "IX-X", "XI-XII"]:
        return api_error("VALIDATION_ERROR", "Category must be one of: VI-VIII, IX-X, XI-XII.", status_code=400)

    school_code = data.get("school_code", "").strip().upper()
    db = get_db()
    school = db.schools.find_one({"school_code": school_code})
    if not school:
        return api_error("INVALID_SCHOOL_CODE", "School Code not found. Please obtain your official approved code from your school mentor.", status_code=404)

    if school.get("status") != "approved":
        return api_error("SCHOOL_NOT_APPROVED", "Your school application is still pending administrative approval.", status_code=403)

    leader_email = data.get("leader_email", "").strip().lower()
    if db.users.find_one({"email": leader_email}):
        return api_error("DUPLICATE_EMAIL", "An account with this student email already exists.", status_code=409)

    now = datetime.utcnow()

    # Generate sequential team code
    count = db.teams.count_documents({}) + 1
    team_code = generate_team_code(count)
    while db.teams.find_one({"team_code": team_code}):
        count += 1
        team_code = generate_team_code(count)

    # 1. Create team document - securely bind school_id from verified school document
    team_name = data.get("team_name", "").strip()
    team_doc = {
        "team_code": team_code,
        "team_name": team_name,
        "school_id": school["_id"],
        "category": category,
        "mentor_id": None,
        "mentor_name": data.get("mentor_name") or school.get("coordinator", {}).get("name", "School Innovation Mentor"),
        "status": "active",
        "competition_stage": "team_formation",
        "project_id": None,
        "created_at": now,
        "updated_at": now
    }
    team_res = db.teams.insert_one(team_doc)
    team_id = team_res.inserted_id

    # 2. Create student user
    leader_name = data.get("leader_name", "").strip()
    user_res = db.users.insert_one({
        "email": leader_email,
        "password_hash": hash_password(password),
        "role": "student",
        "name": leader_name,
        "status": "active",
        "created_at": now,
        "updated_at": now
    })
    user_id = user_res.inserted_id

    # 3. Create student document
    student_doc = {
        "user_id": user_id,
        "team_id": team_id,
        "school_id": school["_id"],
        "full_name": leader_name,
        "email": leader_email,
        "phone": data.get("leader_phone", "").strip(),
        "grade": data.get("leader_grade", "").strip(),
        "is_leader": True,
        "created_at": now
    }
    db.students.insert_one(student_doc)

    # 4. Insert any additional team members
    members = data.get("members", [])
    for m in members:
        if m.get("name"):
            m_email = m.get("email", "").strip().lower()
            m_user_id = None
            if m_email:
                existing = db.users.find_one({"email": m_email})
                if not existing:
                    u_res = db.users.insert_one({
                        "email": m_email,
                        "password_hash": hash_password("Student@123"),
                        "role": "student",
                        "name": m["name"],
                        "status": "active",
                        "created_at": now,
                        "updated_at": now
                    })
                    m_user_id = u_res.inserted_id
                else:
                    m_user_id = existing["_id"]

            db.students.insert_one({
                "user_id": m_user_id,
                "team_id": team_id,
                "school_id": school["_id"],
                "full_name": m["name"],
                "email": m_email,
                "grade": m.get("grade", ""),
                "is_leader": False,
                "created_at": now
            })

    log_audit_event(str(user_id), "student", "STUDENT_TEAM_REGISTERED", "teams", str(team_id), {"team_code": team_code})

    return api_response(
        data={
            "team_id": str(team_id),
            "team_code": team_code,
            "team_name": team_name,
            "school_name": school.get("school_name"),
            "category": category
        },
        message=f"Team '{team_name}' registered successfully under {school.get('school_name')}! You may now sign in.",
        status_code=201
    )
