import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../public/jobs.json');
const CACHE_FILE = path.join(__dirname, '../public/location-cache.json');

const TARGET_LOCATIONS = [
    "HSR Layout, Bengaluru, Karnataka, India",
    "Koramangala, Bengaluru, Karnataka, India",
    "Whitefield, Bengaluru, Karnataka, India",
    // Fallback to broader search if specific ones yield few results
    "Bengaluru, Karnataka, India"
];

// Load existing cache
let locationCache = {};
if (fs.existsSync(CACHE_FILE)) {
    try {
        locationCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
        console.warn("Could not parse location cache, starting fresh.");
    }
}

async function geocodeLocation(company, location) {
    // Create a unique key for the cache
    const query = `${company}, ${location}`;

    // Check cache first
    if (locationCache[query]) {
        return locationCache[query];
    }

    // Rate limit: Nominatim requires 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        console.log(`    Geocoding: ${query}...`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "JobScraper/1.0 (dharani@example.com)"
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                locationCache[query] = coords;
                return coords;
            } else {
                console.log(`    No coordinates found for ${query}`);
                // Cache null so we don't retry forever
                locationCache[query] = { lat: 0, lng: 0 };
                return null;
            }
        }
    } catch (err) {
        console.error(`    Geocoding failed for ${query}:`, err.message);
    }
    return null;
}

async function fetchJobs() {
    try {
        console.log('Starting job fetch cycle...');

        let allJobs = [];

        // Attempt to load existing jobs to preserve data
        if (fs.existsSync(OUTPUT_FILE)) {
            try {
                const existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
                if (Array.isArray(existingData)) {
                    allJobs = existingData;
                    console.log(`Loaded ${allJobs.length} existing jobs.`);
                }
            } catch (e) {
                console.warn("Could not read existing jobs file, starting fresh.");
            }
        }

        const uniqueJobIds = new Set(allJobs.map(j => j.id));
        let newJobsCount = 0;

        // Loop through locations
        // We limit the total fetch to avoid timeouts, prioritizing specific locations
        for (const loc of TARGET_LOCATIONS) {
            console.log(`\n=== Fetching for location: ${loc} ===`);

            // Pagination: start=0, 25, 50...
            // Fetch up to 1000 jobs (40 pages) per location or until no results
            for (let start = 0; start < 1000; start += 25) {
                const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Frontend%20Engineer&location=${encodeURIComponent(loc)}&start=${start}`;
                console.log(`  Fetching page offset ${start}...`);

                try {
                    // Rate limit for LinkedIn
                    await new Promise(r => setTimeout(r, 2000));

                    const response = await fetch(url, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Accept": "*/*"
                        }
                    });

                    if (!response.ok) {
                        console.warn(`  Failed to fetch: ${response.status}`);
                        if (response.status === 429) {
                            console.warn("  Rate limit hit. Stopping this location.");
                            break;
                        }
                        continue;
                    }

                    const html = await response.text();
                    if (!html) break;

                    const $ = cheerio.load(html);
                    let jobsFoundOnPage = 0;

                    $('li').each((i, el) => {
                        const title = $(el).find('h3.base-search-card__title').text().trim();
                        const company = $(el).find('h4.base-search-card__subtitle a').text().trim();
                        const location = $(el).find('span.job-search-card__location').text().trim();
                        const date = $(el).find('time.job-search-card__listdate').attr('datetime');
                        const link = $(el).find('a.base-card__full-link').attr('href');
                        const logo = $(el).find('img.artdeco-entity-image').attr('data-delayed-url') || $(el).find('img.artdeco-entity-image').attr('src');

                        // Construct a unique ID based on the URN or Link
                        const urn = $(el).find('div.base-search-card').attr('data-entity-urn')
                            || (link ? link.split('?')[0] : null)
                            || `${company}-${title}-${location}`;

                        if (title && company && urn) {
                            jobsFoundOnPage++;

                            // Clean up strings so title/company don't have excessive whitespace
                            const cleanTitle = title.replace(/\s+/g, ' ');
                            const cleanCompany = company.replace(/\s+/g, ' ');

                            if (!uniqueJobIds.has(urn)) {
                                allJobs.push({
                                    id: urn,
                                    title: cleanTitle,
                                    company: cleanCompany,
                                    location: location,
                                    date,
                                    link,
                                    logo,
                                    lat: 0,
                                    lng: 0
                                });
                                uniqueJobIds.add(urn);
                                newJobsCount++;
                            }
                        }
                    });

                    console.log(`  Found ${jobsFoundOnPage} jobs on this page.`);

                    if (jobsFoundOnPage === 0) {
                        console.log("  No more jobs found for this location.");
                        break;
                    }

                } catch (err) {
                    console.error(`  Error processing page ${start}:`, err.message);
                }
            }
        }

        console.log(`\nTotal jobs now: ${allJobs.length} (New: ${newJobsCount})`);

        // --- Geocoding Phase ---
        console.log('\n=== Starting Geocoding Phase ===');

        // 1. Identify unique locations (Company + Location string)
        const jobsNeedingCoords = allJobs.filter(j =>
            (!j.lat || j.lat === 0) && (!j.lng || j.lng === 0)
        );

        const locationMap = new Map();
        jobsNeedingCoords.forEach(job => {
            const key = `${job.company}, ${job.location}`;
            if (!locationMap.has(key)) {
                locationMap.set(key, []);
            }
            locationMap.get(key).push(job);
        });

        const uniqueKeys = Array.from(locationMap.keys());
        console.log(`Found ${uniqueKeys.length} unique locations to geocode (for ${jobsNeedingCoords.length} new jobs).`);

        // Limit to 200 unique location lookups per run to save time
        const keysToProcess = uniqueKeys.slice(0, 200);
        let successfulGeocodes = 0;

        for (const key of keysToProcess) {
            // Check cache first
            if (locationCache[key]) {
                const coords = locationCache[key];
                // Apply to all jobs with this location
                locationMap.get(key).forEach(job => {
                    job.lat = coords.lat;
                    job.lng = coords.lng;
                });
                continue;
            }

            // It's a cache miss, so we fetch
            await new Promise(resolve => setTimeout(resolve, 1200));

            try {
                console.log(`    Geocoding: ${key}...`);
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key)}&format=json&limit=1`;

                const response = await fetch(url, {
                    headers: { "User-Agent": "JobScraper/1.0 (dharani@example.com)" }
                });

                if (response.ok) {
                    const data = await response.json();
                    let coords = { lat: 0, lng: 0 };

                    if (data && data.length > 0) {
                        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                        successfulGeocodes++;
                    } else {
                        console.log(`      -> Not found.`);
                    }

                    // Cache result (even if 0,0 - to avoid infinite retries)
                    locationCache[key] = coords;

                    // Apply to all jobs
                    locationMap.get(key).forEach(job => {
                        job.lat = coords.lat;
                        job.lng = coords.lng;
                    });
                } else {
                    console.warn(`      -> HTTP Error ${response.status}`);
                }

            } catch (err) {
                console.error(`      -> Error: ${err.message}`);
            }
        }

        console.log(`Geocoding complete. Successfully resolved ${successfulGeocodes} new locations.`);

        // cleaning up: Sort by date
        allJobs.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });

        // Save results
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allJobs, null, 2));
        fs.writeFileSync(CACHE_FILE, JSON.stringify(locationCache, null, 2));

        console.log(`Successfully saved ${allJobs.length} jobs to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Fatal error in fetch-jobs:', error);
        process.exit(1);
    }
}

fetchJobs();
