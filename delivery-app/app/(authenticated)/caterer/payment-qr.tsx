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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { updatePaymentQrCode } from "@/src/api/authApi";
import { CloudinaryImagePicker } from "@/src/components/CloudinaryImagePicker";
import { showValidationError, showSuccessAlert, showErrorAlert, showDeleteConfirm } from "@/src/utils/alertHelpers";

export default function PaymentQrScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState(user?.paymentQrCode || "");
  const [loading, setLoading] = useState(false);

  const handleImageUploaded = (url: string) => {
    setQrCodeUrl(url);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!qrCodeUrl.trim()) {
      showValidationError("QR Code", "Please upload a QR code image");
      return;
    }

    setLoading(true);
    try {
      const updatedUserData = await updatePaymentQrCode(user.id, qrCodeUrl.trim());

      // Merge QR code into existing user object to preserve authentication tokens
      const mergedUser = {
        ...user,
        paymentQrCode: updatedUserData.paymentQrCode,
        token: user.token, // Preserve access token
        refreshToken: user.refreshToken, // Preserve refresh token
      };

      setUser(mergedUser); // Update user in context with preserved tokens
      showSuccessAlert("Payment QR code updated successfully", () => router.back());
    } catch (error) {
      console.error("Failed to update QR code:", error);
      showErrorAlert("Failed to update QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.id) return;

    showDeleteConfirm(
      "your payment QR code",
      () => {
        void (async () => {
          setLoading(true);
          try {
            await updatePaymentQrCode(user.id, "");

            // Merge QR code removal into existing user object to preserve authentication tokens
            const mergedUser = {
              ...user,
              paymentQrCode: undefined,
              token: user.token, // Preserve access token
              refreshToken: user.refreshToken, // Preserve refresh token
            };

            setUser(mergedUser);
            setQrCodeUrl("");
            showSuccessAlert("Payment QR code removed");
          } catch (error) {
            console.error("Failed to remove QR code:", error);
            showErrorAlert("Failed to remove QR code");
          } finally {
            setLoading(false);
          }
        })();
      }
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
              Upload your GPay or UPI QR code image. Customers will scan this QR code
              to pay you directly.
            </Text>
          </View>
        </View>

        {/* Current QR Code Preview */}
        {!!qrCodeUrl && (
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

        {/* Upload QR Code */}
        {!user?.paymentQrCode && (
          <View style={styles.field}>
            <CloudinaryImagePicker
              label="Upload QR Code *"
              onImageUploaded={handleImageUploaded}
              currentImage={qrCodeUrl}
              disabled={loading}
              folder="kaaspro/qr-codes"
            />
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to upload your QR code:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Open GPay/PhonePe/Paytm and go to your QR code section
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Take a screenshot of your QR code and save it to your gallery
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Tap "Upload QR Code" above and select the screenshot from your gallery
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {user?.paymentQrCode ? (
          // Show Remove button when QR code exists
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => { void handleRemove(); }}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.removeButtonText}>Remove QR Code</Text>
          </TouchableOpacity>
        ) : (
          // Show Save button when no QR code exists
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={() => { void handleSave(); }}
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
});
