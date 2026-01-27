const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// GET /api/subscriptions - Get customer subscriptions
router.get('/', subscriptionController.getCustomerSubscriptions);

// GET /api/subscriptions/caterers - Get all caterers
router.get('/caterers', subscriptionController.getAllCaterers);

// GET /api/subscriptions/caterers/:catererId - Get caterer details
router.get('/caterers/:catererId', subscriptionController.getCatererDetails);

// POST /api/subscriptions - Create subscription
router.post('/', subscriptionController.createSubscription);

// DELETE /api/subscriptions/:id - Delete subscription
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
