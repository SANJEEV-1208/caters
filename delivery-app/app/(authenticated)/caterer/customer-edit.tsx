import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { getUserById } from "@/src/api/authApi";
import { updateCustomerProfile } from "@/src/api/subscriptionApi";
import { getCatererApartments, getCustomerApartmentLink, updateCustomerApartment } from "@/src/api/apartmentApi";
import { showValidationError, showSuccessAlert, showErrorAlert } from "@/src/utils/alertHelpers";
import { HeaderComponent } from "@/src/components/common";
import ApartmentSelector from "@/src/components/caterer/ApartmentSelector";
import LocationAutocomplete from "@/src/components/LocationAutocomplete";

type Apartment = {
  id: number;
  name: string;
  address: string;
};

export default function CustomerEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // Customer data from params
  const customerId = Number(params.customerId);
  const initialName = params.name as string;
  const customerPhone = params.phone as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState(initialName);
  const [customerAddress, setCustomerAddress] = useState("");
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
  const [addDirectly, setAddDirectly] = useState(false);
  const [initialApartmentId, setInitialApartmentId] = useState<number | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load customer details
      const customerData = await getUserById(customerId);
      if (customerData) {
        setCustomerName(customerData.name);
        setCustomerAddress(customerData.address || "");
      }

      // Load apartments
      const apartmentData = await getCatererApartments(user.id);
      setApartments(apartmentData);

      // Load current apartment assignment
      const apartmentLink = await getCustomerApartmentLink(customerId, user.id);
      if (apartmentLink) {
        setSelectedApartmentId(apartmentLink.apartmentId);
        setInitialApartmentId(apartmentLink.apartmentId);
        setAddDirectly(apartmentLink.apartmentId === null);
      } else {
        // No apartment assignment - direct customer
        setAddDirectly(true);
        setSelectedApartmentId(null);
        setInitialApartmentId(null);
      }
    } catch (error) {
      console.error("Failed to load customer data:", error);
      showErrorAlert("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      showValidationError("Customer Name", "Please enter customer name");
      return;
    }

    // Address is mandatory for direct add customers
    if (addDirectly && !customerAddress.trim()) {
      showValidationError("Delivery Address", "Please enter delivery address for direct customers");
      return;
    }

    if (!user?.id) return;

    setSaving(true);
    try {
      // Step 1: Update customer profile (name and address)
      // Only save address if customer is added directly (no apartment)
      await updateCustomerProfile(customerId, {
        name: customerName.trim(),
        address: addDirectly ? customerAddress.trim() : undefined,
      });

      // Step 2: Update apartment assignment if changed
      const newApartmentId = addDirectly ? null : selectedApartmentId;
      if (newApartmentId !== initialApartmentId) {
        await updateCustomerApartment(customerId, user.id, newApartmentId);
      }

      showSuccessAlert(
        "Customer updated successfully!",
        () => router.back()
      );
    } catch (error: unknown) {
      console.error("Failed to update customer:", error);
      showErrorAlert(
        error instanceof Error ? error.message : "Failed to update customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading customer details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
        {/* Header */}
        <HeaderComponent title="Edit Customer" onBackPress={() => router.back()} />

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Customer Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <Text style={styles.sectionHint}>Update customer information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g John Doe"
                  value={customerName}
                  onChangeText={setCustomerName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={[styles.input, styles.inputTextDisabled]}
                  value={customerPhone}
                  editable={false}
                />
              </View>
              <Text style={styles.inputHint}>Phone number cannot be changed</Text>
            </View>
          </View>

          {/* Apartment Selection */}
          <ApartmentSelector
            apartments={apartments}
            selectedApartmentId={selectedApartmentId}
            addDirectly={addDirectly}
            onSelectApartment={(id) => {
              setSelectedApartmentId(id);
              setAddDirectly(false);
              // Clear address when switching to apartment (not needed)
              setCustomerAddress("");
            }}
            onToggleDirectAdd={() => {
              setAddDirectly(!addDirectly);
              setSelectedApartmentId(null);
              if (addDirectly) {
                // Switching from direct to apartment - clear address
                setCustomerAddress("");
              }
            }}
          />

          {/* Address field - Only shown for direct add */}
          {addDirectly && (
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address *</Text>
                <LocationAutocomplete
                  value={customerAddress}
                  onSelect={setCustomerAddress}
                  placeholder="Enter customer delivery address"
                />
                <Text style={styles.inputHint}>
                  Required for direct customers without apartment assignment
                </Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={() => { void handleSave(); }}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
  },
  inputTextDisabled: {
    color: "#9CA3AF",
  },
  inputHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    fontStyle: "italic",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
