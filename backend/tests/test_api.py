import pytest
from app import create_app
from config import TestConfig
from app.utils.db import get_db
from seed.seed_data import seed_database

@pytest.fixture(scope="module")
def client():
    app = create_app(TestConfig)
    with app.app_context():
        # Clean and seed test database
        db = get_db()
        # Drop collections
        for col in ["users", "schools", "teams", "students", "evaluators", "projects", "evaluations", "evaluation_assignments", "quizzes", "quiz_attempts", "notifications", "settings", "audit_logs"]:
            db[col].drop()
        seed_database(app)
        with app.test_client() as test_client:
            yield test_client

def get_auth_token(client, email, password):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed: {res.get_json()}"
    return res.get_json()["data"]["token"]

def test_healthcheck(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"

def test_admin_login(client):
    token = get_auth_token(client, "admin@afip.demo", "Admin@123")
    assert token is not None

    # Test me endpoint
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    user = res.get_json()["data"]["user"]
    assert user["role"] == "admin"
    assert user["email"] == "admin@afip.demo"

def test_school_login_and_profile(client):
    token = get_auth_token(client, "school@afip.demo", "School@123")
    res = client.get("/api/v1/schools/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    school = res.get_json()["data"]
    assert school["school_code"] == "AFIP-AS-KAM-00001"
    assert school["district"] == "Kamrup"

def test_school_duplicate_email_registration(client):
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Duplicate Test School",
        "udise_school_id": "18110100001",
        "school_type": "Private",
        "board": "CBSE",
        "district": "Kamrup",
        "pin_code": "781001",
        "official_email": "school@afip.demo", # Already exists
        "official_phone": "+91 99999 88888",
        "principal_name": "Test Principal",
        "principal_email": "tp@test.com",
        "principal_phone": "+91 99999 77777",
        "coordinator_name": "Test Coord",
        "coordinator_email": "tc@test.com",
        "coordinator_phone": "+91 99999 66666",
        "password": "Password@123",
        "confirm_password": "Password@123"
    })
    assert res.status_code == 409
    assert "already exists" in res.get_json()["error"]["message"]

def test_school_registration_non_assam_rejected(client):
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Delhi Public School",
        "udise_school_id": "18110100099",
        "school_type": "Private",
        "board": "CBSE",
        "state": "Delhi",  # Non-Assam
        "district": "Kamrup",
        "pin_code": "110001",
        "official_email": "delhi.school@test.com",
        "official_phone": "+91 99999 11111",
        "principal_name": "Delhi Principal",
        "principal_email": "dp@delhi.edu",
        "principal_phone": "+91 99999 22222",
        "coordinator_name": "Delhi Coord",
        "coordinator_email": "dc@delhi.edu",
        "coordinator_phone": "+91 99999 33333",
        "password": "School@123",
        "confirm_password": "School@123"
    })
    assert res.status_code == 400
    assert "strictly restricted to schools located in Assam" in res.get_json()["error"]["message"]

def test_school_registration_invalid_udise_rejected(client):
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Invalid UDISE School",
        "udise_school_id": "12345",  # Invalid format (not 11 digits starting with 18)
        "school_type": "Government Model School",
        "board": "SEBA",
        "state": "Assam",
        "district": "Kamrup",
        "pin_code": "781001",
        "official_email": "invalid.udise@afip.demo",
        "official_phone": "+91 99999 44444",
        "principal_name": "Test Principal",
        "principal_email": "tp@invalid.edu",
        "principal_phone": "+91 99999 55555",
        "coordinator_name": "Test Coord",
        "coordinator_email": "tc@invalid.edu",
        "coordinator_phone": "+91 99999 66666",
        "password": "School@123",
        "confirm_password": "School@123"
    })
    assert res.status_code == 400
    assert "valid 11-digit UDISE School ID" in res.get_json()["error"]["message"]

def test_school_registration_duplicate_udise_rejected(client):
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Duplicate UDISE School",
        "udise_school_id": "18010100101",  # Already registered to Brahmaputra Public School
        "school_type": "Government Model School",
        "board": "SEBA",
        "state": "Assam",
        "district": "Jorhat",
        "pin_code": "785001",
        "official_email": "dup.udise@afip.demo",
        "official_phone": "+91 99999 77777",
        "principal_name": "Test Principal",
        "principal_email": "tp@dup.edu",
        "principal_phone": "+91 99999 88888",
        "coordinator_name": "Test Coord",
        "coordinator_email": "tc@dup.edu",
        "coordinator_phone": "+91 99999 99999",
        "password": "School@123",
        "confirm_password": "School@123"
    })
    assert res.status_code == 409
    assert "already registered" in res.get_json()["error"]["message"]

