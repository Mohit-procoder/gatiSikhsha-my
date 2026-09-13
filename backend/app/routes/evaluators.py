from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, hash_password, generate_evaluation_id
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

evaluators_bp = Blueprint("evaluators", __name__, url_prefix="/api/v1/evaluators")

DEFAULT_TECHNICAL_RUBRIC = {
    "rubric_type": "TECHNICAL",
    "title": "Technical Innovation & Feasibility Rubric",
    "total_max": 100,
    "criteria": [
        {"key": "innovation", "label": "Innovation & Originality", "max": 20, "desc": "Novelty of approach, uniqueness vs standard hobby kits."},
        {"key": "problem_understanding", "label": "Problem Understanding & Context", "max": 15, "desc": "Clarity of the specific Assam problem and beneficiary empathy."},
        {"key": "technical_implementation", "label": "Technical Implementation", "max": 20, "desc": "Hardware craft, software robustness, sensor integration."},
        {"key": "feasibility", "label": "Feasibility & Workability", "max": 15, "desc": "Viability under real Assam field conditions (flooding, power outages)."},
        {"key": "social_impact", "label": "Social & Regional Impact", "max": 15, "desc": "Potential to protect lives, boost livelihoods or environment."},
        {"key": "scalability", "label": "Scalability & Replication", "max": 10, "desc": "Ease of expanding across other Assam blocks and districts."},
        {"key": "presentation", "label": "Presentation & Documentation", "max": 5, "desc": "Clarity of explanation, structure of demo & materials."}
    ]
}

