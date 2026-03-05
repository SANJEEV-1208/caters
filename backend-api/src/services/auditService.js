/**
 * Audit Logging Service
 * Comprehensive audit trail for all user activities and system events
 */

const pool = require('../config/database');

/**
 * Action Types - Specific actions that can be logged
 */
const ACTION_TYPES = {
  // Authentication
  AUTH_LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILURE: 'AUTH_LOGIN_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_LOGOUT_ALL: 'AUTH_LOGOUT_ALL',
  AUTH_TOKEN_REFRESH: 'AUTH_TOKEN_REFRESH',
  AUTH_TOKEN_REFRESH_FAILURE: 'AUTH_TOKEN_REFRESH_FAILURE',
  AUTH_SIGNUP_CATERER: 'AUTH_SIGNUP_CATERER',
  AUTH_SIGNUP_RESTAURANT: 'AUTH_SIGNUP_RESTAURANT',
  AUTH_GUEST_REGISTER: 'AUTH_GUEST_REGISTER',
  AUTH_CUSTOMER_CREATED: 'AUTH_CUSTOMER_CREATED',
  AUTH_PIN_SET: 'AUTH_PIN_SET',
  AUTH_PIN_CHANGED: 'AUTH_PIN_CHANGED',

  // User Profile
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  PROFILE_PICTURE_UPDATED: 'PROFILE_PICTURE_UPDATED',
  PAYMENT_QR_UPDATED: 'PAYMENT_QR_UPDATED',
  PAYMENT_QR_REMOVED: 'PAYMENT_QR_REMOVED',

  // Orders
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CREATED_GUEST: 'ORDER_CREATED_GUEST',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  ORDER_DELETED: 'ORDER_DELETED',
  ORDER_VIEWED: 'ORDER_VIEWED',

  // Menu Management
  MENU_CREATED: 'MENU_CREATED',
  MENU_UPDATED: 'MENU_UPDATED',
  MENU_DELETED: 'MENU_DELETED',
  MENU_STOCK_TOGGLED: 'MENU_STOCK_TOGGLED',
  MENU_VIEWED: 'MENU_VIEWED',

  // Subscriptions
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_DELETED: 'SUBSCRIPTION_DELETED',

  // Apartments
  APARTMENT_CREATED: 'APARTMENT_CREATED',
  APARTMENT_DELETED: 'APARTMENT_DELETED',
  CUSTOMER_LINKED_TO_APARTMENT: 'CUSTOMER_LINKED_TO_APARTMENT',
  CUSTOMER_LINKED_MANUAL: 'CUSTOMER_LINKED_MANUAL',

  // Cuisines
  CUISINE_CREATED: 'CUISINE_CREATED',
  CUISINE_DELETED: 'CUISINE_DELETED',

  // Restaurant Tables
  TABLE_CREATED: 'TABLE_CREATED',
  TABLE_BULK_CREATED: 'TABLE_BULK_CREATED',
  TABLE_UPDATED: 'TABLE_UPDATED',
  TABLE_DELETED: 'TABLE_DELETED',
  TABLE_QR_REGENERATED: 'TABLE_QR_REGENERATED',
  TABLE_QR_SCANNED: 'TABLE_QR_SCANNED',

  // Push Tokens
  PUSH_TOKEN_REGISTERED: 'PUSH_TOKEN_REGISTERED',
  PUSH_TOKEN_UNREGISTERED: 'PUSH_TOKEN_UNREGISTERED',
};

/**
 * Action Categories - High-level grouping of actions
 */
const ACTION_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  PROFILE_MANAGEMENT: 'PROFILE_MANAGEMENT',
  ORDER_MANAGEMENT: 'ORDER_MANAGEMENT',
  MENU_MANAGEMENT: 'MENU_MANAGEMENT',
  SUBSCRIPTION_MANAGEMENT: 'SUBSCRIPTION_MANAGEMENT',
  LOCATION_MANAGEMENT: 'LOCATION_MANAGEMENT',
  CUISINE_MANAGEMENT: 'CUISINE_MANAGEMENT',
  TABLE_MANAGEMENT: 'TABLE_MANAGEMENT',
  PAYMENT_MANAGEMENT: 'PAYMENT_MANAGEMENT',
  NOTIFICATION_MANAGEMENT: 'NOTIFICATION_MANAGEMENT',
};

/**
 * Entity Types - Types of entities that can be affected
 */
const ENTITY_TYPES = {
  USER: 'user',
  ORDER: 'order',
  MENU_ITEM: 'menu_item',
  SUBSCRIPTION: 'subscription',
  APARTMENT: 'apartment',
  CUISINE: 'cuisine',
  TABLE: 'table',
  PUSH_TOKEN: 'push_token',
  REFRESH_TOKEN: 'refresh_token',
};

