// API Configuration
// Production: Using Render.com hosted backend
// Development: Use local IP for testing

const USE_PRODUCTION = true; // Set to false for local development

const PRODUCTION_URL = 'https://kaaspro-backend.onrender.com/api';
const LOCAL_IP = '192.168.1.33';
const LOCAL_PORT = '5000';
const LOCAL_URL = `http://${LOCAL_IP}:${LOCAL_PORT}/api`;

export const API_CONFIG = {
  BASE_URL: USE_PRODUCTION ? PRODUCTION_URL : LOCAL_URL,
  TIMEOUT: 30000, // Increased for Render cold starts
};

// Log API configuration on app start
console.log('📡 API Configuration:');
console.log(`   Environment: ${USE_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`   BASE_URL: ${API_CONFIG.BASE_URL}`);
console.log(`   Timeout: ${API_CONFIG.TIMEOUT}ms`);

// Note: Render free tier has cold starts (30-60s on first request after inactivity)
