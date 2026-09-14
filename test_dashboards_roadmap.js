const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

async function testDashboards() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  try {
    // School Dashboard
    console.log('Logging in as School...');
    await page.goto(`${BASE_URL}/login/school`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'school@afip.demo');
    await page.fill('input[type="password"]', 'School@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/school/dashboard**', { timeout: 15000 });
    await page.waitForSelector('text=Institutional Portal', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(PROOFS_DIR, '07_school_dashboard_active_roadmap.png') });
    console.log('Saved 07_school_dashboard_active_roadmap.png');

    // Mentor Dashboard
    console.log('Logging in as Mentor...');
    await page.goto(`${BASE_URL}/login/mentor`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'mentor@afip.demo');
    await page.fill('input[type="password"]', 'Mentor@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/mentor/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(PROOFS_DIR, '08_mentor_dashboard_active_roadmap.png') });
    console.log('Saved 08_mentor_dashboard_active_roadmap.png');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

testDashboards();
