import { useEffect, useState } from 'react';
import { BentoTile } from '../components/ui/BentoTile';
import { MapPin, Calendar, ExternalLink, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

    useEffect(() => {
        fetch('/jobs.json')
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
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Frontend Opportunities</h1>
                <p className="text-gray-600">
                    Curated list of Frontend Engineering roles in Bangalore. Updated daily
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                    <motion.div
                        key={`${job.company}-${job.title}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <BentoTile className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {job.logo ? (
                                        <img
                                            src={job.logo}
                                            alt={`${job.company} logo`}
                                            className="w-12 h-12 object-contain rounded-md bg-white p-1 border border-gray-100"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + job.company.charAt(0);
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 font-bold text-xl">
                                            {job.company.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 line-clamp-1" title={job.title}>{job.title}</h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                            <Building2 size={14} />
                                            <span className="line-clamp-1">{job.company}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="line-clamp-1">{job.location}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                                    <span>Posted: {job.date}</span>
                                </div>

                                <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 block w-full py-2 px-4 bg-blue-50 text-blue-600 text-center rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    Apply Now
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </BentoTile>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
