import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

interface JobMapProps {
    jobs: Job[];
}

export const JobMap = ({ jobs }: JobMapProps) => {
    // Center of Bangalore
    const center: [number, number] = [12.9716, 77.5946];

    // Filter valid coordinates first
    const validJobs = jobs.filter(job => job.lat && job.lng && job.lat !== 0 && job.lng !== 0);

    // Helper to add jitter to overlapping coordinates (especially the generic Bangalore center)
    const getJitteredCoords = (lat: number, lng: number, index: number): [number, number] => {
        // Check if close to generic center (12.9716, 77.5946)
        const isGeneric = Math.abs(lat - 12.9716) < 0.001 && Math.abs(lng - 77.5946) < 0.001;

        if (isGeneric) {
            // Spiral distribution to avoid perfect overlap
            const angle = index * 2.4; // Golden angle approximation in radians
            const radius = 0.003 + (index * 0.0002); // Slowly increasing radius (approx 300m start)
            return [
                lat + (Math.cos(angle) * radius),
                lng + (Math.sin(angle) * radius)
            ];
        }
        return [lat, lng];
    };

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md relative z-0">
            <MapContainer center={center} zoom={11} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validJobs.map((job, index) => {
                    const [jitterLat, jitterLng] = getJitteredCoords(job.lat!, job.lng!, index % 1000);

                    return (
                        <Marker
                            key={`${job.company}-${job.title}-${index}`}
                            position={[jitterLat, jitterLng]}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex items-start gap-3 mb-3">
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={job.company}
                                                className="w-10 h-10 rounded object-contain bg-white border border-gray-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=' + job.company.charAt(0);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold text-sm">
                                                {job.company.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-1">{job.title}</h3>
                                            <p className="text-xs text-gray-500 font-medium truncate">{job.company}</p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-600 mb-3 flex items-center gap-1.5 bg-gray-50 p-1.5 rounded">
                                        <span className="truncate max-w-[180px]">{job.location}</span>
                                        {Math.abs(job.lat! - 12.9716) < 0.001 && (
                                            <span className="text-[10px] text-gray-400 italic ml-auto">(Approx. Location)</span>
                                        )}
                                    </div>

                                    <a
                                        href={job.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded text-center transition-colors"
                                    >
                                        Apply Now
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
