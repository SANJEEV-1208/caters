/**
 * Security Alert Service - Simplified
 *
 * Monitors for suspicious activities and security threats:
 * - Multiple failed login attempts
 * - Unusual order patterns
 * - Unauthorized access attempts
 * - Database errors
 */

const pool = require('../config/database');

// Alert thresholds (configurable)
const ALERT_THRESHOLDS = {
  FAILED_LOGIN_ATTEMPTS: 5,        // Failed logins within timeframe
  FAILED_LOGIN_WINDOW: 5,          // Minutes
  HIGH_VALUE_ORDER: 10000,         // Rs. 10,000+
  RAPID_ORDERS: 10,                // Orders within timeframe
  RAPID_ORDER_WINDOW: 30,          // Minutes
};

/**
 * Alert levels
 */
const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Alert types
 */
const ALERT_TYPES = {
  FAILED_LOGIN: 'FAILED_LOGIN',
  BRUTE_FORCE: 'BRUTE_FORCE',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  HIGH_VALUE_ORDER: 'HIGH_VALUE_ORDER',
  RAPID_ORDERS: 'RAPID_ORDERS',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
};

/**
 * Send alert - Logs to console AND stores in database
 */
async function sendAlert(level, type, message, metadata = {}) {
  const timestamp = new Date().toISOString();

  // Console logging
  console.log(`[${timestamp}] SECURITY ALERT [${level.toUpperCase()}] - ${type}: ${message}`);

  if (Object.keys(metadata).length > 0) {
    console.log('  Details:', JSON.stringify(metadata, null, 2));
  }

  // Store in database
  try {
    const result = await pool.query(
      `INSERT INTO security_alerts (alert_level, alert_type, message, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [level, type, message, JSON.stringify(metadata)]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Failed to store alert in database:', error);
    // Return basic alert object even if database insert fails
    return {
      timestamp,
      alert_level: level,
      alert_type: type,
      message,
      metadata,
    };
  }
}

/**
 * Check for brute force login attempts
 */
async function checkBruteForceAttempts(phone, ipAddress) {
  try {
    const windowStart = new Date(Date.now() - ALERT_THRESHOLDS.FAILED_LOGIN_WINDOW * 60 * 1000);

    const result = await pool.query(
      `SELECT COUNT(*) as failed_count
       FROM audit_logs
       WHERE action_type = 'AUTH_LOGIN_FAILURE'
         AND timestamp > $1
         AND (metadata->>'phone' = $2 OR ip_address = $3)`,
      [windowStart, phone, ipAddress]
    );

    const failedCount = Number.parseInt(result.rows[0].failed_count);

    if (failedCount >= ALERT_THRESHOLDS.FAILED_LOGIN_ATTEMPTS) {
      await sendAlert(
        ALERT_LEVELS.CRITICAL,
        ALERT_TYPES.BRUTE_FORCE,
        `Possible brute force attack detected: ${failedCount} failed login attempts`,
        {
          phone,
          ip_address: ipAddress,
          failed_count: failedCount,
          time_window_minutes: ALERT_THRESHOLDS.FAILED_LOGIN_WINDOW,
        }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking brute force attempts:', error);
    return false;
  }
}

/**
 * Check for rapid order placement (potential fraud)
 */
async function checkRapidOrders(userId) {
  try {
    const windowStart = new Date(Date.now() - ALERT_THRESHOLDS.RAPID_ORDER_WINDOW * 60 * 1000);

    const result = await pool.query(
      `SELECT COUNT(*) as order_count
       FROM orders
       WHERE user_id = $1
         AND created_at > $2`,
      [userId, windowStart]
    );

    const orderCount = Number.parseInt(result.rows[0].order_count);

    if (orderCount >= ALERT_THRESHOLDS.RAPID_ORDERS) {
      await sendAlert(
        ALERT_LEVELS.WARNING,
        ALERT_TYPES.RAPID_ORDERS,
        `User ${userId} placed ${orderCount} orders in ${ALERT_THRESHOLDS.RAPID_ORDER_WINDOW} minutes`,
        {
          user_id: userId,
          order_count: orderCount,
          time_window_minutes: ALERT_THRESHOLDS.RAPID_ORDER_WINDOW,
        }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking rapid orders:', error);
    return false;
  }
}

/**
 * Check for high-value orders (potential fraud)
 */
async function checkHighValueOrder(orderId, totalAmount, userId) {
  if (totalAmount >= ALERT_THRESHOLDS.HIGH_VALUE_ORDER) {
    await sendAlert(
      ALERT_LEVELS.WARNING,
      ALERT_TYPES.HIGH_VALUE_ORDER,
      `High-value order detected: Rs. ${totalAmount}`,
      {
        order_id: orderId,
        user_id: userId,
        amount: totalAmount,
        threshold: ALERT_THRESHOLDS.HIGH_VALUE_ORDER,
      }
    );
    return true;
  }
  return false;
}

/**
 * Check for unauthorized access attempts
 */
async function checkUnauthorizedAccess(userId, requestedRole, actualRole) {
  if (requestedRole !== actualRole) {
    await sendAlert(
      ALERT_LEVELS.ERROR,
      ALERT_TYPES.UNAUTHORIZED_ACCESS,
      `User ${userId} attempted to access ${requestedRole} resources`,
      {
        user_id: userId,
        requested_role: requestedRole,
        actual_role: actualRole,
      }
    );
    return true;
  }
  return false;
}

/**
 * Report database error
 */
async function reportDatabaseError(error, query = null) {
  await sendAlert(
    ALERT_LEVELS.CRITICAL,
    ALERT_TYPES.DATABASE_ERROR,
    `Database error: ${error.message}`,
    {
      error_message: error.message,
      error_code: error.code,
      query: query?.substring(0, 200), // First 200 chars only
    }
  );
}

/**
 * Get recent alerts from security_alerts table (for dashboard)
 */
async function getRecentAlerts(limit = 50) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        alert_level,
        alert_type,
        message,
        metadata,
        is_acknowledged,
        is_resolved,
        created_at
       FROM security_alerts
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    return [];
  }
}

/**
 * Get alert statistics from security_alerts table (for dashboard)
 */
async function getAlertStats(hours = 24) {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN alert_level = 'critical' THEN 1 END) as critical_alerts,
        COUNT(CASE WHEN alert_level = 'error' THEN 1 END) as error_alerts,
        COUNT(CASE WHEN alert_level = 'warning' THEN 1 END) as warning_alerts,
        COUNT(CASE WHEN alert_type = 'BRUTE_FORCE' THEN 1 END) as brute_force_attempts,
        COUNT(CASE WHEN alert_type = 'HIGH_VALUE_ORDER' THEN 1 END) as high_value_orders,
        COUNT(CASE WHEN alert_type = 'RAPID_ORDERS' THEN 1 END) as rapid_orders,
        COUNT(CASE WHEN is_acknowledged = false THEN 1 END) as unacknowledged,
        COUNT(CASE WHEN is_resolved = false THEN 1 END) as unresolved
       FROM security_alerts
       WHERE created_at > $1`,
      [since]
    );

    return {
      time_period_hours: hours,
      total_alerts: Number.parseInt(result.rows[0].total_alerts),
      critical_alerts: Number.parseInt(result.rows[0].critical_alerts),
      error_alerts: Number.parseInt(result.rows[0].error_alerts),
      warning_alerts: Number.parseInt(result.rows[0].warning_alerts),
      brute_force_attempts: Number.parseInt(result.rows[0].brute_force_attempts),
      high_value_orders: Number.parseInt(result.rows[0].high_value_orders),
      rapid_orders: Number.parseInt(result.rows[0].rapid_orders),
      unacknowledged: Number.parseInt(result.rows[0].unacknowledged),
      unresolved: Number.parseInt(result.rows[0].unresolved),
    };
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return null;
  }
}

