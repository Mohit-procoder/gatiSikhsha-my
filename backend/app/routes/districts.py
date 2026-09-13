from datetime import datetime, timezone
import re
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.utils.db import get_db, parse_object_id, serialize_doc
from app.utils.helpers import api_response, api_error, generate_district_id
from app.middleware.auth_middleware import role_required

districts_bp = Blueprint("districts", __name__, url_prefix="/api/v1/districts")

def _get_district_context(user_id, claims):
    db = get_db()
    user = db.users.find_one({"_id": parse_object_id(user_id)})
    dist = (user.get("district") if user else "") or claims.get("district", "Kamrup")
    return dist.strip()

@districts_bp.route("/me", methods=["GET"])
@role_required("district")
def get_district_profile():
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()
    user = db.users.find_one({"_id": parse_object_id(user_id)})

    district_id = generate_district_id(district_name)
    data = {
        "user_id": str(user["_id"]) if user else str(user_id),
        "name": user.get("name", "District Innovation Officer") if user else "District Innovation Officer",
        "email": user.get("email", "") if user else "",
        "district_name": district_name,
        "district_id": district_id,
        "state": "Assam"
    }
    return api_response(data=data)

@districts_bp.route("/stats", methods=["GET"])
@role_required("district")
def get_district_stats():
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()

    dist_regex = {"$regex": f"^{re.escape(district_name)}$", "$options": "i"}

    # Real MongoDB counts for this specific district
    total_schools = db.schools.count_documents({"district": dist_regex})
    approved_schools = db.schools.count_documents({"district": dist_regex, "status": "approved"})
    pending_schools = db.schools.count_documents({"district": dist_regex, "status": "pending"})

    # Fetch school ids in district
    school_ids = [s["_id"] for s in db.schools.find({"district": dist_regex}, {"_id": 1})]

    total_teams = db.teams.count_documents({"$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}]})
    active_teams = db.teams.count_documents({"$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}], "status": "active"})
    shortlisted_teams = db.teams.count_documents({
        "$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}],
        "qualification_status": {"$in": ["shortlisted", "qualified"]}
    })

    total_students = db.students.count_documents({"$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}]})
    total_mentors = db.mentors.count_documents({"$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}]})

    submitted_projects = db.projects.count_documents({
        "$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}],
        "status": {"$in": ["submitted", "evaluated", "shortlisted", "finalist", "winner"]}
    })

    pending_evaluations = db.projects.count_documents({
        "$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}],
        "status": "submitted"
    })

    stats = {
        "district_name": district_name,
        "district_id": generate_district_id(district_name),
        "total_schools": total_schools,
        "approved_schools": approved_schools,
        "pending_schools": pending_schools,
        "total_teams": total_teams,
        "active_teams": active_teams,
        "shortlisted_teams": shortlisted_teams,
        "total_students": total_students,
        "total_mentors": total_mentors,
        "submitted_projects": submitted_projects,
        "pending_evaluations": pending_evaluations
    }
    return api_response(data=stats)

@districts_bp.route("/schools", methods=["GET"])
@role_required("district")
def get_district_schools():
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()

    search = request.args.get("search", "").strip()
    status = request.args.get("status")

    query = {"district": {"$regex": f"^{re.escape(district_name)}$", "$options": "i"}}
    if status and status != "all":
        query["status"] = status
    if search:
        query["$and"] = [
            {"district": {"$regex": f"^{re.escape(district_name)}$", "$options": "i"}},
            {"$or": [
                {"school_name": {"$regex": search, "$options": "i"}},
                {"udise_school_id": {"$regex": search, "$options": "i"}},
                {"school_code": {"$regex": search, "$options": "i"}},
                {"block": {"$regex": search, "$options": "i"}}
            ]}
        ]

    schools = list(db.schools.find(query).sort("created_at", -1))
    enriched = []
    for s in schools:
        s_doc = serialize_doc(s)
        s_id = s["_id"]
        s_doc["teams_count"] = db.teams.count_documents({"school_id": s_id})
        s_doc["students_count"] = db.students.count_documents({"school_id": s_id})
        s_doc["mentors_count"] = db.mentors.count_documents({"school_id": s_id})
        s_doc["projects_count"] = db.projects.count_documents({"school_id": s_id})
        enriched.append(s_doc)

    return api_response(data=enriched)

@districts_bp.route("/schools/<school_id>", methods=["GET"])
@role_required("district")
def get_district_school_details(school_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()

    oid = parse_object_id(school_id)
    school = db.schools.find_one({"_id": oid})
    if not school:
        return api_error("NOT_FOUND", "School not found.", status_code=404)

    # Strict District Isolation Check
    if str(school.get("district", "")).strip().lower() != district_name.strip().lower():
        return api_error("FORBIDDEN", f"You are not authorized to view schools from outside your district ({district_name}).", status_code=403)

    teams = list(db.teams.find({"school_id": oid}))
    mentors = list(db.mentors.find({"school_id": oid}))
    students = list(db.students.find({"school_id": oid}))

    data = serialize_doc(school)
    data["teams"] = serialize_doc(teams)
    data["mentors"] = serialize_doc(mentors)
    data["students"] = serialize_doc(students)

    return api_response(data=data)

@districts_bp.route("/teams", methods=["GET"])
@role_required("district")
def get_district_teams():
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()

    dist_regex = {"$regex": f"^{re.escape(district_name)}$", "$options": "i"}
    school_ids = [s["_id"] for s in db.schools.find({"district": dist_regex}, {"_id": 1})]

    search = request.args.get("search", "").strip()
    category = request.args.get("category")
    stage = request.args.get("stage")

    query = {"$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}]}
    if category and category != "all":
        query["category"] = category
    if stage and stage != "all":
        query["competition_stage"] = stage
    if search:
        query["team_name"] = {"$regex": search, "$options": "i"}

    teams = list(db.teams.find(query).sort("created_at", -1))
    enriched = []
    for t in teams:
        t_doc = serialize_doc(t)
        members = list(db.students.find({"team_id": t["_id"]}))
        t_doc["members_count"] = len(members)
        t_doc["members"] = serialize_doc(members)
        project = db.projects.find_one({"team_id": t["_id"]})
        t_doc["project"] = serialize_doc(project) if project else None
        school = db.schools.find_one({"_id": t.get("school_id")}, {"school_name": 1, "udise_school_id": 1, "block": 1, "district": 1})
        t_doc["school"] = serialize_doc(school) if school else None
        if not t_doc.get("district"):
            t_doc["district"] = (school.get("district") if school else district_name) or district_name
        enriched.append(t_doc)

    return api_response(data=enriched)

@districts_bp.route("/teams/<team_id>", methods=["GET"])
@role_required("district")
def get_district_team_details(team_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()

    oid = parse_object_id(team_id)
    team = db.teams.find_one({"_id": oid})
    if not team:
        return api_error("NOT_FOUND", "Team not found.", status_code=404)

    # Check district alignment
    team_dist = str(team.get("district", "")).strip().lower()
    if not team_dist and team.get("school_id"):
        sch = db.schools.find_one({"_id": team["school_id"]})
        team_dist = str(sch.get("district", "")).strip().lower() if sch else ""

    if team_dist != district_name.strip().lower():
        return api_error("FORBIDDEN", f"You are not authorized to view teams outside your district ({district_name}).", status_code=403)

    members = list(db.students.find({"team_id": team["_id"]}))
    project = db.projects.find_one({"team_id": team["_id"]})
    school = db.schools.find_one({"_id": team.get("school_id")})
    mentor = db.mentors.find_one({"_id": team.get("mentor_id")}) if team.get("mentor_id") else None

    # Filter jury remarks for project (only RELEASED remarks visible to district)
    proj_doc = None
    if project:
        proj_doc = serialize_doc(project)
        all_remarks = project.get("jury_remarks", [])
        released_remarks = [r for r in all_remarks if r.get("visibility") == "RELEASED"]
        proj_doc["jury_remarks"] = released_remarks

    data = serialize_doc(team)
    data["members"] = serialize_doc(members)
    data["project"] = proj_doc
    data["school"] = serialize_doc(school) if school else None
    data["mentor"] = serialize_doc(mentor) if mentor else None

    return api_response(data=data)

@districts_bp.route("/projects", methods=["GET"])
@role_required("district")
def get_district_projects():
    user_id = get_jwt_identity()
    claims = get_jwt()
    district_name = _get_district_context(user_id, claims)
    db = get_db()

    dist_regex = {"$regex": f"^{re.escape(district_name)}$", "$options": "i"}
    school_ids = [s["_id"] for s in db.schools.find({"district": dist_regex}, {"_id": 1})]

    projects = list(db.projects.find({
        "$or": [{"district": dist_regex}, {"school_id": {"$in": school_ids}}]
    }).sort("created_at", -1))

    enriched = []
    for p in projects:
        p_doc = serialize_doc(p)
        team = db.teams.find_one({"_id": p.get("team_id")}, {"team_name": 1, "team_code": 1, "team_custom_id": 1, "category": 1})
        school = db.schools.find_one({"_id": p.get("school_id")}, {"school_name": 1, "udise_school_id": 1, "block": 1})
        p_doc["team"] = serialize_doc(team) if team else None
        p_doc["school"] = serialize_doc(school) if school else None
        # Strict jury remark visibility: only RELEASED remarks visible
        all_remarks = p.get("jury_remarks", [])
        p_doc["jury_remarks"] = [r for r in all_remarks if r.get("visibility") == "RELEASED"]
        enriched.append(p_doc)

    return api_response(data=enriched)
