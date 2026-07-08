import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, 'REACT_APP_');
  // Temporary log to inspect loaded variables during local build runs
  // eslint-disable-next-line no-console
  console.log('--- VITE BUILD ENV CONFIGS ---');
  // eslint-disable-next-line no-console
  console.log('__dirname:', __dirname);
  // eslint-disable-next-line no-console
  console.log('mode:', mode);
  // eslint-disable-next-line no-console
  console.log('REACT_APP_API_URL:', env.REACT_APP_API_URL);
  // eslint-disable-next-line no-console
  console.log('REACT_APP_FIREBASE_PROJECT_ID:', env.REACT_APP_FIREBASE_PROJECT_ID);

  return {
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || 'http://localhost:5000'),
      'process.env.REACT_APP_GOOGLE_MAPS_API_KEY': JSON.stringify(env.REACT_APP_GOOGLE_MAPS_API_KEY || ''),
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(env.REACT_APP_FIREBASE_API_KEY || ''),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.REACT_APP_FIREBASE_AUTH_DOMAIN || ''),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(env.REACT_APP_FIREBASE_PROJECT_ID || ''),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.REACT_APP_FIREBASE_STORAGE_BUCKET || ''),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || ''),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(env.REACT_APP_FIREBASE_APP_ID || ''),
      'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''),
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});
