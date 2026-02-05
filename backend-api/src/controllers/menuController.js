const menuService = require('../services/menuService');

// Get all menu items for a caterer
exports.getCatererMenuItems = async (req, res) => {
  return await menuService.getCatererMenuItems(req, res);
};

// Get menu items by date
exports.getMenuItemsByDate = async (req, res) => {
  return await menuService.getMenuItemsByDate(req, res);
};

// Get single menu item by ID
exports.getMenuItemById = async (req, res) => {
  return await menuService.getMenuItemById(req, res);
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  return await menuService.createMenuItem(req, res);
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  return await menuService.updateMenuItem(req, res);
};

// Toggle stock status
exports.toggleStock = async (req, res) => {
  return await menuService.toggleStock(req, res);
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  return await menuService.deleteMenuItem(req, res);
};
