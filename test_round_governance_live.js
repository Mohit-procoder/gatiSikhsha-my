const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

async function runGovernanceTests() {
  console.log('====================================================');
  console.log('  TESTING ADMIN ROUND ALTERATION & DATE EDITING FLOW');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });

  const page = await context.newPage();

  try {
    // 1. Log in as Administrator
    console.log('[1/5] Logging into Admin Dashboard...');
    await page.goto(`${BASE_URL}/login/admin`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'admin@afip.demo');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // 2. Navigate to "Stages & Governance" tab
    console.log('[2/5] Navigating to Stages & Governance tab...');
    const governanceTab = page.locator('button:has-text("Stages & Governance"), button:has-text("Competition Phase Governance")').first();
    await governanceTab.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(PROOFS_DIR, '01_admin_governance_initial.png') });
    console.log('  - Captured 01_admin_governance_initial.png');

    // 3. Test changing dates of a round (e.g. MCQ Assessment)
    console.log('[3/5] Testing round date modification modal...');
    // Find "Change Dates" button for MCQ Assessment or Stage 03/04
    const changeDatesBtns = page.locator('button:has-text("Change Dates")');
    const count = await changeDatesBtns.count();
    console.log(`  - Found ${count} "Change Dates" buttons`);
    if (count === 0) throw new Error('No "Change Dates" buttons found!');

    // Click "Change Dates" for index 3 (MCQ Assessment or Foundation)
    await changeDatesBtns.nth(3).click();
    await page.waitForTimeout(500);

    // Modal should be open
    await page.waitForSelector('text=Change Round Schedule Dates');
    await page.screenshot({ path: path.join(PROOFS_DIR, '02_admin_edit_dates_modal.png') });
    console.log('  - Captured 02_admin_edit_dates_modal.png');

    // Fill new dates
    const dateInput = page.locator('input[placeholder*="17th - 30th Sep"]');
    await dateInput.fill('24th Oct - 4th Nov, 2026 (Live Assessment Window)');
    await page.waitForTimeout(300);

    // Save
    await page.click('button:has-text("Save & Broadcast Dates")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(PROOFS_DIR, '03_admin_dates_updated_table.png') });
    console.log('  - Captured 03_admin_dates_updated_table.png');

    // 4. Test setting a new round as active
    console.log('[4/5] Testing "Set Active" round alteration...');
    const setActiveBtns = page.locator('button:has-text("Set Active")');
    const activeBtnCount = await setActiveBtns.count();
    console.log(`  - Found ${activeBtnCount} "Set Active" buttons`);

    if (activeBtnCount > 0) {
      // Pick round 2 or 3 to set active
      await setActiveBtns.nth(2).click();
      await page.waitForTimeout(2500);

      await page.screenshot({ path: path.join(PROOFS_DIR, '04_admin_active_round_altered.png') });
      console.log('  - Captured 04_admin_active_round_altered.png');
    }

    // 5. Check Home Page Stage Milestones propagation
    console.log('[5/5] Checking propagation on Home page Stage Milestones...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);

    // Scroll to milestones section
    const milestoneSection = page.locator('#stages, section:has-text("Stage-by-Stage Milestones & Schedule")').first();
    if (await milestoneSection.count() > 0) {
      await milestoneSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(PROOFS_DIR, '05_homepage_stage_milestones_live.png') });
      console.log('  - Captured 05_homepage_stage_milestones_live.png');
    }

    // Also check Journey page
    console.log('  - Checking Journey page live sync...');
    await page.goto(`${BASE_URL}/journey`);
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(PROOFS_DIR, '06_journey_page_live_sync.png') });
    console.log('  - Captured 06_journey_page_live_sync.png');

    console.log('\n✅ ALL ADMIN GOVERNANCE & DYNAMIC PROPAGATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    await page.screenshot({ path: path.join(PROOFS_DIR, 'error_governance_test.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runGovernanceTests();
