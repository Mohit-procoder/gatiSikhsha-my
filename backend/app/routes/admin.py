from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, generate_school_code
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

@admin_bp.route("/stats", methods=["GET"])
@role_required("admin")
def get_admin_stats():
    db = get_db()
    total_schools = db.schools.count_documents({})
    pending_schools = db.schools.count_documents({"status": "pending"})
    approved_schools = db.schools.count_documents({"status": "approved"})

    total_teams = db.teams.count_documents({})
    total_students = db.students.count_documents({})

    total_evaluators = db.evaluators.count_documents({})
    approved_evaluators = db.evaluators.count_documents({"status": "approved"})
    pending_evaluators = db.evaluators.count_documents({"status": "pending"})

    projects_submitted = db.projects.count_documents({"status": {"$in": ["submitted", "evaluated"]}})
    total_assignments = db.evaluation_assignments.count_documents({})
    completed_evals = db.evaluations.count_documents({"status": "submitted"})
    pending_evaluations = total_assignments - completed_evals

    quiz_attempts = db.quiz_attempts.count_documents({})

    # Aggregations for charts
    teams_by_cat = {
        "VI-VIII": db.teams.count_documents({"category": "VI-VIII"}),
        "IX-X": db.teams.count_documents({"category": "IX-X"}),
        "XI-XII": db.teams.count_documents({"category": "XI-XII"})
    }

    # District distribution
    district_counts = {}
    for s in db.schools.find({}, {"district": 1}):
        d = s.get("district", "Kamrup")
        district_counts[d] = district_counts.get(d, 0) + 1

    settings = db.settings.find_one({"key": "competition"}) or {}

    stats = {
        "total_schools": total_schools,
        "pending_schools": pending_schools,
        "approved_schools": approved_schools,
        "total_teams": total_teams,
        "total_students": total_students,
        "approved_evaluators": approved_evaluators,
        "pending_evaluators": pending_evaluators,
        "projects_submitted": projects_submitted,
        "pending_evaluations": max(0, pending_evaluations),
        "completed_evaluations": completed_evals,
        "quiz_attempts": quiz_attempts,
        "current_stage": settings.get("current_stage", "online_bootcamp"),
        "leaderboard_public": settings.get("leaderboard_public", True),
        "charts": {
            "teams_by_category": teams_by_cat,
            "schools_by_district": district_counts
        }
    }
    return api_response(data=stats)

@admin_bp.route("/schools", methods=["GET"])
@role_required("admin")
def list_schools():
    db = get_db()
    status = request.args.get("status")
    district = request.args.get("district")
    search = request.args.get("search", "").strip()

    query = {}
    if status and status != "all":
        query["status"] = status
    if district and district != "all":
        query["district"] = district
    if search:
        query["$or"] = [
            {"school_name": {"$regex": search, "$options": "i"}},
            {"school_code": {"$regex": search, "$options": "i"}},
            {"official_email": {"$regex": search, "$options": "i"}}
        ]

    schools = list(db.schools.find(query).sort("created_at", -1))
    enriched = []
    for s in schools:
        s_doc = serialize_doc(s)
        s_doc["teams_count"] = db.teams.count_documents({"school_id": s["_id"]})
        enriched.append(s_doc)

    return api_response(data=enriched)

@admin_bp.route("/schools/pending", methods=["GET"])
@role_required("admin")
def list_pending_schools():
    db = get_db()
    pending_schools = list(db.schools.find({"status": "pending"}).sort("created_at", -1))
    enriched = []
    for s in pending_schools:
        s_doc = serialize_doc(s)
        s_doc["teams_count"] = db.teams.count_documents({"school_id": s["_id"]})
        enriched.append(s_doc)
    return api_response(data=enriched)

