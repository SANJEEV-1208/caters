import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { updateUserProfile } from "@/src/api/authApi";

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState(user?.address || "");
  const [serviceName, setServiceName] = useState(user?.serviceName || "");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  const [restaurantAddress, setRestaurantAddress] = useState(user?.restaurantAddress || "");

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validation
    if (user.role === "caterer") {
      if (user.caterType === "restaurant") {
        if (!restaurantName.trim()) {
          Alert.alert("Required", "Please enter restaurant name");
          return;
        }
        if (!restaurantAddress.trim()) {
          Alert.alert("Required", "Please enter restaurant address");
          return;
        }
      } else {
        if (!serviceName.trim()) {
          Alert.alert("Required", "Please enter service name");
          return;
        }
        if (!address.trim()) {
          Alert.alert("Required", "Please enter your address");
          return;
        }
      }
    }

    try {
      setLoading(true);

      const updateData: Record<string, string | undefined> = {
        profilePicture: profilePicture || undefined,
        name: name.trim(),
      };

      if (user.role === "customer") {
        updateData.address = address.trim() || undefined;
      } else if (user.role === "caterer") {
        if (user.caterType === "restaurant") {
          updateData.restaurantName = restaurantName.trim();
          updateData.restaurantAddress = restaurantAddress.trim();
        } else {
          updateData.serviceName = serviceName.trim();
          updateData.address = address.trim();
        }
      }

      const updatedUser = await updateUserProfile(user.id, updateData);
      setUser(updatedUser);
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update profile: ${errorMessage}`);
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
              Upload your photo to Imgur or ImgBB, then paste the direct image link here
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Paste image URL here (e.g., https://i.imgur.com/...)"
              placeholderTextColor="#9CA3AF"
              value={profilePicture}
              onChangeText={setProfilePicture}
              autoCapitalize="none"
            />

            {profilePicture ? (
              <View style={styles.imagePreview}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Image source={{ uri: profilePicture }} style={styles.previewImage} />
              </View>
            ) : (
              <View style={styles.uploadHint}>
                <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                <Text style={styles.uploadHintText}>
                  No profile picture yet. Upload to get started!
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
