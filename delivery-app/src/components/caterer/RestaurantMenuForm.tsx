import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { createMenuItem, updateMenuItem } from "@/src/api/catererMenuApi";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { MenuFormFields } from "@/src/components/caterer/MenuFormFields";
import { validateMenuForm } from "@/src/utils/menuValidation";
import { showSuccessAlert, showErrorAlert } from "@/src/utils/alertHelpers";
import { restaurantMenuStyles as styles } from "@/src/styles/restaurantMenuStyles";

interface RestaurantMenuFormProps {
  readonly mode: "add" | "edit";
  readonly itemId?: number;
  readonly initialData?: {
    readonly name: string;
    readonly price: string;
    readonly category: "veg" | "non-veg";
    readonly image: string;
    readonly description: string;
  };
}

export default function RestaurantMenuForm({
  mode,
  itemId,
  initialData
}: RestaurantMenuFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [category, setCategory] = useState<"veg" | "non-veg">(initialData?.category || "veg");
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      const menuData = {
        ...(mode === "edit" && itemId ? { id: itemId } : {}),
        catererId: user.id,
        name: name.trim(),
        price: validation.priceNum!,
        category: category,
        cuisine: "Restaurant",
        type: "main_course" as const,
        image: imageUrl.trim(),
        description: description.trim(),
        availableDates: [today],
        inStock: true,
      };

      if (mode === "add") {
        await createMenuItem(menuData);
      } else if (itemId) {
        await updateMenuItem(itemId, menuData);
      }

      const successMessage = mode === "add"
        ? "Item created successfully"
        : "Item updated successfully";

      showSuccessAlert(successMessage, () => {
        router.push("/(authenticated)/caterer/restaurant/menu");
      });
    } catch (error) {
      console.error(`Failed to ${mode} item:`, error);
      showErrorAlert(`Failed to ${mode} menu item`);
    } finally {
      setLoading(false);
    }
  };

  const headerTitle = mode === "add" ? "Add Menu Item" : "Edit Item";
  const buttonIcon = mode === "add" ? "add" : "checkmark";
  const buttonText = mode === "add" ? "Create Item" : "Save Changes";
  const buttonStyle = mode === "add" ? styles.createButton : styles.updateButton;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, buttonStyle, loading && styles.buttonDisabled]}
            onPress={() => { void handleSubmit(); }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name={buttonIcon} size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>{buttonText}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
