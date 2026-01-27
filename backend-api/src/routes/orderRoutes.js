const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Create order
router.post('/', orderController.createOrder);

// GET /api/orders/customer - Get orders by customer
router.get('/customer', orderController.getOrdersByCustomer);

// GET /api/orders/caterer - Get orders by caterer
router.get('/caterer', orderController.getOrdersByCaterer);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
