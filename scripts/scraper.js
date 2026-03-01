import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchConflictData() {
  console.log('Fetching conflict data...');

  // Note: Using a mock static set here for illustration, as the actual APIs require keys/have restrictions.
  // In a real pipeline, this would use axios to fetch from UCDP or ACLED.
  // The structure matches UCDP candidate data schema.

  const mockData = [
    {
      conflict_name: "Russia - Ukraine",
      lat: 48.3794,
      lng: 31.1656,
      intensity: 100,
      date: new Date().toISOString().split('T')[0],
      description: "Ongoing major conflict with active frontline engagements."
    },
    {
      conflict_name: "Israel - Hamas",
      lat: 31.5,
      lng: 34.466667,
      intensity: 95,
      date: new Date().toISOString().split('T')[0],
      description: "Intense urban warfare and airstrikes in the region."
    },
    {
      conflict_name: "Sudan Conflict",
      lat: 15.5007,
      lng: 32.5599,
      intensity: 85,
      date: new Date().toISOString().split('T')[0],
      description: "Clashes between SAF and RSF causing widespread displacement."
    },
    {
      conflict_name: "Myanmar Instability",
      lat: 21.9162,
      lng: 95.9560,
      intensity: 70,
      date: new Date().toISOString().split('T')[0],
      description: "Clashes between military junta and armed ethnic groups."
    },
    {
       conflict_name: "Syria Insurgency",
       lat: 34.8021,
       lng: 38.9968,
       intensity: 60,
       date: new Date().toISOString().split('T')[0],
       description: "Various rebel groups and government forces in skirmishes."
    },
    {
      conflict_name: "DRC Inter-communal Violence",
      lat: -4.0383,
      lng: 21.7587,
      intensity: 65,
      date: new Date().toISOString().split('T')[0],
      description: "Ongoing violence in eastern provinces involving multiple armed groups."
    }
  ];

  const destPath = path.join(__dirname, '..', 'public', 'data', 'conflicts.json');
  fs.writeFileSync(destPath, JSON.stringify(mockData, null, 2), 'utf-8');
  console.log(`Saved ${mockData.length} conflicts to ${destPath}`);
}

fetchConflictData().catch(console.error);
