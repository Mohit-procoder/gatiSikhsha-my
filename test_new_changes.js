const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/MOHIT DUBEY/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const BASE_URL = 'http://localhost:5173';
const PROOFS_DIR = path.resolve(__dirname, 'proofs');

if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

async function verify() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  console.log('Navigating to Home page...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // 1. Partner names
  const pageContent = await page.content();
  const hasIHFC = pageContent.includes('Innovation hub for cobotics (IHFC)');
  const hasASOM = pageContent.includes('ASOM, Assam');
  console.log('Home page has Innovation hub for cobotics (IHFC):', hasIHFC);
  console.log('Home page has ASOM, Assam:', hasASOM);

  // 2. Heading and circle text in Innovation Acceleration Pathways
  const hasSubheading = pageContent.includes('For high potential students Ideas');
  const hasCircleIdeas = pageContent.includes('Students Ideas');
  console.log('Has subheading "For high potential students Ideas":', hasSubheading);
  console.log('Has circle "Students Ideas":', hasCircleIdeas);

  // 3. Prize pool
  const hasPrizePool = pageContent.includes('52.5 Lakhs') && pageContent.includes('30 Winning Teams');
  console.log('Has ₹52.5 Lakhs & 30 Winning Teams:', hasPrizePool);

  // 4. Stage milestones on Home page
  const hasMilestonesOnHome = (await page.locator('text=Stage-by-Stage Milestones').count()) > 0;
  console.log('Has "Stage-by-Stage Milestones & Schedule" on Home page:', hasMilestonesOnHome);

  // Take screenshot of Innovation Acceleration Pathways & Prize Pool
  const pathwaysEl = await page.locator('text=Innovation Acceleration Pathways').first();
  await pathwaysEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(PROOFS_DIR, 'home_pathways_and_prizepool.png') });
  console.log('Saved proofs/home_pathways_and_prizepool.png');

  // Take screenshot of Stage Milestones on Home page
  const milestonesEl = await page.locator('text=Stage-by-Stage Milestones & Schedule').first();
  await milestonesEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(PROOFS_DIR, 'home_stage_milestones.png') });
  console.log('Saved proofs/home_stage_milestones.png');

  // 5. Navigate to Journey page
  console.log('\nNavigating to Journey page...');
  await page.goto(`${BASE_URL}/journey`, { waitUntil: 'networkidle' });
  const journeyContent = await page.content();
  const hasJourneyAssam = journeyContent.includes('Follow the Student Journey Through Assam');
  console.log('Journey page has "Follow the Student Journey Through Assam":', hasJourneyAssam);

  const journeyAssamEl = await page.locator('text=Follow the Student Journey Through Assam').first();
  await journeyAssamEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(PROOFS_DIR, 'journey_assam_scroll.png') });
  console.log('Saved proofs/journey_assam_scroll.png');

  // 6. Navigate to Prizes page
  console.log('\nNavigating to Prizes page...');
  await page.goto(`${BASE_URL}/prizes`, { waitUntil: 'networkidle' });
  const prizesContent = await page.content();
  const hasPrizesPool = prizesContent.includes('State Innovation Prize Pool: ₹52.5 Lakhs');
  console.log('Prizes page has State Innovation Prize Pool:', hasPrizesPool);
  await page.screenshot({ path: path.join(PROOFS_DIR, 'prizes_page.png') });
  console.log('Saved proofs/prizes_page.png');

  await browser.close();
  console.log('\nAll checks completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
