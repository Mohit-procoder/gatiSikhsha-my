# Playwright Frontend Automated Verification Report

This document certifies that the **Brahmaputra Innovation Challenge - Viksit Assam and Viksit Bharat 2047** frontend application has been thoroughly tested using **Playwright** against the live frontend on `http://localhost:5173` and backend on `http://localhost:5000`.

---

## 1. Executive Summary

- **Total Automated Tests Executed**: 9
- **Passed**: 9 (100%)
- **Failed**: 0 (0%)
- **Browser Engine**: Microsoft Edge (Chromium engine)
- **Viewport**: 1440 x 900
- **Test Date**: September 14, 2026

---

## 2. Test Execution Matrix

| # | Test Suite / Flow | Target Route | Status | Duration | Screenshot Proof |
|---|---|---|:---:|:---:|---|
| 1 | Homepage Branding, Hero Title & Navbar | `/` | **PASSED** | 4.53s | [`01_homepage.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/01_homepage.png) |
| 2 | Student Journey Roadmap (9 Stages) | `/journey` | **PASSED** | 1.25s | [`02_journey.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/02_journey.png) |
| 3 | Guidelines, Rules & Eligibility | `/guidelines` | **PASSED** | 1.12s | [`03_guidelines.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/03_guidelines.png) |
| 4 | Prizes & Recognition Details | `/prizes` | **PASSED** | 1.01s | [`04_prizes.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/04_prizes.png) |
| 5 | Innovation State Leaderboard | `/leaderboard` | **PASSED** | 2.03s | [`05_leaderboard.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/05_leaderboard.png) |
| 6 | Innovations Showcase & Project Gallery | `/innovations` | **PASSED** | 1.30s | [`06_innovations.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/06_innovations.png) |
| 7 | School Institutional Registration Multi-Step Form | `/register/school` | **PASSED** | 0.90s | [`07_register_school.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/07_register_school.png) |
| 8 | Student Innovation Team Registration Form | `/register/student` | **PASSED** | 0.86s | [`08_register_student.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/08_register_student.png) |
| 9 | Authentication & Admin Console End-to-End | `/login/admin` &rarr; `/admin/dashboard` | **PASSED** | 3.87s | [`09_login.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/09_login.png) & [`10_admin_dashboard.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/10_admin_dashboard.png) |

---

## 3. Verified Functional Capabilities

### A. Title & Hero Section Update
- Document Title: `Brahmaputra Innovation Challenge | Viksit Assam and Viksit Bharat 2047`
- Main Heading: `Brahmaputra Innovation Challenge`
- Sub-heading / Gradient Highlight: `Viksit Assam and Viksit Bharat 2047`
- Dual partner logos for **Technology Innovation Hub IIT Delhi (IHFC)** and **Samagra Shiksha, Assam** render in the header.

### B. Student Journey (9 Stages)
- Confirmed the 9-Stage Competition Roadmap rendering from Stage 1 (Registrations) through Stage 9 (Grand State Winners & IIT Delhi Incubation).
- Metrics display target quotas: 70,000 teams $\rightarrow$ 5,000 district teams $\rightarrow$ 1,980 jury shortlist $\rightarrow$ 30 state winners.

### C. Institutional & Student Registrations
- **School Registration (`/register/school`)**: Verified multi-step onboarding (School Info, UDISE & Location, Leadership, Account Setup, Review & Submit) with Assam district selectors.
- **Student Registration (`/register/student`)**: Verified team creation inputs (School Code binding, Team Name, Grade Category VI–VIII, IX–X, XI–XII).

### D. End-to-End Authentication & Administration
- Authenticated with official State Directorate Admin credentials (`admin@afip.demo`).
- Successfully navigated to `/admin/dashboard`.
- Verified live rendering of admin KPIs:
  - Total Registered Schools
  - Active Student Teams
  - Total Evaluations
  - State Finalists
  - Stage & Phase Governance

---

## 4. Visual Proof Artifacts

All screenshots were automatically captured during the headless Playwright browser execution and saved in the [`proofs/`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs) directory:

