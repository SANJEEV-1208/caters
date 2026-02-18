/**
 * Audit Log Type Definitions for Frontend
 * Matches backend audit logging system
 */

export type ActionType =
  // Authentication
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_LOGOUT_ALL'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_TOKEN_REFRESH_FAILURE'
  | 'AUTH_SIGNUP_CATERER'
  | 'AUTH_SIGNUP_RESTAURANT'
  | 'AUTH_GUEST_REGISTER'
  | 'AUTH_CUSTOMER_CREATED'
  | 'AUTH_PIN_SET'
  | 'AUTH_PIN_CHANGED'

  // User Profile
  | 'PROFILE_UPDATED'
  | 'PROFILE_PICTURE_UPDATED'
  | 'PAYMENT_QR_UPDATED'
  | 'PAYMENT_QR_REMOVED'

  // Orders
  | 'ORDER_CREATED'
  | 'ORDER_CREATED_GUEST'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'ORDER_VIEWED'

  // Menu Management
  | 'MENU_CREATED'
  | 'MENU_UPDATED'
  | 'MENU_DELETED'
  | 'MENU_STOCK_TOGGLED'
  | 'MENU_VIEWED'

  // Subscriptions
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_DELETED'

  // Apartments
  | 'APARTMENT_CREATED'
  | 'APARTMENT_DELETED'
  | 'CUSTOMER_LINKED_TO_APARTMENT'
  | 'CUSTOMER_LINKED_MANUAL'

  // Cuisines
  | 'CUISINE_CREATED'
  | 'CUISINE_DELETED'

  // Restaurant Tables
  | 'TABLE_CREATED'
  | 'TABLE_BULK_CREATED'
  | 'TABLE_UPDATED'
  | 'TABLE_DELETED'
  | 'TABLE_QR_REGENERATED'
  | 'TABLE_QR_SCANNED'

  // Push Tokens
  | 'PUSH_TOKEN_REGISTERED'
  | 'PUSH_TOKEN_UNREGISTERED';

export type ActionCategory =
  | 'AUTHENTICATION'
  | 'PROFILE_MANAGEMENT'
  | 'ORDER_MANAGEMENT'
  | 'MENU_MANAGEMENT'
  | 'SUBSCRIPTION_MANAGEMENT'
  | 'LOCATION_MANAGEMENT'
  | 'CUISINE_MANAGEMENT'
  | 'TABLE_MANAGEMENT'
  | 'PAYMENT_MANAGEMENT'
  | 'NOTIFICATION_MANAGEMENT';

export type EntityType =
  | 'user'
  | 'order'
  | 'menu_item'
  | 'subscription'
  | 'apartment'
  | 'cuisine'
  | 'table'
  | 'push_token'
  | 'refresh_token';

export interface AuditLog {
  id: number;

  // User information
  user_id: number | null;
  user_role: string | null;
  user_phone: string | null;
  user_name: string | null;

  // Action details
  action_type: ActionType;
  action_category: ActionCategory;
  description: string;

  // Entity details
  entity_type: EntityType | null;
  entity_id: number | null;
  entity_name: string | null;

  // Change tracking
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;

  // Request metadata
  ip_address: string | null;
  user_agent: string | null;
  request_method: string | null;
  request_path: string | null;

  // Status
  success: boolean;
  error_message: string | null;
  error_code: string | null;

  // Timestamps
  timestamp: string;
  duration_ms: number | null;

  // Additional metadata
  metadata: Record<string, any> | null;

  created_at: string;
}

export interface AuditLogFilters {
  userId?: number;
  userRole?: 'customer' | 'caterer';
  actionType?: ActionType;
  actionCategory?: ActionCategory;
  entityType?: EntityType;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  total_logs: string;
  successful_actions: string;
  failed_actions: string;
  unique_users: string;
  unique_categories: string;
  actionsByCategory: {
    action_category: string;
    count: string;
  }[];
  recentActions: AuditLog[];
}

