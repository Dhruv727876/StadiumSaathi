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

export interface StadiumMarker {
  title: string;
  position: { lat: number; lng: number };
  category: 'gate' | 'zone' | 'transport';
}

export const STADIUM_COORDINATES = { lat: 25.8038, lng: -80.1384 };

export const STADIUM_MARKERS: StadiumMarker[] = [
  { title: 'North Gate', position: { lat: 25.8050, lng: -80.1384 }, category: 'gate' },
  { title: 'South Gate', position: { lat: 25.8026, lng: -80.1384 }, category: 'gate' },
  { title: 'East Stand', position: { lat: 25.8038, lng: -80.1365 }, category: 'zone' },
  { title: 'West VIP Lounge', position: { lat: 25.8038, lng: -80.1403 }, category: 'zone' },
  { title: 'Metro Connection Hub', position: { lat: 25.8010, lng: -80.1384 }, category: 'transport' },
  { title: 'Bus Shuttle Link', position: { lat: 25.8065, lng: -80.1384 }, category: 'transport' }
];
