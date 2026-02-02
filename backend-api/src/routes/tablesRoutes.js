const express = require('express');
const router = express.Router();
const tablesController = require('../controllers/tablesController');

// Create multiple tables with QR codes
router.post('/bulk', tablesController.createBulkTables);

// Get all tables for a caterer
router.get('/', tablesController.getTablesByCaterer);

// Get single table by ID
router.get('/:id', tablesController.getTableById);

// Update table (table number or active status)
router.patch('/:id', tablesController.updateTable);

// Delete table
router.delete('/:id', tablesController.deleteTable);

// Regenerate QR code for a table
router.post('/:id/regenerate-qr', tablesController.regenerateQR);

module.exports = router;
