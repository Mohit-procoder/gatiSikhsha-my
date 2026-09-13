import pytest
from app import create_app
from app.utils.helpers import hash_password

@pytest.fixture
def client(monkeypatch):
    """
    Test client that patches the DB to mongomock and sets all required config,
    including JWT_SECRET_KEY to avoid the RuntimeError in create_access_token.
    """
    import mongomock
    from app.utils import db as db_module

    mock_client = mongomock.MongoClient()
    mock_db = mock_client.db
    monkeypatch.setattr(db_module, "get_db", lambda: mock_db)

    from seed.seed_data import seed_database
    seed_database()

    app = create_app()
    # Override critical settings after creation so JWT works in tests
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-only-secret-key-12345"

    return app.test_client()

def test_login_admin(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@afip.demo",
        "password": "Admin@123",
        "role": "admin"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@afip.demo"
    
    # Verify /me endpoint
    headers = {"Authorization": f"Bearer {data['token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.get_json()["data"]
    assert me_data["user"]["role"] == "admin"

def test_login_school(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "school@afip.demo",
        "password": "School@123",
        "role": "school"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "school"
    assert "school" in data
    assert data["school"]["school_name"] == "Brahmaputra Public School"
    assert data["school"]["udise_school_id"] == "18010100101"

def test_login_mentor(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "mentor@afip.demo",
        "password": "Mentor@123",
        "role": "mentor"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "mentor"
    assert "mentor" in data
    assert data["mentor"]["full_name"] == "Dr. Pranjal Borah"

def test_login_evaluator(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "evaluator@afip.demo",
        "password": "Evaluator@123",
        "role": "evaluator"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "evaluator"
    assert "evaluator" in data
    assert data["evaluator"]["domain_expertise"] == "Artificial Intelligence & Robotics"

def test_login_district(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "district@afip.demo",
        "password": "District@123",
        "role": "district"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "district"
    assert "district" in data
    assert data["district"]["district_name"] == "Kamrup"

def test_login_jury(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "jury@afip.demo",
        "password": "Jury@123",
        "role": "jury"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "jury"
    assert "jury" in data
    assert data["jury"]["role"] == "jury"

def test_login_state_jury(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "statejury@afip.demo",
        "password": "StateJury@123",
        "role": "state_jury"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "state_jury"
    assert "state_jury" in data
    assert data["state_jury"]["role"] == "state_jury"
    assert "panel" in data["state_jury"]

def test_login_student(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "student@afip.demo",
        "password": "Student@123",
        "role": "student"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "token" in data
    assert data["user"]["role"] == "student"
    assert "student" in data
    assert "team" in data

def test_role_mismatch_rejected(client):
    # Attempting to log in as 'admin' when account role is 'student'
    res = client.post("/api/v1/auth/login", json={
        "email": "student@afip.demo",
        "password": "Student@123",
        "role": "admin"
    })
    assert res.status_code == 403
    err = res.get_json()["error"]
    assert err["code"] == "ROLE_MISMATCH"

def test_invalid_password_rejected(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@afip.demo",
        "password": "WrongPassword123",
        "role": "admin"
    })
    assert res.status_code == 401
    err = res.get_json()["error"]
    assert err["code"] == "INVALID_CREDENTIALS"

def test_nonexistent_user_rejected(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "nobody@nonexistent.domain",
        "password": "SomePassword123"
    })
    assert res.status_code == 401
    err = res.get_json()["error"]
    assert err["code"] == "INVALID_CREDENTIALS"
