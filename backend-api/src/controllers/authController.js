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

// Search user by phone (NO PIN REQUIRED - for caterers adding customers)
exports.searchUserByPhone = async (req, res) => {
  return await authService.searchUserByPhone(req, res);
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

// Set PIN for first-time users
exports.setPin = async (req, res) => {
  return await authService.setPin(req, res);
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  return await authService.updateUserProfile(req, res);
};

// Refresh access token using refresh token
exports.refreshAccessToken = async (req, res) => {
  return await authService.refreshAccessToken(req, res);
};

// Logout user and revoke refresh token
exports.logoutUser = async (req, res) => {
  return await authService.logoutUser(req, res);
};

// Logout from all devices
exports.logoutAllDevices = async (req, res) => {
  return await authService.logoutAllDevices(req, res);
};
