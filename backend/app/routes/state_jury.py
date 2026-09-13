from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, generate_evaluation_id
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

state_jury_bp = Blueprint("state_jury", __name__, url_prefix="/api/v1/state-jury")

DEFAULT_STATE_JURY_RUBRIC = {
    "rubric_type": "STATE_JURY",
    "title": "State Grand Finale Jury Rubric",
    "total_max": 100,
    "criteria": [
        {"key": "transformative_impact", "label": "Transformative State & Social Impact", "max": 25, "desc": "Potential to transform Assam agriculture, flood mitigation, tea industry, or public health."},
        {"key": "innovation_breakthrough", "label": "Breakthrough Innovation & IP Potential", "max": 25, "desc": "Original technological novelty, patentability, unique hardware/software architecture."},
        {"key": "execution_excellence", "label": "Prototype Maturity & Execution Rigor", "max": 20, "desc": "Functional robustness, real-world stress test performance, clean build."},
        {"key": "defense_articulation", "label": "Grand Jury Defense & Q&A Mastery", "max": 15, "desc": "Command over technology, handling rigorous technical cross-examination."},
        {"key": "state_scalability", "label": "Commercialization & State Deployment Road", "max": 15, "desc": "Viable deployment roadmap across all 35 Assam districts."}
    ]
}

@state_jury_bp.route("/me", methods=["GET"])
@role_required("state_jury")
def get_state_jury_profile():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    user = db.users.find_one({"_id": u_oid})
    if not user:
        return api_error("NOT_FOUND", "State Jury user not found.", status_code=404)

    # State jury reviews qualified finalists
    finalist_query = {
        "$or": [
            {"qualification_status": {"$in": ["finalist", "shortlisted", "winner"]}},
            {"competition_stage": {"$in": ["hackathon", "state_finale", "jury_round"]}}
        ]
    }
    total_finalists = db.teams.count_documents(finalist_query)
    completed_evals = db.evaluations.count_documents({
        "evaluator_id": u_oid,
        "evaluation_type": "STATE_JURY",
        "status": "submitted"
    })
    in_progress_evals = db.evaluations.count_documents({
        "evaluator_id": u_oid,
        "evaluation_type": "STATE_JURY",
        "status": "draft"
    })
    conflicts_count = db.evaluation_assignments.count_documents({
        "evaluator_id": u_oid,
        "conflict_status": "conflict_declared"
    })
    pending_evals = max(0, total_finalists - completed_evals - conflicts_count)

    data = {
        "id": str(user["_id"]),
        "user_id": user.get("user_id") or f"AFIP-STJ-{str(user['_id'])[-6:].upper()}",
        "name": user.get("name", "State Grand Jury"),
        "email": user.get("email"),
        "role": "state_jury",
        "panel": "State Grand Jury & Awards Council",
        "stats": {
            "finalists": total_finalists,
            "pending": pending_evals,
            "in_progress": in_progress_evals,
            "evaluated": completed_evals,
            "conflicts": conflicts_count
        }
    }
    return api_response(data=data)

@state_jury_bp.route("/rubric", methods=["GET"])
@role_required("state_jury", "admin")
def get_state_jury_rubric():
    db = get_db()
    rubric = db.rubrics.find_one({"rubric_type": "STATE_JURY", "is_active": True})
    if not rubric:
        rubric = DEFAULT_STATE_JURY_RUBRIC
    return api_response(data=serialize_doc(rubric))

@state_jury_bp.route("/finalists", methods=["GET"])
@role_required("state_jury")
def list_state_finalists():
    """
    STRICT RESTRICTION: State Jury MUST ONLY see State-Level Qualified Finalists.
    They must NOT see arbitrary non-finalist teams.
    """
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)

    # Strictly find qualified finalists
    finalist_query = {
        "$or": [
            {"qualification_status": {"$in": ["finalist", "shortlisted", "winner"]}},
            {"competition_stage": {"$in": ["hackathon", "state_finale", "jury_round"]}}
        ]
    }
    teams = list(db.teams.find(finalist_query).sort("evaluation_score", -1))
    enriched = []

    for team in teams:
        item = serialize_doc(team)
        project = db.projects.find_one({"_id": team.get("project_id")}) if team.get("project_id") else None
        school = db.schools.find_one({"_id": team.get("school_id")}) if team.get("school_id") else None

        item["project"] = serialize_doc(project) if project else None
        item["school"] = {
            "school_name": school.get("school_name") if school else team.get("school_name"),
            "district": school.get("district") if school else team.get("district"),
            "school_code": school.get("school_code") if school else ""
        }

        # Check existing state jury evaluation
        eval_doc = db.evaluations.find_one({
            "team_id": team["_id"],
            "evaluator_id": u_oid,
            "evaluation_type": "STATE_JURY"
        })
        item["state_evaluation"] = serialize_doc(eval_doc) if eval_doc else None

        # Check conflict status if any assignment exists
        assign_doc = db.evaluation_assignments.find_one({
            "team_id": team["_id"],
            "evaluator_id": u_oid
        })
        item["conflict_status"] = assign_doc.get("conflict_status") if assign_doc else "no_conflict"

        enriched.append(item)

    return api_response(data=enriched)

