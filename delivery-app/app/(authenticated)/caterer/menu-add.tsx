import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { createMenuItem } from "@/src/api/catererMenuApi";
import {
  getAllCuisines,
  getCatererCuisines,
  createCatererCuisine,
  deleteCatererCuisine,
} from "@/src/api/foodApi";
import { MenuItem } from "@/src/types/menu";
import ItemHistoryModal from "@/src/components/caterer/ItemHistoryModal";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "main_course"] as const;
type MealType = typeof MEAL_TYPES[number];

export default function MenuAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [catererCuisines, setCatererCuisines] = useState<Array<{ id: number; name: string; image?: string }>>([]);
  const [showAddCuisineModal, setShowAddCuisineModal] = useState(false);
  const [newCuisineName, setNewCuisineName] = useState("");
  const [newCuisineImage, setNewCuisineImage] = useState("");
  const [loadingCuisines, setLoadingCuisines] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "veg" as "veg" | "non-veg",
    cuisine: "Biryani",
    type: "main_course" as MealType,
    image: "",
    inStock: true,
  });

  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  useEffect(() => {
    void loadCatererCuisines();
  }, [user?.id]);

  const loadCatererCuisines = async () => {
    if (!user?.id) return;
    try {
      setLoadingCuisines(true);
      const cuisines = await getCatererCuisines(user.id);
      setCatererCuisines(cuisines || []);
      // Set first cuisine as default if available, otherwise use default
      if (cuisines && cuisines.length > 0 && cuisines[0].name) {
        setFormData(prev => ({ ...prev, cuisine: cuisines[0].name }));
      }
    } catch (error) {
      console.error("Failed to load caterer cuisines:", error);
      // Set empty array on error instead of failing
      setCatererCuisines([]);
    } finally {
      setLoadingCuisines(false);
    }
  };

  const handleAddCuisine = async () => {
    if (!newCuisineName.trim()) {
      Alert.alert("Error", "Please enter a cuisine name");
      return;
    }

    if (!newCuisineImage.trim()) {
      Alert.alert("Error", "Please upload a cuisine image");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    try {
      setLoadingCuisines(true);
      const newCuisine = await createCatererCuisine(user.id, newCuisineName.trim(), newCuisineImage.trim());
      setCatererCuisines([...catererCuisines, newCuisine]);
      setNewCuisineName("");
      setNewCuisineImage("");
      setShowAddCuisineModal(false);
      Alert.alert("Success", "Cuisine added successfully");
    } catch (error) {
      console.error("Failed to add cuisine:", error);
      Alert.alert("Error", `Failed to add cuisine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingCuisines(false);
    }
  };

  const performDeleteCuisine = async (cuisineId: number, cuisineName: string) => {
    try {
      setLoadingCuisines(true);
      await deleteCatererCuisine(cuisineId);
      setCatererCuisines(prev => prev.filter(c => c.id !== cuisineId));
      // If deleted cuisine was selected, select the first available
      if (formData.cuisine === cuisineName && catererCuisines.length > 1) {
        const remaining = catererCuisines.filter(c => c.id !== cuisineId);
        setFormData(prev => ({ ...prev, cuisine: remaining[0].name }));
      }
      Alert.alert("Success", "Cuisine deleted successfully");
    } catch (error) {
      console.error("Failed to delete cuisine:", error);
      Alert.alert("Error", "Failed to delete cuisine");
    } finally {
      setLoadingCuisines(false);
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
          onPress: () => {
            performDeleteCuisine(cuisineId, cuisineName).catch(console.error);
          },
        },
      ]
    );
  };

  const handleSelectHistoryItem = (item: MenuItem) => {
    // Pre-fill the form with selected item's data (except dates)
    setFormData({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      cuisine: item.cuisine,
      type: item.type,
      image: item.image,
      inStock: item.inStock,
    });
    // Reset selected dates so the user can choose new dates
    setSelectedDates([]);
  };

  // Generate next 7 days
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: date.toISOString().split('T')[0],
      });
    }
    return dates;
  };

  const dates = getDates();

  const toggleDate = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter item name");
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      Alert.alert("Error", "Please enter valid price");
      return;
    }
    if (selectedDates.length === 0) {
      Alert.alert("Error", "Please select at least one available date");
      return;
    }
    if (!formData.image.trim()) {
      Alert.alert("Error", "Please enter image URL");
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    try {
      await createMenuItem({
        catererId: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        cuisine: formData.cuisine,
        type: formData.type,
        image: formData.image.trim(),
        availableDates: selectedDates.sort(),
        inStock: formData.inStock,
      });

      Alert.alert("Success", "Menu item added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to add menu item:", error);
      Alert.alert("Error", "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Menu Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Reuse Item Button */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => { setShowHistoryModal(true); }}
        >
          <Ionicons name="time-outline" size={20} color="#10B981" />
          <Text style={styles.historyButtonText}>Reuse Previous Item</Text>
          <Ionicons name="chevron-forward" size={20} color="#10B981" />
        </TouchableOpacity>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chicken Biryani"
            value={formData.name}
            onChangeText={(text) => { setFormData({ ...formData, name: text }); }}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your dish..."
            value={formData.description}
            onChangeText={(text) => { setFormData({ ...formData, description: text }); }}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 180"
            value={formData.price}
            onChangeText={(text) => { setFormData({ ...formData, price: text }); }}
            keyboardType="numeric"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, formData.category === "veg" && styles.radioButtonActive]}
              onPress={() => { setFormData({ ...formData, category: "veg" }); }}
            >
              <View style={[styles.vegDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.radioText, formData.category === "veg" && styles.radioTextActive]}>
                Vegetarian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioButton, formData.category === "non-veg" && styles.radioButtonActive]}
              onPress={() => { setFormData({ ...formData, category: "non-veg" }); }}
            >
              <View style={[styles.vegDot, { backgroundColor: "#EF4444" }]} />
              <Text style={[styles.radioText, formData.category === "non-veg" && styles.radioTextActive]}>
                Non-Vegetarian
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuisine */}
        <View style={styles.field}>
          <View style={styles.cuisineHeader}>
            <Text style={styles.label}>Cuisine *</Text>
            <TouchableOpacity
              style={styles.addCuisineButton}
              onPress={() => { setShowAddCuisineModal(true); }}
            >
              <Ionicons name="add-circle" size={20} color="#10B981" />
              <Text style={styles.addCuisineButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          {loadingCuisines ? (
            <ActivityIndicator color="#10B981" size="small" />
          ) : catererCuisines.length > 0 ? (
            <View style={styles.chipGroup}>
              {catererCuisines.map(cuisine => (
                <TouchableOpacity
                  key={cuisine.id}
                  style={[styles.chip, formData.cuisine === cuisine.name && styles.chipActive]}
                  onPress={() => { setFormData({ ...formData, cuisine: cuisine.name }); }}
                  onLongPress={() => { handleDeleteCuisine(cuisine.id, cuisine.name); }}
                >
                  <Text style={[styles.chipText, formData.cuisine === cuisine.name && styles.chipTextActive]}>
                    {cuisine.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCuisineContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#9CA3AF" />
              <Text style={styles.emptyCuisineText}>No cuisines added yet</Text>
              <Text style={styles.emptyCuisineSubtext}>Tap the Add button to create one</Text>
            </View>
          )}
        </View>

        {/* Meal Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Meal Type *</Text>
          <View style={styles.chipGroup}>
            {MEAL_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, formData.type === type && styles.chipActive]}
                onPress={() => { setFormData({ ...formData, type: type as unknown }); }}
              >
                <Text style={[styles.chipText, formData.type === type && styles.chipTextActive]}>
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.field}>
          <CloudinaryImagePicker
            label="Food Image *"
            onImageUploaded={(url) => { setFormData({ ...formData, image: url }); }}
            currentImage={formData.image}
            disabled={loading}
          />
        </View>

        {/* Available Dates */}
        <View style={styles.field}>
          <Text style={styles.label}>Available Dates * (Select at least one)</Text>
          <View style={styles.datesGrid}>
            {dates.map(date => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateChip,
                  selectedDates.includes(date.value) && styles.dateChipActive,
                ]}
                onPress={() => { toggleDate(date.value); }}
              >
                <Ionicons
                  name={selectedDates.includes(date.value) ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={selectedDates.includes(date.value) ? "#10B981" : "#9CA3AF"}
                />
                <Text
                  style={[
                    styles.dateChipText,
                    selectedDates.includes(date.value) && styles.dateChipTextActive,
                  ]}
                >
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* In Stock */}
        <View style={styles.field}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Available Now</Text>
              <Text style={styles.hint}>Item is in stock and ready to order</Text>
            </View>
            <Switch
              value={formData.inStock}
              onValueChange={(value) => { setFormData({ ...formData, inStock: value }); }}
              trackColor={{ false: "#E5E7EB", true: "#10B981" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={() => { void handleSubmit(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Add Menu Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Item History Modal */}
      <ItemHistoryModal
        visible={showHistoryModal}
        onClose={() => { setShowHistoryModal(false); }}
        onSelectItem={handleSelectHistoryItem}
        catererId={user?.id || 0}
      />

      {/* Add Cuisine Modal */}
      <Modal
        visible={showAddCuisineModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddCuisineModal(false);
          setNewCuisineName("");
          setNewCuisineImage("");
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowAddCuisineModal(false);
            setNewCuisineName("");
            setNewCuisineImage("");
          }}
        >
          <KeyboardAvoidingView
            behavior="position"
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={-100}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => { e.stopPropagation(); }}
            >
              {/* Modern Header with Icon */}
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
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowAddCuisineModal(false);
                    setNewCuisineName("");
                    setNewCuisineImage("");
                  }}
                >
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.modalDivider} />

              {/* Cuisine Name Input with Icon */}
              <View style={styles.modalInputContainer}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="text-outline" size={18} color="#10B981" />
                  <Text style={styles.inputLabel}>Cuisine Name</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="fast-food-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
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

              {/* Cuisine Image Upload with Enhanced Styling */}
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
                    disabled={loadingCuisines}
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
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowAddCuisineModal(false);
                    setNewCuisineName("");
                    setNewCuisineImage("");
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalAddButton, loadingCuisines && styles.modalAddButtonDisabled]}
                  onPress={() => { void handleAddCuisine(); }}
                  disabled={loadingCuisines}
                >
                  {loadingCuisines ? (
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
    </View>
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
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#10B981",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  historyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
    flex: 1,
    textAlign: "center",
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
    color: "#9CA3AF",
    marginTop: 2,
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
  radioGroup: {
    flexDirection: "row",
    gap: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  radioButtonActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  vegDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  radioTextActive: {
    color: "#10B981",
    fontWeight: "600",
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
  datesGrid: {
    gap: 8,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
  },
  dateChipActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  dateChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    flex: 1,
  },
  dateChipTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  submitButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
  cuisineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addCuisineButton: {
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
  addCuisineButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  emptyCuisineContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  emptyCuisineText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptyCuisineSubtext: {
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
