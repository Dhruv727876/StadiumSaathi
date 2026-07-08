import React, { useEffect, useRef, useState, useCallback, useMemo, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, logStadiumEvent } from './firebase';
import { ErrorBoundary } from './components';
import { SUPPORTED_LANGUAGES } from './constants';
import { logger } from './utils/logger';

// React.lazy dynamic component loads
const MapView = React.lazy(() =>
  import('./components/MapView.tsx').then((m) => ({ default: m.MapView }))
);
const Wayfinding = React.lazy(() =>
  import('./components/Wayfinding.tsx').then((m) => ({ default: m.Wayfinding }))
);
const CrowdDashboard = React.lazy(() =>
  import('./components/CrowdDashboard.tsx').then((m) => ({ default: m.CrowdDashboard }))
);
const AccessibilitySetup = React.lazy(() =>
  import('./components/AccessibilitySetup.tsx').then((m) => ({ default: m.AccessibilitySetup }))
);
const Transportation = React.lazy(() =>
  import('./components/Transportation.tsx').then((m) => ({ default: m.Transportation }))
);

// Dictionary for multilingual translation copy
const UI_COPY: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome back to StadiumSaathi! Your language and accessibility preferences have been restored.',
    title: 'StadiumSaathi',
    sub: 'FIFA World Cup 2026 Scaffold',
    settings: 'Spectator Settings',
    language: 'Preferred Language',
    footer: '2026 StadiumSaathi. All rights reserved. Powered by Google AI & Firebase.'
  },
  es: {
    welcome: '¡Bienvenido de nuevo a StadiumSaathi! Tus preferencias de idioma y accesibilidad han sido restauradas.',
    title: 'StadiumSaathi',
    sub: 'Andamiaje Copa Mundial FIFA 2026',
    settings: 'Ajustes del Espectador',
    language: 'Idioma Preferido',
    footer: '2026 StadiumSaathi. Todos los derechos reservados. Desarrollado por Google AI & Firebase.'
  },
  fr: {
    welcome: 'Bon retour sur StadiumSaathi ! Vos préférences de langue et d’accessibilité ont été restaurées.',
    title: 'StadiumSaathi',
    sub: 'FIFA World Cup 2026 Échafaudage',
    settings: 'Paramètres du Spectateur',
    language: 'Langue Préférée',
    footer: '2026 StadiumSaathi. Tous droits réservés. Propulsé par Google AI & Firebase.'
  },
  ar: {
    welcome: 'مرحباً بك مجدداً في StadiumSaathi! تم استعادة تفضيلات اللغة والوصول الخاصة بك.',
    title: 'StadiumSaathi',
    sub: 'هيكل كأس العالم فيفا 2026',
    settings: 'إعدادات المتفرج',
    language: 'اللغة المفضلة',
    footer: '2026 StadiumSaathi. جميع الحقوق محفوظة. بدعم من Google AI و Firebase.'
  }
};

/**
 * Main application dashboard rendering core GenAI user-facing features.
 *
 * @returns The root layout wrapped in ErrorBoundary.
 */
