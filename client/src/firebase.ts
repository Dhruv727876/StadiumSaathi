import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';

/**
 * Hardcoded configuration placeholder.
 * These config parameters are mapped from Vite/Webpack process.env, falling back to safe defaults.
 */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'stadiumsaathi-prod-98.firebaseapp.com',
  projectId: 'stadiumsaathi-prod-98',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'stadiumsaathi-prod-98.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-ABCDEF1234'
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

/**
 * Authentication service instance.
 */
export const auth = getAuth(app);

// Enable anonymous authentication out of the box
signInAnonymously(auth).catch(() => {
  // Silent fallback if credentials are placeholder
});

/**
 * Cloud Firestore database service instance.
 */
export const db = getFirestore(app);

/**
 * Google Analytics instance.
 * Initialized asynchronously only if supported by the client browser.
 */
export let analytics: Analytics | null = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {
    // Analytics is not supported in this runtime environment
  });

/**
 * Safe analytics event logging wrapper to record spectator and operational metrics.
 *
 * @param eventName - The custom stadium event name to track.
 * @param params - Supplementary key-value parameter pairs.
 */
export function logStadiumEvent(eventName: string, params?: Record<string, unknown>): void {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}
