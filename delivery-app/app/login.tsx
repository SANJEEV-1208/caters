import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter, Redirect, usePathname } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [pin, setPinState] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout, user, isAuthenticated } = useAuth();
  const fullPhone = "+91" + phone;

  // Check for wrong role and show alert (only when user logs in on THIS page)
  useEffect(() => {
    // Only show alert if we're currently on the customer login page
    if (pathname !== "/login") return;

    if (isAuthenticated && user && !loading) {
      if (user.role === "caterer" && user.caterType === "restaurant") {
        Alert.alert(
          "Wrong Login Page",
          "This login is for customers only. Please use the Restaurant Login page.",
          [{ text: "OK", onPress: () => logout() }]
        );
      } else if (user.role === "caterer" && user.caterType === "home") {
        Alert.alert(
          "Wrong Login Page",
          "This login is for customers only. Please use the Caterer Login page.",
          [{ text: "OK", onPress: () => logout() }]
        );
      }
    }
  }, [isAuthenticated, user?.role, user?.caterType, loading, pathname]);

  // 🔹 Redirect if correct role is already logged in
  if (isAuthenticated && user?.role === "customer") {
    return <Redirect href="/(authenticated)/customer/caterer-selection" />;
  }

  const handleLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Number", "Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Starting login with phone:', fullPhone, 'PIN provided:', !!pin);

      const success = await login(fullPhone, pin || undefined);

      if (!success) {
        Alert.alert(
          "Not Registered",
          `Phone number ${fullPhone} not found in database.\n\nTry these test numbers:\n+919876543210\n9003995965\n+919123456789`
        );
      }
      // ✅ Do NOT check `user` here for redirect
      // Redirect happens automatically on next render
    } catch (error: unknown) {
      // Check if user needs to setup PIN
      if (error instanceof Error && error.message === 'PIN_SETUP_REQUIRED') {
        const setupData = (error as unknown as { setupData: { userId: number; phone: string; name: string } }).setupData;
        router.push({
          pathname: "/setup-pin",
          params: {
            userId: String(setupData.userId),
            phone: setupData.phone,
            name: setupData.name,
          }
        });
        return;
      }

      // Show user-friendly error messages
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        Alert.alert(
          "Connection Error",
          "Cannot connect to server. Please ensure:\n\n1. Backend server is running\n2. Phone and computer are on same WiFi\n3. Server IP is correct (192.168.1.33:5000)"
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        Alert.alert("Login Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Customer Login</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>

        {/* Scan Table QR Button - Guest Access Allowed */}
        <Pressable
          style={styles.scanQRCard}
          onPress={() => router.push("/qr-scanner")}
        >
          <View style={styles.scanQRIcon}>
            <Ionicons name="qr-code-outline" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.scanQRContent}>
            <Text style={styles.scanQRTitle}>Dining at a Restaurant?</Text>
            <Text style={styles.scanQRText}>Scan table QR code to order</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#10B981" />
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.prefixContainer}>
              <Text style={styles.prefix}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
          </View>
        </View>

        {/* PIN Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>PIN (4-6 digits)</Text>
          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter your PIN"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={6}
              value={pin}
              onChangeText={setPinState}
              secureTextEntry={!showPin}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPin(!showPin)}
            >
              <Ionicons
                name={showPin ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            First time? Leave PIN empty - you'll set it after login
          </Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={() => { void handleLogin(); }}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerSection}>
          <TouchableOpacity onPress={() => router.push("/caterer-login")}>
            <Text style={styles.continueLink}>Continue as Caterer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/restaurant-login")}>
            <Text style={styles.continueLink}>Continue as Restaurant</Text>
          </TouchableOpacity>
          <Text style={styles.registerText}>Not registered?</Text>
          <TouchableOpacity onPress={() => router.push("/caterer-type-selection")}>
            <Text style={styles.registerLink}>Register as Service Provider</Text>
          </TouchableOpacity>
        </View>
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
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  scanQRCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  scanQRIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  scanQRContent: {
    flex: 1,
  },
  scanQRTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  scanQRText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
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
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 40,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    height: 50,
  },
  prefixContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  prefix: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingHorizontal: 16,
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    height: 50,
    paddingHorizontal: 16,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
    letterSpacing: 2,
  },
  eyeButton: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    fontStyle: "italic",
  },
  loginButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowColor: "#000",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerSection: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    paddingVertical: 10,
  },
  registerLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  continueLink: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
    paddingVertical: 5,
  }
});
