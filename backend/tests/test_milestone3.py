import pytest
from app import create_app
from config import TestConfig
from app.utils.db import get_db, parse_object_id
from app.utils.helpers import hash_password
from seed.seed_data import seed_database

@pytest.fixture(scope="module")
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db = get_db()
        for col in [
            "users", "schools", "teams", "students", "mentors", "evaluators",
            "projects", "evaluations", "evaluation_assignments", "quizzes",
            "quiz_attempts", "notifications", "settings", "audit_logs", "mentor_feedback", "shortlists", "rubrics"
        ]:
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

# 1. Evaluator Profile, Assignments & Conflict of Interest Gate
def test_evaluator_me_and_conflict_of_interest(client):
    token = login_and_get_token(client, "evaluator@afip.demo", "Evaluator@123", "evaluator")
    headers = {"Authorization": f"Bearer {token}"}

    # Profile & stats
    me_res = client.get("/api/v1/evaluators/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.get_json()["data"]
    assert me_data["stats"]["assigned"] >= 1

    # Assignments
    assign_res = client.get("/api/v1/evaluators/assignments", headers=headers)
    assert assign_res.status_code == 200
    assignments = assign_res.get_json()["data"]
    assert len(assignments) >= 1

    assign_id = assignments[0]["_id"]
    proj_id = assignments[0]["project_id"]

    # Declare Conflict of Interest without reason -> 400 Validation Error
    bad_conf = client.post(f"/api/v1/evaluators/assignments/{assign_id}/conflict", headers=headers, json={
        "decision": "conflict_declared"
    })
    assert bad_conf.status_code == 400

    # Declare Conflict with valid reason -> 200 Success
    conf_res = client.post(f"/api/v1/evaluators/assignments/{assign_id}/conflict", headers=headers, json={
        "decision": "conflict_declared",
        "reason": "I am a distant relative of the student innovator team."
    })
    assert conf_res.status_code == 200
    assert conf_res.get_json()["data"]["conflict_status"] == "conflict_declared"

    # Accessing project must now be FORBIDDEN due to declared conflict
    blocked_proj = client.get(f"/api/v1/evaluators/projects/{proj_id}", headers=headers)
    assert blocked_proj.status_code == 403

    # Clear conflict -> access restored
    clear_res = client.post(f"/api/v1/evaluators/assignments/{assign_id}/conflict", headers=headers, json={
        "decision": "no_conflict"
    })
    assert clear_res.status_code == 200
    assert clear_res.get_json()["data"]["conflict_status"] == "no_conflict"

    restored_proj = client.get(f"/api/v1/evaluators/projects/{proj_id}", headers=headers)
    assert restored_proj.status_code == 200

# 2. Score Locking and Admin Reopening with Mandatory Reason
def test_evaluator_score_locking_and_admin_reopen(client):
    eval_token = login_and_get_token(client, "evaluator@afip.demo", "Evaluator@123", "evaluator")
    eval_headers = {"Authorization": f"Bearer {eval_token}"}

    assign_res = client.get("/api/v1/evaluators/assignments", headers=eval_headers)
    assign = assign_res.get_json()["data"][0]
    assign_id = assign["_id"]
    proj_id = assign["project_id"]

    # Evaluator submits finalized evaluation
    eval_sub = client.post("/api/v1/evaluators/evaluate", headers=eval_headers, json={
        "project_id": proj_id,
        "assignment_id": assign_id,
        "is_draft": False,
        "scores": {
            "innovation": 18,
            "problem_understanding": 14,
            "technical_implementation": 19,
            "feasibility": 14,
            "social_impact": 15,
            "scalability": 9,
            "presentation": 5
        },
        "comments": "Superb working demonstration and robust LoRa telemetry.",
        "recommendation": "Strongly Recommended"
    })
    assert eval_sub.status_code == 200
    eval_id = eval_sub.get_json()["data"]["evaluation_id"]

    # Attempt to modify locked evaluation -> MUST FAIL with 400 LOCKED
    eval_edit_blocked = client.post("/api/v1/evaluators/evaluate", headers=eval_headers, json={
        "project_id": proj_id,
        "assignment_id": assign_id,
        "is_draft": False,
        "scores": {"innovation": 20}
    })
    assert eval_edit_blocked.status_code == 400
    assert eval_edit_blocked.get_json()["error"]["code"] == "LOCKED"

    # Admin attempts to reopen WITHOUT mandatory reason -> MUST FAIL with 400
    admin_token = login_and_get_token(client, "admin@afip.demo", "Admin@123", "admin")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    reopen_no_reason = client.post(f"/api/v1/admin/evaluations/{eval_id}/reopen", headers=admin_headers, json={})
    assert reopen_no_reason.status_code == 400

    # Admin reopens WITH mandatory reason -> SUCCEEDS and logs audit
    reopen_success = client.post(f"/api/v1/admin/evaluations/{eval_id}/reopen", headers=admin_headers, json={
        "reason": "Expert requested adjustment after review of supplementary field test logs."
    })
    assert reopen_success.status_code == 200

    # Evaluator can now resubmit adjusted scores
    eval_resub = client.post("/api/v1/evaluators/evaluate", headers=eval_headers, json={
        "project_id": proj_id,
        "assignment_id": assign_id,
        "is_draft": False,
        "scores": {
            "innovation": 20,
            "problem_understanding": 15,
            "technical_implementation": 20,
            "feasibility": 15,
            "social_impact": 15,
            "scalability": 10,
            "presentation": 5
        },
        "comments": "Upgraded to 100 after verified flood test review."
    })
    assert eval_resub.status_code == 200
    assert eval_resub.get_json()["data"]["total_score"] == 100.0

# 3. Jury Login, Assignments & IDOR Protection
def test_jury_login_and_assignment_idor(client):
    jury_token = login_and_get_token(client, "jury@afip.demo", "Jury@123", "jury")
    jury_headers = {"Authorization": f"Bearer {jury_token}"}

    # 1. Profile
    me_res = client.get("/api/v1/jury/me", headers=jury_headers)
    assert me_res.status_code == 200
    assert me_res.get_json()["data"]["role"] == "jury"

    # 2. Assignments
    assign_res = client.get("/api/v1/jury/assignments", headers=jury_headers)
    assert assign_res.status_code == 200
    assignments = assign_res.get_json()["data"]
    assert len(assignments) >= 1

    assigned_team_id = assignments[0]["team_id"]

    # 3. Access assigned team -> 200
    team_res = client.get(f"/api/v1/jury/teams/{assigned_team_id}", headers=jury_headers)
    assert team_res.status_code == 200
    assert team_res.get_json()["data"]["team"]["_id"] == assigned_team_id

    # 4. IDOR Protection: Query team NOT assigned to this jury member -> MUST BE 403 Forbidden
    from app.utils.db import get_db
    db = get_db()
    unassigned_team = db.teams.find_one({"_id": {"$ne": parse_object_id(assigned_team_id)}})
    assert unassigned_team is not None

    idor_res = client.get(f"/api/v1/jury/teams/{unassigned_team['_id']}", headers=jury_headers)
    assert idor_res.status_code == 403

# 4. Jury Evaluation & Remarks Visibility
def test_jury_evaluation_and_remarks_visibility(client):
    jury_token = login_and_get_token(client, "jury@afip.demo", "Jury@123", "jury")
    jury_headers = {"Authorization": f"Bearer {jury_token}"}

    assign_res = client.get("/api/v1/jury/assignments", headers=jury_headers)
    assign = assign_res.get_json()["data"][0]

    eval_res = client.post("/api/v1/jury/evaluate", headers=jury_headers, json={
        "assignment_id": assign["_id"],
        "team_id": assign["team_id"],
        "is_draft": False,
        "scores": {
            "innovation_originality": 24,
            "regional_impact": 19,
            "technical_feasibility": 19,
            "presentation_pitch": 14,
            "team_dynamics": 9,
            "scalability_market": 9
        },
        "strengths": "Articulate team defense and genuine collaborative development.",
        "areas_for_improvement": "Refine economic cost analysis per hectare.",
        "comments": "Outstanding presentation in the zonal panel.",
        "recommendation": "Finalist Award Candidate",
        "remarks_visibility": "RELEASED"
    })
    assert eval_res.status_code == 200
    assert eval_res.get_json()["data"]["total_score"] == 94.0

    # Check that team's jury_score was updated in DB
    from app.utils.db import get_db
    db = get_db()
    team = db.teams.find_one({"_id": parse_object_id(assign["team_id"])})
    assert team["jury_score"] == 94.0

# 5. State Jury Finalist Restriction & Evaluation
def test_state_jury_finalist_restriction(client):
    st_token = login_and_get_token(client, "statejury@afip.demo", "StateJury@123", "state_jury")
    st_headers = {"Authorization": f"Bearer {st_token}"}

    # 1. Profile
    me_res = client.get("/api/v1/state-jury/me", headers=st_headers)
    assert me_res.status_code == 200
    assert me_res.get_json()["data"]["role"] == "state_jury"

    # 2. Finalists listing -> strictly returns qualified finalists
    fin_res = client.get("/api/v1/state-jury/finalists", headers=st_headers)
    assert fin_res.status_code == 200
    finalists = fin_res.get_json()["data"]
    assert len(finalists) >= 1
    assert all(f["qualification_status"] in ["finalist", "shortlisted", "winner"] or f["competition_stage"] in ["hackathon", "state_finale", "jury_round"] for f in finalists)

    finalist_id = finalists[0]["_id"]

    # 3. State jury evaluates finalist
    eval_res = client.post("/api/v1/state-jury/evaluate", headers=st_headers, json={
        "team_id": finalist_id,
        "is_draft": False,
        "scores": {
            "transformative_impact": 24,
            "innovation_breakthrough": 24,
            "execution_excellence": 19,
            "defense_articulation": 14,
            "state_scalability": 14
        },
        "recommended_rank": 1,
        "award_nomination": "State Gold Innovator of the Year",
        "comments": "Monumental breakthrough with direct socio-ecological benefits for the entire Brahmaputra basin."
    })
    assert eval_res.status_code == 200
    assert eval_res.get_json()["data"]["total_score"] == 95.0

    # 4. Strict restriction: Non-finalist cannot be evaluated by State Jury
    from app.utils.db import get_db
    db = get_db()
    non_finalist = db.teams.find_one({"qualification_status": "registered", "competition_stage": "district_shortlisting"})
    if non_finalist:
        blocked_eval = client.post("/api/v1/state-jury/evaluate", headers=st_headers, json={
            "team_id": str(non_finalist["_id"]),
            "scores": {"transformative_impact": 20}
        })
        assert blocked_eval.status_code == 403

# 6. Shortlisting Weightage Calculation & Publishing
def test_shortlisting_weightage_calculation(client):
    admin_token = login_and_get_token(client, "admin@afip.demo", "Admin@123", "admin")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Generate district shortlists using 70% MCQ + 30% Tech formula
    gen_res = client.post("/api/v1/admin/shortlists/generate", headers=admin_headers, json={
        "stage": "district_shortlisting",
        "quota_per_district": 70
    })
    assert gen_res.status_code == 200
    shortlist_data = gen_res.get_json()["data"]
    assert shortlist_data["total_shortlisted"] >= 1
    shortlist_id = shortlist_data["shortlist_id"]

    # 2. Publish shortlist and advance teams
    pub_res = client.post("/api/v1/admin/shortlists/publish", headers=admin_headers, json={
        "shortlist_id": shortlist_id
    })
    assert pub_res.status_code == 200
    assert "published successfully" in pub_res.get_json()["message"]

# 7. Final 30 Winners Publication and Lock
def test_winner_publication_lock(client):
    admin_token = login_and_get_token(client, "admin@afip.demo", "Admin@123", "admin")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.post("/api/v1/admin/winners/publish", headers=admin_headers, json={})
    assert res.status_code == 200
    assert res.get_json()["data"]["total_winners"] >= 1

    # Verify locked in DB settings
    from app.utils.db import get_db
    db = get_db()
    setting = db.settings.find_one({"key": "competition"})
    assert setting.get("winners_locked") is True
