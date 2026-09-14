import asyncio
from playwright.async_api import async_playwright
import os

proof_dir = r"C:\Users\MOHIT DUBEY\.gemini\antigravity-ide\brain\1948b755-b8ad-452f-9c12-21ad9aea3332\visual_proofs"
os.makedirs(proof_dir, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        # 1. School Dashboard verification
        print("Navigating to login for School...")
        await page.goto("http://localhost:5173/login")
        await page.wait_for_selector('input[type="email"]')
        await page.select_option("select", "school")
        await page.fill('input[type="email"]', "school@afip.demo")
        await page.fill('input[type="password"]', "School@123")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard/school**", timeout=10000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(proof_dir, "01_school_dashboard_notice.png"), full_page=True)
        print("Captured 01_school_dashboard_notice.png")

        # Go to Teams tab
        teams_btn = page.locator('button:has-text("Teams")')
        if await teams_btn.count() > 0:
            await teams_btn.first.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(proof_dir, "02_school_teams_tab_readonly.png"), full_page=True)
            print("Captured 02_school_teams_tab_readonly.png")

        # Logout / Return to login
        await page.goto("http://localhost:5173/login")
        await page.wait_for_timeout(1000)

        # 2. Mentor Dashboard - Fresh mentor (0/1 teams)
        print("Navigating to login for Fresh Mentor...")
        await page.select_option("select", "mentor")
        await page.fill('input[type="email"]', "robotics.mentor@assam.edu")
        await page.fill('input[type="password"]', "Mentor@123")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard/mentor**", timeout=10000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(proof_dir, "03_mentor_dashboard_empty_quota.png"), full_page=True)
        print("Captured 03_mentor_dashboard_empty_quota.png")

        # Click '+ Form Competition Team'
        create_btn = page.locator('button:has-text("Form Competition Team")')
        if await create_btn.count() > 0:
            await create_btn.first.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(proof_dir, "04_mentor_create_team_modal.png"), full_page=False)
            print("Captured 04_mentor_create_team_modal.png")

        # Return to login
        await page.goto("http://localhost:5173/login")
        await page.wait_for_timeout(1000)

        # 3. Mentor Dashboard - Quota fulfilled mentor (1/1 teams)
        print("Navigating to login for Active Mentor (1/1 team)...")
        await page.select_option("select", "mentor")
        await page.fill('input[type="email"]', "science.mentor@assam.edu")
        await page.fill('input[type="password"]', "Mentor@123")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard/mentor**", timeout=10000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(proof_dir, "05_mentor_dashboard_quota_fulfilled.png"), full_page=True)
        print("Captured 05_mentor_dashboard_quota_fulfilled.png")

        # Click View Details on team card
        details_btn = page.locator('button:has-text("View Details")')
        if await details_btn.count() > 0:
            await details_btn.first.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(proof_dir, "06_mentor_team_roster_dossier.png"), full_page=False)
            print("Captured 06_mentor_team_roster_dossier.png")

        await browser.close()
        print("All visual proof screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(main())
