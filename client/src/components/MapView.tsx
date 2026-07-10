import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';
import { STADIUM_COORDINATES, STADIUM_MARKERS } from '../constants';

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          el: HTMLElement,
          options: {
            center: { lat: number; lng: number };
            zoom: number;
            styles: Array<{ elementType?: string; featureType?: string; stylers: Array<Record<string, string | number>> }>;
          }
        ) => unknown;
        Marker: new (options: {
          position: { lat: number; lng: number };
          map: unknown;
          title: string;
          label: string;
        }) => {
          addListener: (event: string, callback: () => void) => void;
        };
      };
    };
  }
}

/**
 * Properties for the MapView component.
 */
export interface MapViewProps {
  /** Selected sector or gate highlight identifier */
  selectedZone?: string;
  /** Callback triggered when a sector marker is clicked */
  onSelectZone?: (zoneName: string) => void;
}

/**
 * Renders an interactive map representing gates, zones, and transport hubs.
 * Integrates Google Maps JS API and falls back to a clean mock visual mapping if the API script fails to load.
 */
export function MapView({ selectedZone, onSelectZone }: MapViewProps): React.JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapsApiLoaded, setMapsApiLoaded] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.maps) {
      setMapsApiLoaded(true);
      return;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      logger.warn('Google Maps API key missing. Running MapView in Mock visual mode.');
      setFallbackMode(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapsApiLoaded(true);
      script.onerror = () => {
        logger.error('Failed to load Google Maps SDK script');
        setFallbackMode(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!mapsApiLoaded || !mapRef.current || fallbackMode) return;
    const googleInstance = window.google;
    if (!googleInstance) return;

    try {
      const map = new googleInstance.maps.Map(mapRef.current, {
        center: STADIUM_COORDINATES,
        zoom: 16,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] }
        ]
      });

      STADIUM_MARKERS.forEach((markerInfo) => {
        const marker = new googleInstance.maps.Marker({
          position: markerInfo.position,
          map: map,
          title: markerInfo.title,
          label: markerInfo.title.charAt(0)
        });

        marker.addListener('click', () => {
          if (onSelectZone) {
            onSelectZone(markerInfo.title);
          }
        });
      });
    } catch (err) {
      logger.error('Failed to initialize Google Maps component instance:', err);
      setFallbackMode(true);
    }
  }, [mapsApiLoaded, fallbackMode, onSelectZone]);

  if (fallbackMode) {
    return (
      <div className="w-full h-80 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-between p-6 relative overflow-hidden">
        <div>
          <h3 className="text-md font-bold text-slate-100 flex items-center space-x-2">
            <span>🗺️</span>
            <span>StadiumSaathi Navigation Map (Interactive Mock)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Running offline/mock layout. Select any zone node below to highlight routing information.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 z-10">
          {STADIUM_MARKERS.map((m) => (
            <button
              key={m.title}
              onClick={() => onSelectZone && onSelectZone(m.title)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedZone === m.title
                  ? 'bg-blue-600/25 border-blue-500 text-blue-300'
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="text-xs font-semibold">{m.title}</div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">
                {m.category}
              </span>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 border-t border-slate-700/50 pt-2 flex justify-between">
          <span>Center Lat: 25.8038, Lng: -80.1384</span>
          <span>Zoom: 16 (Miami Venue)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
