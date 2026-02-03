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
import { Order } from "@/src/types/order";

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      const ordersData = await getCatererOrders(user.id);
      setOrders(ordersData);
      
      // Calculate stats
      const pending = ordersData.filter(
        (order) => order.status === "pending" || order.status === "confirmed"
      ).length;
      setPendingOrders(pending);
      setTotalOrders(ordersData.length);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const recentOrders = orders.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.restaurantName}>{user?.restaurantName || user?.serviceName || "Restaurant"}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={26} color="#F59E0B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <StatsCard
          title="Pending Orders"
          value={String(pendingOrders)}
          icon="timer"
          color="#F59E0B"
        />
        <StatsCard
          title="Total Orders"
          value={String(totalOrders)}
          icon="receipt"
          color="#10B981"
        />
      </View>

      {/* Quick Actions - 2x2 Grid with Rectangular Cards */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {/* Row 1 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/restaurant/orders")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="receipt" size={28} color="#F59E0B" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>View Orders</Text>
              <Text style={styles.actionSubLabel}>Manage incoming</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/restaurant/menu")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="restaurant" size={28} color="#10B981" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>Manage Menu</Text>
              <Text style={styles.actionSubLabel}>Add & edit items</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/payment-qr")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#DDD6FE" }]}>
              <Ionicons name="qr-code" size={28} color="#6366F1" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>Payment QR</Text>
              <Text style={styles.actionSubLabel}>Setup QR code</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/payments")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FECACA" }]}>
              <Ionicons name="wallet" size={28} color="#EF4444" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>Payments</Text>
              <Text style={styles.actionSubLabel}>View transactions</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 3 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(authenticated)/caterer/restaurant/tables")}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#E0E7FF" }]}>
              <Ionicons name="qr-code-outline" size={28} color="#4F46E5" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>Table QR Codes</Text>
              <Text style={styles.actionSubLabel}>Manage tables</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.actionCard, { opacity: 0 }]} />
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity
            onPress={() => router.push("/(authenticated)/caterer/restaurant/orders")}
          >
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() =>
                router.push({
                  pathname: "/(authenticated)/caterer/restaurant/order-details",
                  params: { orderId: String(order.id) },
                })
              }
            >
              <OrderCard order={order} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Orders from table QR scans will appear here
            </Text>
          </View>
        )}
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#10B981" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Table QR Setup</Text>
          <Text style={styles.infoText}>
            Generate and print QR codes for each table. Customers will scan to view menu and place orders.
          </Text>
        </View>
      </View>

      <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 15,
    color: "#9CA3AF",
    marginBottom: 6,
    fontWeight: "500",
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  actionSubLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  infoBox: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: "#16A34A",
    lineHeight: 16,
  },
  spacer: {
    height: 32,
  },
});
