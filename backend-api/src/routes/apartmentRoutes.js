const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateApartment, validateCatererId, handleValidationErrors } = require('../middleware/validators');

// GET /api/apartments - Get caterer apartments (protected, caterer only)
router.get(
  '/',
  authenticateToken,
  requireRole('caterer'),
  validateCatererId,
  handleValidationErrors,
  apartmentController.getCatererApartments
);

// GET /api/apartments/customer - Get customer apartments (protected, customer only)
router.get(
  '/customer',
  authenticateToken,
  requireRole('customer'),
  apartmentController.getCustomerApartments
);

// GET /api/apartments/links - Get customer apartment links by caterer (protected, caterer only)
router.get(
  '/links',
  authenticateToken,
  requireRole('caterer'),
  validateCatererId,
  handleValidationErrors,
  apartmentController.getCustomerApartmentLinks
);

// POST /api/apartments - Create apartment (protected, caterer only)
router.post(
  '/',
  authenticateToken,
  requireRole('caterer'),
  validateApartment,
  handleValidationErrors,
  apartmentController.createApartment
);

// POST /api/apartments/link - Link customer to apartment via access code (protected, customer only)
router.post(
  '/link',
  authenticateToken,
  requireRole('customer'),
  apartmentController.linkCustomerToApartment
);

// POST /api/apartments/manual-link - Manually link customer to apartment (protected, caterer only)
router.post(
  '/manual-link',
  authenticateToken,
  requireRole('caterer'),
  apartmentController.manualLinkCustomerToApartment
);

// DELETE /api/apartments/:id - Delete apartment (protected, caterer only)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('caterer'),
  apartmentController.deleteApartment
);

module.exports = router;
