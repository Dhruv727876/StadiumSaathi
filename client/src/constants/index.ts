/**
 * The standard title of the application.
 */
export const APP_TITLE = 'StadiumSaathi';

/**
 * Supported language locales for the GenAI multilingual support.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' }
] as const;

/**
 * Represents a marker on the stadium map layout.
 */
export interface StadiumMarker {
  title: string;
  position: { lat: number; lng: number };
  category: 'gate' | 'zone' | 'transport';
}

/**
 * Hardcoded geographical center coordinate for the stadium map layout (Miami Hard Rock Stadium equivalent).
 */
export const STADIUM_COORDINATES = { lat: 25.8038, lng: -80.1384 };

/**
 * List of stadium gates, stands/zones, and transport hubs with coordinates for map display.
 */
export const STADIUM_MARKERS: StadiumMarker[] = [
  { title: 'North Gate', position: { lat: 25.8050, lng: -80.1384 }, category: 'gate' },
  { title: 'South Gate', position: { lat: 25.8026, lng: -80.1384 }, category: 'gate' },
  { title: 'East Stand', position: { lat: 25.8038, lng: -80.1365 }, category: 'zone' },
  { title: 'West VIP Lounge', position: { lat: 25.8038, lng: -80.1403 }, category: 'zone' },
  { title: 'Metro Connection Hub', position: { lat: 25.8010, lng: -80.1384 }, category: 'transport' },
  { title: 'Bus Shuttle Link', position: { lat: 25.8065, lng: -80.1384 }, category: 'transport' }
];

/**
 * Represents route directions hint details.
 */
export interface RouteHint {
  viaPath: string[];
  estimatedMinutes: number;
  accessibleAlternative?: string[];
}

/**
 * Hardcoded route instructions lookup map for all combinations of start locations and destination gates.
 */
export const ROUTE_RULES: Record<string, Record<string, RouteHint>> = {
  'Parking Lot A': {
    'North Gate': { viaPath: ['West Concourse', 'Gate Walkway', 'North Gate'], estimatedMinutes: 12, accessibleAlternative: ['Elevator A', 'Flat Path A', 'North Gate'] },
    'South Gate': { viaPath: ['Outer Ring West', 'Gate Walkway', 'South Gate'], estimatedMinutes: 14, accessibleAlternative: ['Ramp West', 'Flat Path B', 'South Gate'] },
    'East Stand': { viaPath: ['West Entrance', 'Concourse Level 2', 'East Stand'], estimatedMinutes: 18, accessibleAlternative: ['Elevator B', 'Level 2 accessible corridor', 'East Stand'] },
    'West VIP Lounge': { viaPath: ['VIP Entrance West', 'Level 3 corridor', 'West VIP Lounge'], estimatedMinutes: 8, accessibleAlternative: ['VIP Ramp', 'Accessible Level 3', 'West VIP Lounge'] }
  },
  'Metro Hub Station': {
    'North Gate': { viaPath: ['Transit Walkway', 'Outer Ring East', 'North Gate'], estimatedMinutes: 15, accessibleAlternative: ['Elevator C', 'Flat Path East', 'North Gate'] },
    'South Gate': { viaPath: ['Transit Walkway', 'Gate Walkway', 'South Gate'], estimatedMinutes: 8, accessibleAlternative: ['Ramp South', 'Flat Path South', 'South Gate'] },
    'East Stand': { viaPath: ['East Entrance', 'Concourse Level 1', 'East Stand'], estimatedMinutes: 12, accessibleAlternative: ['Accessible Corridor East', 'East Stand'] },
    'West VIP Lounge': { viaPath: ['Outer Ring West', 'VIP Entrance West', 'West VIP Lounge'], estimatedMinutes: 16, accessibleAlternative: ['Flat Path West', 'VIP Elevator', 'West VIP Lounge'] }
  },
  'Rideshare Dropoff': {
    'North Gate': { viaPath: ['Dropoff Plaza', 'Outer Ring North', 'North Gate'], estimatedMinutes: 10, accessibleAlternative: ['Flat Plaza', 'North Ramp', 'North Gate'] },
    'South Gate': { viaPath: ['Dropoff Plaza', 'Outer Ring South', 'South Gate'], estimatedMinutes: 12, accessibleAlternative: ['Flat Plaza', 'South Ramp', 'South Gate'] },
    'East Stand': { viaPath: ['East Gate Walkway', 'Concourse Level 1', 'East Stand'], estimatedMinutes: 15, accessibleAlternative: ['Accessible East Walkway', 'East Stand'] },
    'West VIP Lounge': { viaPath: ['Outer Ring West', 'VIP Entrance West', 'West VIP Lounge'], estimatedMinutes: 14, accessibleAlternative: ['Flat Path West', 'VIP Elevator', 'West VIP Lounge'] }
  },
  'Bus Shuttle Gate': {
    'North Gate': { viaPath: ['Shuttle Area', 'Outer Ring North', 'North Gate'], estimatedMinutes: 6, accessibleAlternative: ['Flat Shuttle Path', 'North Gate'] },
    'South Gate': { viaPath: ['Shuttle Area', 'Outer Ring South', 'South Gate'], estimatedMinutes: 16, accessibleAlternative: ['Flat Shuttle Path', 'South Ramp', 'South Gate'] },
    'East Stand': { viaPath: ['Concourse Level 1', 'East Concourse', 'East Stand'], estimatedMinutes: 14, accessibleAlternative: ['Level 1 Corridor', 'East Stand'] },
    'West VIP Lounge': { viaPath: ['Outer Ring West', 'VIP Entrance West', 'West VIP Lounge'], estimatedMinutes: 12, accessibleAlternative: ['Flat Path West', 'VIP Elevator', 'West VIP Lounge'] }
  }
};

