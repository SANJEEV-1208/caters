/**
 * Application Performance Monitoring (APM) Service
 *
 * Tracks:
 * - API endpoint response times
 * - Database query performance
 * - Memory usage
 * - Error rates
 * - Request counts
 */

const pool = require('../config/database');

// In-memory performance metrics (resets on server restart)
const performanceMetrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    byEndpoint: {},
  },
  responseTimes: {
    byEndpoint: {},
  },
  database: {
    queryCount: 0,
    slowQueries: [],
    averageQueryTime: 0,
  },
  memory: {
    snapshots: [],
    maxSnapshots: 100, // Keep last 100 snapshots
  },
};

/**
 * Record API request metrics
 */
function recordRequest(endpoint, method, statusCode, responseTime) {
  const key = `${method} ${endpoint}`;

  // Update total counters
  performanceMetrics.requests.total++;
  if (statusCode >= 200 && statusCode < 400) {
    performanceMetrics.requests.success++;
  } else {
    performanceMetrics.requests.error++;
  }

  // Update endpoint-specific counters
  if (!performanceMetrics.requests.byEndpoint[key]) {
    performanceMetrics.requests.byEndpoint[key] = {
      count: 0,
      success: 0,
      error: 0,
      totalResponseTime: 0,
    };
  }

  performanceMetrics.requests.byEndpoint[key].count++;
  performanceMetrics.requests.byEndpoint[key].totalResponseTime += responseTime;

  if (statusCode >= 200 && statusCode < 400) {
    performanceMetrics.requests.byEndpoint[key].success++;
  } else {
    performanceMetrics.requests.byEndpoint[key].error++;
  }

  // Update response time tracking
  if (!performanceMetrics.responseTimes.byEndpoint[key]) {
    performanceMetrics.responseTimes.byEndpoint[key] = {
      min: responseTime,
      max: responseTime,
      avg: responseTime,
      samples: [],
    };
  }

  const rtMetrics = performanceMetrics.responseTimes.byEndpoint[key];
  rtMetrics.min = Math.min(rtMetrics.min, responseTime);
  rtMetrics.max = Math.max(rtMetrics.max, responseTime);
  rtMetrics.samples.push(responseTime);

  // Keep only last 100 samples
  if (rtMetrics.samples.length > 100) {
    rtMetrics.samples.shift();
  }

  // Recalculate average
  rtMetrics.avg = rtMetrics.samples.reduce((a, b) => a + b, 0) / rtMetrics.samples.length;

  // Log slow requests (>1 second)
  if (responseTime > 1000) {
    const sanitizedKey = key.replace(/[\r\n\t]/g, '').substring(0, 100);
    console.warn(`⚠️ Slow request: ${sanitizedKey} took ${responseTime}ms`);
  }
}

/**
 * Record database query performance
 */
