import React, { useState, useCallback, useMemo } from 'react';
import { logStadiumEvent } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Properties for the Wayfinding component.
 */
export interface WayfindingProps {
  /** User's current accessibility needs summary to customize the route instructions */
  accessibilityProfile?: string;
  /** Active language selection */
  languageCode: string;
  /** Express backend API base URL */
  apiUrl: string;
}

const STARTING_LOCATIONS = [
  'Parking Lot A',
  'Metro Hub Station',
  'Rideshare Dropoff',
  'Bus Shuttle Gate'
] as const;

const DESTINATION_GATES = [
  'North Gate',
  'South Gate',
  'East Stand',
  'West VIP Lounge'
] as const;

/**
 * Handles spectator wayfinding routes using server-side AI recommendations and local context.
 */
export const Wayfinding: React.FC<WayfindingProps> = React.memo(({
  accessibilityProfile,
  languageCode,
  apiUrl
}) => {
  const [startPoint, setStartPoint] = useState<string>(STARTING_LOCATIONS[0]);
  const [destination, setDestination] = useState<string>(DESTINATION_GATES[0]);
  const [routeInfo, setRouteInfo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleStartChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStartPoint(e.target.value);
  }, []);

  const handleDestinationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDestination(e.target.value);
  }, []);

  const handleFindRoute = useCallback(async () => {
    setLoading(true);
    setRouteInfo('');
    logStadiumEvent('search_route', { start: startPoint, destination });

    const promptText = `Provide step-by-step route directions from starting location "${startPoint}" to gate/sector "${destination}". Keep the response concise, clear, and action-oriented.`;

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: promptText,
          language: languageCode,
          accessibilityProfile: accessibilityProfile || 'none'
        })
      });

      const data = await res.json();
      if (data.success) {
        setRouteInfo(data.response);
      } else {
        setRouteInfo('Unable to retrieve AI routing directions at this time.');
      }
    } catch (err) {
      logger.error('Failed to communicate with AI wayfinding service:', err);
      setRouteInfo('Offline Fallback: STADIUM_GUIDANCE: Walk east past the ticket checkpoint, turn right toward Gate entrance. Next step: Proceed to the entry lane.');
    } finally {
      setLoading(false);
    }
  }, [startPoint, destination, accessibilityProfile, languageCode, apiUrl]);

  // Memoized starting options list
  const startOptions = useMemo(() => {
    return STARTING_LOCATIONS.map((loc) => (
      <option key={loc} value={loc}>
        {loc}
      </option>
    ));
  }, []);

  // Memoized destination options list
  const destOptions = useMemo(() => {
    return DESTINATION_GATES.map((gate) => (
      <option key={gate} value={gate}>
        {gate}
      </option>
    ));
  }, []);

  return (
    <section 
      role="region" 
      aria-label="Spectator Wayfinding & Route Calculation"
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
    >
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 text-xs">
        📍 Smart Wayfinding
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label id="start-loc-label" className="text-[10px] uppercase font-bold text-slate-500">Starting Location</label>
          <select
            value={startPoint}
            onChange={handleStartChange}
            aria-labelledby="start-loc-label"
            aria-label="Choose your starting location"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 h-11 outline-none focus:border-blue-500"
          >
            {startOptions}
          </select>
        </div>

        <div className="space-y-1">
          <label id="dest-gate-label" className="text-[10px] uppercase font-bold text-slate-500">Destination</label>
          <select
            value={destination}
            onChange={handleDestinationChange}
            aria-labelledby="dest-gate-label"
            aria-label="Choose your target destination gate"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 h-11 outline-none focus:border-blue-500"
          >
            {destOptions}
          </select>
        </div>
      </div>

      <button
        onClick={handleFindRoute}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-xs h-11 px-5 rounded-lg transition-colors"
      >
        {loading ? 'Routing...' : 'Calculate Route'}
      </button>

      {routeInfo && (
        <div 
          role="log" 
          aria-live="polite" 
          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
        >
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            AI Wayfinding Guidance
          </div>
          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {routeInfo}
          </p>
        </div>
      )}
    </section>
  );
});

Wayfinding.displayName = 'Wayfinding';