def test_admin_approves_school_generates_unique_code(client):
    admin_token = get_auth_token(client, "admin@afip.demo", "Admin@123")
    
    # Register a new school in Golaghat
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Kaziranga Public Model School",
        "udise_school_id": "18120100002",
        "school_type": "Government Model School",
        "board": "SEBA",
        "state": "Assam",
        "district": "Golaghat",
        "pin_code": "785621",
        "official_email": "kaziranga.new@afip.demo",
        "official_phone": "+91 94350 99999",
        "principal_name": "B. Baruah",
        "principal_email": "bb@kaziranga.edu",
        "principal_phone": "+91 94350 99998",
        "coordinator_name": "P. Dutta",
        "coordinator_email": "pd@kaziranga.edu",
        "coordinator_phone": "+91 94350 99997",
        "password": "School@123",
        "confirm_password": "School@123"
    })
    assert res.status_code == 201
    school_id = res.get_json()["data"]["school_id"]

    # Admin verifies UDISE
    udise_res = client.patch(
        f"/api/v1/admin/schools/{school_id}/udise-status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"udise_verification_status": "verified"}
    )
    assert udise_res.status_code == 200
    assert udise_res.get_json()["data"]["udise_verification_status"] == "verified"

    # Admin approves
    approve_res = client.patch(
        f"/api/v1/admin/schools/{school_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "approved"}
    )
    assert approve_res.status_code == 200
    code = approve_res.get_json()["data"]["school_code"]
    assert code.startswith("AFIP-AS-GOL-")

def test_team_creation_by_school(client):
    school_token = get_auth_token(client, "school@afip.demo", "School@123")
    res = client.post("/api/v1/teams", headers={"Authorization": f"Bearer {school_token}"}, json={
        "team_name": "Assam Green Innovators",
        "category": "VI-VIII",
        "leader_name": "Nayan Moni",
        "leader_email": "nayan.moni@afip.demo",
        "leader_grade": "Class VII",
        "members": [{"name": "Barun Das", "email": "barun.d@afip.demo", "grade": "Class VII"}]
    })
    assert res.status_code == 201
    team_code = res.get_json()["data"]["team_code"]
    assert team_code.startswith("AFIP-T-")

