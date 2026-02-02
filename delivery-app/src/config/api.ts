// API Configuration
// Update BASE_URL_IP with your computer's IP address for mobile device testing
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)

const BASE_URL_IP = '192.168.0.101'; // Change this to your computer's IP address
const PORT = '5000';

export const API_CONFIG = {
  BASE_URL: `http://${BASE_URL_IP}:${PORT}/api`,
  TIMEOUT: 10000,
};

// Log API configuration on app start
console.log('📡 API Configuration:');
console.log(`   BASE_URL: ${API_CONFIG.BASE_URL}`);
console.log(`   Full Orders URL: ${API_CONFIG.BASE_URL}/orders`);

// For development, you can also use:
// - 'http://localhost:5000/api' for emulator/web testing
// - 'http://YOUR_IP:5000/api' for physical device testing
