# Push Notifications Implementation Guide

## Overview

This guide explains how push notifications work in the KaasproFoods app and how to implement real-time order status notifications from caterers/restaurants to customers.

## Current Implementation Status

### ✅ What's Already Implemented (Frontend)

1. **Notification Service** (`src/services/notificationService.ts`)
   - Expo Push Notification configuration
   - Permission handling
   - Push token generation with Expo Project ID
   - Token registration/unregistration functions

2. **Push Token API** (`src/api/pushTokenApi.ts`)
   - `registerPushToken()` - Sends token to backend
   - `unregisterPushToken()` - Removes token on logout

3. **Automatic Registration** (`src/context/AuthContext.tsx`)
   - Push tokens are automatically registered when **customers** log in
   - Tokens are automatically unregistered when users logout
   - Only customers receive notifications (not caterers)

4. **Order Status Update** (`src/api/orderApi.ts`)
   - `updateOrderStatus()` function exists and is called from:
     - Home Kitchen: `app/(authenticated)/caterer/order-details.tsx`
     - Restaurant: `app/(authenticated)/caterer/restaurant/order-details.tsx`

### ⚠️ What Needs Backend Implementation

The **backend** (hosted on Vercel at `https://kaaspro-backend.vercel.app/api`) needs to:

1. **Store Push Tokens**
   - Endpoint: `POST /push-tokens/register`
   - Store mapping: `userId → pushToken`
   - Endpoint: `DELETE /push-tokens/unregister`
   - Remove token when user logs out

2. **Send Push Notifications**
   - When caterer calls `PATCH /orders/:id/status`
   - Backend should:
     a. Update order status in database
     b. Get the `customerId` from the order
     c. Lookup customer's push token
     d. Send push notification to Expo Push Notification Service
     e. Return updated order

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Customer App   │         │  Your Backend    │         │  Expo Push      │
│  (React Native) │         │  (Vercel)        │         │  Notification   │
│                 │         │                  │         │  Service        │
└────────┬────────┘         └────────┬─────────┘         └────────┬────────┘
         │                           │                            │
         │ 1. Login                  │                            │
         ├──────────────────────────>│                            │
         │                           │                            │
         │ 2. Register Push Token    │                            │
         ├──────────────────────────>│                            │
         │    (Expo Push Token)      │                            │
         │                           │                            │
         │                      Store token                       │
         │                      userId → token                    │
         │                           │                            │
         │                           │                            │
         │                           │ 3. Caterer Updates         │
         │                           │    Order Status            │
         │                           │<───────────────────────────│
         │                           │                            │
         │                           │ 4. Lookup customer's       │
         │                           │    push token              │
         │                           │                            │
         │                           │ 5. Send notification       │
         │                           ├───────────────────────────>│
         │                           │    to Expo                 │
         │                           │                            │
         │ 6. Notification delivered │                            │
         │<──────────────────────────┼────────────────────────────│
         │                           │                            │
```

## Backend Implementation Requirements

### 1. Database Schema

Add a `push_tokens` table/collection:

```sql
-- SQL Example
CREATE TABLE push_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  push_token VARCHAR(255) NOT NULL UNIQUE,
  device_type VARCHAR(50), -- 'ios' or 'android'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (push_token)
);
```

Or for NoSQL (MongoDB):
```javascript
{
  userId: Number,
  pushToken: String,
  deviceType: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Push Token Registration Endpoint

**Endpoint**: `POST /api/push-tokens/register`

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxx]",
  "deviceType": "android"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

**Implementation Logic**:
```javascript
// Pseudo-code
async function registerPushToken(req, res) {
  const userId = req.user.id; // From JWT token
  const { pushToken, deviceType } = req.body;

  // Validate token format
  if (!pushToken.startsWith('ExponentPushToken[')) {
    return res.status(400).json({ error: 'Invalid push token format' });
  }

  // Upsert token (update if exists, insert if not)
  await db.pushTokens.upsert({
    userId: userId,
    pushToken: pushToken,
    deviceType: deviceType,
    updatedAt: new Date()
  });

  return res.json({
    success: true,
    message: 'Push token registered successfully'
  });
}
```

### 3. Push Token Unregistration Endpoint