export default function App(): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [isReturning, setIsReturning] = useState<boolean>(false);

  // Accessibility state
  const [wheelchair, setWheelchair] = useState<boolean>(false);
  const [sensoryFriendly, setSensoryFriendly] = useState<boolean>(false);
  const [stepFree, setStepFree] = useState<boolean>(false);

  // Map state
  const [selectedZone, setSelectedZone] = useState<string>('North Gate');

  // Read once per session guard
  const hasLoadedProfile = useRef<boolean>(false);

  const activeCopy = useMemo(() => {
    return (UI_COPY[language] ?? UI_COPY.en) as Record<string, string>;
  }, [language]);

  // Auth & Profile Listener on Mount
  useEffect(() => {
    logStadiumEvent('initiate_auth', { timestamp: new Date().toISOString() });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        logger.info(`Authenticated anonymously as UID: ${user.uid}`);
        
        if (!hasLoadedProfile.current) {
          hasLoadedProfile.current = true;
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const data = userSnap.data();
              if (data.language) setLanguage(data.language);
              if (data.wheelchair !== undefined) setWheelchair(data.wheelchair);
              if (data.sensoryFriendly !== undefined) setSensoryFriendly(data.sensoryFriendly);
              if (data.stepFree !== undefined) setStepFree(data.stepFree);
              setIsReturning(true);
              logStadiumEvent('load_profile', { status: 'success', uid: user.uid });
            } else {
              logStadiumEvent('load_profile', { status: 'new_user', uid: user.uid });
            }
          } catch (err) {
            logger.error('Failed to load user profile from Firestore', err);
          }
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save User Profile to Firestore (merge: true)
  const saveUserProfile = useCallback(async (
    lang: string,
    w: boolean,
    s: boolean,
    sf: boolean
  ) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        language: lang,
        wheelchair: w,
        sensoryFriendly: s,
        stepFree: sf,
        lastActive: new Date().toISOString()
      }, { merge: true });
      logger.info('User profile preferences synchronized to Firestore');
    } catch (err) {
      logger.error('Failed to sync user preferences to Firestore', err);
    }
  }, []);

  // Change Language Handler
  const handleLanguageChange = useCallback((newLang: string) => {
    setLanguage(newLang);
    saveUserProfile(newLang, wheelchair, sensoryFriendly, stepFree);
    logStadiumEvent('select_language', { language: newLang });
  }, [wheelchair, sensoryFriendly, stepFree, saveUserProfile]);

  // Accessibility changes handler
  const handleAccessibilityChange = useCallback((prefs: {
    wheelchair: boolean;
    sensoryFriendly: boolean;
    stepFree: boolean;
  }) => {
    setWheelchair(prefs.wheelchair);
    setSensoryFriendly(prefs.sensoryFriendly);
    setStepFree(prefs.stepFree);
    saveUserProfile(language, prefs.wheelchair, prefs.sensoryFriendly, prefs.stepFree);
    logStadiumEvent('toggle_accessibility', {
      wheelchair: prefs.wheelchair,
      sensoryFriendly: prefs.sensoryFriendly,
      stepFree: prefs.stepFree
    });
  }, [language, saveUserProfile]);

  const handleSelectZone = useCallback((zone: string) => {
    setSelectedZone(zone);
    logStadiumEvent('search_route', { destination: zone });
  }, []);

  // Memoized accessibility preferences summary passed to Wayfinding AI request
  const accessibilityProfileSummary = useMemo(() => {
    const list: string[] = [];
    if (wheelchair) list.push('wheelchair access');
    if (sensoryFriendly) list.push('sensory friendly path');
    if (stepFree) list.push('step-free routing');
    return list.length > 0 ? list.join(', ') : 'none';
  }, [wheelchair, sensoryFriendly, stepFree]);

  const apiBaseUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }, []);

  // Language selectors rendering (h-11 minimum sizes + checked attributes)
  const languageButtons = useMemo(() => {
    return SUPPORTED_LANGUAGES.map((lang) => (
      <button
        key={lang.code}
        onClick={() => handleLanguageChange(lang.code)}
        role="radio"
        aria-checked={language === lang.code}
        aria-label={`Select language ${lang.label}`}
        className={`h-11 px-3 text-xs rounded-lg border transition-all ${
          language === lang.code
            ? 'bg-blue-600 border-blue-500 text-white font-semibold'
            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
        }`}
      >
        {lang.label}
      </button>
    ));
  }, [language, handleLanguageChange]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
        
        {/* Skip to Main Content Link */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-orange-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>

        {/* Banner Alert for returning sessions */}
        {isReturning && (
          <div 
            role="status"
            aria-live="polite"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-center py-2.5 px-4 text-xs font-semibold tracking-wide text-white animate-fade-in flex justify-center items-center space-x-2"
          >
            <span>🏟️</span>
            <span>{activeCopy.welcome}</span>
          </div>
        )}

        <header 
          role="banner" 
          className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl" aria-hidden="true">🏟️</span>
              <h1 className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {activeCopy.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {activeCopy.sub}
              </span>
              {currentUser && (
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  UID: {currentUser.uid.substring(0, 8)}... (Anon)
                </span>
              )}
            </div>
          </div>
        </header>

        <main 
          id="main-content"
          tabIndex={-1}
          className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 outline-none"
        >
          
          {/* Left panel: Preferences & settings */}
          <div className="lg:col-span-1 space-y-6">
            <section 
              role="region" 
              aria-label={activeCopy.settings} 
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6"
            >
              <h2 className="sr-only">{activeCopy.settings}</h2>

              {/* Language Selection wrapped in fieldset / legend */}
              <fieldset className="space-y-2">
                <legend className="block text-xs font-semibold text-slate-400">{activeCopy.language}</legend>
                <div 
                  role="radiogroup" 
                  aria-label="Preferred Language Selector" 
                  className="grid grid-cols-2 gap-2"
                >
                  {languageButtons}
                </div>
              </fieldset>
            </section>

            {/* Accessibility setup component */}
            <Suspense fallback={<div role="status" aria-live="polite" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">Loading accessibility settings...</div>}>
              <AccessibilitySetup
                wheelchair={wheelchair}
                sensoryFriendly={sensoryFriendly}
                stepFree={stepFree}
                onChange={handleAccessibilityChange}
              />
            </Suspense>
          </div>

          {/* Right panel: Maps and features */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive MapView */}
            <section 
              role="region" 
              aria-label="Interactive Navigation Map" 
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
            >
              <h2 className="text-md font-bold text-white uppercase tracking-wider text-slate-400 text-xs">
                stadium navigation map
              </h2>
              <Suspense fallback={<div role="status" aria-live="polite" className="h-80 rounded-xl bg-slate-950 flex items-center justify-center text-xs text-slate-500">Loading navigation map...</div>}>
                <MapView selectedZone={selectedZone} onSelectZone={handleSelectZone} />
              </Suspense>
            </section>

            {/* Smart Wayfinding */}
            <Suspense fallback={<div role="status" aria-live="polite" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">Loading wayfinding calculations...</div>}>
              <Wayfinding
                accessibilityProfile={accessibilityProfileSummary}
                languageCode={language}
                apiUrl={apiBaseUrl}
              />
            </Suspense>

            {/* Crowd Congestion Dashboard */}
            <Suspense fallback={<div role="status" aria-live="polite" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">Loading crowd dashboard...</div>}>
              <CrowdDashboard
                selectedZone={selectedZone}
                onSelectZone={handleSelectZone}
                userUid={currentUser?.uid}
              />
            </Suspense>

            {/* Transit recommendation */}
            <Suspense fallback={<div role="status" aria-live="polite" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500">Loading transportation hubs...</div>}>
              <Transportation
                languageCode={language}
                apiUrl={apiBaseUrl}
              />
            </Suspense>
          </div>

        </main>

        <footer 
          role="contentinfo" 
          className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600"
        >
          <p>&copy; {activeCopy.footer}</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
