const express = require('express');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const cuisineRoutes = require('./routes/cuisineRoutes');
const tablesRoutes = require('./routes/tablesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Function to get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/tables', tablesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server - Listen on all network interfaces (0.0.0.0) for mobile device access
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Network access: http://${localIp}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📱 Mobile app should connect to: http://${localIp}:${PORT}/api`);
});

module.exports = app;
