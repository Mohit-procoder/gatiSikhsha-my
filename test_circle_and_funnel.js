const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

async function testChanges() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  console.log('Navigating to Home page...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // 1. Verify circle does NOT contain "Selected"
  const pathwaysEl = await page.locator('text=Innovation Acceleration Pathways').first();
  await pathwaysEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Check center circle text
  const circleText = await page.locator('div[class*="rounded-full"][class*="border-[#bae6fd]"]').first().innerText();
  console.log('Center Circle Text:\n' + circleText.trim());
  const hasSelected = circleText.includes('Selected');
  console.log('Contains "Selected":', hasSelected);

  await page.screenshot({ path: path.join(PROOFS_DIR, 'circle_without_selected.png') });
  console.log('Saved proofs/circle_without_selected.png');

  const funnelSection = page.locator('section:has(h2:has-text("The AFIP Competition Funnel"))');
  await funnelSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await funnelSection.screenshot({ path: path.join(PROOFS_DIR, 'funnel_full_section.png') });
  console.log('Saved proofs/funnel_full_section.png');

  await browser.close();
  console.log('\nVerification complete!');
}

testChanges().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
