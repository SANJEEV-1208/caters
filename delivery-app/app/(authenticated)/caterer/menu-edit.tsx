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
import { validateMenuForm } from "@/src/utils/menuValidation";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "main_course"] as const;
type MealType = typeof MEAL_TYPES[number];

export default function MenuEditScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<MenuItem | null>(null);

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
    void loadMenuItem();
  }, []);

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Generate label for date
      let label;
      if (i === 0) {
        label = "Today";
      } else if (i === 1) {
        label = "Tomorrow";
      } else {
        label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      dates.push({
        label,
        value: date.toISOString().split('T')[0],
      });
    }
    return dates;
  };

  const dates = getDates();

  const loadMenuItem = async () => {
    try {
      const data = await getMenuItemById(Number(itemId));
      setItem(data);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Menu Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
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

        <View style={styles.field}>
          <Text style={styles.label}>Cuisine *</Text>
          <View style={styles.chipGroup}>
            {["Biryani", "Dosa", "Pizza", "Noodles", "Fried Rice", "Curry", "Paratha", "Meals"].map(cuisine => (
              <TouchableOpacity
                key={cuisine}
                style={[styles.chip, formData.cuisine === cuisine && styles.chipActive]}
                onPress={() => { setFormData({ ...formData, cuisine }); }}
              >
                <Text style={[styles.chipText, formData.cuisine === cuisine && styles.chipTextActive]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Meal Type *</Text>
          <View style={styles.chipGroup}>
            {MEAL_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, formData.type === type && styles.chipActive]}
                onPress={() => { setFormData({ ...formData, type}); }}
              >
                <Text style={[styles.chipText, formData.type === type && styles.chipTextActive]}>
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <CloudinaryImagePicker
            label="Food Image *"
            onImageUploaded={(url) => { setFormData({ ...formData, image: url }); }}
            currentImage={formData.image}
            disabled={saving}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Available Dates *</Text>
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

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={() => { void handleSubmit(); }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Update Menu Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
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
});
