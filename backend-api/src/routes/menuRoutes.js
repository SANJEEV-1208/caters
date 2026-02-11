const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { menuLimiter } = require('../middleware/rateLimiter');
const {
  validateMenuItem,
  validateMenuId,
  validateCatererId,
  handleValidationErrors
} = require('../middleware/validators');

// GET /api/menus - Get all menu items for a caterer (public, but validated)
router.get(
  '/',
  validateCatererId,
  handleValidationErrors,
  menuController.getCatererMenuItems
);

// GET /api/menus/by-date - Get menu items by date (public, but validated)
router.get(
  '/by-date',
  validateCatererId,
  handleValidationErrors,
  menuController.getMenuItemsByDate
);

// GET /api/menus/:id - Get single menu item (public)
router.get(
  '/:id',
  validateMenuId,
  handleValidationErrors,
  menuController.getMenuItemById
);

// POST /api/menus - Create menu item (protected, caterer only, rate limited)
router.post(
  '/',
  authenticateToken,
  requireRole('caterer'),
  menuLimiter,
  validateMenuItem,
  handleValidationErrors,
  menuController.createMenuItem
);

// PUT /api/menus/:id - Update menu item (protected, caterer only)
router.put(
  '/:id',
  authenticateToken,
  requireRole('caterer'),
  validateMenuId,
  validateMenuItem,
  handleValidationErrors,
  menuController.updateMenuItem
);

// PATCH /api/menus/:id/stock - Toggle stock status (protected, caterer only)
router.patch(
  '/:id/stock',
  authenticateToken,
  requireRole('caterer'),
  validateMenuId,
  handleValidationErrors,
  menuController.toggleStock
);

// DELETE /api/menus/:id - Delete menu item (protected, caterer only)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('caterer'),
  validateMenuId,
  handleValidationErrors,
  menuController.deleteMenuItem
);

module.exports = router;
