/**
 * Audit Log Routes
 * Endpoints for retrieving audit logs and statistics
 */

const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/audit/logs
 * Get audit logs with optional filters
 * Query params: userId, userRole, actionType, actionCategory, entityType, success, startDate, endDate, limit, offset
 * Auth: Required - users can only view their own logs
 */
router.get('/logs', authenticateToken, auditController.getAuditLogs);

/**
 * GET /api/audit/stats
 * Get audit log statistics
 * Query params: userId, startDate, endDate
 * Auth: Required - users can only view their own stats
 */
router.get('/stats', authenticateToken, auditController.getAuditStats);

/**
 * GET /api/audit/users/:userId/activity
 * Get user activity timeline
 * Path params: userId
 * Query params: limit, offset
 * Auth: Required - users can only view their own activity
 */
router.get('/users/:userId/activity', authenticateToken, auditController.getUserActivity);

module.exports = router;