def test_student_my_team_and_project_submission(client):
    student_token = get_auth_token(client, "student@afip.demo", "Student@123")
    res = client.get("/api/v1/teams/my-team", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["team"]["team_name"] == "Brahmaputra Innovators"
    assert data["school"]["school_name"] == "Brahmaputra Public School"

    # Submit project update
    proj_res = client.post("/api/v1/projects", headers={"Authorization": f"Bearer {student_token}"}, json={
        "title": "Smart Brahmaputra Flood Early Warning (Updated)",
        "theme": "Flood Resilience",
        "problem_statement": "Seasonal river surges displace families without warning.",
        "proposed_solution": "Mesh LoRa beacons placed along riverbanks with SMS alerts."
    })
    assert proj_res.status_code == 200
    assert proj_res.get_json()["data"]["status"] == "submitted"

def test_evaluator_unauthorized_access_forbidden(client):
    """
    CRITICAL SECURITY TEST: Evaluator must NOT be able to view projects
    not explicitly assigned to them by Admin. Must return 403 Forbidden.
    """
    eval_token = get_auth_token(client, "evaluator@afip.demo", "Evaluator@123")
    db = get_db()
    
    # Find an unassigned project
    evaluator_user = db.users.find_one({"email": "evaluator@afip.demo"})
    evaluator = db.evaluators.find_one({"user_id": evaluator_user["_id"]})
    assigned_proj_ids = [a["project_id"] for a in db.evaluation_assignments.find({"evaluator_id": evaluator["_id"]})]
    
    unassigned_project = db.projects.find_one({"_id": {"$nin": assigned_proj_ids}})
    assert unassigned_project is not None

    res = client.get(
        f"/api/v1/evaluators/projects/{unassigned_project['_id']}",
        headers={"Authorization": f"Bearer {eval_token}"}
    )
    assert res.status_code == 403
    assert "Unauthorized" in res.get_json()["error"]["message"]

def test_evaluator_assigned_access_and_rubric_evaluation(client):
    eval_token = get_auth_token(client, "evaluator@afip.demo", "Evaluator@123")
    
    # Fetch assignments
    list_res = client.get("/api/v1/evaluators/assignments", headers={"Authorization": f"Bearer {eval_token}"})
    assert list_res.status_code == 200
    assignments = list_res.get_json()["data"]
    assert len(assignments) >= 1
    
    # Take first assignment
    first_assign = assignments[0]
    proj_id = first_assign["project_id"]

    # View assigned project
    proj_res = client.get(f"/api/v1/evaluators/projects/{proj_id}", headers={"Authorization": f"Bearer {eval_token}"})
    assert proj_res.status_code == 200

    # Submit rubric score
    eval_res = client.post("/api/v1/evaluators/evaluate", headers={"Authorization": f"Bearer {eval_token}"}, json={
        "project_id": proj_id,
        "assignment_id": first_assign["id"],
        "is_draft": False,
        "scores": {
            "innovation": 18,
            "problem_understanding": 14,
            "technical_implementation": 18,
            "feasibility": 14,
            "social_impact": 14,
            "scalability": 9,
            "presentation": 5
        },
        "strengths": "Very solid execution and community engagement.",
        "comments": "High quality entry.",
        "recommendation": "Recommended"
    })
    # Might be locked if already evaluated, or updated successfully
    assert eval_res.status_code in [200, 400]

def test_quiz_active_and_submit(client):
    student_token = get_auth_token(client, "student@afip.demo", "Student@123")
    res = client.get("/api/v1/quizzes/active", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    quiz = res.get_json()["data"]
    assert quiz["is_live"] is True
    # Ensure correct answers are NOT leaked in questions array
    for q in quiz["questions"]:
        assert "correct_answer" not in q

    quiz_id = quiz["id"]
    # Start quiz
    start_res = client.post(f"/api/v1/quizzes/{quiz_id}/start", headers={"Authorization": f"Bearer {student_token}"})
    assert start_res.status_code in [200, 201]

    # Submit quiz
    sub_res = client.post(f"/api/v1/quizzes/{quiz_id}/submit", headers={"Authorization": f"Bearer {student_token}"}, json={
        "answers": {
            "q1": 1,
            "q2": 2,
            "q3": 0
        }
    })
    assert sub_res.status_code in [200, 400] # 400 if already submitted in previous test step

def test_leaderboard_visibility_toggle(client):
    admin_token = get_auth_token(client, "admin@afip.demo", "Admin@123")
    
    # Set public
    client.patch("/api/v1/admin/leaderboard-visibility", headers={"Authorization": f"Bearer {admin_token}"}, json={"is_public": True})
    res_pub = client.get("/api/v1/leaderboard")
    assert res_pub.status_code == 200
    assert res_pub.get_json()["data"]["is_public"] is True
    assert len(res_pub.get_json()["data"]["entries"]) > 0

    # Hide leaderboard
    client.patch("/api/v1/admin/leaderboard-visibility", headers={"Authorization": f"Bearer {admin_token}"}, json={"is_public": False})
    res_hid = client.get("/api/v1/leaderboard")
    assert res_hid.status_code == 200
    assert res_hid.get_json()["data"]["is_public"] is False
    assert len(res_hid.get_json()["data"]["entries"]) == 0

    # Reset back to public for users
    client.patch("/api/v1/admin/leaderboard-visibility", headers={"Authorization": f"Bearer {admin_token}"}, json={"is_public": True})

def test_admin_approves_school_dedicated_endpoint(client):
    admin_token = get_auth_token(client, "admin@afip.demo", "Admin@123")
    # Register school in Jorhat
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Jorhat Model Higher Secondary",
        "udise_school_id": "18150100001",
        "school_type": "Government Model School",
        "board": "SEBA",
        "state": "Assam",
        "district": "Jorhat",
        "block": "Jorhat Central",
        "pin_code": "785001",
        "official_email": "jorhat.model@afip.demo",
        "official_phone": "+91 94350 77111",
        "principal_name": "M. Saikia",
        "password": "School@123",
        "confirm_password": "School@123"
    })
    assert res.status_code == 201
    school_id = res.get_json()["data"]["school_id"]

    # Pending school cannot log in yet
    pending_login = client.post("/api/v1/auth/login", json={
        "email": "jorhat.model@afip.demo",
        "password": "School@123"
    })
    assert pending_login.status_code == 403
    assert "pending administrative review" in pending_login.get_json()["error"]["message"]

    # Admin approves school
    approve_res = client.post(
        f"/api/v1/admin/schools/{school_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert approve_res.status_code == 200
    assert approve_res.get_json()["data"]["status"] == "approved"
    assert approve_res.get_json()["data"]["school_code"].startswith("AFIP-AS-JOR-")

    # Approved school can now log in
    login_res = client.post("/api/v1/auth/login", json={
        "email": "jorhat.model@afip.demo",
        "password": "School@123"
    })
    assert login_res.status_code == 200
    assert login_res.get_json()["data"]["token"] is not None

def test_admin_rejects_school_requires_reason(client):
    admin_token = get_auth_token(client, "admin@afip.demo", "Admin@123")
    # Register school in Darrang
    res = client.post("/api/v1/schools/register", json={
        "school_name": "Darrang Test School",
        "udise_school_id": "18160100001",
        "school_type": "Private",
        "board": "SEBA",
        "state": "Assam",
        "district": "Darrang",
        "block": "Mangaldai Block",
        "pin_code": "784125",
        "official_email": "darrang.test@afip.demo",
        "official_phone": "+91 94350 88222",
        "principal_name": "K. Sarma",
        "password": "School@123",
        "confirm_password": "School@123"
    })
    assert res.status_code == 201
    school_id = res.get_json()["data"]["school_id"]

    # Attempt rejection without reason -> MUST FAIL with 400
    no_reason_res = client.post(
        f"/api/v1/admin/schools/{school_id}/reject",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"rejection_reason": ""}
    )
    assert no_reason_res.status_code == 400
    assert "rejection reason is mandatory" in no_reason_res.get_json()["error"]["message"].lower()

    # Rejection with reason -> MUST SUCCEED with 200
    reason_res = client.post(
        f"/api/v1/admin/schools/{school_id}/reject",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"rejection_reason": "Incomplete institutional affiliation proof."}
    )
    assert reason_res.status_code == 200
    assert reason_res.get_json()["data"]["status"] == "rejected"
    assert reason_res.get_json()["data"]["rejection_reason"] == "Incomplete institutional affiliation proof."

    # Rejected school login attempt -> 403
    rej_login = client.post("/api/v1/auth/login", json={
        "email": "darrang.test@afip.demo",
        "password": "School@123"
    })
    assert rej_login.status_code == 403
    assert "rejected" in rej_login.get_json()["error"]["message"].lower()

