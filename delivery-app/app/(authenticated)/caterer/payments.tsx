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

// Filter Button Component to reduce cognitive complexity
interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  icon?: string;
  iconColor?: string;
}

const FilterButtonComponent: React.FC<FilterButtonProps> = ({
  label,
  count,
  isActive,
  onPress,
  icon,
  iconColor
}) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.filterButtonActive]}
    onPress={onPress}
  >
    {icon && (
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={16}
        color={isActive ? "#FFFFFF" : iconColor}
      />
    )}
    <Text
      style={[
        styles.filterButtonText,
        isActive && styles.filterButtonTextActive,
      ]}
    >
      {label}
    </Text>
    <View
      style={[
        styles.filterBadge,
        isActive && styles.filterBadgeActive,
      ]}
    >
      <Text
        style={[
          styles.filterBadgeText,
          isActive && styles.filterBadgeTextActive,
        ]}
      >
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);

// Helper function to calculate payment stats
const calculateStats = (orders: Order[]) => {
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const nonDeliveredOrders = orders.filter((o) => o.status !== "delivered");

  return {
    totalRevenue: deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    receivedPayments: deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    pendingPayments: nonDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
  };
};

// Helper function to calculate filter counts
const calculateFilterCounts = (orders: Order[]) => ({
  allCount: orders.length,
  upiCount: orders.filter((o) => o.paymentMethod === "upi").length,
  codCount: orders.filter((o) => o.paymentMethod === "cod").length,
  receivedCount: orders.filter((o) => o.status === "delivered").length,
  pendingCount: orders.filter((o) => o.status !== "delivered").length,
});

// Helper function to filter orders
const filterOrders = (orders: Order[], filter: PaymentFilter) => {
  switch (filter) {
    case "upi":
      return orders.filter((o) => o.paymentMethod === "upi");
    case "cod":
      return orders.filter((o) => o.paymentMethod === "cod");
    case "received":
      return orders.filter((o) => o.status === "delivered");
    case "pending":
      return orders.filter((o) => o.status !== "delivered");
    default:
      return orders;
  }
};

// Helper function to fetch customers
const fetchCustomersData = async (ordersData: Order[]) => {
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

  return customerData;
};

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
      const ordersData = await getCatererOrders(user.id);
      setOrders(ordersData);

      const customerData = await fetchCustomersData(ordersData);
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

  const filteredOrders = filterOrders(orders, filter);
  const stats = calculateStats(orders);
  const counts = calculateFilterCounts(orders);

  const { totalRevenue, receivedPayments, pendingPayments } = stats;
  const { allCount, upiCount, codCount, receivedCount, pendingCount } = counts;

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
            <FilterButtonComponent
              label="All"
              count={allCount}
              isActive={filter === "all"}
              onPress={() => { setFilter("all"); }}
            />
            <FilterButtonComponent
              label="Received"
              count={receivedCount}
              isActive={filter === "received"}
              onPress={() => { setFilter("received"); }}
              icon="checkmark-circle"
              iconColor="#10B981"
            />
            <FilterButtonComponent
              label="Pending"
              count={pendingCount}
              isActive={filter === "pending"}
              onPress={() => { setFilter("pending"); }}
              icon="time"
              iconColor="#F59E0B"
            />
            <FilterButtonComponent
              label="UPI"
              count={upiCount}
              isActive={filter === "upi"}
              onPress={() => { setFilter("upi"); }}
              icon="card"
              iconColor="#3B82F6"
            />
            <FilterButtonComponent
              label="COD"
              count={codCount}
              isActive={filter === "cod"}
              onPress={() => { setFilter("cod"); }}
              icon="cash"
              iconColor="#F59E0B"
            />
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
            filteredOrders.map((order) => {
              const customerName = order.customerId
                ? customers.get(order.customerId)?.name ?? "Customer"
                : "Customer";

              return (
                <PaymentCard
                  key={order.id}
                  order={order}
                  customerName={customerName}
                  onPress={() =>
                    router.push(
                      `/(authenticated)/caterer/order-details?orderId=${order.id}`
                    )
                  }
                  onMarkReceived={handleMarkAsReceived}
                />
              );
            })
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
