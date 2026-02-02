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
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useState } from "react";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuth(); // get isAuthenticated
  const fullPhone = "+91" + phone;

  // 🔹 Redirect based on role if already logged in
  if (isAuthenticated && user) {
    if (user.role === "customer") {
      return <Redirect href="/(authenticated)/customer/caterer-selection" />;
    } else if (user.role === "caterer") {
      const dashboardPath = user.caterType === "restaurant"
        ? "/(authenticated)/caterer/restaurant/dashboard"
        : "/(authenticated)/caterer/dashboard";
      return <Redirect href={dashboardPath} />;
    }
  }

  const handleLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Number", "Enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);

      const success = await login(fullPhone);

      if (!success) {
        Alert.alert("Not Registered", "Phone number not found.");
      }
      // ✅ Do NOT check `user` here for redirect
      // Redirect happens automatically on next render
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.log("LOGIN ERROR:", error);
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your phone number</Text>

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

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
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
          <Text style={styles.registerText}>Not registered?</Text>
          <TouchableOpacity onPress={() => router.push("/caterer-type-selection")}>
            <Text style={styles.registerLink}>Register as Caterer</Text>
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
  },
  registerLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
});
