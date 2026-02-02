import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export default function TableQRViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tableNumber, qrCodeUrl } = params;

  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const downloadQR = async () => {
    try {
      setDownloading(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please grant media library access to save QR codes'
        );
        setDownloading(false);
        return;
      }

      // Download file
      const filename = `${tableNumber}_qr.png`.replace(/\s+/g, '_');
      const fileUri = `${(FileSystem as any).documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        qrCodeUrl as string,
        fileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error('Download failed');
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync('KaasproFoods QR', asset, false);

      Alert.alert(
        'Success',
        `QR code saved to gallery!\nLook for "${filename}" in the KaasproFoods QR album.`
      );
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', error.message || 'Failed to save QR code');
    } finally {
      setDownloading(false);
    }
  };

  const shareQR = async () => {
    try {
      setSharing(true);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not Available', 'Sharing is not available on this device');
        setSharing(false);
        return;
      }

      // Download file to temp directory
      const filename = `${tableNumber}_qr.png`.replace(/\s+/g, '_');
      const fileUri = `${(FileSystem as any).cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        qrCodeUrl as string,
        fileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error('Failed to download QR code for sharing');
      }

      // Share file
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: 'image/png',
        dialogTitle: `Share ${tableNumber} QR Code`,
      });
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', error.message || 'Failed to share QR code');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tableNumber}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* QR Code Display */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrLabel}>Scan to Order</Text>
          <Image source={{ uri: qrCodeUrl as string }} style={styles.qrImage} />
          <Text style={styles.tableTitle}>{tableNumber}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={downloadQR}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={shareQR}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Share</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Use:</Text>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Download or share this QR code
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Print the QR code on paper or display it digitally
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Place it on the table for customers to scan
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              Customers scan, browse menu, and place orders
            </Text>
          </View>
        </View>

        {/* Printing Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Printing Tips</Text>
          </View>

          <Text style={styles.tipText}>
            • Print at least 4x4 inches (10x10 cm) for easy scanning
          </Text>
          <Text style={styles.tipText}>
            • Use high-quality paper for durability
          </Text>
          <Text style={styles.tipText}>
            • Laminate the QR code to protect from spills
          </Text>
          <Text style={styles.tipText}>
            • Place at eye level on the table
          </Text>
          <Text style={styles.tipText}>
            • Ensure good lighting for better scanning
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            This QR code is unique to {tableNumber}. Orders from this QR will
            automatically include the table number.
          </Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    padding: 16,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  qrLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  qrImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  tableTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  downloadButton: {
    backgroundColor: '#10B981',
  },
  shareButton: {
    backgroundColor: '#4F46E5',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20,
  },
});
