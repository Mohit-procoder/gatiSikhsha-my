from datetime import datetime, timezone, timedelta
from app.utils.db import get_db
from app.utils.helpers import hash_password, generate_school_code, generate_team_code

def seed_database(app=None):
    db = get_db()

    # Check if admin already seeded
    if db.users.find_one({"email": "admin@afip.demo"}):
        print("[SEED] Database already populated with seed data.")
        return

    print("[SEED] Populating database with Assam Future Innovation Program initial data...")
    now = datetime.now(timezone.utc)

    # 1. Seed Demo Accounts for All Portal Roles
    admin_res = db.users.insert_one({
        "user_id": "AFIP-ADM-000001",
        "email": "admin@afip.demo",
        "phone": "+91 361 2237001",
        "password_hash": hash_password("Admin@123"),
        "role": "admin",
        "name": "State Mission Director (AFIP)",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    school_user = db.users.insert_one({
        "user_id": "AFIP-SCH-000001",
        "email": "school@afip.demo",
        "phone": "+91 361 2578890",
        "password_hash": hash_password("School@123"),
        "role": "school",
        "name": "Brahmaputra Public School",
        "status": "approved",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    mentor_user = db.users.insert_one({
        "user_id": "AFIP-MEN-000001",
        "email": "mentor@afip.demo",
        "phone": "+91 94350 11223",
        "password_hash": hash_password("Mentor@123"),
        "role": "mentor",
        "name": "Dr. Pranjal Borah",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    evaluator_user = db.users.insert_one({
        "user_id": "AFIP-EVA-000001",
        "email": "evaluator@afip.demo",
        "phone": "+91 98640 44556",
        "password_hash": hash_password("Evaluator@123"),
        "role": "evaluator",
        "name": "Dr. Ananya Sharma",
        "status": "approved",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    district_user = db.users.insert_one({
        "user_id": "AFIP-DIST-KAM",
        "email": "district@afip.demo",
        "phone": "+91 361 2234567",
        "password_hash": hash_password("District@123"),
        "role": "district",
        "district": "Kamrup",
        "name": "Kamrup District Innovation Officer",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    district_dib_user = db.users.insert_one({
        "user_id": "AFIP-DIST-DIB",
        "email": "district_dib@afip.demo",
        "phone": "+91 373 2320011",
        "password_hash": hash_password("District@123"),
        "role": "district",
        "district": "Dibrugarh",
        "name": "Dibrugarh District Innovation Officer",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    jury_user = db.users.insert_one({
        "user_id": "AFIP-JUR-000001",
        "email": "jury@afip.demo",
        "phone": "+91 94351 77889",
        "password_hash": hash_password("Jury@123"),
        "role": "jury",
        "name": "Prof. Hemanta Goswami",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    state_jury_user = db.users.insert_one({
        "user_id": "AFIP-STJ-000001",
        "email": "statejury@afip.demo",
        "phone": "+91 94352 99001",
        "password_hash": hash_password("StateJury@123"),
        "role": "state_jury",
        "name": "State Grand Jury Chair",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    student_user = db.users.insert_one({
        "user_id": "AFIP-STU-000001",
        "email": "student@afip.demo",
        "phone": "+91 99540 12345",
        "password_hash": hash_password("Student@123"),
        "role": "student",
        "name": "Aarav Das",
        "status": "active",
        "is_verified": True,
        "last_login": now,
        "created_at": now,
        "updated_at": now
    })

    # 2. Seed Primary Demo School
    primary_school = db.schools.insert_one({
        "user_id": school_user.inserted_id,
        "school_name": "Brahmaputra Public School",
        "udise_school_id": "18010100101",
        "udise_verification_status": "verified",
        "udise_verified_at": now,
        "udise_verified_by": str(admin_res.inserted_id),
        "udise_verification_source": "State Educational Department Registry",
        "school_code": "AFIP-AS-KAM-00001",
        "school_type": "Government Model School",
        "board": "SEBA",
        "address_line_1": "Jalukbari Educational Corridor",
        "address_line_2": "Near Gauhati University Campus",
        "district": "Kamrup",
        "state": "Assam",
        "pin_code": "781014",
        "official_email": "school@afip.demo",
        "official_phone": "+91 361 257 8890",
        "website": "https://brahmaputrapublicschool.assam.gov.in",
        "principal": {
            "name": "Prof. Bhaben Saikia",
            "email": "principal@brahmaputraps.assam.edu",
            "phone": "+91 94350 12345"
        },
        "coordinator": {
            "name": "Rupali Hazarika",
            "email": "rupali.h@brahmaputraps.assam.edu",
            "phone": "+91 98640 54321",
            "designation": "Senior STEM Mentor"
        },
        "status": "approved",
        "created_at": now,
        "updated_at": now
    })
    primary_school_id = primary_school.inserted_id

    # 3. Additional 9 Schools across Assam
    other_schools_data = [
        ("Kaziranga Valley Academy", "Golaghat", "GOL", "CBSE", "approved", "18020100202", "verified"),
        ("Dibrugarh Higher Secondary School", "Dibrugarh", "DIB", "SEBA", "approved", "18030100303", "verified"),
        ("Jorhat Technical High School", "Jorhat", "JOR", "SEBA", "approved", "18040100404", "verified"),
        ("Silchar Govt Boys Higher Secondary", "Cachar", "CAC", "SEBA", "approved", "18050100505", "verified"),
        ("Tezpur Collegiate School", "Sonitpur", "SON", "SEBA", "approved", "18060100606", "verified"),
        ("Nagaon Innovation School", "Nagaon", "NAG", "CBSE", "approved", "18070100707", "verified"),
        ("Sivasagar Heritage Vidyalaya", "Sivasagar", "SIV", "SEBA", "approved", "18080100808", "verified"),
        ("Barpeta Green Academy", "Barpeta", "BAR", "SEBA", "pending", "18090100909", "format_valid"),
        ("Tinsukia Modern Academy", "Tinsukia", "TIN", "CBSE", "pending", "18100101010", "needs_review")
    ]

    school_ids = [primary_school_id]
    for idx, (s_name, dist, d_code, board, s_status, s_udise, u_status) in enumerate(other_schools_data, start=2):
        s_user = db.users.insert_one({
            "email": f"school_{dist.lower()}@afip.demo",
            "password_hash": hash_password("School@123"),
            "role": "school",
            "name": s_name,
            "status": s_status,
            "created_at": now,
            "updated_at": now
        })
        sc_code = f"AFIP-AS-{d_code}-{idx:05d}" if s_status == "approved" else None
        sch_res = db.schools.insert_one({
            "user_id": s_user.inserted_id,
            "school_name": s_name,
            "udise_school_id": s_udise,
            "udise_verification_status": u_status,
            "udise_verified_at": now if u_status == "verified" else None,
            "udise_verified_by": str(admin_res.inserted_id) if u_status == "verified" else None,
            "udise_verification_source": "State Educational Department Registry",
            "school_code": sc_code,
            "school_type": "Government Model School",
            "board": board,
            "address_line_1": f"Station Road, {dist}",
            "address_line_2": f"Near DC Office, {dist}",
            "district": dist,
            "state": "Assam",
            "pin_code": f"78{idx:04d}",
            "official_email": f"school_{dist.lower()}@afip.demo",
            "official_phone": f"+91 94350 {idx:05d}",
            "principal": {"name": f"Headmaster of {dist}", "email": f"hm.{dist.lower()}@afip.demo", "phone": "+91 94351 00000"},
            "coordinator": {"name": f"Mentor {dist}", "email": f"mentor.{dist.lower()}@afip.demo", "phone": "+91 94352 00000", "designation": "Innovation Coordinator"},
            "status": s_status,
            "created_at": now,
            "updated_at": now
        })
        if s_status == "approved":
            school_ids.append(sch_res.inserted_id)

    # 4. Primary Evaluator Doc
    primary_evaluator = db.evaluators.insert_one({
        "user_id": evaluator_user.inserted_id,
        "full_name": "Dr. Ananya Sharma",
        "email": "evaluator@afip.demo",
        "phone": "+91 98641 99887",
        "organization": "Indian Institute of Technology Guwahati (IITG)",
        "designation": "Associate Professor, Department of Design & Robotics",
        "domain_expertise": "IoT, Environmental Sensors, AI & Robotics",
        "years_experience": 14,
        "bio": "Specialist in sustainable agro-robotics and river sensing networks for Northeast India.",
        "status": "approved",
        "created_at": now,
        "updated_at": now
    })
    evaluator_id = primary_evaluator.inserted_id

    # 4 more evaluators
    eval_experts = [
        ("Er. Pranjal Bora", "pranjal.bora@afip.demo", "CSIR-NEIST Jorhat", "Principal Scientist", "Smart Agriculture & Bio-energy"),
        ("Dr. Debajit Dutta", "debajit.dutta@afip.demo", "Assam Agricultural University", "Professor", "Tea Garden Technology"),
        ("Prof. Monisha Baruah", "monisha.b@afip.demo", "Gauhati University", "Head of Dept, IT", "AI & Machine Learning"),
        ("Dr. Nilutpal Sarma", "nilutpal.s@afip.demo", "IIT Delhi / IHFC", "Lead Research Engineer", "Robotics & Automation")
    ]
    evaluator_ids = [evaluator_id]
    for ename, eemail, eorg, edesig, eexp in eval_experts:
        eu = db.users.insert_one({
            "email": eemail,
            "password_hash": hash_password("Evaluator@123"),
            "role": "evaluator",
            "name": ename,
            "status": "approved",
            "created_at": now,
            "updated_at": now
        })
        edoc = db.evaluators.insert_one({
            "user_id": eu.inserted_id,
            "full_name": ename,
            "email": eemail,
            "phone": "+91 94355 12345",
            "organization": eorg,
            "designation": edesig,
            "domain_expertise": eexp,
            "years_experience": 10,
            "bio": f"Expert in {eexp} supporting student innovation across Assam.",
            "status": "approved",
            "created_at": now,
            "updated_at": now
        })
        evaluator_ids.append(edoc.inserted_id)

    # 4b. Seed Primary Mentor Document for Dr. Pranjal Borah
    primary_mentor = db.mentors.insert_one({
        "user_id": mentor_user.inserted_id,
        "mentor_custom_id": "AFIP-MEN-000001",
        "school_id": primary_school_id,
        "school_name": "Brahmaputra Public School",
        "district": "Kamrup",
        "full_name": "Dr. Pranjal Borah",
        "email": "mentor@afip.demo",
        "phone": "+91 94350 11223",
        "designation": "Senior STEM Faculty & Robotics Club Lead",
        "status": "active",
        "created_at": now,
        "updated_at": now
    })
    primary_mentor_id = primary_mentor.inserted_id

    # 5. Primary Student Team: Brahmaputra Innovators
    primary_team = db.teams.insert_one({
        "team_custom_id": "AFIP-KAM-SCH000001-T001",
        "team_code": "AFIP-T-00001",
        "team_name": "Brahmaputra Innovators",
        "school_id": primary_school_id,
        "school_name": "Brahmaputra Public School",
        "district": "Kamrup",
        "category": "IX-X",
        "mentor_id": primary_mentor_id,
        "mentor_name": "Dr. Pranjal Borah",
        "status": "active",
        "competition_stage": "district_shortlisting",
        "qualification_status": "shortlisted",
        "project_id": None,
        "quiz_score": 28,
        "evaluation_score": 92.5,
        "created_at": now,
        "updated_at": now
    })
    primary_team_id = primary_team.inserted_id

    # Link primary student
    db.students.insert_one({
        "student_custom_id": "AFIP-STU-000001",
        "user_id": student_user.inserted_id,
        "team_id": primary_team_id,
        "school_id": primary_school_id,
        "district": "Kamrup",
        "full_name": "Aarav Das",
        "email": "student@afip.demo",
        "grade": "Class X",
        "phone": "+91 98642 11223",
        "is_leader": True,
        "created_at": now,
        "updated_at": now
    })

    # Additional teammates for Aarav
    teammates = [
        ("Priyanjali Gogoi", "priyanjali.g@afip.demo", "Class X"),
        ("Tanmoy Medhi", "tanmoy.m@afip.demo", "Class IX"),
        ("Simanta Borah", "simanta.b@afip.demo", "Class X")
    ]
    for idx_tm, (t_name, t_email, t_grade) in enumerate(teammates, start=2):
        t_user = db.users.insert_one({
            "user_id": f"AFIP-STU-{idx_tm:06d}",
            "email": t_email,
            "password_hash": hash_password("Student@123"),
            "role": "student",
            "name": t_name,
            "district": "Kamrup",
            "status": "active",
            "created_at": now,
            "updated_at": now
        })
        db.students.insert_one({
            "student_custom_id": f"AFIP-STU-{idx_tm:06d}",
            "user_id": t_user.inserted_id,
            "team_id": primary_team_id,
            "school_id": primary_school_id,
            "district": "Kamrup",
            "full_name": t_name,
            "email": t_email,
            "grade": t_grade,
            "is_leader": False,
            "created_at": now,
            "updated_at": now
        })

    # 6. Primary Project Submission for Brahmaputra Innovators
    primary_project = db.projects.insert_one({
        "project_custom_id": "AFIP-PRJ-000001",
        "title": "Smart Brahmaputra Flood Early Warning & Community Alert System",
        "team_id": primary_team_id,
        "school_id": primary_school_id,
        "district": "Kamrup",
        "category": "IX-X",
        "theme": "Flood Resilience",
        "problem_statement": "Annual Brahmaputra river surges frequently displace riverside agricultural communities and livestock in Assam due to the absence of hyper-local, low-cost water level telemetry.",
        "problem_context": "During monsoons, river levels rise rapidly overnight. Existing gauge stations are widely spaced and rely on manual telephoning, giving families little reaction time.",
        "proposed_solution": "A network of solar-powered ultrasonic river level beacons placed along flood-prone riverbanks. The beacons broadcast alerts via sub-GHz radio and GSM SMS directly to village panchayat loudspeakers and resident phones.",
        "innovation_novelty": "Dual telemetry fallback with mesh radio that operates even during cellular tower power cut-offs, coupled with a solar battery and water-activated float switch.",
        "target_beneficiaries": "Riverside farming families, local fishermen, and disaster management volunteers across Kamrup and Barpeta districts.",
        "technology_used": "ESP32 microcontrollers, Ultrasonic level sensors, LoRa mesh radio, Solar LiFePO4 batteries, Flutter web alert dashboard.",
        "expected_impact": "Provides up to 4 hours of early warning before embankment overflows, safeguarding livestock and household property.",
        "implementation_plan": "Field trials planned across 5 riverine villages along Kamrup rural riverbanks in partnership with local disaster mitigation committees.",
        "prototype_status": "Working Hardware Prototype",
        "repo_link": "https://github.com/afip-student-demo/brahmaputra-flood-sentinel",
        "demo_link": "https://flood-sentinel.afip.demo.assam.gov.in",
        "video_link": "https://youtube.com/watch?v=demo_brahmaputra_flood",
        "presentation_link": "https://slides.afip.demo.assam.gov.in/brahmaputra-sentinel",
        "status": "evaluated",
        "is_showcased": True,
        "jury_remarks": [
            {
                "remark_id": "REM-001",
                "author_id": str(evaluator_id),
                "author_role": "evaluator",
                "author_name": "Dr. Ananya Sharma",
                "remark": "Outstanding practical prototype addressing seasonal floods in Brahmaputra basin. Recommended for state advancement.",
                "visibility": "RELEASED",
                "created_at": now - timedelta(days=1)
            },
            {
                "remark_id": "REM-002",
                "author_id": str(evaluator_id),
                "author_role": "evaluator",
                "author_name": "Dr. Ananya Sharma",
                "remark": "Internal jury note: Confirm battery housing IP67 sealing test results before state jury demonstration.",
                "visibility": "INTERNAL",
                "created_at": now - timedelta(days=1)
            }
        ],
        "created_at": now - timedelta(days=5),
        "updated_at": now
    })
    primary_project_id = primary_project.inserted_id
    db.teams.update_one({"_id": primary_team_id}, {"$set": {"project_id": primary_project_id}})

    # 7. Assign Primary Project to Demo Evaluator Dr. Ananya Sharma
    primary_assignment = db.evaluation_assignments.insert_one({
        "project_id": primary_project_id,
        "evaluator_id": evaluator_id,
        "assigned_by": admin_res.inserted_id,
        "assigned_at": now - timedelta(days=3),
        "deadline": "2026-12-20T23:59:59Z",
        "status": "completed",
        "evaluated_at": now - timedelta(days=1)
    })

    # Record completed evaluation
    db.evaluations.insert_one({
        "assignment_id": primary_assignment.inserted_id,
        "project_id": primary_project_id,
        "evaluator_id": evaluator_id,
        "evaluator_name": "Dr. Ananya Sharma",
        "scores": {
            "innovation": 19.0,
            "problem_understanding": 14.5,
            "technical_implementation": 18.5,
            "feasibility": 14.0,
            "social_impact": 14.5,
            "scalability": 8.5,
            "presentation": 4.5,
            "total": 93.5
        },
        "strengths": "Exceptional practical alignment with Assam's immediate seasonal flooding crises. The hardware prototype demonstrates mature engineering and thoughtful LoRa fallback during power failures.",
        "areas_for_improvement": "Explore waterproof bio-resin enclosures to ensure long-term durability during rapid silting.",
        "comments": "Outstanding submission from Class IX-X students. Highly deserving of zonal advancement.",
        "recommendation": "Strongly Recommended for Zonal Hackathon",
        "status": "submitted",
        "is_unlocked": False,
        "created_at": now - timedelta(days=1),
        "updated_at": now - timedelta(days=1)
    })

    # 8. Seed 19 More Teams, Projects, and Evaluations across Categories
    project_catalog = [
        ("Solar Tea Leaf Dehydrator with Moisture Sensors", "Tea Technology", "VI-VIII", 88.0),
        ("Kaziranga Rhino Acoustic Perimeter Detector", "Biodiversity", "IX-X", 91.0),
        ("Zero-Waste Eri Silk Herbal Dye Wastewater Filter", "Sustainable Technology", "XI-XII", 94.5),
        ("Majuli Island Solar Telemedicine Riverboat Dispatch", "Healthcare", "XI-XII", 95.0),
        ("Bamboo Waste Bio-composite Construction Tiles", "Rural Development", "IX-X", 87.5),
        ("Smart Automated Nursery for Assam Black Pepper", "Smart Agriculture", "VI-VIII", 84.0),
        ("Assam Heritage Bodo & Mising Digital Storyteller", "Cultural Preservation", "VI-VIII", 86.5),
        ("Low-Cost Plastic Pyrolysis Fuel Distiller for Schools", "Waste Management", "XI-XII", 89.0),
        ("Smart Flood-Resistant Floating Vegetable Beds", "Flood Resilience", "IX-X", 90.5),
        ("Solar-Powered Cold Storage for Dibrugarh Orange Farmers", "Smart Agriculture", "XI-XII", 92.0),
        ("AI Pest Scout for Organic Tea Smallholders", "Tea Technology", "IX-X", 89.5),
        ("Accessible Audio Reader for Assamese Visually Impaired", "Accessibility", "VI-VIII", 87.0),
        ("Electric River Ferry Energy Optimizer", "Transportation", "XI-XII", 93.0),
        ("Rainwater Harvesting & Micro-Turbine in Dima Hasao", "Climate Adaptation", "IX-X", 88.5),
        ("Eco-Friendly Water Hyacinth Paper Production Kit", "Sustainable Technology", "VI-VIII", 85.5),
        ("Smart Embankment Soil Moisture Warning Beacon", "Flood Resilience", "IX-X", 91.5),
        ("Bio-Enzyme Organic Pest Repellent from Local Herbs", "Smart Agriculture", "VI-VIII", 86.0),
        ("Solar Powered IoT Oxygenation Unit for Fish Ponds", "Rural Development", "IX-X", 90.0),
        ("Automated Tea Leaf Quality Classifier with Mobile Camera", "Tea Technology", "XI-XII", 94.0)
    ]

    for idx, (p_title, theme, cat, eval_score) in enumerate(project_catalog, start=2):
        sch_id = school_ids[idx % len(school_ids)]
        sch_doc = db.schools.find_one({"_id": sch_id})
        sch_dist = sch_doc.get("district", "Kamrup") if sch_doc else "Kamrup"
        sch_name = sch_doc.get("school_name", "") if sch_doc else ""
        t_code = f"AFIP-T-{idx:05d}"
        t_custom = f"AFIP-{sch_dist[:3].upper()}-SCH{idx:03d}-T001"
        t_name = f"{theme.split()[0]} Innovators {idx}"

        t_res = db.teams.insert_one({
            "team_custom_id": t_custom,
            "team_code": t_code,
            "team_name": t_name,
            "school_id": sch_id,
            "school_name": sch_name,
            "district": sch_dist,
            "category": cat,
            "mentor_name": f"STEM Mentor {idx}",
            "status": "active",
            "competition_stage": "district_shortlisting",
            "qualification_status": "shortlisted" if eval_score >= 90 else "qualified",
            "project_id": None,
            "quiz_score": int(eval_score * 0.3),
            "evaluation_score": eval_score,
            "created_at": now - timedelta(days=idx),
            "updated_at": now
        })
        t_id = t_res.inserted_id

        # Leader student
        l_user = db.users.insert_one({
            "email": f"student_{idx}@afip.demo",
            "password_hash": hash_password("Student@123"),
            "role": "student",
            "name": f"Student Leader {idx}",
            "status": "active",
            "created_at": now,
            "updated_at": now
        })
        db.students.insert_one({
            "user_id": l_user.inserted_id,
            "team_id": t_id,
            "school_id": sch_id,
            "full_name": f"Student Leader {idx}",
            "email": f"student_{idx}@afip.demo",
            "grade": f"Class {cat.split('-')[0]}",
            "is_leader": True,
            "created_at": now
        })

        # Insert project
        pr_res = db.projects.insert_one({
            "title": p_title,
            "team_id": t_id,
            "school_id": sch_id,
            "category": cat,
            "theme": theme,
            "problem_statement": f"Addressing critical challenges in {theme.lower()} within Assam communities.",
            "problem_context": "Local rural and semi-urban communities require robust, low-cost and community-driven technology.",
            "proposed_solution": f"A scalable, energy-efficient solution utilizing smart sensors and Assam local materials for {p_title}.",
            "innovation_novelty": "Designed specifically for Assam climate resilience and local affordability.",
            "target_beneficiaries": "Rural families, youth, cooperatives, and district institutions.",
            "technology_used": "Microcontrollers, Sensors, Solar Power, Mobile Web UI.",
            "expected_impact": "Substantially improves safety, productivity, and sustainable development.",
            "prototype_status": "Working Prototype",
            "status": "evaluated" if idx <= 10 else "submitted",
            "is_showcased": True if idx <= 8 else False,
            "created_at": now - timedelta(days=idx),
            "updated_at": now
        })
        db.teams.update_one({"_id": t_id}, {"$set": {"project_id": pr_res.inserted_id}})

        # Assign second project to demo evaluator as pending evaluation
        if idx == 2:
            db.evaluation_assignments.insert_one({
                "project_id": pr_res.inserted_id,
                "evaluator_id": evaluator_id,
                "assigned_by": admin_res.inserted_id,
                "assigned_at": now,
                "deadline": "2026-12-20T23:59:59Z",
                "status": "assigned"
            })

    # 9. Seed Knowledge Assessment Quiz with 10 High Quality STEM & Assam Questions
    quiz_doc = {
        "title": "AFIP Knowledge Assessment & Innovation Fundamentals",
        "description": "State-wide online assessment testing STEM fundamentals, design thinking principles, Assam regional problem solving, and technological innovation.",
        "category": "IX-X",
        "is_active": True,
        "duration_minutes": 25,
        "total_marks": 20,
        "start_time": now - timedelta(days=1), # Currently LIVE for demo
        "end_time": now + timedelta(days=30),
        "results_published": True,
        "questions": [
            {
                "id": "q1",
                "question_text": "In Human-Centered Design Thinking, what is the critical first stage before building a prototype?",
                "options": ["Testing with customers", "Empathizing and understanding the problem", "Writing software code", "Purchasing hardware tools"],
                "correct_answer": 1,
                "marks": 2
            },
            {
                "id": "q2",
                "question_text": "Which low-power wireless protocol is best suited for transmitting flood sensor data over 5-10 kilometers across rural Assam without cellular coverage?",
                "options": ["Wi-Fi 6", "Bluetooth Low Energy (BLE)", "LoRa / LoRaWAN", "NFC"],
                "correct_answer": 2,
                "marks": 2
            },
            {
                "id": "q3",
                "question_text": "Why is solar photovoltaic energy combined with LiFePO4 batteries especially suitable for flood telemetry stations in Assam?",
                "options": ["High thermal stability and long lifecycle in humid environments", "Batteries require daily manual water refilling", "They dissolve in river water safely", "They do not use electric current"],
                "correct_answer": 0,
                "marks": 2
            },
            {
                "id": "q4",
                "question_text": "What is the primary natural fiber extracted from silk caterpillars fed on castor and kesseru plants in Assam known for thermal resilience?",
                "options": ["Muga Silk", "Eri Silk", "Tussar Silk", "Mulberry Silk"],
                "correct_answer": 1,
                "marks": 2
            },
            {
                "id": "q5",
                "question_text": "When designing an ultrasonic sensor to monitor river level changes, which environmental factor requires temperature compensation for speed of sound?",
                "options": ["Ambient air temperature", "River water color", "Atmospheric magnetic field", "Moon phases"],
                "correct_answer": 0,
                "marks": 2
            },
            {
                "id": "q6",
                "question_text": "In the engineering problem-solving cycle, what is the term for a rapid, preliminary physical version of a product created to test a concept?",
                "options": ["Final Mass Production Unit", "Prototype", "Patent Application", "White Paper"],
                "correct_answer": 1,
                "marks": 2
            },
            {
                "id": "q7",
                "question_text": "Which sensor type would you deploy in a tea garden to alert managers to early moisture stress and prevent crop dehydration?",
                "options": ["Capacitive Soil Moisture Sensor", "Barometer", "Piezoelectric Vibration Sensor", "Gyroscope"],
                "correct_answer": 0,
                "marks": 2
            },
            {
                "id": "q8",
                "question_text": "What is the key benefit of edge computing (processing data on microcontrollers) in remote riverside communities?",
                "options": ["Instant local anomaly detection without relying on internet bandwidth", "Consumes 100 times more battery", "Requires constant satellite uplink", "Eliminates need for any power source"],
                "correct_answer": 0,
                "marks": 2
            },
            {
                "id": "q9",
                "question_text": "Which river basin forms the primary hydrological lifeblood and major annual flood challenge across Assam?",
                "options": ["Ganga", "Brahmaputra", "Godavari", "Yamuna"],
                "correct_answer": 1,
                "marks": 2
            },
            {
                "id": "q10",
                "question_text": "When submitting a technical project, what defines the 'Target Beneficiary'?",
                "options": ["The team members who built the gadget", "The specific community, workers, or ecology directly aided by the solution", "The software vendor providing licenses", "The delivery courier service"],
                "correct_answer": 1,
                "marks": 2
            }
        ],
        "created_at": now,
        "updated_at": now
    }
    db.quizzes.insert_one(quiz_doc)

    # 10. Seed Active Rubrics for Technical, Jury & State Jury
    rubrics_data = [
        {
            "rubric_type": "TECHNICAL",
            "title": "Technical Innovation & Feasibility Rubric",
            "total_max": 100,
            "is_active": True,
            "criteria": [
                {"key": "innovation", "label": "Innovation & Originality", "max": 20, "desc": "Novelty of approach, uniqueness vs standard hobby kits."},
                {"key": "problem_understanding", "label": "Problem Understanding & Context", "max": 15, "desc": "Clarity of the specific Assam problem and beneficiary empathy."},
                {"key": "technical_implementation", "label": "Technical Implementation", "max": 20, "desc": "Hardware craft, software robustness, sensor integration."},
                {"key": "feasibility", "label": "Feasibility & Workability", "max": 15, "desc": "Viability under real Assam field conditions (flooding, power outages)."},
                {"key": "social_impact", "label": "Social & Regional Impact", "max": 15, "desc": "Potential to protect lives, boost livelihoods or environment."},
                {"key": "scalability", "label": "Scalability & Replication", "max": 10, "desc": "Ease of expanding across other Assam blocks and districts."},
                {"key": "presentation", "label": "Presentation & Documentation", "max": 5, "desc": "Clarity of explanation, structure of demo & materials."}
            ],
            "created_at": now,
            "updated_at": now
        },
        {
            "rubric_type": "JURY",
            "title": "Zonal Jury Evaluation Rubric",
            "total_max": 100,
            "is_active": True,
            "criteria": [
                {"key": "innovation_originality", "label": "Innovation & Originality", "max": 25, "desc": "Originality of concept, problem novelty, out-of-the-box thinking."},
                {"key": "regional_impact", "label": "Community & Regional Impact", "max": 20, "desc": "Significance of impact on Assam communities, ecology, or livelihoods."},
                {"key": "technical_feasibility", "label": "Technical Feasibility & Viability", "max": 20, "desc": "Practicality of prototype execution, durability in Assam field environments."},
                {"key": "presentation_pitch", "label": "Student Presentation & Demonstration", "max": 15, "desc": "Pitch clarity, demonstration quality, articulate Q&A defense."},
                {"key": "team_dynamics", "label": "Team Synergy & Inclusive Collaboration", "max": 10, "desc": "Evidence of genuine student teamwork, division of labor, shared leadership."},
                {"key": "scalability_market", "label": "Scalability & Deployment Potential", "max": 10, "desc": "Potential to deploy at district/state scale or commercialize."}
            ],
            "created_at": now,
            "updated_at": now
        },
        {
            "rubric_type": "STATE_JURY",
            "title": "State Grand Finale Jury Rubric",
            "total_max": 100,
            "is_active": True,
            "criteria": [
                {"key": "transformative_impact", "label": "Transformative State & Social Impact", "max": 25, "desc": "Potential to transform Assam agriculture, flood mitigation, tea industry, or public health."},
                {"key": "innovation_breakthrough", "label": "Breakthrough Innovation & IP Potential", "max": 25, "desc": "Original technological novelty, patentability, unique hardware/software architecture."},
                {"key": "execution_excellence", "label": "Prototype Maturity & Execution Rigor", "max": 20, "desc": "Functional robustness, real-world stress test performance, clean build."},
                {"key": "defense_articulation", "label": "Grand Jury Defense & Q&A Mastery", "max": 15, "desc": "Command over technology, handling rigorous technical cross-examination."},
                {"key": "state_scalability", "label": "Commercialization & State Deployment Road", "max": 15, "desc": "Viable deployment roadmap across all 35 Assam districts."}
            ],
            "created_at": now,
            "updated_at": now
        }
    ]
    for rdoc in rubrics_data:
        db.rubrics.update_one({"rubric_type": rdoc["rubric_type"]}, {"$set": rdoc}, upsert=True)

    # 11. Seed Jury Assignment for Demo Jury Member Prof. Hemanta Goswami
    db.evaluation_assignments.insert_one({
        "team_id": primary_team_id,
        "project_id": primary_project_id,
        "evaluator_id": jury_user.inserted_id,
        "assignment_type": "JURY",
        "assigned_by": admin_res.inserted_id,
        "assigned_at": now - timedelta(days=2),
        "deadline": "2026-12-25T23:59:59Z",
        "status": "assigned",
        "conflict_status": "no_conflict"
    })

    # 12. Mark Top 4 teams as State Finalists for State Grand Jury
    db.teams.update_many(
        {"evaluation_score": {"$gte": 93.0}},
        {"$set": {
            "qualification_status": "finalist",
            "competition_stage": "state_finale"
        }}
    )

    # 13. Seed Competition Stage Settings & Leaderboard Settings
    db.settings.update_one(
        {"key": "competition"},
        {"$set": {
            "current_stage": "district_shortlisting",
            "leaderboard_public": True,
            "program_name": "Assam Future Innovation Program",
            "updated_at": now
        }},
        upsert=True
    )

    # 14. Seed Initial Notifications
    notifications_data = [
        ("all", None, "Welcome to AFIP 2026", "State-wide innovation registrations are now open for Classes VI-XII across all 33 districts of Assam.", "announcement"),
        ("school", school_user.inserted_id, "School Registration Approved", "Brahmaputra Public School has been officially registered with School Code AFIP-AS-KAM-00001.", "approval"),
        ("student", student_user.inserted_id, "Assessment Portal Live", "The 20-Hour Bootcamp Knowledge Assessment is now open for your team.", "quiz"),
        ("evaluator", evaluator_user.inserted_id, "Assigned for Evaluation", "You have 2 student project submissions queued in your review panel.", "assignment"),
        ("jury", jury_user.inserted_id, "New Jury Review Assigned", "You have been assigned to evaluate Brahmaputra Innovators in the Zonal Jury round.", "assignment"),
        ("state_jury", state_jury_user.inserted_id, "State Grand Finalists Ready", "Top qualified state finalists are queued in your Grand Jury panel.", "assignment")
    ]
    for role, rec_id, title, msg, n_type in notifications_data:
        db.notifications.insert_one({
            "recipient_role": role,
            "recipient_id": rec_id,
            "title": title,
            "message": msg,
            "type": n_type,
            "is_read": False,
            "created_at": now
        })

    print("[SEED] Successfully seeded all accounts, schools, teams, projects, rubrics, jury assignments, quizzes, and stages!")
