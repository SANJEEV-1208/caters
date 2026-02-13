const pool = require('../config/database');

/**
 * Send push notification via Expo Push Service
 * @param {string} pushToken - Expo push token
 * @param {object} notification - Notification details
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {object} notification.data - Additional data to send
 * @returns {Promise<boolean>} Success status
 */
async function sendPushNotification(pushToken, { title, body, data = {} }) {
  try {
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      badge: 1,
    };

    console.log('📤 Sending push notification:', { title, body, to: pushToken.substring(0, 20) + '...' });

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.data && result.data.status === 'ok') {
      console.log('✅ Push notification sent successfully');
      return true;
    } else {
      console.error('❌ Push notification failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return false;
  }
}

/**
 * Send push notification to a specific user by user ID
 * @param {number} userId - User ID
 * @param {object} notification - Notification details
 * @returns {Promise<boolean>} Success status
 */
async function sendNotificationToUser(userId, notification) {
  try {
    // Get user's push token from database
    const result = await pool.query(
      'SELECT push_token FROM push_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log(`⚠️ No push token found for user ${userId}`);
      return false;
    }

    const pushToken = result.rows[0].push_token;
    return await sendPushNotification(pushToken, notification);
  } catch (error) {
    console.error(`❌ Error sending notification to user ${userId}:`, error);
    return false;
  }
}

/**
 * Send order status update notification to customer
 * @param {number} customerId - Customer user ID
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @returns {Promise<boolean>} Success status
 */
async function sendOrderStatusNotification(customerId, orderId, status) {
  const statusMessages = {
    confirmed: {
      title: '✅ Order Confirmed',
      body: `Your order #${orderId} has been confirmed and is being prepared!`,
    },
    preparing: {
      title: '👨‍🍳 Order Being Prepared',
      body: `Your order #${orderId} is now being prepared by the chef.`,
    },
    out_for_delivery: {
      title: '🚚 Out for Delivery',
      body: `Your order #${orderId} is on its way! Get ready to enjoy your meal.`,
    },
    delivered: {
      title: '🎉 Order Delivered',
      body: `Your order #${orderId} has been delivered. Bon appétit!`,
    },
    cancelled: {
      title: '❌ Order Cancelled',
      body: `Your order #${orderId} has been cancelled. Contact support if you need help.`,
    },
  };

  const notification = statusMessages[status];
  if (!notification) {
    console.error(`⚠️ Unknown order status: ${status}`);
    return false;
  }

  return await sendNotificationToUser(customerId, {
    ...notification,
    data: {
      orderId: orderId,
      status: status,
      type: 'order_status_update',
    },
  });
}

module.exports = {
  sendPushNotification,
  sendNotificationToUser,
  sendOrderStatusNotification,
};
