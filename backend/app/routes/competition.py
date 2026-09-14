from datetime import datetime
from flask import Blueprint, request
from app.utils.db import get_db
from app.utils.helpers import api_response, api_error

competition_bp = Blueprint("competition", __name__, url_prefix="/api/v1/competition")

DEFAULT_ROUNDS = [
    {
        "id": "school_registration",
        "step": "01",
        "name": "School Registration",
        "dates": "17th - 30th Sep, 2026",
        "desc": "State-wide school onboarding across all 33 districts of Assam.",
        "category": "Registration"
    },
    {
        "id": "mentor_onboarding",
        "step": "02",
        "name": "Mentor Onboarding",
        "dates": "1st - 10th Oct, 2026",
        "desc": "Faculty and innovation teacher onboarding & orientation.",
        "category": "Orientation"
    },
    {
        "id": "team_formation",
        "step": "03",
        "name": "Team Formation",
        "dates": "10th - 15th Oct, 2026",
        "desc": "Mentor-led squad creation with student dossiers & photos.",
        "category": "Squad Formation"
    },
    {
        "id": "online_bootcamp",
        "step": "04",
        "name": "20h Online Bootcamp",
        "dates": "15th - 22nd Oct, 2026",
        "desc": "Self-paced foundation learning in design thinking & STEM.",
        "category": "Foundation Learning"
    },
    {
        "id": "mcq_assessment",
        "step": "05",
        "name": "MCQ Assessment",
        "dates": "23rd - 30th Oct, 2026",
        "desc": "Standardized benchmark assessment across registered teams.",
        "category": "Benchmark"
    },
    {
        "id": "top_1000",
        "step": "06",
        "name": "Top 1,000 Shortlist",
        "dates": "1st - 7th Nov, 2026",
        "desc": "District-level shortlisting of high-potential innovator squads.",
        "category": "District Shortlist"
    },
    {
        "id": "advanced_bootcamp",
        "step": "07",
        "name": "Advanced Bootcamp",
        "dates": "9th Nov - 6th Dec, 2026",
        "desc": "Specialized training in IoT, robotics, embedded systems & coding.",
        "category": "Advance Learning"
    },
    {
        "id": "coding_challenge",
        "step": "08",
        "name": "Coding Challenge",
        "dates": "14th - 19th Dec, 2026",
        "desc": "Technical evaluation & algorithmic problem solving challenge.",
        "category": "Technical Challenge"
    },
    {
        "id": "shortlist_198",
        "step": "09",
        "name": "198 Teams Shortlist",
        "dates": "21st - 26th Dec, 2026",
        "desc": "Zonal jury assessment and technical scoring panel.",
        "category": "Zonal Selection"
    },
    {
        "id": "zonal_hackathon",
        "step": "10",
        "name": "Zonal 48h Hackathon",
        "dates": "27th - 30th Dec, 2026",
        "desc": "Regional 48-hour prototype demonstration & pitch defense.",
        "category": "Zonal Hackathon"
    },
    {
        "id": "finalist_preparation",
        "step": "11",
        "name": "Finalist Prep",
        "dates": "1st - 3rd Jan, 2027",
        "desc": "Finalist squad boot-camp & prototype hardening.",
        "category": "Finalist Prep"
    },
    {
        "id": "state_final",
        "step": "12",
        "name": "State Final",
        "dates": "4th - 8th Jan, 2027",
        "desc": "5-Day State Grand Finale, State Hackathon & IIT Delhi Incubation.",
        "category": "Grand Finale"
    }
]

# In-memory cache for fallback when DB is temporarily reconnecting
_CACHED_CURRENT_STAGE = "school_registration"
_CACHED_ROUNDS = [dict(r) for r in DEFAULT_ROUNDS]

