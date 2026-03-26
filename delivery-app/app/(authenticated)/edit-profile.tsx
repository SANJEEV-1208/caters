import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/src/context/AuthContext";
import { updateUserProfile } from "@/src/api/authApi";
import { showValidationError, showSuccessAlert, showWarningAlert, showErrorAlert } from "@/src/utils/alertHelpers";

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [serviceName, setServiceName] = useState(user?.serviceName || "");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  const [restaurantAddress, setRestaurantAddress] = useState(user?.restaurantAddress || "");

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showWarningAlert("Please allow access to your photo library");
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadToCloudinary(imageUri);
      }
    } catch (error) {
      console.error("❌ Image picker error:", error);
      showErrorAlert("Failed to pick image");
    }
  };

  const uploadToCloudinary = async (imageUri: string) => {
    try {
      setUploading(true);

      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        showErrorAlert("Cloudinary is not configured. Please contact support.");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as unknown as Blob);
      formData.append("upload_preset", uploadPreset);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setProfilePicture(data.secure_url);
        console.log("✅ Image uploaded to Cloudinary:", data.secure_url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("❌ Cloudinary upload error:", error);
      showErrorAlert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const validateCatererFields = (): boolean => {
    if (!user || user?.role !== "caterer") return true;

    if (user.caterType === "restaurant") {
      if (!restaurantName.trim()) {
        showValidationError("Restaurant Name", "Please enter restaurant name");
        return false;
      }
      if (!restaurantAddress.trim()) {
        showValidationError("Restaurant Address", "Please enter restaurant address");
        return false;
      }
    } else {
      if (!serviceName.trim()) {
        showValidationError("Service Name", "Please enter service name");
        return false;
      }
      if (!address.trim()) {
        showValidationError("Address", "Please enter your address");
        return false;
      }
    }
    return true;
  };

  const buildUpdateData = (): Record<string, string | undefined> => {
    const baseData: Record<string, string | undefined> = {
      profilePicture: profilePicture || undefined,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    if (!user) return baseData;

    if (user.role === "customer") {
      baseData.address = address.trim() || undefined;
    } else if (user.role === "caterer" && user.caterType === "restaurant") {
      baseData.restaurantName = restaurantName.trim() || undefined;
      baseData.restaurantAddress = restaurantAddress.trim() || undefined;
    } else if (user.role === "caterer") {
      baseData.serviceName = serviceName.trim() || undefined;
      baseData.address = address.trim() || undefined;
    }

    return baseData;
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!validateCatererFields()) return;

    try {
      setLoading(true);

      const updateData = buildUpdateData();
      const updatedUser = await updateUserProfile(user.id, updateData);

      // IMPORTANT: Preserve authentication tokens from the current user
      // Backend doesn't return tokens, but we need to keep them for authenticated requests
      setUser({
        ...updatedUser,
        token: user.token, // Preserve access token
        refreshToken: user.refreshToken, // Preserve refresh token
      });

      showSuccessAlert("Profile updated successfully", () => router.back());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showErrorAlert(`Failed to update profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Profile Picture Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <Text style={styles.sectionHint}>
              Choose a photo from your gallery
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => { void pickImage(); }}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <ActivityIndicator color="#10B981" />
                  <Text style={styles.uploadButtonText}>Uploading...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="images-outline" size={24} color="#10B981" />
                  <Text style={styles.uploadButtonText}>
                    {profilePicture ? "Change Photo" : "Choose from Gallery"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {profilePicture ? (
              <View style={styles.imagePreview}>
                <Text style={styles.previewLabel}>Current Photo:</Text>
                <Image source={{ uri: profilePicture }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setProfilePicture("")}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.removeButtonText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadHint}>
                <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                <Text style={styles.uploadHintText}>
                  No profile picture yet. Choose from gallery to get started!
                </Text>
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <Text style={styles.sectionHint}>Update your phone number (include country code if needed)</Text>
            <TextInput
              style={styles.input}
              placeholder="+919876543210"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Customer Fields */}
          {user.role === "customer" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.sectionHint}>Optional - Update your delivery address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Your address"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {/* Home Caterer Fields */}
          {user.role === "caterer" && user.caterType === "home" && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Name</Text>
                <Text style={styles.sectionHint}>Your home kitchen service name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., South Indian Kitchen"
                  placeholderTextColor="#9CA3AF"
                  value={serviceName}
                  onChangeText={setServiceName}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Your business address"
                  placeholderTextColor="#9CA3AF"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </>
          )}

          {/* Restaurant Fields */}
          {user.role === "caterer" && user.caterType === "restaurant" && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Restaurant Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., McDonald's Delhi"
                  placeholderTextColor="#9CA3AF"
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Restaurant Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Complete restaurant address"
                  placeholderTextColor="#9CA3AF"
                  value={restaurantAddress}
                  onChangeText={setRestaurantAddress}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={() => { void handleSaveProfile(); }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
    borderBottomColor: "#E5E7EB",
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
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1A1A1A",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imagePreview: {
    marginTop: 16,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#10B981",
  },
  uploadHint: {
    marginTop: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
  },
  uploadHintText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
