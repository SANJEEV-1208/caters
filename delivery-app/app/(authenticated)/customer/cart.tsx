import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import PaymentBottomSheet from "@/src/components/PaymentBottomSheet";
import { saveOrder, getOrders } from "@/src/utils/orderStorage";
import { createOrder } from "@/src/api/orderApi";
import { Order } from "@/src/types/order";
import { getUserById } from "@/src/api/authApi";
import { User } from "@/src/types/auth";
import { getMenuItemsByDate } from "@/src/api/catererMenuApi";

export default function Cart() {
  const { cart, totalAmount, addToCart, removeFromCart, removeMultipleItems, reorderItems, clearCart } = useCart();
  const { user, selectedCatererId, selectedDeliveryDate } = useAuth();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [caterer, setCaterer] = useState<User | null>(null);
  const [validatingCart, setValidatingCart] = useState(false);

  // --- Fetch caterer details ---
  useEffect(() => {
    const fetchCaterer = async () => {
      if (selectedCatererId) {
        const catererData = await getUserById(selectedCatererId);
        setCaterer(catererData);
      }
    };
    fetchCaterer();
  }, [selectedCatererId]);

  // --- Validate cart items for selected delivery date ---
  useEffect(() => {
    const validateCartItems = async () => {
      // Skip validation if no cart items, caterer, or delivery date
      if (cart.length === 0 || !selectedCatererId || !selectedDeliveryDate || orderId) {
        return;
      }

      try {
        setValidatingCart(true);

        // Fetch available menu items for the selected delivery date
        const availableItems = await getMenuItemsByDate(selectedCatererId, selectedDeliveryDate);
        const availableItemIds = new Set(availableItems.map(item => item.id));

        // Find items in cart that are not available on selected date
        const unavailableItems = cart.filter(item => !availableItemIds.has(item.id));

        // Remove unavailable items from cart
        if (unavailableItems.length > 0) {
          const unavailableIds = unavailableItems.map(item => item.id);
          removeMultipleItems(unavailableIds);

          // Show alert about removed items
          Alert.alert(
            "Items Removed",
            `${unavailableItems.length} item(s) in your cart are not available for the selected date and have been removed.`,
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Failed to validate cart items:", error);
      } finally {
        setValidatingCart(false);
      }
    };

    validateCartItems();
  }, [selectedDeliveryDate, selectedCatererId]);

  // --- Handle Re-Order from previous order ---
  useEffect(() => {
    const loadPreviousOrder = async () => {
      if (orderId && typeof orderId === "string") {
        const orders = await getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order && order.catererId) {
          // Get today's date as the default delivery date
          const today = new Date().toISOString().split('T')[0];

          try {
            // Fetch available menu items for today from this caterer
            const availableItems = await getMenuItemsByDate(order.catererId, today);

            // Create a map of available item IDs for quick lookup
            const availableItemIds = new Set(availableItems.map(item => item.id));

            // Filter order items - only add items that are available today
            const availableOrderItems = order.items.filter(item =>
              availableItemIds.has(item.id)
            );

            const unavailableItems = order.items.filter(item =>
              !availableItemIds.has(item.id)
            );

            clearCart();

            if (availableOrderItems.length > 0) {
              reorderItems(availableOrderItems);
            }

            // Show alert about availability
            if (unavailableItems.length > 0 && availableOrderItems.length > 0) {
              Alert.alert(
                "Some Items Unavailable",
                `${unavailableItems.length} item(s) from your previous order are not available today and were not added to cart.`,
                [{ text: "OK" }]
              );
            } else if (unavailableItems.length > 0 && availableOrderItems.length === 0) {
              Alert.alert(
                "Items Not Available",
                "None of the items from your previous order are available today. Please browse the current menu.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } else {
              Alert.alert(
                "Success",
                "All items from your previous order have been added to cart!",
                [{ text: "OK" }]
              );
            }
          } catch (error) {
            console.error("Failed to validate menu items:", error);
            Alert.alert(
              "Error",
              "Unable to verify item availability. Please browse the menu instead.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          }
        }
      }
    };
    loadPreviousOrder();
  }, [orderId]);

  // --- Handle new order confirmation ---
  const handleConfirmOrder = async (paymentMethod: 'upi' | 'cod', transactionId?: string, deliveryDate?: string) => {
    setShowPaymentModal(false);

    if (!user?.id || !selectedCatererId) {
      Alert.alert("Error", "Missing user or caterer information");
      return;
    }

    const newOrderId = `ORD-${Date.now()}`;

    const order: Order = {
      orderId: newOrderId,
      customerId: user.id,
      catererId: selectedCatererId,
      items: cart,
      totalAmount,
      paymentMethod,
      transactionId: transactionId || 'N/A',
      itemCount: cart.length,
      orderDate: new Date().toISOString(),
      deliveryDate: deliveryDate || selectedDeliveryDate || new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    try {
      // Save to backend database
      await createOrder(order);

      // Also save to AsyncStorage for offline access
      await saveOrder(order);

      // Clear cart after successful order
      clearCart();

      // Navigate to order confirmation
      router.push({
        pathname: '/(authenticated)/customer/orderconfirm',
        params: {
          orderTotal: totalAmount.toString(),
          paymentMethod,
          itemCount: cart.length.toString(),
          orderId: newOrderId,
          transactionId: transactionId || 'N/A',
        },
      });
    } catch (err) {
      console.error("Failed to create order:", err);
      Alert.alert("Error", "Failed to place order. Please try again.");
    }
  };

  // Format delivery date for display
  const formatDeliveryDate = () => {
    if (!selectedDeliveryDate) return "Today";

    const date = new Date(selectedDeliveryDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>{cart.length} items</Text>
        </View>
        {selectedDeliveryDate && (
          <View style={styles.deliveryDateBadge}>
            <Ionicons name="calendar-outline" size={16} color="#10B981" />
            <Text style={styles.deliveryDateText}>{formatDeliveryDate()}</Text>
          </View>
        )}
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText1}>Item</Text>
        <Text style={styles.tableHeaderText2}>Quantity</Text>
        <Text style={styles.tableHeaderText3}>Price</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id?.toString() || item.name}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              {/* Food Name */}
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
                <Text style={styles.unitPrice}>₹{item.price} each</Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.qtyContainer}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)} activeOpacity={0.7}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <View style={styles.qtyValueContainer}>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                </View>

                <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)} activeOpacity={0.7}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Item Total */}
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{item.price * item.quantity}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add items to get started</Text>
          </View>
        }
        contentContainerStyle={cart.length === 0 && styles.emptyList}
      />

      {/* Footer */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{totalAmount}</Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, cart.length === 0 && styles.payButtonDisabled]}
            disabled={cart.length === 0}
            activeOpacity={0.8}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.payButtonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      <PaymentBottomSheet
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={totalAmount}
        onConfirmOrder={handleConfirmOrder}
        catererQrCode={caterer?.paymentQrCode}
        catererName={caterer?.serviceName || caterer?.name}
      />
    </View>
  );
}

