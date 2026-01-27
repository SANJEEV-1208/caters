import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import OrderCard from "@/src/components/caterer/OrderCard";
import { getCatererOrders, getOrdersByDate, getOrdersByStatus } from "@/src/api/orderApi";
import { Order } from "@/src/types/order";

const DATE_FILTERS = ["Today", "Tomorrow", "Week", "All"];
const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function CatererOrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedDateFilter, selectedStatus]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      const data = await getCatererOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Date filter
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    if (selectedDateFilter === "Today") {
      filtered = filtered.filter(o => o.deliveryDate === today);
    } else if (selectedDateFilter === "Tomorrow") {
      filtered = filtered.filter(o => o.deliveryDate === tomorrow);
    } else if (selectedDateFilter === "Week") {
      filtered = filtered.filter(o =>
        o.deliveryDate && o.deliveryDate >= today && o.deliveryDate <= weekFromNow
      );
    }

    // Status filter
    if (selectedStatus !== "All") {
      const status = selectedStatus.toLowerCase().replace(" ", "_");
      filtered = filtered.filter(o => o.status === status);
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const getStatusCount = (status: string) => {
    if (status === "All") return filteredOrders.length;
    const statusKey = status.toLowerCase().replace(" ", "_");
    return filteredOrders.filter(o => o.status === statusKey).length;
  };

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
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Date Filter */}
      <View style={styles.dateFilterContainer}>
        <FlatList
          horizontal
          data={DATE_FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateFilterButton,
                selectedDateFilter === item && styles.dateFilterButtonActive,
              ]}
              onPress={() => setSelectedDateFilter(item)}
            >
              <Text
                style={[
                  styles.dateFilterText,
                  selectedDateFilter === item && styles.dateFilterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateFilterList}
        />
      </View>

      {/* Status Tabs */}
      <View style={styles.statusTabsContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const count = getStatusCount(item);
            return (
              <TouchableOpacity
                style={[
                  styles.statusTab,
                  selectedStatus === item && styles.statusTabActive,
                ]}
                onPress={() => setSelectedStatus(item)}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    selectedStatus === item && styles.statusTabTextActive,
                  ]}
                >
                  {item}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.statusBadge,
                      selectedStatus === item && styles.statusBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        selectedStatus === item && styles.statusBadgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusTabsList}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id?.toString() || item.orderId}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              Orders matching your filters will appear here
            </Text>
          </View>
        }
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  dateFilterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateFilterList: {
    paddingHorizontal: 12,
  },
  dateFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  dateFilterButtonActive: {
    backgroundColor: "#10B981",
  },
  dateFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  dateFilterTextActive: {
    color: "#FFFFFF",
  },
  statusTabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  statusTabsList: {
    paddingHorizontal: 12,
  },
  statusTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },
  statusTabActive: {
    backgroundColor: "#10B981",
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  statusTabTextActive: {
    color: "#FFFFFF",
  },
  statusBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  statusBadgeActive: {
    backgroundColor: "#FFFFFF",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
  },
  statusBadgeTextActive: {
    color: "#10B981",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
});
