const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kaaspro-secret-key-change-in-production-2026';

/**
 * Middleware to authenticate JWT token
 * Attaches user info to req.user
 */
exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required. Please login.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(403).json({ error: 'Invalid token. Please login again.' });
      }

      // Attach user info to request
      req.user = user; // Contains: { id, phone, role }
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Usage: requireRole('caterer') or requireRole('caterer', 'customer')
 */
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 * Validates that req.user.id matches the user ID in the request
 */
exports.requireOwnership = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user ID from params, body, or query
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam] || req.query[userIdParam];

    if (!resourceUserId) {
      return res.status(400).json({ error: 'User ID not found in request' });
    }

    // Convert both to numbers for comparison
    if (Number(resourceUserId) !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Authenticates if token is present, but doesn't require it
 * Useful for endpoints that work for both authenticated and guest users
 */
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue as guest
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Invalid token, continue as guest
      req.user = null;
    } else {
      // Valid token, attach user
      req.user = user;
    }
    next();
  });
};
