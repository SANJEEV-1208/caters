import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { showErrorAlert } from "@/src/utils/alertHelpers";

// Helper function to get the correct login route based on user's actual role
const getCorrectLoginRoute = (
  userRole: string,
  userCaterType: string | undefined
): string => {
  if (userRole === "customer") {
    return "/login";
  }
  if (userRole === "caterer") {
    return userCaterType === "restaurant" ? "/restaurant-login" : "/caterer-login";
  }
  return "/login";
};

export default function RestaurantLoginScreen() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout, user, isAuthenticated } = useAuth();
  const fullPhone = "+91" + phone;

  // Check for wrong role and redirect appropriately
  useEffect(() => {
    if (pathname !== "/restaurant-login" || !isAuthenticated || !user) {
      return;
    }

    // This is the restaurant login page - only restaurants should be here
    if (user.role === "customer") {
      const handleWrongRoleLogin = async () => {
        // Logout first before showing alert
        await logout();
        setLoading(false);

        // Show alert with redirect callback (no logout needed, already done)
        showErrorAlert(
          "This login is for restaurants only. Please use the Customer Login page.",
          () => {
            router.replace("/login");
          }
        );
      };

      void handleWrongRoleLogin();
    } else if (user.role === "caterer" && user.caterType === "home") {
      const handleWrongRoleLogin = async () => {
        // Logout first before showing alert
        await logout();
        setLoading(false);

        // Show alert with redirect callback (no logout needed, already done)
        showErrorAlert(
          "This login is for restaurants only. Please use the Caterer Login page.",
          () => {
            router.replace("/caterer-login");
          }
        );
      };

      void handleWrongRoleLogin();
    } else {
      // Role matches (restaurant) - redirect to dashboard
      router.replace("/");
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, user?.caterType, pathname, logout, router]);

  const handleLogin = async () => {
    if (phone?.length !== 10) {
      showErrorAlert("Please enter a valid 10-digit phone number");
      return;
    }

    if (pin && (pin.length < 4 || pin.length > 6)) {
      showErrorAlert("Please enter a valid 4-6 digit PIN");
      return;
    }

    setLoading(true);

    try {
      const success = await login(fullPhone, pin);
      if (success) {
        // Don't redirect yet - let the useEffect check role first
        // The useEffect will handle redirect or show error if wrong role
      } else {
        showErrorAlert("Login failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (error: any) {
      if (error.message === "PIN_SETUP_REQUIRED") {
        const setupData = error.setupData;
        router.push({
          pathname: "/setup-pin",
          params: {
            userId: String(setupData?.userId ?? ""),
            phone: setupData?.phone ?? "",
            name: setupData?.name ?? "",
          },
        });
      } else {
        showErrorAlert(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replaceAll(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handlePinChange = (text: string) => {
    const cleaned = text.replaceAll(/\D/g, "");
    if (cleaned.length <= 6) {
      setPin(cleaned);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Restaurant Login</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Phone Number */}
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="9876543210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
              editable={!loading}
            />
          </View>

          {/* PIN */}
          <Text style={styles.label}>PIN (4-6 digits)</Text>
          <View style={styles.pinInputContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter your PIN"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry={!showPin}
              value={pin}
              onChangeText={handlePinChange}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPin(!showPin)}
            >
              <Ionicons
                name={showPin ? "eye-outline" : "eye-off-outline"}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            First time? Leave PIN empty - you'll set it after login
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Continue as Customer/Caterer */}
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
    padding: 20,
    marginTop: 100,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1A1A1A",
  },
  pinInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  pinInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1A1A1A",
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: -8,
  },
  loginButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  alternateButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  alternateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
});
