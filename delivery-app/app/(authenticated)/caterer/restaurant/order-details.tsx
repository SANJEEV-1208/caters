import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { getCatererOrders, updateOrderStatus } from "@/src/api/orderApi";
import { Order } from "@/src/types/order";
import { formatDateTimeIST } from "@/src/utils/dateUtils";

type OrderStatus = "pending" | "confirmed" | "preparing" | "delivered";

export default function RestaurantOrderDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const orderId = (params?.orderId as string) || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    if (!user?.id) return;
    try {
      const orders = await getCatererOrders(user.id);
      const found = orders.find((o) => String(o.id) === orderId);
      if (found) {
        setOrder(found);
      } else {
        Alert.alert("Error", "Order not found");
        router.back();
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order?.id) return;

    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      Alert.alert("Success", `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const workflow: Record<OrderStatus, OrderStatus | null> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "delivered",
      delivered: null,
    };
    return workflow[currentStatus];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#F59E0B",
      confirmed: "#3B82F6",
      preparing: "#8B5CF6",
      delivered: "#10B981",
    };
    return colors[status] || "#6B7280";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      delivered: "Delivered",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const nextStatus = getNextStatus(order.status as OrderStatus);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Header Card */}
      <View style={styles.orderHeaderCard}>
        <View style={styles.orderIdSection}>
          <Text style={styles.orderId}>Order #{order.orderId}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: getStatusColor(order.status) },
              ]}
            >
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        {/* Table Number - Important for Restaurant */}
        {order.tableNumber && (
          <View style={styles.tableSection}>
            <Ionicons name="layers" size={20} color="#F59E0B" />
            <Text style={styles.tableNumber}>Table {order.tableNumber}</Text>
          </View>
        )}

        <Text style={styles.timestamp}>
          {order.createdAt ? formatDateTimeIST(order.createdAt) : ""}
        </Text>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.itemsContainer}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentBox}>
          <Ionicons
            name={
              order.paymentMethod === "upi"
                ? "swap-horizontal"
                : "wallet-outline"
            }
            size={20}
            color="#10B981"
          />
          <View style={styles.paymentContent}>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === "upi" ? "UPI Payment" : "Cash on Delivery"}
            </Text>
            {order.transactionId && (
              <Text style={styles.transactionId}>ID: {order.transactionId}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Status Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Status</Text>

        {/* Status Workflow */}
        <View style={styles.statusWorkflow}>
          {(
            ["pending", "confirmed", "preparing", "delivered"] as OrderStatus[]
          ).map((status, index) => {
            const isActive = order.status === status;
            const isCompleted =
              ["pending", "confirmed", "preparing", "delivered"].indexOf(
                order.status
              ) >= index;

            return (
              <View key={status} style={styles.workflowItem}>
                <View
                  style={[
                    styles.workflowDot,
                    isCompleted && { backgroundColor: getStatusColor(status) },
                  ]}
                >
                  {isCompleted && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  style={[
                    styles.workflowLabel,
                    isActive && styles.workflowLabelActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                {index < 3 && (
                  <View
                    style={[
                      styles.workflowLine,
                      isCompleted && { backgroundColor: getStatusColor(status) },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Update Button */}
        {nextStatus && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleStatusUpdate(nextStatus)}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>
                  Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {order.status === "delivered" && (
          <View style={styles.completedBox}>
            <Ionicons name="checkmark-done-circle" size={24} color="#10B981" />
            <Text style={styles.completedText}>Order Completed</Text>
          </View>
        )}
      </View>

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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  orderHeaderCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderIdSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tableSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
  },
  paymentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  paymentContent: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
  transactionId: {
    fontSize: 11,
    color: "#16A34A",
    marginTop: 2,
  },
  statusWorkflow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  workflowItem: {
    flex: 1,
    alignItems: "center",
  },
  workflowDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  workflowLabel: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  workflowLabelActive: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  workflowLine: {
    position: "absolute",
    right: "-45%",
    width: "90%",
    height: 2,
    backgroundColor: "#E5E7EB",
    top: 15,
  },
  updateButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  completedBox: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  completedText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
  spacer: {
    height: 20,
  },
});
