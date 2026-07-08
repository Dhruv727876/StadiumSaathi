import React, { useCallback, useMemo } from 'react';

/**
 * Properties for the AccessibilitySetup component.
 */
export interface AccessibilitySetupProps {
  /** Wheelchair-accessible route preference */
  wheelchair: boolean;
  /** Sensory-friendly zones preference */
  sensoryFriendly: boolean;
  /** Step-free paths preference */
  stepFree: boolean;
  /** Callback triggered when any of the parameters change */
  onChange: (preferences: { wheelchair: boolean; sensoryFriendly: boolean; stepFree: boolean }) => void;
}

/**
 * Toggles and displays accessibility profile requirements.
 */
export const AccessibilitySetup: React.FC<AccessibilitySetupProps> = React.memo(({
  wheelchair,
  sensoryFriendly,
  stepFree,
  onChange
}) => {
  const handleToggleWheelchair = useCallback(() => {
    onChange({ wheelchair: !wheelchair, sensoryFriendly, stepFree });
  }, [wheelchair, sensoryFriendly, stepFree, onChange]);

  const handleToggleSensory = useCallback(() => {
    onChange({ wheelchair, sensoryFriendly: !sensoryFriendly, stepFree });
  }, [wheelchair, sensoryFriendly, stepFree, onChange]);

  const handleToggleStepFree = useCallback(() => {
    onChange({ wheelchair, sensoryFriendly, stepFree: !stepFree });
  }, [wheelchair, sensoryFriendly, stepFree, onChange]);

  // Memoized preference attributes checklist configuration
  const toggles = useMemo(() => {
    return [
      {
        id: 'wheelchair',
        title: 'Wheelchair Routing',
        description: 'Prioritize ramps, elevators, and wide corridors',
        value: wheelchair,
        handler: handleToggleWheelchair
      },
      {
        id: 'sensory',
        title: 'Sensory-Friendly Zones',
        description: 'Highlight quiet paths and low-decibel spectator sections',
        value: sensoryFriendly,
        handler: handleToggleSensory
      },
      {
        id: 'stepFree',
        title: 'Step-Free Access',
        description: 'Avoid stairs, escalators, and steep incline sectors',
        value: stepFree,
        handler: handleToggleStepFree
      }
    ];
  }, [wheelchair, sensoryFriendly, stepFree, handleToggleWheelchair, handleToggleSensory, handleToggleStepFree]);

  const renderToggles = useMemo(() => {
    return toggles.map((t) => (
      <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
        <div className="space-y-0.5 max-w-[70%]">
          <div className="text-xs font-bold text-slate-200">{t.title}</div>
          <div className="text-[9px] text-slate-500">{t.description}</div>
        </div>
        <button
          onClick={t.handler}
          role="switch"
          aria-checked={t.value}
          aria-expanded={t.value}
          aria-label={`Toggle ${t.title}`}
          className={`relative inline-flex h-11 w-12 items-center rounded-full transition-colors ${
            t.value ? 'bg-indigo-600' : 'bg-slate-800'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              t.value ? 'translate-x-6' : 'translate-x-1.5'
            }`}
          />
        </button>
      </div>
    ));
  }, [toggles]);

  return (
    <section 
      role="region"
      aria-label="Spectator Accessibility Preferences"
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
    >
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 text-xs">
        ♿ Accessibility Profile Setup
      </h3>
      <div className="space-y-3">
        {renderToggles}
      </div>
    </section>
  );
});

AccessibilitySetup.displayName = 'AccessibilitySetup';
