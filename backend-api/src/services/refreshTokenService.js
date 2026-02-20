const pool = require('../config/database');
const crypto = require('crypto');

// Token expiry durations
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 90; // 90 days

/**
 * Generate a secure random refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Hash a refresh token for storage (extra security layer)
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create and store a new refresh token for a user
 */
exports.createRefreshToken = async (userId, deviceInfo = null, ipAddress = null) => {
  try {
    const token = generateRefreshToken();
    const hashedToken = hashToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, device_info, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, hashedToken, expiresAt, deviceInfo, ipAddress]
    );

    console.log(`✅ Refresh token created for user ${userId}, expires at ${expiresAt}`);

    // Return the unhashed token to send to client
    return {
      token,
      expiresAt,
      expiryDays: REFRESH_TOKEN_EXPIRY_DAYS
    };
  } catch (error) {
    console.error('Create refresh token error:', error);
    throw error;
  }
};

/**
 * Verify a refresh token and return user info if valid
 */
exports.verifyRefreshToken = async (token) => {
  try {
    const hashedToken = hashToken(token);

    const result = await pool.query(
      `SELECT rt.*, u.id as user_id, u.phone, u.role, u.name,
              u.service_name, u.address, u.cater_type, u.restaurant_name,
              u.restaurant_address, u.payment_qr_code, u.profile_picture
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1
         AND rt.is_revoked = FALSE
         AND rt.expires_at > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return null; // Token invalid, expired, or revoked
    }

    // Update last_used_at timestamp
    await pool.query(
      'UPDATE refresh_tokens SET last_used_at = NOW() WHERE token = $1',
      [hashedToken]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Verify refresh token error:', error);
    throw error;
  }
};

/**
 * Revoke a specific refresh token (logout from one device)
 */
exports.revokeRefreshToken = async (token) => {
  try {
    const hashedToken = hashToken(token);

    const result = await pool.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1 RETURNING user_id',
      [hashedToken]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Refresh token revoked for user ${result.rows[0].user_id}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Revoke refresh token error:', error);
    throw error;
  }
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
exports.revokeAllUserTokens = async (userId) => {
  try {
    const result = await pool.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1 AND is_revoked = FALSE',
      [userId]
    );

    console.log(`✅ Revoked ${result.rowCount} refresh tokens for user ${userId}`);
    return result.rowCount;
  } catch (error) {
    console.error('Revoke all tokens error:', error);
    throw error;
  }
};

/**
 * Clean up expired tokens (run periodically via cron job)
 */
exports.cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );

    console.log(`✅ Cleaned up ${result.rowCount} expired refresh tokens`);
    return result.rowCount;
  } catch (error) {
    console.error('Cleanup expired tokens error:', error);
    throw error;
  }
};

/**
 * Get active refresh tokens for a user (for security dashboard)
 */
exports.getUserActiveTokens = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, device_info, ip_address, created_at, last_used_at, expires_at
       FROM refresh_tokens
       WHERE user_id = $1 AND is_revoked = FALSE AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Get user active tokens error:', error);
    throw error;
  }
};

module.exports.ACCESS_TOKEN_EXPIRY = ACCESS_TOKEN_EXPIRY;
module.exports.REFRESH_TOKEN_EXPIRY_DAYS = REFRESH_TOKEN_EXPIRY_DAYS;
