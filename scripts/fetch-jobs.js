import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../public/jobs.json');

const LINKEDIN_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Frontend%20Engineer&location=Bengaluru%2C%20Karnataka%2C%20India&start=0";

async function fetchJobs() {
    try {
        console.log('Fetching jobs from LinkedIn...');
        const response = await fetch(LINKEDIN_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "*/*"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const jobs = [];

        $('li').each((i, el) => {
            const title = $(el).find('h3.base-search-card__title').text().trim();
            const company = $(el).find('h4.base-search-card__subtitle a').text().trim();
            const location = $(el).find('span.job-search-card__location').text().trim();
            const date = $(el).find('time.job-search-card__listdate').attr('datetime');
            const link = $(el).find('a.base-card__full-link').attr('href');
            const logo = $(el).find('img.artdeco-entity-image').attr('data-delayed-url') || $(el).find('img.artdeco-entity-image').attr('src');

            if (title && company) {
                jobs.push({
                    title,
                    company,
                    location,
                    date,
                    link,
                    logo
                });
            }
        });

        console.log(`Found ${jobs.length} jobs.`);

        // Save to public/jobs.json
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jobs, null, 2));
        console.log(`Saved jobs to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error fetching jobs:', error);
        process.exit(1);
    }
}

fetchJobs();
