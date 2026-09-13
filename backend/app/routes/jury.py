from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, generate_evaluation_id
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

jury_bp = Blueprint("jury", __name__, url_prefix="/api/v1/jury")

DEFAULT_JURY_RUBRIC = {
    "rubric_type": "JURY",
    "title": "Zonal Jury Evaluation Rubric",
    "total_max": 100,
    "criteria": [
        {"key": "innovation_originality", "label": "Innovation & Originality", "max": 25, "desc": "Originality of concept, problem novelty, out-of-the-box thinking."},
        {"key": "regional_impact", "label": "Community & Regional Impact", "max": 20, "desc": "Significance of impact on Assam communities, ecology, or livelihoods."},
        {"key": "technical_feasibility", "label": "Technical Feasibility & Viability", "max": 20, "desc": "Practicality of prototype execution, durability in Assam field environments."},
        {"key": "presentation_pitch", "label": "Student Presentation & Demonstration", "max": 15, "desc": "Pitch clarity, demonstration quality, articulate Q&A defense."},
        {"key": "team_dynamics", "label": "Team Synergy & Inclusive Collaboration", "max": 10, "desc": "Evidence of genuine student teamwork, division of labor, shared leadership."},
        {"key": "scalability_market", "label": "Scalability & Deployment Potential", "max": 10, "desc": "Potential to deploy at district/state scale or commercialize."}
    ]
}

@jury_bp.route("/me", methods=["GET"])
@role_required("jury")
def get_jury_profile():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    user = db.users.find_one({"_id": u_oid})
    if not user:
        return api_error("NOT_FOUND", "Jury user not found.", status_code=404)

    # Jury assignments can be attached to user_id or jury document
    assigned_count = db.evaluation_assignments.count_documents({
        "evaluator_id": u_oid,
        "assignment_type": "JURY"
    })
    if assigned_count == 0:
        assigned_count = db.evaluation_assignments.count_documents({"evaluator_id": u_oid})

    completed_count = db.evaluations.count_documents({
        "evaluator_id": u_oid,
        "evaluation_type": "JURY",
        "status": "submitted"
    })
    in_progress_count = db.evaluations.count_documents({
        "evaluator_id": u_oid,
        "evaluation_type": "JURY",
        "status": "draft"
    })
    conflicts_count = db.evaluation_assignments.count_documents({
        "evaluator_id": u_oid,
        "conflict_status": "conflict_declared"
    })
    pending_count = max(0, assigned_count - completed_count - conflicts_count)

    data = {
        "id": str(user["_id"]),
        "user_id": user.get("user_id") or f"AFIP-JUR-{str(user['_id'])[-6:].upper()}",
        "name": user.get("name", "Jury Member"),
        "email": user.get("email"),
        "phone": user.get("phone", ""),
        "role": "jury",
        "district": user.get("district", "State-Level"),
        "stats": {
            "assigned": assigned_count,
            "pending": pending_count,
            "in_progress": in_progress_count,
            "completed": completed_count,
            "conflicts": conflicts_count
        }
    }
    return api_response(data=data)

@jury_bp.route("/rubric", methods=["GET"])
@role_required("jury", "admin")
def get_jury_rubric():
    db = get_db()
    rubric = db.rubrics.find_one({"rubric_type": "JURY", "is_active": True})
    if not rubric:
        rubric = DEFAULT_JURY_RUBRIC
    return api_response(data=serialize_doc(rubric))

@jury_bp.route("/assignments", methods=["GET"])
@role_required("jury")
def get_jury_assignments():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)

    # Strictly find assignments for this jury member
    assignments = list(db.evaluation_assignments.find({"evaluator_id": u_oid}).sort("assigned_at", -1))
    enriched = []

    for assign in assignments:
        item = serialize_doc(assign)
        project = None
        team = None
        school = None

        if assign.get("project_id"):
            project = db.projects.find_one({"_id": assign["project_id"]})
        if assign.get("team_id"):
            team = db.teams.find_one({"_id": assign["team_id"]})
        elif project and project.get("team_id"):
            team = db.teams.find_one({"_id": project["team_id"]})

        if team and team.get("school_id"):
            school = db.schools.find_one({"_id": team["school_id"]})

        item["project"] = serialize_doc(project) if project else None
        item["team"] = serialize_doc(team) if team else None
        item["school"] = serialize_doc(school) if school else None

        evaluation = db.evaluations.find_one({
            "assignment_id": assign["_id"],
            "evaluator_id": u_oid,
            "evaluation_type": "JURY"
        })
        item["evaluation"] = serialize_doc(evaluation) if evaluation else None
        enriched.append(item)

    return api_response(data=enriched)

