import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createOrder } from "@/src/api/orderApi";
import { loginUser, createCustomer, getUserById } from "@/src/api/authApi";
import { Order } from "@/src/types/order";
import { getCurrentTimestampIST, getTodayIST } from "@/src/utils/dateUtils";
import QrCodePaymentModal from "@/src/components/QrCodePaymentModal";

export default function RestaurantCheckout() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const catererId = Number(params?.catererId || 0);
  const tableNumber = params?.tableNumber || "";
  const restaurantName = (params?.restaurantName as string) || "";
  const cartData = JSON.parse((params?.cartData as string) || "[]");
  const totalAmount = Number(params?.totalAmount || 0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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
    // Validation
    if (!customerName.trim()) {
      Alert.alert("Name Required", "Please enter your name");
      return;
    }

    if (!customerPhone.trim() || customerPhone.length !== 10) {
      Alert.alert("Phone Required", "Please enter a valid 10-digit phone number");
      return;
    }

    if (paymentMethod === "upi" && !transactionId.trim()) {
      Alert.alert("Transaction ID Required", "Please complete the UPI payment and enter transaction ID");
      return;
    }

    try {
      setLoading(true);

      const fullPhone = `+91${customerPhone}`;
      console.log('=== Restaurant Checkout ===');
      console.log('Customer Name:', customerName);
      console.log('Customer Phone:', fullPhone);
      console.log('Payment Method:', paymentMethod);
      console.log('Transaction ID:', transactionId || 'WALK-IN');

      // Step 1: Check if customer exists, if not create one
      let customer = await loginUser(fullPhone);

      if (!customer) {
        console.log('Customer not found, creating new customer account...');
        // Create new customer account
        customer = await createCustomer({
          name: customerName,
          phone: fullPhone,
        });
        console.log('✅ Created new customer:', customer);
      } else {
        console.log('✅ Found existing customer:', customer);
      }

      if (!customer?.id || customer.id === 0) {
        throw new Error('Failed to create or find customer account');
      }

      // Step 2: Create order with valid customer ID
      const orderId = `ORD-${Date.now()}`;

      const order: Order = {
        orderId,
        customerId: customer.id,
        catererId,
        items: cartData,
        totalAmount,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === "upi" ? transactionId : "WALK-IN",
        deliveryAddress: `${restaurantName} - Table ${tableNumber}`,
        tableNumber: Number(tableNumber),
        itemCount: cartData.reduce((sum: number, item: unknown) => sum + (item.quantity || 1), 0),
        orderDate: getCurrentTimestampIST(),
        deliveryDate: getTodayIST(),
        status: "pending",
      };

      console.log('Creating order:', JSON.stringify(order, null, 2));

      // Create order in backend
      const createdOrder = await createOrder(order);
      console.log('✅ Order created successfully:', createdOrder);

      const paymentMessage = paymentMethod === "upi"
        ? `Payment Method: UPI\nTransaction ID: ${transactionId}`
        : "Payment Method: Cash on Delivery\nPlease pay at the counter.";

      Alert.alert(
        "Order Placed!",
        `Your order has been placed successfully.\n\nOrder ID: ${orderId}\nTable: ${tableNumber}\n\n${paymentMessage}`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Order placement error:", error);
      Alert.alert("Error", "Failed to place order. Please try again or call the waiter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => { router.back(); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Order</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Restaurant Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="restaurant" size={28} color="#FF6B35" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.restaurantLabel}>Dining at</Text>
              <Text style={styles.restaurantName}>{restaurantName}</Text>
              <View style={styles.tableChip}>
                <Ionicons name="location" size={14} color="#FF6B35" />
                <Text style={styles.tableText}>Table {tableNumber}</Text>
              </View>
            </View>
          </View>

          {/* Customer Info Form */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Your Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+91</Text>
                </View>
                <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.phoneIcon} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9876543210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "upi" && styles.paymentOptionActive,
                ]}
                onPress={() => { handlePaymentMethodSelect("upi"); }}
              >
                <View style={styles.paymentOptionContent}>
                  <Ionicons
                    name="qr-code"
                    size={28}
                    color={paymentMethod === "upi" ? "#8B5CF6" : "#94A3B8"}
                  />
                  <View style={styles.paymentOptionText}>
                    <Text
                      style={[
                        styles.paymentOptionTitle,
                        paymentMethod === "upi" && styles.paymentOptionTitleActive,
                      ]}
                    >
                      UPI Payment
                    </Text>
                    <Text style={styles.paymentOptionSubtitle}>
                      Pay via GPay/PhonePe/Paytm
                    </Text>
                  </View>
                </View>
                {paymentMethod === "upi" && (
                  <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "cod" && styles.paymentOptionActive,
                ]}
                onPress={() => { handlePaymentMethodSelect("cod"); }}
              >
                <View style={styles.paymentOptionContent}>
                  <Ionicons
                    name="cash"
                    size={28}
                    color={paymentMethod === "cod" ? "#22C55E" : "#94A3B8"}
                  />
                  <View style={styles.paymentOptionText}>
                    <Text
                      style={[
                        styles.paymentOptionTitle,
                        paymentMethod === "cod" && styles.paymentOptionTitleActive,
                      ]}
                    >
                      Cash on Delivery
                    </Text>
                    <Text style={styles.paymentOptionSubtitle}>
                      Pay at the counter
                    </Text>
                  </View>
                </View>
                {paymentMethod === "cod" && (
                  <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                )}
              </TouchableOpacity>
            </View>

            {/* Show transaction ID if UPI was used */}
            {paymentMethod === "upi" && transactionId && (
              <View style={styles.transactionInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.transactionText}>
                  Transaction ID: {transactionId}
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>

            <View style={styles.itemsList}>
              {cartData.map((item: unknown) => (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.itemLeft}>
                    <View style={[
                      styles.vegIndicator,
                      { borderColor: item.category === "veg" ? "#22C55E" : "#EF4444" }
                    ]}>
                      <View style={[
                        styles.vegDot,
                        { backgroundColor: item.category === "veg" ? "#22C55E" : "#EF4444" }
                      ]} />
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
            </View>

            <View style={styles.billDivider} />

            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Bill</Text>
                <View style={styles.totalPriceBox}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.totalAmount}>{totalAmount}</Text>
                </View>
              </View>

              <View style={styles.paymentBadge}>
                <Ionicons name="cash" size={18} color="#22C55E" />
                <Text style={styles.paymentText}>Pay at Counter</Text>
              </View>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.infoText}>
              Your order will be sent to the kitchen immediately. Please collect your bill and pay at the counter after your meal.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={() => { void handlePlaceOrder(); }}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.placeOrderButtonText}>Confirm Order</Text>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={18} color="#22C55E" />
              </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 48,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF4ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  restaurantLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  tableChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4ED",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  tableText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6B35",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
  },
  phonePrefix: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#E2E8F0",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  phoneIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },
  itemsList: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vegIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  billDivider: {
    height: 2,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  totalContainer: {
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#475569",
  },
  totalPriceBox: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 4,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#22C55E",
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  infoIconWrapper: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3B82F6",
    lineHeight: 19,
    fontWeight: "500",
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  placeOrderButton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0.1,
  },
  placeOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
  },
  paymentOptionActive: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  paymentOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 2,
  },
  paymentOptionTitleActive: {
    color: "#1E293B",
  },
  paymentOptionSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  transactionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22C55E",
    flex: 1,
  },
});
