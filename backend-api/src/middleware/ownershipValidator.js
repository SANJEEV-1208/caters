/**
 * Ownership Validation Middleware
 * Validates that a user owns the resource they're trying to access
 * Eliminates 35-50 lines of duplicate ownership checks
 */

const { checkOwnership } = require('../utils/queryHelper');
const { sendNotFound, sendForbidden } = require('../utils/responseHelper');

/**
 * Creates middleware to validate resource ownership
 * @param {string} table - Table name
 * @param {string} idParam - Request parameter containing resource ID (default: 'id')
 * @param {string} ownerColumn - Column name for owner ID (default: 'caterer_id')
 * @param {string} userIdField - Field in req.user containing user ID (default: 'id')
 * @returns {Function} Express middleware
 *
 * @example
 * // Validate menu item ownership
 * router.put('/:id',
 *   authenticateToken,
 *   validateOwnership('caterer_menus', 'id', 'caterer_id'),
 *   menuController.updateMenuItem
 * );
 *
 * // Validate apartment ownership
 * router.delete('/:apartmentId',
 *   authenticateToken,
 *   validateOwnership('apartments', 'apartmentId', 'caterer_id'),
 *   apartmentController.deleteApartment
 * );
 */
const validateOwnership = (
  table,
  idParam = 'id',
  ownerColumn = 'caterer_id',
  userIdField = 'id'
) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const userId = req.user?.[userIdField];

      if (!userId) {
        return sendForbidden(res, 'User authentication required');
      }

      if (!resourceId) {
        return sendBadRequest(res, `${idParam} parameter is required`);
      }

      // Check ownership
      const resource = await checkOwnership(table, resourceId, userId, ownerColumn);

      if (!resource) {
        const resourceName = table.replace(/_/g, ' ').replace(/s$/, '');
        return sendNotFound(res, resourceName);
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates that a customer owns/is linked to an order
 * @param {string} idParam - Parameter containing order ID
 * @returns {Function} Express middleware
 */
const validateCustomerOrder = (idParam = 'id') => {
  return validateOwnership('orders', idParam, 'customer_id', 'id');
};

/**
 * Validates that a caterer owns a menu item
 * @param {string} idParam - Parameter containing menu item ID
 * @returns {Function} Express middleware
 */
const validateCatererMenuItem = (idParam = 'id') => {
  return validateOwnership('caterer_menus', idParam, 'caterer_id', 'id');
};

/**
 * Validates that a caterer owns an apartment
 * @param {string} idParam - Parameter containing apartment ID
 * @returns {Function} Express middleware
 */
const validateCatererApartment = (idParam = 'id') => {
  return validateOwnership('apartments', idParam, 'caterer_id', 'id');
};

/**
 * Validates that a caterer owns a table
 * @param {string} idParam - Parameter containing table ID
 * @returns {Function} Express middleware
 */
const validateCatererTable = (idParam = 'id') => {
  return validateOwnership('restaurant_tables', idParam, 'caterer_id', 'id');
};

module.exports = {
  validateOwnership,
  validateCustomerOrder,
  validateCatererMenuItem,
  validateCatererApartment,
  validateCatererTable,
};