@jury_bp.route("/assignments/<assignment_id>/conflict", methods=["POST"])
@role_required("jury")
def declare_jury_conflict(assignment_id):
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    assign_oid = parse_object_id(assignment_id)

    assignment = db.evaluation_assignments.find_one({
        "_id": assign_oid,
        "evaluator_id": u_oid
    })
    if not assignment:
        return api_error("FORBIDDEN", "Unauthorized assignment access.", status_code=403)

    data = request.get_json() or {}
    decision = data.get("decision", "").strip().lower()
    reason = data.get("reason", "").strip()

    if decision not in ["no_conflict", "conflict_declared"]:
        return api_error("VALIDATION_ERROR", "Decision must be 'no_conflict' or 'conflict_declared'.", status_code=400)

    now = datetime.now(timezone.utc)
    if decision == "conflict_declared":
        if not reason:
            return api_error("VALIDATION_ERROR", "Please specify your conflict of interest reason.", status_code=400)

        db.evaluation_assignments.update_one(
            {"_id": assign_oid},
            {"$set": {
                "conflict_status": "conflict_declared",
                "conflict_reason": reason,
                "conflict_declared_at": now,
                "status": "conflict"
            }}
        )

        user = db.users.find_one({"_id": u_oid})
        db.notifications.insert_one({
            "recipient_role": "admin",
            "recipient_id": None,
            "title": "Jury Conflict of Interest Declared",
            "message": f"Jury member {user.get('name')} declared conflict for assignment {assignment_id}. Reason: {reason}",
            "type": "conflict_alert",
            "is_read": False,
            "created_at": now
        })

        log_audit_event(str(user_id), "jury", "CONFLICT_DECLARED", "evaluation_assignments", str(assign_oid), {
            "reason": reason, "assignment_id": str(assign_oid)
        })

        return api_response(
            data={"conflict_status": "conflict_declared", "status": "conflict"},
            message="Conflict recorded. Assignment flagged for administrative reassignment."
        )
    else:
        db.evaluation_assignments.update_one(
            {"_id": assign_oid},
            {"$set": {
                "conflict_status": "no_conflict",
                "conflict_confirmed_at": now
            }}
        )
        log_audit_event(str(user_id), "jury", "CONFLICT_CHECK_CLEARED", "evaluation_assignments", str(assign_oid))
        return api_response(
            data={"conflict_status": "no_conflict"},
            message="No conflict confirmed. You may proceed with jury evaluation."
        )

@jury_bp.route("/teams/<team_id>", methods=["GET"])
@role_required("jury")
def get_assigned_team_details(team_id):
    """
    STRICT IDOR PROTECTION: Jury member can ONLY view teams assigned to them.
    """
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    t_oid = parse_object_id(team_id)

    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    # Check assignment
    assignment = db.evaluation_assignments.find_one({
        "$or": [
            {"team_id": t_oid, "evaluator_id": u_oid},
            {"project_id": team.get("project_id"), "evaluator_id": u_oid}
        ]
    })
    if not assignment:
        return api_error("FORBIDDEN", "Unauthorized: This team has not been assigned to you for jury review.", status_code=403)

    if assignment.get("conflict_status") == "conflict_declared":
        return api_error("FORBIDDEN", "Conflict of interest was declared on this assignment. Access blocked.", status_code=403)

    project = db.projects.find_one({"_id": team.get("project_id")}) if team.get("project_id") else None
    school = db.schools.find_one({"_id": team.get("school_id")}) if team.get("school_id") else None
    evaluation = db.evaluations.find_one({
        "assignment_id": assignment["_id"],
        "evaluator_id": u_oid,
        "evaluation_type": "JURY"
    })

    # Redact sensitive student personal information (emails, phones) for data privacy
    team_data = serialize_doc(team)
    if "members" in team_data and isinstance(team_data["members"], list):
        for m in team_data["members"]:
            m.pop("email", None)
            m.pop("phone", None)

    data = {
        "team": team_data,
        "project": serialize_doc(project),
        "school": {
            "school_name": school.get("school_name") if school else team.get("school_name"),
            "district": school.get("district") if school else team.get("district"),
            "school_code": school.get("school_code") if school else ""
        },
        "assignment": serialize_doc(assignment),
        "evaluation": serialize_doc(evaluation)
    }
    return api_response(data=data)

