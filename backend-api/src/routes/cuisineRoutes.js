const express = require('express');
const router = express.Router();
const cuisineController = require('../controllers/cuisineController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateCuisine, handleValidationErrors } = require('../middleware/validators');

// Caterer-specific routes (must come before :id routes to avoid conflicts)

// GET /api/cuisines/caterer/:catererId - Get caterer cuisines (public - for browsing)
router.get('/caterer/:catererId', cuisineController.getCatererCuisines);

// POST /api/cuisines/caterer - Create caterer cuisine (protected, caterer only)
router.post(
  '/caterer',
  authenticateToken,
  requireRole('caterer'),
  validateCuisine,
  handleValidationErrors,
  cuisineController.createCatererCuisine
);

// DELETE /api/cuisines/caterer/:id - Delete caterer cuisine (protected, caterer only)
router.delete(
  '/caterer/:id',
  authenticateToken,
  requireRole('caterer'),
  cuisineController.deleteCatererCuisine
);

// GET /api/cuisines - Get all cuisines (public)
router.get('/', cuisineController.getAllCuisines);

// POST /api/cuisines - Create cuisine (protected, caterer only)
router.post(
  '/',
  authenticateToken,
  requireRole('caterer'),
  validateCuisine,
  handleValidationErrors,
  cuisineController.createCuisine
);

// DELETE /api/cuisines/:id - Delete cuisine (protected, caterer only)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('caterer'),
  cuisineController.deleteCuisine
);

module.exports = router;
