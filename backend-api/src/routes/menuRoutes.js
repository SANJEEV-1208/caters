const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menus - Get all menu items for a caterer
router.get('/', menuController.getCatererMenuItems);

// GET /api/menus/by-date - Get menu items by date
router.get('/by-date', menuController.getMenuItemsByDate);

// GET /api/menus/:id - Get single menu item
router.get('/:id', menuController.getMenuItemById);

// POST /api/menus - Create menu item
router.post('/', menuController.createMenuItem);

// PUT /api/menus/:id - Update menu item
router.put('/:id', menuController.updateMenuItem);

// PATCH /api/menus/:id/stock - Toggle stock status
router.patch('/:id/stock', menuController.toggleStock);

// DELETE /api/menus/:id - Delete menu item
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
