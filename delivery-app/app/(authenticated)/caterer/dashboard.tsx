import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import StatsCard from "@/src/components/caterer/StatsCard";
import OrderCard from "@/src/components/caterer/OrderCard";
import { getCatererOrders } from "@/src/api/orderApi";
import { getMenuItemsByDate } from "@/src/api/catererMenuApi";
import { Order } from "@/src/types/order";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      const [ordersData, todayMenuData] = await Promise.all([
        getCatererOrders(user.id),
        getMenuItemsByDate(user.id, today),
      ]);

      setOrders(ordersData);
      // Only count items available today
      setMenuItemsCount(todayMenuData.length);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  // Today's orders = orders placed today (by orderDate)
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate).toISOString().split('T')[0];
    return orderDate === today;
  });
  const pendingOrders = orders.filter(o =>
    o.status === "pending" || o.status === "confirmed" || o.status === "preparing"
  );
  // Total revenue includes confirmed and delivered orders (when caterer confirms payment commitment)
  const confirmedOrders = orders.filter(o =>
    o.status === "confirmed" || o.status === "preparing" ||
    o.status === "out_for_delivery" || o.status === "delivered"
  );
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10B981"
          colors={['#10B981']}
        />
      }
    >
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.businessName}>{user?.serviceName || user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={styles.statHalf}>
            <StatsCard
              title="Orders"
              value={todayOrders.length}
              subtitle="Orders placed today"
              icon="today"
              color="#3B82F6"
              onPress={() => router.push("/(authenticated)/caterer/orders")}
            />
          </View>
          <View style={styles.statHalf}>
            <StatsCard
              title="Pending"
              value={pendingOrders.length}
              subtitle="Awaiting action"
              icon="time"
              color="#F59E0B"
              onPress={() => router.push("/(authenticated)/caterer/orders")}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statHalf}>
            <StatsCard
              title="Menu"
              value={menuItemsCount}
              subtitle="Active today"
              icon="restaurant"
              color="#8B5CF6"
              onPress={() => router.push("/(authenticated)/caterer/menu")}
            />
          </View>
          <View style={styles.statHalf}>
            <StatsCard
              title="Revenue"
              value={`₹${totalRevenue.toLocaleString()}`}
              subtitle="Confirmed & delivered"
              icon="cash"
              color="#10B981"
              onPress={() => router.push("/(authenticated)/caterer/payments")}
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/menu-add")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="add-circle" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Add Menu Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/orders")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="list" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/customer-add")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="person-add" size={28} color="#10B981" />
            </View>
            <Text style={styles.actionText}>Add Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/payments")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FAF5FF" }]}>
              <Ionicons name="cash" size={28} color="#8B5CF6" />
            </View>
            <Text style={styles.actionText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/payment-qr")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="qr-code" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.actionText}>Payment QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/apartments")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="business" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Apartments</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity
            onPress={() => router.push("/(authenticated)/caterer/orders")}
          >
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Orders from customers will appear here
            </Text>
          </View>
        ) : (
          recentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  businessName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statHalf: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
