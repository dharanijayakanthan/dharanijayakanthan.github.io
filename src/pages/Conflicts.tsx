import { useEffect, useState } from 'react';
import { Viewer, Entity, PointGraphics, EntityDescription } from 'resium';
import { Cartesian3, Color } from 'cesium';

interface ConflictData {
  conflict_name: string;
  lat: number;
  lng: number;
  intensity: number;
  date: string;
  description: string;
}

export const Conflicts = () => {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/conflicts.json')
      .then((res) => res.json())
      .then((data) => {
        setConflicts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch conflicts data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Global War Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Interactive 3D globe visualizing active military conflicts and geopolitical tensions globally. Data is updated every 6 hours.
        </p>
      </div>

      <div className="h-[70vh] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <Viewer full>
          {conflicts.map((conflict, index) => (
            <Entity
              key={index}
              name={conflict.conflict_name}
              position={Cartesian3.fromDegrees(conflict.lng, conflict.lat)}
            >
              <PointGraphics
                pixelSize={15 + (conflict.intensity / 10)}
                color={Color.RED.withAlpha(0.7)}
                outlineColor={Color.WHITE}
                outlineWidth={2}
              />
              <EntityDescription>
                <div style={{ padding: '10px', fontFamily: 'sans-serif' }}>
                  <p><strong>Date:</strong> {conflict.date}</p>
                  <p><strong>Intensity:</strong> {conflict.intensity}</p>
                  <p style={{ marginTop: '10px' }}>{conflict.description}</p>
                </div>
              </EntityDescription>
            </Entity>
          ))}
        </Viewer>
      </div>
    </div>
  );
};
