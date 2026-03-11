/**
 * Async Handler Middleware
 * Wraps async route handlers to eliminate try-catch duplication
 * Automatically catches errors and passes them to error handling middleware
 *
 * Eliminates 40+ identical try-catch blocks across services
 */

/**
 * Wraps an async function to automatically catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 *
 * @example
 * // Before (in service):
 * exports.createOrder = async (req, res) => {
 *   try {
 *     // logic
 *     res.json(data);
 *   } catch (error) {
 *     console.error('Error:', error);
 *     res.status(500).json({ error: 'Internal server error' });
 *   }
 * };
 *
 * // After (in route):
 * router.post('/', asyncHandler(orderService.createOrder));
 *
 * // In service (simplified):
 * exports.createOrder = async (req, res) => {
 *   // logic (no try-catch needed)
 *   res.json(data);
 * };
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