// --- styles remain same ---

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

    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 4,
    },

    headerSubtitle: {
      fontSize: 14,
      color: "#6B7280",
      fontWeight: "500",
    },

    deliveryDateBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E6F4F0",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },

    deliveryDateText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#10B981",
    },

    tableHeader: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#E8ECF1",
    },

    tableHeaderText1: {
      flex: 2,
      fontSize: 12,
      fontWeight: "600",
      color: "#6B7280",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    tableHeaderText2: {
      flex: 1.5,
      fontSize: 12,
      fontWeight: "600",
      color: "#6B7280",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textAlign: "center",
    },

    tableHeaderText3: {
      flex: 1,
      fontSize: 12,
      fontWeight: "600",
      color: "#6B7280",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textAlign: "right",
    },

    card: {
      backgroundColor: "#fff",
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },

    nameContainer: {
      flex: 2,
      paddingRight: 12,
    },

    name: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1A1A1A",
      marginBottom: 4,
    },

    unitPrice: {
      fontSize: 12,
      color: "#6B7280",
      fontWeight: "500",
    },

    qtyContainer: {
      flex: 1.5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    qtyBtnText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#374151",
    },

    qtyValueContainer: {
      minWidth: 32,
      alignItems: "center",
    },

    qtyValue: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1A1A1A",
    },

    priceContainer: {
      flex: 1,
      alignItems: "flex-end",
    },

    price: {
      fontSize: 18,
      fontWeight: "700",
      color: "#10B981",
    },

    emptyList: {
      flexGrow: 1,
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },

    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },

    emptyText: {
      fontSize: 20,
      fontWeight: "600",
      color: "#1A1A1A",
      marginBottom: 8,
    },

    emptySubtext: {
      fontSize: 14,
      color: "#6B7280",
    },

    footer: {
      backgroundColor: "#fff",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: "#E8ECF1",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 8,
    },

    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },

    totalLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#6B7280",
    },

    totalAmount: {
      fontSize: 28,
      fontWeight: "700",
      color: "#1A1A1A",
    },

    payButton: {
      backgroundColor: "#10B981",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    payButtonDisabled: {
      backgroundColor: "#D1D5DB",
      shadowOpacity: 0,
    },

    payButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
      letterSpacing: 0.5,
    },
  });