@state_jury_bp.route("/finalists/<team_id>/conflict", methods=["POST"])
@role_required("state_jury")
def declare_state_jury_conflict(team_id):
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    t_oid = parse_object_id(team_id)

    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Finalist team not found.", status_code=404)

    data = request.get_json() or {}
    decision = data.get("decision", "").strip().lower()
    reason = data.get("reason", "").strip()

    if decision not in ["no_conflict", "conflict_declared"]:
        return api_error("VALIDATION_ERROR", "Decision must be 'no_conflict' or 'conflict_declared'.", status_code=400)

    now = datetime.now(timezone.utc)
    # Upsert an assignment record for conflict tracking
    if decision == "conflict_declared":
        if not reason:
            return api_error("VALIDATION_ERROR", "Please specify reason for declaring conflict of interest.", status_code=400)

        db.evaluation_assignments.update_one(
            {"team_id": t_oid, "evaluator_id": u_oid},
            {"$set": {
                "team_id": t_oid,
                "project_id": team.get("project_id"),
                "evaluator_id": u_oid,
                "assignment_type": "STATE_JURY",
                "conflict_status": "conflict_declared",
                "conflict_reason": reason,
                "conflict_declared_at": now,
                "status": "conflict"
            }},
            upsert=True
        )

        user = db.users.find_one({"_id": u_oid})
        db.notifications.insert_one({
            "recipient_role": "admin",
            "recipient_id": None,
            "title": "State Jury Conflict Declared",
            "message": f"State Jury {user.get('name')} declared conflict for finalist team '{team.get('team_name')}'. Reason: {reason}",
            "type": "conflict_alert",
            "is_read": False,
            "created_at": now
        })

        log_audit_event(str(user_id), "state_jury", "STATE_JURY_CONFLICT_DECLARED", "teams", str(t_oid), {
            "team_name": team.get("team_name"), "reason": reason
        })

        return api_response(
            data={"conflict_status": "conflict_declared"},
            message="Conflict recorded. You will be excused from evaluating this finalist."
        )
    else:
        db.evaluation_assignments.update_one(
            {"team_id": t_oid, "evaluator_id": u_oid},
            {"$set": {
                "team_id": t_oid,
                "project_id": team.get("project_id"),
                "evaluator_id": u_oid,
                "assignment_type": "STATE_JURY",
                "conflict_status": "no_conflict",
                "conflict_confirmed_at": now
            }},
            upsert=True
        )
        log_audit_event(str(user_id), "state_jury", "CONFLICT_CHECK_CLEARED", "teams", str(t_oid))
        return api_response(
            data={"conflict_status": "no_conflict"},
            message="No conflict confirmed. You may evaluate this state finalist."
        )