def get_or_initialize_competition_rounds(db=None):
    global _CACHED_CURRENT_STAGE, _CACHED_ROUNDS
    rounds_list = _CACHED_ROUNDS
    current_stage = _CACHED_CURRENT_STAGE

    if db is not None:
        try:
            settings = db.settings.find_one({"key": "competition"})
            if not settings:
                settings = {
                    "key": "competition",
                    "current_stage": "school_registration",
                    "rounds": DEFAULT_ROUNDS,
                    "leaderboard_public": True,
                    "updated_at": datetime.utcnow()
                }
                db.settings.insert_one(settings)
            elif "rounds" not in settings or not settings["rounds"]:
                db.settings.update_one(
                    {"key": "competition"},
                    {"$set": {"rounds": DEFAULT_ROUNDS, "updated_at": datetime.utcnow()}},
                    upsert=True
                )
                settings["rounds"] = DEFAULT_ROUNDS

            current_stage = settings.get("current_stage", "school_registration")
            rounds_list = settings.get("rounds", DEFAULT_ROUNDS)
            _CACHED_CURRENT_STAGE = current_stage
            _CACHED_ROUNDS = rounds_list
        except Exception as e:
            # Graceful fallback during DB reconnects
            pass

    # Find index of current_stage
    active_idx = 0
    for idx, r in enumerate(rounds_list):
        if r.get("id") == current_stage:
            active_idx = idx
            break

    annotated_rounds = []
    active_round_obj = None

    for idx, r in enumerate(rounds_list):
        round_copy = dict(r)
        if idx < active_idx:
            round_copy["status"] = "completed"
        elif idx == active_idx:
            round_copy["status"] = "active"
            active_round_obj = round_copy
        else:
            round_copy["status"] = "upcoming"
        annotated_rounds.append(round_copy)

    return annotated_rounds, current_stage, active_round_obj

@competition_bp.route("/rounds", methods=["GET"], strict_slashes=False)
def get_competition_rounds():
    """Public endpoint to fetch competition rounds, active stage, and dates."""
    try:
        db = get_db()
    except Exception:
        db = None
    annotated_rounds, current_stage, active_round_obj = get_or_initialize_competition_rounds(db)

    return api_response(data={
        "rounds": annotated_rounds,
        "current_stage": current_stage,
        "active_round_id": current_stage,
        "active_round": active_round_obj
    })

@competition_bp.route("/rounds/dates", methods=["PATCH", "POST", "PUT"], strict_slashes=False)
def update_round_dates_public():
    """Mirror endpoint for updating round dates."""
    global _CACHED_ROUNDS
    try:
        db = get_db()
    except Exception:
        db = None

    data = request.get_json() or {}
    round_id = data.get("round_id")
    new_dates = data.get("dates")

    if not round_id or not new_dates:
        return api_error("VALIDATION_ERROR", "Both 'round_id' and 'dates' are required.", status_code=400)

    get_or_initialize_competition_rounds(db)
    raw_rounds = _CACHED_ROUNDS

    round_found = False
    updated_name = round_id
    for r in raw_rounds:
        if r.get("id") == round_id:
            r["dates"] = str(new_dates).strip()
            if "name" in data and data["name"]:
                r["name"] = str(data["name"]).strip()
            updated_name = r.get("name", round_id)
            round_found = True
            break

    if not round_found:
        return api_error("NOT_FOUND", f"Round '{round_id}' not found.", status_code=404)

    if db is not None:
        try:
            db.settings.update_one(
                {"key": "competition"},
                {"$set": {"rounds": raw_rounds, "updated_at": datetime.utcnow()}},
                upsert=True
            )
        except Exception:
            pass

    annotated_rounds, current_stage, active_round = get_or_initialize_competition_rounds(db)
    return api_response(
        message=f"Dates for '{updated_name}' successfully updated to '{new_dates}'.",
        data={
            "rounds": annotated_rounds,
            "current_stage": current_stage,
            "active_round_id": current_stage,
            "active_round": active_round
        }
    )

@competition_bp.route("/rounds/active", methods=["PATCH", "POST", "PUT"], strict_slashes=False)
def alter_active_round_public():
    """Mirror endpoint for altering active round."""
    global _CACHED_CURRENT_STAGE
    try:
        db = get_db()
    except Exception:
        db = None

    data = request.get_json() or {}
    active_round_id = data.get("active_round_id") or data.get("round_id") or data.get("stage")

    if not active_round_id:
        return api_error("VALIDATION_ERROR", "Field 'active_round_id' is required.", status_code=400)

    annotated_rounds, _, _ = get_or_initialize_competition_rounds(db)
    valid_ids = [r["id"] for r in annotated_rounds]
    if active_round_id not in valid_ids:
        return api_error("VALIDATION_ERROR", f"Round ID must be one of: {valid_ids}", status_code=400)

    _CACHED_CURRENT_STAGE = active_round_id
    if db is not None:
        try:
            db.settings.update_one(
                {"key": "competition"},
                {"$set": {"current_stage": active_round_id, "updated_at": datetime.utcnow()}},
                upsert=True
            )
        except Exception:
            pass

    annotated_rounds, current_stage, active_round = get_or_initialize_competition_rounds(db)
    return api_response(
        message=f"Active competition round successfully set to '{active_round.get('name', active_round_id)}'.",
        data={
            "rounds": annotated_rounds,
            "current_stage": current_stage,
            "active_round_id": current_stage,
            "active_round": active_round
        }
    )

