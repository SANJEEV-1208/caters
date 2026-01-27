const express = require('express');
const router = express.Router();
const cuisineController = require('../controllers/cuisineController');

// Caterer-specific routes (must come before :id routes to avoid conflicts)
router.get('/caterer/:catererId', cuisineController.getCatererCuisines);
router.post('/caterer', cuisineController.createCatererCuisine);
router.delete('/caterer/:id', cuisineController.deleteCatererCuisine);

// GET /api/cuisines - Get all cuisines
router.get('/', cuisineController.getAllCuisines);

// POST /api/cuisines - Create cuisine
router.post('/', cuisineController.createCuisine);

// DELETE /api/cuisines/:id - Delete cuisine
router.delete('/:id', cuisineController.deleteCuisine);

module.exports = router;
