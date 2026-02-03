import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { createBulkTables } from '@/src/api/tablesApi';

export default function TablesCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [count, setCount] = useState('5');
  const [loading, setLoading] = useState(false);

  const performCreateTables = async (tableCount: number) => {
    try {
      setLoading(true);

      const response = await createBulkTables({
        catererId: user!.id,
        count: tableCount,
        restaurantName: user!.restaurantName || 'Restaurant',
      });

      Alert.alert(
        'Success',
        `Successfully created ${response.total} table${response.total > 1 ? 's' : ''} with QR codes!`,
        [
          {
            text: 'View Tables',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: unknown) {
      console.error('Create tables error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tables. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const tableCount = parseInt(count);

    // Validation
    if (isNaN(tableCount) || tableCount < 1) {
      Alert.alert('Invalid Input', 'Please enter a valid number of tables (minimum 1)');
      return;
    }

    if (tableCount > 100) {
      Alert.alert('Too Many Tables', 'Maximum 100 tables can be created at once');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    if (!user?.restaurantName) {
      Alert.alert(
        'Restaurant Name Missing',
        'Please update your restaurant profile with a restaurant name'
      );
      return;
    }

    Alert.alert(
      'Create Tables',
      `This will create ${tableCount} table${tableCount > 1 ? 's' : ''} with QR codes. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            performCreateTables(tableCount).catch(console.error);
          },
        },
      ]
    );
  };

  const getPreviewText = () => {
    const tableCount = parseInt(count);
    if (isNaN(tableCount) || tableCount < 1) return 'Enter a valid number';

    if (tableCount === 1) return 'Will create: Table 1';
    if (tableCount <= 5)
      return `Will create: ${Array.from({ length: tableCount }, (_, i) => `Table ${i + 1}`).join(', ')}`;
    return `Will create: Table 1, Table 2, ..., Table ${tableCount}`;
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
        <Text style={styles.headerTitle}>Create Tables</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4F46E5" />
          <Text style={styles.infoText}>
            QR codes will be generated automatically and uploaded to the cloud. You can download
            and print them later.
          </Text>
        </View>

        {/* Number Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            How many tables? <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 10"
            value={count}
            onChangeText={setCount}
            keyboardType="numeric"
            editable={!loading}
            maxLength={3}
          />
          <Text style={styles.helperText}>Enter a number between 1 and 100</Text>
        </View>

        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <Text style={styles.previewText}>{getPreviewText()}</Text>
        </View>

        {/* Restaurant Info */}
        {user?.restaurantName && (
          <View style={styles.restaurantCard}>
            <Ionicons name="restaurant-outline" size={20} color="#6B7280" />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantLabel}>Restaurant Name</Text>
              <Text style={styles.restaurantName}>{user.restaurantName}</Text>
            </View>
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What you&apos;ll get:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>QR codes for each table</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Automatic cloud storage</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Downloadable & printable</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>Active/Inactive toggle</Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={() => { void handleCreate(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Generate QR Codes</Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingInfo}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingText}>
              Generating QR codes and uploading to cloud... This may take a moment.
            </Text>
          </View>
        )}
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  previewCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
  },
  createButton: {
    backgroundColor: '#10B981',
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
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});