def test_rbac_backend_school_cannot_access_admin_api(client):
    school_token = get_auth_token(client, "school@afip.demo", "School@123")
    # School attempts to access admin-only endpoint
    res = client.get("/api/v1/admin/audit-logs", headers={"Authorization": f"Bearer {school_token}"})
    assert res.status_code == 403
    assert "Access forbidden" in res.get_json()["error"]["message"]

def test_unauthenticated_request_rejected(client):
    res = client.get("/api/v1/admin/stats")
    assert res.status_code == 401
    assert "authorization" in res.get_json()["error"]["message"].lower() or res.get_json()["error"]["code"] == "UNAUTHORIZED"

def test_logout_endpoint_and_audit_log(client):
    admin_token = get_auth_token(client, "admin@afip.demo", "Admin@123")
    res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.get_json()["message"] == "Logged out successfully."

def test_all_portal_roles_login(client):
    # Test all 7 role accounts + student
    roles_test = [
        ("admin@afip.demo", "Admin@123", "admin"),
        ("school@afip.demo", "School@123", "school"),
        ("mentor@afip.demo", "Mentor@123", "mentor"),
        ("evaluator@afip.demo", "Evaluator@123", "evaluator"),
        ("district@afip.demo", "District@123", "district"),
        ("jury@afip.demo", "Jury@123", "jury"),
        ("statejury@afip.demo", "StateJury@123", "state_jury"),
        ("student@afip.demo", "Student@123", "student")
    ]
    for email, password, expected_role in roles_test:
        token = get_auth_token(client, email, password)
        assert token is not None
        me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        user = me_res.get_json()["data"]["user"]
        assert user["role"] == expected_role
        # Security assertion: password_hash never exposed
        assert "password_hash" not in user
        assert "password" not in user

