import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/context/AuthContext";
import { CartProvider } from "@/src/context/CartContext";
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from "@/src/services/notificationService";

export default function RootLayout() {
  const router = useRouter();

  // Setup notification handlers
  useEffect(() => {
    // Handle notification received while app is open
    const receivedSubscription = addNotificationReceivedListener((notification) => {
      console.log("📩 Notification received:", notification);
      // Show in-app notification (already handled by Expo)
    });

    // Handle user tapping on notification
    const responseSubscription = addNotificationResponseListener((response) => {
      console.log("👆 Notification tapped:", response);

      const data = response.notification.request.content.data;

      // Navigate to order details if notification is about an order
      if (data.type === "order_status_update" && data.orderId) {
        // Ensure orderId is a valid primitive type (string or number)
        if (typeof data.orderId !== "string" && typeof data.orderId !== "number") {
          console.error("❌ Invalid orderId format:", data.orderId);
          return;
        }

        const orderId = String(data.orderId);
        console.log(`🚀 Navigating to order: ${orderId}`);
        router.push(`/(authenticated)/customer/orderdetails?orderId=${orderId}`);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [router]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </CartProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}