/**
 * Sentry Configuration for Error Tracking and Performance Monitoring
 *
 * Sentry provides:
 * - Real-time error tracking
 * - Performance monitoring (APM)
 * - Release tracking
 * - User context in errors
 */

const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry
 * Call this BEFORE any other code in server.js
 */
function initSentry(app) {
  // Only initialize if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry not initialized - SENTRY_DSN not set');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Environment tracking
    environment: process.env.NODE_ENV || 'development',

    // Enable performance monitoring (APM)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Enable profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.RENDER_GIT_COMMIT || 'development',

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request && event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from context
      if (event.contexts && event.contexts.user) {
        delete event.contexts.user.ip_address;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Network request failed',
    ],
  });

  // Add Express error handlers
  if (app) {
    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  console.log('✅ Sentry initialized - Environment:', process.env.NODE_ENV);
}

/**
 * Add Sentry error handler middleware
 * Call this AFTER all routes but BEFORE any other error handler
 */
function sentryErrorHandler() {
  // Return no-op middleware if Sentry not initialized
  if (!process.env.SENTRY_DSN) {
    return (err, req, res, next) => next(err);
  }

  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status code >= 500
      if (error.status >= 500) {
        return true;
      }
      return false;
    },
  });
}

/**
 * Capture exception manually
 */
function captureException(error, context = {}) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureException(error, {
    tags: context.tags || {},
    extra: context.extra || {},
    user: context.user || {},
  });
}

/**
 * Capture message (for warnings, info)
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureMessage(message, {
    level, // 'info', 'warning', 'error'
    tags: context.tags || {},
    extra: context.extra || {},
  });
}

/**
 * Set user context for better error tracking
 */
function setUser(user) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id,
    username: user.name,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
function clearUser() {
  if (!process.env.SENTRY_DSN) return;

  Sentry.setUser(null);
}

/**
 * Add breadcrumb (for debugging)
 */
function addBreadcrumb(message, data = {}) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data,
  });
}

module.exports = {
  initSentry,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  Sentry,
};
