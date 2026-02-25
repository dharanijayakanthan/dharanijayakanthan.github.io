from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    print("Navigating to Habits...")
    page.goto("http://localhost:5173/habits")

    # Login
    print("Logging in...")
    page.get_by_placeholder("What's your name?").fill("PlaywrightUser")
    page.get_by_role("button", name="Start Tracking").click()
    expect(page.get_by_text("Hello, PlaywrightUser")).to_be_visible()

    # Check Jobs (should persist from previous steps as we use same DB file)
    print("Navigating to Jobs...")
    page.goto("http://localhost:5173/")

    print("Verifying Jobs...")
    expect(page.get_by_text("Job Board")).to_be_visible()
    expect(page.get_by_text("Apply").first).to_be_visible(timeout=10000)

    page.screenshot(path="verification/jobs_page_node_backend.png")
    print("Jobs verified.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
