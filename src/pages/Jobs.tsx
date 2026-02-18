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

    const filteredJobs = jobs.filter(job => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );

        let matchesLocation = true;
        if (selectedLocation) {
            const loc = selectedLocation.toLowerCase();
            const jobLoc = job.location.toLowerCase();
            matchesLocation = jobLoc.includes(loc);

            // If strict string match fails, check if the job is in a known sub-area? 
            // For now, simple string matching is likely failing because "Bengaluru" is in every string 
            // but specific areas might not be explicit in the job.location string if it just says "Bengaluru, Karnataka".
            // However, our geocoder *assigned* lat/lng based on company name for those generic ones.
            // We can't filter those by area easily unless we reverse-geocode or store the 'area' in the job object.

            // Allow if the selected location is "Bengaluru" (generic) and the job location contains it
            if (!matchesLocation && loc === 'bengaluru') {
                matchesLocation = jobLoc.includes('bengaluru') || jobLoc.includes('bangalore');
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
