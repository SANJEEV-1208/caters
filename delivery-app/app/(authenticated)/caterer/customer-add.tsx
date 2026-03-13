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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { searchUserByPhone, createCustomer } from "@/src/api/authApi";
import { getCatererApartments, addCustomerToApartment } from "@/src/api/apartmentApi";
import { createSubscription, getCustomerSubscriptions } from "@/src/api/subscriptionApi";
import { showValidationError, showSuccessAlert, showErrorAlert, showInfoAlert } from "@/src/utils/alertHelpers";
import { HeaderComponent } from "@/src/components/common";
import ApartmentSelector from "@/src/components/caterer/ApartmentSelector";

type User = {
  id: number;
  phone: string;
  name: string;
  role: string;
};

type Apartment = {
  id: number;
  name: string;
  address: string;
};

export default function CustomerAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
  const [addDirectly, setAddDirectly] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    void loadApartments();
  }, []);

  const loadApartments = async () => {
    if (!user?.id) return;
    try {
      const data = await getCatererApartments(user.id);
      setApartments(data);
    } catch (error) {
      console.error("Failed to load apartments:", error);
    }
  };

  const handleSearch = async () => {
    if (!phone.trim() || phone.length < 10) {
      showValidationError("Phone Number", "Please enter a valid phone number");
      return;
    }

    setSearching(true);
    setShowCreateForm(false);
    setFoundUser(null);

    try {
      // Try multiple phone number formats to find existing customer
      const phoneVariations = [
        phone.startsWith('+91') ? phone : `+91${phone.replace(/^\+?91/, '')}`, // With +91
        phone.replace(/^\+?91/, ''), // Without +91
        phone, // As entered
      ];

      let result = null;

      // Try each phone format
      for (const phoneFormat of phoneVariations) {
        try {
          result = await searchUserByPhone(phoneFormat);
          if (result) break; // Found user, stop searching
        } catch (err) {
          // Continue to next format
          continue;
        }
      }

      if (result) {
        if (result.role === "customer") {
          // Check if customer is already subscribed to this caterer
          try {
            const subscriptions = await getCustomerSubscriptions(result.id);
            const alreadySubscribed = subscriptions.some(sub => sub.catererId === user?.id);

            if (alreadySubscribed) {
              showInfoAlert(
                "Customer Already Exists",
                `${result.name} is already subscribed to your service.`,
                () => {
                  setFoundUser(null);
                  setShowCreateForm(false);
                  setPhone("");
                }
              );
            } else {
              setFoundUser(result);
              setShowCreateForm(false);
            }
          } catch (subError) {
            // If subscription check fails, still show the user (they can add)
            console.error("Failed to check subscription:", subError);
            setFoundUser(result);
            setShowCreateForm(false);
          }
        } else {
          showErrorAlert("This user is not a customer");
          setFoundUser(null);
          setShowCreateForm(false);
        }
      } else {
        // User not found after trying all formats - show create form
        setFoundUser(null);
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error("Failed to search user:", error);
      showErrorAlert("Failed to search for user");
      setFoundUser(null);
      setShowCreateForm(false);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!foundUser || !user?.id) return;

    if (!addDirectly && !selectedApartmentId) {
      showValidationError("Apartment Selection", "Please select an apartment or choose direct add");
      return;
    }

    setAdding(true);
    try {
      // Step 1: Create subscription (customer-caterer relationship)
      const subscription = await createSubscription(foundUser.id, user.id);

      const isNewSubscription = !subscription.isExisting;

      // Step 2: Link to apartment ONLY if an apartment is selected (skip for direct add)
      if (selectedApartmentId) {
        await addCustomerToApartment({
          customerId: foundUser.id,
          apartmentId: selectedApartmentId,
          catererId: user.id,
          addedVia: "manual",
        });
      }

      showInfoAlert(
        "Success",
        isNewSubscription
          ? `Customer added successfully!\n\n${foundUser.name} can now place orders from your service.`
          : `Customer subscription updated!\n\n${foundUser.name} is already subscribed to your service.`,
        () => router.back()
      );
    } catch (error) {
      console.error("Failed to add customer:", error);
      showErrorAlert("Failed to add customer. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      showValidationError("Customer Name", "Please enter customer name");
      return;
    }

    if (!addDirectly && !selectedApartmentId) {
      showValidationError("Apartment Selection", "Please select an apartment or choose direct add");
      return;
    }

    setAdding(true);
    try {
      // Normalize phone number - ensure it has +91 prefix
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^\+?91/, '')}`;

      let customerId: number;

      try {
        // Step 1: Try to create new customer
        const newCustomer = await createCustomer({
          name: customerName,
          phone: normalizedPhone,
          address: customerAddress,
        });
        customerId = newCustomer.id;
      } catch (createError: unknown) {
        // If customer already exists, search for them instead
        if (createError instanceof Error && createError.message.includes("already exists")) {
          console.log("Customer already exists, searching for them...");
          const existingUser = await searchUserByPhone(normalizedPhone);

          if (existingUser && existingUser.role === "customer") {
            customerId = existingUser.id;
            console.log("Found existing customer:", existingUser.name);
          } else {
            throw new Error("Customer already exists but could not be found. Please try searching again.");
          }
        } else {
          throw createError;
        }
      }

      // Step 2: Create subscription (customer-caterer relationship)
      await createSubscription(customerId, user!.id);

      // Step 3: Link to apartment ONLY if an apartment is selected (skip for direct add)
      if (selectedApartmentId) {
        await addCustomerToApartment({
          customerId: customerId,
          apartmentId: selectedApartmentId,
          catererId: user!.id,
          addedVia: "manual",
        });
      }

      showSuccessAlert(
        `Customer added successfully!\n\nThey can now place orders from your service.`,
        () => router.back()
      );
    } catch (error: unknown) {
      console.error("Failed to create customer:", error);
      showErrorAlert(
        error instanceof Error ? error.message : "Failed to create customer. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
        {/* Header */}
        <HeaderComponent title="Add Customer" onBackPress={() => router.back()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Phone Number Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Customer</Text>
          <Text style={styles.sectionHint}>
            Enter phone number (e.g., 9876543210 or +919876543210)
          </Text>

          <View style={styles.searchRow}>
            <View style={styles.phoneInputContainer}>
              <Ionicons name="call" size={20} color="#6B7280" />
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210 or +919876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>
            <TouchableOpacity
              style={[styles.searchButton, searching && styles.searchButtonDisabled]}
              onPress={() => { void handleSearch(); }}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="add" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Create New Customer Form */}
        {showCreateForm && (
          <>
            <View style={styles.section}>
              <View style={styles.createNoticeCard}>
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <View style={styles.createNoticeText}>
                  <Text style={styles.createNoticeTitle}>Customer Not Found</Text>
                  <Text style={styles.createNoticeSubtitle}>
                    Create a new customer account for {phone}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <Text style={styles.sectionHint}>Enter customer information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter customer name"
                    value={customerName}
                    onChangeText={setCustomerName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={[styles.inputContainer, styles.inputDisabled]}>
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    style={[styles.input, styles.inputTextDisabled]}
                    value={phone.startsWith('+91') ? phone : `+91${phone.replace(/^\+?91/, '')}`}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address (Optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter delivery address"
                    value={customerAddress}
                    onChangeText={setCustomerAddress}
                    multiline
                  />
                </View>
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
              }}
              onToggleDirectAdd={() => {
                setAddDirectly(!addDirectly);
                setSelectedApartmentId(null);
              }}
            />

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={() => { void handleCreateCustomer(); }}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#FFFFFF" />
                  <Text style={styles.submitText}>Create Customer</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* User Found */}
        {foundUser && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <View style={styles.userCard}>
                <View style={styles.userIconContainer}>
                  <Ionicons name="person" size={28} color="#10B981" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{foundUser.name}</Text>
                  <Text style={styles.userPhone}>{foundUser.phone}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
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
              }}
              onToggleDirectAdd={() => {
                setAddDirectly(!addDirectly);
                setSelectedApartmentId(null);
              }}
            />

            {/* Add Button */}
            <TouchableOpacity
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={() => { void handleAddCustomer(); }}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#FFFFFF" />
                  <Text style={styles.submitText}>Add Customer</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
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
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  phoneInputContainer: {
    flex: 1,
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
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: "#6B7280",
  },
  verifiedBadge: {
    padding: 4,
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
  createNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  createNoticeText: {
    flex: 1,
  },
  createNoticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  createNoticeSubtitle: {
    fontSize: 13,
    color: "#3B82F6",
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
});
