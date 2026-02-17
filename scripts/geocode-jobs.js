import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../public/jobs.json');
const CACHE_FILE = path.join(__dirname, '../public/location-cache.json');

// Helper to run shell commands
function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (e) {
        console.warn(`Command failed: ${command}`, e.message);
    }
}

async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 503 || response.status === 429) {
                const delay = 3000 * (i + 1); // Exponential backoff starting at 3s
                console.warn(`    Received ${response.status}. Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            return response;
        } catch (err) {
            console.warn(`    Fetch error: ${err.message}. Retrying...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return null;
}

async function geocodeJobs() {
    try {
        console.log('Starting Geocoding Process...');

        // Configure Git for batch commits inside the script
        try {
            runCommand('git config --global user.name "github-actions[bot]"');
            runCommand('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
        } catch (e) { }

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

        const jobsNeedingCoords = allJobs.filter(j =>
            (!j.lat || j.lat === 0) && (!j.lng || j.lng === 0)
        );

        if (jobsNeedingCoords.length === 0) {
            console.log('All jobs have coordinates.');
            process.exit(0);
        }

        const locationMap = new Map();
        jobsNeedingCoords.forEach(job => {
            const key = `${job.company}, ${job.location}`;
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
        let batchCount = 0;

        for (const key of keysToProcess) {
            if (locationCache[key]) continue;

            // Rate limit (2s to be safe)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key)}&format=json&limit=1`;

            console.log(`    Geocoding: ${key}...`);
            const response = await fetchWithRetry(url, {
                headers: {
                    "User-Agent": "DharaniPortfolio/1.0 (https://dharanijayakanthan.github.io)",
                    "Referer": "https://dharanijayakanthan.github.io"
                }
            });

            let coords = { lat: 0, lng: 0 };

            if (response && response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                    successfulGeocodes++;
                    batchCount++;
                } else {
                    console.log(`      -> Not found.`);
                }
            } else if (response) {
                console.warn(`      -> HTTP Error ${response.status}`);
            }

            // Update Cache & Jobs (even if not found, cache 0,0)
            locationCache[key] = coords;
            if (locationMap.has(key)) {
                locationMap.get(key).forEach(job => {
                    job.lat = coords.lat;
                    job.lng = coords.lng;
                });
            }

            // Save and Push every 25 successful geocodes
            if (batchCount >= 25) {
                console.log('    Batch limit reached. Saving and pushing progress...');
                fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2));
                fs.writeFileSync(CACHE_FILE, JSON.stringify(locationCache, null, 2));

                try {
                    runCommand('git pull --rebase'); // Sync with remote
                    runCommand(`git add ${JOBS_FILE} ${CACHE_FILE}`);
                    runCommand('git commit -m "chore: batch update geocoded jobs [skip ci]"');
                    runCommand('git push');
                    batchCount = 0; // Reset batch
                } catch (e) {
                    console.warn("Batch push failed, continuing...", e);
                }
            }
        }

        console.log(`Geocoding complete. Resolved ${successfulGeocodes}/${keysToProcess.length} locations.`);

        // Final Save
        fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2));
        fs.writeFileSync(CACHE_FILE, JSON.stringify(locationCache, null, 2));
        console.log(`All changes saved locally.`);

    } catch (error) {
        console.error('Fatal error in geocode-jobs:', error);
        process.exit(1);
    }
}

geocodeJobs();
