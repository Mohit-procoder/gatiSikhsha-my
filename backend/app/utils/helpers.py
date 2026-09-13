import re
import bcrypt
from flask import jsonify

DISTRICT_CODES = {
    "Baksa": "BAK",
    "Barpeta": "BAR",
    "Biswanath": "BIS",
    "Bongaigaon": "BON",
    "Cachar": "CAC",
    "Charaideo": "CHA",
    "Chirang": "CHI",
    "Darrang": "DAR",
    "Dhemaji": "DHE",
    "Dhubri": "DHU",
    "Dibrugarh": "DIB",
    "Dima Hasao": "DIM",
    "Goalpara": "GOA",
    "Golaghat": "GOL",
    "Hailakandi": "HAI",
    "Hojai": "HOJ",
    "Jorhat": "JOR",
    "Kamrup": "KAM",
    "Kamrup Metropolitan": "KAM",
    "Karbi Anglong": "KAR",
    "Karimganj": "KRG",
    "Kokrajhar": "KOK",
    "Lakhimpur": "LAK",
    "Majuli": "MAJ",
    "Morigaon": "MOR",
    "Nagaon": "NAG",
    "Nalbari": "NAL",
    "Sivasagar": "SIV",
    "Sonitpur": "SON",
    "South Salmara-Mankachar": "SOU",
    "Tinsukia": "TIN",
    "Udalguri": "UDA",
    "West Karbi Anglong": "WKA"
}

def get_district_code(district_name):
    if not district_name:
        return "GEN"
    for dist, code in DISTRICT_CODES.items():
        if dist.lower() == district_name.strip().lower():
            return code
    cleaned = re.sub(r"[^A-Z]", "", district_name.upper())
    return cleaned[:3] if len(cleaned) >= 3 else (cleaned + "XXX")[:3]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def generate_school_code(district: str, sequence_num: int) -> str:
    dist_code = get_district_code(district)
    return f"AFIP-AS-{dist_code}-{sequence_num:05d}"

def generate_school_id(sequence_num: int) -> str:
    return f"AFIP-SCH-{sequence_num:06d}"

def generate_user_id(role: str, sequence_num: int) -> str:
    role_prefix = (role or "USR")[:3].upper()
    return f"AFIP-{role_prefix}-{sequence_num:06d}"

def generate_team_code(sequence_num: int) -> str:
    return f"AFIP-T-{sequence_num:05d}"

def generate_mentor_id(sequence_num: int) -> str:
    return f"AFIP-MEN-{sequence_num:06d}"

def generate_student_id(sequence_num: int) -> str:
    return f"AFIP-STU-{sequence_num:06d}"

def generate_project_id(sequence_num: int) -> str:
    return f"AFIP-PRJ-{sequence_num:06d}"

def generate_district_id(district_name: str) -> str:
    dist_code = get_district_code(district_name)
    return f"AFIP-DIST-{dist_code}"

def generate_evaluation_id(sequence_num: int) -> str:
    return f"AFIP-EVAL-{sequence_num:06d}"

def generate_jury_id(sequence_num: int) -> str:
    return f"AFIP-JUR-{sequence_num:06d}"

def generate_state_jury_id(sequence_num: int) -> str:
    return f"AFIP-STJ-{sequence_num:06d}"

def generate_rubric_id(rubric_type: str, version: int = 1) -> str:
    r_type = (rubric_type or "RUBRIC").upper()
    return f"RUBRIC-{r_type}-V{version}"

def generate_hierarchical_team_id(district_name: str, school_code_or_seq: str, team_seq: int) -> str:
    dist_code = get_district_code(district_name)
    # Extract short school suffix or format
    cleaned_school = re.sub(r"[^A-Za-z0-9]", "", str(school_code_or_seq))
    school_tag = cleaned_school[-6:] if len(cleaned_school) >= 6 else (cleaned_school.upper() or "SCH001")
    return f"AFIP-{dist_code}-{school_tag}-T{team_seq:03d}"

def api_response(data=None, message="Success", status_code=200):
    payload = {
        "success": True,
        "message": message,
        "data": data
    }
    return jsonify(payload), status_code

def api_error(code="ERROR", message="An error occurred", fields=None, status_code=400):
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "fields": fields or {}
        }
    }
    return jsonify(payload), status_code
