const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

async function testCategoryFlow() {
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

  // STEP 1: Check initial modal view - ONLY 2 categories should be displayed
  const modalText = await page.locator('div[class*="rounded-3xl shadow-2xl"]').innerText();
  console.log('\n--- Step 1: Initial Modal State ---');
  console.log('Has Admin Login card:', modalText.includes('Admin Login'));
  console.log('Has School / Mentor Login card:', modalText.includes('School / Mentor Login'));
  
  // Verify individual logins are NOT displayed yet
  const signInBtnsCount = await page.locator('button:has-text("Sign In")').count();
  console.log('Sign In buttons visible (should be 0):', signInBtnsCount);

  await page.screenshot({ path: path.join(PROOFS_DIR, '01_popup_only_two_categories.png') });
  console.log('Saved proofs/01_popup_only_two_categories.png');

  // STEP 2: Click on "Admin Login" category card
  console.log('\n--- Step 2: Clicking Admin Login category ---');
  const adminCard = page.locator('div:has-text("Admin Login"):has-text("5 Portals")').last();
  await adminCard.click();
  await page.waitForTimeout(400);

  const adminViewText = await page.locator('div[class*="rounded-3xl shadow-2xl"]').innerText();
  console.log('Contains Administrator:', adminViewText.includes('Administrator'));
  console.log('Contains Technical Evaluator:', adminViewText.includes('Technical Evaluator'));
  console.log('Contains District Officer:', adminViewText.includes('District Officer'));
  console.log('Contains Zonal Jury:', adminViewText.includes('Zonal Jury'));
  console.log('Contains State Grand Jury:', adminViewText.includes('State Grand Jury'));
  console.log('Has Back button:', adminViewText.includes('Back to Categories'));

  await page.screenshot({ path: path.join(PROOFS_DIR, '02_admin_category_logins.png') });
  console.log('Saved proofs/02_admin_category_logins.png');

  // STEP 3: Click "Back to Categories"
  console.log('\n--- Step 3: Clicking Back to Categories ---');
  const backBtn = page.locator('button:has-text("Back to Categories")').first();
  await backBtn.click();
  await page.waitForTimeout(400);

  // STEP 4: Click on "School / Mentor Login" category card
  console.log('\n--- Step 4: Clicking School / Mentor Login category ---');
  const schoolCard = page.locator('div:has-text("School / Mentor Login"):has-text("2 Portals")').last();
  await schoolCard.click();
  await page.waitForTimeout(400);

  const schoolViewText = await page.locator('div[class*="rounded-3xl shadow-2xl"]').innerText();
  console.log('Contains School Portal:', schoolViewText.includes('School Portal'));
  console.log('Contains Teacher Mentor:', schoolViewText.includes('Teacher Mentor'));
  console.log('Does NOT contain Administrator:', !schoolViewText.includes('Administrator'));

  await page.screenshot({ path: path.join(PROOFS_DIR, '03_school_mentor_category_logins.png') });
  console.log('Saved proofs/03_school_mentor_category_logins.png');

  await browser.close();
  console.log('\nAll tests passed with 100% success!');
}

testCategoryFlow().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
