import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import PaymentCard from "@/src/components/caterer/PaymentCard";
import { getCatererOrders, updateOrderStatus } from "@/src/api/orderApi";
import { getUserById } from "@/src/api/authApi";
import { Order } from "@/src/types/order";
import { User } from "@/src/types/auth";

type PaymentFilter = "all" | "upi" | "cod" | "received" | "pending";

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PaymentFilter>("all");

  useEffect(() => {
    void loadPayments();
  }, []);

  const loadPayments = async () => {
    if (!user?.id) return;

    try {
      // Get all orders for this caterer
      const ordersData = await getCatererOrders(user.id);
      setOrders(ordersData);

      // Fetch customer details for each unique customer
      const uniqueCustomerIds = [
        ...new Set(ordersData.map((order) => order.customerId).filter(Boolean)),
      ] as number[];

      const customerData = new Map<number, User>();
      await Promise.all(
        uniqueCustomerIds.map(async (customerId) => {
          const customer = await getUserById(customerId);
          if (customer && customerId) {
            customerData.set(customerId, customer);
          }
        })
      );

      setCustomers(customerData);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    void loadPayments();
  };

  const handleMarkAsReceived = async (orderId: number) => {
    try {
      await updateOrderStatus(orderId, "delivered");

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: "delivered" as const } : order
        )
      );

      Alert.alert("Success", "Payment marked as received");
    } catch (error) {
      console.error("Failed to mark payment as received:", error);
      Alert.alert("Error", "Failed to update payment status");
    }
  };

  // Filter orders based on selected filter
  const getFilteredOrders = () => {
    let filtered = orders;

    switch (filter) {
      case "upi":
        filtered = orders.filter((o) => o.paymentMethod === "upi");
        break;
      case "cod":
        filtered = orders.filter((o) => o.paymentMethod === "cod");
        break;
      case "received":
        // Show all delivered orders (payment has been received - either UPI or COD)
        filtered = orders.filter((o) => o.status === "delivered");
        break;
      case "pending":
        // Show all non-delivered orders (payment not yet received)
        filtered = orders.filter((o) => o.status !== "delivered");
        break;
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate stats
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const receivedPayments = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingPayments = orders
    .filter((o) => o.status !== "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter counts
  const allCount = orders.length;
  const upiCount = orders.filter((o) => o.paymentMethod === "upi").length;
  const codCount = orders.filter((o) => o.paymentMethod === "cod").length;
  const receivedCount = orders.filter((o) => o.status === "delivered").length;
  const pendingCount = orders.filter((o) => o.status !== "delivered").length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statValue}>₹{totalRevenue.toLocaleString()}</Text>
            <Text style={styles.statSubtext}>{orders.length} orders</Text>
          </View>
          <View style={styles.statRow}>
            <View style={[styles.statBoxSmall, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.statSmallValue}>₹{receivedPayments.toLocaleString()}</Text>
              <Text style={styles.statSmallLabel}>Received ({receivedCount})</Text>
            </View>
            <View style={[styles.statBoxSmall, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text style={styles.statSmallValue}>₹{pendingPayments.toLocaleString()}</Text>
              <Text style={styles.statSmallLabel}>Pending ({pendingCount})</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
              onPress={() => { setFilter("all"); }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "all" && styles.filterButtonTextActive,
                ]}
              >
                All
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === "all" && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === "all" && styles.filterBadgeTextActive,
                  ]}
                >
                  {allCount}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "received" && styles.filterButtonActive]}
              onPress={() => { setFilter("received"); }}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={filter === "received" ? "#FFFFFF" : "#10B981"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "received" && styles.filterButtonTextActive,
                ]}
              >
                Received
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === "received" && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === "received" && styles.filterBadgeTextActive,
                  ]}
                >
                  {receivedCount}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "pending" && styles.filterButtonActive]}
              onPress={() => { setFilter("pending"); }}
            >
              <Ionicons
                name="time"
                size={16}
                color={filter === "pending" ? "#FFFFFF" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "pending" && styles.filterButtonTextActive,
                ]}
              >
                Pending
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === "pending" && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === "pending" && styles.filterBadgeTextActive,
                  ]}
                >
                  {pendingCount}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "upi" && styles.filterButtonActive]}
              onPress={() => { setFilter("upi"); }}
            >
              <Ionicons
                name="card"
                size={16}
                color={filter === "upi" ? "#FFFFFF" : "#3B82F6"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "upi" && styles.filterButtonTextActive,
                ]}
              >
                UPI
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === "upi" && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === "upi" && styles.filterBadgeTextActive,
                  ]}
                >
                  {upiCount}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "cod" && styles.filterButtonActive]}
              onPress={() => { setFilter("cod"); }}
            >
              <Ionicons
                name="cash"
                size={16}
                color={filter === "cod" ? "#FFFFFF" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "cod" && styles.filterButtonTextActive,
                ]}
              >
                COD
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === "cod" && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === "cod" && styles.filterBadgeTextActive,
                  ]}
                >
                  {codCount}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Payment List */}
        <View style={styles.listContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No payments found</Text>
              <Text style={styles.emptySubtext}>
                {filter === "all"
                  ? "Payments from customers will appear here"
                  : "No payments match this filter"}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <PaymentCard
                key={order.id}
                order={order}
                customerName={
                  order.customerId ? customers.get(order.customerId)?.name ?? "Customer" : "Customer"
                }
                onPress={() =>
                  router.push(
                    `/(authenticated)/caterer/order-details?orderId=${order.id}`
                  )
                }
                onMarkReceived={handleMarkAsReceived}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBoxSmall: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statSmallValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 8,
  },
  statSmallLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  filterBadgeTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
});
