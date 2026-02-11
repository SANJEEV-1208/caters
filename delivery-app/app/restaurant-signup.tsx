import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { signupRestaurant } from "@/src/api/authApi";
import { Ionicons } from "@expo/vector-icons";
import LocationAutocomplete from "@/src/components/LocationAutocomplete";

export default function RestaurantSignupScreen() {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPinState] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSignup = async () => {
    // Validate all fields
    if (!restaurantName.trim()) {
      Alert.alert("Required", "Please enter your restaurant name");
      return;
    }
    if (!restaurantAddress.trim()) {
      Alert.alert("Required", "Please enter your restaurant address");
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert("Required", "Please enter owner/manager name");
      return;
    }
    if (phone.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }
    if (!pin.trim()) {
      Alert.alert("Required", "Please create a PIN to secure your account");
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

    setLoading(true);
    const fullPhone = `+91${phone}`;

    try {
      const userData = await signupRestaurant({
        phone: fullPhone,
        name: ownerName.trim(),
        restaurantName: restaurantName.trim(),
        restaurantAddress: restaurantAddress.trim(),
        pin: pin,
      });

      // Add restaurant type info to the user object
      const userWithType = {
        ...userData,
        caterType: "restaurant" as const,
        restaurantName: restaurantName.trim(),
        restaurantAddress: restaurantAddress.trim(),
      };

      // Set user in auth context
      setUser(userWithType);
      
      // Will be redirected to (authenticated) by root layout
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("already exists")) {
        Alert.alert("Already Registered", "This phone number is already registered. Please login to upgrade your account to restaurant.");
      } else {
        Alert.alert("Error", `Registration failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Restaurant Registration</Text>
        <Text style={styles.subtitle}>
          Register your restaurant to start taking orders from table QR codes
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Only registered restaurants can use this service
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., McDonald's Delhi"
            value={restaurantName}
            onChangeText={setRestaurantName}
            editable={!loading}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Address *</Text>
          <LocationAutocomplete
            value={restaurantAddress}
            onSelect={setRestaurantAddress}
            placeholder="Enter complete address including city and zip code"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Owner/Manager Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={ownerName}
            onChangeText={setOwnerName}
            editable={!loading}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.phoneInputWrapper}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="10-digit number"
              value={phone}
              onChangeText={(text) => { setPhone(text.replace(/[^0-9]/g, "").slice(0, 10)); }}
              editable={!loading}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#A0AEC0"
            />
          </View>
          {phone.length > 0 && phone.length < 10 && (
            <Text style={styles.errorText}>
              Phone number must be 10 digits
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Create PIN (4-6 digits) *</Text>
          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter your PIN"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              maxLength={6}
              value={pin}
              onChangeText={setPinState}
              secureTextEntry={!showPin}
              editable={!loading}
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
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm PIN *</Text>
          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="Re-enter your PIN"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              maxLength={6}
              value={confirmPin}
              onChangeText={setConfirmPin}
              secureTextEntry={!showConfirmPin}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPin(!showConfirmPin)}
            >
              <Ionicons
                name={showConfirmPin ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={() => { void handleSignup(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>Register Restaurant</Text>
          )}
        </TouchableOpacity>

        {/* Back Link */}
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pinInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    letterSpacing: 2,
  },
  eyeButton: {
    padding: 4,
  },
  signupButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    fontSize: 14,
    color: "#F59E0B",
    textAlign: "center",
    fontWeight: "600",
  },
});
