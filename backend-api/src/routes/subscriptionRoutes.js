const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateCustomerId, handleValidationErrors } = require('../middleware/validators');

// GET /api/subscriptions - Get customer subscriptions (protected, customer only - view their subscriptions)
router.get(
  '/',
  authenticateToken,
  requireRole('customer'),
  validateCustomerId,
  handleValidationErrors,
  subscriptionController.getCustomerSubscriptions
);

// GET /api/subscriptions/caterers - Get all caterers (public - for customer to browse)
router.get('/caterers', subscriptionController.getAllCaterers);

// GET /api/subscriptions/caterers/:catererId - Get caterer details (public - for customer to browse)
router.get('/caterers/:catererId', subscriptionController.getCatererDetails);

// GET /api/subscriptions/check - Check if customer is subscribed to caterer (protected, caterer only)
router.get(
  '/check',
  authenticateToken,
  requireRole('caterer'),
  subscriptionController.checkSubscription
);

// POST /api/subscriptions - Create subscription (protected, caterer only - caterer adds customer)
router.post(
  '/',
  authenticateToken,
  requireRole('caterer'),
  subscriptionController.createSubscription
);

// PATCH /api/subscriptions/customers/:customerId - Update customer profile (protected, caterer only)
router.patch(
  '/customers/:customerId',
  authenticateToken,
  requireRole('caterer'),
  subscriptionController.updateCustomerProfile
);

// DELETE /api/subscriptions/:id - Delete subscription (protected, caterer only - caterer removes customer)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('caterer'),
  subscriptionController.deleteSubscription
);

module.exports = router;
