/**
 * Security Dashboard Controller
 *
 * Provides endpoints for monitoring security and performance metrics
 */

const alertService = require('../services/alertService');
const apmService = require('../services/apmService');
const auditService = require('../services/auditService');

/**
 * Get security overview dashboard
 * GET /api/security/overview
 */
async function getSecurityOverview(req, res) {
  try {
    // Get alert statistics
    const alertStats = await alertService.getAlertStats(24);

    // Get recent alerts
    const recentAlerts = await alertService.getRecentAlerts(10);

    // Get audit statistics
    const auditStats = await auditService.getAuditStats({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    });

    // Get APM health status
    const healthStatus = apmService.getHealthStatus();

    res.json({
      overview: {
        health: healthStatus,
        alerts: alertStats,
        audit: auditStats,
      },
      recentAlerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching security overview:', error);
    res.status(500).json({ error: 'Failed to fetch security overview' });
  }
}

/**
 * Get recent security alerts
 * GET /api/security/alerts
 */
async function getAlerts(req, res) {
  try {
    const limit = Number.parseInt(req.query.limit) || 50;
    const alerts = await alertService.getRecentAlerts(limit);

    res.json({
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

/**
 * Get alert statistics
 * GET /api/security/alerts/stats
 */
async function getAlertStats(req, res) {
  try {
    const hours = Number.parseInt(req.query.hours) || 24;
    const stats = await alertService.getAlertStats(hours);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
}

/**
 * Get performance metrics
 * GET /api/security/performance
 */
function getPerformanceMetrics(req, res) {
  try {
    const metrics = apmService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
}

/**
 * Get health status
 * GET /api/security/health
 */
function getHealthStatus(req, res) {
  try {
    const health = apmService.getHealthStatus();
    res.json(health);
  } catch (error) {
    console.error('Error fetching health status:', error);
    res.status(500).json({ error: 'Failed to fetch health status' });
  }
}

/**
 * Get failed login attempts (last 24 hours)
 * GET /api/security/failed-logins
 */
async function getFailedLogins(req, res) {
  try {
    const hours = Number.parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await require('../config/database').query(
      `SELECT
        metadata->>'phone' as phone,
        ip_address,
        user_agent,
        timestamp,
        description
       FROM audit_logs
       WHERE action_type = 'AUTH_LOGIN_FAILURE'
         AND timestamp > $1
       ORDER BY timestamp DESC
       LIMIT 100`,
      [since]
    );

    res.json({
      failedLogins: result.rows,
      count: result.rows.length,
      timePeriodHours: hours,
    });
  } catch (error) {
    console.error('Error fetching failed logins:', error);
    res.status(500).json({ error: 'Failed to fetch failed logins' });
  }
}

/**
 * Get suspicious activities
 * GET /api/security/suspicious
 */
async function getSuspiciousActivities(req, res) {
  try {
    const hours = Number.parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await require('../config/database').query(
      `SELECT
        action_type,
        description,
        user_id,
        user_role,
        ip_address,
        timestamp,
        metadata
       FROM audit_logs
       WHERE (
         action_type LIKE '%UNAUTHORIZED%'
         OR action_type LIKE '%FAILURE%'
         OR success = false
       )
       AND timestamp > $1
       ORDER BY timestamp DESC
       LIMIT 100`,
      [since]
    );

    res.json({
      activities: result.rows,
      count: result.rows.length,
      timePeriodHours: hours,
    });
  } catch (error) {
    console.error('Error fetching suspicious activities:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious activities' });
  }
}

/**
 * Get activity by IP address
 * GET /api/security/ip/:ipAddress
 */
async function getActivityByIP(req, res) {
  try {
    const { ipAddress } = req.params;
    const hours = Number.parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await require('../config/database').query(
      `SELECT
        action_type,
        description,
        user_id,
        user_role,
        timestamp,
        success
       FROM audit_logs
       WHERE ip_address = $1
         AND timestamp > $2
       ORDER BY timestamp DESC
       LIMIT 100`,
      [ipAddress, since]
    );

    res.json({
      ipAddress,
      activities: result.rows,
      count: result.rows.length,
      timePeriodHours: hours,
    });
  } catch (error) {
    console.error('Error fetching IP activity:', error);
    res.status(500).json({ error: 'Failed to fetch IP activity' });
  }
}

module.exports = {
  getSecurityOverview,
  getAlerts,
  getAlertStats,
  getPerformanceMetrics,
  getHealthStatus,
  getFailedLogins,
  getSuspiciousActivities,
  getActivityByIP,
};