@admin_bp.route("/schools/<school_id>/approve", methods=["POST"])
@role_required("admin")
def approve_school(school_id):
    user_id = get_jwt_identity()
    db = get_db()
    oid = parse_object_id(school_id)
    school = db.schools.find_one({"_id": oid})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    now = datetime.now(timezone.utc)
    generated_code = school.get("school_code")
    if not generated_code:
        count = db.schools.count_documents({"status": "approved"}) + 1
        generated_code = generate_school_code(school.get("district", "Kamrup"), count)
        while db.schools.find_one({"school_code": generated_code}):
            count += 1
            generated_code = generate_school_code(school.get("district", "Kamrup"), count)

    update_doc = {
        "status": "approved",
        "school_code": generated_code,
        "rejection_reason": None,
        "approved_at": now,
        "approved_by": str(user_id),
        "updated_at": now
    }

    db.schools.update_one({"_id": oid}, {"$set": update_doc})
    db.users.update_one({"_id": school["user_id"]}, {"$set": {"status": "active", "is_verified": True, "updated_at": now}})

    db.notifications.insert_one({
        "recipient_role": "school",
        "recipient_id": school["user_id"],
        "title": "School Application Approved",
        "message": f"Congratulations! Your school application has been approved. Your unique School Code is {generated_code}.",
        "type": "approval",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(
        str(user_id), "admin", "SCHOOL_APPROVED", "schools", str(oid),
        {"school_name": school.get("school_name"), "school_code": generated_code, "udise": school.get("udise_school_id")}
    )

    return api_response(
        data={"status": "approved", "school_code": generated_code},
        message=f"School '{school.get('school_name')}' approved successfully with Code {generated_code}."
    )

@admin_bp.route("/schools/<school_id>/reject", methods=["POST"])
@role_required("admin")
def reject_school(school_id):
    user_id = get_jwt_identity()
    db = get_db()
    oid = parse_object_id(school_id)
    school = db.schools.find_one({"_id": oid})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    data = request.get_json() or {}
    rejection_reason = data.get("rejection_reason", "").strip()

    # Rejection reason is strictly mandatory per Milestone 1 specification
    if not rejection_reason:
        return api_error(
            "VALIDATION_ERROR",
            "A rejection reason is mandatory when rejecting a school application.",
            fields={"rejection_reason": "Rejection reason cannot be empty."},
            status_code=400
        )

    now = datetime.now(timezone.utc)
    update_doc = {
        "status": "rejected",
        "rejection_reason": rejection_reason,
        "rejected_at": now,
        "rejected_by": str(user_id),
        "updated_at": now
    }

    db.schools.update_one({"_id": oid}, {"$set": update_doc})
    db.users.update_one(
        {"_id": school["user_id"]},
        {"$set": {"status": "rejected", "rejection_reason": rejection_reason, "updated_at": now}}
    )

    db.notifications.insert_one({
        "recipient_role": "school",
        "recipient_id": school["user_id"],
        "title": "School Application Notice",
        "message": f"Your school registration application was not approved. Reason: {rejection_reason}",
        "type": "rejection",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(
        str(user_id), "admin", "SCHOOL_REJECTED", "schools", str(oid),
        {"school_name": school.get("school_name"), "rejection_reason": rejection_reason, "udise": school.get("udise_school_id")}
    )

    return api_response(
        data={"status": "rejected", "rejection_reason": rejection_reason},
        message=f"School '{school.get('school_name')}' application rejected."
    )

@admin_bp.route("/schools/<school_id>/status", methods=["PATCH"])
@role_required("admin")
def update_school_status(school_id):
    user_id = get_jwt_identity()
    db = get_db()
    oid = parse_object_id(school_id)
    school = db.schools.find_one({"_id": oid})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ["approved", "rejected", "suspended", "pending"]:
        return api_error("VALIDATION_ERROR", "Invalid status.", status_code=400)

    # If rejecting, validate mandatory rejection reason
    rejection_reason = data.get("rejection_reason", "").strip()
    if new_status == "rejected" and not rejection_reason:
        return api_error(
            "VALIDATION_ERROR",
            "A rejection reason is mandatory when rejecting a school application.",
            fields={"rejection_reason": "Rejection reason cannot be empty."},
            status_code=400
        )

    now = datetime.now(timezone.utc)
    update_doc = {"status": new_status, "updated_at": now}

    # If approving and school doesn't have a code, generate one
    generated_code = school.get("school_code")
    if new_status == "approved":
        if not generated_code:
            count = db.schools.count_documents({"status": "approved"}) + 1
            generated_code = generate_school_code(school.get("district", "Kamrup"), count)
            while db.schools.find_one({"school_code": generated_code}):
                count += 1
                generated_code = generate_school_code(school.get("district", "Kamrup"), count)
            update_doc["school_code"] = generated_code
        update_doc["rejection_reason"] = None
        update_doc["approved_at"] = now
        update_doc["approved_by"] = str(user_id)
    elif new_status == "rejected":
        update_doc["rejection_reason"] = rejection_reason
        update_doc["rejected_at"] = now
        update_doc["rejected_by"] = str(user_id)

    db.schools.update_one({"_id": oid}, {"$set": update_doc})
    user_status_map = {"approved": "active", "pending": "pending", "rejected": "rejected", "suspended": "suspended"}
    user_update = {"status": user_status_map.get(new_status, new_status), "updated_at": now}
    if new_status == "rejected":
        user_update["rejection_reason"] = rejection_reason
    db.users.update_one({"_id": school["user_id"]}, {"$set": user_update})

    # Notification for the school
    db.notifications.insert_one({
        "recipient_role": "school",
        "recipient_id": school["user_id"],
        "title": f"School Application {new_status.capitalize()}",
        "message": f"Your school application has been {new_status}." + (f" Reason: {rejection_reason}" if rejection_reason else "") + (f" Your unique School Code is {generated_code}." if generated_code else ""),
        "type": "approval" if new_status == "approved" else "notice",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(
        str(user_id), "admin", f"SCHOOL_{new_status.upper()}", "schools", str(oid),
        {"school_code": generated_code, "rejection_reason": rejection_reason}
    )

    return api_response(
        data={"status": new_status, "school_code": generated_code},
        message=f"School status updated to '{new_status}' successfully."
    )

@admin_bp.route("/schools/<school_id>/udise-status", methods=["PATCH"])
@role_required("admin")
def update_school_udise_status(school_id):
    user_id = get_jwt_identity()
    db = get_db()
    oid = parse_object_id(school_id)
    school = db.schools.find_one({"_id": oid})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    data = request.get_json() or {}
    new_status = data.get("udise_verification_status")
    allowed_statuses = ["verified", "rejected", "needs_review", "format_valid", "pending"]
    if new_status not in allowed_statuses:
        return api_error("VALIDATION_ERROR", f"Status must be one of: {allowed_statuses}", status_code=400)

    now = datetime.utcnow()
    update_doc = {
        "udise_verification_status": new_status,
        "udise_verified_at": now if new_status == "verified" else school.get("udise_verified_at"),
        "udise_verified_by": str(user_id) if new_status == "verified" else school.get("udise_verified_by"),
        "udise_verification_notes": data.get("notes", "").strip(),
        "updated_at": now
    }

    db.schools.update_one({"_id": oid}, {"$set": update_doc})

    log_audit_event(
        str(user_id), "admin", "UDISE_STATUS_UPDATED", "schools", str(oid),
        {"udise_school_id": school.get("udise_school_id"), "udise_verification_status": new_status}
    )

    return api_response(
        data={
            "school_id": str(oid),
            "udise_school_id": school.get("udise_school_id"),
            "udise_verification_status": new_status,
            "udise_verified_at": now.isoformat() if new_status == "verified" else None
        },
        message=f"UDISE verification status updated to '{new_status}' successfully."
    )

@admin_bp.route("/evaluators", methods=["GET"])
@role_required("admin")
def list_evaluators():
    db = get_db()
    status = request.args.get("status")
    query = {}
    if status and status != "all":
        query["status"] = status

    evaluators = list(db.evaluators.find(query).sort("created_at", -1))
    enriched = []
    for e in evaluators:
        e_doc = serialize_doc(e)
        e_doc["assigned_count"] = db.evaluation_assignments.count_documents({"evaluator_id": e["_id"]})
        e_doc["completed_count"] = db.evaluations.count_documents({"evaluator_id": e["_id"], "status": "submitted"})
        enriched.append(e_doc)

    return api_response(data=enriched)

@admin_bp.route("/evaluators/<evaluator_id>/status", methods=["PATCH"])
@role_required("admin")
def update_evaluator_status(evaluator_id):
    user_id = get_jwt_identity()
    db = get_db()
    oid = parse_object_id(evaluator_id)
    evaluator = db.evaluators.find_one({"_id": oid})
    if not evaluator:
        return api_error("NOT_FOUND", "Evaluator not found.", status_code=404)

    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ["approved", "rejected", "suspended", "pending"]:
        return api_error("VALIDATION_ERROR", "Invalid status.", status_code=400)

    now = datetime.utcnow()
    db.evaluators.update_one({"_id": oid}, {"$set": {"status": new_status, "updated_at": now}})
    db.users.update_one({"_id": evaluator["user_id"]}, {"$set": {"status": new_status, "updated_at": now}})

    log_audit_event(str(user_id), "admin", f"EVALUATOR_{new_status.upper()}", "evaluators", str(oid))

    return api_response(message=f"Evaluator status updated to '{new_status}'.")

@admin_bp.route("/assignments", methods=["POST"])
@role_required("admin")
def assign_project():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    project_id = parse_object_id(data.get("project_id"))
    evaluator_id = parse_object_id(data.get("evaluator_id"))

    if not project_id or not evaluator_id:
        return api_error("VALIDATION_ERROR", "project_id and evaluator_id are required.", status_code=400)

    project = db.projects.find_one({"_id": project_id})
    if not project:
        return api_error("NOT_FOUND", "Project not found.", status_code=404)

    evaluator = db.evaluators.find_one({"_id": evaluator_id, "status": "approved"})
    if not evaluator:
        return api_error("BAD_REQUEST", "Evaluator not found or not yet approved.", status_code=400)

    # Check for duplicate
    existing = db.evaluation_assignments.find_one({"project_id": project_id, "evaluator_id": evaluator_id})
    if existing:
        return api_error("DUPLICATE", "This project is already assigned to this evaluator.", status_code=409)

    now = datetime.utcnow()
    assign_doc = {
        "project_id": project_id,
        "evaluator_id": evaluator_id,
        "assigned_by": parse_object_id(user_id),
        "assigned_at": now,
        "deadline": data.get("deadline", "2026-12-20T23:59:59Z"),
        "status": "assigned"
    }
    res = db.evaluation_assignments.insert_one(assign_doc)

    # Notification to evaluator
    db.notifications.insert_one({
        "recipient_role": "evaluator",
        "recipient_id": evaluator["user_id"],
        "title": "New Project Assigned for Evaluation",
        "message": f"Project '{project.get('title')}' has been assigned to you.",
        "type": "assignment",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(str(user_id), "admin", "PROJECT_ASSIGNED", "evaluation_assignments", str(res.inserted_id))

    return api_response(message="Project successfully assigned to evaluator.", data={"assignment_id": str(res.inserted_id)})

@admin_bp.route("/stage", methods=["POST", "PATCH"])
@role_required("admin")
def update_competition_stage():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    new_stage = data.get("stage")

    stages = [
        "school_registration", "mentor_onboarding", "team_formation",
        "online_bootcamp", "mcq_assessment", "top_1000", "advanced_bootcamp",
        "coding_challenge", "shortlist_198", "zonal_hackathon",
        "finalist_preparation", "state_final"
    ]
    if new_stage not in stages:
        return api_error("VALIDATION_ERROR", f"Stage must be one of: {stages}", status_code=400)

    db.settings.update_one(
        {"key": "competition"},
        {"$set": {"current_stage": new_stage, "updated_at": datetime.utcnow()}},
        upsert=True
    )

    log_audit_event(str(user_id), "admin", "COMPETITION_STAGE_UPDATED", "settings", None, {"new_stage": new_stage})

    return api_response(message=f"Active competition stage updated to '{new_stage}'.")

@admin_bp.route("/leaderboard-visibility", methods=["PATCH"])
@role_required("admin")
def toggle_leaderboard_visibility():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    is_public = bool(data.get("is_public", True))

    db.settings.update_one(
        {"key": "competition"},
        {"$set": {"leaderboard_public": is_public, "updated_at": datetime.utcnow()}},
        upsert=True
    )

    log_audit_event(str(user_id), "admin", "LEADERBOARD_VISIBILITY_TOGGLED", "settings", None, {"is_public": is_public})

    return api_response(message=f"Leaderboard visibility set to {'PUBLIC' if is_public else 'HIDDEN'}.")

@admin_bp.route("/audit-logs", methods=["GET"])
@role_required("admin")
def get_audit_logs():
    db = get_db()
    logs = list(db.audit_logs.find().sort("timestamp", -1).limit(50))
    return api_response(data=serialize_doc(logs))

@admin_bp.route("/projects", methods=["GET"])
@role_required("admin")
def list_all_projects():
    db = get_db()
    projects = list(db.projects.find().sort("created_at", -1))
    enriched = []
    for p in projects:
        p_doc = serialize_doc(p)
        team = db.teams.find_one({"_id": p.get("team_id")})
        school = db.schools.find_one({"_id": p.get("school_id")})
        p_doc["team"] = serialize_doc(team) if team else None
        p_doc["school"] = serialize_doc(school) if school else None
        eval_count = db.evaluations.count_documents({"project_id": p["_id"], "status": "submitted"})
        p_doc["evaluation_count"] = eval_count
        enriched.append(p_doc)
    return api_response(data=enriched)

# =============================================================================
# MILESTONE 3: EVALUATION & JURY MANAGEMENT, REOPEN, RUBRICS & SHORTLISTING
# =============================================================================

@admin_bp.route("/evaluations", methods=["GET"])
@role_required("admin")
def list_all_evaluations():
    """
    Admin overview of all evaluations (Technical, Jury, State Jury) with filters.
    """
    db = get_db()
    eval_type = request.args.get("type") # 'TECHNICAL' | 'JURY' | 'STATE_JURY'
    status = request.args.get("status") # 'draft' | 'submitted' | 'locked'

    query = {}
    if eval_type and eval_type != "all":
        query["evaluation_type"] = eval_type
    if status and status != "all":
        query["status"] = status

    evals = list(db.evaluations.find(query).sort("updated_at", -1))
    enriched = []
    for ev in evals:
        item = serialize_doc(ev)
        team = db.teams.find_one({"_id": ev.get("team_id")}) if ev.get("team_id") else None
        project = db.projects.find_one({"_id": ev.get("project_id")}) if ev.get("project_id") else None
        item["team"] = serialize_doc(team) if team else None
        item["project"] = serialize_doc(project) if project else None
        enriched.append(item)

    return api_response(data=enriched)

@admin_bp.route("/evaluations/assignments", methods=["GET", "POST"])
@role_required("admin")
def manage_evaluation_assignments():
    user_id = get_jwt_identity()
    db = get_db()

    if request.method == "GET":
        assignments = list(db.evaluation_assignments.find().sort("assigned_at", -1))
        enriched = []
        for a in assignments:
            item = serialize_doc(a)
            team = db.teams.find_one({"_id": a.get("team_id")}) if a.get("team_id") else None
            project = db.projects.find_one({"_id": a.get("project_id")}) if a.get("project_id") else None
            evaluator = db.evaluators.find_one({"_id": a.get("evaluator_id")}) or db.users.find_one({"_id": a.get("evaluator_id")})
            item["team"] = serialize_doc(team) if team else None
            item["project"] = serialize_doc(project) if project else None
            item["evaluator_name"] = evaluator.get("full_name") or evaluator.get("name") if evaluator else "Expert"
            enriched.append(item)
        return api_response(data=enriched)

    # POST: Create assignment
    data = request.get_json() or {}
    assignment_type = data.get("assignment_type", "TECHNICAL").upper() # 'TECHNICAL' | 'JURY' | 'STATE_JURY'
    evaluator_id_str = data.get("evaluator_id")
    target_id_str = data.get("target_id") # project_id or team_id
    deadline = data.get("deadline", "2026-12-30T23:59:59Z")

    if not evaluator_id_str or not target_id_str:
        return api_error("VALIDATION_ERROR", "evaluator_id and target_id (project or team) are required.", status_code=400)

    eval_oid = parse_object_id(evaluator_id_str)
    target_oid = parse_object_id(target_id_str)
    now = datetime.now(timezone.utc)

    # Resolve team and project
    team = None
    project = None
    if assignment_type == "TECHNICAL":
        project = db.projects.find_one({"_id": target_oid})
        if project and project.get("team_id"):
            team = db.teams.find_one({"_id": project["team_id"]})
    else: # JURY or STATE_JURY
        team = db.teams.find_one({"_id": target_oid})
        if not team:
            project = db.projects.find_one({"_id": target_oid})
            if project and project.get("team_id"):
                team = db.teams.find_one({"_id": project["team_id"]})
        else:
            if team.get("project_id"):
                project = db.projects.find_one({"_id": team["project_id"]})

    assign_doc = {
        "assignment_type": assignment_type,
        "evaluator_id": eval_oid,
        "team_id": team["_id"] if team else None,
        "project_id": project["_id"] if project else None,
        "assigned_by": parse_object_id(user_id),
        "assigned_at": now,
        "deadline": deadline,
        "status": "assigned",
        "conflict_status": "no_conflict"
    }

    # Upsert or insert assignment
    res = db.evaluation_assignments.insert_one(assign_doc)
    assign_id = res.inserted_id

    # Dispatch notification to expert
    evaluator_user = db.users.find_one({"_id": eval_oid}) or db.evaluators.find_one({"_id": eval_oid})
    target_user_id = evaluator_user.get("user_id") if isinstance(evaluator_user, dict) else eval_oid

    db.notifications.insert_one({
        "recipient_role": assignment_type.lower(),
        "recipient_id": target_user_id,
        "title": f"New {assignment_type} Evaluation Assigned",
        "message": f"You have been assigned to evaluate '{team.get('team_name') if team else project.get('title') if project else 'Submission'}'.",
        "type": "assignment",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(str(user_id), "admin", "EVALUATION_ASSIGNED", "evaluation_assignments", str(assign_id), {
        "assignment_type": assignment_type, "evaluator_id": str(eval_oid)
    })

    return api_response(
        data={"assignment_id": str(assign_id)},
        message=f"{assignment_type} assignment successfully created.",
        status_code=201
    )

@admin_bp.route("/evaluations/<evaluation_id>/reopen", methods=["POST"])
@role_required("admin")
def reopen_evaluation(evaluation_id):
    """
    CRITICAL AUDIT REQUIREMENT:
    Admin reopens a submitted/locked evaluation.
    Reason is MANDATORY. Creates explicit audit log.
    """
    user_id = get_jwt_identity()
    db = get_db()
    eval_oid = parse_object_id(evaluation_id)

    eval_doc = db.evaluations.find_one({"_id": eval_oid})
    if not eval_doc:
        return api_error("NOT_FOUND", "Evaluation record not found.", status_code=404)

    data = request.get_json() or {}
    reason = data.get("reason", "").strip()

    if not reason:
        return api_error("VALIDATION_ERROR", "Mandatory reason required to reopen an evaluation.", status_code=400)

    now = datetime.now(timezone.utc)
    db.evaluations.update_one(
        {"_id": eval_oid},
        {"$set": {
            "status": "draft",
            "is_unlocked": True,
            "reopened_by": parse_object_id(user_id),
            "reopen_reason": reason,
            "reopened_at": now,
            "updated_at": now
        }}
    )

    # Also update assignment status to in_progress
    if eval_doc.get("assignment_id"):
        db.evaluation_assignments.update_one(
            {"_id": eval_doc["assignment_id"]},
            {"$set": {"status": "in_progress"}}
        )

    # Mandatory Audit Log
    log_audit_event(
        str(user_id), "admin", "EVALUATION_REOPENED", "evaluations", str(eval_oid),
        {"reason": reason, "previous_score": eval_doc.get("total_score"), "evaluation_type": eval_doc.get("evaluation_type")}
    )

    # Notify evaluator
    db.notifications.insert_one({
        "recipient_role": str(eval_doc.get("evaluation_type", "evaluator")).lower(),
        "recipient_id": eval_doc.get("evaluator_id"),
        "title": "Evaluation Reopened by Administrator",
        "message": f"Your evaluation for submission has been reopened for adjustments. Reason: {reason}",
        "type": "evaluation_reopened",
        "is_read": False,
        "created_at": now
    })

    return api_response(message="Evaluation successfully unlocked and reopened for edits.", data={"evaluation_id": str(eval_oid)})

@admin_bp.route("/evaluations/<evaluation_id>/lock", methods=["POST"])
@role_required("admin")
def lock_evaluation(evaluation_id):
    user_id = get_jwt_identity()
    db = get_db()
    eval_oid = parse_object_id(evaluation_id)

    eval_doc = db.evaluations.find_one({"_id": eval_oid})
    if not eval_doc:
        return api_error("NOT_FOUND", "Evaluation not found.", status_code=404)

    now = datetime.now(timezone.utc)
    db.evaluations.update_one(
        {"_id": eval_oid},
        {"$set": {
            "status": "submitted",
            "is_unlocked": False,
            "locked_at": now,
            "updated_at": now
        }}
    )

    log_audit_event(str(user_id), "admin", "EVALUATION_LOCKED", "evaluations", str(eval_oid))
    return api_response(message="Evaluation locked successfully.")

@admin_bp.route("/rubrics", methods=["GET", "POST"])
@role_required("admin")
def manage_rubrics():
    user_id = get_jwt_identity()
    db = get_db()

    if request.method == "GET":
        rubrics = list(db.rubrics.find().sort("rubric_type", 1))
        return api_response(data=serialize_doc(rubrics))

    data = request.get_json() or {}
    rubric_type = data.get("rubric_type", "TECHNICAL").upper()
    title = data.get("title", f"{rubric_type} Rubric")
    criteria = data.get("criteria", [])

    if not criteria:
        return api_error("VALIDATION_ERROR", "Criteria list is required.", status_code=400)

    total_max = sum(float(c.get("max", 10)) for c in criteria)
    now = datetime.now(timezone.utc)

    rubric_doc = {
        "rubric_type": rubric_type,
        "title": title,
        "total_max": total_max,
        "criteria": criteria,
        "is_active": True,
        "updated_at": now
    }

    db.rubrics.update_one(
        {"rubric_type": rubric_type},
        {"$set": rubric_doc, "$setOnInsert": {"created_at": now}},
        upsert=True
    )

    log_audit_event(str(user_id), "admin", "RUBRIC_CONFIGURED", "rubrics", rubric_type, {"criteria_count": len(criteria), "total_max": total_max})
    return api_response(message=f"{rubric_type} rubric saved and activated successfully.")

@admin_bp.route("/shortlists/generate", methods=["POST"])
@role_required("admin")
def generate_stage_shortlist():
    """
    REUSABLE SHORTLISTING & WEIGHTAGE ENGINE:
    Calculates composite scores based on configured stage weightage:
    - District Level Shortlisting (Step 05): ~70 teams per district based on MCQ Score (70%) + Technical/Quiz (30%)
    - Jury Round Shortlisting (Step 07B): Top 20 teams per district based on Coding (70%) + Jury (30%)
    - Final State Winners (Step 09): Top 30 teams across Assam.
    """
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    stage = data.get("stage", "district_shortlisting") # 'district_shortlisting' | 'jury_round' | 'state_winners'
    quota_per_district = int(data.get("quota_per_district", 70) if stage == "district_shortlisting" else 20)
    top_winners_count = int(data.get("top_winners_count", 30))

    now = datetime.now(timezone.utc)

    # 1. Fetch all active teams
    teams = list(db.teams.find({"status": "active"}))
    ranked_teams = []

    for team in teams:
        quiz_score = float(team.get("quiz_score", 0)) # out of 20 or scaled
        tech_score = float(team.get("evaluation_score", 0)) # out of 100
        jury_score = float(team.get("jury_score", 0)) # out of 100
        coding_score = float(team.get("coding_score", tech_score)) # out of 100

        # Apply configurable stage formula
        if stage == "district_shortlisting":
            # 70% MCQ + 30% Evaluation / Foundation
            mcq_scaled = (quiz_score / 20.0) * 100.0 if quiz_score <= 20 else quiz_score
            composite = round((mcq_scaled * 0.70) + (tech_score * 0.30), 2)
        elif stage == "jury_round":
            # 70% Coding Challenge + 30% Jury Evaluation
            composite = round((coding_score * 0.70) + (jury_score * 0.30), 2)
        else: # state_winners / grand finale
            state_jury_score = float(team.get("state_jury_score", jury_score))
            composite = round((coding_score * 0.40) + (jury_score * 0.30) + (state_jury_score * 0.30), 2)

        ranked_teams.append({
            "team_id": team["_id"],
            "team_name": team.get("team_name"),
            "district": team.get("district", "Kamrup"),
            "category": team.get("category", "IX-X"),
            "school_name": team.get("school_name"),
            "quiz_score": quiz_score,
            "evaluation_score": tech_score,
            "jury_score": jury_score,
            "composite_score": composite
        })

    # Group by district and sort
    from collections import defaultdict
    district_groups = defaultdict(list)
    for rt in ranked_teams:
        district_groups[rt["district"]].append(rt)

    shortlisted_team_ids = []
    shortlist_summary = {}

    if stage in ["district_shortlisting", "jury_round"]:
        for dist, dteams in district_groups.items():
            dteams.sort(key=lambda x: x["composite_score"], reverse=True)
            shortlisted_in_dist = dteams[:quota_per_district]
            for rank_idx, st in enumerate(shortlisted_in_dist, start=1):
                st["rank_in_district"] = rank_idx
                shortlisted_team_ids.append(st["team_id"])
            shortlist_summary[dist] = {
                "total_eligible": len(dteams),
                "shortlisted": len(shortlisted_in_dist),
                "top_score": shortlisted_in_dist[0]["composite_score"] if shortlisted_in_dist else 0
            }
    else: # state_winners
        ranked_teams.sort(key=lambda x: x["composite_score"], reverse=True)
        top_winners = ranked_teams[:top_winners_count]
        for rank_idx, st in enumerate(top_winners, start=1):
            st["state_rank"] = rank_idx
            shortlisted_team_ids.append(st["team_id"])
        shortlist_summary["state_wide"] = {
            "total_eligible": len(ranked_teams),
            "shortlisted": len(top_winners),
            "top_score": top_winners[0]["composite_score"] if top_winners else 0
        }

    # Save shortlist record in DB
    shortlist_record = {
        "stage": stage,
        "generated_by": parse_object_id(user_id),
        "generated_at": now,
        "is_published": False,
        "total_shortlisted": len(shortlisted_team_ids),
        "shortlisted_team_ids": shortlisted_team_ids,
        "summary": shortlist_summary
    }
    s_res = db.shortlists.insert_one(shortlist_record)

    log_audit_event(str(user_id), "admin", "SHORTLIST_GENERATED", "shortlists", str(s_res.inserted_id), {
        "stage": stage, "total_shortlisted": len(shortlisted_team_ids)
    })

    return api_response(
        data={
            "shortlist_id": str(s_res.inserted_id),
            "stage": stage,
            "total_shortlisted": len(shortlisted_team_ids),
            "summary": shortlist_summary
        },
        message=f"Shortlist generated for '{stage}' with {len(shortlisted_team_ids)} qualified squads."
    )

@admin_bp.route("/shortlists/publish", methods=["POST"])
@role_required("admin")
def publish_shortlist():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    shortlist_id = parse_object_id(data.get("shortlist_id"))

    shortlist = db.shortlists.find_one({"_id": shortlist_id})
    if not shortlist:
        return api_error("NOT_FOUND", "Shortlist record not found.", status_code=404)

    now = datetime.now(timezone.utc)
    stage = shortlist.get("stage", "district_shortlisting")
    next_stage_map = {
        "district_shortlisting": "advanced_learning",
        "jury_round": "hackathon",
        "state_winners": "state_finale"
    }
    next_stage = next_stage_map.get(stage, "state_finale")
    target_status = "winner" if stage == "state_winners" else "shortlisted"

    # Advance shortlisted squads
    team_ids = shortlist.get("shortlisted_team_ids", [])
    db.teams.update_many(
        {"_id": {"$in": team_ids}},
        {"$set": {
            "qualification_status": target_status,
            "competition_stage": next_stage,
            "updated_at": now
        }}
    )

    db.shortlists.update_one(
        {"_id": shortlist_id},
        {"$set": {"is_published": True, "published_at": now}}
    )

    # Broadcast notification to schools & districts
    db.notifications.insert_one({
        "recipient_role": "all",
        "recipient_id": None,
        "title": f"Official Results Published: {stage.replace('_', ' ').title()}",
        "message": f"The official qualified squads list for {stage.replace('_', ' ').title()} has been authorized and published.",
        "type": "shortlist_published",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(str(user_id), "admin", "SHORTLIST_PUBLISHED", "shortlists", str(shortlist_id), {
        "stage": stage, "teams_advanced": len(team_ids)
    })

    return api_response(message=f"Shortlist published successfully. {len(team_ids)} teams advanced to {next_stage}.")

@admin_bp.route("/winners/publish", methods=["POST"])
@role_required("admin")
def publish_state_winners():
    """
    Final Stage 9: Declares and locks the official 30 Winners across Assam.
    """
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    winner_team_ids = [parse_object_id(tid) for tid in data.get("winner_team_ids", [])]

    if not winner_team_ids:
        # Auto-pick top 30 finalists by composite / jury score
        top_teams = list(db.teams.find({
            "$or": [
                {"qualification_status": {"$in": ["finalist", "shortlisted"]}},
                {"competition_stage": {"$in": ["hackathon", "state_finale"]}}
            ]
        }).sort("evaluation_score", -1).limit(30))
        winner_team_ids = [t["_id"] for t in top_teams]

    now = datetime.now(timezone.utc)
    db.teams.update_many(
        {"_id": {"$in": winner_team_ids}},
        {"$set": {
            "qualification_status": "winner",
            "competition_stage": "state_finale",
            "is_winner_locked": True,
            "winner_declared_at": now
        }}
    )

    db.settings.update_one(
        {"key": "competition"},
        {"$set": {"winners_declared": True, "winners_locked": True, "updated_at": now}},
        upsert=True
    )

    log_audit_event(str(user_id), "admin", "WINNERS_PUBLISHED", "settings", "competition", {
        "total_winners": len(winner_team_ids), "is_locked": True
    })

    return api_response(
        data={"total_winners": len(winner_team_ids)},
        message=f"State Grand Finale: Official {len(winner_team_ids)} winners declared and locked successfully."
    )

