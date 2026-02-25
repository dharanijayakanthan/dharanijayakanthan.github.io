import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map as MapIcon, List, ExternalLink, MapPin, Building2, Calendar } from 'lucide-react';

import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';
import { BentoTile } from '../components/ui/BentoTile';
import { FilterDropdown } from '../components/ui/FilterDropdown';

// Fix Leaflet marker icon issue
const customIcon = new Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    date: string;
    link: string;
    logo?: string;
    lat: number;
    lng: number;
}

export const Jobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [view, setView] = useState<'list' | 'map'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/jobs')
            .then(res => res.json())
            .then(data => {
                setJobs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch jobs:", err);
                setLoading(false);
            });
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Job Board</h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-1">Found {filteredJobs.length} opportunities</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-stone-200 dark:border-slate-700">
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-stone-100 dark:bg-slate-700 text-indigo-600' : 'text-stone-400'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setView('map')}
                            className={`p-2 rounded-md transition-all ${view === 'map' ? 'bg-stone-100 dark:bg-slate-700 text-indigo-600' : 'text-stone-400'}`}
                        >
                            <MapIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-stone-400">Loading jobs...</div>
            ) : view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredJobs.map((job) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={job.id}
                            >
                                <BentoTile className="h-full flex flex-col hover:border-indigo-500/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-stone-200 dark:border-slate-700">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="text-stone-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-mono text-stone-400 bg-stone-50 dark:bg-slate-900 px-2 py-1 rounded">
                                            {job.date ? new Date(job.date).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {job.title}
                                    </h3>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mb-4">
                                        {job.company}
                                    </p>

                                    <div className="mt-auto pt-4 flex justify-between items-center border-t border-stone-100 dark:border-slate-800/50">
                                        <div className="flex items-center gap-1 text-xs text-stone-400">
                                            <MapPin size={14} />
                                            <span className="line-clamp-1 max-w-[120px]">{job.location}</span>
                                        </div>
                                        <a
                                            href={job.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 hover:underline"
                                        >
                                            Apply <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </BentoTile>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="h-[600px] rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-800 relative z-0">
                     <MapContainer center={[12.9716, 77.5946]} zoom={11} scrollWheelZoom={true} className="h-full w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MarkerClusterGroup chunkedLoading>
                            {filteredJobs.filter(j => j.lat && j.lng).map((job) => (
                                <Marker
                                    key={job.id}
                                    position={[job.lat, job.lng]}
                                    icon={customIcon}
                                    eventHandlers={{
                                        click: () => setSelectedJob(job),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold">{job.title}</h3>
                                            <p className="text-sm">{job.company}</p>
                                            <a href={job.link} target="_blank" className="text-blue-500 text-xs mt-1 block">View Job</a>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                    </MapContainer>
                </div>
            )}
        </div>
    );
};
