import { useEffect, useState, useMemo } from 'react';
import { BentoTile } from '../components/ui/BentoTile';
import { MapPin, Calendar, ExternalLink, Building2, Map as MapIcon, List, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobMap } from '../components/JobMap';
import { FilterDropdown } from '../components/ui/FilterDropdown';

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

const getExperienceLevel = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('intern') || t.includes('trainee') || t.includes('stagiary')) return 'Internship';
    if (t.includes('senior') || t.includes('sr') || t.includes('lead') || t.includes('principal') || t.includes('architect') || t.includes('staff')) return 'Senior Level';
    if (t.includes('manager') || t.includes('head') || t.includes('director') || t.includes('vp') || t.includes('chief') || t.includes('executive')) return 'Management';
    if (t.includes('junior') || t.includes('jr') || t.includes('entry') || t.includes('graduate') || t.includes('fresh') || t.includes('associate')) return 'Entry Level';
    return 'Mid Level';
};

const getTechStack = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('frontend') || t.includes('front-end') || t.includes('react') || t.includes('angular') || t.includes('vue') || t.includes('ui')) return 'Frontend';
    if (t.includes('backend') || t.includes('back-end') || t.includes('node') || t.includes('java') || t.includes('python') || t.includes('golang') || t.includes('ruby')) return 'Backend';
    if (t.includes('full stack') || t.includes('full-stack') || t.includes('software engineer') || t.includes('developer')) return 'Full Stack';
    if (t.includes('devops') || t.includes('cloud') || t.includes('aws') || t.includes('azure') || t.includes('sre') || t.includes('infrastructure')) return 'DevOps';
    if (t.includes('data') || t.includes('scientist') || t.includes('analyst') || t.includes('machine learning') || t.includes('ai')) return 'Data/AI';
    if (t.includes('test') || t.includes('qa') || t.includes('quality')) return 'QA/Testing';
    if (t.includes('product') || t.includes('project')) return 'Product';
    return 'Other';
};