@jury_bp.route("/evaluate", methods=["POST"])
@role_required("jury")
def submit_jury_evaluation():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    user = db.users.find_one({"_id": u_oid})
    if not user:
        return api_error("NOT_FOUND", "Jury profile not found.", status_code=404)

    data = request.get_json() or {}
    assignment_id = parse_object_id(data.get("assignment_id"))
    team_id = parse_object_id(data.get("team_id"))
    is_draft = data.get("is_draft", False)

    # Verify assignment
    assignment = db.evaluation_assignments.find_one({
        "_id": assignment_id,
        "evaluator_id": u_oid
    })
    if not assignment:
        return api_error("FORBIDDEN", "Unauthorized assignment.", status_code=403)

    if assignment.get("conflict_status") == "conflict_declared":
        return api_error("FORBIDDEN", "Cannot evaluate assignment with declared conflict of interest.", status_code=403)

    existing_eval = db.evaluations.find_one({
        "assignment_id": assignment_id,
        "evaluator_id": u_oid,
        "evaluation_type": "JURY"
    })
    if existing_eval and existing_eval.get("status") in ["submitted", "locked"] and not existing_eval.get("is_unlocked"):
        return api_error("LOCKED", "This jury evaluation has been finalized and locked. Contact Admin to request reopening.", status_code=400)

    # Fetch active rubric
    rubric = db.rubrics.find_one({"rubric_type": "JURY", "is_active": True}) or DEFAULT_JURY_RUBRIC
    criteria = rubric.get("criteria", DEFAULT_JURY_RUBRIC["criteria"])

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

    # Remarks visibility handling (PRIVATE vs RELEASED)
    remarks_visibility = data.get("remarks_visibility", "RELEASED")
    if remarks_visibility not in ["PRIVATE", "RELEASED"]:
        remarks_visibility = "RELEASED"

    eval_doc = {
        "evaluation_custom_id": existing_eval.get("evaluation_custom_id", eval_custom_id) if existing_eval else eval_custom_id,
        "assignment_id": assignment["_id"],
        "team_id": team_id or assignment.get("team_id"),
        "project_id": assignment.get("project_id"),
        "evaluator_id": u_oid,
        "evaluator_name": user.get("name", "Jury Member"),
        "evaluation_type": "JURY",
        "scores": validated_scores,
        "total_score": total_score,
        "strengths": data.get("strengths", ""),
        "areas_for_improvement": data.get("areas_for_improvement", ""),
        "comments": data.get("comments", ""),
        "recommendation": data.get("recommendation", "Recommended"),
        "remarks_visibility": remarks_visibility,
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

    # If submitted, update team's jury score & project jury remarks if released
    if not is_draft:
        target_t_id = team_id or assignment.get("team_id")
        if target_t_id:
            db.teams.update_one({"_id": target_t_id}, {"$set": {"jury_score": total_score}})

        # Record jury remark in project if project exists
        if assignment.get("project_id"):
            db.projects.update_one(
                {"_id": assignment["project_id"]},
                {"$push": {
                    "jury_remarks": {
                        "remark_id": str(eval_id),
                        "jury_name": user.get("name"),
                        "remark": data.get("comments", ""),
                        "recommendation": data.get("recommendation", "Recommended"),
                        "visibility": remarks_visibility,
                        "submitted_at": now
                    }
                }}
            )

    log_audit_event(
        str(user_id), "jury",
        "JURY_EVALUATION_DRAFT" if is_draft else "JURY_EVALUATION_SUBMITTED",
        "evaluations", str(eval_id), {"total_score": total_score, "is_locked": not is_draft}
    )

    return api_response(
        data={"evaluation_id": str(eval_id), "total_score": total_score, "status": "draft" if is_draft else "submitted"},
        message="Jury review draft saved." if is_draft else "Jury evaluation submitted and locked successfully."
    )
