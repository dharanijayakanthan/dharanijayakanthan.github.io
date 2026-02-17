import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] border border-gray-100">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Using CartoDB Dark Matter for a modern, high-contrast look that fits the Bento theme */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <Marker position={whatfixPosition}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">Whatfix</h3>
                <p className="text-sm font-semibold text-blue-600">Senior Frontend Engineer</p>
                <p className="text-xs text-gray-500 mt-1">HSR Layout Sector 3</p>
                <a
                  href="#"
                  className="block mt-2 text-xs bg-gray-900 text-white py-1 px-2 rounded text-center hover:bg-gray-700 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  View Role
                </a>
              </div>
            </Popup>
          </Marker>

          {/* Adding a few dummy markers to simulate a "Product" feel */}
          <Marker position={[12.9081, 77.6476]}>
             <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">Cure.fit</h3>
                <p className="text-sm font-semibold text-blue-600">Product Designer</p>
                <p className="text-xs text-gray-500 mt-1">HSR Layout Sector 2</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={[12.9121, 77.6445]}>
             <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">Udaan</h3>
                <p className="text-sm font-semibold text-blue-600">Backend Engineer</p>
                <p className="text-xs text-gray-500 mt-1">HSR Layout Sector 6</p>
              </div>
            </Popup>
          </Marker>

        </MapContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-2">Interactive Job Map</h3>
            <p className="text-gray-600 text-sm">A real-time visualization of tech opportunities in Bengaluru's startup hub.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-2">Location Intelligence</h3>
            <p className="text-gray-600 text-sm">Leveraging geospatial data to connect talent with the right environment.</p>
        </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-2">Community Driven</h3>
            <p className="text-gray-600 text-sm">Crowdsourced data points for the most accurate and up-to-date listings.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Products;
