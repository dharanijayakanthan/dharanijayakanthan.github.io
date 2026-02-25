const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const TARGET_LOCATIONS = [
    "HSR Layout, Bengaluru, Karnataka, India",
    "Koramangala, Bengaluru, Karnataka, India",
    "Whitefield, Bengaluru, Karnataka, India",
    "Bengaluru, Karnataka, India"
];

const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*"
};

async function fetchJobs() {
    console.log(`Connecting to database at ${DB_PATH}`);

    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            process.exit(1);
        }
    });

    let totalAdded = 0;

    // Helper to run DB queries as promises
    const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

    try {
        await runQuery(`
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
        `);

        for (const loc of TARGET_LOCATIONS) {
            console.log(`Fetching jobs for: ${loc}`);

            // Limit iterations for demo purposes (0, 25, 50, 75)
            for (let start = 0; start < 100; start += 25) {
                const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Frontend%20Engineer&location=${encodeURIComponent(loc)}&start=${start}`;

                try {
                    // Rate limiting
                    await new Promise(r => setTimeout(r, 2000));

                    const response = await axios.get(url, { headers, validateStatus: () => true });

                    if (response.status !== 200) {
                        console.log(`  Failed with status ${response.status}`);
                        if (response.status === 429) {
                            console.log("  Rate limit hit.");
                            break;
                        }
                        continue;
                    }

                    const html = response.data;
                    const $ = cheerio.load(html);
                    const jobCards = $('li');

                    if (jobCards.length === 0) {
                        console.log("  No more jobs found.");
                        break;
                    }

                    let jobsOnPage = 0;

                    // Iterate using standard loop to await DB inserts
                    for (let i = 0; i < jobCards.length; i++) {
                        const card = $(jobCards[i]);
                        const title = card.find('h3.base-search-card__title').text().trim() || "Unknown";
                        const company = card.find('h4.base-search-card__subtitle').text().trim() || "Unknown";
                        const location = card.find('span.job-search-card__location').text().trim() || "";
                        const dateStr = card.find('time.job-search-card__listdate').attr('datetime') || "";
                        const link = card.find('a.base-card__full-link').attr('href') || "";

                        const imgTag = card.find('img.artdeco-entity-image');
                        const logo = imgTag.attr('data-delayed-url') || imgTag.attr('src') || "";

                        const urnDiv = card.find('div.base-search-card');
                        let urn = urnDiv.attr('data-entity-urn');

                        // Fallback urn logic
                        if (!urn) {
                            if (link) urn = link.split('?')[0];
                            else urn = `${company}-${title}-${location}`; // Make it slightly more unique
                        }

                        // Only insert if valid title/company
                        if (title !== "Unknown" && company !== "Unknown") {
                            await runQuery(`
                                INSERT OR REPLACE INTO jobs (id, title, company, location, date, link, logo, lat, lng, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
                            `, [urn, title, company, location, dateStr, link, logo]);

                            jobsOnPage++;
                            totalAdded++;
                        }
                    }

                    console.log(`  Processed ${jobsOnPage} jobs.`);

                } catch (err) {
                    console.error(`  Error fetching page: ${err.message}`);
                }
            }
        }

        console.log(`Finished. Total jobs processed: ${totalAdded}`);
        db.close();

    } catch (err) {
        console.error('Fatal error:', err);
    }
}

if (require.main === module) {
    fetchJobs();
}

module.exports = fetchJobs;
