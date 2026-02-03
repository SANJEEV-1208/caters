import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type UpiApp = {
  id: string;
  name: string;
  icon: string;
  package: string;
};

const UPI_APPS: UpiApp[] = [
  { id: 'gpay', name: 'Google Pay', icon: '🔵', package: 'com.google.android.apps.nbu.paisa.user' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', package: 'com.phonepe.app' },
  { id: 'paytm', name: 'Paytm', icon: '🔵', package: 'net.one97.paytm' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🟠', package: 'in.org.npci.upiapp' },
];

type UpiPaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onFailure: (error: string) => void;
};

export default function UpiPaymentModal({
  visible,
  onClose,
  amount,
  onSuccess,
  onFailure,
}: UpiPaymentModalProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'process' | 'verify'>('select');

  // Animation values
  const translateY = useSharedValue(1000);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 300,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
      // Reset state when modal opens
      setStep('select');
      setSelectedApp(null);
      setUpiId('');
      setProcessing(false);
    } else {
      translateY.value = withSpring(1000, {
        damping: 25,
        stiffness: 300,
      });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleAppSelect = (appId: string) => {
    setSelectedApp(appId);
    setStep('process');
    setProcessing(true);

    // Simulate redirecting to UPI app and processing payment
    setTimeout(() => {
      setStep('verify');
    }, 1500);

    // Simulate payment verification
    setTimeout(() => {
      setProcessing(false);
      const mockTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      onSuccess(mockTransactionId);
    }, 3500);
  };

  const handleUpiIdSubmit = () => {
    if (!upiId.trim()) return;

    setStep('process');
    setProcessing(true);

    // Simulate UPI ID verification and payment
    setTimeout(() => {
      setStep('verify');
    }, 1500);

    setTimeout(() => {
      setProcessing(false);
      const mockTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      onSuccess(mockTransactionId);
    }, 3500);
  };

  const handleCancel = () => {
    if (processing) {
      onFailure('Payment cancelled by user');
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={styles.backdropTouchable} onPress={handleCancel} />
      </Animated.View>

      {/* Payment Modal */}
      <Animated.View style={[styles.modal, animatedModalStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Gateway</Text>
            <View style={styles.closeButton} />
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amount}>₹{amount}</Text>
          </View>
          <View style={styles.secureIndicator}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.secureText}>Secured by Razorpay</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Select Payment Method */}
          {step === 'select' && (
            <>
              {/* UPI Apps Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pay Using UPI Apps</Text>
                <View style={styles.appsGrid}>
                  {UPI_APPS.map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      style={styles.appCard}
                      onPress={() => { handleAppSelect(app.id); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.appIcon}>{app.icon}</Text>
                      <Text style={styles.appName}>{app.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Enter UPI ID */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Enter UPI ID</Text>
                <TextInput
                  style={styles.upiInput}
                  placeholder="example@upi"
                  value={upiId}
                  onChangeText={setUpiId}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    !upiId.trim() && styles.payButtonDisabled,
                  ]}
                  onPress={handleUpiIdSubmit}
                  disabled={!upiId.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.payButtonText}>Verify & Pay</Text>
                </TouchableOpacity>
              </View>

              {/* QR Code Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scan QR Code</Text>
                <View style={styles.qrContainer}>
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrIcon}>📱</Text>
                    <Text style={styles.qrText}>Scan with any UPI app</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Processing State */}
          {step === 'process' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.processingTitle}>Opening {selectedApp ? UPI_APPS.find(a => a.id === selectedApp)?.name : 'UPI App'}...</Text>
              <Text style={styles.processingText}>
                Please complete the payment in your UPI app
              </Text>
              <View style={styles.processingSteps}>
                <Text style={styles.stepText}>✓ Redirecting to UPI app</Text>
                <Text style={styles.stepText}>• Verify payment details</Text>
                <Text style={styles.stepText}>• Enter UPI PIN</Text>
              </View>
            </View>
          )}

          {/* Verification State */}
          {step === 'verify' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.processingTitle}>Verifying Payment...</Text>
              <Text style={styles.processingText}>
                Please wait while we confirm your transaction
              </Text>
              <View style={styles.verifyingBox}>
                <Text style={styles.verifyingText}>🔄 Checking with bank...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {step === 'select' && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by <Text style={styles.footerBrand}>Razorpay</Text>
            </Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 9999,
  },

  backdropTouchable: {
    flex: 1,
  },

  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 10000,
  },

  header: {
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  closeIcon: {
    fontSize: 24,
    color: "#6B7280",
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  amountContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },

  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  amount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#10B981",
  },

  secureIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  lockIcon: {
    fontSize: 14,
  },

  secureText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },

  appsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  appCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  appIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  appName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  upiInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 12,
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
    color: "#FFFFFF",
  },

  qrContainer: {
    alignItems: "center",
  },

  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },

  qrIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  qrText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  processingContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },

  processingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 24,
    marginBottom: 8,
  },

  processingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },

  processingSteps: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },

  stepText: {
    fontSize: 14,
    color: "#1A1A1A",
    marginBottom: 8,
    fontWeight: "500",
  },

  verifyingBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#10B981",
  },

  verifyingText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    textAlign: "center",
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  footerBrand: {
    fontWeight: "700",
    color: "#10B981",
  },
});
