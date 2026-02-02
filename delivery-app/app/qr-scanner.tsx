import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  // Debug: Screen mounted
  useEffect(() => {
    Alert.alert('QR Scanner', 'Scanner screen loaded successfully!');
  }, []);

  // Auto-request permission on mount
  useEffect(() => {
    if (permission) {
      Alert.alert(
        'Permission Status',
        `Granted: ${permission.granted}\nCan Ask: ${permission.canAskAgain}\nStatus: ${permission.status}`
      );

      if (!permission.granted && permission.canAskAgain) {
        Alert.alert('Requesting Permission', 'Asking for camera access...');
        requestPermission();
      }
    }
  }, [permission]);

  // Debug: Show when scanner is ready
  useEffect(() => {
    if (permission?.granted) {
      // Small delay to ensure camera is ready
      setTimeout(() => {
        Alert.alert('Scanner Ready', 'Point your camera at a restaurant table QR code to scan.\n\nNote: You cannot scan a QR code displayed on THIS device\'s screen. Use another device or print it.');
      }, 1500);
    }
  }, [permission?.granted]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    // First alert - confirm scan detected
    Alert.alert(
      'QR Code Detected!',
      `Length: ${data.length} characters\n\nFirst 50 chars:\n${data.substring(0, 50)}...`,
      [
        {
          text: 'Continue',
          onPress: () => processQRData(data),
        },
        {
          text: 'Cancel',
          onPress: () => setScanned(false),
          style: 'cancel',
        },
      ]
    );
  };

  const processQRData = (data: string) => {
    try {
      // Parse QR data
      const qrData = JSON.parse(data);

      Alert.alert('Parsed Successfully', `Found JSON data:\n${JSON.stringify(qrData, null, 2)}`);

      // Validate QR data structure
      if (!qrData.catererId || !qrData.tableNumber) {
        Alert.alert(
          'Invalid QR Code',
          `Missing required fields!\n\nCatererId: ${qrData.catererId || 'MISSING'}\nTableNumber: ${qrData.tableNumber || 'MISSING'}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      Alert.alert(
        'Valid Restaurant QR!',
        `✓ Caterer ID: ${qrData.catererId}\n✓ Table: ${qrData.tableNumber}\n✓ Restaurant: ${qrData.restaurantName || 'N/A'}`,
        [
          {
            text: 'Open Menu',
            onPress: () => {
              Alert.alert('Navigating', 'Opening restaurant menu...');

              // Navigate to restaurant menu with table context (unauthenticated for walk-in customers)
              router.replace({
                pathname: '/restaurant-menu',
                params: {
                  catererId: String(qrData.catererId),
                  tableNumber: qrData.tableNumber,
                  restaurantName: qrData.restaurantName || 'Restaurant',
                },
              });
            },
          },
          {
            text: 'Cancel',
            onPress: () => setScanned(false),
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'QR Parse Error',
        `This QR code is not valid JSON.\n\nError: ${error.message}\n\nRaw data:\n${data.substring(0, 100)}`,
        [{ text: 'Scan Again', onPress: () => setScanned(false) }]
      );
    }
  };

  // Loading state while checking permissions
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-reverse-outline" size={64} color="#9CA3AF" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          KaasproFoods needs camera access to scan table QR codes for restaurant
          ordering.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        enableTorch={flashOn}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFlashOn(!flashOn)}
            style={styles.flashButton}
          >
            <Ionicons
              name={flashOn ? 'flash' : 'flash-off'}
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            {/* Corners */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Center Square */}
            <View style={styles.centerSquare} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Scan Table QR Code</Text>
            <Text style={styles.instructionsText}>
              Point your camera at the QR code on your table
            </Text>
          </View>
        </View>

        {/* Footer Overlay */}
        <View style={styles.footer}>
          {scanned ? (
            <View style={styles.scanningIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.scanningText}>QR Code Detected! Loading menu...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setScanned(false);
                Alert.alert('Scanner Reset', 'Ready to scan again');
              }}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#10B981',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  centerSquare: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginTop: -30,
    marginLeft: -30,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
  },
  instructionsContainer: {
    marginTop: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 12,
  },
  scanningText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
