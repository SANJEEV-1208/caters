import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { createMenuItem } from "@/src/api/catererMenuApi";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { MenuFormFields } from "@/src/components/caterer/MenuFormFields";
import { validateMenuForm } from "@/src/utils/menuValidation";
import { restaurantMenuStyles as styles } from "@/src/styles/restaurantMenuStyles";

export default function RestaurantMenuAdd() {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"veg" | "non-veg">("veg");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
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
      // For restaurant, we set availableDates to always available
      const today = new Date().toISOString().split("T")[0];
      await createMenuItem({
        catererId: user.id,
        name: name.trim(),
        price: validation.priceNum!,
        category: category,
        cuisine: "Restaurant", // Default cuisine for restaurant
        type: "main_course", // Default type
        image: imageUrl.trim(),
        description: description.trim(),
        availableDates: [today], // Can be extended to multiple dates
        inStock: true,
      });

      Alert.alert("Success", "Item created successfully", [
        {
          text: "OK",
          onPress: () => router.push("/(authenticated)/caterer/restaurant/menu"),
        },
      ]);
    } catch (error) {
      console.error("Failed to create item:", error);
      Alert.alert("Error", "Failed to create menu item");
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
        <Pressable onPress={() => { router.back(); }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Add Menu Item</Text>
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

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
          onPress={() => { void handleCreate(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Create Item</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
