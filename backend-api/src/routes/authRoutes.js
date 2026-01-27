const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - Login user
router.post('/login', authController.loginUser);

// POST /api/auth/signup - Signup caterer
router.post('/signup', authController.signupCaterer);

// POST /api/auth/create-customer - Create customer (used by caterers)
router.post('/create-customer', authController.createCustomer);

// GET /api/auth/users/:id - Get user by ID
router.get('/users/:id', authController.getUserById);

// PATCH /api/auth/users/:id/qr - Update payment QR code
router.patch('/users/:id/qr', authController.updatePaymentQrCode);

module.exports = router;
