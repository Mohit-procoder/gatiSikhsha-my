import pytest
from app import create_app
from config import TestConfig
from app.utils.db import get_db
from app.utils.helpers import hash_password
from seed.seed_data import seed_database

@pytest.fixture(scope="module")
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db = get_db()
        for col in ["users", "schools", "teams", "students", "mentors", "evaluators", "projects", "evaluations", "evaluation_assignments", "quizzes", "quiz_attempts", "notifications", "settings", "audit_logs", "mentor_feedback"]:
            db[col].drop()
        seed_database(app)
        with app.test_client() as test_client:
            yield test_client

def login_and_get_token(client, email, password, role=None):
    payload = {"email": email, "password": password}
    if role:
        payload["role"] = role
    res = client.post("/api/v1/auth/login", json=payload)
    data = res.get_json()
    assert res.status_code == 200, f"Login failed for {email}: {data}"
    return data["data"]["token"]

# 1. School Mentor Creation
def test_school_create_mentor(client):
    token = login_and_get_token(client, "school@afip.demo", "School@123", "school")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/schools/mentors", headers=headers, json={
        "name": "Dr. Subhash Sarma",
        "email": "subhash.sarma@afip.test",
        "phone": "+91 94350 99887",
        "designation": "Head of Science Department",
        "password": "Mentor@123"
    })
    assert res.status_code == 201
    body = res.get_json()
    assert body["success"] is True
    assert "AFIP-MEN-" in body["data"]["mentor_custom_id"]

    # Verify listing
    res_list = client.get("/api/v1/schools/mentors", headers=headers)
    assert res_list.status_code == 200
    mentors = res_list.get_json()["data"]
    assert any(m["email"] == "subhash.sarma@afip.test" for m in mentors)

# 2. School Team Creation with auto-derived School/District and Unique Team ID
def test_school_create_team(client):
    token = login_and_get_token(client, "school@afip.demo", "School@123", "school")
    headers = {"Authorization": f"Bearer {token}"}

    # First get existing mentors or create mentor
    m_res = client.get("/api/v1/schools/mentors", headers=headers)
    mentor_id = m_res.get_json()["data"][0]["_id"]

    res = client.post("/api/v1/teams", headers=headers, json={
        "team_name": "Kamrup AgriTech",
        "category": "IX-X",
        "mentor_id": mentor_id,
        "leader_name": "Dipankar Saikia",
        "leader_email": "dipankar.s@school.test",
        "leader_grade": "Class X",
        "members": [
            {"name": "Ankur Das", "email": "ankur.d@school.test", "grade": "Class X"},
            {"name": "Mitali Nath", "email": "mitali.n@school.test", "grade": "Class IX"}
        ]
    })
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert "AFIP-KAM-" in data["team_custom_id"]
    assert "AFIP-T-" in data["team_code"]
    assert data["mentor_name"] is not None

# 3. Student Management (Add, Edit, Remove)
def test_student_management(client):
    token = login_and_get_token(client, "school@afip.demo", "School@123", "school")
    headers = {"Authorization": f"Bearer {token}"}

    # Add student
    res = client.post("/api/v1/schools/students", headers=headers, json={
        "name": "Rituparna Baruah",
        "email": "rituparna@school.test",
        "grade": "Class VIII"
    })
    assert res.status_code == 201
    stu_id = res.get_json()["data"]["student_id"]
    assert "AFIP-STU-" in res.get_json()["data"]["student_custom_id"]

    # Edit student
    res_edit = client.put(f"/api/v1/schools/students/{stu_id}", headers=headers, json={
        "grade": "Class IX",
        "phone": "+91 99540 88776"
    })
    assert res_edit.status_code == 200

    # Delete student
    res_del = client.delete(f"/api/v1/schools/students/{stu_id}", headers=headers)
    assert res_del.status_code == 200

# 4. Mentor Login, Assigned Teams & IDOR Protection
def test_mentor_login_and_idor_protection(client):
    school_token = login_and_get_token(client, "school@afip.demo", "School@123", "school")
    school_headers = {"Authorization": f"Bearer {school_token}"}

    # Create Mentor 1
    m1_res = client.post("/api/v1/schools/mentors", headers=school_headers, json={
        "name": "Mentor Alpha",
        "email": "mentor_alpha@afip.test",
        "password": "Alpha@123"
    })
    m1_id = m1_res.get_json()["data"]["mentor_id"]

    # Create Mentor 2
    m2_res = client.post("/api/v1/schools/mentors", headers=school_headers, json={
        "name": "Mentor Beta",
        "email": "mentor_beta@afip.test",
        "password": "Beta@123"
    })
    m2_id = m2_res.get_json()["data"]["mentor_id"]

    # Create Team assigned to Mentor Alpha
    t1_res = client.post("/api/v1/teams", headers=school_headers, json={
        "team_name": "Alpha Special Team",
        "category": "VI-VIII",
        "mentor_id": m1_id,
        "leader_name": "Leader One",
        "leader_email": "l1@afip.test"
    })
    t1_id = t1_res.get_json()["data"]["team_id"]

    # Login as Mentor Alpha
    m1_token = login_and_get_token(client, "mentor_alpha@afip.test", "Alpha@123", "mentor")
    m1_headers = {"Authorization": f"Bearer {m1_token}"}

    # Mentor Alpha accesses their assigned team
    res_t1 = client.get(f"/api/v1/mentors/teams/{t1_id}", headers=m1_headers)
    assert res_t1.status_code == 200
    assert res_t1.get_json()["data"]["team_name"] == "Alpha Special Team"

    # Login as Mentor Beta
    m2_token = login_and_get_token(client, "mentor_beta@afip.test", "Beta@123", "mentor")
    m2_headers = {"Authorization": f"Bearer {m2_token}"}

    # IDOR Test: Mentor Beta attempts to access Mentor Alpha's team -> MUST BE 403 Forbidden
    res_idor = client.get(f"/api/v1/mentors/teams/{t1_id}", headers=m2_headers)
    assert res_idor.status_code == 403

