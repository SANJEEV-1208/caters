const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Must be used after validation chains
 */
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation chains for authentication
 */
exports.validateLogin = [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?91?\d{10}$/).withMessage('Invalid phone number format'),
  body('pin')
    .optional()
    .trim()
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits')
    .isNumeric().withMessage('PIN must contain only numbers'),
];

exports.validateSignup = [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?91?\d{10}$/).withMessage('Invalid phone number format'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .escape(), // Sanitize HTML
  body('serviceName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Service name must be 2-200 characters')
    .escape(),
  body('restaurantName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Restaurant name must be 2-200 characters')
    .escape(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must be less than 500 characters')
    .escape(),
  body('restaurantAddress')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Restaurant address must be less than 500 characters')
    .escape(),
  body('pin')
    .trim()
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits')
    .isNumeric().withMessage('PIN must contain only numbers'),
];

// Validation for guest customer registration (NO PIN REQUIRED, NO ADDRESS)
// Used for QR code orders - guests can order without creating a PIN
exports.validateGuestRegistration = [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?91?\d{10}$/).withMessage('Invalid phone number format'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .escape(), // Sanitize HTML
  // NO ADDRESS REQUIRED - guests only need phone and name to order
  // NO PIN REQUIRED - guests can access app directly without authentication
];

exports.validateSetPin = [
  body('userId')
    .isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('pin')
    .trim()
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits')
    .isNumeric().withMessage('PIN must contain only numbers'),
];

/**
 * Validation chains for menu items
 */
exports.validateMenuItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Menu item name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
    .escape(),
  body('price')
    .isFloat({ min: 0, max: 100000 }).withMessage('Price must be between 0 and 100000'),
  body('category')
    .isIn(['veg', 'non-veg']).withMessage('Category must be veg or non-veg'),
  body('cuisine')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Cuisine must be less than 100 characters')
    .escape(),
  body('type')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'main_course']).withMessage('Invalid meal type'),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
  body('availableDates')
    .optional()
    .isArray().withMessage('Available dates must be an array'),
  body('inStock')
    .optional()
    .isBoolean().withMessage('inStock must be a boolean'),
  body('catererId')
    .isInt({ min: 1 }).withMessage('Valid caterer ID is required'),
];

/**
 * Validation chains for orders
 */
exports.validateOrder = [
  body('orderId')
    .trim()
    .notEmpty().withMessage('Order ID is required')
    .matches(/^ORD\d+$/).withMessage('Invalid order ID format'),
  body('customerId')
    .isInt({ min: 1 }).withMessage('Valid customer ID is required'),
  body('catererId')
    .isInt({ min: 1 }).withMessage('Valid caterer ID is required'),
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('totalAmount')
    .isFloat({ min: 0, max: 1000000 }).withMessage('Invalid total amount'),
  body('paymentMethod')
    .isIn(['upi', 'cod']).withMessage('Payment method must be upi or cod'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction ID too long')
    .escape(),
  body('deliveryAddress')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Delivery address must be less than 500 characters')
    .escape(),
  body('deliveryDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Delivery date must be in YYYY-MM-DD format'),
  body('itemCount')
    .isInt({ min: 1, max: 1000 }).withMessage('Item count must be between 1 and 1000'),
];

/**
 * Validation for transaction ID (stricter for UPI payments)
 */
exports.validateTransactionId = (req, res, next) => {
  const { paymentMethod, transactionId } = req.body;

  // Only validate if payment method is UPI
  if (paymentMethod === 'upi') {
    if (!transactionId || transactionId === 'N/A') {
      return res.status(400).json({
        error: 'Transaction ID is required for UPI payments'
      });
    }

    // Validate transaction ID format
    const validFormats = [
      /^pay_[A-Za-z0-9]{14}$/, // Razorpay: pay_xxxxxxxxxxxxx
      /^\d{12}$/,              // UPI: 12-digit number
      /^[0-9A-Za-z]{10,50}$/,  // Generic: 10-50 alphanumeric
    ];

    const isValid = validFormats.some(regex => regex.test(transactionId));

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid transaction ID format. Please provide a valid UPI transaction ID.'
      });
    }

    // Check for obviously fake IDs
    const fakePatterns = /^(123|test|demo|fake|dummy|sample|000)/i;
    if (fakePatterns.test(transactionId)) {
      return res.status(400).json({
        error: 'Invalid transaction ID. Please provide a genuine transaction ID.'
      });
    }
  }

  next();
};

/**
 * Validation chains for cuisines
 */
exports.validateCuisine = [
  body('catererId')
    .isInt({ min: 1 }).withMessage('Valid caterer ID is required'),
  body('name')
    .trim()
    .notEmpty().withMessage('Cuisine name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .escape(),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
];

/**
 * Validation chains for apartments
 */
exports.validateApartment = [
  body('catererId')
    .isInt({ min: 1 }).withMessage('Valid caterer ID is required'),
  body('name')
    .trim()
    .notEmpty().withMessage('Apartment name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters')
    .escape(),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 500 }).withMessage('Address must be less than 500 characters')
    .escape(),
  body('accessCode')
    .trim()
    .notEmpty().withMessage('Access code is required')
    .isLength({ min: 4, max: 50 }).withMessage('Access code must be 4-50 characters')
    .escape(),
];

/**
 * Validation for user ID parameters
 */
exports.validateUserId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid user ID'),
];

/**
 * Validation for menu item ID parameters
 */
exports.validateMenuId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid menu item ID'),
];

/**
 * Validation for order ID parameters
 */
exports.validateOrderId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid order ID'),
];

/**
 * Validation for query parameters
 */
exports.validateCatererId = [
  query('catererId')
    .isInt({ min: 1 }).withMessage('Valid caterer ID is required'),
];

exports.validateCustomerId = [
  query('customerId')
    .isInt({ min: 1 }).withMessage('Valid customer ID is required'),
];
