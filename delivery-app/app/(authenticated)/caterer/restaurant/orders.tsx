import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import OrderCard from "@/src/components/caterer/OrderCard";
import { getCatererOrders } from "@/src/api/orderApi";
import { Order } from "@/src/types/order";
import { formatTimeIST } from "@/src/utils/dateUtils";

type OrderStatus = "pending" | "confirmed" | "preparing" | "delivered";
type FilterType = "status" | "table";

// Filter Tab Component to reduce cognitive complexity
interface FilterTabProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  icon?: string;
}

const FilterTab: React.FC<FilterTabProps> = ({ label, count, isActive, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.filterTab, isActive && styles.filterTabActive]}
    onPress={onPress}
  >
    {icon && (
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={14}
        color={isActive ? "#FFFFFF" : "#6B7280"}
      />
    )}
    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
      {label}
    </Text>
    <View style={[styles.badge, isActive && styles.badgeActive]}>
      <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);

// Helper functions extracted to reduce cognitive complexity
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "#F59E0B";
    case "confirmed":
      return "#3B82F6";
    case "preparing":
      return "#8B5CF6";
    case "delivered":
      return "#10B981";
    default:
      return "#6B7280";
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    delivered: "Delivered",
  };
  return (status in labels) ? labels[status as keyof typeof labels] : status;
};

const getUniqueTables = (orders: Order[]) => {
  const tables = new Set<number>();
  orders.forEach(order => {
    if (order.tableNumber) {
      tables.add(order.tableNumber);
    }
  });
  return Array.from(tables).sort((a, b) => a - b);
};

const filterOrdersByStatus = (orders: Order[], status: OrderStatus | "all") => {
  if (status === "all") return orders;
  return orders.filter((order) => order.status === status);
};

const filterOrdersByTable = (orders: Order[], tableNum: number | "all") => {
  if (tableNum === "all") return orders;
  return orders.filter((order) => order.tableNumber === tableNum);
};

export default function RestaurantOrders() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("status");
  const [activeStatusFilter, setActiveStatusFilter] = useState<OrderStatus | "all">("all");
  const [activeTableFilter, setActiveTableFilter] = useState<number | "all">("all");

  useEffect(() => {
    void loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user?.id) return;
    try {
      const ordersData = await getCatererOrders(user.id);
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getFilteredOrders = () => {
    if (filterType === "status") {
      return filterOrdersByStatus(orders, activeStatusFilter);
    }
    return filterOrdersByTable(orders, activeTableFilter);
  };

  const getStatusCount = (status: OrderStatus | "all") => {
    return filterOrdersByStatus(orders, status).length;
  };

  const getTableCount = (tableNum: number | "all") => {
    return filterOrdersByTable(orders, tableNum).length;
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

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { router.back(); }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Type Toggle */}
      <View style={styles.filterTypeContainer}>
        <TouchableOpacity
          style={[
            styles.filterTypeButton,
            filterType === "status" && styles.filterTypeButtonActive,
          ]}
          onPress={() => { setFilterType("status"); }}
        >
          <Ionicons
            name="list"
            size={18}
            color={filterType === "status" ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            style={[
              styles.filterTypeText,
              filterType === "status" && styles.filterTypeTextActive,
            ]}
          >
            By Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTypeButton,
            filterType === "table" && styles.filterTypeButtonActive,
          ]}
          onPress={() => { setFilterType("table"); }}
        >
          <Ionicons
            name="layers"
            size={18}
            color={filterType === "table" ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            style={[
              styles.filterTypeText,
              filterType === "table" && styles.filterTypeTextActive,
            ]}
          >
            By Table
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      {filterType === "status" && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {(["all", "pending", "confirmed", "preparing", "delivered"] as const).map(
              (filter) => (
                <FilterTab
                  key={filter}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                  count={getStatusCount(filter)}
                  isActive={activeStatusFilter === filter}
                  onPress={() => { setActiveStatusFilter(filter); }}
                />
              )
            )}
          </ScrollView>
        </View>
      )}

      {/* Table Filter Tabs */}
      {filterType === "table" && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <FilterTab
              label="All Tables"
              count={orders.length}
              isActive={activeTableFilter === "all"}
              onPress={() => { setActiveTableFilter("all"); }}
            />
            {getUniqueTables(orders).map((tableNum) => (
              <FilterTab
                key={tableNum}
                label={`Table ${tableNum}`}
                count={getTableCount(tableNum)}
                isActive={activeTableFilter === tableNum}
                onPress={() => { setActiveTableFilter(tableNum); }}
                icon="layers"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(authenticated)/caterer/restaurant/order-details",
                params: { orderId: String(item.id) },
              })
            }
            style={styles.orderItemWrapper}
          >
            <View style={styles.orderItem}>
              <View style={styles.orderContent}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{item.orderId}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>

                {/* Table Number - Key Info for Restaurant */}
                {item.tableNumber && (
                  <View style={styles.tableInfo}>
                    <Ionicons name="layers" size={14} color="#6B7280" />
                    <Text style={styles.tableText}>Table {item.tableNumber}</Text>
                  </View>
                )}

                <Text style={styles.itemCount}>
                  {item.items.length} item{item.items.length !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>

                <Text style={styles.timestamp}>
                  {item.createdAt ? formatTimeIST(item.createdAt) : ""}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { void onRefresh(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {filterType === "status"
                ? activeStatusFilter === "all"
                  ? "No orders yet"
                  : `No ${activeStatusFilter} orders`
                : activeTableFilter === "all"
                ? "No orders yet"
                : `No orders for Table ${activeTableFilter}`}
            </Text>
            <Text style={styles.emptySubtext}>
              Orders will appear here when customers place them
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      </View>
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
  filterTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  filterTypeButtonActive: {
    backgroundColor: "#F59E0B",
  },
  filterTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTypeTextActive: {
    color: "#FFFFFF",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#F59E0B",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
  },
  badgeTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  orderItemWrapper: {
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  orderContent: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tableText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  itemCount: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  emptyState: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});
