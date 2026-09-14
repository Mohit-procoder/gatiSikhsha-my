const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

(async () => {
  const b = await chromium.launch({ channel: 'msedge', headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
  await p.goto('http://localhost:5173/');
  await p.waitForTimeout(1000);
  const el = p.locator('text=Stage 1: Registrations').first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'proofs/13_stage_1_milestone_active.png' });
  await b.close();
  console.log('Stage 1 screenshot captured');
})();
