import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/src/types/order";
import { useRouter } from "expo-router";

type OrderCardProps = {
  order: Order;
  customerName?: string;
};

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "#F59E0B";
    case "confirmed":
      return "#3B82F6";
    case "preparing":
      return "#8B5CF6";
    case "out_for_delivery":
      return "#06B6D4";
    case "delivered":
      return "#10B981";
    case "cancelled":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};

const getTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

export default function OrderCard({ order, customerName }: OrderCardProps) {
  const router = useRouter();
  const statusColor = getStatusColor(order.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(authenticated)/caterer/order-details",
          params: { orderId: order.id?.toString() },
        })
      }
    >
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.orderId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{order.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{customerName || 'Customer'}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="bag-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.row}>
          {order.paymentMethod === 'upi' ? (
            <Ionicons name="card-outline" size={16} color="#3B82F6" />
          ) : (
            <Ionicons name="cash-outline" size={16} color="#F59E0B" />
          )}
          <Text style={styles.detailText}>
            {order.paymentMethod.toUpperCase()}
          </Text>
          <Text style={styles.timeAgo}>{getTimeAgo(order.orderDate)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },
});
