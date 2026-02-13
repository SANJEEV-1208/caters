import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken } from "../api/pushTokenApi";

/**
 * Configure how notifications are handled when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from user
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permissions have not been determined
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("⚠️ Notification permission not granted");
      return false;
    }

    console.log("✅ Notification permission granted");
    return true;
  } catch (error) {
    console.error("❌ Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Get Expo push token for this device
 * @returns {Promise<string | null>} Push token or null if failed
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // For physical devices only (push notifications don't work on simulator/emulator)
    if (!Platform.OS.match(/ios|android/)) {
      console.log("⚠️ Push notifications only work on iOS/Android devices");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "your-expo-project-id", // Replace with your Expo project ID
    });

    console.log("✅ Expo push token:", token.data);
    return token.data;
  } catch (error) {
    console.error("❌ Error getting Expo push token:", error);
    return null;
  }
}

/**
 * Register device for push notifications
 * This should be called after user logs in
 * @returns {Promise<boolean>} True if registration successful
 */
export async function registerForPushNotifications(): Promise<boolean> {
  try {
    console.log("📱 Registering device for push notifications...");

    // Step 1: Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("⚠️ User denied notification permissions");
      return false;
    }

    // Step 2: Get push token
    const pushToken = await getExpoPushToken();
    if (!pushToken) {
      console.log("⚠️ Failed to get push token");
      return false;
    }

    // Step 3: Send token to backend
    const deviceType = Platform.OS;
    await registerPushToken(pushToken, deviceType);

    console.log("✅ Successfully registered for push notifications");
    return true;
  } catch (error) {
    console.error("❌ Error registering for push notifications:", error);
    return false;
  }
}

/**
 * Add listener for notifications received while app is open
 * @param callback - Function to call when notification is received
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user taps on notification
 * @param callback - Function to call when notification is tapped
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
