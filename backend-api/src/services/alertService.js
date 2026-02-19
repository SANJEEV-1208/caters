/**
 * Real-time Security Alert Service
 *
 * Monitors for suspicious activities and security threats:
 * - Multiple failed login attempts
 * - Unusual order patterns
 * - Unauthorized access attempts
 * - Database errors
 * - High error rates
 */

const pool = require('../config/database');
const { captureMessage } = require('../config/sentry');

// Alert thresholds (configurable)
const ALERT_THRESHOLDS = {
  FAILED_LOGIN_ATTEMPTS: 5,        // Failed logins within timeframe
  FAILED_LOGIN_WINDOW: 5,          // Minutes
  HIGH_VALUE_ORDER: 10000,         // Rs. 10,000+
  RAPID_ORDERS: 10,                // Orders within timeframe
  RAPID_ORDER_WINDOW: 30,          // Minutes
  ERROR_RATE_THRESHOLD: 0.1,       // 10% error rate
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
  HIGH_ERROR_RATE: 'HIGH_ERROR_RATE',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
};

/**
 * Send alert (console + Sentry for now, can add email/SMS later)
 */
function sendAlert(level, type, message, metadata = {}) {
  const alert = {
    timestamp: new Date().toISOString(),
    level,
    type,
    message,
    metadata,
  };

  // Log to console
  const emoji = level === ALERT_LEVELS.CRITICAL ? '🚨' :
                level === ALERT_LEVELS.ERROR ? '❌' :
                level === ALERT_LEVELS.WARNING ? '⚠️' : 'ℹ️';

  console.log(`${emoji} SECURITY ALERT [${level.toUpperCase()}] - ${type}: ${message}`);
  console.log('   Metadata:', JSON.stringify(metadata, null, 2));

  // Send to Sentry for critical/error alerts
  if (level === ALERT_LEVELS.CRITICAL || level === ALERT_LEVELS.ERROR) {
    captureMessage(`Security Alert: ${type} - ${message}`, level, {
      tags: { alert_type: type },
      extra: metadata,
    });
  }

  // TODO: Add email/webhook notifications for critical alerts
  // if (level === ALERT_LEVELS.CRITICAL) {
  //   sendEmailAlert(alert);
  //   sendWebhookAlert(alert);
  // }

  return alert;
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

    const failedCount = parseInt(result.rows[0].failed_count);

    if (failedCount >= ALERT_THRESHOLDS.FAILED_LOGIN_ATTEMPTS) {
      sendAlert(
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

    const orderCount = parseInt(result.rows[0].order_count);

    if (orderCount >= ALERT_THRESHOLDS.RAPID_ORDERS) {
      sendAlert(
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
    sendAlert(
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
function checkUnauthorizedAccess(userId, requestedRole, actualRole) {
  if (requestedRole !== actualRole) {
    sendAlert(
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
function reportDatabaseError(error, query = null) {
  sendAlert(
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
 * Get recent alerts (for dashboard)
 */
async function getRecentAlerts(limit = 50) {
  try {
    // For now, we'll get recent critical audit logs
    // In production, you'd store alerts in a separate table
    const result = await pool.query(
      `SELECT
        id,
        action_type as type,
        description as message,
        timestamp,
        metadata,
        ip_address
       FROM audit_logs
       WHERE success = false
          OR action_type IN ('AUTH_LOGIN_FAILURE', 'AUTH_UNAUTHORIZED_ACCESS')
       ORDER BY timestamp DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      message: row.message,
      timestamp: row.timestamp,
      level: row.type.includes('FAILURE') ? ALERT_LEVELS.ERROR : ALERT_LEVELS.WARNING,
      metadata: row.metadata,
      ip_address: row.ip_address,
    }));
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    return [];
  }
}

/**
 * Get alert statistics (for dashboard)
 */
async function getAlertStats(hours = 24) {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await pool.query(
      `SELECT
        COUNT(CASE WHEN action_type = 'AUTH_LOGIN_FAILURE' THEN 1 END) as failed_logins,
        COUNT(CASE WHEN action_type LIKE '%UNAUTHORIZED%' THEN 1 END) as unauthorized_attempts,
        COUNT(CASE WHEN success = false THEN 1 END) as total_failures
       FROM audit_logs
       WHERE timestamp > $1`,
      [since]
    );

    return {
      time_period_hours: hours,
      failed_logins: parseInt(result.rows[0].failed_logins),
      unauthorized_attempts: parseInt(result.rows[0].unauthorized_attempts),
      total_failures: parseInt(result.rows[0].total_failures),
    };
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return null;
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
};
