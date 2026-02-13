import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { setPin } from "@/src/api/authApi";

export default function SetupPinScreen() {
  const [pin, setLocalPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const userId = Number(params.userId);
  const userName = params.name as string || "there";

  const handleSetPin = async () => {
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Already setting PIN, ignoring duplicate request');
      return;
    }

    // Validation
    if (!pin || !confirmPin) {
      Alert.alert("Error", "Please enter and confirm your PIN");
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      Alert.alert("Invalid PIN", "PIN must be 4-6 digits");
      return;
    }

    if (!/^\d+$/.test(pin)) {
      Alert.alert("Invalid PIN", "PIN must contain only numbers");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("PIN Mismatch", "PINs do not match. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const result = await setPin(userId, pin);

      // Save user to context (includes token)
      await login(result.phone, pin);

      Alert.alert(
        "Success! 🎉",
        "Your PIN has been set successfully. You can now use it to login.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on role
              if (result.role === "customer") {
                router.replace("/(authenticated)/customer/caterer-selection");
              } else if (result.role === "caterer") {
                const dashboardPath = result.caterType === "restaurant"
                  ? "/(authenticated)/caterer/restaurant/dashboard"
                  : "/(authenticated)/caterer/dashboard";
                router.replace(dashboardPath);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Set PIN error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to set PIN. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Icon Header */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={64} color="#10B981" />
          </View>

          {/* Header */}
          <Text style={styles.title}>Welcome, {userName}! 👋</Text>
          <Text style={styles.subtitle}>
            Set your PIN to secure your account
          </Text>
          <Text style={styles.description}>
            You'll use this PIN along with your phone number to login
          </Text>

          {/* PIN Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="keypad" size={18} color="#10B981" />
              <Text style={styles.label}>Create PIN (4-6 digits)</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your PIN"
                value={pin}
                onChangeText={setLocalPin}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry={!showPin}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPin ? "eye-off" : "eye"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm PIN Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.label}>Confirm PIN</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry={!showConfirmPin}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPin(!showConfirmPin)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPin ? "eye-off" : "eye"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Choose a PIN that's easy to remember but hard to guess. Don't use
              obvious numbers like 1234 or your birthdate.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSetPin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Set PIN & Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#D1FAE5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    paddingVertical: 16,
    letterSpacing: 2,
  },
  eyeIcon: {
    padding: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#1E40AF",
    lineHeight: 18,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
