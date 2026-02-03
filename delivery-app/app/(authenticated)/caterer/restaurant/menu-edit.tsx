import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { updateMenuItem } from "@/src/api/catererMenuApi";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { MenuFormFields } from "@/src/components/caterer/MenuFormFields";
import { validateMenuForm } from "@/src/utils/menuValidation";

export default function RestaurantMenuEdit() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const itemId = Number(params?.id || 0);
  const initialName = (params?.name as string) || "";
  const initialPrice = (params?.price as string) || "0";
  const initialCategory = (params?.category as "veg" | "non-veg" | undefined) || "veg";
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
    // Validation using shared utility
    const validation = validateMenuForm({
      name,
      price,
      imageUrl,
      requireDates: false,
    });

    if (!validation.valid) return;
    if (!user?.id) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await updateMenuItem(itemId, {
        id: itemId,
        catererId: user.id,
        name: name.trim(),
        price: validation.priceNum!,
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
        {/* Using shared form fields component */}
        <MenuFormFields
          name={name}
          setName={setName}
          price={price}
          setPrice={setPrice}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          disabled={loading}
        />

        {/* Image Upload */}
        <View style={styles.formGroup}>
          <CloudinaryImagePicker
            label="Food Image *"
            onImageUploaded={(url) => { setImageUrl(url); }}
            currentImage={imageUrl}
            disabled={loading}
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
  updateButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
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
