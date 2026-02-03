import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/src/types/order";

type PaymentCardProps = {
  order: Order;
  customerName?: string;
  onPress?: () => void;
  onMarkReceived?: (orderId: number) => void;
};

export default function PaymentCard({ order, customerName, onPress, onMarkReceived }: PaymentCardProps) {
  const isReceived = order.status === "delivered" && order.paymentMethod === "upi";
  const isPending = order.status !== "delivered" || order.paymentMethod === "cod";

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order.orderId}</Text>
            <Text style={styles.customer}>{customerName || 'Customer'}</Text>
          </View>
          <Text style={styles.amount}>₹{order.totalAmount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <View style={styles.row}>
            {order.paymentMethod === 'upi' ? (
              <Ionicons name="card" size={16} color="#3B82F6" />
            ) : (
              <Ionicons name="cash" size={16} color="#F59E0B" />
            )}
            <Text style={styles.method}>{order.paymentMethod.toUpperCase()}</Text>
          </View>

          {order.transactionId && order.transactionId !== "N/A" && (
            <View style={styles.row}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.transactionId} numberOfLines={1}>
                {order.transactionId}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isReceived ? "#10B981" : "#F59E0B" },
              ]}
            >
              <Text style={styles.statusText}>
                {isReceived ? "Received" : "Pending"}
              </Text>
            </View>
            <Text style={styles.date}>
              {new Date(order.orderDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Mark as Received button - only show for pending payments */}
      {isPending && onMarkReceived && order.id && (
        <TouchableOpacity
          style={styles.markReceivedButton}
          onPress={() => { if (order.id) { void onMarkReceived(order.id); } }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.markReceivedText}>Mark as Received</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  customer: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  method: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  transactionId: {
    fontSize: 11,
    color: "#6B7280",
    flex: 1,
    fontFamily: "monospace",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
    flex: 1,
    textAlign: "right",
  },
  markReceivedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  markReceivedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
});
