import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type QrCodePaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  amount: number;
  catererName: string;
  onSuccess: (transactionId: string) => void;
};

export default function QrCodePaymentModal({
  visible,
  onClose,
  qrCodeUrl,
  amount,
  catererName,
  onSuccess,
}: QrCodePaymentModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmPayment = () => {
    if (!transactionId.trim()) {
      Alert.alert("Error", "Please enter the transaction ID from your payment app");
      return;
    }

    setIsConfirming(true);
    // Simulate a brief delay
    setTimeout(() => {
      setIsConfirming(false);
      onSuccess(transactionId.trim());
      setTransactionId(""); // Reset for next time
    }, 500);
  };

  const handleClose = () => {
    setTransactionId("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="qr-code" size={24} color="#10B981" />
              <Text style={styles.headerTitle}>Scan QR to Pay</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Payment Disclaimer */}
            <View style={styles.disclaimerCard}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.disclaimerText}>
                <Text style={styles.disclaimerBold}>Security Notice:</Text> This app does not
                provide payment security. You are making a direct payment to the caterer.
                Please verify the QR code before paying.
              </Text>
            </View>

            {/* Amount to Pay */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>₹{amount}</Text>
              <Text style={styles.catererName}>to {catererName}</Text>
            </View>

            {/* QR Code Display */}
            <View style={styles.qrContainer}>
              <Text style={styles.instructionText}>
                Scan this QR code using any UPI app
              </Text>
              <View style={styles.qrCodeWrapper}>
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.upiAppsRow}>
                <Text style={styles.upiAppsText}>💳 GPay</Text>
                <Text style={styles.upiAppsText}>📱 PhonePe</Text>
                <Text style={styles.upiAppsText}>💰 Paytm</Text>
                <Text style={styles.upiAppsText}>🏦 BHIM</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How to pay:</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>1.</Text>
                <Text style={styles.stepText}>
                  Open your UPI app (GPay, PhonePe, Paytm, etc.)
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>2.</Text>
                <Text style={styles.stepText}>
                  Scan the QR code above and complete the payment of ₹{amount}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>3.</Text>
                <Text style={styles.stepText}>
                  Copy the Transaction ID from your payment app
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>4.</Text>
                <Text style={styles.stepText}>
                  Paste it below and confirm your order
                </Text>
              </View>
            </View>

            {/* Transaction ID Input */}
            <View style={styles.transactionSection}>
              <Text style={styles.transactionLabel}>
                Transaction ID from your payment app *
              </Text>
              <TextInput
                style={styles.transactionInput}
                placeholder="e.g., 123456789012"
                value={transactionId}
                onChangeText={setTransactionId}
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!transactionId.trim() || isConfirming) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmPayment}
              disabled={!transactionId.trim() || isConfirming}
            >
              <Text style={styles.confirmButtonText}>
                {isConfirming ? "Confirming..." : "Confirm Payment & Place Order"}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  disclaimerCard: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 16,
  },
  disclaimerBold: {
    fontWeight: "700",
  },
  amountCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  amountLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 4,
  },
  catererName: {
    fontSize: 14,
    color: "#6B7280",
  },
  qrContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  instructionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  qrCodeWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrCode: {
    width: 220,
    height: 220,
  },
  upiAppsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  upiAppsText: {
    fontSize: 12,
    color: "#6B7280",
  },
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    marginRight: 8,
    width: 20,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  transactionSection: {
    marginBottom: 20,
  },
  transactionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  transactionInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  confirmButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
