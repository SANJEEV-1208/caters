const subscriptionService = require('../services/subscriptionService');

// Get customer subscriptions
exports.getCustomerSubscriptions = async (req, res) => {
  return await subscriptionService.getCustomerSubscriptions(req, res);
};

// Get caterer details
exports.getCatererDetails = async (req, res) => {
  return await subscriptionService.getCatererDetails(req, res);
};

// Get all caterers
exports.getAllCaterers = async (req, res) => {
  return await subscriptionService.getAllCaterers(req, res);
};

// Create subscription
exports.createSubscription = async (req, res) => {
  return await subscriptionService.createSubscription(req, res);
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  return await subscriptionService.deleteSubscription(req, res);
};
