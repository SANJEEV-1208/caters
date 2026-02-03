import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { updateMenuItem } from "@/src/api/catererMenuApi";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";

export default function RestaurantMenuEdit() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const itemId = Number(params?.id || 0);
  const initialName = (params?.name as string) || "";
  const initialPrice = (params?.price as string) || "0";
  const initialCategory = (params?.category as "veg" | "non-veg") || "veg";
  const initialImage = params?.image ? JSON.parse(params.image as string) : "";
  const initialDescription = (params?.description as string) || "";

  // Form state
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [category, setCategory] = useState(initialCategory);
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Required", "Please enter item name");
      return;
    }
    if (!price.trim()) {
      Alert.alert("Required", "Please enter price");
      return;
    }
    if (!imageUrl.trim()) {
      Alert.alert("Required", "Please enter image URL");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Invalid", "Please enter a valid price");
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await updateMenuItem(itemId, {
        id: itemId,
        catererId: user.id,
        name: name.trim(),
        price: priceNum,
        category: category,
        cuisine: "Restaurant",
        type: "main_course",
        image: imageUrl.trim(),
        description: description.trim(),
        availableDates: [today],
        inStock: true,
      });

      Alert.alert("Success", "Item updated successfully", [
        {
          text: "OK",
          onPress: () => router.push("/(authenticated)/caterer/restaurant/menu"),
        },
      ]);
    } catch (error) {
      console.error("Failed to update item:", error);
      Alert.alert("Error", "Failed to update menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Item</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Item Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Item Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Butter Chicken"
            value={name}
            onChangeText={setName}
            editable={!loading}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* Price */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Price <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceWrapper}>
            <Text style={styles.priceCurrency}>₹</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="250"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              editable={!loading}
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryButtonsGroup}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === "veg" && styles.categoryButtonActive,
              ]}
              onPress={() => { setCategory("veg"); }}
              disabled={loading}
            >
              <View
                style={[
                  styles.categoryDot,
                  category === "veg" && styles.categoryDotActive,
                ]}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  category === "veg" && styles.categoryButtonTextActive,
                ]}
              >
                Vegetarian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === "non-veg" && styles.categoryButtonActive,
              ]}
              onPress={() => { setCategory("non-veg"); }}
              disabled={loading}
            >
              <View
                style={[
                  styles.categoryDot,
                  category === "non-veg" && styles.categoryDotActive,
                ]}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  category === "non-veg" && styles.categoryButtonTextActive,
                ]}
              >
                Non-Veg
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.formGroup}>
          <CloudinaryImagePicker
            label="Food Image"
            onImageUploaded={(url) => { setImageUrl(url); }}
            currentImage={imageUrl}
            disabled={loading}
          />
        </View>

        {/* Description (Optional) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textAreaInput]}
            placeholder="e.g., Tender chicken in creamy tomato sauce"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            multiline
            numberOfLines={3}
            placeholderTextColor="#A0AEC0"
            textAlignVertical="top"
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={() => { void handleUpdate(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.updateButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  textAreaInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  urlNote: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
  },
  priceWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingLeft: 12,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  categoryButtonsGroup: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#10B981",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9CA3AF",
  },
  categoryDotActive: {
    backgroundColor: "#10B981",
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryButtonTextActive: {
    color: "#166534",
  },
  updateButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    height: 20,
  },
});
