import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "@/src/context/CartContext";
import { Ionicons } from "@expo/vector-icons";

export default function RestaurantOrderConfirmed() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCart();

  const orderId = (params?.orderId as string) || "";
  const tableNumber = (params?.tableNumber as string) || "";
  const restaurantName = (params?.restaurantName as string) || "";

  const handleContinue = () => {
    clearCart();
    router.replace("/(authenticated)/customer/caterer-selection");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container as any} showsVerticalScrollIndicator={false}>
      {/* Success Icon Section */}
      <View style={styles.successSection as any}>
        <View style={styles.successIconContainer as any}>
          <Text style={styles.successIcon as any}>✓</Text>
        </View>
        <Text style={styles.successTitle as any}>Order Placed!</Text>
        <Text style={styles.successSubtitle as any}>
          Your order will be prepared and served at your table
        </Text>
      </View>

      {/* Order Summary Card */}
      <View style={styles.summaryCard as any}>
        <Text style={styles.summaryTitle as any}>Order Details</Text>

        <View style={styles.divider as any} />

        {/* Order Details */}
        <View style={styles.detailRow as any}>
          <Text style={styles.detailLabel as any}>Order ID</Text>
          <Text style={styles.detailValue as any}>{orderId}</Text>
        </View>

        <View style={styles.detailRow as any}>
          <Text style={styles.detailLabel as any}>Restaurant</Text>
          <Text style={styles.detailValue as any}>{restaurantName}</Text>
        </View>

        <View style={styles.detailRow as any}>
          <View style={styles.tableBadge as any}>
            <Ionicons name="layers" size={16} color="#F59E0B" />
            <Text style={styles.tableText as any}>Table {tableNumber}</Text>
          </View>
        </View>

        <View style={styles.divider as any} />

        <View style={styles.statusSection as any}>
          <Text style={styles.statusLabel as any}>Order Status</Text>
          <View style={styles.statusBadge as any}>
            <View style={styles.statusDot as any} />
            <Text style={styles.statusText as any}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox as any}>
        <Ionicons name="information-circle" size={20} color="#10B981" />
        <View style={styles.infoContent as any}>
          <Text style={styles.infoTitle as any}>What&apos;s Next?</Text>
          <Text style={styles.infoText as any}>
            Our kitchen staff will prepare your order and serve it at Table {tableNumber}. You can track your order status below.
          </Text>
        </View>
      </View>

      {/* Order Status Timeline */}
      <View style={styles.statusTimelineCard as any}>
        <Text style={styles.statusTimelineTitle as any}>Order Timeline</Text>
        
        <View style={styles.timelineItem as any}>
          <View style={[styles.timelineDot as any, styles.timelineDotActive as any]} />
          <View style={styles.timelineContent as any}>
            <Text style={styles.timelineLabel as any}>Order Placed</Text>
            <Text style={styles.timelineTime as any}>Just now</Text>
          </View>
        </View>

        <View style={styles.timelineLine as any} />

        <View style={styles.timelineItem as any}>
          <View style={[styles.timelineDot as any, styles.timelineDotInactive as any]} />
          <View style={styles.timelineContent as any}>
            <Text style={styles.timelineLabel as any}>Confirmed</Text>
            <Text style={styles.timelineTime as any}>Waiting...</Text>
          </View>
        </View>

        <View style={styles.timelineLine as any} />

        <View style={styles.timelineItem as any}>
          <View style={[styles.timelineDot as any, styles.timelineDotInactive as any]} />
          <View style={styles.timelineContent as any}>
            <Text style={styles.timelineLabel as any}>Preparing</Text>
            <Text style={styles.timelineTime as any}>Waiting...</Text>
          </View>
        </View>

        <View style={styles.timelineLine as any} />

        <View style={styles.timelineItem as any}>
          <View style={[styles.timelineDot as any, styles.timelineDotInactive as any]} />
          <View style={styles.timelineContent as any}>
            <Text style={styles.timelineLabel as any}>Ready</Text>
            <Text style={styles.timelineTime as any}>Waiting...</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.viewOrderButton as any}
        onPress={() => {
          router.push("/(authenticated)/customer/orders");
        }}
      >
        <Ionicons name="eye-outline" size={18} color="#F59E0B" />
        <Text style={styles.viewOrderButtonText as any}>View Order Status</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton as any}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText as any}>Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.spacer as any} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  successSection: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 48,
    color: "#10B981",
    fontWeight: "700",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  summaryCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  tableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  tableText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "700",
  },
  statusSection: {
    paddingTop: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
  statusText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#16A34A",
    lineHeight: 16,
  },
  statusTimelineCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusTimelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  timelineDotActive: {
    backgroundColor: "#F59E0B",
  },
  timelineDotInactive: {
    backgroundColor: "#E5E7EB",
  },
  timelineContent: {
    flex: 1,
    paddingVertical: 4,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  timelineTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  timelineLine: {
    height: 16,
    width: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 5,
    marginVertical: 4,
  },
  viewOrderButton: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  viewOrderButtonText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "700",
  },
  continueButton: {
    marginHorizontal: 16,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  spacer: {
    height: 20,
  },
});
