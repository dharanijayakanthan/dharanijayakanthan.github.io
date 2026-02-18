import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../public/jobs.json');
const CACHE_FILE = path.join(__dirname, '../public/location-cache.json');

// Static locations for common Bangalore areas to avoid API calls
const STATIC_LOCATIONS = {
    "bengaluru": { lat: 12.9716, lng: 77.5946 },
    "bangalore": { lat: 12.9716, lng: 77.5946 },
    "bengaluru, karnataka, india": { lat: 12.9716, lng: 77.5946 },
    "bangalore urban": { lat: 12.9716, lng: 77.5946 },
    "greater bengaluru area": { lat: 12.9716, lng: 77.5946 },
    "whitefield": { lat: 12.9698, lng: 77.7500 },
    "whitefield, bengaluru": { lat: 12.9698, lng: 77.7500 },
    "electronic city": { lat: 12.8399, lng: 77.6770 },
    "hsr layout": { lat: 12.9121, lng: 77.6446 },
    "koramangala": { lat: 12.9352, lng: 77.6245 },
    "indiranagar": { lat: 12.9784, lng: 77.6408 },
    "jayanagar": { lat: 12.9308, lng: 77.5838 },
    "jp nagar": { lat: 12.9063, lng: 77.5857 },
    "marathahalli": { lat: 12.9592, lng: 77.6974 },
    "bellandur": { lat: 12.9304, lng: 77.6784 },
    "sarjapur": { lat: 12.8596, lng: 77.7712 },
    "banashankari": { lat: 12.9255, lng: 77.5468 },
    "hebbal": { lat: 13.0354, lng: 77.5988 },
    "yelahanka": { lat: 13.1005, lng: 77.5963 },
    "k r puram": { lat: 13.0103, lng: 77.7024 },
    "kr puram": { lat: 13.0103, lng: 77.7024 },
    "domlur": { lat: 12.9606, lng: 77.6416 },
    "shivajinagar": { lat: 12.9857, lng: 77.6057 },
    "malleshwaram": { lat: 13.0031, lng: 77.5643 },
    "rajajinagar": { lat: 12.9982, lng: 77.5530 },
    "btm layout": { lat: 12.9166, lng: 77.6101 },
    "mg road": { lat: 12.9756, lng: 77.6066 },
    "brigade road": { lat: 12.9709, lng: 77.6074 },
    "richmond road": { lat: 12.9667, lng: 77.6094 },
    "residency road": { lat: 12.9686, lng: 77.6062 },
    "ulsoor": { lat: 12.9817, lng: 77.6288 },
    "vasanth nagar": { lat: 12.9901, lng: 77.5911 },
    "frazer town": { lat: 12.9968, lng: 77.6130 },
    "cooke town": { lat: 12.9984, lng: 77.6253 },
    "benson town": { lat: 13.0031, lng: 77.5967 },
    "rt nagar": { lat: 13.0247, lng: 77.5948 },
    "sanjay nagar": { lat: 13.0410, lng: 77.5752 },
    "sahakara nagar": { lat: 13.0623, lng: 77.5871 },
    "vidyaranyapura": { lat: 13.0766, lng: 77.5577 },
    "peenya": { lat: 13.0285, lng: 77.5197 },
    "yeshwanthpur": { lat: 13.0238, lng: 77.5529 },
    "mathikere": { lat: 13.0334, lng: 77.5640 },
    "mahadevapura": { lat: 12.9875, lng: 77.6800 },
    "kaggadasapura": { lat: 12.9847, lng: 77.6775 },
    "cv raman nagar": { lat: 12.9855, lng: 77.6639 },
    "old airport road": { lat: 12.9600, lng: 77.6500 },
    "new bel road": { lat: 13.0365, lng: 77.5684 },
    "kengeri": { lat: 12.9177, lng: 77.4833 },
    "rr nagar": { lat: 12.9255, lng: 77.5150 },
    "rajarajeshwari nagar": { lat: 12.9255, lng: 77.5150 },
    "mysore road": { lat: 12.9421, lng: 77.5028 },
    "bannerghatta road": { lat: 12.8943, lng: 77.5985 },
    "electronic city phase 1": { lat: 12.8452, lng: 77.6602 },
    "electronic city phase 2": { lat: 12.8468, lng: 77.6763 },
    "sarjapur road": { lat: 12.9116, lng: 77.6745 },
    "outer ring road": { lat: 12.9279, lng: 77.6271 },
    "silk board": { lat: 12.9177, lng: 77.6233 },
    "madiwala": { lat: 12.9226, lng: 77.6174 },
    "bomanahalli": { lat: 12.9080, lng: 77.6240 },
    "hosur road": { lat: 12.9166, lng: 77.6236 },
    "kudlu gate": { lat: 12.8931, lng: 77.6406 },
    "harlur": { lat: 12.9079, lng: 77.6569 }
};

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

function normalizeLocation(loc) {
    if (!loc) return "";
    return loc.toLowerCase()
        .replace(/, karnataka, india/g, "")
        .replace(/, india/g, "")
        .replace(/, bangalore/g, "")
        .replace(/, bengaluru/g, "")
        .replace(/ greater bengaluru area/g, "")
        .trim();
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

        // Apply coordinates: Static > Cache > null
        let jobsWithCoords = 0;
        let staticHits = 0;
        let cacheHits = 0;

        allJobs.forEach(job => {
            const rawLoc = job.location ? job.location.toLowerCase() : "";
            const normLoc = normalizeLocation(job.location);
            const companyLoc = `${job.company}, ${job.location}`;

            // 1. Try Cache First (High Precision: "Company, Location")
            if (locationCache[companyLoc] && locationCache[companyLoc].lat !== 0) {
                job.lat = locationCache[companyLoc].lat;
                job.lng = locationCache[companyLoc].lng;
                cacheHits++;
                jobsWithCoords++;
            }
            // 2. Try Static (Generic Area)
            else if (STATIC_LOCATIONS[rawLoc]) {
                job.lat = STATIC_LOCATIONS[rawLoc].lat;
                job.lng = STATIC_LOCATIONS[rawLoc].lng;
                staticHits++;
                jobsWithCoords++;
            }
            else if (STATIC_LOCATIONS[normLoc]) {
                job.lat = STATIC_LOCATIONS[normLoc].lat;
                job.lng = STATIC_LOCATIONS[normLoc].lng;
                staticHits++;
                jobsWithCoords++;
            }
        });

        console.log(`Matched ${jobsWithCoords} jobs (Static: ${staticHits}, Cache: ${cacheHits}).`);

        const jobsNeedingCoords = allJobs.filter(j =>
            (!j.lat || j.lat === 0) && (!j.lng || j.lng === 0)
        );

        if (jobsNeedingCoords.length === 0) {
            console.log('All jobs have coordinates.');

            // Save anyway to update any jobs that got static coords
            fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2));
            process.exit(0);
        }

        // Group by unique company+location
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

        // Process up to 100 new locations per run (reduced since we have static now)
        const keysToProcess = uniqueKeys.slice(0, 100);
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
                    runCommand('git pull --rebase');
                    runCommand(`git add ${JOBS_FILE} ${CACHE_FILE}`);
                    runCommand('git commit -m "chore: batch update geocoded jobs [skip ci]"');
                    runCommand('git push');
                    batchCount = 0;
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
