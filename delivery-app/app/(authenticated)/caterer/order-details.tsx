import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getOrderById, updateOrderStatus } from "@/src/api/orderApi";
import { Order } from "@/src/types/order";
import { formatDateTimeIST, formatDateIST } from "@/src/utils/dateUtils";

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  out_for_delivery: "#06B6D4",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const data = await getOrderById(Number(orderId));
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
      Alert.alert("Error", "Failed to load order details", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Order["status"]) => {
    if (!order?.id) return;

    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      Alert.alert("Success", `Order marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => { void handleStatusUpdate("cancelled"); },
        },
      ]
    );
  };

  const getNextAction = () => {
    if (!order) return null;

    switch (order.status) {
      case "pending":
        return { label: "Confirm Order", status: "confirmed" as const, color: "#3B82F6" };
      case "confirmed":
        return { label: "Start Preparing", status: "preparing" as const, color: "#8B5CF6" };
      case "preparing":
        return { label: "Mark Out for Delivery", status: "out_for_delivery" as const, color: "#06B6D4" };
      case "out_for_delivery":
        return { label: "Mark Delivered", status: "delivered" as const, color: "#10B981" };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!order) return null;

  const nextAction = getNextAction();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>#{order.orderId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
              <Text style={styles.statusText}>{order.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.orderTime}>
            {formatDateTimeIST(order.orderDate)}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={18} color="#6B7280" />
              <Text style={styles.infoText}>Customer #{order.customerId}</Text>
            </View>
            {order.deliveryAddress && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{order.deliveryAddress}</Text>
              </View>
            )}
            {order.deliveryDate && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={18} color="#6B7280" />
                <Text style={styles.infoText}>
                  Delivery: {formatDateIST(order.deliveryDate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({order.itemCount} items)</Text>
              <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              {order.paymentMethod === 'upi' ? (
                <Ionicons name="card" size={18} color="#3B82F6" />
              ) : (
                <Ionicons name="cash" size={18} color="#F59E0B" />
              )}
              <Text style={styles.infoText}>
                {order.paymentMethod.toUpperCase()}
              </Text>
            </View>
            {order.transactionId && order.transactionId !== "N/A" && (
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                <Text style={styles.infoText}>{order.transactionId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <View style={styles.actionsSection}>
            {nextAction?.status && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: nextAction.color }]}
                onPress={() => { void handleStatusUpdate(nextAction.status); }}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>{nextAction.label}</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
              disabled={updating}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  orderTime: {
    fontSize: 13,
    color: "#6B7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
  },
  itemsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#6B7280",
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    minWidth: 60,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
