/**
 * Response Helper Utilities
 * Provides consistent response formatting across all API endpoints
 * Eliminates 50+ inconsistent response patterns
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
  res.status(201).json({
    message,
    ...data,
  });
};

/**
 * Send updated response
 * @param {Object} res - Express response object
 * @param {*} data - Updated resource data
 * @param {string} message - Success message
 */
const sendUpdated = (res, data, message = 'Resource updated successfully') => {
  res.status(200).json({
    message,
    ...data,
  });
};

/**
 * Send deleted response
 * @param {Object} res - Express response object
 * @param {*} data - Deleted resource data (optional)
 * @param {string} message - Success message
 */
const sendDeleted = (res, data = null, message = 'Resource deleted successfully') => {
  const response = { message };
  if (data) {
    Object.assign(response, data);
  }
  res.status(200).json(response);
};

/**
 * Send not found response (404)
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
const sendNotFound = (res, resource = 'Resource') => {
  res.status(404).json({
    error: `${resource} not found`,
  });
};

/**
 * Send bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendBadRequest = (res, message) => {
  res.status(400).json({
    error: message,
  });
};

/**
 * Send unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  res.status(401).json({
    error: message,
  });
};

/**
 * Send forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbidden = (res, message = 'Forbidden') => {
  res.status(403).json({
    error: message,
  });
};

/**
 * Check if resource exists, send 404 if not
 * @param {Object} res - Express response object
 * @param {Object} result - Database query result
 * @param {string} resource - Resource name
 * @returns {boolean} True if exists, false otherwise
 */
const checkResourceExists = (res, result, resource = 'Resource') => {
  if (!result || !result.rows || result.rows.length === 0) {
    sendNotFound(res, resource);
    return false;
  }
  return true;
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendUpdated,
  sendDeleted,
  sendNotFound,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  checkResourceExists,
};
