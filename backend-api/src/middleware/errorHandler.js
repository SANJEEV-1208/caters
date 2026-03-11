/**
 * Centralized Error Handling Middleware
 * Handles all errors thrown by asyncHandler or other middleware
 * Provides consistent error responses across the application
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * Must be registered last in middleware chain
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 if no status code
  if (!statusCode) {
    statusCode = 500;
  }

  // Default message for 500 errors
  if (statusCode === 500 && !message) {
    message = 'Internal server error';
  }

  // Log error details
  console.error(`[Error] ${req.method} ${req.path}:`, {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
};
