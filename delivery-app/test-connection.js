// eslint-disable-next-line no-http-string
// Development connection test - uses HTTP for local server testing
// Run this in the delivery-app directory with: node test-connection.js
// This tests if your computer can reach the backend

const http = require('http');

const BASE_URL_IP = '192.168.0.101';
const PORT = '5000';

console.log('🧪 Testing Backend Connection...\n');
console.log(`Target: http://${BASE_URL_IP}:${PORT}\n`);

// Test 1: Health check
console.log('Test 1: Health Check');
http.get(`http://${BASE_URL_IP}:${PORT}/health`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Health check passed');
    console.log('Response:', data);
    console.log('');

    // Test 2: API endpoint
    console.log('Test 2: API Endpoint Check');
    http.get(`http://${BASE_URL_IP}:${PORT}/api/cuisines`, (res2) => {
      console.log('✅ API endpoint accessible');
      console.log('Status:', res2.statusCode);
      console.log('');
      console.log('🎉 Backend is accessible! The issue might be with the mobile device network.');
      console.log('');
      console.log('Next steps:');
      console.log('1. Make sure your phone/emulator is on the same WiFi network');
      console.log('2. Check if Windows Firewall is blocking Node.js');
      console.log('3. Try restarting the app with: npm start');
    }).on('error', (err) => {
      console.error('❌ API endpoint not accessible:', err.message);
    });
  });
}).on('error', (err) => {
  console.error('❌ Cannot connect to backend');
  console.error('Error:', err.message);
  console.error('');
  console.error('Possible causes:');
  console.error('1. Backend server is not running - Run: cd backend-api && npm start');
  console.error('2. Wrong IP address - Check with: ipconfig');
  console.error('3. Firewall blocking connections');
});
