from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

mentors_bp = Blueprint("mentors", __name__, url_prefix="/api/v1/mentors")

@mentors_bp.route("/me", methods=["GET"])
@role_required("mentor")
def get_mentor_profile():
    user_id = get_jwt_identity()
    db = get_db()
    mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor profile not found.", status_code=404)

    school = db.schools.find_one({"_id": mentor.get("school_id")})
    assigned_teams = list(db.teams.find({"mentor_id": mentor["_id"]}))
    team_ids = [t["_id"] for t in assigned_teams]
    students_count = db.students.count_documents({"team_id": {"$in": team_ids}})
    projects_count = db.projects.count_documents({"team_id": {"$in": team_ids}})
    feedback_count = db.mentor_feedback.count_documents({"mentor_id": mentor["_id"]})

    data = serialize_doc(mentor)
    data["school"] = serialize_doc(school) if school else None
    data["stats"] = {
        "assigned_teams_count": len(assigned_teams),
        "total_students_mentored": students_count,
        "submitted_projects_count": projects_count,
        "feedback_given_count": feedback_count
    }
    return api_response(data=data)

@mentors_bp.route("/assigned-teams", methods=["GET"])
@role_required("mentor")
def get_assigned_teams():
    user_id = get_jwt_identity()
    db = get_db()
    mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor profile not found.", status_code=404)

    teams = list(db.teams.find({"mentor_id": mentor["_id"]}).sort("created_at", -1))
    enriched = []
    for team in teams:
        team_doc = serialize_doc(team)
        members = list(db.students.find({"team_id": team["_id"]}))
        team_doc["members"] = serialize_doc(members)
        project = db.projects.find_one({"team_id": team["_id"]})
        team_doc["project"] = serialize_doc(project) if project else None
        feedback_list = list(db.mentor_feedback.find({"team_id": team["_id"]}).sort("created_at", -1))
        team_doc["feedback_count"] = len(feedback_list)
        team_doc["latest_feedback"] = serialize_doc(feedback_list[0]) if feedback_list else None
        enriched.append(team_doc)

    return api_response(data=enriched)

@mentors_bp.route("/teams/<team_id>", methods=["GET"])
@role_required("mentor")
def get_mentor_team_details(team_id):
    user_id = get_jwt_identity()
    db = get_db()
    mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor profile not found.", status_code=404)

    t_oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    # Strict Mentor IDOR Check: Mentor can only view assigned teams
    if str(team.get("mentor_id")) != str(mentor["_id"]):
        return api_error("FORBIDDEN", "You are not authorized to access this team. It is not assigned to your mentor account.", status_code=403)

    members = list(db.students.find({"team_id": team["_id"]}))
    project = db.projects.find_one({"team_id": team["_id"]})
    school = db.schools.find_one({"_id": team.get("school_id")})
    feedback_history = list(db.mentor_feedback.find({"team_id": team["_id"]}).sort("created_at", -1))

    payload = serialize_doc(team)
    payload["members"] = serialize_doc(members)
    payload["project"] = serialize_doc(project) if project else None
    payload["school"] = serialize_doc(school) if school else None
    payload["feedback_history"] = serialize_doc(feedback_history)

    return api_response(data=payload)

@mentors_bp.route("/teams/<team_id>/feedback", methods=["POST"])
@role_required("mentor")
def submit_mentor_feedback(team_id):
    user_id = get_jwt_identity()
    db = get_db()
    mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor profile not found.", status_code=404)

    t_oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    # Strict IDOR Check
    if str(team.get("mentor_id")) != str(mentor["_id"]):
        return api_error("FORBIDDEN", "You are not authorized to submit feedback for this unassigned team.", status_code=403)

    data = request.get_json() or {}
    comments = data.get("comments", "").strip()
    areas_of_guidance = data.get("areas_of_guidance", "").strip()
    milestone_rating = data.get("milestone_rating", 5)

    if not comments:
        return api_error("VALIDATION_ERROR", "Feedback comments are required.", status_code=400)

    now = datetime.now(timezone.utc)
    feedback_doc = {
        "mentor_id": mentor["_id"],
        "mentor_name": mentor.get("full_name", ""),
        "team_id": team["_id"],
        "team_name": team.get("team_name", ""),
        "school_id": team.get("school_id"),
        "comments": comments,
        "areas_of_guidance": areas_of_guidance,
        "milestone_rating": int(milestone_rating),
        "created_at": now
    }
    res = db.mentor_feedback.insert_one(feedback_doc)

    # In-app notification for team leader
    leader = db.students.find_one({"team_id": team["_id"], "is_leader": True})
    if leader and leader.get("user_id"):
        db.notifications.insert_one({
            "recipient_role": "student",
            "recipient_id": leader["user_id"],
            "title": "New Mentor Guidance Received",
            "message": f"Mentor {mentor.get('full_name')} has provided new feedback for your team.",
            "type": "mentor_feedback",
            "is_read": False,
            "created_at": now
        })

    log_audit_event(
        str(user_id), "mentor", "MENTOR_FEEDBACK_SUBMITTED", "mentor_feedback", str(res.inserted_id),
        {"team_id": str(team["_id"]), "rating": milestone_rating}
    )

    return api_response(
        data={"feedback_id": str(res.inserted_id)},
        message="Mentor feedback submitted successfully."
    )

@mentors_bp.route("/teams/<team_id>/feedback", methods=["GET"])
@role_required("mentor")
def get_team_feedback(team_id):
    user_id = get_jwt_identity()
    db = get_db()
    mentor = db.mentors.find_one({"user_id": parse_object_id(user_id)})
    if not mentor:
        return api_error("NOT_FOUND", "Mentor profile not found.", status_code=404)

    t_oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": t_oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    if str(team.get("mentor_id")) != str(mentor["_id"]):
        return api_error("FORBIDDEN", "Unauthorized access.", status_code=403)

    feedback_list = list(db.mentor_feedback.find({"team_id": team["_id"]}).sort("created_at", -1))
    return api_response(data=serialize_doc(feedback_list))
