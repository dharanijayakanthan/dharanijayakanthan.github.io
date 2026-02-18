import { useEffect, useState } from 'react';
import { BentoTile } from '../components/ui/BentoTile';
import { MapPin, Calendar, ExternalLink, Building2, Map as MapIcon, List, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { JobMap } from '../components/JobMap';

interface Job {
    title: string;
    company: string;
    location: string;
    date: string;
    link: string;
    logo: string;
    lat?: number;
    lng?: number;
}

export const Jobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    const MAJOR_LOCATIONS = [
        "Whitefield",
        "Electronic City",
        "HSR Layout",
        "Koramangala",
        "Indiranagar",
        "Marathahalli",
        "Bellandur",
        "Hebbal",
        "Jayanagar",
        "JP Nagar",
        "Sarjapur",
        "Manyata Tech Park",
        "Bagmane Tech Park",
        "Ecospace"
    ];

    useEffect(() => {
        const timestamp = new Date().getTime();
        fetch(`/jobs.json?v=${timestamp}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch jobs');
                }
                return res.json();
            })
            .then((data) => {
                setJobs(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error loading jobs:', err);
                setError('Failed to load job listings.');
                setLoading(false);
            });
    }, []);

    // Simplified coordinates for major districts - used for radial filtering
    // This allows us to find jobs "near" a selected location even if the text doesn't match perfectly
    const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
        "Whitefield": { lat: 12.9698, lng: 77.7500 },
        "Electronic City": { lat: 12.8399, lng: 77.6770 },
        "HSR Layout": { lat: 12.9121, lng: 77.6446 },
        "Koramangala": { lat: 12.9352, lng: 77.6245 },
        "Indiranagar": { lat: 12.9784, lng: 77.6408 },
        "Marathahalli": { lat: 12.9592, lng: 77.6974 },
        "Bellandur": { lat: 12.9304, lng: 77.6784 },
        "Hebbal": { lat: 13.0354, lng: 77.5988 },
        "Jayanagar": { lat: 12.9308, lng: 77.5838 },
        "JP Nagar": { lat: 12.9063, lng: 77.5857 },
        "Sarjapur": { lat: 12.9116, lng: 77.6745 },
        "Manyata Tech Park": { lat: 13.0490, lng: 77.6190 },
        "Bagmane Tech Park": { lat: 12.9806, lng: 77.6647 },
        "Ecospace": { lat: 12.9272, lng: 77.6773 },
        "Domlur": { lat: 12.9606, lng: 77.6416 },
        "BTM Layout": { lat: 12.9166, lng: 77.6101 },
        "Brookefield": { lat: 12.9654, lng: 77.7185 },
        "Varthur": { lat: 12.9389, lng: 77.7412 },
        "Mahadevapura": { lat: 12.9875, lng: 77.6800 },
        "Bannerghatta Road": { lat: 12.8943, lng: 77.5985 },
        "CV Raman Nagar": { lat: 12.9855, lng: 77.6639 },
        "KR Puram": { lat: 13.0031, lng: 77.7024 },
        "Yelahanka": { lat: 13.1005, lng: 77.5963 },
        "Rajajinagar": { lat: 12.9904, lng: 77.5532 },
        "Malleshwaram": { lat: 13.0031, lng: 77.5643 },
        "Banashankari": { lat: 12.9255, lng: 77.5468 },
        "Ulsoor": { lat: 12.9817, lng: 77.6288 },
        "Frazer Town": { lat: 12.9968, lng: 77.6130 },
        "Kalyan Nagar": { lat: 13.0232, lng: 77.6436 },
        "RT Nagar": { lat: 13.0247, lng: 77.5948 },
        "Yeshwanthpur": { lat: 13.0253, lng: 77.5492 },
        "Peenya": { lat: 13.0285, lng: 77.5197 },
        "Richmond Road": { lat: 12.9667, lng: 77.6094 },
        "MG Road": { lat: 12.9756, lng: 77.6066 },
        "Brigade Road": { lat: 12.9709, lng: 77.6074 },
        "Kaggadasapura": { lat: 12.9847, lng: 77.6775 },
        "Harlur": { lat: 12.9079, lng: 77.6569 },
        "Kudlu Gate": { lat: 12.8931, lng: 77.6406 },
        "Silk Board": { lat: 12.9177, lng: 77.6233 },
        "Bommanahalli": { lat: 12.9080, lng: 77.6240 },
        "Hoodi": { lat: 12.9922, lng: 77.7159 },
        "ITPL": { lat: 12.9877, lng: 77.7378 },
        "Kadubeesanahalli": { lat: 12.9351, lng: 77.6947 },
        "Kundalahalli": { lat: 12.9698, lng: 77.7126 },
        "AECS Layout": { lat: 12.9634, lng: 77.7126 },
        "Hennur": { lat: 13.0375, lng: 77.6369 }
    };

    // Calculate distance properly using Haversine needed? 
    // For small filters, simple Euclidean distance on lat/lng is sufficient and faster
    const isWithinRadius = (jobLat: number, jobLng: number, targetLat: number, targetLng: number, radiusKm: number = 3) => {
        // Approx 1 degree lat = 110.574 km
        const latDiff = Math.abs(jobLat - targetLat) * 110.574;
        // Approx 1 degree lng at 13 deg N = 111.320*cos(13) = ~108 km
        const lngDiff = Math.abs(jobLng - targetLng) * 108.0;

        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) <= radiusKm;
    };

    const filteredJobs = jobs.filter(job => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );

        let matchesLocation = true;
        if (selectedLocation) {
            const lowerLoc = selectedLocation.toLowerCase();

            // 1. Check String Match first (Text Filter)
            const textMatch = job.location.toLowerCase().includes(lowerLoc);

            // 2. Check Coordinate Match (Spatial Filter)
            let coordMatch = false;
            // Only use coordinate filter if the job has valid coordinates and is NOT the generic Bangalore center
            const hasValidCoords = job.lat && job.lng && job.lat !== 0 && job.lng !== 0;
            const isGenericBangalore = hasValidCoords && Math.abs(job.lat! - 12.9716) < 0.005 && Math.abs(job.lng! - 77.5946) < 0.005;

            if (hasValidCoords && !isGenericBangalore && DISTRICT_COORDINATES[selectedLocation]) {
                const target = DISTRICT_COORDINATES[selectedLocation];
                // Use 4km radius for "nearby" jobs
                coordMatch = isWithinRadius(job.lat!, job.lng!, target.lat, target.lng, 4);
            }

            matchesLocation = textMatch || coordMatch;

            // Special case for generic "Bengaluru" text matches if no specific location selected
            if (!matchesLocation && lowerLoc === 'bengaluru') {
                matchesLocation = job.location.toLowerCase().includes('bengaluru') || job.location.toLowerCase().includes('bangalore');
            }
        }

        return matchesSearch && matchesLocation;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-10">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Frontend Opportunities</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Curated list of Frontend Engineering roles in Bangalore. Updated daily
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Location Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 pl-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <option value="">All Locations</option>
                            {MAJOR_LOCATIONS.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                            <MapPin size={14} />
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'map'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            title="Map View"
                        >
                            <MapIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by title, company, or location..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {viewMode === 'map' ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <JobMap jobs={filteredJobs} />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Showing {filteredJobs.filter(j => j.lat && j.lng && j.lat !== 0).length} locations on map
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => (
                            <motion.div
                                key={`${job.company}-${job.title}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <BentoTile className="h-full flex flex-col hover:shadow-md transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {job.logo ? (
                                                <img
                                                    src={job.logo}
                                                    alt={`${job.company} logo`}
                                                    className="w-12 h-12 object-contain rounded-md bg-white p-1 border border-gray-100 dark:border-gray-600"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + job.company.charAt(0);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xl">
                                                    {job.company.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1" title={job.title}>{job.title}</h3>
                                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                                    <Building2 size={14} />
                                                    <span className="line-clamp-1">{job.company}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <MapPin size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                            <span className="line-clamp-1">{job.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                            <span>Posted: {job.date}</span>
                                        </div>

                                        <a
                                            href={job.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 block w-full py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-center rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Apply Now
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </BentoTile>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No jobs found matching your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