// Display-friendly action type labels
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  // Authentication
  AUTH_LOGIN_SUCCESS: 'Successful Login',
  AUTH_LOGIN_FAILURE: 'Failed Login',
  AUTH_LOGOUT: 'Logout',
  AUTH_LOGOUT_ALL: 'Logout All Devices',
  AUTH_TOKEN_REFRESH: 'Token Refresh',
  AUTH_TOKEN_REFRESH_FAILURE: 'Token Refresh Failed',
  AUTH_SIGNUP_CATERER: 'Caterer Signup',
  AUTH_SIGNUP_RESTAURANT: 'Restaurant Signup',
  AUTH_GUEST_REGISTER: 'Guest Registration',
  AUTH_CUSTOMER_CREATED: 'Customer Created',
  AUTH_PIN_SET: 'PIN Set',
  AUTH_PIN_CHANGED: 'PIN Changed',

  // Profile
  PROFILE_UPDATED: 'Profile Updated',
  PROFILE_PICTURE_UPDATED: 'Profile Picture Updated',
  PAYMENT_QR_UPDATED: 'Payment QR Updated',
  PAYMENT_QR_REMOVED: 'Payment QR Removed',

  // Orders
  ORDER_CREATED: 'Order Created',
  ORDER_CREATED_GUEST: 'Guest Order Created',
  ORDER_STATUS_CHANGED: 'Order Status Changed',
  ORDER_DELETED: 'Order Deleted',
  ORDER_VIEWED: 'Order Viewed',

  // Menu
  MENU_CREATED: 'Menu Item Created',
  MENU_UPDATED: 'Menu Item Updated',
  MENU_DELETED: 'Menu Item Deleted',
  MENU_STOCK_TOGGLED: 'Stock Status Changed',
  MENU_VIEWED: 'Menu Viewed',

  // Subscriptions
  SUBSCRIPTION_CREATED: 'Subscription Created',
  SUBSCRIPTION_DELETED: 'Subscription Removed',

  // Apartments
  APARTMENT_CREATED: 'Location Created',
  APARTMENT_DELETED: 'Location Deleted',
  CUSTOMER_LINKED_TO_APARTMENT: 'Customer Linked via Code',
  CUSTOMER_LINKED_MANUAL: 'Customer Linked Manually',

  // Cuisines
  CUISINE_CREATED: 'Cuisine Created',
  CUISINE_DELETED: 'Cuisine Deleted',

  // Tables
  TABLE_CREATED: 'Table Created',
  TABLE_BULK_CREATED: 'Tables Created (Bulk)',
  TABLE_UPDATED: 'Table Updated',
  TABLE_DELETED: 'Table Deleted',
  TABLE_QR_REGENERATED: 'QR Code Regenerated',
  TABLE_QR_SCANNED: 'QR Code Scanned',

  // Push Tokens
  PUSH_TOKEN_REGISTERED: 'Push Notifications Enabled',
  PUSH_TOKEN_UNREGISTERED: 'Push Notifications Disabled',
};

// Display-friendly category labels
export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  AUTHENTICATION: 'Authentication',
  PROFILE_MANAGEMENT: 'Profile',
  ORDER_MANAGEMENT: 'Orders',
  MENU_MANAGEMENT: 'Menu',
  SUBSCRIPTION_MANAGEMENT: 'Subscriptions',
  LOCATION_MANAGEMENT: 'Locations',
  CUISINE_MANAGEMENT: 'Cuisines',
  TABLE_MANAGEMENT: 'Tables',
  PAYMENT_MANAGEMENT: 'Payments',
  NOTIFICATION_MANAGEMENT: 'Notifications',
};

// Category colors for UI
export const CATEGORY_COLORS: Record<ActionCategory, string> = {
  AUTHENTICATION: '#3B82F6',      // Blue
  PROFILE_MANAGEMENT: '#8B5CF6',  // Purple
  ORDER_MANAGEMENT: '#10B981',    // Green
  MENU_MANAGEMENT: '#F59E0B',     // Amber
  SUBSCRIPTION_MANAGEMENT: '#EC4899', // Pink
  LOCATION_MANAGEMENT: '#6366F1',  // Indigo
  CUISINE_MANAGEMENT: '#F97316',   // Orange
  TABLE_MANAGEMENT: '#14B8A6',     // Teal
  PAYMENT_MANAGEMENT: '#10B981',   // Green
  NOTIFICATION_MANAGEMENT: '#8B5CF6', // Purple
};

// Icon names for categories (using Ionicons)
export const CATEGORY_ICONS: Record<ActionCategory, string> = {
  AUTHENTICATION: 'log-in',
  PROFILE_MANAGEMENT: 'person',
  ORDER_MANAGEMENT: 'receipt',
  MENU_MANAGEMENT: 'restaurant',
  SUBSCRIPTION_MANAGEMENT: 'people',
  LOCATION_MANAGEMENT: 'location',
  CUISINE_MANAGEMENT: 'pizza',
  TABLE_MANAGEMENT: 'grid',
  PAYMENT_MANAGEMENT: 'card',
  NOTIFICATION_MANAGEMENT: 'notifications',
};