@evaluators_bp.route("/register", methods=["POST"])
def register_evaluator():
    data = request.get_json() or {}
    required = ["full_name", "email", "phone", "organization", "designation", "domain_expertise", "password", "confirm_password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return api_error("VALIDATION_ERROR", f"Missing fields: {', '.join(missing)}", status_code=400)

    if data.get("password") != data.get("confirm_password"):
        return api_error("VALIDATION_ERROR", "Passwords do not match.", status_code=400)

    email = data.get("email", "").strip().lower()
    db = get_db()
    if db.users.find_one({"email": email}):
        return api_error("DUPLICATE_EMAIL", "An account with this email already exists.", status_code=409)

    now = datetime.now(timezone.utc)
    user_res = db.users.insert_one({
        "email": email,
        "password_hash": hash_password(data["password"]),
        "role": "evaluator",
        "name": data["full_name"],
        "status": "pending",
        "created_at": now,
        "updated_at": now
    })
    user_id = user_res.inserted_id

    eval_doc = {
        "user_id": user_id,
        "full_name": data["full_name"],
        "email": email,
        "phone": data.get("phone", ""),
        "organization": data.get("organization", ""),
        "designation": data.get("designation", ""),
        "domain_expertise": data.get("domain_expertise", ""),
        "years_experience": int(data.get("years_experience", 0) or 0),
        "bio": data.get("bio", ""),
        "status": "pending",
        "created_at": now,
        "updated_at": now
    }
    db.evaluators.insert_one(eval_doc)

    db.notifications.insert_one({
        "recipient_role": "admin",
        "recipient_id": None,
        "title": "New Evaluator Registration",
        "message": f"Expert '{data['full_name']}' ({data.get('organization')}) applied for evaluation panel.",
        "type": "registration",
        "is_read": False,
        "created_at": now
    })

    log_audit_event(str(user_id), "evaluator", "EVALUATOR_REGISTERED", "evaluators", str(user_id))

    return api_response(
        message="Your registration has been submitted for administrative approval.",
        data={"status": "pending"},
        status_code=201
    )

@evaluators_bp.route("/me", methods=["GET"])
@role_required("evaluator")
def get_evaluator_profile():
    user_id = get_jwt_identity()
    db = get_db()
    evaluator = db.evaluators.find_one({"user_id": parse_object_id(user_id)})
    if not evaluator:
        return api_error("NOT_FOUND", "Evaluator profile not found.", status_code=404)

    total_assigned = db.evaluation_assignments.count_documents({"evaluator_id": evaluator["_id"]})
    completed = db.evaluations.count_documents({"evaluator_id": evaluator["_id"], "status": "submitted"})
    in_progress = db.evaluations.count_documents({"evaluator_id": evaluator["_id"], "status": "draft"})
    conflicts = db.evaluation_assignments.count_documents({"evaluator_id": evaluator["_id"], "conflict_status": "conflict_declared"})
    pending = max(0, total_assigned - completed - conflicts)

    data = serialize_doc(evaluator)
    data["stats"] = {
        "assigned": total_assigned,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "conflicts": conflicts
    }
    return api_response(data=data)

@evaluators_bp.route("/rubric", methods=["GET"])
@role_required("evaluator")
def get_technical_rubric():
    db = get_db()
    rubric = db.rubrics.find_one({"rubric_type": "TECHNICAL", "is_active": True})
    if not rubric:
        rubric = DEFAULT_TECHNICAL_RUBRIC
    return api_response(data=serialize_doc(rubric))

@evaluators_bp.route("/assignments", methods=["GET"])
@role_required("evaluator")
def get_evaluator_assignments():
    user_id = get_jwt_identity()
    db = get_db()
    evaluator = db.evaluators.find_one({"user_id": parse_object_id(user_id)})
    if not evaluator:
        return api_error("NOT_FOUND", "Evaluator profile not found.", status_code=404)

    # Strictly find assignments for this evaluator only
    assignments = list(db.evaluation_assignments.find({"evaluator_id": evaluator["_id"]}).sort("assigned_at", -1))
    enriched = []
    for assign in assignments:
        item = serialize_doc(assign)
        project = db.projects.find_one({"_id": assign["project_id"]})
        if project:
            item["project"] = serialize_doc(project)
            team = db.teams.find_one({"_id": project.get("team_id")})
            item["team"] = serialize_doc(team) if team else None
            school = db.schools.find_one({"_id": project.get("school_id")})
            item["school"] = serialize_doc(school) if school else None

        # Check if evaluation already recorded
        evaluation = db.evaluations.find_one({
            "assignment_id": assign["_id"],
            "evaluator_id": evaluator["_id"]
        })
        item["evaluation"] = serialize_doc(evaluation) if evaluation else None
        enriched.append(item)

    return api_response(data=enriched)

@evaluators_bp.route("/assignments/<assignment_id>/conflict", methods=["POST"])
@role_required("evaluator")
def declare_conflict_of_interest(assignment_id):
    """
    Conflict of Interest Gate:
    Evaluator confirms 'no_conflict' OR declares 'conflict_declared'.
    If conflict is declared, evaluation is blocked, Admin is alerted, and audit logged.
    """
    user_id = get_jwt_identity()
    db = get_db()
    evaluator = db.evaluators.find_one({"user_id": parse_object_id(user_id)})
    if not evaluator:
        return api_error("NOT_FOUND", "Evaluator not found.", status_code=404)

    assign_oid = parse_object_id(assignment_id)
    assignment = db.evaluation_assignments.find_one({
        "_id": assign_oid,
        "evaluator_id": evaluator["_id"]
    })
    if not assignment:
        return api_error("FORBIDDEN", "Unauthorized assignment access.", status_code=403)

    data = request.get_json() or {}
    decision = data.get("decision", "").strip().lower() # 'no_conflict' | 'conflict_declared'
    reason = data.get("reason", "").strip()

    if decision not in ["no_conflict", "conflict_declared"]:
        return api_error("VALIDATION_ERROR", "Decision must be 'no_conflict' or 'conflict_declared'.", status_code=400)

    now = datetime.now(timezone.utc)
    if decision == "conflict_declared":
        if not reason:
            return api_error("VALIDATION_ERROR", "Please provide a reason for declaring conflict of interest.", status_code=400)

        db.evaluation_assignments.update_one(
            {"_id": assign_oid},
            {"$set": {
                "conflict_status": "conflict_declared",
                "conflict_reason": reason,
                "conflict_declared_at": now,
                "status": "conflict"
            }}
        )

        # Notify admin of conflict
        db.notifications.insert_one({
            "recipient_role": "admin",
            "recipient_id": None,
            "title": "Conflict of Interest Declared",
            "message": f"Evaluator {evaluator.get('full_name')} declared conflict for project {assignment.get('project_id')}. Reason: {reason}",
            "type": "conflict_alert",
            "is_read": False,
            "created_at": now
        })

        log_audit_event(str(user_id), "evaluator", "CONFLICT_DECLARED", "evaluation_assignments", str(assign_oid), {
            "reason": reason, "project_id": str(assignment.get("project_id"))
        })

        return api_response(
            data={"conflict_status": "conflict_declared", "status": "conflict"},
            message="Conflict of interest recorded. The assignment has been flagged for administrative reassignment."
        )
    else:
        db.evaluation_assignments.update_one(
            {"_id": assign_oid},
            {"$set": {
                "conflict_status": "no_conflict",
                "conflict_confirmed_at": now
            }}
        )
        log_audit_event(str(user_id), "evaluator", "CONFLICT_CHECK_CLEARED", "evaluation_assignments", str(assign_oid))
        return api_response(
            data={"conflict_status": "no_conflict"},
            message="No conflict confirmed. You may now evaluate this project."
        )

@evaluators_bp.route("/projects/<project_id>", methods=["GET"])
@role_required("evaluator")
def get_assigned_project(project_id):
    """
    STRICT AUTHORIZATION: Evaluator CANNOT browse arbitrary projects.
    Must verify an assignment exists for this evaluator and project.
    """
    user_id = get_jwt_identity()
    db = get_db()
    evaluator = db.evaluators.find_one({"user_id": parse_object_id(user_id)})
    if not evaluator:
        return api_error("NOT_FOUND", "Evaluator not found.", status_code=404)

    proj_oid = parse_object_id(project_id)
    assignment = db.evaluation_assignments.find_one({
        "project_id": proj_oid,
        "evaluator_id": evaluator["_id"]
    })
    if not assignment:
        return api_error("FORBIDDEN", "Unauthorized: This project has not been assigned to you for evaluation.", status_code=403)

    if assignment.get("conflict_status") == "conflict_declared":
        return api_error("FORBIDDEN", "Conflict of interest was declared on this assignment. Access is blocked.", status_code=403)

    project = db.projects.find_one({"_id": proj_oid})
    if not project:
        return api_error("NOT_FOUND", "Project not found.", status_code=404)

    team = db.teams.find_one({"_id": project.get("team_id")})
    school = db.schools.find_one({"_id": project.get("school_id")})
    evaluation = db.evaluations.find_one({"assignment_id": assignment["_id"]})

    data = serialize_doc(project)
    data["team"] = serialize_doc(team)
    data["school"] = serialize_doc(school)
    data["assignment"] = serialize_doc(assignment)
    data["evaluation"] = serialize_doc(evaluation) if evaluation else None

    return api_response(data=data)

@evaluators_bp.route("/evaluate", methods=["POST"])
@role_required("evaluator")
def submit_evaluation():
    user_id = get_jwt_identity()
    db = get_db()
    evaluator = db.evaluators.find_one({"user_id": parse_object_id(user_id)})
    if not evaluator:
        return api_error("NOT_FOUND", "Evaluator not found.", status_code=404)

    data = request.get_json() or {}
    project_id = parse_object_id(data.get("project_id"))
    assignment_id = parse_object_id(data.get("assignment_id"))
    is_draft = data.get("is_draft", False)

    # Verify authorization
    assignment = db.evaluation_assignments.find_one({
        "project_id": project_id,
        "evaluator_id": evaluator["_id"]
    })
    if not assignment:
        return api_error("FORBIDDEN", "Unauthorized: You are not assigned to evaluate this submission.", status_code=403)

    if assignment.get("conflict_status") == "conflict_declared":
        return api_error("FORBIDDEN", "Cannot evaluate project with declared Conflict of Interest.", status_code=403)

    existing_eval = db.evaluations.find_one({"assignment_id": assignment["_id"]})
    if existing_eval and existing_eval.get("status") in ["submitted", "locked"] and not existing_eval.get("is_unlocked"):
        return api_error("LOCKED", "This evaluation has been finalized and locked. Contact Admin to request reopening.", status_code=400)

    # Fetch active rubric
    rubric = db.rubrics.find_one({"rubric_type": "TECHNICAL", "is_active": True}) or DEFAULT_TECHNICAL_RUBRIC
    criteria = rubric.get("criteria", DEFAULT_TECHNICAL_RUBRIC["criteria"])

    scores = data.get("scores", {})
    validated_scores = {}
    total_score = 0.0

    for crit in criteria:
        ckey = crit["key"]
        cmax = float(crit.get("max", 10))
        val = max(0.0, min(cmax, float(scores.get(ckey, 0))))
        validated_scores[ckey] = val
        total_score += val

    total_score = round(total_score, 2)
    validated_scores["total"] = total_score

    now = datetime.now(timezone.utc)
    eval_count = db.evaluations.count_documents({}) + 1
    eval_custom_id = generate_evaluation_id(eval_count)

    eval_doc = {
        "evaluation_custom_id": existing_eval.get("evaluation_custom_id", eval_custom_id) if existing_eval else eval_custom_id,
        "assignment_id": assignment["_id"],
        "project_id": project_id,
        "team_id": assignment.get("team_id") or db.projects.find_one({"_id": project_id}, {"team_id": 1}).get("team_id"),
        "evaluator_id": evaluator["_id"],
        "evaluator_name": evaluator.get("full_name"),
        "evaluation_type": "TECHNICAL",
        "scores": validated_scores,
        "total_score": total_score,
        "strengths": data.get("strengths", ""),
        "areas_for_improvement": data.get("areas_for_improvement", ""),
        "comments": data.get("comments", ""),
        "recommendation": data.get("recommendation", "Recommended"),
        "status": "draft" if is_draft else "submitted",
        "is_unlocked": False,
        "submitted_at": None if is_draft else now,
        "locked_at": None if is_draft else now,
        "updated_at": now
    }

    if existing_eval:
        db.evaluations.update_one({"_id": existing_eval["_id"]}, {"$set": eval_doc})
        eval_id = existing_eval["_id"]
    else:
        eval_doc["created_at"] = now
        res = db.evaluations.insert_one(eval_doc)
        eval_id = res.inserted_id

    # Update assignment status
    db.evaluation_assignments.update_one(
        {"_id": assignment["_id"]},
        {"$set": {"status": "in_progress" if is_draft else "completed", "evaluated_at": now}}
    )

    # If submitted, update project and team score
    if not is_draft:
        project = db.projects.find_one({"_id": project_id})
        if project and project.get("team_id"):
            db.teams.update_one({"_id": project["team_id"]}, {"$set": {"evaluation_score": total_score}})

    log_audit_event(
        str(user_id), "evaluator",
        "EVALUATION_DRAFT_SAVED" if is_draft else "EVALUATION_SUBMITTED",
        "evaluations", str(eval_id), {"total_score": total_score, "is_locked": not is_draft}
    )

    return api_response(
        data={"evaluation_id": str(eval_id), "total_score": total_score, "status": "draft" if is_draft else "submitted"},
        message="Evaluation draft saved." if is_draft else "Evaluation submitted and locked successfully."
    )

