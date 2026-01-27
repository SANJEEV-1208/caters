const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController');

// GET /api/apartments - Get caterer apartments
router.get('/', apartmentController.getCatererApartments);

// GET /api/apartments/customer - Get customer apartments
router.get('/customer', apartmentController.getCustomerApartments);

// POST /api/apartments - Create apartment
router.post('/', apartmentController.createApartment);

// POST /api/apartments/link - Link customer to apartment via access code
router.post('/link', apartmentController.linkCustomerToApartment);

// POST /api/apartments/manual-link - Manually link customer to apartment (by caterer)
router.post('/manual-link', apartmentController.manualLinkCustomerToApartment);

// DELETE /api/apartments/:id - Delete apartment
router.delete('/:id', apartmentController.deleteApartment);

module.exports = router;
