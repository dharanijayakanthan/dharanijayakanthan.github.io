import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css'; // Import custom map styles after leaflet.css
import { motion } from 'framer-motion';
import L from 'leaflet';

// Create a custom DivIcon for a modern, glowing dot marker
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker-pin', // defined in map.css
    html: `
      <div class="pin-dot"></div>
      <div class="pin-effect"></div>
    `,
    iconSize: [24, 24], // match CSS size roughly
    iconAnchor: [12, 12], // center the icon
    popupAnchor: [0, -12] // popup opens above the dot
  });
};

const customIcon = createCustomIcon();

const Products: React.FC = () => {
  // HSR Layout, Bengaluru coordinates
  const position: [number, number] = [12.9141, 77.6411];

  // Whatfix HSR Location (approximate)
  const whatfixPosition: [number, number] = [12.9103, 77.6393];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Products & Opportunities</h1>
        <p className="text-xl text-gray-600">Exploring the tech landscape in HSR Layout, Bengaluru.</p>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden h-[600px] border border-gray-800 relative z-0">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          {/* Using CartoDB Dark Matter for a modern, high-contrast look that fits the Bento theme */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <Marker position={whatfixPosition} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="p-4 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">Whatfix</h3>
                    <span className="bg-blue-900/50 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-800">Hiring</span>
                </div>
                <p className="text-sm font-semibold text-blue-300 mb-1">Senior Frontend Engineer</p>
                <p className="text-xs text-gray-400 mb-3">HSR Layout Sector 3</p>
                <a
                  href="#"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  View Role
                </a>
              </div>
            </Popup>
          </Marker>

          {/* Adding a few dummy markers to simulate a "Product" feel */}
          <Marker position={[12.9081, 77.6476]} icon={customIcon}>
             <Popup className="custom-popup">
              <div className="p-4 min-w-[200px]">
                <h3 className="font-bold text-lg text-white mb-1">Cure.fit</h3>
                <p className="text-sm font-semibold text-blue-300 mb-1">Product Designer</p>
                <p className="text-xs text-gray-400">HSR Layout Sector 2</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={[12.9121, 77.6445]} icon={customIcon}>
             <Popup className="custom-popup">
              <div className="p-4 min-w-[200px]">
                <h3 className="font-bold text-lg text-white mb-1">Udaan</h3>
                <p className="text-sm font-semibold text-blue-300 mb-1">Backend Engineer</p>
                <p className="text-xs text-gray-400">HSR Layout Sector 6</p>
              </div>
            </Popup>
          </Marker>

        </MapContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl mb-2 text-gray-900">Interactive Job Map</h3>
            <p className="text-gray-600 text-sm">A real-time visualization of tech opportunities in Bengaluru's startup hub.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl mb-2 text-gray-900">Location Intelligence</h3>
            <p className="text-gray-600 text-sm">Leveraging geospatial data to connect talent with the right environment.</p>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl mb-2 text-gray-900">Community Driven</h3>
            <p className="text-gray-600 text-sm">Crowdsourced data points for the most accurate and up-to-date listings.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Products;
