const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');
const ARTIFACTS_DIR = 'C:/Users/MOHIT DUBEY/.gemini/antigravity-ide/brain/1948b755-b8ad-452f-9c12-21ad9aea3332';

async function verifyThemes() {
  console.log('Testing 15 Themes on Homepage with proper scrolling...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(BASE_URL);
  await page.waitForTimeout(2000);

  // Get element bounding box for #themes
  const themesSection = page.locator('#themes');
  const box = await themesSection.boundingBox();
  if (!box) throw new Error('Could not find #themes');

  // Scroll to top of #themes with 80px offset for navbar
  await page.evaluate((y) => window.scrollTo({ top: y - 80, behavior: 'instant' }), box.y);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(PROOFS_DIR, '01_homepage_15_themes_top.png') });
  console.log('Saved 01_homepage_15_themes_top.png');

  // Scroll a bit down to capture middle themes (PMH7 - PMH12)
  await page.evaluate((y) => window.scrollTo({ top: y + 380, behavior: 'instant' }), box.y);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(PROOFS_DIR, '02_homepage_15_themes_mid.png') });
  console.log('Saved 02_homepage_15_themes_mid.png');

  // Scroll down to capture bottom themes (PMH10 - PMH15)
  await page.evaluate((y) => window.scrollTo({ top: y + 780, behavior: 'instant' }), box.y);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(PROOFS_DIR, '03_homepage_15_themes_bottom.png') });
  console.log('Saved 03_homepage_15_themes_bottom.png');

  // Copy to artifacts dir
  fs.copyFileSync(path.join(PROOFS_DIR, '01_homepage_15_themes_top.png'), path.join(ARTIFACTS_DIR, '01_homepage_15_themes_top.png'));
  fs.copyFileSync(path.join(PROOFS_DIR, '02_homepage_15_themes_mid.png'), path.join(ARTIFACTS_DIR, '02_homepage_15_themes_mid.png'));
  fs.copyFileSync(path.join(PROOFS_DIR, '03_homepage_15_themes_bottom.png'), path.join(ARTIFACTS_DIR, '03_homepage_15_themes_bottom.png'));

  // Verify all 15 PMH codes are present
  for (let i = 1; i <= 15; i++) {
    const code = `PMH${i}`;
    const count = await page.locator(`text=${code}`).count();
    console.log(`Checking ${code}: count = ${count}`);
    if (count === 0) {
      throw new Error(`Missing theme code: ${code}`);
    }
  }

  await browser.close();
  console.log('All 15 themes verified and screens saved to artifacts!');
}

verifyThemes().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
