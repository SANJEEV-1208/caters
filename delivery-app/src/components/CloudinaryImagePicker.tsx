import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../config/cloudinary';
import { showWarningAlert, showSuccessAlert, showErrorAlert, showConfirmAlert } from '../utils/alertHelpers';

interface CloudinaryImagePickerProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  label?: string;
  disabled?: boolean;
  folder?: string;
  showPreview?: boolean;
}

export const CloudinaryImagePicker: React.FC<CloudinaryImagePickerProps> = ({
  onImageUploaded,
  currentImage,
  label = 'Upload Image',
  disabled = false,
  folder,
  showPreview = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(
    currentImage || null
  );
  const [pendingAsset, setPendingAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // Update selected image when currentImage prop changes (e.g., when reusing previous item)
  useEffect(() => {
    setSelectedImageUri(currentImage || null);
    setPendingAsset(null); // Clear pending asset when currentImage changes
  }, [currentImage]);

  const selectImage = async () => {
    if (disabled) return;

    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showWarningAlert('You need to grant permission to access your photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3], // Set aspect ratio for proper cropping
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets?.[0]) {
        const asset = result.assets[0];
        // Store the selected/cropped image locally for preview
        setSelectedImageUri(asset.uri || null);
        setPendingAsset(asset); // Store asset for later upload
        // Don't upload automatically - wait for user to click Upload button
      }
    } catch (error) {
      console.error('Image selection error:', error);
      showErrorAlert('Failed to select image. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!pendingAsset) {
      showWarningAlert('Please select an image first.');
      return;
    }

    await uploadToCloudinary(pendingAsset);
  };

  const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.base64) {
      showErrorAlert('Image data not available. Please try again.');
      return;
    }

    // Validate Cloudinary config
    if (CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME' ||
        !CLOUDINARY_CONFIG.cloudName) {
      showErrorAlert('Please configure your Cloudinary credentials in the .env file.\n\nSee documentation for setup instructions.');
      setSelectedImageUri(null);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get file extension from URI – use .at(-1) for cleaner access
      const uriParts = asset.uri?.split('.') || [];
      const fileType = uriParts.at(-1) ?? ''; // prefer .at(-1) over [length-1]
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

      const formData = new FormData();
      formData.append('file', `data:${mimeType};base64,${asset.base64}`);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', folder || CLOUDINARY_CONFIG.folder);

      const uploadUrl = getCloudinaryUploadUrl();

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageUrl = response.secure_url;

          setSelectedImageUri(imageUrl);
          onImageUploaded(imageUrl);
          setPendingAsset(null); // Clear pending asset after successful upload
          setUploading(false);

          showSuccessAlert('Image uploaded successfully!');
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    } catch (error: unknown) {
      console.error('Cloudinary upload error:', error);
      setUploading(false);
      setSelectedImageUri(currentImage || null);

      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';

      showConfirmAlert(
        errorMessage,
        () => { void uploadToCloudinary(asset); },
        undefined,
        'Upload Failed'
      );
    }
  };

  return (
    <View style={styles.container}>
      {Boolean(label) && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.uploadButton,
          disabled && styles.uploadButtonDisabled,
          uploading && styles.uploadButtonUploading,
        ]}
        onPress={() => { void selectImage(); }}
        disabled={disabled || uploading}
        activeOpacity={0.7}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>
              Uploading... {uploadProgress}%
            </Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons
              name="image-outline"
              size={24}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.uploadButtonText}>
              {selectedImageUri && !pendingAsset ? 'Change Image' : 'Select from Gallery'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {showPreview && selectedImageUri && !uploading && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>
            {pendingAsset ? 'Preview (Not uploaded yet)' : 'Image Preview:'}
          </Text>
          <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <Ionicons
              name={pendingAsset ? "alert-circle" : "checkmark-circle"}
              size={16}
              color={pendingAsset ? "#F59E0B" : "#10B981"}
            />
            <Text style={[
              styles.previewText,
              pendingAsset && styles.previewTextPending
            ]}>
              {pendingAsset
                ? 'Tap Upload button to save'
                : (selectedImageUri === currentImage ? 'Current image' : 'Uploaded successfully')}
            </Text>
          </View>
        </View>
      )}

      {/* Upload Button - Only shown when there's a pending asset */}
      {pendingAsset && !uploading && (
        <TouchableOpacity
          style={styles.confirmUploadButton}
          onPress={() => { void handleUpload(); }}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
          <Text style={styles.confirmUploadButtonText}>Upload Image</Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}

      <Text style={styles.helperText}>
        {pendingAsset
          ? 'Image selected and cropped. Click Upload to save to cloud.'
          : 'Select an image from your device gallery. Max size: 10MB'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  uploadButtonUploading: {
    backgroundColor: '#F59E0B',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewContainer: {
    marginTop: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  previewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  previewText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  previewTextPending: {
    color: '#F59E0B',
  },
  confirmUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmUploadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});