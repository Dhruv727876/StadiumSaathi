import React, { useState, useCallback, useMemo } from 'react';
import { logStadiumEvent } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Properties for the Transportation component.
 */
export interface TransportationProps {
  /** Language output context */
  languageCode: string;
  /** Express backend API base URL */
  apiUrl: string;
}

const TRANSIT_OPTIONS = [
  { id: 'parking-lot-a', name: 'Parking Lot A (West)', type: 'parking', time: '10 min walk' },
  { id: 'parking-lot-b', name: 'Parking Lot B (North)', type: 'parking', time: '15 min walk' },
  { id: 'metro-hub', name: 'Central Metro Hub', type: 'transit', time: '8 min walk' },
  { id: 'bus-shuttle', name: 'Bus Shuttle Link', type: 'transit', time: '12 min walk' }
] as const;

/**
 * Renders transit hubs and lets spectators ask the AI helper for recommendations based on kickoff.
 */
export const Transportation: React.FC<TransportationProps> = React.memo(({
  languageCode,
  apiUrl
}) => {
  const [kickoffMinutes, setKickoffMinutes] = useState<number>(60);
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKickoffMinutes(parseInt(e.target.value) || 0);
  }, []);

  const handleGetRecommendation = useCallback(async () => {
    setLoading(true);
    setRecommendation('');
    logStadiumEvent('view_transit', { time_to_kickoff: kickoffMinutes });

    const promptText = `Suggest the best transportation hub option when there are ${kickoffMinutes} minutes remaining before the FIFA World Cup kickoff. Consider standard exit/entry crowd delays and keep the recommendation brief.`;

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: promptText,
          language: languageCode
        })
      });

      const data = await res.json();
      if (data.success) {
        setRecommendation(data.response);
      } else {
        setRecommendation('Unable to retrieve AI transit recommendations at this time.');
      }
    } catch (err) {
      logger.error('Failed to get transit recommendation from backend:', err);
      setRecommendation('Offline Fallback: STADIUM_GUIDANCE: Central Metro Hub is the fastest route right now. Next step: Follow signs to Platform 2.');
    } finally {
      setLoading(false);
    }
  }, [kickoffMinutes, languageCode, apiUrl]);

  // Memoized lists of parking and transit options
  const listItems = useMemo(() => {
    return TRANSIT_OPTIONS.map((opt) => (
      <div key={opt.id} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">[{opt.type}]</span>
          <span className="text-xs text-slate-200">{opt.name}</span>
        </div>
        <span className="text-xs text-slate-400 font-semibold">{opt.time}</span>
      </div>
    ));
  }, []);

  return (
    <section 
      role="region"
      aria-label="Transit and Parking Information Hub"
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
    >
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 text-xs">
        🚍 Transportation & Parking
      </h3>

      <div className="space-y-2">
        {listItems}
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="space-y-1">
          <label id="kickoff-time-label" className="text-[10px] uppercase font-bold text-slate-500">Minutes to Kickoff</label>
          <input
            type="number"
            value={kickoffMinutes}
            onChange={handleMinutesChange}
            aria-labelledby="kickoff-time-label"
            aria-label="Enter minutes left before the kickoff match starts"
            min={0}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 h-11 outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleGetRecommendation}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-xs h-11 px-5 rounded-lg transition-colors"
        >
          {loading ? 'Analyzing Transit...' : 'Get AI Recommendation'}
        </button>
      </div>

      <div role="status" aria-live="polite">
        {loading && (
          <div className="text-xs text-indigo-400 mt-2">
            Loading transit recommendations...
          </div>
        )}
        {!loading && recommendation && (
          <div className="p-4 mt-2 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              AI Transit Recommendation
            </div>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {recommendation}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

Transportation.displayName = 'Transportation';
