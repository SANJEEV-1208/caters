/**
 * Security Dashboard Routes
 *
 * Endpoints for monitoring security and performance
 */

const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');

// All security endpoints require authentication
router.use(authenticateToken);

// Most endpoints require admin role
const requireAdmin = authorizeRole(['superadmin', 'admin']);

// Security Overview
router.get('/overview', requireAdmin, securityController.getSecurityOverview);

// Alerts
router.get('/alerts', requireAdmin, securityController.getAlerts);
router.get('/alerts/stats', requireAdmin, securityController.getAlertStats);

// Performance Monitoring
router.get('/performance', requireAdmin, securityController.getPerformanceMetrics);
router.get('/health', requireAdmin, securityController.getHealthStatus);

// Security Events
router.get('/failed-logins', requireAdmin, securityController.getFailedLogins);
router.get('/suspicious', requireAdmin, securityController.getSuspiciousActivities);
router.get('/ip/:ipAddress', requireAdmin, securityController.getActivityByIP);

module.exports = router;
