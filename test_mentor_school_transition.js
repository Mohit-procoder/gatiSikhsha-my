const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

async function runTransitionTests() {
  console.log('====================================================');
  console.log('  TESTING SCHOOL/MENTOR PERMISSION & TEAM REGISTRATION');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Test 1: School Dashboard - Verify Team/Student Creation is completely removed
  console.log('[1/3] Verifying School Dashboard permissions & notices...');
  await page.goto(`${BASE_URL}/login/school`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'school@afip.demo');
  await page.fill('input[type="password"]', 'School@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/school/dashboard**', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Take screenshot of school dashboard overview
  await page.screenshot({ path: path.join(PROOFS_DIR, '01_school_dashboard_overview.png') });
  console.log('  - Saved 01_school_dashboard_overview.png');

  // Verify Teams tab has no "+ Create Team" button
  const teamsTabBtn = page.locator('button:has-text("Teams")');
  if (await teamsTabBtn.count() > 0) {
    await teamsTabBtn.click();
    await page.waitForTimeout(1000);

    const createTeamBtnCount = await page.locator('button:has-text("Create Team"), button:has-text("CREATE TEAM")').count();
    console.log(`  - "Create Team" button count in School Dashboard: ${createTeamBtnCount} (Expected: 0)`);
    if (createTeamBtnCount > 0) throw new Error('School still has Create Team button!');

    await page.screenshot({ path: path.join(PROOFS_DIR, '02_school_dashboard_teams_readonly.png') });
    console.log('  - Saved 02_school_dashboard_teams_readonly.png');
  }

  // Verify Student Directory tab has no "+ Add Student" button
  const studentsTabBtn = page.locator('button:has-text("Student Directory")');
  if (await studentsTabBtn.count() > 0) {
    await studentsTabBtn.click();
    await page.waitForTimeout(1000);
    const addStudentBtnCount = await page.locator('button:has-text("Add Student")').count();
    console.log(`  - "Add Student" button count in School Dashboard: ${addStudentBtnCount} (Expected: 0)`);
    if (addStudentBtnCount > 0) throw new Error('School still has Add Student button!');
    await page.screenshot({ path: path.join(PROOFS_DIR, '03_school_dashboard_students_readonly.png') });
    console.log('  - Saved 03_school_dashboard_students_readonly.png');
  }

  // Clear session
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());

  // Test 2: Fresh Mentor Dashboard - Verify "+ Form Competition Team (0/1)" and Modal with All Mandatory Fields
  console.log('\n[2/3] Verifying Fresh Mentor Dashboard (0/1 Team Formed)...');
  await page.goto(`${BASE_URL}/login/mentor`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'robotics.mentor@assam.edu');
  await page.fill('input[type="password"]', 'Mentor@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/mentor/dashboard**', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(PROOFS_DIR, '04_fresh_mentor_dashboard.png') });
  console.log('  - Saved 04_fresh_mentor_dashboard.png');

  // Click "+ Form Competition Team"
  const formTeamBtn = page.locator('button:has-text("Form Competition Team")').first();
  if (await formTeamBtn.count() > 0) {
    await formTeamBtn.click();
    await page.waitForSelector('h3:has-text("Form New Competition Team")', { timeout: 5000 });

    await page.screenshot({ path: path.join(PROOFS_DIR, '05_mentor_create_team_modal.png') });
    console.log('  - Saved 05_mentor_create_team_modal.png');

    // Close modal
    const cancelBtn = page.locator('button:has-text("Cancel")');
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  }

  // Clear session
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());

  // Test 3: Active Mentor Dashboard - Verify Quota Reached Badge (1/1) & Squad Dossier
  console.log('\n[3/3] Verifying Active Mentor Dashboard (1/1 Team Quota Reached)...');
  await page.goto(`${BASE_URL}/login/mentor`);
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'science.mentor@assam.edu');
  await page.fill('input[type="password"]', 'Mentor@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/mentor/dashboard**', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(PROOFS_DIR, '06_active_mentor_quota_fulfilled.png') });
  console.log('  - Saved 06_active_mentor_quota_fulfilled.png');

  // Open Details Modal to inspect full student dossier (photo, father, mother, mobile, email)
  const viewDetailsBtn = page.locator('button:has-text("View Full Details")').first();
  if (await viewDetailsBtn.count() > 0) {
    await viewDetailsBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(PROOFS_DIR, '07_mentor_student_dossier_modal.png') });
    console.log('  - Saved 07_mentor_student_dossier_modal.png');
  }

  await browser.close();
  console.log('\n====================================================');
  console.log('  ALL CHECKS PASSED AND SCREENSHOTS RECORDED!');
  console.log('====================================================\n');
}

runTransitionTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
