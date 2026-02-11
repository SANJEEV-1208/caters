const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Skip successful requests in count (optional)
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 attempts per 15 minutes per IP
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login/signup attempts per window
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Moderate rate limiter for order creation
 * Limits: 10 orders per hour per IP
 */
exports.orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour
  message: {
    error: 'Too many orders placed. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for menu item creation
 * Limits: 50 items per hour per IP (for caterers)
 */
exports.menuLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 menu items per hour
  message: {
    error: 'Too many menu items created. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for payment QR code updates
 * Limits: 3 updates per hour per IP
 */
exports.qrCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 QR code updates per hour
  message: {
    error: 'Too many QR code updates. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
