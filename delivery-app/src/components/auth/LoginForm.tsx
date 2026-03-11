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

interface LoginFormProps {
  readonly title: string;
  readonly subtitle: string;
  readonly expectedRole: "customer" | "caterer";
  readonly expectedCaterType?: "home" | "restaurant";
  readonly signupRoute?: string;
  readonly alternateLoginRoutes?: Array<{ label: string; route: string }>;
  readonly currentPath: string;
}

export default function LoginForm({
  title,
  subtitle,
  expectedRole,
  expectedCaterType,
  signupRoute,
  alternateLoginRoutes,
  currentPath,
}: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout, user, isAuthenticated } = useAuth();
  const fullPhone = "+91" + phone;

  // Check for wrong role and show alert
  useEffect(() => {
    if (pathname !== currentPath) return;

    if (isAuthenticated && user && !loading) {
      let shouldLogout = false;
      let message = "";

      if (expectedRole === "customer" && user.role === "caterer") {
        if (user.caterType === "restaurant") {
          message = "This login is for customers only. Please use the Restaurant Login page.";
          shouldLogout = true;
        } else if (user.caterType === "home") {
          message = "This login is for customers only. Please use the Caterer Login page.";
          shouldLogout = true;
        }
      } else if (expectedRole === "caterer") {
        if (user.role === "customer") {
          message = `This login is for ${expectedCaterType === "restaurant" ? "restaurants" : "caterers"} only. Please use the Customer Login page.`;
          shouldLogout = true;
        } else if (expectedCaterType && user.caterType !== expectedCaterType) {
          const otherType = expectedCaterType === "restaurant" ? "home caterers" : "restaurants";
          message = `This login is for ${expectedCaterType === "restaurant" ? "restaurants" : "home caterers"} only. Please use the ${otherType === "home caterers" ? "Caterer" : "Restaurant"} Login page.`;
          shouldLogout = true;
        }
      }

      if (shouldLogout) {
        showErrorAlert(message, () => logout());
      }
    }
  }, [isAuthenticated, user?.role, user?.caterType, loading, pathname, currentPath, expectedRole, expectedCaterType]);

  const handleLogin = async () => {
    if (!phone || phone.length !== 10) {
      showErrorAlert("Please enter a valid 10-digit phone number");
      return;
    }

    if (!pin || pin.length !== 4) {
      showErrorAlert("Please enter your 4-digit PIN");
      return;
    }

    setLoading(true);

    try {
      const success = await login(fullPhone, pin);
      if (success) {
        // Navigation is handled by the root layout based on role
      } else {
        showErrorAlert("Login failed. Please check your credentials.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "PIN_SETUP_REQUIRED") {
          const setupData = (error as any).setupData;
          router.push({
            pathname: "/setup-pin",
            params: {
              userId: String(setupData.userId),
              phone: setupData.phone,
              name: setupData.name,
            },
          });
        } else {
          showErrorAlert(error.message);
        }
      } else {
        showErrorAlert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.form}>
          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  const numbers = text.replace(/[^0-9]/g, "");
                  setPhone(numbers.slice(0, 10));
                }}
                maxLength={10}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN</Text>
            <View style={styles.pinContainer}>
              <TextInput
                style={styles.pinInput}
                placeholder="Enter 4-digit PIN"
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                value={pin}
                onChangeText={(text) => {
                  const numbers = text.replace(/[^0-9]/g, "");
                  setPin(numbers.slice(0, 4));
                }}
                maxLength={4}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPin ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          {signupRoute && (
            <TouchableOpacity
              onPress={() => router.push(signupRoute)}
              style={styles.signupContainer}
            >
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Alternate Login Routes */}
          {alternateLoginRoutes && alternateLoginRoutes.length > 0 && (
            <View style={styles.alternateContainer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {alternateLoginRoutes.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(route.route)}
                  style={styles.alternateButton}
                >
                  <Text style={styles.alternateButtonText}>{route.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  prefix: {
    fontSize: 16,
    color: "#1A1A1A",
    paddingLeft: 16,
    paddingRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingVertical: 12,
    paddingRight: 16,
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  loginButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#6B7280",
  },
  signupLink: {
    color: "#10B981",
    fontWeight: "600",
  },
  alternateContainer: {
    marginTop: 32,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  },
  alternateButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  alternateButtonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
  },
});