1. **Homepage**: [`proofs/01_homepage.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/01_homepage.png)
2. **Journey**: [`proofs/02_journey.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/02_journey.png)
3. **Guidelines**: [`proofs/03_guidelines.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/03_guidelines.png)
4. **Prizes**: [`proofs/04_prizes.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/04_prizes.png)
5. **Leaderboard**: [`proofs/05_leaderboard.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/05_leaderboard.png)
6. **Innovations**: [`proofs/06_innovations.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/06_innovations.png)
7. **School Registration**: [`proofs/07_register_school.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/07_register_school.png)
8. **Student Registration**: [`proofs/08_register_student.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/08_register_student.png)
9. **Login Portal**: [`proofs/09_login.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/09_login.png)
10. **Admin Dashboard**: [`proofs/10_admin_dashboard.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/10_admin_dashboard.png)

---

## 5. School to Mentor Access Transition & Student Dossier Verification

### A. School Access Restrictions
- **Team Creation & Student Upload Removal**:
  - Removed "+ Create Team" from header banner, overview cards, and Teams tab.
  - Removed "+ Add Student Innovator" from Student Directory tab.
  - Direct student creation endpoint `POST /api/v1/schools/students` strictly responds with `403 Forbidden` (`"Student registration and team formation is now exclusively managed by your school's Teacher Mentors."`).
  - School dashboard displays clear mentor guidance informative banners explaining that registered teacher mentors form squads.

### B. Mentor Access & Strict 1-Team Quota
- **Mentor Exclusivity**:
  - `POST /api/v1/teams` updated to require `@role_required("mentor")`.
  - Mentors can create at most **1 competition team** (`mentor can create 1 team at max`).
  - Second attempt is rejected with `400 Bad Request` and error code `TEAM_LIMIT_EXCEEDED`.
  - Mentor Dashboard dynamically indicates quota status: `Form Competition Team (0/1)` when 0 teams exist; `Quota Fulfilled (1/1 Team)` and `Team Quota Active (1/1 Max)` when 1 team is active.

### C. Student Dossier (All 7 Mandatory `*` Fields)
All fields are strictly enforced and persisted into `db.students`:
1. **Student Photo (`photo`)** `*`: Base64 image upload with interactive camera preview and file selector.
2. **Father's Name (`father_name`)** `*`
3. **Mother's Name (`mother_name`)** `*`
4. **Mobile No. (`phone` / `mobile_no`)** `*`
5. **Email ID (`email`)** `*`
6. **Student Full Name (`name`)** `*`
7. **Grade / Class (`grade`)** `*`

### D. New Playwright Verification Proofs
1. **School Dashboard Overview (No Create Team)**: [`proofs/01_school_dashboard_overview.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/01_school_dashboard_overview.png)
2. **School Dashboard Teams Tab (Read-Only)**: [`proofs/02_school_dashboard_teams_readonly.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/02_school_dashboard_teams_readonly.png)
3. **Fresh Mentor Dashboard (0/1 Team Quota)**: [`proofs/04_fresh_mentor_dashboard.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/04_fresh_mentor_dashboard.png)
4. **Mentor Team Formation Modal (All 7 `*` Fields + Photo)**: [`proofs/05_mentor_create_team_modal.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/05_mentor_create_team_modal.png)
5. **Active Mentor Dashboard (1/1 Quota Fulfilled)**: [`proofs/06_active_mentor_quota_fulfilled.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/06_active_mentor_quota_fulfilled.png)
6. **Mentor Squad Details Modal (Full Dossier & Photos)**: [`proofs/07_mentor_student_dossier_modal.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/07_mentor_student_dossier_modal.png)

---

## 6. Homepage 15 Themes Verification (SSA List)

