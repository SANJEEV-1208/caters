import React, { useState } from "react";
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
import { createApartment } from "@/src/api/apartmentApi";
import LocationAutocomplete from "@/src/components/LocationAutocomplete";

export default function ApartmentAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    accessCode: "",
  });

  const [useCustomCode, setUseCustomCode] = useState(false);

  const generateAccessCode = () => {
    // Generate 6-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = () => {
    const newCode = generateAccessCode();
    setFormData({ ...formData, accessCode: newCode });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter apartment name");
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Please enter apartment address");
      return;
    }

    const finalAccessCode = useCustomCode
      ? formData.accessCode.trim()
      : formData.accessCode || generateAccessCode();

    if (!finalAccessCode) {
      Alert.alert("Error", "Please generate or enter an access code");
      return;
    }

    if (finalAccessCode.length < 4) {
      Alert.alert("Error", "Access code must be at least 4 characters");
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    try {
      await createApartment({
        catererId: user.id,
        name: formData.name.trim(),
        address: formData.address.trim(),
        accessCode: finalAccessCode.toUpperCase(),
      });

      Alert.alert(
        "Success",
        `Apartment created successfully!\n\nAccess Code: ${finalAccessCode.toUpperCase()}\n\nShare this code with your customers to join.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Failed to create apartment:", error);
      Alert.alert("Error", "Failed to create apartment");
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>Add Apartment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Create apartments to organize customers by location. Each apartment gets
            a unique access code that customers can use to join.
          </Text>
        </View>

        {/* Apartment Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Apartment Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sunrise Apartments"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Address */}
        <View style={styles.field}>
          <Text style={styles.label}>Address *</Text>
          <LocationAutocomplete
            value={formData.address}
            onSelect={(address) => setFormData({ ...formData, address })}
            placeholder="Enter complete address with landmark"
          />
        </View>

        {/* Access Code Section */}
        <View style={styles.field}>
          <Text style={styles.label}>Access Code *</Text>
          <Text style={styles.hint}>
            Customers will use this code to join the apartment
          </Text>

          {/* Code Type Toggle */}
          <View style={styles.codeTypeToggle}>
            <TouchableOpacity
              style={[
                styles.codeTypeButton,
                !useCustomCode && styles.codeTypeButtonActive,
              ]}
              onPress={() => {
                setUseCustomCode(false);
                setFormData({ ...formData, accessCode: "" });
              }}
            >
              <Ionicons
                name={!useCustomCode ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={!useCustomCode ? "#10B981" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.codeTypeText,
                  !useCustomCode && styles.codeTypeTextActive,
                ]}
              >
                Auto-Generate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.codeTypeButton,
                useCustomCode && styles.codeTypeButtonActive,
              ]}
              onPress={() => setUseCustomCode(true)}
            >
              <Ionicons
                name={useCustomCode ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={useCustomCode ? "#10B981" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.codeTypeText,
                  useCustomCode && styles.codeTypeTextActive,
                ]}
              >
                Custom Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Code Input/Display */}
          {useCustomCode ? (
            <TextInput
              style={styles.input}
              placeholder="Enter custom access code (min 4 chars)"
              value={formData.accessCode}
              onChangeText={(text) =>
                setFormData({ ...formData, accessCode: text.toUpperCase() })
              }
              autoCapitalize="characters"
              maxLength={10}
            />
          ) : (
            <View style={styles.generatedCodeContainer}>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeDisplayText}>
                  {formData.accessCode || "Not generated yet"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateCode}
              >
                <Ionicons name="refresh" size={18} color="#10B981" />
                <Text style={styles.generateButtonText}>
                  {formData.accessCode ? "Regenerate" : "Generate"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preview Card */}
        {(formData.name || formData.address) && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewIconContainer}>
                  <Ionicons name="business" size={24} color="#10B981" />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>
                    {formData.name || "Apartment Name"}
                  </Text>
                  <Text style={styles.previewAddress}>
                    {formData.address || "Apartment Address"}
                  </Text>
                </View>
              </View>
              {formData.accessCode && (
                <View style={styles.previewCodeRow}>
                  <View style={styles.previewCodeBadge}>
                    <Ionicons name="key" size={14} color="#10B981" />
                    <Text style={styles.previewCodeText}>{formData.accessCode}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Create Apartment</Text>
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
  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  codeTypeToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  codeTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
  },
  codeTypeButtonActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  codeTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  codeTypeTextActive: {
    color: "#10B981",
  },
  generatedCodeContainer: {
    gap: 8,
  },
  codeDisplay: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  codeDisplayText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 4,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 12,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
  },
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewHeader: {
    flexDirection: "row",
    gap: 12,
  },
  previewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  previewAddress: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  previewCodeRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  previewCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  previewCodeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 2,
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
