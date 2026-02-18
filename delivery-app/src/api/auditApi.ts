/**
 * Audit Log API
 * Frontend API calls for retrieving audit logs and statistics
 */

import { API_CONFIG } from '../config/api';
import type { AuditLog, AuditLogFilters, AuditLogStats } from '../types/audit';

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
  filters: AuditLogFilters,
  token: string
): Promise<AuditLog[]> {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId.toString());
  if (filters.userRole) params.append('userRole', filters.userRole);
  if (filters.actionType) params.append('actionType', filters.actionType);
  if (filters.actionCategory) params.append('actionCategory', filters.actionCategory);
  if (filters.entityType) params.append('entityType', filters.entityType);
  if (filters.success !== undefined) params.append('success', filters.success.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`${BASE_URL}/audit/logs?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch audit logs');
  }

  return response.json();
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(
  filters: {
    userId?: number;
    startDate?: string;
    endDate?: string;
  },
  token: string
): Promise<AuditLogStats> {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await fetch(`${BASE_URL}/audit/stats?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch audit statistics');
  }

  return response.json();
}

/**
 * Get user activity timeline
 */
export async function getUserActivity(
  userId: number,
  token: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  userId: number;
  totalLogs: number;
  logs: AuditLog[];
}> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const response = await fetch(
    `${BASE_URL}/audit/users/${userId}/activity?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user activity');
  }

  return response.json();
}

/**
 * Format timestamp to readable format
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) {
    return 'All time';
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `From ${formatDate(startDate)}`;
  }

  if (endDate) {
    return `Until ${formatDate(endDate)}`;
  }

  return 'All time';
}
