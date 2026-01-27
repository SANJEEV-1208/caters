import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

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
      return <Redirect href="/(authenticated)/caterer/dashboard" />;
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
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your phone number</Text>

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
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.registerLink}>Register as Caterer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
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
