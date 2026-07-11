import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Properties for the CrowdDashboard component.
 */
export interface CrowdDashboardProps {
  /** Highlighted sector name */
  selectedZone: string;
  /** Triggered when the user changes the active zone check */
  onSelectZone: (zone: string) => void;
}

interface SectorStatus {
  name: string;
  status: 'low' | 'medium' | 'high';
  updatedAt?: string;
}

const DEFAULT_SECTORS: SectorStatus[] = [
  { name: 'North Gate', status: 'low' },
  { name: 'South Gate', status: 'medium' },
  { name: 'East Stand', status: 'high' },
  { name: 'West VIP Lounge', status: 'low' },
  { name: 'Metro Connection Hub', status: 'medium' },
  { name: 'Bus Shuttle Link', status: 'low' }
];

/**
 * Displays live, color-coded sector congestion statuses synced from Firestore.
 */
export const CrowdDashboard: React.FC<CrowdDashboardProps> = React.memo(({
  selectedZone,
  onSelectZone
}) => {
  const [sectors, setSectors] = useState<SectorStatus[]>(DEFAULT_SECTORS);

  // Sync state from Firestore
  const fetchCongestionData = useCallback(async () => {
    try {
      const docRef = doc(db, 'congestion', 'current_status');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedSectors = DEFAULT_SECTORS.map((sec) => {
          if (data[sec.name]) {
            return {
              name: sec.name,
              status: data[sec.name].status,
              updatedAt: data[sec.name].updatedAt
            };
          }
          return sec;
        });
        setSectors(updatedSectors);
        logger.info('Crowd congestion statuses fetched from Firestore');
      }
    } catch (err) {
      logger.error('Failed to sync crowd congestion metrics from Firestore:', err);
    }
  }, []);

  // Sync on mount and refresh on 10s interval
  useEffect(() => {
    fetchCongestionData();
    const interval = setInterval(fetchCongestionData, 10000);
    return () => clearInterval(interval);
  }, [fetchCongestionData]);

  // Keyboard navigation handler for card selection via arrow keys
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % sectors.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + sectors.length) % sectors.length;
    } else {
      return;
    }
    const targetSector = sectors[nextIndex];
    if (targetSector) {
      onSelectZone(targetSector.name);
    }

    // Set focus to the newly selected element
    const buttonElement = document.getElementById(`sector-card-${nextIndex}`);
    if (buttonElement) {
      buttonElement.focus();
    }
  }, [sectors, onSelectZone]);

  // Memoized zone status list rendering
  const sectorList = useMemo(() => {
    return sectors.map((sec, idx) => {
      const isSelected = selectedZone === sec.name;
      const badgeColor =
        sec.status === 'low'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : sec.status === 'medium'
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20';

      return (
        <button
          key={sec.name}
          id={`sector-card-${idx}`}
          onClick={() => onSelectZone(sec.name)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          role="radio"
          aria-checked={isSelected}
          tabIndex={isSelected ? 0 : -1}
          className={`flex items-center justify-between p-3 h-12 rounded-xl border text-left transition-all ${
            isSelected
              ? 'bg-blue-600/25 border-blue-500 text-blue-300'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold">{sec.name}</div>
            {sec.updatedAt && (
              <div className="text-[9px] text-slate-500">
                Updated: {new Date(sec.updatedAt).toLocaleTimeString()}
              </div>
            )}
          </div>
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {sec.status}
          </span>
        </button>
      );
    });
  }, [sectors, selectedZone, onSelectZone, handleKeyDown]);

  return (
    <section 
      role="region"
      aria-label="Crowd Density Dashboard"
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 text-xs">
          📊 Live Crowd Congestion
        </h3>
        <span 
          role="status" 
          aria-live="polite" 
          className="text-[10px] text-slate-500 animate-pulse"
        >
          ● Auto-refreshes (10s)
        </span>
      </div>

      <div 
        role="radiogroup" 
        aria-label="Select stadium sector to examine details"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {sectorList}
      </div>
    </section>
  );
});

CrowdDashboard.displayName = 'CrowdDashboard';