/**
 * Acknowledge an alert
 */
async function acknowledgeAlert(alertId, userId) {
  try {
    const result = await pool.query(
      `UPDATE security_alerts
       SET is_acknowledged = true,
           acknowledged_by = $1,
           acknowledged_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [userId, alertId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
}

/**
 * Resolve an alert
 */
async function resolveAlert(alertId, userId, resolutionNotes = null) {
  try {
    const result = await pool.query(
      `UPDATE security_alerts
       SET is_resolved = true,
           resolved_by = $1,
           resolved_at = CURRENT_TIMESTAMP,
           resolution_notes = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [userId, resolutionNotes, alertId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw error;
  }
}

/**
 * Get unresolved alerts
 */
async function getUnresolvedAlerts(limit = 50) {
  try {
    const result = await pool.query(
      `SELECT *
       FROM security_alerts
       WHERE is_resolved = false
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching unresolved alerts:', error);
    return [];
  }
}

module.exports = {
  ALERT_LEVELS,
  ALERT_TYPES,
  sendAlert,
  checkBruteForceAttempts,
  checkRapidOrders,
  checkHighValueOrder,
  checkUnauthorizedAccess,
  reportDatabaseError,
  getRecentAlerts,
  getAlertStats,
  acknowledgeAlert,
  resolveAlert,
  getUnresolvedAlerts,
};