@state_jury_bp.route("/finalists/<team_id>", methods=["GET"])
@role_required("state_jury")
def get_finalist_details(team_id):
    """
    STRICT IDOR & FINALIST RESTRICTION:
    Must verify team is a qualified finalist.
    """
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    t_oid = parse_object_id(team_id)

    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    is_finalist = (
        team.get("qualification_status") in ["finalist", "shortlisted", "winner"] or
        team.get("competition_stage") in ["hackathon", "state_finale", "jury_round"]
    )
    if not is_finalist:
        return api_error("FORBIDDEN", "Unauthorized: State Jury can only inspect qualified finalists.", status_code=403)

    # Check conflict
    assign = db.evaluation_assignments.find_one({"team_id": t_oid, "evaluator_id": u_oid})
    if assign and assign.get("conflict_status") == "conflict_declared":
        return api_error("FORBIDDEN", "Conflict of interest was declared for this finalist. Access blocked.", status_code=403)

    project = db.projects.find_one({"_id": team.get("project_id")}) if team.get("project_id") else None
    school = db.schools.find_one({"_id": team.get("school_id")}) if team.get("school_id") else None
    state_eval = db.evaluations.find_one({
        "team_id": t_oid,
        "evaluator_id": u_oid,
        "evaluation_type": "STATE_JURY"
    })

    # Redact sensitive student personal information
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
        "scores_overview": {
            "quiz_score": team.get("quiz_score", 0),
            "technical_score": team.get("evaluation_score", 0),
            "jury_score": team.get("jury_score", 0),
            "composite_score": team.get("composite_score", 0)
        },
        "state_evaluation": serialize_doc(state_eval)
    }
    return api_response(data=data)

@state_jury_bp.route("/evaluate", methods=["POST"])
@role_required("state_jury")
def submit_state_jury_evaluation():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = parse_object_id(user_id)
    user = db.users.find_one({"_id": u_oid})
    if not user:
        return api_error("NOT_FOUND", "State Jury user not found.", status_code=404)

    data = request.get_json() or {}
    team_id = parse_object_id(data.get("team_id"))
    is_draft = data.get("is_draft", False)

    team = db.teams.find_one({"_id": team_id})
    if not team:
        return api_error("NOT_FOUND", "Finalist team not found.", status_code=404)

    # Verify finalist status
    is_finalist = (
        team.get("qualification_status") in ["finalist", "shortlisted", "winner"] or
        team.get("competition_stage") in ["hackathon", "state_finale", "jury_round"]
    )
    if not is_finalist:
        return api_error("FORBIDDEN", "Cannot evaluate non-finalist squad.", status_code=403)

    # Check conflict
    assign = db.evaluation_assignments.find_one({"team_id": team_id, "evaluator_id": u_oid})
    if assign and assign.get("conflict_status") == "conflict_declared":
        return api_error("FORBIDDEN", "Cannot evaluate assignment with declared conflict of interest.", status_code=403)

    existing_eval = db.evaluations.find_one({
        "team_id": team_id,
        "evaluator_id": u_oid,
        "evaluation_type": "STATE_JURY"
    })
    if existing_eval and existing_eval.get("status") in ["submitted", "locked"] and not existing_eval.get("is_unlocked"):
        return api_error("LOCKED", "This State Jury evaluation is locked. Contact Admin to request reopening.", status_code=400)

    # Fetch active rubric
    rubric = db.rubrics.find_one({"rubric_type": "STATE_JURY", "is_active": True}) or DEFAULT_STATE_JURY_RUBRIC
    criteria = rubric.get("criteria", DEFAULT_STATE_JURY_RUBRIC["criteria"])

    scores = data.get("scores", {})
    validated_scores = {}
    total_score = 0.0

    for crit in criteria:
        ckey = crit["key"]
        cmax = float(crit.get("max", 20))
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
        "team_id": team_id,
        "project_id": team.get("project_id"),
        "evaluator_id": u_oid,
        "evaluator_name": user.get("name", "State Grand Jury"),
        "evaluation_type": "STATE_JURY",
        "scores": validated_scores,
        "total_score": total_score,
        "recommended_rank": int(data.get("recommended_rank", 0) or 0),
        "award_nomination": data.get("award_nomination", "General Winner"),
        "strengths": data.get("strengths", ""),
        "areas_for_improvement": data.get("areas_for_improvement", ""),
        "comments": data.get("comments", ""),
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

    # If submitted, update state jury score on team
    if not is_draft:
        db.teams.update_one({"_id": team_id}, {"$set": {"state_jury_score": total_score}})

    log_audit_event(
        str(user_id), "state_jury",
        "STATE_JURY_EVALUATION_DRAFT" if is_draft else "STATE_JURY_EVALUATION_SUBMITTED",
        "evaluations", str(eval_id), {"total_score": total_score, "is_locked": not is_draft}
    )

    return api_response(
        data={"evaluation_id": str(eval_id), "total_score": total_score, "status": "draft" if is_draft else "submitted"},
        message="State jury draft saved." if is_draft else "State grand jury evaluation submitted and locked successfully."
    )