# 5. Mentor Feedback Submission
def test_mentor_feedback_submission(client):
    school_token = login_and_get_token(client, "school@afip.demo", "School@123", "school")
    school_headers = {"Authorization": f"Bearer {school_token}"}

    m_res = client.post("/api/v1/schools/mentors", headers=school_headers, json={
        "name": "Mentor Guide",
        "email": "mentor_guide@afip.test",
        "password": "Guide@123"
    })
    m_id = m_res.get_json()["data"]["mentor_id"]

    t_res = client.post("/api/v1/teams", headers=school_headers, json={
        "team_name": "Guidance Team",
        "category": "XI-XII",
        "mentor_id": m_id,
        "leader_name": "Lead Student",
        "leader_email": "lead@afip.test"
    })
    t_id = t_res.get_json()["data"]["team_id"]

    m_token = login_and_get_token(client, "mentor_guide@afip.test", "Guide@123", "mentor")
    m_headers = {"Authorization": f"Bearer {m_token}"}

    fb_res = client.post(f"/api/v1/mentors/teams/{t_id}/feedback", headers=m_headers, json={
        "comments": "Great progress on the circuit diagram. Refine the battery backup.",
        "areas_of_guidance": "Power efficiency and sensor calibration",
        "milestone_rating": 5
    })
    assert fb_res.status_code == 200
    assert "successfully" in fb_res.get_json()["message"]

# 6. District Stats & Isolation Protection
def test_district_isolation_and_stats(client):
    # Login as Kamrup District Officer
    kamrup_dist_token = login_and_get_token(client, "district@afip.demo", "District@123", "district")
    kamrup_dist_headers = {"Authorization": f"Bearer {kamrup_dist_token}"}

    # Kamrup Officer queries stats -> only Kamrup data
    res_stats = client.get("/api/v1/districts/stats", headers=kamrup_dist_headers)
    assert res_stats.status_code == 200
    stats = res_stats.get_json()["data"]
    assert stats["district_name"] == "Kamrup"
    assert stats["total_schools"] >= 1

    # Kamrup Officer queries teams -> only Kamrup teams returned
    res_teams = client.get("/api/v1/districts/teams", headers=kamrup_dist_headers)
    assert res_teams.status_code == 200
    teams_list = res_teams.get_json()["data"]
    assert len(teams_list) >= 1
    assert all(t["district"] == "Kamrup" for t in teams_list)

    # Login as Dibrugarh District Officer
    dib_dist_token = login_and_get_token(client, "district_dib@afip.demo", "District@123", "district")
    dib_dist_headers = {"Authorization": f"Bearer {dib_dist_token}"}

    # Grab a Kamrup team ID
    kamrup_team_id = teams_list[0]["_id"]

    # Strict IDOR Isolation Test: Dibrugarh District Officer tries to access Kamrup Team -> 403 Forbidden!
    res_dist_idor = client.get(f"/api/v1/districts/teams/{kamrup_team_id}", headers=dib_dist_headers)
    assert res_dist_idor.status_code == 403

# 7. District Jury Remark Visibility Filtering (RELEASED vs INTERNAL)
def test_jury_remark_visibility(client):
    school_token = login_and_get_token(client, "school@afip.demo", "School@123", "school")
    school_headers = {"Authorization": f"Bearer {school_token}"}

    t_res = client.post("/api/v1/teams", headers=school_headers, json={
        "team_name": "Project Showcase Team",
        "category": "IX-X",
        "leader_name": "Project Lead",
        "leader_email": "proj.lead@afip.test"
    })
    team_id = t_res.get_json()["data"]["team_id"]

    # Submit project
    p_res = client.post("/api/v1/projects", headers=school_headers, json={
        "team_id": team_id,
        "title": "Smart Solar Irrigation",
        "problem_statement": "Groundwater depletion in rural Assam.",
        "proposed_solution": "Automated solar moisture sensors."
    })
    proj_id = p_res.get_json()["data"]["project_id"]

    # Add jury remarks to project in DB: one RELEASED, one INTERNAL
    from app.utils.db import get_db, parse_object_id
    db = get_db()
    db.projects.update_one({"_id": parse_object_id(proj_id)}, {"$set": {
        "jury_remarks": [
            {"remark_id": "R1", "remark": "Public constructive remark.", "visibility": "RELEASED"},
            {"remark_id": "R2", "remark": "Private confidential remark.", "visibility": "INTERNAL"}
        ]
    }})

    # District user inspects project
    dist_token = login_and_get_token(client, "district@afip.demo", "District@123", "district")
    dist_headers = {"Authorization": f"Bearer {dist_token}"}

    res_proj = client.get(f"/api/v1/projects/{proj_id}", headers=dist_headers)
    assert res_proj.status_code == 200
    remarks = res_proj.get_json()["data"]["jury_remarks"]
    # Only 1 RELEASED remark should be visible; INTERNAL must be filtered out
    assert len(remarks) == 1
    assert remarks[0]["remark"] == "Public constructive remark."
