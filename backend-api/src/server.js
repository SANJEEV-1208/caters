const express = require('express');
const cors = require('cors');
const os = require('node:os');
require('dotenv').config();

// Initialize Sentry FIRST (before any other imports/middleware)
const { initSentry, sentryErrorHandler } = require('./config/sentry');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const cuisineRoutes = require('./routes/cuisineRoutes');
const tablesRoutes = require('./routes/tablesRoutes');
const pushTokenRoutes = require('./routes/pushTokenRoutes');
const auditRoutes = require('./routes/auditRoutes');
const securityRoutes = require('./routes/securityRoutes');
const pool = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { performanceMiddleware, startMemoryMonitoring } = require('./services/apmService');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sentry error tracking (must be before any other middleware)
initSentry(app);

// Trust proxy - Required when behind reverse proxy (Render, Heroku, Nginx, etc.)
// This is needed for rate limiting and client IP detection to work correctly
app.set('trust proxy', 1);

// Function to get local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  // Using Object.keys() to safely iterate over network interfaces
  // Type assertion safe here - interfaces comes from os.networkInterfaces()
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

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        // Allow requests from your domain or no origin (mobile apps)
        const allowedOrigins = [
          'https://kaaspro.com',
          'https://www.kaaspro.com',
          undefined, // Allow mobile apps (no origin header)
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Performance monitoring middleware
app.use(performanceMiddleware());

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
app.use('/api/push-tokens', pushTokenRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/security', securityRoutes);

// Sentry error handler (MUST be after all routes, before other error handlers)
app.use(sentryErrorHandler());

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

// Auto-initialize database on first startup (for Render deployment)
async function checkAndInitializeDatabase() {
  try {
    // Check if users table exists
    const result = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );

    const tableExists = result.rows[0].exists;

    if (!tableExists) {
      console.log('🔧 Database tables not found. Initializing database...');
      const initializeDatabase = require('./database/init');
      await initializeDatabase();
      console.log('✅ Database initialized successfully!');
    } else {
      console.log('✅ Database already initialized');

      // Run migrations for existing databases
      await runMigrations();
    }
  } catch (error) {
    console.error('⚠️ Database check/initialization error:', error.message);
    console.error(error);
    // Don't crash the server - it will retry on next restart
  }
}

// Run database migrations
async function runMigrations() {
  try {
    console.log('🔄 Checking for database migrations...');

    // Migration 1: Add pin_hash column if it doesn't exist
    const pinHashCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'pin_hash'
      )`
    );

    if (!pinHashCheck.rows[0].exists) {
      console.log('🔧 Adding pin_hash column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255)');
      console.log('✅ pin_hash column added successfully');
    } else {
      console.log('✓ pin_hash column already exists');
    }

    // Migration 2: Add profile_picture column if it doesn't exist
    const profilePictureCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'profile_picture'
      )`
    );

    if (!profilePictureCheck.rows[0].exists) {
      console.log('🔧 Adding profile_picture column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN profile_picture TEXT');
      console.log('✅ profile_picture column added successfully');
    } else {
      console.log('✓ profile_picture column already exists');
    }

    // Migration 3: Create push_tokens table if it doesn't exist
    const pushTokensTableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'push_tokens'
      )`
    );

    if (!pushTokensTableCheck.rows[0].exists) {
      console.log('🔧 Creating push_tokens table...');
      await pool.query(`
        CREATE TABLE push_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          push_token TEXT NOT NULL UNIQUE,
          device_type VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ push_tokens table created successfully');
    } else {
      console.log('✓ push_tokens table already exists');
    }

    console.log('✅ All migrations completed');
  } catch (error) {
    console.error('⚠️ Migration error:', error.message);
    console.error(error);
    // Don't crash the server
  }
}

// Start server - Listen on all network interfaces (0.0.0.0) for mobile device access
app.listen(PORT, '0.0.0.0', async () => {
  const localIp = getLocalIpAddress();
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Network access: http://${localIp}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📱 Mobile app should connect to: http://${localIp}:${PORT}/api`);

  // Auto-initialize database if needed
  await checkAndInitializeDatabase();

  // Start APM memory monitoring
  startMemoryMonitoring(5); // Monitor every 5 minutes
});

module.exports = app;