/**
 * Create an audit log entry
 * @param {Object} auditData - Audit log data
 * @returns {Promise<Object>} Created audit log
 */
async function createAuditLog(auditData) {
  const {
    userId = null,
    userRole = null,
    userPhone = null,
    userName = null,
    actionType,
    actionCategory,
    description,
    entityType = null,
    entityId = null,
    entityName = null,
    oldValue = null,
    newValue = null,
    ipAddress = null,
    userAgent = null,
    requestMethod = null,
    requestPath = null,
    success = true,
    errorMessage = null,
    errorCode = null,
    durationMs = null,
    metadata = null,
  } = auditData;

  try {
    const result = await pool.query(
      `INSERT INTO audit_logs (
        user_id, user_role, user_phone, user_name,
        action_type, action_category, description,
        entity_type, entity_id, entity_name,
        old_value, new_value,
        ip_address, user_agent, request_method, request_path,
        success, error_message, error_code,
        duration_ms, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        userId, userRole, userPhone, userName,
        actionType, actionCategory, description,
        entityType, entityId, entityName,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress, userAgent, requestMethod, requestPath,
        success, errorMessage, errorCode,
        durationMs, metadata ? JSON.stringify(metadata) : null,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
}

/**
 * Log authentication event
 */
async function logAuthEvent(actionType, user, req, success = true, errorMessage = null) {
  return createAuditLog({
    userId: user?.id || null,
    userRole: user?.role || null,
    userPhone: user?.phone || null,
    userName: user?.name || null,
    actionType,
    actionCategory: ACTION_CATEGORIES.AUTHENTICATION,
    description: getAuthDescription(actionType, user, success),
    entityType: ENTITY_TYPES.USER,
    entityId: user?.id || null,
    ipAddress: req?.ip || req?.connection?.remoteAddress || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success,
    errorMessage,
    metadata: {
      role: user?.role,
      caterType: user?.cater_type,
    },
  });
}

/**
 * Log profile update event
 */
async function logProfileUpdate(user, oldProfile, newProfile, req) {
  return createAuditLog({
    userId: user.id,
    userRole: user.role,
    userPhone: user.phone,
    userName: user.name,
    actionType: ACTION_TYPES.PROFILE_UPDATED,
    actionCategory: ACTION_CATEGORIES.PROFILE_MANAGEMENT,
    description: `Profile updated for user ${user.name} (ID: ${user.id})`,
    entityType: ENTITY_TYPES.USER,
    entityId: user.id,
    oldValue: oldProfile,
    newValue: newProfile,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success: true,
  });
}

/**
 * Log order event
 */
async function logOrderEvent(actionType, order, user, req, oldStatus = null, newStatus = null) {
  const isGuest = !order.customer_id;

  return createAuditLog({
    userId: order.customer_id || null,
    userRole: user?.role || 'guest',
    userPhone: isGuest ? order.guest_phone : user?.phone,
    userName: isGuest ? order.guest_name : user?.name,
    actionType,
    actionCategory: ACTION_CATEGORIES.ORDER_MANAGEMENT,
    description: getOrderDescription(actionType, order, isGuest, oldStatus, newStatus),
    entityType: ENTITY_TYPES.ORDER,
    entityId: order.id,
    entityName: order.order_id,
    oldValue: oldStatus ? { status: oldStatus } : null,
    newValue: newStatus ? { status: newStatus } : null,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success: true,
    metadata: {
      orderId: order.order_id,
      catererId: order.caterer_id,
      totalAmount: order.total_amount,
      paymentMethod: order.payment_method,
      transactionId: order.transaction_id,
      isGuest,
      itemCount: order.item_count,
      tableNumber: order.table_number,
    },
  });
}

/**
 * Log menu event
 */
async function logMenuEvent(actionType, menuItem, user, req, oldItem = null) {
  return createAuditLog({
    userId: user.id,
    userRole: user.role,
    userPhone: user.phone,
    userName: user.name,
    actionType,
    actionCategory: ACTION_CATEGORIES.MENU_MANAGEMENT,
    description: getMenuDescription(actionType, menuItem),
    entityType: ENTITY_TYPES.MENU_ITEM,
    entityId: menuItem.id,
    entityName: menuItem.name,
    oldValue: oldItem,
    newValue: actionType === ACTION_TYPES.MENU_DELETED ? null : menuItem,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success: true,
    metadata: {
      catererId: menuItem.caterer_id,
      price: menuItem.price,
      category: menuItem.category,
      cuisine: menuItem.cuisine,
      inStock: menuItem.in_stock,
    },
  });
}

/**
 * Log subscription event
 */
async function logSubscriptionEvent(actionType, subscription, user, req) {
  return createAuditLog({
    userId: user.id,
    userRole: user.role,
    userPhone: user.phone,
    userName: user.name,
    actionType,
    actionCategory: ACTION_CATEGORIES.SUBSCRIPTION_MANAGEMENT,
    description: getSubscriptionDescription(actionType, subscription),
    entityType: ENTITY_TYPES.SUBSCRIPTION,
    entityId: subscription.id,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success: true,
    metadata: {
      customerId: subscription.customer_id,
      catererId: subscription.caterer_id,
    },
  });
}

/**
 * Log apartment event
 */
async function logApartmentEvent(actionType, apartment, user, req, metadata = {}) {
  return createAuditLog({
    userId: user.id,
    userRole: user.role,
    userPhone: user.phone,
    userName: user.name,
    actionType,
    actionCategory: ACTION_CATEGORIES.LOCATION_MANAGEMENT,
    description: getApartmentDescription(actionType, apartment, metadata),
    entityType: ENTITY_TYPES.APARTMENT,
    entityId: apartment.id || apartment.apartment_id,
    entityName: apartment.name,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success: true,
    metadata: {
      catererId: apartment.caterer_id,
      accessCode: apartment.access_code,
      ...metadata,
    },
  });
}

/**
 * Log table event
 */
async function logTableEvent(actionType, table, user, req, metadata = {}) {
  return createAuditLog({
    userId: user?.id || null,
    userRole: user?.role || null,
    userPhone: user?.phone || null,
    userName: user?.name || null,
    actionType,
    actionCategory: ACTION_CATEGORIES.TABLE_MANAGEMENT,
    description: getTableDescription(actionType, table, metadata),
    entityType: ENTITY_TYPES.TABLE,
    entityId: table.id,
    entityName: `Table ${table.table_number}`,
    ipAddress: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
    requestMethod: req?.method || null,
    requestPath: req?.path || null,
    success: true,
    metadata: {
      catererId: table.caterer_id,
      tableNumber: table.table_number,
      isActive: table.is_active,
      ...metadata,
    },
  });
}

/**
 * Get audit logs with filters
 */
async function getAuditLogs(filters = {}) {
  const {
    userId,
    userRole,
    actionType,
    actionCategory,
    entityType,
    success,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = filters;

  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (userId) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (userRole) {
    query += ` AND user_role = $${paramIndex}`;
    params.push(userRole);
    paramIndex++;
  }

  if (actionType) {
    query += ` AND action_type = $${paramIndex}`;
    params.push(actionType);
    paramIndex++;
  }

  if (actionCategory) {
    query += ` AND action_category = $${paramIndex}`;
    params.push(actionCategory);
    paramIndex++;
  }

  if (entityType) {
    query += ` AND entity_type = $${paramIndex}`;
    params.push(entityType);
    paramIndex++;
  }

  if (success !== undefined) {
    query += ` AND success = $${paramIndex}`;
    params.push(success);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get audit log statistics
 */
async function getAuditStats(filters = {}) {
  const { userId, startDate, endDate } = filters;

  let whereClause = '1=1';
  const params = [];
  let paramIndex = 1;

  if (userId) {
    whereClause += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  if (startDate) {
    whereClause += ` AND timestamp >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    whereClause += ` AND timestamp <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const statsQuery = `
    SELECT
      COUNT(*) as total_logs,
      COUNT(*) FILTER (WHERE success = true) as successful_actions,
      COUNT(*) FILTER (WHERE success = false) as failed_actions,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT action_category) as unique_categories
    FROM audit_logs
    WHERE ${whereClause}
  `;

  const categoryQuery = `
    SELECT
      action_category,
      COUNT(*) as count
    FROM audit_logs
    WHERE ${whereClause}
    GROUP BY action_category
    ORDER BY count DESC
  `;

  const recentQuery = `
    SELECT * FROM audit_logs
    WHERE ${whereClause}
    ORDER BY timestamp DESC
    LIMIT 10
  `;

  const [statsResult, categoryResult, recentResult] = await Promise.all([
    pool.query(statsQuery, params),
    pool.query(categoryQuery, params),
    pool.query(recentQuery, params),
  ]);

  return {
    ...statsResult.rows[0],
    actionsByCategory: categoryResult.rows,
    recentActions: recentResult.rows,
  };
}

// Helper functions for generating descriptions
function getAuthDescription(actionType, user, success) {
  switch (actionType) {
    case ACTION_TYPES.AUTH_LOGIN_SUCCESS:
      return `Successful login for ${user?.role} user: ${user?.name || user?.phone}`;
    case ACTION_TYPES.AUTH_LOGIN_FAILURE:
      return `Failed login attempt for phone: ${user?.phone}`;
    case ACTION_TYPES.AUTH_LOGOUT:
      return `User logged out: ${user?.name} (${user?.role})`;
    case ACTION_TYPES.AUTH_LOGOUT_ALL:
      return `User logged out from all devices: ${user?.name}`;
    case ACTION_TYPES.AUTH_SIGNUP_CATERER:
      return `New caterer signup: ${user?.service_name || user?.name}`;
    case ACTION_TYPES.AUTH_SIGNUP_RESTAURANT:
      return `New restaurant signup: ${user?.restaurant_name}`;
    case ACTION_TYPES.AUTH_GUEST_REGISTER:
      return `Guest registration: ${user?.name || user?.phone}`;
    case ACTION_TYPES.AUTH_TOKEN_REFRESH:
      return `Token refreshed for user: ${user?.name}`;
    default:
      return `Authentication event: ${actionType}`;
  }
}

function getOrderDescription(actionType, order, isGuest, oldStatus, newStatus) {
  const customerInfo = isGuest ? `Guest: ${order.guest_name}` : `Customer ID: ${order.customer_id}`;

  switch (actionType) {
    case ACTION_TYPES.ORDER_CREATED:
    case ACTION_TYPES.ORDER_CREATED_GUEST:
      return `Order created: ${order.order_id} by ${customerInfo}, Amount: ₹${order.total_amount}, Payment: ${order.payment_method}`;
    case ACTION_TYPES.ORDER_STATUS_CHANGED:
      return `Order ${order.order_id} status changed: ${oldStatus} → ${newStatus}`;
    case ACTION_TYPES.ORDER_DELETED:
      return `Order deleted: ${order.order_id}`;
    default:
      return `Order event: ${actionType}`;
  }
}

function getMenuDescription(actionType, menuItem) {
  switch (actionType) {
    case ACTION_TYPES.MENU_CREATED:
      return `Menu item created: ${menuItem.name} (₹${menuItem.price})`;
    case ACTION_TYPES.MENU_UPDATED:
      return `Menu item updated: ${menuItem.name}`;
    case ACTION_TYPES.MENU_DELETED:
      return `Menu item deleted: ${menuItem.name}`;
    case ACTION_TYPES.MENU_STOCK_TOGGLED:
      return `Stock toggled for ${menuItem.name}: ${menuItem.in_stock ? 'In Stock' : 'Out of Stock'}`;
    default:
      return `Menu event: ${actionType}`;
  }
}

function getSubscriptionDescription(actionType, subscription) {
  switch (actionType) {
    case ACTION_TYPES.SUBSCRIPTION_CREATED:
      return `Subscription created: Customer ${subscription.customer_id} → Caterer ${subscription.caterer_id}`;
    case ACTION_TYPES.SUBSCRIPTION_DELETED:
      return `Subscription removed: Customer ${subscription.customer_id} → Caterer ${subscription.caterer_id}`;
    default:
      return `Subscription event: ${actionType}`;
  }
}

function getApartmentDescription(actionType, apartment, metadata) {
  switch (actionType) {
    case ACTION_TYPES.APARTMENT_CREATED:
      return `Apartment created: ${apartment.name}`;
    case ACTION_TYPES.APARTMENT_DELETED:
      return `Apartment deleted: ${apartment.name}`;
    case ACTION_TYPES.CUSTOMER_LINKED_TO_APARTMENT:
      return `Customer linked to apartment ${apartment.name} via access code`;
    case ACTION_TYPES.CUSTOMER_LINKED_MANUAL:
      return `Customer manually linked to apartment ${apartment.name} by caterer`;
    default:
      return `Apartment event: ${actionType}`;
  }
}

function getTableDescription(actionType, table, metadata) {
  switch (actionType) {
    case ACTION_TYPES.TABLE_BULK_CREATED:
      return `Bulk created ${metadata.count} tables for restaurant`;
    case ACTION_TYPES.TABLE_CREATED:
      return `Table created: Table ${table.table_number}`;
    case ACTION_TYPES.TABLE_UPDATED:
      return `Table updated: Table ${table.table_number}`;
    case ACTION_TYPES.TABLE_DELETED:
      return `Table deleted: Table ${table.table_number}`;
    case ACTION_TYPES.TABLE_QR_REGENERATED:
      return `QR code regenerated for Table ${table.table_number}`;
    case ACTION_TYPES.TABLE_QR_SCANNED:
      return `QR code scanned for Table ${table.table_number}`;
    default:
      return `Table event: ${actionType}`;
  }
}

module.exports = {
  ACTION_TYPES,
  ACTION_CATEGORIES,
  ENTITY_TYPES,
  createAuditLog,
  logAuthEvent,
  logProfileUpdate,
  logOrderEvent,
  logMenuEvent,
  logSubscriptionEvent,
  logApartmentEvent,
  logTableEvent,
  getAuditLogs,
  getAuditStats,
};
