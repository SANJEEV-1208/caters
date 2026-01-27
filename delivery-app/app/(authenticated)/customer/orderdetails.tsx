import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Order } from "@/src/types/order";
import { getOrders } from "@/src/utils/orderStorage";

export default function OrderDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    const orders = await getOrders();
    const foundOrder = orders.find((o) => o.orderId === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return {
      dayName,
      fullDate: `${day} ${month} ${year}`,
      time,
      fullDateTime: `${dayName}, ${day} ${month} ${year} at ${time}`,
    };
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'delivered':
        return '#059669';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'delivered':
        return 'checkmark-done-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  const dateInfo = formatDate(order.orderDate);
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${statusColor}20` }]}>
              <Ionicons name={statusIcon as any} size={32} color={statusColor} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
              <Text style={styles.statusSubtext}>Order #{order.orderId}</Text>
            </View>
          </View>
        </View>

        {/* Date & Time Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Order Date & Time</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateTimeText}>{dateInfo.fullDateTime}</Text>
          </View>
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="fast-food-outline" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Order Items ({order.items.length})</Text>
          </View>

          {order.items.map((item, index) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <View style={styles.itemNameRow}>
                    <View style={[
                      styles.vegIndicator,
                      { backgroundColor: item.category === 'veg' ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
                </View>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
              </View>
              {index < order.items.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Payment Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Payment Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <View style={styles.paymentMethodBadge}>
              <Ionicons
                name={order.paymentMethod === 'upi' ? 'card' : 'cash'}
                size={16}
                color="#10B981"
              />
              <Text style={styles.paymentMethodText}>
                {order.paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
              </Text>
            </View>
          </View>

          {order.transactionId && order.transactionId !== 'N/A' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.transactionId} numberOfLines={1}>
                {order.transactionId}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal</Text>
            <Text style={styles.detailValue}>₹{order.totalAmount}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Fee</Text>
            <Text style={styles.freeText}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Delivery Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Delivery Information</Text>
          </View>

          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.deliveryText}>Estimated Delivery: 30-40 mins</Text>
            </View>
            {order.status === 'delivered' && (
              <View style={styles.deliveryRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.deliveryText}>Delivered Successfully</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF1",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  dateTimeContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  dateTimeText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  vegIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  paymentMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F4F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  transactionId: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#10B981",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  freeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
  },
  deliveryInfo: {
    gap: 12,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  bottomSpacing: {
    height: 24,
  },
});