function recordDatabaseQuery(query, executionTime) {
  performanceMetrics.database.queryCount++;

  // Track slow queries (>500ms)
  if (executionTime > 500) {
    performanceMetrics.database.slowQueries.push({
      query: query.substring(0, 200), // First 200 chars
      executionTime,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 slow queries
    if (performanceMetrics.database.slowQueries.length > 50) {
      performanceMetrics.database.slowQueries.shift();
    }

    console.warn(`⚠️ Slow query: ${executionTime}ms - ${query.substring(0, 100)}...`);
  }

  // Update average query time
  const currentAvg = performanceMetrics.database.averageQueryTime;
  const count = performanceMetrics.database.queryCount;
  performanceMetrics.database.averageQueryTime =
    (currentAvg * (count - 1) + executionTime) / count;
}

/**
 * Record memory snapshot
 */
function recordMemorySnapshot() {
  const memUsage = process.memoryUsage();
  const snapshot = {
    timestamp: new Date().toISOString(),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024), // MB
  };

  performanceMetrics.memory.snapshots.push(snapshot);

  // Keep only last N snapshots
  if (performanceMetrics.memory.snapshots.length > performanceMetrics.memory.maxSnapshots) {
    performanceMetrics.memory.snapshots.shift();
  }

  return snapshot;
}

/**
 * Get current performance metrics
 */
function getMetrics() {
  // Calculate error rate
  const errorRate = performanceMetrics.requests.total > 0
    ? (performanceMetrics.requests.error / performanceMetrics.requests.total) * 100
    : 0;

  // Get top 10 slowest endpoints
  const endpointResponseTimes = Object.entries(performanceMetrics.responseTimes.byEndpoint)
    .map(([endpoint, metrics]) => ({
      endpoint,
      avgResponseTime: Math.round(metrics.avg),
      minResponseTime: Math.round(metrics.min),
      maxResponseTime: Math.round(metrics.max),
      samples: metrics.samples.length,
    }))
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 10);

  // Get top 10 most used endpoints
  const topEndpoints = Object.entries(performanceMetrics.requests.byEndpoint)
    .map(([endpoint, metrics]) => ({
      endpoint,
      count: metrics.count,
      success: metrics.success,
      error: metrics.error,
      avgResponseTime: Math.round(metrics.totalResponseTime / metrics.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get latest memory snapshot
  const latestMemory = performanceMetrics.memory.snapshots[performanceMetrics.memory.snapshots.length - 1];

  return {
    requests: {
      total: performanceMetrics.requests.total,
      success: performanceMetrics.requests.success,
      error: performanceMetrics.requests.error,
      errorRate: errorRate.toFixed(2) + '%',
    },
    responseTimes: {
      slowestEndpoints: endpointResponseTimes,
    },
    topEndpoints,
    database: {
      totalQueries: performanceMetrics.database.queryCount,
      averageQueryTime: Math.round(performanceMetrics.database.averageQueryTime),
      slowQueries: performanceMetrics.database.slowQueries.slice(-10), // Last 10
    },
    memory: latestMemory || recordMemorySnapshot(),
    uptime: Math.round(process.uptime()),
  };
}

/**
 * Get health status
 */
function getHealthStatus() {
  const metrics = getMetrics();

  // Determine health based on metrics
  const errorRate = Number.parseFloat(metrics.requests.errorRate);
  const memoryUsage = metrics.memory.heapUsed / metrics.memory.heapTotal;

  let status = 'healthy';
  const issues = [];

  if (errorRate > 10) {
    status = 'unhealthy';
    issues.push(`High error rate: ${metrics.requests.errorRate}`);
  } else if (errorRate > 5) {
    status = 'degraded';
    issues.push(`Elevated error rate: ${metrics.requests.errorRate}`);
  }

  if (memoryUsage > 0.9) {
    status = 'unhealthy';
    issues.push(`High memory usage: ${(memoryUsage * 100).toFixed(1)}%`);
  } else if (memoryUsage > 0.75) {
    status = status === 'healthy' ? 'degraded' : status;
    issues.push(`Elevated memory usage: ${(memoryUsage * 100).toFixed(1)}%`);
  }

  if (performanceMetrics.database.slowQueries.length > 10) {
    status = status === 'healthy' ? 'degraded' : status;
    issues.push(`${performanceMetrics.database.slowQueries.length} slow database queries detected`);
  }

  return {
    status,
    issues,
    uptime: metrics.uptime,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Middleware for tracking request performance
 */
function performanceMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      const responseTime = Date.now() - startTime;
      const endpoint = req.route?.path || req.path;
      const method = req.method;

      recordRequest(endpoint, method, res.statusCode, responseTime);

      return originalJson(body);
    };

    next();
  };
}

/**
 * Start periodic memory monitoring
 */
function startMemoryMonitoring(intervalMinutes = 5) {
  setInterval(() => {
    recordMemorySnapshot();
  }, intervalMinutes * 60 * 1000);

  console.log(`✅ APM memory monitoring started (${intervalMinutes} min intervals)`);
}

/**
 * Reset metrics (useful for testing)
 */
function resetMetrics() {
  performanceMetrics.requests = {
    total: 0,
    success: 0,
    error: 0,
    byEndpoint: {},
  };
  performanceMetrics.responseTimes = {
    byEndpoint: {},
  };
  performanceMetrics.database = {
    queryCount: 0,
    slowQueries: [],
    averageQueryTime: 0,
  };
  performanceMetrics.memory.snapshots = [];
}

module.exports = {
  recordRequest,
  recordDatabaseQuery,
  recordMemorySnapshot,
  getMetrics,
  getHealthStatus,
  performanceMiddleware,
  startMemoryMonitoring,
  resetMetrics,
};