**Endpoint**: `DELETE /api/push-tokens/unregister`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Push token unregistered successfully"
}
```

**Implementation Logic**:
```javascript
// Pseudo-code
async function unregisterPushToken(req, res) {
  const userId = req.user.id;

  await db.pushTokens.delete({
    where: { userId: userId }
  });

  return res.json({
    success: true,
    message: 'Push token unregistered successfully'
  });
}
```

### 4. Send Push Notification on Order Status Update

**Modify Existing Endpoint**: `PATCH /api/orders/:id/status`

**Current Request Body**:
```json
{
  "status": "confirmed"
}
```

**Updated Implementation Logic**:
```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function updateOrderStatus(req, res) {
  const orderId = req.params.id;
  const { status } = req.body;

  // 1. Get order details
  const order = await db.orders.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // 2. Update order status
  order.status = status;
  await order.save();

  // 3. Get customer's push token
  const pushTokenRecord = await db.pushTokens.findOne({
    where: { userId: order.customerId }
  });

  // 4. Send push notification if token exists
  if (pushTokenRecord && Expo.isExpoPushToken(pushTokenRecord.pushToken)) {
    // Create notification message
    const message = {
      to: pushTokenRecord.pushToken,
      sound: 'default',
      title: getNotificationTitle(status),
      body: getNotificationBody(order, status),
      data: {
        orderId: order.id,
        orderStatus: status,
        type: 'order_status_update'
      },
      priority: 'high',
      channelId: 'orders', // Android notification channel
    };

    // Send to Expo Push Notification service
    try {
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      for (let chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      console.log('Push notification sent:', tickets);
    } catch (error) {
      console.error('Failed to send push notification:', error);
      // Don't fail the status update if notification fails
    }
  }

  // 5. Return updated order
  return res.json(order);
}

// Helper functions for notification content
function getNotificationTitle(status) {
  const titles = {
    'confirmed': '✅ Order Confirmed',
    'preparing': '👨‍🍳 Preparing Your Order',
    'out_for_delivery': '🚚 Out for Delivery',
    'delivered': '✅ Order Delivered',
    'cancelled': '❌ Order Cancelled'
  };
  return titles[status] || 'Order Status Update';
}

function getNotificationBody(order, status) {
  const messages = {
    'confirmed': `Your order #${order.orderId} has been confirmed!`,
    'preparing': `Your order #${order.orderId} is being prepared.`,
    'out_for_delivery': `Your order #${order.orderId} is on the way!`,
    'delivered': `Your order #${order.orderId} has been delivered. Enjoy your meal!`,
    'cancelled': `Your order #${order.orderId} has been cancelled.`
  };
  return messages[status] || `Order ${order.orderId} status: ${status}`;
}
```

### 5. Install Expo Server SDK

**For Node.js Backend**:
```bash
npm install expo-server-sdk
```

**For Python Backend**:
```bash
pip install exponent-server-sdk
```

**For other languages**: See [Expo Server SDK documentation](https://docs.expo.dev/push-notifications/sending-notifications/#server-sdks)

## Testing Push Notifications

### Important Limitations

#### ⚠️ Expo Go Limitations
**Push notifications do NOT work reliably in Expo Go** for the following reasons:
1. Expo Go uses a shared notification certificate
2. Notifications may be delayed or not delivered
3. Only works when Expo Go is actively running in foreground/background
4. Does not support custom notification sounds or channels

#### ✅ Production Requirements
To test push notifications properly, you need:
1. **Development Build** (not Expo Go)
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```
2. **Physical Device** (simulators/emulators don't receive push notifications)
3. **EAS Build** for production:
   ```bash
   eas build --profile production --platform android
   ```

### Testing Steps

#### 1. Test with Development Build

1. **Build app locally**:
   ```bash
   # Android
   npx expo run:android

   # iOS (requires Mac)
   npx expo run:ios
   ```

2. **Login as customer** in the app
   - Push token will be automatically registered
   - Check backend logs to verify token registration

3. **Login as caterer** in another device/emulator

4. **Update order status** as caterer
   - Go to order details
   - Change status (pending → confirmed → preparing, etc.)

5. **Customer should receive notification** on their device

#### 2. Test with EAS Build (Production)

1. **Configure EAS**:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Build for Android**:
   ```bash
   eas build --profile production --platform android
   ```

3. **Install APK** on physical device

4. **Test notification flow** as described above

### Manual Testing with Expo Push Tool

You can also test push notifications manually:

1. **Get a customer's push token**:
   - Login as customer in your app
   - Token is logged in console: `✅ Expo push token: ExponentPushToken[xxxxx]`
   - Or query your backend: `GET /api/push-tokens?userId=1`

2. **Use Expo Push Notification Tool**:
   - Go to: https://expo.dev/notifications
   - Paste the push token
   - Enter title and message
   - Click "Send a Notification"

3. **Verify notification** is received on device

## Frontend Notification Handling

The app already has notification handlers set up in `AuthContext.tsx`, but you can add custom handlers:

### Add Notification Listener

```typescript
// In any component or screen
import { useEffect } from 'react';
import { addNotificationReceivedListener, addNotificationResponseListener } from '@/src/services/notificationService';

useEffect(() => {
  // Listen for notifications when app is open
  const receivedSubscription = addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    // Show in-app notification or update UI
  });

  // Listen for notification taps
  const responseSubscription = addNotificationResponseListener(response => {
    console.log('Notification tapped:', response);
    const data = response.notification.request.content.data;

    // Navigate to order details
    if (data.type === 'order_status_update' && data.orderId) {
      router.push(`/orders/${data.orderId}`);
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}, []);
```

## Troubleshooting

### Issue: Push token not being generated

**Solution**:
1. Check Expo project ID in `notificationService.ts` (line 56-58)
2. Verify it matches your app.json: `extra.eas.projectId`
3. Ensure you're on a physical device (not simulator)

### Issue: Notifications not received

**Possible Causes**:
1. Using Expo Go (use development build instead)
2. Backend not sending notifications correctly
3. Push token expired or invalid
4. Device notification permissions denied

**Debug Steps**:
1. Check backend logs for notification sending
2. Verify token format: starts with `ExponentPushToken[`
3. Test with Expo Push Tool (https://expo.dev/notifications)
4. Check device notification settings

### Issue: Notifications received but not displaying

**Solution**:
1. Check notification handler configuration in `notificationService.ts`
2. Verify Android notification channel is created
3. Check device Do Not Disturb settings

## Security Considerations

1. **Token Privacy**:
   - Push tokens are sensitive - treat like passwords
   - Never expose them in client-side code or logs

2. **Authentication**:
   - Always verify JWT token before registering push tokens
   - Ensure users can only register/unregister their own tokens

3. **Rate Limiting**:
   - Implement rate limits on notification sending
   - Prevent notification spam

4. **Content Filtering**:
   - Sanitize notification content
   - Don't include sensitive order details in notification body

## Best Practices

1. **Batching**:
   - Expo recommends batching notifications
   - Send up to 100 notifications per API call

2. **Error Handling**:
   - Don't fail order updates if notification fails
   - Log notification errors for monitoring

3. **Retry Logic**:
   - Implement retry for failed notifications
   - Store failed notifications for later retry

4. **Testing**:
   - Test on physical devices only
   - Test with development builds, not Expo Go
   - Test all order status transitions

## Summary: What You Need to Do

### Backend (Vercel - Node.js/Express)

1. **Install Expo Server SDK**:
   ```bash
   npm install expo-server-sdk
   ```

2. **Create push_tokens table** in database

3. **Implement endpoints**:
   - `POST /api/push-tokens/register`
   - `DELETE /api/push-tokens/unregister`

4. **Modify order status endpoint**:
   - `PATCH /api/orders/:id/status`
   - Add notification sending logic

### Frontend (Already Done ✅)

Everything is already implemented! The app will automatically:
- Register push tokens when customers login
- Unregister tokens on logout
- Handle incoming notifications

### Testing

1. Build development version: `npx expo run:android`
2. Login as customer to register token
3. Update order status as caterer
4. Verify customer receives notification

## Additional Resources

- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK GitHub](https://github.com/expo/expo-server-sdk-node)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Best Practices for Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)

## Support

If you encounter issues:
1. Check Expo Push Notification status: https://status.expo.dev/
2. Review Expo forums: https://forums.expo.dev/
3. Check your backend logs for errors
4. Verify push token format and validity
