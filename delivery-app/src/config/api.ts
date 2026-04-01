// API Configuration
// Production: Using Vercel hosted backend
// Development: Use local IP for testing

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if running in production build (not Expo Go)
const isProduction = Constants.appOwnership === 'standalone' || Constants.appOwnership === 'expo';
const isDevelopment = __DEV__ && !isProduction;

// Force production URL for standalone builds
const USE_PRODUCTION = isProduction || true; // Set to false for local development in Expo Go

const PRODUCTION_URL = 'https://kaaspro-backend.vercel.app/api';
const LOCAL_IP = '192.168.1.48';
const LOCAL_PORT = '5000';
const LOCAL_URL = `http://${LOCAL_IP}:${LOCAL_PORT}/api`;

export const API_CONFIG = {
  BASE_URL: USE_PRODUCTION ? PRODUCTION_URL : LOCAL_URL,
  TIMEOUT: 30000, // Increased for cold starts
  IS_PRODUCTION: USE_PRODUCTION,
  IS_DEVELOPMENT: isDevelopment,
  PLATFORM: Platform.OS,
};

// Log API configuration on app start (only in development)
if (isDevelopment) {
  console.log('📡 API Configuration:');
  console.log(`   Environment: ${USE_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`   Platform: ${Platform.OS}`);
  console.log(`   App Ownership: ${Constants.appOwnership}`);
  console.log(`   BASE_URL: ${API_CONFIG.BASE_URL}`);
  console.log(`   Timeout: ${API_CONFIG.TIMEOUT}ms`);
}

// Production build validation
if (isProduction && !API_CONFIG.BASE_URL.startsWith('https://')) {
  console.error('❌ CRITICAL: Production build must use HTTPS!');
  throw new Error('Production builds require HTTPS API endpoint');
}
