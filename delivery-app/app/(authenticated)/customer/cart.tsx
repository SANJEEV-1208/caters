import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import PaymentBottomSheet from "@/src/components/PaymentBottomSheet";
import { saveOrder, getOrders } from "@/src/utils/orderStorage";
import { createOrder, getCustomerOrders } from "@/src/api/orderApi";
import { Order } from "@/src/types/order";
import { getUserById } from "@/src/api/authApi";
import { User } from "@/src/types/auth";
import { getMenuItemsByDate } from "@/src/api/catererMenuApi";
import { getTodayIST, getTomorrowIST, getCurrentTimestampIST, getISTDate, formatDateIST } from "@/src/utils/dateUtils";

export default function Cart() {
  const { cart, totalAmount, addToCart, removeFromCart, removeMultipleItems, reorderItems, clearCart } = useCart();
  const { user, selectedCatererId, selectedDeliveryDate } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; tableNumber?: string }>();
  const { orderId, tableNumber } = params;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [caterer, setCaterer] = useState<User | null>(null);
  const [validatingCart, setValidatingCart] = useState(false);
  const [isProcessingReorder, setIsProcessingReorder] = useState(false);

  // --- Fetch caterer details ---
  useEffect(() => {
    const fetchCaterer = async () => {
      console.log('🔍 Fetching caterer...');
      console.log('   Cart length:', cart.length);
      console.log('   Cart[0]?.catererId:', cart[0]?.catererId);
      console.log('   selectedCatererId:', selectedCatererId);

      // Get caterer ID - prioritize selectedCatererId, then cart item's catererId (if valid)
      let catererId = selectedCatererId;

      // If no selectedCatererId, try cart item (but skip if it's 0 or undefined)
      if (!catererId && cart.length > 0 && cart[0].catererId && cart[0].catererId > 0) {
        catererId = cart[0].catererId;
      }

      console.log('   ➡️ Using catererId:', catererId);

      if (catererId && catererId > 0) {
        const catererData = await getUserById(catererId);
        console.log('🍽️ Fetched caterer data:', catererData);
        console.log('💳 Payment QR Code:', catererData?.paymentQrCode);
        console.log('💳 QR Code type:', typeof catererData?.paymentQrCode);
        console.log('💳 QR Code length:', catererData?.paymentQrCode?.length);
        setCaterer(catererData);
        console.log('✅ Caterer state updated');
      } else {
        console.log('❌ No valid catererId found - cannot fetch caterer');
        setCaterer(null);
      }
    };
    void fetchCaterer();
  }, [selectedCatererId, cart]);

  // --- Validate cart items on mount (for stale items from previous sessions) ---
  useEffect(() => {
    const validateOnMount = async () => {
      // Skip validation if no cart items or if viewing a previous order
      if (cart.length === 0 || orderId) {
        return;
      }

      // Get caterer ID from cart items
      const catererId = cart[0].catererId;

      if (!catererId) {
        return;
      }

      // Use selectedDeliveryDate if available, otherwise use today's date
      const dateToValidate = selectedDeliveryDate || getTodayIST();

      try {
        setValidatingCart(true);

        // Fetch available menu items for the selected delivery date
        const availableItems = await getMenuItemsByDate(catererId, dateToValidate);
        const availableItemIds = new Set(availableItems.map(item => item.id));

        // Find items in cart that are not available on selected date
        const unavailableItems = cart.filter(item => !availableItemIds.has(item.id));

        // Remove unavailable items from cart
        if (unavailableItems.length > 0) {
          const unavailableIds = unavailableItems.map(item => item.id);
          removeMultipleItems(unavailableIds);

          const dateLabel = dateToValidate === getTodayIST() ? 'today' : formatDeliveryDate();

          // Show alert about removed items
          Alert.alert(
            "Items Removed",
            `${unavailableItems.length} item(s) in your cart are not available for ${dateLabel} and have been removed.`,
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Failed to validate cart items:", error);
      } finally {
        setValidatingCart(false);
      }
    };

    void validateOnMount();
  }, []); // Run only once on mount

  // --- Validate cart items when delivery date changes ---
  useEffect(() => {
    const validateCartItems = async () => {
      // Skip validation if no cart items or if viewing a previous order
      if (cart.length === 0 || orderId || !selectedDeliveryDate) {
        return;
      }

      // Get caterer ID from cart items
      const catererId = cart[0].catererId;

      if (!catererId) {
        return;
      }

      try {
        setValidatingCart(true);

        // Fetch available menu items for the selected delivery date
        const availableItems = await getMenuItemsByDate(catererId, selectedDeliveryDate);
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
            `${unavailableItems.length} item(s) in your cart are not available for ${formatDeliveryDate()} and have been removed.`,
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Failed to validate cart items:", error);
      } finally {
        setValidatingCart(false);
      }
    };

    void validateCartItems();
  }, [selectedDeliveryDate]); // Run when delivery date changes

  // --- Handle Re-Order from previous order ---
  useEffect(() => {
    const loadPreviousOrder = async () => {
      if (orderId && typeof orderId === "string" && !isProcessingReorder) {
        setIsProcessingReorder(true);

        // Fetch from both backend and local storage
        const [backendOrders, localOrders] = await Promise.all([
          user?.id ? getCustomerOrders(user.id).catch(() => []) : Promise.resolve([]),
          getOrders().catch(() => [])
        ]);

        // Merge orders
        const orderMap = new Map();
        backendOrders.forEach(o => orderMap.set(o.orderId, o));
        localOrders.forEach(o => {
          if (!orderMap.has(o.orderId)) orderMap.set(o.orderId, o);
        });

        const allOrders = Array.from(orderMap.values());
        const order = allOrders.find(o => o.orderId === orderId);

        if (order && order.catererId) {
          // Get today's date as the default delivery date (IST)
          const today = getTodayIST();

          try {
            // Fetch available menu items for today from this caterer
            const availableItems = await getMenuItemsByDate(order.catererId, today);

            // Create a map of available item IDs for quick lookup
            const availableItemIds = new Set(availableItems.map(item => item.id));

            // Filter order items - only add items that are available today
            const availableOrderItems = order.items.filter((item: unknown) =>
              availableItemIds.has((item as { id: number }).id)
            );

            const unavailableItems = order.items.filter((item: unknown) =>
              !availableItemIds.has((item as { id: number }).id)
            );

            clearCart();

            if (availableOrderItems.length > 0) {
              reorderItems(availableOrderItems);
              
              // Show success alert
              if (unavailableItems.length > 0) {
                Alert.alert(
                  "Partially Reordered",
                  `${availableOrderItems.length} item(s) added to cart. ${unavailableItems.length} item(s) from your previous order are not available today.`,
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Success",
                  "All items from your previous order have been added to cart!",
                  [{ text: "OK" }]
                );
              }
            } else {
              // NO items available - show alert and go back
              Alert.alert(
                "Cannot Reorder",
                "None of the items from your previous order are available today. Please browse the current menu.",
                [
                  { 
                    text: "OK", 
                    onPress: () => {
                      // Go back to order details or home
                      if (router.canGoBack()) {
                        router.back();
                      } 
                    }
                  }
                ]
              );
            }
          } catch (error) {
            console.error("Failed to validate menu items:", error);
            Alert.alert(
              "Error",
              "Unable to verify item availability. Please browse the menu instead.",
              [
                { 
                  text: "OK", 
                  onPress: () => {
                    if (router.canGoBack()) {
                      router.back();
                    } 
                  }
                }
              ]
            );
          } finally {
            setIsProcessingReorder(false);
          }
        } else {
          setIsProcessingReorder(false);
        }
      }
    };
    void loadPreviousOrder();
  }, [orderId]);

  // --- Handle new order confirmation ---
  const handleConfirmOrder = async (paymentMethod: 'upi' | 'cod', transactionId?: string, paymentProofImage?: string, deliveryDate?: string) => {
    setShowPaymentModal(false);

    // Validate user
    if (!user?.id) {
      Alert.alert("Error", "You are not logged in. Please login again.");
      return;
    }

    // Validate cart
    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty. Please add items before placing an order.");
      return;
    }

    // Determine the actual delivery date to use
    const finalDeliveryDate = deliveryDate || selectedDeliveryDate || getTodayIST();

    // Try multiple sources for caterer ID
    let catererId = null;

    // 1. Try from cart items (most reliable for current session)
    if (cart.length > 0 && cart[0].catererId) {
      catererId = cart[0].catererId;
      console.log("Got catererId from cart items:", catererId);
    }
    // 2. Fallback to selectedCatererId from context
    else if (selectedCatererId) {
      catererId = selectedCatererId;
      console.log("Got catererId from context:", catererId);
    }
    // 3. Last resort - check if caterer is already loaded
    else if (caterer?.id) {
      catererId = caterer.id;
      console.log("Got catererId from loaded caterer:", catererId);
    }

    if (catererId === null || catererId === undefined) {
      Alert.alert(
        "Missing Caterer Information",
        "Please go back to the home screen, select a caterer, and add items to your cart again.",
        [
          {
            text: "Clear Cart & Go Back",
            onPress: () => {
              clearCart();
              router.push("/(authenticated)/customer/caterer-selection");
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    // CRITICAL: Validate that all cart items are available for the selected delivery date
    try {
      const availableItems = await getMenuItemsByDate(catererId, finalDeliveryDate);
      const availableItemIds = new Set(availableItems.map(item => item.id));

      const unavailableItems = cart.filter(item => !availableItemIds.has(item.id));

      if (unavailableItems.length > 0) {
        const unavailableNames = unavailableItems.map(item => item.name).join(', ');

        Alert.alert(
          "Items Not Available",
          `The following items are not available for ${formatDeliveryDate()}: ${unavailableNames}\n\nPlease remove them from your cart or select a different date.`,
          [{ text: "OK" }]
        );

        // Re-open the payment modal so user can modify cart
        setShowPaymentModal(true);
        return;
      }
    } catch (error) {
      console.error("Failed to validate cart items before checkout:", error);
      Alert.alert(
        "Validation Error",
        "Unable to verify item availability. Please try again.",
        [{ text: "OK" }]
      );
      return;
    }

    const newOrderId = `ORD-${Date.now()}`;

    // Check if this is a restaurant order (has tableNumber from params)
    const tableNumberValue = tableNumber ? Number(tableNumber) : undefined;

    const order: Order = {
      orderId: newOrderId,
      customerId: user.id,
      catererId: catererId,
      items: cart,
      totalAmount,
      paymentMethod,
      transactionId: transactionId || 'N/A',
      paymentProofImage: paymentProofImage, // Payment proof screenshot URL
      itemCount: cart.length,
      orderDate: getCurrentTimestampIST(),
      deliveryDate: finalDeliveryDate, // Use validated delivery date
      status: 'pending',
      tableNumber: tableNumberValue, // Add table number if restaurant order
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

  // Format delivery date for display (IST)
  const formatDeliveryDate = () => {
    if (!selectedDeliveryDate) return "Today";

    const todayIST = getTodayIST();
    const tomorrowIST = getTomorrowIST();

    if (selectedDeliveryDate === todayIST) {
      return "Today";
    } else if (selectedDeliveryDate === tomorrowIST) {
      return "Tomorrow";
    } else {
      return formatDateIST(selectedDeliveryDate);
    }
  };

  // If we're processing a reorder and cart is empty (no available items), show a loading state
  if (isProcessingReorder && cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking availability...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              Alert.alert(
                "Navigation Error",
                "Unable to go back. Please try again or use the navigation menu.",
                [{ text: "OK" }]
              );
            }
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
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

      {/* Table Header - Only show if cart has items */}
      {cart.length > 0 && (
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText1}>Item</Text>
          <Text style={styles.tableHeaderText2}>Quantity</Text>
          <Text style={styles.tableHeaderText3}>Price</Text>
        </View>
      )}

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
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/customer/caterer-selection')}
            >
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
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
            onPress={() => {
              console.log('🛒 Opening payment modal...');
              console.log('🍽️ Caterer state:', caterer);
              console.log('💳 Caterer QR Code at modal open:', caterer?.paymentQrCode);
              setShowPaymentModal(true);
            }}
          >
            <Text style={styles.payButtonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      <PaymentBottomSheet
        visible={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); }}
        totalAmount={totalAmount}
        onConfirmOrder={handleConfirmOrder}
        catererQrCode={caterer?.paymentQrCode}
        catererName={caterer?.serviceName || caterer?.name}
      />
    </SafeAreaView>
  );
}

// --- Updated styles with new additions ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF1",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
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
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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