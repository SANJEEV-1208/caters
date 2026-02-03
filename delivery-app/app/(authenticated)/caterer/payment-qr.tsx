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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { updatePaymentQrCode } from "@/src/api/authApi";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";

export default function PaymentQrScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState(user?.paymentQrCode || "");
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'gallery' | 'url'>('gallery');

  const handleImageUploaded = (url: string) => {
    setQrCodeUrl(url);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!qrCodeUrl.trim()) {
      Alert.alert("Error", "Please upload or enter a QR code image");
      return;
    }

    // Basic URL validation (only if using URL method)
    if (uploadMethod === 'url') {
      try {
        new URL(qrCodeUrl);
      } catch {
        Alert.alert("Error", "Please enter a valid URL");
        return;
      }
    }

    setLoading(true);
    try {
      const updatedUser = await updatePaymentQrCode(user.id, qrCodeUrl.trim());
      setUser(updatedUser); // Update user in context
      Alert.alert(
        "Success",
        "Payment QR code updated successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Failed to update QR code:", error);
      Alert.alert("Error", "Failed to update QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.id) return;

    Alert.alert(
      "Remove QR Code",
      "Are you sure you want to remove your payment QR code? Customers won\'t be able to pay via UPI.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const updatedUser = await updatePaymentQrCode(user.id, "");
              setUser(updatedUser);
              setQrCodeUrl("");
              Alert.alert("Success", "Payment QR code removed");
            } catch (error) {
              Alert.alert("Error", "Failed to remove QR code");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.back(); }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Upload your GPay or UPI QR code image URL. Customers will scan this QR code
              to pay you directly.
            </Text>
          </View>
        </View>

        {/* Current QR Code Preview */}
        {qrCodeUrl && (
          <View style={styles.previewCard}>
            <Text style={styles.label}>Current QR Code</Text>
            <View style={styles.qrPreview}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Upload Method Selector */}
        {!user?.paymentQrCode && (
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                uploadMethod === 'gallery' && styles.methodButtonActive,
              ]}
              onPress={() => { setUploadMethod('gallery'); }}
            >
              <Ionicons
                name="image"
                size={20}
                color={uploadMethod === 'gallery' ? '#10B981' : '#6B7280'}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  uploadMethod === 'gallery' && styles.methodButtonTextActive,
                ]}
              >
                Upload from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                uploadMethod === 'url' && styles.methodButtonActive,
              ]}
              onPress={() => { setUploadMethod('url'); }}
            >
              <Ionicons
                name="link"
                size={20}
                color={uploadMethod === 'url' ? '#10B981' : '#6B7280'}
              />
              <Text
                style={[
                  styles.methodButtonText,
                  uploadMethod === 'url' && styles.methodButtonTextActive,
                ]}
              >
                Enter URL
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload from Gallery */}
        {!user?.paymentQrCode && uploadMethod === 'gallery' && (
          <View style={styles.field}>
            <CloudinaryImagePicker
              label="Upload QR Code from Gallery *"
              onImageUploaded={handleImageUploaded}
              currentImage={qrCodeUrl}
              disabled={loading}
              folder="kaaspro/qr-codes"
            />
          </View>
        )}

        {/* QR Code URL Input */}
        {!user?.paymentQrCode && uploadMethod === 'url' && (
          <View style={styles.field}>
            <Text style={styles.label}>QR Code Image URL *</Text>
            <Text style={styles.hint}>
              Upload your QR code image to a service like Imgur or use a direct image link
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/your-qr-code.jpg"
              value={qrCodeUrl}
              onChangeText={setQrCodeUrl}
              autoCapitalize="none"
              keyboardType="url"
              multiline
            />
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to get your QR code:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Open GPay/PhonePe/Paytm and go to your QR code section
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Take a screenshot of your QR code
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Upload it to an image hosting service (Imgur, ImgBB, etc.)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Copy the direct image link and paste it above
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!user?.paymentQrCode ? (
          // Show Save button when no QR code exists
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save QR Code</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          // Show Remove button when QR code exists
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.removeButtonText}>Remove QR Code</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  qrPreview: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  qrImage: {
    width: 200,
    height: 200,
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
    color: "#6B7280",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#1A1A1A",
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
  },
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    marginRight: 8,
    width: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    gap: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  methodSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  methodButtonActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  methodButtonTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
});
