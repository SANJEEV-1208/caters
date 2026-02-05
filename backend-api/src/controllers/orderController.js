const orderService = require('../services/orderService');

// Create order
exports.createOrder = async (req, res) => {
  return await orderService.createOrder(req, res);
};

// Get orders by customer
exports.getOrdersByCustomer = async (req, res) => {
  return await orderService.getOrdersByCustomer(req, res);
};

// Get orders by caterer
exports.getOrdersByCaterer = async (req, res) => {
  return await orderService.getOrdersByCaterer(req, res);
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  return await orderService.getOrderById(req, res);
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  return await orderService.updateOrderStatus(req, res);
};

// Delete order
exports.deleteOrder = async (req, res) => {
  return await orderService.deleteOrder(req, res);
};
