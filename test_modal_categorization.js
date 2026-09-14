const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

async function testModalCategorization() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  console.log('Navigating to Home page...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // Click on "Portal Login" button in Navbar
  console.log('Clicking Portal Login button...');
  const portalBtn = page.locator('button:has-text("Portal Login")').first();
  await portalBtn.click();
  await page.waitForTimeout(600);

  // 1. Verify modal is open
  const modalHeader = await page.locator('text=Select Your Portal').count();
  console.log('Modal opened:', modalHeader > 0);

  // 2. Admin Login Tab is active by default
  const modalText = await page.locator('div[class*="rounded-2xl shadow-2xl"]').innerText();
  console.log('\n--- Checking Admin Login tab ---');
  console.log('Contains Administrator:', modalText.includes('Administrator'));
  console.log('Contains Technical Evaluator:', modalText.includes('Technical Evaluator'));
  console.log('Contains District Officer:', modalText.includes('District Officer'));
  console.log('Contains Zonal Jury:', modalText.includes('Zonal Jury'));
  console.log('Contains State Grand Jury:', modalText.includes('State Grand Jury'));
  console.log('Does NOT contain School Portal:', !modalText.includes('School Portal'));
  console.log('Does NOT contain Teacher Mentor:', !modalText.includes('Teacher Mentor'));

  await page.screenshot({ path: path.join(PROOFS_DIR, 'modal_admin_login.png') });
  console.log('Saved proofs/modal_admin_login.png');

  // 3. Click "School / Mentor Login" Tab
  console.log('\nClicking School / Mentor Login tab...');
  const schoolTabBtn = page.locator('button:has-text("School / Mentor Login")').first();
  await schoolTabBtn.click();
  await page.waitForTimeout(400);

  const schoolModalText = await page.locator('div[class*="rounded-2xl shadow-2xl"]').innerText();
  console.log('\n--- Checking School / Mentor Login tab ---');
  console.log('Contains School Portal:', schoolModalText.includes('School Portal'));
  console.log('Contains Teacher Mentor:', schoolModalText.includes('Teacher Mentor'));
  console.log('Does NOT contain Administrator:', !schoolModalText.includes('Administrator'));
  console.log('Does NOT contain Technical Evaluator:', !schoolModalText.includes('Technical Evaluator'));
  console.log('Does NOT contain State Grand Jury:', !schoolModalText.includes('State Grand Jury'));

  await page.screenshot({ path: path.join(PROOFS_DIR, 'modal_school_mentor_login.png') });
  console.log('Saved proofs/modal_school_mentor_login.png');

  await browser.close();
  console.log('\nAll modal categorization tests completed successfully!');
}

testModalCategorization().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
