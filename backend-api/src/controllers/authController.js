const authService = require('../services/authService');

// Login user by phone
exports.loginUser = async (req, res) => {
  return await authService.loginUser(req, res);
};

// Signup caterer
exports.signupCaterer = async (req, res) => {
  return await authService.signupCaterer(req, res);
};

// Get user by ID
exports.getUserById = async (req, res) => {
  return await authService.getUserById(req, res);
};

// Create customer (used by caterers when adding new customers)
exports.createCustomer = async (req, res) => {
  return await authService.createCustomer(req, res);
};

// Update payment QR code
exports.updatePaymentQrCode = async (req, res) => {
  return await authService.updatePaymentQrCode(req, res);
};

// Signup as restaurant (handles both new users and existing users)
exports.signupRestaurant = async (req, res) => {
  return await authService.signupRestaurant(req, res);
};
