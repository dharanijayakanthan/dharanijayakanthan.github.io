from playwright.sync_api import sync_playwright

def verify(page):
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: errors.append(str(exc)))

    print("Navigating to Products page...")
    page.goto("http://localhost:5173/products")

    print("Waiting for heading...")
    try:
        page.wait_for_selector("text=Products & Opportunities", timeout=5000)
    except Exception as e:
        print(f"Error waiting for heading: {e}")

    print("Waiting for map container...")
    try:
        page.wait_for_selector(".leaflet-container", timeout=5000)
    except Exception as e:
        print(f"Error waiting for map container: {e}")

    page.wait_for_timeout(2000)

    if errors:
        print("Console errors found:")
        for error in errors:
            print(f"- {error}")
    else:
        print("No console errors found.")

    page.screenshot(path="products_debug.png")
    print("Screenshot saved to products_debug.png")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    verify(page)
    browser.close()
