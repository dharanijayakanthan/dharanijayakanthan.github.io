import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png?url';
import iconShadow from 'leaflet/dist/images/marker-shadow.png?url';

const DefaultIcon = L.icon({
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

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md relative z-0">
            <MapContainer center={center} zoom={11} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {jobs.map((job, index) => (
                    (job.lat && job.lng && job.lat !== 0 && job.lng !== 0) ? (
                        <Marker key={`${job.company}-${index}`} position={[job.lat, job.lng]}>
                            <Popup>
                                <div className="p-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={job.company}
                                                className="w-8 h-8 rounded object-contain bg-white border border-gray-100"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=' + job.company.charAt(0);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold text-xs">
                                                {job.company.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">{job.title}</h3>
                                            <p className="text-xs text-gray-500 font-medium">{job.company}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <span className="line-clamp-1">{job.location}</span>
                                    </div>
                                    <a
                                        href={job.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded block text-center transition-colors"
                                    >
                                        Apply Now
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
};
