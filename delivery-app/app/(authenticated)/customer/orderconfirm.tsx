import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "@/src/context/CartContext";

export default function OrderConfirm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCart();

  // Extract params
  const orderTotal = params.orderTotal as string;
  const paymentMethod = params.paymentMethod as string;
  const itemCount = params.itemCount as string;
  const orderId = params.orderId as string;
  const transactionId = params.transactionId as string;

  // Format payment method display
  const paymentMethodDisplay =
    paymentMethod === "upi" ? "UPI Payment" : "Cash on Delivery";

  const handleContinueShopping = () => {
    clearCart();
    router.replace("/(authenticated)/customer");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success Icon Section */}
      <View style={styles.successSection}>
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your order has been placed successfully
        </Text>
      </View>

      {/* Order Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.divider} />

        {/* Order Details Rows */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order ID</Text>
          <Text style={styles.detailValue}>{orderId}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <Text style={styles.detailValue}>{paymentMethodDisplay}</Text>
        </View>

        {transactionId && transactionId !== 'N/A' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={[styles.detailValue, styles.transactionId]} numberOfLines={1}>
              {transactionId}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Items</Text>
          <Text style={styles.detailValue}>{itemCount} items</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{orderTotal}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
          <Text style={styles.deliveryTime}>30-40 mins</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinueShopping}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // Placeholder for future track order feature
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Track Order (Coming Soon)</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  successSection: {
    backgroundColor: "#F0FDF4",
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  successIcon: {
    fontSize: 64,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },

  successSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8ECF1",
    marginVertical: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },

  transactionId: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#10B981",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },

  totalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10B981",
  },

  deliveryInfo: {
    alignItems: "center",
    paddingVertical: 8,
  },

  deliveryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },

  deliveryTime: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },

  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },

  primaryButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  secondaryButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  bottomSpacing: {
    height: 40,
  },
});
