import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import LocationAutocomplete from "@/src/components/LocationAutocomplete";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signup } = useAuth();

  const handleSignup = async () => {
    // Validate all fields
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }
    if (!serviceName.trim()) {
      Alert.alert("Required", "Please enter your catering service name");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Required", "Please enter your address");
      return;
    }
    if (phone.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    const fullPhone = `+91${phone}`;

    try {
      const success = await signup({
        name: name.trim(),
        serviceName: serviceName.trim(),
        address: address.trim(),
        phone: fullPhone,
      });

      if (success) {
        // Will be redirected to (authenticated) by root layout
      }
    } catch (error: any) {
      if (error.message === "Phone number already registered") {
        Alert.alert("Already Registered", "This phone number is already registered. Please login instead.");
      } else {
        Alert.alert("Error", "An error occurred during registration. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>Caterer Registration</Text>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Signup only for caterers providing service
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kitchen Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., South Indian Kitchen"
              placeholderTextColor="#999"
              value={serviceName}
              onChangeText={setServiceName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <LocationAutocomplete
              value={address}
              onSelect={setAddress}
              placeholder="Enter your business address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefix}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
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
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 50,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
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
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingHorizontal: 16,
  },
  registerButton: {
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
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowColor: "#000",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    alignItems: "center",
    padding: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
});
