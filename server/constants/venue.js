/**
 * Verified venue locations for the FIFA World Cup 2026 Stadium (Miami Hard Rock Stadium equivalent).
 * Includes gates, stands/zones, and transport/parking hubs.
 */
const STADIUM_LOCATIONS = [
  { name: 'North Gate', category: 'gate', coordinates: { lat: 25.8050, lng: -80.1384 } },
  { name: 'South Gate', category: 'gate', coordinates: { lat: 25.8026, lng: -80.1384 } },
  { name: 'East Stand', category: 'zone', coordinates: { lat: 25.8038, lng: -80.1365 } },
  { name: 'West VIP Lounge', category: 'zone', coordinates: { lat: 25.8038, lng: -80.1403 } },
  { name: 'Metro Connection Hub', category: 'transport', coordinates: { lat: 25.8010, lng: -80.1384 } },
  { name: 'Bus Shuttle Link', category: 'transport', coordinates: { lat: 25.8065, lng: -80.1384 } },
  { name: 'Parking Lot A', category: 'parking', coordinates: { lat: 25.8038, lng: -80.1450 } },
  { name: 'Metro Hub Station', category: 'transport', coordinates: { lat: 25.8010, lng: -80.1384 } },
  { name: 'Rideshare Dropoff', category: 'transport', coordinates: { lat: 25.8038, lng: -80.1300 } },
  { name: 'Bus Shuttle Gate', category: 'transport', coordinates: { lat: 25.8065, lng: -80.1384 } }
];

/**
 * Exported venue constants module.
 */
module.exports = {
  STADIUM_LOCATIONS
};
