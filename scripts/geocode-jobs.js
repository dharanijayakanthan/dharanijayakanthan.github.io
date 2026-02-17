
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../public/jobs.json');
const CACHE_FILE = path.join(__dirname, '../public/location-cache.json');

async function geocodeJobs() {
    try {
        console.log('Starting Geocoding Process...');

        if (!fs.existsSync(JOBS_FILE)) {
            console.error('Jobs file not found!');
            process.exit(1);
        }

        const allJobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));

        // Load Cache
        let locationCache = {};
        if (fs.existsSync(CACHE_FILE)) {
            try {
                locationCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
            } catch (e) {
                console.warn("Could not parse cache, starting fresh.");
            }
        }

        // Apply cached coordinates to jobs immediately
        let jobsWithCoords = 0;
        allJobs.forEach(job => {
            const key = `${job.company}, ${job.location}`;
            if (locationCache[key]) {
                job.lat = locationCache[key].lat;
                job.lng = locationCache[key].lng;
                jobsWithCoords++;
            }
        });
        console.log(`Initially matched ${jobsWithCoords} jobs from cache.`);

        // Identify missing locations
        const jobsNeedingCoords = allJobs.filter(j =>
            (!j.lat || j.lat === 0) && (!j.lng || j.lng === 0)
        );

        if (jobsNeedingCoords.length === 0) {
            console.log('All jobs have coordinates. Exiting.');
            process.exit(0);
        }

        const locationMap = new Map();
        jobsNeedingCoords.forEach(job => {
            const key = `${job.company}, ${job.location}`;
            // If it's in cache (e.g. as a failure {lat:0,lng:0}), we would have applied it above.
            // So if we are here, it means it's NOT in cache at all.
            if (!locationCache[key]) {
                if (!locationMap.has(key)) {
                    locationMap.set(key, []);
                }
                locationMap.get(key).push(job);
            }
        });

        const uniqueKeys = Array.from(locationMap.keys());
        console.log(`Found ${uniqueKeys.length} new unique locations to geocode.`);

        // Process up to 300 new locations per run
        const keysToProcess = uniqueKeys.slice(0, 300);
        let successfulGeocodes = 0;

        for (const key of keysToProcess) {
            // Check cache again just in case (though we filtered)
            if (locationCache[key]) continue;

            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 1100));

            try {
                console.log(`    Geocoding: ${key}...`);
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key)}&format=json&limit=1`;

                const response = await fetch(url, {
                    headers: { "User-Agent": "JobScraper/1.0 (dharani@example.com)" }
                });

                let coords = { lat: 0, lng: 0 };

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                        successfulGeocodes++;
                    } else {
                        console.log(`      -> Not found.`);
                    }
                } else {
                    console.warn(`      -> HTTP Error ${response.status}`);
                }

                // Update Cache
                locationCache[key] = coords;

                // Update in-memory jobs
                if (locationMap.has(key)) {
                    locationMap.get(key).forEach(job => {
                        job.lat = coords.lat;
                        job.lng = coords.lng;
                    });
                }

            } catch (err) {
                console.error(`      -> Error: ${err.message}`);
            }
        }

        console.log(`Geocoding complete. Resolved ${successfulGeocodes}/${keysToProcess.length} locations.`);

        // Save jobs
        fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2));
        // Save cache
        fs.writeFileSync(CACHE_FILE, JSON.stringify(locationCache, null, 2));

        console.log(`Location cache and jobs file updated.`);

    } catch (error) {
        console.error('Fatal error in geocode-jobs:', error);
        process.exit(1);
    }
}

geocodeJobs();