export const Jobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    // New Filters State
    const [dateFilter, setDateFilter] = useState<string[]>(['all']);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
    const [selectedTechStack, setSelectedTechStack] = useState<string>('All');
    const [remoteFilter, setRemoteFilter] = useState<string>('Any');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showTechStack, setShowTechStack] = useState(false);

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

    // Base Filter Logic (Reusable for counts)
    const filterJob = (job: Job, filters: {
        query: string,
        loc: string,
        date: string[],
        companies: string[],
        exp: string[],
        tech: string,
        remote: string
    }) => {
        // 1. Search Query
        if (filters.query) {
            const matchesSearch = (
                job.title.toLowerCase().includes(filters.query) ||
                job.company.toLowerCase().includes(filters.query) ||
                job.location.toLowerCase().includes(filters.query)
            );
            if (!matchesSearch) return false;
        }

        // 2. Location matches
        if (filters.loc) {
            const lowerLoc = filters.loc.toLowerCase();
            const textMatch = job.location.toLowerCase().includes(lowerLoc);
            let coordMatch = false;
            const hasValidCoords = job.lat && job.lng && job.lat !== 0 && job.lng !== 0;
            const isGenericBangalore = hasValidCoords && Math.abs(job.lat! - 12.9716) < 0.005 && Math.abs(job.lng! - 77.5946) < 0.005;

            if (hasValidCoords && !isGenericBangalore && DISTRICT_COORDINATES[filters.loc]) {
                const target = DISTRICT_COORDINATES[filters.loc];
                coordMatch = isWithinRadius(job.lat!, job.lng!, target.lat, target.lng, 4);
            }
            let matchesLocation = textMatch || coordMatch;
            if (!matchesLocation && lowerLoc === 'bengaluru') {
                matchesLocation = job.location.toLowerCase().includes('bengaluru') || job.location.toLowerCase().includes('bangalore');
            }
            if (!matchesLocation) return false;
        }

        // 3. Date Filter
        const dFilter = filters.date[0];
        if (dFilter && dFilter !== 'all') {
            const jobDate = new Date(job.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - jobDate.getTime());
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (dFilter === '24h' && diffDays > 1) return false;
            if (dFilter === '7d' && diffDays > 7) return false;
            if (dFilter === '30d' && diffDays > 30) return false;
        }

        // 4. Company Filter
        if (filters.companies.length > 0) {
            if (!filters.companies.includes(job.company)) return false;
        }

        // 5. Experience Filter
        if (filters.exp.length > 0) {
            const level = getExperienceLevel(job.title);
            if (!filters.exp.includes(level)) return false;
        }

        // 6. Tech Stack Filter
        if (filters.tech !== 'All') {
            const stack = getTechStack(job.title);
            if (stack !== filters.tech) return false;
        }

        // 7. Remote Filter
        if (filters.remote !== 'Any') {
            const isRemote = job.location.toLowerCase().includes('remote') || job.title.toLowerCase().includes('remote');
            const isHybrid = job.location.toLowerCase().includes('hybrid') || job.title.toLowerCase().includes('hybrid');

            if (filters.remote === 'Remote' && !isRemote) return false;
            if (filters.remote === 'Hybrid' && !isHybrid) return false;
        }

        return true;
    };

    // Derived Options for Filters - CASCADE LOGIC
    // We calculate available options based on CURRENTLY filtered set (minus the filter itself to avoid disappearing options)
    const companyOptions = useMemo(() => {
        // Filter based on everything EXCEPT company
        const relevantJobs = jobs.filter(job => filterJob(job, {
            query: searchQuery.toLowerCase(),
            loc: selectedLocation,
            date: dateFilter,
            companies: [], // Ignore self
            exp: selectedExperience,
            tech: selectedTechStack,
            remote: remoteFilter
        }));

        const counts: Record<string, number> = {};
        relevantJobs.forEach(job => {
            counts[job.company] = (counts[job.company] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100)
            .map(([name, count]) => ({ value: name, label: name, count }));
    }, [jobs, searchQuery, selectedLocation, dateFilter, selectedExperience, selectedTechStack, remoteFilter]);

    const experienceOptions = useMemo(() => {
        // Filter based on everything EXCEPT experience
        const relevantJobs = jobs.filter(job => filterJob(job, {
            query: searchQuery.toLowerCase(),
            loc: selectedLocation,
            date: dateFilter,
            companies: selectedCompanies,
            exp: [], // Ignore self
            tech: selectedTechStack,
            remote: remoteFilter
        }));

        const counts: Record<string, number> = {};
        relevantJobs.forEach(job => {
            const level = getExperienceLevel(job.title);
            counts[level] = (counts[level] || 0) + 1;
        });
        const order = ['Internship', 'Entry Level', 'Mid Level', 'Senior Level', 'Management'];
        return Object.entries(counts)
            .map(([name, count]) => ({ value: name, label: name, count }))
            .sort((a, b) => {
                const idxA = order.indexOf(a.value);
                const idxB = order.indexOf(b.value);
                return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
            });
    }, [jobs, searchQuery, selectedLocation, dateFilter, selectedCompanies, selectedTechStack, remoteFilter]);

    const TECH_STACKS = ['All', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data/AI', 'QA/Testing', 'Product', 'Other'];

    const dateOptions = [
        { value: 'all', label: 'Any time' },
        { value: '24h', label: 'Past 24 hours' },
        { value: '7d', label: 'Past week' },
        { value: '30d', label: 'Past month' }
    ];

    // Reset filters when location changes? No, keep independent.





    const filteredJobs = useMemo(() => {
        return jobs.filter(job => filterJob(job, {
            query: searchQuery.toLowerCase(),
            loc: selectedLocation,
            date: dateFilter,
            companies: selectedCompanies,
            exp: selectedExperience,
            tech: selectedTechStack,
            remote: remoteFilter
        }));
    }, [jobs, searchQuery, selectedLocation, dateFilter, selectedCompanies, selectedExperience, selectedTechStack, remoteFilter]);

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
        <div className="space-y-6">
            {/* Search and Main Filters - Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 -mx-4 px-4 sm:mx-0 sm:px-4 sm:rounded-2xl border-b sm:border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 transition-all duration-300">
                {/* Mobile Top Row: Search + View Toggle + Filter Toggle */}
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="block w-full pl-10 pr-20 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-xs text-gray-400 font-medium">
                                {filteredJobs.length} jobs
                            </span>
                        </div>
                    </div>

                    {/* View Toggle - Consolidated */}
                    <div className="flex shrink-0 items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700 h-[50px]">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'map'
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            title="Map View"
                        >
                            <MapIcon size={20} />
                        </button>
                    </div>

                    {/* Mobile Filter Toggle Button */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`lg:hidden p-3 rounded-xl border transition-colors h-[50px] aspect-square flex items-center justify-center ${showMobileFilters
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                            : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                            }`}
                        aria-label="Toggle Filters"
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Filters Row - Collapsable on Mobile */}
                <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {/* Row 1: Primary Filters */}
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mr-2">
                                <Filter size={18} />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>

                            {/* Date Filter */}
                            <FilterDropdown
                                label="Date Posted"
                                options={dateOptions}
                                selectedValues={dateFilter}
                                onChange={(vals) => setDateFilter(vals.length ? vals : ['all'])}
                                multiple={false}
                            />

                            {/* Company Filter (Multi) */}
                            <FilterDropdown
                                label="Company"
                                options={companyOptions}
                                selectedValues={selectedCompanies}
                                onChange={setSelectedCompanies}
                                multiple={true}
                                searchable={true}
                            />

                            {/* Experience Filter (Multi) */}
                            <FilterDropdown
                                label="Experience"
                                options={experienceOptions}
                                selectedValues={selectedExperience}
                                onChange={setSelectedExperience}
                                multiple={true}
                            />

                            {/* Location Filter */}
                            <div className="relative min-w-[160px]">
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 pl-4 pr-8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 h-[38px]"
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

                            {/* Remote Filter */}
                            <div className="relative min-w-[140px]">
                                <select
                                    value={remoteFilter}
                                    onChange={(e) => setRemoteFilter(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 pl-4 pr-8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 h-[38px]"
                                >
                                    <option value="Any">Any Work Mode</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                                    <Building2 size={14} />
                                </div>
                            </div>

                            {/* Tech Stack Toggle Button */}
                            <button
                                onClick={() => setShowTechStack(!showTechStack)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors h-[38px] ${showTechStack || selectedTechStack !== 'All'
                                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <Filter size={14} />
                                <span>Tech Stack</span>
                            </button>
                        </div>
                    </div>


                </div>

                {/* Row 2: Tech Stack Chips - Dynamic Visibility */}

                {/* Row 2: Tech Stack Chips - Collapsible */}
                <AnimatePresence>
                    {(showTechStack || selectedTechStack !== 'All') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                {TECH_STACKS.map(tech => (
                                    <button
                                        key={tech}
                                        onClick={() => setSelectedTechStack(tech)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTechStack === tech
                                            ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                        {filteredJobs.length !== jobs.length && <span className="ml-1">(Filtered from {jobs.length} total)</span>}
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
            )
            }
        </div >
    );
};
