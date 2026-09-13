from datetime import datetime, timezone
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, generate_project_id
from app.middleware.auth_middleware import role_required
from app.utils.audit import log_audit_event

projects_bp = Blueprint("projects", __name__, url_prefix="/api/v1/projects")

@projects_bp.route("", methods=["POST"])
@role_required("student", "school")
def submit_project():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    db = get_db()

    team = None
    if role == "student":
        student = db.students.find_one({"user_id": parse_object_id(user_id)})
        if not student or not student.get("team_id"):
            return api_error("NOT_FOUND", "Student is not enrolled in an active team.", status_code=400)
        team = db.teams.find_one({"_id": student["team_id"]})
    elif role == "school":
        school = db.schools.find_one({"user_id": parse_object_id(user_id)})
        if not school:
            return api_error("NOT_FOUND", "School record not found.", status_code=404)
        team_id_str = request.get_json().get("team_id")
        if not team_id_str:
            return api_error("VALIDATION_ERROR", "team_id is required when creating project as school.", status_code=400)
        team = db.teams.find_one({"_id": parse_object_id(team_id_str), "school_id": school["_id"]})

    if not team:
        return api_error("NOT_FOUND", "Associated team not found.", status_code=404)

    team_id = team["_id"]
    school_id = team["school_id"]
    district = team.get("district", "Kamrup")
    category = team.get("category", "VI-VIII")

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    problem_statement = data.get("problem_statement", "").strip()
    proposed_solution = data.get("proposed_solution", "").strip()

    if not title or not problem_statement or not proposed_solution:
        return api_error("VALIDATION_ERROR", "Project title, problem statement, and proposed solution are required.", status_code=400)

    now = datetime.now(timezone.utc)
    existing_project = db.projects.find_one({"team_id": team_id})

    project_data = {
        "title": title,
        "team_id": team_id,
        "school_id": school_id,
        "district": district,
        "category": category,
        "theme": data.get("theme", "Smart Agriculture"),
        "problem_statement": problem_statement,
        "problem_context": data.get("problem_context", ""),
        "proposed_solution": proposed_solution,
        "innovation_novelty": data.get("innovation_novelty", ""),
        "target_beneficiaries": data.get("target_beneficiaries", ""),
        "technology_used": data.get("technology_used", ""),
        "expected_impact": data.get("expected_impact", ""),
        "implementation_plan": data.get("implementation_plan", ""),
        "prototype_status": data.get("prototype_status", "Working Prototype"),
        "repo_link": data.get("repo_link", ""),
        "demo_link": data.get("demo_link", ""),
        "video_link": data.get("video_link", ""),
        "presentation_link": data.get("presentation_link", ""),
        "status": data.get("status", "submitted"),
        "is_showcased": False,
        "updated_at": now
    }

    if existing_project:
        db.projects.update_one({"_id": existing_project["_id"]}, {"$set": project_data})
        proj_id = existing_project["_id"]
        custom_pid = existing_project.get("project_custom_id", str(proj_id))
        action = "PROJECT_UPDATED"
    else:
        p_count = db.projects.count_documents({}) + 1
        custom_pid = generate_project_id(p_count)
        while db.projects.find_one({"project_custom_id": custom_pid}):
            p_count += 1
            custom_pid = generate_project_id(p_count)

        project_data["project_custom_id"] = custom_pid
        project_data["jury_remarks"] = []
        project_data["created_at"] = now
        res = db.projects.insert_one(project_data)
        proj_id = res.inserted_id
        db.teams.update_one({"_id": team_id}, {"$set": {"project_id": proj_id}})
        action = "PROJECT_SUBMITTED"

    log_audit_event(str(user_id), role, action, "projects", str(proj_id), {"project_id": custom_pid, "title": title})

    return api_response(
        data={"project_id": str(proj_id), "project_custom_id": custom_pid, "status": project_data["status"]},
        message="Project submission successfully recorded!"
    )

@projects_bp.route("/my-project", methods=["GET"])
@role_required("student")
def get_my_project():
    user_id = get_jwt_identity()
    db = get_db()
    student = db.students.find_one({"user_id": parse_object_id(user_id)})
    if not student or not student.get("team_id"):
        return api_error("NOT_FOUND", "Student is not enrolled in a team.", status_code=404)

    project = db.projects.find_one({"team_id": student["team_id"]})
    if not project:
        return api_response(data=None)

    # Filter confidential remarks for student
    p_doc = serialize_doc(project)
    all_remarks = project.get("jury_remarks", [])
    p_doc["jury_remarks"] = [r for r in all_remarks if r.get("visibility") == "RELEASED"]
    return api_response(data=p_doc)

@projects_bp.route("/<project_id>", methods=["GET"])
@jwt_required()
def get_project_details(project_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    db = get_db()

    oid = parse_object_id(project_id)
    project = db.projects.find_one({"_id": oid})
    if not project:
        return api_error("NOT_FOUND", "Project not found.", status_code=404)

    team = db.teams.find_one({"_id": project.get("team_id")})
    school = db.schools.find_one({"_id": project.get("school_id")})

    payload = serialize_doc(project)
    payload["team"] = serialize_doc(team)
    payload["school"] = serialize_doc(school)

    # Jury remark visibility filtering:
    # Admin, Evaluator, Jury, State Jury see all remarks
    # School, Mentor, District, Student only see RELEASED remarks
    if role in ["school", "mentor", "district", "student"]:
        all_remarks = project.get("jury_remarks", [])
        payload["jury_remarks"] = [r for r in all_remarks if r.get("visibility") == "RELEASED"]

    return api_response(data=payload)

