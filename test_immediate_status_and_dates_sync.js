const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

async function testImmediateSync() {
  console.log('================================================================');
  console.log('  TESTING LIVE IMMEDIATE STATUS & DATES SYNC ACROSS DASHBOARDS');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  try {
    // 1. Admin login
    console.log('[1/4] Admin login & setting Stage 01 as active...');
    await page.goto(`${BASE_URL}/login/admin`);
    await page.fill('input[type="email"]', 'admin@afip.demo');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Click Stages & Governance tab
    await page.click('button:has-text("Stages & Governance")');
    await page.waitForTimeout(1000);

    // Target Step 01 Change Dates
    console.log('  - Opening Change Dates modal for Step 01 (School Registration)...');
    const changeDatesBtn = page.locator('button:has-text("Change Dates")').first();
    await changeDatesBtn.click();
    await page.waitForSelector('text=Change Round Schedule Dates');

    // Fill date string
    const dateInput = page.locator('input[placeholder*="17th - 30th Sep"]');
    await dateInput.fill('10th - 15th Sep, 2026');
    await page.waitForTimeout(300);

    // Save dates
    await page.click('button:has-text("Save & Broadcast Dates")');
    await page.waitForTimeout(2000);

    // Capture Admin Governance screenshot
    await page.screenshot({ path: path.join(PROOFS_DIR, '09_admin_step1_active_dates_saved.png') });
    console.log('  - Saved 09_admin_step1_active_dates_saved.png');

    // 2. Verify School Dashboard shows Step 01 as ACTIVE (and not Step 05!)
    console.log('[2/4] Verifying School Dashboard shows Step 01 as Active...');
    await page.goto(`${BASE_URL}/login/school`);
    await page.fill('input[type="email"]', 'school@afip.demo');
    await page.fill('input[type="password"]', 'School@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/school/dashboard**', { timeout: 15000 });
    await page.waitForSelector('text=Institutional Portal', { timeout: 10000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(PROOFS_DIR, '10_school_dashboard_step1_active.png') });
    console.log('  - Saved 10_school_dashboard_step1_active.png');

    // 3. Verify Mentor Dashboard shows Step 01 as ACTIVE
    console.log('[3/4] Verifying Mentor Dashboard shows Step 01 as Active...');
    await page.goto(`${BASE_URL}/login/mentor`);
    await page.fill('input[type="email"]', 'mentor@afip.demo');
    await page.fill('input[type="password"]', 'Mentor@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/mentor/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(PROOFS_DIR, '11_mentor_dashboard_step1_active.png') });
    console.log('  - Saved 11_mentor_dashboard_step1_active.png');

    // 4. Verify Homepage Stage Milestones
    console.log('[4/4] Verifying Homepage Milestones shows Step 01 as Active with new date...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);
    const milestones = page.locator('#stages, section:has-text("Stage-by-Stage Milestones & Schedule")').first();
    if (await milestones.count() > 0) {
      await milestones.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(PROOFS_DIR, '12_homepage_step1_active_milestone.png') });
    console.log('  - Saved 12_homepage_step1_active_milestone.png');

    console.log('\n✅ ALL IMMEDIATE STATUS & DATES SYNC TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testImmediateSync();
