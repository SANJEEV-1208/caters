import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { searchUserByPhone, createCustomer } from "@/src/api/authApi";
import { getCatererApartments, addCustomerToApartment } from "@/src/api/apartmentApi";
import { createSubscription } from "@/src/api/subscriptionApi";

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
    loadApartments();
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
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setSearching(true);
    setShowCreateForm(false);
    try {
      // Normalize phone number for search - ensure it has +91 prefix
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^\+?91/, '')}`;

      const result = await searchUserByPhone(normalizedPhone);
      if (result) {
        if (result.role !== "customer") {
          Alert.alert("Error", "This user is not a customer");
          setFoundUser(null);
          setShowCreateForm(false);
        } else {
          setFoundUser(result);
          setShowCreateForm(false);
        }
      } else {
        // User not found - show create form
        setFoundUser(null);
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error("Failed to search user:", error);
      Alert.alert("Error", "Failed to search for user");
    } finally {
      setSearching(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!foundUser || !user?.id) return;

    if (!addDirectly && !selectedApartmentId) {
      Alert.alert("Error", "Please select an apartment or choose direct add");
      return;
    }

    setAdding(true);
    try {
      // Step 1: Create subscription (customer-caterer relationship)
      const subscription = await createSubscription(foundUser.id, user.id);

      const isNewSubscription = !subscription.isExisting;

      // Step 2: Link to apartment if selected
      if (selectedApartmentId || addDirectly) {
        await addCustomerToApartment({
          customerId: foundUser.id,
          apartmentId: selectedApartmentId || null, // null for direct add
          catererId: user.id,
          addedVia: "manual",
        });
      }

      Alert.alert(
        "Success",
        isNewSubscription
          ? `Customer added successfully!\n\n${foundUser.name} can now place orders from your service.`
          : `Customer subscription updated!\n\n${foundUser.name} is already subscribed to your service.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Failed to add customer:", error);
      Alert.alert("Error", "Failed to add customer. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter customer name");
      return;
    }

    if (!addDirectly && !selectedApartmentId) {
      Alert.alert("Error", "Please select an apartment or choose direct add");
      return;
    }

    setAdding(true);
    try {
      // Normalize phone number - ensure it has +91 prefix
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^\+?91/, '')}`;

      // Step 1: Create new customer
      const newCustomer = await createCustomer({
        name: customerName,
        phone: normalizedPhone,
        address: customerAddress,
      });

      // Step 2: Create subscription (customer-caterer relationship)
      await createSubscription(newCustomer.id, user!.id);

      // Step 3: Link to apartment if selected
      if (selectedApartmentId || addDirectly) {
        await addCustomerToApartment({
          customerId: newCustomer.id,
          apartmentId: selectedApartmentId || null,
          catererId: user!.id,
          addedVia: "manual",
        });
      }

      Alert.alert(
        "Success",
        `Customer created successfully!\n\n${newCustomer.name} can now place orders from your service.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Failed to create customer:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create customer. Please try again."
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Customer</Text>
        <View style={{ width: 24 }} />
      </View>

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
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="search" size={20} color="#FFFFFF" />
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Link to Apartment</Text>
              <Text style={styles.sectionHint}>
                Select an apartment or add customer directly
              </Text>

              {apartments.length > 0 ? (
                <>
                  {apartments.map((apt) => (
                    <TouchableOpacity
                      key={apt.id}
                      style={[
                        styles.apartmentOption,
                        selectedApartmentId === apt.id && styles.apartmentOptionActive,
                        addDirectly && styles.apartmentOptionDisabled,
                      ]}
                      onPress={() => {
                        setSelectedApartmentId(apt.id);
                        setAddDirectly(false);
                      }}
                      disabled={addDirectly}
                    >
                      <View style={styles.radioCircle}>
                        {selectedApartmentId === apt.id && !addDirectly && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <View style={styles.apartmentInfo}>
                        <Text style={styles.apartmentName}>{apt.name}</Text>
                        <Text style={styles.apartmentAddress}>{apt.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.divider} />
                </>
              ) : (
                <View style={styles.noApartmentsCard}>
                  <Ionicons name="business-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.noApartmentsText}>No apartments created yet</Text>
                </View>
              )}

              {/* Direct Add Option */}
              <TouchableOpacity
                style={[
                  styles.directOption,
                  addDirectly && styles.directOptionActive,
                ]}
                onPress={() => {
                  setAddDirectly(!addDirectly);
                  setSelectedApartmentId(null);
                }}
              >
                <View style={styles.radioCircle}>
                  {addDirectly && <View style={styles.radioCircleInner} />}
                </View>
                <View style={styles.directInfo}>
                  <Text style={styles.directTitle}>Add Directly (No Apartment)</Text>
                  <Text style={styles.directSubtitle}>
                    Customer will be added without apartment linkage
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={handleCreateCustomer}
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Link to Apartment</Text>
              <Text style={styles.sectionHint}>
                Select an apartment or add customer directly
              </Text>

              {apartments.length > 0 ? (
                <>
                  {apartments.map((apt) => (
                    <TouchableOpacity
                      key={apt.id}
                      style={[
                        styles.apartmentOption,
                        selectedApartmentId === apt.id && styles.apartmentOptionActive,
                        addDirectly && styles.apartmentOptionDisabled,
                      ]}
                      onPress={() => {
                        setSelectedApartmentId(apt.id);
                        setAddDirectly(false);
                      }}
                      disabled={addDirectly}
                    >
                      <View style={styles.radioCircle}>
                        {selectedApartmentId === apt.id && !addDirectly && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <View style={styles.apartmentInfo}>
                        <Text style={styles.apartmentName}>{apt.name}</Text>
                        <Text style={styles.apartmentAddress}>{apt.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.divider} />
                </>
              ) : (
                <View style={styles.noApartmentsCard}>
                  <Ionicons name="business-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.noApartmentsText}>No apartments created yet</Text>
                </View>
              )}

              {/* Direct Add Option */}
              <TouchableOpacity
                style={[
                  styles.directOption,
                  addDirectly && styles.directOptionActive,
                ]}
                onPress={() => {
                  setAddDirectly(!addDirectly);
                  setSelectedApartmentId(null);
                }}
              >
                <View style={styles.radioCircle}>
                  {addDirectly && <View style={styles.radioCircleInner} />}
                </View>
                <View style={styles.directInfo}>
                  <Text style={styles.directTitle}>Add Directly (No Apartment)</Text>
                  <Text style={styles.directSubtitle}>
                    Customer will be added without apartment linkage
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[styles.submitButton, adding && styles.submitButtonDisabled]}
              onPress={handleAddCustomer}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
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
  apartmentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  apartmentOptionActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  apartmentOptionDisabled: {
    opacity: 0.4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  apartmentAddress: {
    fontSize: 12,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  directOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  directOptionActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  directInfo: {
    flex: 1,
  },
  directTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  directSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  noApartmentsCard: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
  },
  noApartmentsText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
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
