const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const {
  validateOrder,
  validateTransactionId,
  validateGuestOrderInfo,
  validateOrderId,
  validateCustomerId,
  validateCatererId,
  handleValidationErrors
} = require('../middleware/validators');

// POST /api/orders - Create order (public for guest orders, rate limited, with validation)
// Guests (QR scanner): No authentication required, must provide guestName and guestPhone
// Authenticated users: Include JWT token, must provide customerId
router.post(
  '/',
  orderLimiter,
  validateOrder,
  handleValidationErrors,
  validateGuestOrderInfo, // Ensures guest orders have name/phone when no customerId
  validateTransactionId, // Custom middleware for transaction ID validation
  orderController.createOrder
);

// GET /api/orders/customer - Get orders by customer (protected, customer only)
router.get(
  '/customer',
  authenticateToken,
  requireRole('customer'),
  validateCustomerId,
  handleValidationErrors,
  orderController.getOrdersByCustomer
);

// GET /api/orders/caterer - Get orders by caterer (protected, caterer only)
router.get(
  '/caterer',
  authenticateToken,
  requireRole('caterer'),
  validateCatererId,
  handleValidationErrors,
  orderController.getOrdersByCaterer
);

// GET /api/orders/:id - Get order by ID (protected)
router.get(
  '/:id',
  authenticateToken,
  validateOrderId,
  handleValidationErrors,
  orderController.getOrderById
);

// PATCH /api/orders/:id/status - Update order status (protected, caterer only)
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('caterer'),
  validateOrderId,
  handleValidationErrors,
  orderController.updateOrderStatus
);

// DELETE /api/orders/:id - Delete order (protected, admin only - not implemented yet)
router.delete(
  '/:id',
  authenticateToken,
  validateOrderId,
  handleValidationErrors,
  orderController.deleteOrder
);

module.exports = router;
