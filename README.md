# Assam Future Innovation Program (AFIP) — Student Innovation Challenge

An end-to-end, production-grade full-stack web application built for the **Assam Future Innovation Program**, organized jointly by the **Technology Innovation Hub of IIT Delhi (IHFC)** and **Samagra Shiksha, Assam** for school students from **Classes VI to XII**.

---

## Key Features

1. **Scroll-Driven Assam Journey Animation**:
   - **Left**: Tasteful illustration of an Assamese tea garden worker carrying a traditional tea basket on her back with natural atmospheric sway and parallax.
   - **Center**: A natural winding pathway through Assam connecting all 12 competition stages, with a student boy traveler whose position dynamically tracks scroll progress.
   - **Right**: Rich Assam landscape composition (tea terraces, hills, bamboo groves, tropical leaves) extending past the viewport edge with multi-depth parallax.
   - **12 Interactive Checkpoints**: Milestone cards appearing intelligently along the pathway as the student journeys through the competition.
2. **Multi-Role Authentication & School Code System**:
   - Role-based access control for **Administrator**, **School**, **Student / Team**, and **Evaluator**.
   - Unique public School Code generation upon Admin approval (e.g. `AFIP-AS-KAM-00001`), indexed uniquely in MongoDB.
   - Team Codes (e.g. `AFIP-T-00001`) immutably linked to school ObjectIds.
3. **Four Functional Dashboards**:
   - **School Dashboard (`/school/dashboard`)**: Track enrolled teams, create teams, add mentors, and monitor milestones.
   - **Student Dashboard (`/student/dashboard`)**: Team member roster, server-timed Knowledge Assessment Quiz card, and project submission portal with automatic team/school linkage.
   - **Evaluator Dashboard (`/evaluator/dashboard`)**: View only assigned submissions (strict 403 authorization guard on unassigned entries), 7-criteria 100-mark rubric scoring, draft saving, and submission locking.
   - **Admin Control Panel (`/admin/dashboard`)**: School & evaluator approvals, project assignment to jury, stage advancement, leaderboard visibility toggle, and system audit logs.
4. **Public Pages**:
   - **Home (`/`)**: Hero, overview, scroll journey, stats, funnel, 14 priority themes, prizes, leaderboard preview, and CTA.
   - **About (`/about`)**: Mission, vision, regional context ("Why Assam?"), eligibility, and outcomes.
   - **Journey (`/journey`)**: Full 12-stage chronological schedule with funnel visualization.
   - **Guidelines (`/guidelines`)**: Rulebook, team formation rules, mentor duties, and 7-criteria rubric.
   - **Prizes & Awards (`/prizes`)**: Category VI-VIII, IX-X, XI-XII awards with official committee disclaimer.
   - **State Leaderboard (`/leaderboard`)**: Real-time ranks filterable by category and all 33 Assam districts with admin privacy toggle.
   - **Innovations Gallery (`/innovations`)**: Public showcase of verified student prototypes.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Framer Motion, GSAP & GSAP ScrollTrigger, Lucide Icons.
- **Backend**: Python 3.10+, Flask, Flask-JWT-Extended, PyMongo, Flask-CORS, Bcrypt, Pytest, Mongomock.
- **Database**: MongoDB (Atlas compatible, with zero-config in-memory fallback for local demo).

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22.14.0)
- **Python**: v3.10+ (tested on v3.10.11)
- **MongoDB**: (Optional) MongoDB local or Atlas URI. If no local mongod service is running, the backend automatically falls back to an embedded mock database for immediate zero-config operation.

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run backend server
python app.py
```
The Flask REST API will start on `http://127.0.0.1:5000/`.

### 3. Frontend Setup
In a separate terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://127.0.0.1:5173/` in your browser.

---

## Demo Credentials (Development & Testing)

| Role | Email | Password | Organization / Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@afip.demo` | `Admin@123` | State Mission Directorate, Assam |
| **School** | `school@afip.demo` | `School@123` | Brahmaputra Public School (`AFIP-AS-KAM-00001`) |
| **Student** | `student@afip.demo` | `Student@123` | Aarav Das — *Brahmaputra Innovators* (`AFIP-T-00001`) |
| **Evaluator** | `evaluator@afip.demo` | `Evaluator@123` | Dr. Ananya Sharma (Associate Professor, IITG) |

> **Note**: All login screens feature a convenient **"Autofill Demo Account"** button for instantaneous one-click testing.

---

## Running Automated Tests

To execute the backend integration test suite:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v tests/test_api.py
```

To run the frontend production build:
```bash
cd frontend
npm run build
```

---

## REST API Overview (`/api/v1`)

- `POST /api/v1/auth/login`: User login with JWT issuance.
- `GET /api/v1/auth/me`: Fetch authenticated user profile.
- `POST /api/v1/schools/register`: School registration application.
- `GET /api/v1/schools/me`: Authenticated school profile & statistics.
- `GET /api/v1/schools/my-teams`: Teams enrolled by authenticated school.
- `POST /api/v1/teams`: Create competition team (restricted to approved schools).
- `GET /api/v1/teams/my-team`: Fetch team roster, current stage, quiz attempt, and proposal.
- `POST /api/v1/projects`: Submit or update project proposal (auto-inherits team/school identity).
- `GET /api/v1/quizzes/active`: Fetch active assessment questions (correct answers securely hidden).
- `POST /api/v1/quizzes/:id/start`: Begin timed quiz attempt.
- `POST /api/v1/quizzes/:id/submit`: Submit quiz answers with server-side validation.
- `GET /api/v1/evaluators/assignments`: List projects assigned to authenticated evaluator.
- `GET /api/v1/evaluators/projects/:id`: View assigned project details (HTTP 403 on unassigned).
- `POST /api/v1/evaluations`: Submit 7-criteria rubric score (max 100).
- `GET /api/v1/leaderboard`: Fetch public standings with category and district filters.
- `GET /api/v1/innovations`: Public gallery of student inventions across 14 themes.
- `GET /api/v1/admin/stats`: State-wide analytics and distribution charts.
- `PATCH /api/v1/admin/schools/:id/status`: Approve school and generate unique School Code.
- `POST /api/v1/admin/assignments`: Assign project proposal to approved evaluator.
- `POST /api/v1/admin/stage`: Update active state competition stage.
- `PATCH /api/v1/admin/leaderboard-visibility`: Toggle public leaderboard visibility.
- `GET /api/v1/admin/audit-logs`: System audit trail.
# gati-my
# gati-my
