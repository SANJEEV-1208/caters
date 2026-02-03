import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { createCatererCuisine, deleteCatererCuisine } from "@/src/api/foodApi";

interface CuisineItem {
  id: number;
  name: string;
  image?: string;
}

interface CuisineSelectorProps {
  cuisines: CuisineItem[];
  selectedCuisine: string;
  onSelectCuisine: (cuisine: string) => void;
  onCuisinesUpdated: (cuisines: CuisineItem[]) => void;
  catererId: number;
  disabled?: boolean;
}

export const CuisineSelector: React.FC<CuisineSelectorProps> = ({
  cuisines,
  selectedCuisine,
  onSelectCuisine,
  onCuisinesUpdated,
  catererId,
  disabled = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCuisineName, setNewCuisineName] = useState("");
  const [newCuisineImage, setNewCuisineImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCuisine = async () => {
    if (!newCuisineName.trim()) {
      Alert.alert("Error", "Please enter a cuisine name");
      return;
    }

    if (!newCuisineImage.trim()) {
      Alert.alert("Error", "Please upload a cuisine image");
      return;
    }

    try {
      setLoading(true);
      const newCuisine = await createCatererCuisine(
        catererId,
        newCuisineName.trim(),
        newCuisineImage.trim()
      );
      onCuisinesUpdated([...cuisines, newCuisine]);
      setNewCuisineName("");
      setNewCuisineImage("");
      setShowAddModal(false);
      Alert.alert("Success", "Cuisine added successfully");
    } catch (error) {
      console.error("Failed to add cuisine:", error);
      Alert.alert(
        "Error",
        `Failed to add cuisine: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCuisine = (cuisineId: number, cuisineName: string) => {
    Alert.alert(
      "Delete Cuisine",
      `Are you sure you want to delete "${cuisineName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCatererCuisine(cuisineId);
              const updatedCuisines = cuisines.filter((c) => c.id !== cuisineId);
              onCuisinesUpdated(updatedCuisines);
              // If deleted cuisine was selected, select first available
              if (selectedCuisine === cuisineName && updatedCuisines.length > 0) {
                onSelectCuisine(updatedCuisines[0].name);
              }
              Alert.alert("Success", "Cuisine deleted successfully");
            } catch (error) {
              console.error("Failed to delete cuisine:", error);
              Alert.alert("Error", "Failed to delete cuisine");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewCuisineName("");
    setNewCuisineImage("");
  };

  return (
    <>
      <View style={styles.field}>
        <View style={styles.cuisineHeader}>
          <Text style={styles.label}>Cuisine *</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => { setShowAddModal(true); }}
            disabled={disabled}
          >
            <Ionicons name="add-circle" size={20} color="#10B981" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color="#10B981" size="small" />
        ) : (
          <>
            {cuisines.length > 0 ? (
              <View style={styles.chipGroup}>
                {cuisines.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine.id}
                    style={[
                      styles.chip,
                      selectedCuisine === cuisine.name && styles.chipActive,
                    ]}
                    onPress={() => { onSelectCuisine(cuisine.name); }}
                    onLongPress={() => {
                      handleDeleteCuisine(cuisine.id, cuisine.name);
                    }}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCuisine === cuisine.name && styles.chipTextActive,
                      ]}
                    >
                      {cuisine.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={24} color="#9CA3AF" />
                <Text style={styles.emptyText}>No cuisines added yet</Text>
                <Text style={styles.emptySubtext}>Tap the Add button to create one</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Add Cuisine Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <KeyboardAvoidingView
            behavior="position"
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={-100}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => { e.stopPropagation(); }}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="restaurant" size={24} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Add New Cuisine</Text>
                    <Text style={styles.modalSubtitle}>Create a new cuisine category</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalDivider} />

              {/* Cuisine Name Input */}
              <View style={styles.modalInputContainer}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="text-outline" size={18} color="#10B981" />
                  <Text style={styles.inputLabel}>Cuisine Name</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="fast-food-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g., Shawarma, Biryani, Pasta"
                    value={newCuisineName}
                    onChangeText={setNewCuisineName}
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Cuisine Image Upload */}
              <View style={styles.cuisineImageUpload}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="image-outline" size={18} color="#10B981" />
                  <Text style={styles.inputLabel}>Cuisine Image</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={styles.imagePickerCard}>
                  <CloudinaryImagePicker
                    label=""
                    onImageUploaded={(url) => { setNewCuisineImage(url); }}
                    currentImage={newCuisineImage}
                    disabled={loading}
                  />
                </View>
              </View>

              {/* Info Card */}
              <View style={styles.modalInfoCard}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.modalInfoText}>
                  This cuisine will be available for all your menu items
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={closeModal}>
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalAddButton, loading && styles.modalAddButtonDisabled]}
                  onPress={() => { void handleAddCuisine(); }}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.modalAddButtonText}>Add Cuisine</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  cuisineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9CA3AF",
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 24,
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    paddingVertical: 10,
    fontWeight: "500",
  },
  imagePickerCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  modalInfoText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1E40AF",
    flex: 1,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
  modalAddButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalAddButtonDisabled: {
    opacity: 0.6,
  },
  modalAddButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cuisineImageUpload: {
    marginBottom: 24,
  },
});
