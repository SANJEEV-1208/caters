const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireOwnership, requireRole } = require('../middleware/auth');
const { authLimiter, qrCodeLimiter } = require('../middleware/rateLimiter');
const {
  validateLogin,
  validateSignup,
  validateGuestRegistration,
  validateCreateCustomer,
  validateSetPin,
  validateUserId,
  validatePaymentQrCode,
  handleValidationErrors
} = require('../middleware/validators');

// POST /api/auth/login - Login user (rate limited, validated)
router.post(
  '/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  authController.loginUser
);

// POST /api/auth/signup - Signup caterer (rate limited, validated)
router.post(
  '/signup',
  authLimiter,
  validateSignup,
  handleValidationErrors,
  authController.signupCaterer
);

// POST /api/auth/restaurant-signup - Signup as restaurant (rate limited, validated)
router.post(
  '/restaurant-signup',
  authLimiter,
  validateSignup,
  handleValidationErrors,
  authController.signupRestaurant
);

// POST /api/auth/create-customer - Create customer (protected, caterer only)
router.post(
  '/create-customer',
  authenticateToken,
  requireRole('caterer'),
  validateCreateCustomer,
  handleValidationErrors,
  authController.createCustomer
);

// POST /api/auth/guest-register - Register guest customer (public, for QR code orders - NO PIN REQUIRED)
router.post(
  '/guest-register',
  authLimiter,
  validateGuestRegistration,
  handleValidationErrors,
  authController.createCustomer
);

// GET /api/auth/users/:id - Get user by ID (protected, ownership required)
router.get(
  '/users/:id',
  authenticateToken,
  validateUserId,
  handleValidationErrors,
  requireOwnership('id'),
  authController.getUserById
);

// PATCH /api/auth/users/:id - Update user profile (protected, ownership required)
router.patch(
  '/users/:id',
  authenticateToken,
  validateUserId,
  handleValidationErrors,
  requireOwnership('id'),
  authController.updateUserProfile
);

// PATCH /api/auth/users/:id/qr - Update payment QR code (protected, ownership + rate limited)
router.patch(
  '/users/:id/qr',
  authenticateToken,
  qrCodeLimiter,
  validateUserId,
  validatePaymentQrCode,
  handleValidationErrors,
  requireOwnership('id'),
  authController.updatePaymentQrCode
);

// POST /api/auth/set-pin - Set PIN for first-time users (validated)
router.post(
  '/set-pin',
  validateSetPin,
  handleValidationErrors,
  authController.setPin
);

// POST /api/auth/refresh - Refresh access token using refresh token (public)
router.post(
  '/refresh',
  authController.refreshAccessToken
);

// POST /api/auth/logout - Logout user and revoke refresh token (public)
router.post(
  '/logout',
  authController.logoutUser
);

// POST /api/auth/logout-all - Logout from all devices (protected)
router.post(
  '/logout-all',
  authenticateToken,
  authController.logoutAllDevices
);

module.exports = router;