### A. Implemented 15 Themes
Updated the homepage themes section in [`InnovationThemes.jsx`](file:///c:/Users/MOHIT%20DUBEY/gati-my/frontend/src/components/home/InnovationThemes.jsx) according to the official SSA list:
- **Title**: `List of 15 Themes`
- **Subtitle**: `Proposed by SSA (Samagra Shiksha, Assam) but it's open for discussions.`
- **Notice Banner**: `Please Note: Category-wise mapping of themes will be announced by Monday.`
- **15 Thematic Areas & PMH Codes**:
  1. `PMH1. Artificial Intelligence`
  2. `PMH2. AI agents`
  3. `PMH3. Motivational Chatbot`
  4. `PMH4. Heritage & Culture`
  5. `PMH5. Disaster Management`
  6. `PMH6. Agriculture, FoodTech & Rural Development`
  7. `PMH7. Transportation & Logistics`
  8. `PMH8. Robotics and Drones`
  9. `PMH9. Clean & Green Technology`
  10. `PMH10. Tourism`
  11. `PMH11. Renewable/ sustainable Energy`
  12. `PMH12. Block chain & Cyber security`
  13. `PMH13. Smart Education`
  14. `PMH14. Remote Sensing`
  15. `PMH15. Space Technology`

### B. Playwright Automated Verification
- Verified all 15 PMH theme codes render with corresponding badges, icons, and descriptions.
- Screen proofs saved:
  - [`proofs/01_homepage_15_themes_top.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/01_homepage_15_themes_top.png)
  - [`proofs/02_homepage_15_themes_mid.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/02_homepage_15_themes_mid.png)
  - [`proofs/03_homepage_15_themes_bottom.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/03_homepage_15_themes_bottom.png)

---

---

## 7. Competition Round Governance & Date Alteration Verification

### A. Core Requirements Verified
- **Active Round Alteration**: Administrators can select and set any of the 12 competition rounds as the active round via `/admin/dashboard` under **Stages & Governance**.
- **Round Dates Editing**: Administrators can click "Change Dates" on any round card to update the schedule dates string and round name via an interactive modal.
- **Dynamic Cross-Platform Synchronization**: Updates persist in MongoDB and immediately propagate to:
  1. **Home Page (`/`)**: Timeline milestones reflect the active round with an illuminated badge and updated schedule dates.
  2. **Journey Page (`/journey`)**: Assam roadmap checkpoint cards sync live dates.
  3. **School Dashboard (`/school/dashboard`)**: The 10-stage journey roadmap updates active stage, completed steps, and dates.
  4. **Mentor Dashboard (`/mentor/dashboard`)**: The innovation roadmap reflects identical synchronized stages and active status.

### B. Playwright Automated Verification Suite
Automated end-to-end tests (`test_round_governance_live.js` and `test_dashboards_roadmap.js`) were executed against the live application:
- Admin login and navigation to "Stages & Governance" console.
- Round schedule date modification via modal (altered to `24th Oct - 4th Nov, 2026 (Live Assessment Window)`).
- Active round alteration to Step 04 ("20h Online Bootcamp").
- Live propagation verified on Home page milestones, School Dashboard, and Mentor Dashboard.

### C. Visual Proofs & Resolution of Synchronous State
1. **Admin Governance Initial Console**: [`proofs/01_admin_governance_initial.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/01_admin_governance_initial.png)
2. **Interactive Date Modification Modal**: [`proofs/02_admin_edit_dates_modal.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/02_admin_edit_dates_modal.png)
3. **Dates Broadcasted in Admin Console**: [`proofs/03_admin_dates_updated_table.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/03_admin_dates_updated_table.png)
4. **Active Round Altered to Step 04**: [`proofs/04_admin_active_round_altered.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/04_admin_active_round_altered.png)
5. **Live Home Page Milestones Synchronized**: [`proofs/05_homepage_stage_milestones_live.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/05_homepage_stage_milestones_live.png)
6. **Live School Dashboard Roadmap Synchronized**: [`proofs/07_school_dashboard_active_roadmap.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/07_school_dashboard_active_roadmap.png)
7. **Live Mentor Dashboard Roadmap Synchronized**: [`proofs/08_mentor_dashboard_active_roadmap.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/08_mentor_dashboard_active_roadmap.png)
8. **Admin Step 01 Active & Dates Successfully Saved (No 404)**: [`proofs/09_admin_step1_active_dates_saved.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/09_admin_step1_active_dates_saved.png)
9. **School Dashboard Step 01 Active (Immediate Lock-Step)**: [`proofs/10_school_dashboard_step1_active.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/10_school_dashboard_step1_active.png)
10. **Mentor Dashboard Step 01 Active (Immediate Lock-Step)**: [`proofs/11_mentor_dashboard_step1_active.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/11_mentor_dashboard_step1_active.png)
11. **Homepage Stage 1 Illuminated Active (`10th - 15th Sep, 2026`)**: [`proofs/13_stage_1_milestone_active.png`](file:///c:/Users/MOHIT%20DUBEY/gati-my/proofs/13_stage_1_milestone_active.png)

---

## 8. Conclusion

All requested updates—including the admin ability to alter active rounds, dynamically edit round schedule dates, and broadcast them across public pages, school portals, and mentor dashboards with real-time cross-tab synchronization—have been fully implemented, validated with automated end-to-end tests, and certified with visual proof artifacts.




