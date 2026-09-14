const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING PLAYWRIGHT FRONTEND TEST SUITE');
  console.log('  Target Base URL:', BASE_URL);
  console.log('  Proofs Directory:', PROOFS_DIR);
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  const results = [];

  async function recordTest(name, fn) {
    const start = Date.now();
    try {
      console.log(`[RUNNING] ${name}...`);
      const details = await fn();
      const duration = Date.now() - start;
      console.log(`[PASS] ${name} (${duration}ms)\n`);
      results.push({ name, status: 'PASSED', duration, details });
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`[FAIL] ${name} (${duration}ms):`, err.message, '\n');
      results.push({ name, status: 'FAILED', duration, error: err.message });
    }
  }

  // TEST 1: Homepage & New Branding
  await recordTest('1. Homepage Branding, Hero & Navbar', async () => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const title = await page.title();
    if (!title.includes('Brahmaputra Innovation Challenge')) {
      throw new Error(`Expected title to contain 'Brahmaputra Innovation Challenge', got: '${title}'`);
    }

    const heroText = await page.locator('h1').innerText();
    if (!heroText.includes('Brahmaputra Innovation Challenge') || !heroText.includes('Viksit Assam and Viksit Bharat 2047')) {
      throw new Error(`Hero heading mismatch: ${heroText}`);
    }

    const proofFile = path.join(PROOFS_DIR, '01_homepage.png');
    await page.screenshot({ path: proofFile });
    return { title, heroHeading: heroText.replace(/\n/g, ' '), proof: '01_homepage.png' };
  });

  // TEST 2: Student Journey Page
  await recordTest('2. Student Journey Roadmap (/journey)', async () => {
    await page.goto(`${BASE_URL}/journey`, { waitUntil: 'networkidle' });
    const content = await page.locator('body').innerText();
    if (!content.toLowerCase().includes('journey') && !content.toLowerCase().includes('stage')) {
      throw new Error('Journey roadmap text not found');
    }
    const proofFile = path.join(PROOFS_DIR, '02_journey.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/journey`, proof: '02_journey.png' };
  });

  // TEST 3: Guidelines & Rules Page
  await recordTest('3. Guidelines & Rules Page (/guidelines)', async () => {
    await page.goto(`${BASE_URL}/guidelines`, { waitUntil: 'networkidle' });
    const content = await page.locator('body').innerText();
    if (!content.toLowerCase().includes('guidelines') && !content.toLowerCase().includes('eligibility')) {
      throw new Error('Guidelines content not found');
    }
    const proofFile = path.join(PROOFS_DIR, '03_guidelines.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/guidelines`, proof: '03_guidelines.png' };
  });

  // TEST 4: Prizes & Awards Page
  await recordTest('4. Prizes & Recognition Page (/prizes)', async () => {
    await page.goto(`${BASE_URL}/prizes`, { waitUntil: 'networkidle' });
    const content = await page.locator('body').innerText();
    if (!content.toLowerCase().includes('prize') && !content.toLowerCase().includes('award')) {
      throw new Error('Prizes content not found');
    }
    const proofFile = path.join(PROOFS_DIR, '04_prizes.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/prizes`, proof: '04_prizes.png' };
  });

  // TEST 5: Leaderboard Page
  await recordTest('5. Innovation Leaderboard Page (/leaderboard)', async () => {
    await page.goto(`${BASE_URL}/leaderboard`, { waitUntil: 'networkidle' });
    const content = await page.locator('body').innerText();
    if (!content.toLowerCase().includes('leaderboard') && !content.toLowerCase().includes('rank')) {
      throw new Error('Leaderboard content not found');
    }
    const proofFile = path.join(PROOFS_DIR, '05_leaderboard.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/leaderboard`, proof: '05_leaderboard.png' };
  });

  // TEST 6: Innovation Showcase Page
  await recordTest('6. Innovations Showcase Page (/innovations)', async () => {
    await page.goto(`${BASE_URL}/innovations`, { waitUntil: 'networkidle' });
    const content = await page.locator('body').innerText();
    if (!content.toLowerCase().includes('innovation') && !content.toLowerCase().includes('project')) {
      throw new Error('Innovations showcase content not found');
    }
    const proofFile = path.join(PROOFS_DIR, '06_innovations.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/innovations`, proof: '06_innovations.png' };
  });

  // TEST 7: School Registration Page
  await recordTest('7. School Registration Page (/register/school)', async () => {
    await page.goto(`${BASE_URL}/register/school`, { waitUntil: 'networkidle' });
    const formVisible = await page.locator('form, input').first().isVisible();
    if (!formVisible) {
      throw new Error('Registration form not visible');
    }
    const proofFile = path.join(PROOFS_DIR, '07_register_school.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/register/school`, proof: '07_register_school.png' };
  });

  // TEST 8: Student Team Registration Page
  await recordTest('8. Student Registration Page (/register/student)', async () => {
    await page.goto(`${BASE_URL}/register/student`, { waitUntil: 'networkidle' });
    const formVisible = await page.locator('form, input').first().isVisible();
    if (!formVisible) {
      throw new Error('Student registration form not visible');
    }
    const proofFile = path.join(PROOFS_DIR, '08_register_student.png');
    await page.screenshot({ path: proofFile });
    return { url: `${BASE_URL}/register/student`, proof: '08_register_student.png' };
  });

  // TEST 9: Login & End-to-End Admin Dashboard Authentication
  await recordTest('9. Login & Admin Dashboard Access', async () => {
    await page.goto(`${BASE_URL}/login/admin`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(PROOFS_DIR, '09_login.png') });

    // Look for email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill('admin@afip.demo');
    await passwordInput.fill('Admin@123');

    // Click submit button in the form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const dashboardHeading = await page.locator('h1, h2').first().innerText();
    const proofFile = path.join(PROOFS_DIR, '10_admin_dashboard.png');
    await page.screenshot({ path: proofFile });

    return {
      currentUrl: page.url(),
      heading: dashboardHeading,
      proof: '10_admin_dashboard.png'
    };
  });

  await browser.close();

  console.log('====================================================');
  console.log('  TEST SUMMARY:');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  console.log(`  TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  // Save results JSON for report generation
  fs.writeFileSync(path.join(PROOFS_DIR, 'results.json'), JSON.stringify(results, null, 2));
}

runTests().catch(err => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
