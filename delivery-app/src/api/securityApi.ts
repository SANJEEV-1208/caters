/**
 * Security Dashboard API
 *
 * API client for security monitoring and alerts
 */

import { BASE_URL } from '../config/api';

export interface SecurityOverview {
  overview: {
    health: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      issues: string[];
      uptime: number;
      timestamp: string;
    };
    alerts: {
      time_period_hours: number;
      failed_logins: number;
      unauthorized_attempts: number;
      total_failures: number;
    };
    audit: {
      totalActions: number;
      byCategory: Record<string, number>;
      byUser: any[];
      failureCount: number;
      successCount: number;
    };
  };
  recentAlerts: Alert[];
  timestamp: string;
}

export interface Alert {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  metadata: any;
  ip_address: string | null;
}

export interface PerformanceMetrics {
  requests: {
    total: number;
    success: number;
    error: number;
    errorRate: string;
  };
  responseTimes: {
    slowestEndpoints: Array<{
      endpoint: string;
      avgResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
      samples: number;
    }>;
  };
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    success: number;
    error: number;
    avgResponseTime: number;
  }>;
  database: {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: Array<{
      query: string;
      executionTime: number;
      timestamp: string;
    }>;
  };
  memory: {
    timestamp: string;
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  uptime: number;
}

export interface FailedLogin {
  phone: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  description: string;
}

export interface SuspiciousActivity {
  action_type: string;
  description: string;
  user_id: number | null;
  user_role: string;
  ip_address: string;
  timestamp: string;
  metadata: any;
}

/**
 * Get security overview dashboard
 */
export async function getSecurityOverview(token: string): Promise<SecurityOverview> {
  const response = await fetch(`${BASE_URL}/security/overview`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch security overview: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get recent alerts
 */
export async function getAlerts(token: string, limit: number = 50): Promise<{ alerts: Alert[]; count: number }> {
  const response = await fetch(`${BASE_URL}/security/alerts?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(token: string): Promise<PerformanceMetrics> {
  const response = await fetch(`${BASE_URL}/security/performance`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch performance metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get failed login attempts
 */
export async function getFailedLogins(token: string, hours: number = 24): Promise<{ failedLogins: FailedLogin[]; count: number; timePeriodHours: number }> {
  const response = await fetch(`${BASE_URL}/security/failed-logins?hours=${hours}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch failed logins: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get suspicious activities
 */
export async function getSuspiciousActivities(token: string, hours: number = 24): Promise<{ activities: SuspiciousActivity[]; count: number; timePeriodHours: number }> {
  const response = await fetch(`${BASE_URL}/security/suspicious?hours=${hours}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch suspicious activities: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get health status
 */
export async function getHealthStatus(token: string): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  uptime: number;
  timestamp: string;
}> {
  const response = await fetch(`${BASE_URL}/security/health`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch health status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Format uptime to readable string
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}
