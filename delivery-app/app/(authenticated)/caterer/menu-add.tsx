import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { createMenuItem } from "@/src/api/catererMenuApi";
import { getCatererCuisines } from "@/src/api/foodApi";
import { MenuItem } from "@/src/types/menu";
import ItemHistoryModal from "@/src/components/caterer/ItemHistoryModal";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { MenuFormFields } from "@/src/components/caterer/MenuFormFields";
import { MealTypeSelector } from "@/src/components/caterer/MealTypeSelector";
import { DateSelector } from "@/src/components/caterer/DateSelector";
import { CuisineSelector } from "@/src/components/caterer/CuisineSelector";
import { validateMenuForm } from "@/src/utils/menuValidation";


export default function MenuAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [catererCuisines, setCatererCuisines] = useState<Array<{ id: number; name: string; image?: string }>>([]);

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
    }
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

  const toggleDate = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleSubmit = async () => {
    // Validation using shared utility
    const validation = validateMenuForm({
      name: formData.name,
      price: formData.price,
      imageUrl: formData.image,
      requireDates: true,
      selectedDates,
    });

    if (!validation.valid) return;
    if (!user?.id) return;

    setLoading(true);
    try {
      await createMenuItem({
        catererId: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: validation.priceNum!,
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

        {/* Using shared form fields component */}
        <MenuFormFields
          name={formData.name}
          setName={(text) => { setFormData({ ...formData, name: text }); }}
          price={formData.price}
          setPrice={(text) => { setFormData({ ...formData, price: text }); }}
          category={formData.category}
          setCategory={(cat) => { setFormData({ ...formData, category: cat }); }}
          description={formData.description}
          setDescription={(text) => { setFormData({ ...formData, description: text }); }}
          disabled={loading}
        />

        {/* Using shared Cuisine Selector component */}
        <CuisineSelector
          cuisines={catererCuisines}
          selectedCuisine={formData.cuisine}
          onSelectCuisine={(cuisine) => { setFormData({ ...formData, cuisine }); }}
          onCuisinesUpdated={(cuisines) => {
            setCatererCuisines(cuisines);
            if (cuisines.length > 0 && !formData.cuisine) {
              setFormData({ ...formData, cuisine: cuisines[0].name });
            }
          }}
          catererId={user?.id || 0}
          disabled={loading}
        />

        {/* Using shared Meal Type Selector component */}
        <MealTypeSelector
          selectedType={formData.type}
          onSelectType={(type) => { setFormData({ ...formData, type: type as unknown }); }}
          disabled={loading}
        />

        {/* Image Upload */}
        <View style={styles.field}>
          <CloudinaryImagePicker
            label="Food Image *"
            onImageUploaded={(url) => { setFormData({ ...formData, image: url }); }}
            currentImage={formData.image}
            disabled={loading}
          />
        </View>

        {/* Using shared Date Selector component */}
        <DateSelector
          selectedDates={selectedDates}
          onToggleDate={toggleDate}
          disabled={loading}
        />

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
});
