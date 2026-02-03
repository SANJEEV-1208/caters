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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getMenuItemById, updateMenuItem } from "@/src/api/catererMenuApi";
import { MenuItem } from "@/src/types/menu";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { MenuFormFields } from "@/src/components/caterer/MenuFormFields";
import { MealTypeSelector } from "@/src/components/caterer/MealTypeSelector";
import { DateSelector } from "@/src/components/caterer/DateSelector";
import { validateMenuForm } from "@/src/utils/menuValidation";
import { getCatererCuisines } from "@/src/api/foodApi";
import { catererMenuStyles } from "@/src/styles/catererMenuStyles";
import { menuFormStyles } from "@/src/styles/menuFormStyles";

export default function MenuEditScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [catererCuisines, setCatererCuisines] = useState<Array<{ id: number; name: string; image?: string }>>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "veg" as "veg" | "non-veg",
    cuisine: "Biryani",
    type: "main_course" as "breakfast" | "lunch" | "dinner" | "snack" | "main_course",
    image: "",
    inStock: true,
  });

  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  useEffect(() => {
    void loadMenuItem();
  }, []);

  const loadMenuItem = async () => {
    try {
      const data = await getMenuItemById(Number(itemId));
      setItem(data);

      // Load caterer cuisines
      if (data.catererId) {
        try {
          const cuisines = await getCatererCuisines(data.catererId);
          setCatererCuisines(cuisines || []);
        } catch (error) {
          console.error("Failed to load cuisines:", error);
        }
      }

      setFormData({
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        category: data.category,
        cuisine: data.cuisine,
        type: data.type,
        image: data.image,
        inStock: data.inStock,
      });
      setSelectedDates(data.availableDates);
    } catch (error) {
      console.error("Failed to load menu item:", error);
      Alert.alert("Error", "Failed to load menu item", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
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
    if (!item) return;

    setSaving(true);
    try {
      await updateMenuItem(item.id, {
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

      Alert.alert("Success", "Menu item updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to update menu item:", error);
      Alert.alert("Error", "Failed to update menu item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={catererMenuStyles.container}>
      <View style={catererMenuStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={catererMenuStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={catererMenuStyles.headerTitle}>Edit Menu Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={catererMenuStyles.content} contentContainerStyle={catererMenuStyles.scrollContent}>
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
          disabled={saving}
        />

        {/* Display cuisines as read-only chips (no add/delete in edit mode) */}
        <View style={catererMenuStyles.field}>
          <Text style={catererMenuStyles.label}>Cuisine *</Text>
          <View style={menuFormStyles.chipGroup}>
            {catererCuisines.map(cuisine => (
              <TouchableOpacity
                key={cuisine.id}
                style={[menuFormStyles.chip, formData.cuisine === cuisine.name && menuFormStyles.chipActive]}
                onPress={() => { setFormData({ ...formData, cuisine: cuisine.name }); }}
                disabled={saving}
              >
                <Text style={[menuFormStyles.chipText, formData.cuisine === cuisine.name && menuFormStyles.chipTextActive]}>
                  {cuisine.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Using shared Meal Type Selector component */}
        <MealTypeSelector
          selectedType={formData.type}
          onSelectType={(type) => { setFormData({ ...formData, type }); }}
          disabled={saving}
        />

        <View style={catererMenuStyles.field}>
          <CloudinaryImagePicker
            label="Food Image *"
            onImageUploaded={(url) => { setFormData({ ...formData, image: url }); }}
            currentImage={formData.image}
            disabled={saving}
          />
        </View>

        {/* Using shared Date Selector component */}
        <DateSelector
          selectedDates={selectedDates}
          onToggleDate={toggleDate}
          disabled={saving}
        />

        <View style={catererMenuStyles.field}>
          <View style={catererMenuStyles.switchRow}>
            <View>
              <Text style={catererMenuStyles.label}>Available Now</Text>
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

        <TouchableOpacity
          style={[catererMenuStyles.submitButton, saving && catererMenuStyles.submitButtonDisabled]}
          onPress={() => { void handleSubmit(); }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={catererMenuStyles.submitText}>Update Menu Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
