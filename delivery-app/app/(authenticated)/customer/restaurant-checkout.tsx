import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { saveOrder } from "@/src/utils/orderStorage";
import { createOrder } from "@/src/api/orderApi";
import { getUserById } from "@/src/api/authApi";
import { Order } from "@/src/types/order";
import QrCodePaymentModal from "@/src/components/QrCodePaymentModal";

export default function RestaurantCheckout() {
  const { cart, totalAmount, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  const catererId = Number(params?.catererId || 0);
  const tableNumber = Number(params?.tableNumber || 0);
  const restaurantName = (params?.restaurantName as string) || "";

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("cod");
  const [showQrModal, setShowQrModal] = useState(false);
  const [catererQrCode, setCatererQrCode] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  // Fetch caterer's payment QR code
  useEffect(() => {
    const fetchCatererQrCode = async () => {
      try {
        const caterer = await getUserById(catererId);
        if (caterer?.paymentQrCode) {
          setCatererQrCode(caterer.paymentQrCode);
        }
      } catch (error) {
        console.error("Failed to fetch caterer QR code:", error);
      }
    };

    if (catererId) {
      void fetchCatererQrCode();
    }
  }, [catererId]);

  const handlePaymentMethodSelect = (method: "upi" | "cod") => {
    setPaymentMethod(method);

    if (method === "upi") {
      if (!catererQrCode) {
        Alert.alert(
          "UPI Not Available",
          "This restaurant doesn't accept UPI payments. Please use Cash on Delivery.",
          [{ text: "OK", onPress: () => { setPaymentMethod("cod"); } }]
        );
        return;
      }
      setShowQrModal(true);
    }
  };

  const handleQrPaymentComplete = (txnId: string, paymentProofImage: string) => {
    setTransactionId(txnId);
    setShowQrModal(false);
  };

  const handlePlaceOrder = async () => {
    console.log('=== handlePlaceOrder called ===');
    console.log('User:', JSON.stringify(user, null, 2));
    console.log('User ID:', user?.id);
    console.log('Caterer ID:', catererId);
    console.log('Table Number:', tableNumber);

    // Better validation with detailed error messages
    if (!user) {
      Alert.alert("Login Required", "Please login to place an order");
      router.push("/login");
      return;
    }

    if (!user.id || user.id === 0) {
      Alert.alert("Error", "Invalid user session. Please logout and login again.");
      return;
    }

    if (!catererId || catererId === 0) {
      Alert.alert("Error", "Invalid restaurant. Please scan the QR code again.");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    if (paymentMethod === "upi" && !transactionId.trim()) {
      Alert.alert("Transaction ID Required", "Please complete the UPI payment and enter transaction ID");
      return;
    }

    setLoading(true);
    try {
      const newOrderId = `ORD-${Date.now()}`;

      const order: Order = {
        orderId: newOrderId,
        customerId: user.id,
        catererId: catererId,
        items: cart,
        totalAmount,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === "upi" ? transactionId : 'WALK-IN',
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        orderDate: new Date().toISOString(),
        deliveryDate: new Date().toISOString().split('T')[0], // Today's date
        status: 'pending',
        tableNumber: tableNumber || undefined,
        deliveryAddress: tableNumber ? `${restaurantName} - Table ${tableNumber}` : undefined,
      };

      console.log('=== Creating restaurant order ===');
      console.log('Order data:', JSON.stringify(order, null, 2));

      // Save to backend
      const createdOrder = await createOrder(order);
      console.log('✅ Order created successfully:', createdOrder);

      // Also save to AsyncStorage for offline access (don't fail if this errors)
      try {
        await saveOrder(order);
        console.log('✅ Order saved to local storage');
      } catch (storageError) {
        console.warn('⚠️ Failed to save to local storage:', storageError);
        // Continue anyway - backend save was successful
      }

      // Clear cart
      clearCart();

      // Show success alert
      Alert.alert("Success", "Order placed successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/(authenticated)/customer/restaurant-order-confirmed",
              params: {
                orderId: newOrderId,
                tableNumber: String(tableNumber),
                restaurantName,
              },
            } as unknown);
          },
        },
      ]);
    } catch (error: unknown) {
      console.error("❌ Order placement error:", error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));

      // More descriptive error message
      const errorMessage = error?.message || "Failed to place order. Please try again.";
      Alert.alert("Error", `Order placement failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.container as unknown}>
        <View style={styles.header as unknown}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle as unknown}>Order Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyState as unknown}>
          <Ionicons name="cart-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyText as unknown}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.backButton as unknown}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText as unknown}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container as unknown}>
      {/* Header */}
      <View style={styles.header as unknown}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle as unknown}>Order Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content as unknown}>
        {/* Restaurant & Table Info */}
        <View style={styles.infoCard as unknown}>
          <Text style={styles.restaurantName as unknown}>{restaurantName}</Text>
          <View style={styles.tableInfo as unknown}>
            <Ionicons name="layers" size={18} color="#F59E0B" />
            <Text style={styles.tableNumber as unknown}>Table {tableNumber}</Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section as unknown}>
          <Text style={styles.sectionTitle as unknown}>Payment Method</Text>

          <View style={styles.paymentOptions as unknown}>
            <TouchableOpacity
              style={[
                styles.paymentOption as unknown,
                paymentMethod === "upi" && (styles.paymentOptionActive as unknown),
              ]}
              onPress={() => { handlePaymentMethodSelect("upi"); }}
            >
              <View style={styles.paymentOptionContent as unknown}>
                <Ionicons
                  name="qr-code"
                  size={24}
                  color={paymentMethod === "upi" ? "#8B5CF6" : "#94A3B8"}
                />
                <View style={styles.paymentOptionText as unknown}>
                  <Text
                    style={[
                      styles.paymentOptionTitle as unknown,
                      paymentMethod === "upi" && (styles.paymentOptionTitleActive as unknown),
                    ]}
                  >
                    UPI Payment
                  </Text>
                  <Text style={styles.paymentOptionSubtitle as unknown}>
                    Pay via GPay/PhonePe/Paytm
                  </Text>
                </View>
              </View>
              {paymentMethod === "upi" && (
                <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption as unknown,
                paymentMethod === "cod" && (styles.paymentOptionActive as unknown),
              ]}
              onPress={() => { handlePaymentMethodSelect("cod"); }}
            >
              <View style={styles.paymentOptionContent as unknown}>
                <Ionicons
                  name="cash"
                  size={24}
                  color={paymentMethod === "cod" ? "#22C55E" : "#94A3B8"}
                />
                <View style={styles.paymentOptionText as unknown}>
                  <Text
                    style={[
                      styles.paymentOptionTitle as unknown,
                      paymentMethod === "cod" && (styles.paymentOptionTitleActive as unknown),
                    ]}
                  >
                    Cash on Delivery
                  </Text>
                  <Text style={styles.paymentOptionSubtitle as unknown}>
                    Pay at the counter
                  </Text>
                </View>
              </View>
              {paymentMethod === "cod" && (
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              )}
            </TouchableOpacity>
          </View>

          {/* Show transaction ID if UPI was used */}
          {paymentMethod === "upi" && transactionId && (
            <View style={styles.transactionInfo as unknown}>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              <Text style={styles.transactionText as unknown}>
                Transaction ID: {transactionId}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section as unknown}>
          <Text style={styles.sectionTitle as unknown}>Order Items</Text>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id?.toString() || item.name}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.itemRow as unknown}>
                <View style={styles.itemDetails as unknown}>
                  <Text style={styles.itemName as unknown}>{item.name}</Text>
                  <Text style={styles.itemQuantity as unknown}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.itemPriceSection as unknown}>
                  <Text style={styles.itemPrice as unknown}>
                    ₹{item.price * item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => { if (item.id) { removeFromCart(item.id); } }}
                    style={styles.removeButton as unknown}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>

        {/* Total */}
        <View style={styles.totalSection as unknown}>
          <Text style={styles.totalLabel as unknown}>Total Amount</Text>
          <Text style={styles.totalAmount as unknown}>₹{totalAmount}</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox as unknown}>
          <Ionicons name="information-circle" size={18} color="#10B981" />
          <Text style={styles.infoText as unknown}>
            Order will be prepared and served at your table
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer as unknown}>
        <TouchableOpacity
          style={[styles.placeOrderButton as unknown, loading && (styles.placeOrderButtonDisabled as unknown)]}
          onPress={() => { void handlePlaceOrder(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code Payment Modal */}
      {catererQrCode && (
        <QrCodePaymentModal
          visible={showQrModal}
          onClose={() => { setShowQrModal(false); }}
          qrCodeUrl={catererQrCode}
          amount={totalAmount}
          catererName={restaurantName}
          onSuccess={handleQrPaymentComplete}
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  tableNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#6B7280",
  },
  itemPriceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    minWidth: 50,
    textAlign: "right",
  },
  removeButton: {
    padding: 6,
  },
  totalSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F59E0B",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 100,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#166534",
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  placeOrderButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  paymentOptions: {
    gap: 10,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
  },
  paymentOptionActive: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  paymentOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 2,
  },
  paymentOptionTitleActive: {
    color: "#1E293B",
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  transactionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22C55E",
    flex: 1,
  },
});
