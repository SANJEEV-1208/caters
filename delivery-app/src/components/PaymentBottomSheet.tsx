import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import QrCodePaymentModal from './QrCodePaymentModal';

type PaymentMethod = "upi" | "cod";

type PaymentBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmOrder: (paymentMethod: PaymentMethod, transactionId?: string, paymentProofImage?: string) => void;
  catererQrCode?: string;
  catererName?: string;
};

export default function PaymentBottomSheet({
  visible,
  onClose,
  totalAmount,
  onConfirmOrder,
  catererQrCode,
  catererName,
}: PaymentBottomSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [showQrModal, setShowQrModal] = useState(false);

  // Animation values
  const translateY = useSharedValue(500);
  const backdropOpacity = useSharedValue(0);

  // Animate when visibility changes
  useEffect(() => {
    if (visible && !showQrModal) {
      // Show payment method selection
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      // Hide payment method selection (when closed or QR modal is open)
      translateY.value = withSpring(500, {
        damping: 20,
        stiffness: 300,
      });
      backdropOpacity.value = withTiming(0, { duration: 250 });
      // Only reset selection when actually closing, not when QR modal opens
      if (!visible) {
        setSelectedMethod(null);
      }
    }
  }, [visible, showQrModal]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleQrPaymentSuccess = (transactionId: string, paymentProofImage: string) => {
    setShowQrModal(false);
    onClose(); // Close the payment method sheet
    Alert.alert(
      '✅ Payment Confirmed',
      `Transaction ID: ${transactionId}\n\nYour order has been placed!`,
      [
        {
          text: 'OK',
          onPress: () => {
            onConfirmOrder('upi', transactionId, paymentProofImage);
          },
        },
      ]
    );
  };

  const handleQrModalClose = () => {
    setShowQrModal(false);
    // Don't close the payment method sheet - let user try again
  };

  const handleConfirm = () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'upi') {
      // Check if caterer has QR code
      if (!catererQrCode) {
        Alert.alert(
          'UPI Not Available',
          'The caterer has not set up UPI payments yet. Please use Cash on Delivery.',
          [{ text: 'OK' }]
        );
        return;
      }
      // Open QR Code Payment Modal
      setShowQrModal(true);
    } else {
      // Cash on Delivery - direct confirm
      onConfirmOrder(selectedMethod);
    }
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, animatedSheetStyle]}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Payment Method</Text>
          <Text style={styles.headerSubtitle}>Total: ₹{totalAmount}</Text>
        </View>

        {/* Payment Options */}
        <View style={styles.optionsContainer}>
          {/* UPI Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMethod === "upi" && styles.optionCardSelected,
            ]}
            onPress={() => handleSelectMethod("upi")}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>💳</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Pay with UPI</Text>
                  <Text style={styles.optionSubtitle}>Quick & Secure Payment</Text>
                </View>
              </View>
              {selectedMethod === "upi" && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Cash on Delivery Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedMethod === "cod" && styles.optionCardSelected,
            ]}
            onPress={() => handleSelectMethod("cod")}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>💵</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Cash on Delivery</Text>
                  <Text style={styles.optionSubtitle}>Pay when you receive</Text>
                </View>
              </View>
              {selectedMethod === "cod" && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedMethod && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedMethod}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirm Order</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* QR Code Payment Modal */}
      {catererQrCode && (
        <QrCodePaymentModal
          visible={showQrModal}
          onClose={handleQrModalClose}
          qrCodeUrl={catererQrCode}
          amount={totalAmount}
          catererName={catererName || "Caterer"}
          onSuccess={handleQrPaymentSuccess}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  backdropTouchable: {
    flex: 1,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  header: {
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },

  optionsContainer: {
    marginBottom: 24,
  },

  optionCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  optionCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  optionIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },

  optionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },

  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  confirmButton: {
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

  confirmButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
