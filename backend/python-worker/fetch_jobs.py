import requests
from bs4 import BeautifulSoup
import sqlite3
import os
import time

# Constants
DB_PATH = os.path.join(os.path.dirname(__file__), '../node-server/database.sqlite')
TARGET_LOCATIONS = [
    "HSR Layout, Bengaluru, Karnataka, India",
    "Koramangala, Bengaluru, Karnataka, India",
    "Whitefield, Bengaluru, Karnataka, India",
    "Bengaluru, Karnataka, India"
]

def fetch_jobs():
    print(f"Connecting to database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure table exists (though server should handle it)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT,
            company TEXT,
            location TEXT,
            date TEXT,
            link TEXT,
            logo TEXT,
            lat REAL,
            lng REAL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
    }

    total_added = 0

    for loc in TARGET_LOCATIONS:
        print(f"Fetching jobs for: {loc}")
        for start in range(0, 100, 25): # Limit to 100 per location for demo
            url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Frontend%20Engineer&location={loc}&start={start}"

            try:
                time.sleep(2) # Rate limit
                response = requests.get(url, headers=headers)

                if response.status_code != 200:
                    print(f"  Failed with status {response.status_code}")
                    if response.status_code == 429:
                        print("  Rate limit hit.")
                        break
                    continue

                soup = BeautifulSoup(response.text, 'html.parser')
                job_cards = soup.find_all('li')

                if not job_cards:
                    print("  No more jobs found.")
                    break

                jobs_on_page = 0
                for card in job_cards:
                    try:
                        title_tag = card.find('h3', class_='base-search-card__title')
                        company_tag = card.find('h4', class_='base-search-card__subtitle')
                        location_tag = card.find('span', class_='job-search-card__location')
                        date_tag = card.find('time', class_='job-search-card__listdate')
                        link_tag = card.find('a', class_='base-card__full-link')
                        img_tag = card.find('img', class_='artdeco-entity-image')

                        title = title_tag.text.strip() if title_tag else "Unknown"
                        company = company_tag.text.strip() if company_tag else "Unknown"
                        location = location_tag.text.strip() if location_tag else ""
                        date_str = date_tag['datetime'] if date_tag else ""
                        link = link_tag['href'] if link_tag else ""
                        logo = img_tag['data-delayed-url'] if img_tag and img_tag.has_attr('data-delayed-url') else (img_tag['src'] if img_tag else "")

                        urn_div = card.find('div', class_='base-search-card')
                        urn = urn_div['data-entity-urn'] if urn_div else (link.split('?')[0] if link else f"{company}-{title}")

                        # Insert or Update
                        cursor.execute("""
                            INSERT OR REPLACE INTO jobs (id, title, company, location, date, link, logo, lat, lng, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
                        """, (urn, title, company, location, date_str, link, logo))

                        jobs_on_page += 1
                        total_added += 1
                    except Exception as e:
                        print(f"  Error parsing card: {e}")

                print(f"  Processed {jobs_on_page} jobs.")
                conn.commit()

            except Exception as e:
                print(f"  Error fetching page: {e}")

    print(f"Finished. Total jobs processed: {total_added}")
    conn.close()

if __name__ == "__main__":
    fetch_jobs()
