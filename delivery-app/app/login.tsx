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
import { loginUser as apiLoginUser } from "@/src/api/authApi";

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

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [pinRequired, setPinRequired] = useState<boolean | null>(null); // null = not checked, true = has PIN, false = first-time
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout, user, isAuthenticated } = useAuth();
  const fullPhone = "+91" + phone;

  // Check for wrong role and redirect appropriately
  useEffect(() => {
    if (pathname !== "/login" || !isAuthenticated || !user) {
      return;
    }

    // This is the customer login page - only customers should be here
    if (user.role === "caterer") {
      const handleWrongRoleLogin = async () => {
        const correctRoute = getCorrectLoginRoute(user.role, user.caterType);
        const loginPageName = user.caterType === "restaurant" ? "Restaurant" : "Caterer";

        // Logout first before showing alert
        await logout();
        setLoading(false);

        // Show alert with redirect callback (no logout needed, already done)
        showErrorAlert(
          `This login is for customers only. Please use the ${loginPageName} Login page.`,
          () => {
            router.replace(correctRoute as any);
          }
        );
      };

      void handleWrongRoleLogin();
    } else {
      // Role matches (customer) - redirect to home dashboard
      router.replace("/");
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, user?.caterType, pathname, logout, router]);

  // Check if user needs PIN setup by attempting API call with phone only
  const checkUserStatus = async (phoneNumber: string) => {
    if (phoneNumber.length !== 10) return;

    setCheckingUser(true);
    setPinRequired(null);

    try {
      const testPhone = "+91" + phoneNumber;
      // Make direct API call with phone only (no PIN) to check user status
      const response = await apiLoginUser(testPhone, undefined);

      if (response && 'requiresPinSetup' in response && response.requiresPinSetup) {
        // First-time user - needs PIN setup
        setPinRequired(false);
      } else if (response) {
        // Somehow got authenticated without PIN - shouldn't happen, but treat as returning user
        setPinRequired(true);
      }
    } catch (error: any) {
      if (error.message?.includes("PIN is required")) {
        // Returning user - has PIN set
        setPinRequired(true);
      } else if (error.message?.includes("not found")) {
        // User doesn't exist
        setPinRequired(null);
        showErrorAlert("User not found. Please check your phone number.");
      } else {
        // Other errors - assume returning user to be safe
        console.warn("Error checking user status:", error.message);
        setPinRequired(true);
      }
    } finally {
      setCheckingUser(false);
    }
  };

  const handleLogin = async () => {
    if (phone?.length !== 10) {
      showErrorAlert("Please enter a valid 10-digit phone number");
      return;
    }

    // First-time user (no PIN required)
    if (pinRequired === false) {
      setLoading(true);
      try {
        // Pass undefined (not empty string) for first-time users
        await login(fullPhone, undefined);
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
      return;
    }

    // Returning user (PIN required)
    if (pinRequired === true) {
      if (!pin || pin.length < 4 || pin.length > 6) {
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
        showErrorAlert(error.message || "Login failed. Please try again.");
        setLoading(false);
      }
      return;
    }

    // User status not checked yet
    showErrorAlert("Please wait while we check your account status.");
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replaceAll(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhone(cleaned);
      setPinRequired(null); // Reset PIN status when phone changes
      setPin(""); // Clear PIN when phone changes

      // Check user status when 10 digits entered
      if (cleaned.length === 10) {
        void checkUserStatus(cleaned);
      }
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
          <Text style={styles.title}>Customer Login</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        {/* QR Scanner Card */}
        <TouchableOpacity
          style={styles.qrCard}
          onPress={() => router.push("/qr-scanner")}
          activeOpacity={0.8}
        >
          <View style={styles.qrIconContainer}>
            <Ionicons name="qr-code-outline" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.qrTextContainer}>
            <Text style={styles.qrTitle}>Dining at a Restaurant?</Text>
            <Text style={styles.qrSubtitle}>Scan table QR code to order</Text>
          </View>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
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
          <View style={[
            styles.pinInputContainer,
            pinRequired === false && styles.pinInputDisabled
          ]}>
            <TextInput
              style={styles.pinInput}
              placeholder={
                pinRequired === false
                  ? "Not required for first-time login"
                  : pinRequired === true
                  ? "Enter your PIN"
                  : "Checking user status..."
              }
              placeholderTextColor={pinRequired === false ? "#D1D5DB" : "#9CA3AF"}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry={!showPin}
              value={pin}
              onChangeText={handlePinChange}
              editable={!loading && !checkingUser && pinRequired === true}
            />
            {pinRequired === true && (
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
            )}
            {checkingUser && (
              <View style={styles.eyeButton}>
                <ActivityIndicator size="small" color="#10B981" />
              </View>
            )}
          </View>
          <Text style={styles.helperText}>
            {pinRequired === false && "First-time user detected. Click login to set up your PIN."}
            {pinRequired === true && "Enter your PIN to continue"}
            {pinRequired === null && phone.length === 10 && checkingUser && "Checking your account..."}
            {pinRequired === null && phone.length < 10 && "Enter phone number to continue"}
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

          {/* Continue as Caterer/Restaurant */}
          <TouchableOpacity
            style={styles.alternateButton}
            onPress={() => router.push("/caterer-login")}
          >
            <Text style={styles.alternateButtonText}>Continue as Caterer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.alternateButton}
            onPress={() => router.push("/restaurant-login")}
          >
            <Text style={styles.alternateButtonText}>Continue as Restaurant</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Not registered?</Text>
          </View>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/caterer-type-selection")}
          >
            <Text style={styles.registerButtonText}>Register as Service Provider</Text>
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
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  qrCard: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  qrTextContainer: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
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
  pinInputDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    opacity: 0.6,
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
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#10B981",
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
    paddingVertical: 2,
    alignItems: "center",
  },
  alternateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F97316",
  },
  registerContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  registerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  registerButton: {
    alignItems: "center",
    paddingVertical: 2,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
});
