/**
 * Security Dashboard Screen
 *
 * Displays security metrics, alerts, and performance monitoring
 * Only accessible to admin/superadmin roles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import {
  getSecurityOverview,
  getPerformanceMetrics,
  getFailedLogins,
  getSuspiciousActivities,
  formatUptime,
  formatRelativeTime,
  type SecurityOverview,
  type PerformanceMetrics,
  type FailedLogin,
  type SuspiciousActivity,
  type Alert,
} from '../../../src/api/securityApi';
import { router } from 'expo-router';

type TabType = 'overview' | 'alerts' | 'performance' | 'failed-logins';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [failedLogins, setFailedLogins] = useState<FailedLogin[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);

  // Check if user has access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      RNAlert.alert('Access Denied', 'You do not have permission to view this page.');
      router.back();
    }
  }, [user]);

  // Load data
  const loadData = async (showLoading = true) => {
    if (!user?.token) return;

    try {
      if (showLoading) setLoading(true);

      const [overviewData, performanceData, failedLoginsData, suspiciousData] = await Promise.all([
        getSecurityOverview(user.token),
        getPerformanceMetrics(user.token),
        getFailedLogins(user.token, 24),
        getSuspiciousActivities(user.token, 24),
      ]);

      setOverview(overviewData);
      setPerformance(performanceData);
      setFailedLogins(failedLoginsData.failedLogins);
      setSuspiciousActivities(suspiciousData.activities);
    } catch (error) {
      console.error('Error loading security dashboard:', error);
      RNAlert.alert('Error', 'Failed to load security dashboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // Render health status badge
  const renderHealthBadge = (status: string) => {
    const colors = {
      healthy: '#10b981',
      degraded: '#f59e0b',
      unhealthy: '#ef4444',
    };

    return (
      <View style={[styles.healthBadge, { backgroundColor: colors[status as keyof typeof colors] || '#6b7280' }]}>
        <Text style={styles.healthBadgeText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  // Render alert level badge
  const renderAlertBadge = (level: string) => {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      critical: '#dc2626',
    };

    return (
      <View style={[styles.alertBadge, { backgroundColor: colors[level as keyof typeof colors] || '#6b7280' }]}>
        <Text style={styles.alertBadgeText}>{level.toUpperCase()}</Text>
      </View>
    );
  };

  // Render Overview Tab
  const renderOverview = () => {
    if (!overview) return null;

    const { health, alerts, audit } = overview.overview;

    return (
      <View style={styles.tabContent}>
        {/* Health Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Health</Text>
          {renderHealthBadge(health.status)}
          <Text style={styles.cardSubtitle}>Uptime: {formatUptime(health.uptime)}</Text>
          {health.issues.length > 0 && (
            <View style={styles.issuesList}>
              {health.issues.map((issue) => (
                <Text key={issue} style={styles.issueText}>• {issue}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Alert Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security Alerts (24h)</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{alerts.failed_logins}</Text>
              <Text style={styles.statLabel}>Failed Logins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{alerts.unauthorized_attempts}</Text>
              <Text style={styles.statLabel}>Unauthorized</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{alerts.total_failures}</Text>
              <Text style={styles.statLabel}>Total Failures</Text>
            </View>
          </View>
        </View>

        {/* Audit Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{audit.totalActions}</Text>
              <Text style={styles.statLabel}>Total Actions</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{audit.successCount}</Text>
              <Text style={styles.statLabel}>Successful</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{audit.failureCount}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Alerts</Text>
          {overview.recentAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No recent alerts</Text>
          ) : (
            overview.recentAlerts.slice(0, 5).map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertHeader}>
                  {renderAlertBadge(alert.level)}
                  <Text style={styles.alertTime}>{formatRelativeTime(alert.timestamp)}</Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.ip_address && (
                  <Text style={styles.alertIp}>IP: {alert.ip_address}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  // Render Alerts Tab
  const renderAlerts = () => {
    if (!overview) return null;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>All Security Alerts (Last 50)</Text>
        {overview.recentAlerts.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No alerts found</Text>
          </View>
        ) : (
          overview.recentAlerts.map((alert) => (
            <View key={alert.id} style={styles.card}>
              <View style={styles.alertHeader}>
                {renderAlertBadge(alert.level)}
                <Text style={styles.alertTime}>{formatRelativeTime(alert.timestamp)}</Text>
              </View>
              <Text style={styles.alertType}>{alert.type}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              {alert.ip_address && (
                <Text style={styles.alertIp}>IP Address: {alert.ip_address}</Text>
              )}
              {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                <Text style={styles.alertMetadata}>
                  {JSON.stringify(alert.metadata, null, 2)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  // Render Performance Tab
  const renderPerformance = () => {
    if (!performance) return null;

    return (
      <View style={styles.tabContent}>
        {/* Request Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>API Requests</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{performance.requests.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{performance.requests.success}</Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{performance.requests.error}</Text>
              <Text style={styles.statLabel}>Errors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{performance.requests.errorRate}</Text>
              <Text style={styles.statLabel}>Error Rate</Text>
            </View>
          </View>
        </View>

        {/* Memory Usage */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Memory Usage</Text>
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{performance.memory.heapUsed} MB</Text>
              <Text style={styles.statLabel}>Heap Used</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{performance.memory.heapTotal} MB</Text>
              <Text style={styles.statLabel}>Heap Total</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{performance.memory.rss} MB</Text>
              <Text style={styles.statLabel}>RSS</Text>
            </View>
          </View>
        </View>

        {/* Database Performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Database Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{performance.database.totalQueries}</Text>
              <Text style={styles.statLabel}>Total Queries</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{performance.database.averageQueryTime}ms</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{performance.database.slowQueries.length}</Text>
              <Text style={styles.statLabel}>Slow Queries</Text>
            </View>
          </View>
        </View>

        {/* Slowest Endpoints */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Slowest Endpoints</Text>
          {performance.responseTimes.slowestEndpoints.slice(0, 5).map((endpoint) => (
            <View key={endpoint.endpoint} style={styles.endpointItem}>
              <Text style={styles.endpointPath}>{endpoint.endpoint}</Text>
              <Text style={styles.endpointTime}>Avg: {endpoint.avgResponseTime}ms</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render Failed Logins Tab
  const renderFailedLogins = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Failed Login Attempts (24h)</Text>
        {failedLogins.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No failed login attempts</Text>
          </View>
        ) : (
          failedLogins.map((login) => (
            <View key={`${login.phone}-${login.timestamp}`} style={styles.card}>
              <Text style={styles.loginPhone}>Phone: {login.phone}</Text>
              <Text style={styles.loginDetail}>IP: {login.ip_address}</Text>
              <Text style={styles.loginDetail}>Time: {formatRelativeTime(login.timestamp)}</Text>
              <Text style={styles.loginDetail}>Reason: {login.description}</Text>
            </View>
          ))
        )}

        {/* Suspicious Activities */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Suspicious Activities (24h)</Text>
        {suspiciousActivities.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No suspicious activities detected</Text>
          </View>
        ) : (
          suspiciousActivities.slice(0, 10).map((activity) => (
            <View key={`${activity.ip_address}-${activity.timestamp}`} style={styles.card}>
              <Text style={styles.activityType}>{activity.action_type}</Text>
              <Text style={styles.activityDesc}>{activity.description}</Text>
              <Text style={styles.loginDetail}>User ID: {activity.user_id || 'N/A'}</Text>
              <Text style={styles.loginDetail}>Role: {activity.user_role}</Text>
              <Text style={styles.loginDetail}>IP: {activity.ip_address}</Text>
              <Text style={styles.loginDetail}>Time: {formatRelativeTime(activity.timestamp)}</Text>
            </View>
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading security dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security Dashboard</Text>
        <Text style={styles.headerSubtitle}>Monitor system health and security</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['overview', 'alerts', 'performance', 'failed-logins'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'failed-logins' && renderFailedLogins()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6347',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  healthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 8,
  },
  healthBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  issuesList: {
    marginTop: 10,
  },
  issueText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  statItem: {
    width: '50%',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  alertItem: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
    marginTop: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  alertIp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  alertMetadata: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  endpointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  endpointPath: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  endpointTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  loginPhone: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  loginDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});
