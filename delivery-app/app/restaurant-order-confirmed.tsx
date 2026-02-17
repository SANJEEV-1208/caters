import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RestaurantOrderConfirmed() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const orderId = (params?.orderId as string) || "";
  const tableNumber = (params?.tableNumber as string) || "";
  const restaurantName = (params?.restaurantName as string) || "";
  const totalAmount = (params?.totalAmount as string) || "0";
  const paymentMethod = (params?.paymentMethod as string) || "cod";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Success Icon Section */}
        <View style={styles.successSection}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Your order will be prepared and served at your table
          </Text>
        </View>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Details</Text>

          <View style={styles.divider} />

          {/* Order Details */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>{orderId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restaurant</Text>
            <Text style={styles.detailValue}>{restaurantName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Table Number</Text>
            <View style={styles.tableBadge}>
              <Ionicons name="layers" size={16} color="#F59E0B" />
              <Text style={styles.tableText}>Table {tableNumber}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.detailValue}>₹{totalAmount}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {paymentMethod === "upi" ? "UPI Payment" : "Cash on Delivery"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#10B981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What&apos;s Next?</Text>
            <Text style={styles.infoText}>
              Our kitchen staff will prepare your order and serve it at Table {tableNumber}. {paymentMethod === "cod" ? "Please pay at the counter after your meal." : "Your UPI payment has been received."}
            </Text>
          </View>
        </View>

        {/* Order Status Timeline */}
        <View style={styles.statusTimelineCard}>
          <Text style={styles.statusTimelineTitle}>Order Timeline</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Order Placed</Text>
              <Text style={styles.timelineTime}>Just now</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotInactive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Confirmed</Text>
              <Text style={styles.timelineTime}>Waiting...</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotInactive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Preparing</Text>
              <Text style={styles.timelineTime}>Waiting...</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotInactive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Ready to Serve</Text>
              <Text style={styles.timelineTime}>Waiting...</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            router.replace("/restaurant-menu");
          }}
        >
          <Ionicons name="home" size={20} color="#FFFFFF" />
          <Text style={styles.continueButtonText}>Back to Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newOrderButton}
          onPress={() => {
            router.replace("/qr-scanner");
          }}
        >
          <Ionicons name="qr-code" size={20} color="#F59E0B" />
          <Text style={styles.newOrderButtonText}>Scan New QR Code</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
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
    marginBottom: 16,
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
  continueButton: {
    marginHorizontal: 16,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  newOrderButton: {
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
    marginBottom: 16,
  },
  newOrderButtonText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "700",
  },
  spacer: {
    height: 20,
  },
});
