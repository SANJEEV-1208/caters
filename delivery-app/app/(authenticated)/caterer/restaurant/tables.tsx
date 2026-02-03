import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import {
  getCatererTables,
  deleteTable,
  updateTable,
  RestaurantTable,
} from '@/src/api/tablesApi';

export default function TablesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadTables();
  }, [user?.id]);

  const loadTables = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const fetchedTables = await getCatererTables(user.id);
      setTables(fetchedTables);
    } catch (error) {
      console.error('Failed to load tables:', error);
      Alert.alert('Error', 'Failed to load tables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTables();
    setRefreshing(false);
  }, [user?.id]);

  const handleToggleActive = async (table: RestaurantTable) => {
    try {
      await updateTable(table.id, { isActive: !table.isActive });
      setTables((prev) =>
        prev.map((t) =>
          t.id === table.id ? { ...t, isActive: !t.isActive } : t
        )
      );
      Alert.alert(
        'Success',
        `${table.tableNumber} is now ${!table.isActive ? 'active' : 'inactive'}`
      );
    } catch (error) {
      console.error('Toggle active error:', error);
      Alert.alert('Error', 'Failed to update table status');
    }
  };

  const handleDelete = async (table: RestaurantTable) => {
    Alert.alert(
      'Delete Table',
      `Are you sure you want to delete ${table.tableNumber}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTable(table.id);
              setTables((prev) => prev.filter((t) => t.id !== table.id));
              Alert.alert('Success', `${table.tableNumber} deleted successfully`);
            } catch (error) {
              console.error('Delete table error:', error);
              Alert.alert('Error', 'Failed to delete table');
            }
          },
        },
      ]
    );
  };

  const handleViewQR = (table: RestaurantTable) => {
    router.push({
      pathname: '/(authenticated)/caterer/restaurant/table-qr-view',
      params: {
        tableId: table.id.toString(),
        tableNumber: table.tableNumber,
        qrCodeUrl: table.qrCodeUrl,
      },
    });
  };

  const renderTableCard = ({ item }: { item: RestaurantTable }) => (
    <View style={styles.tableCard}>
      {/* QR Code Thumbnail */}
      <TouchableOpacity
        onPress={() => { handleViewQR(item); }}
        style={styles.qrThumbnailContainer}
      >
        <Image source={{ uri: item.qrCodeUrl }} style={styles.qrThumbnail} />
        <View style={styles.viewQROverlay}>
          <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Table Info */}
      <View style={styles.tableInfo}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableNumber}>{item.tableNumber}</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isActive ? '#10B981' : '#9CA3AF' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.isActive ? '#10B981' : '#9CA3AF' },
              ]}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={styles.createdText}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => { handleViewQR(item); }}
          >
            <Ionicons name="qr-code-outline" size={18} color="#4F46E5" />
            <Text style={styles.actionButtonText}>View QR</Text>
          </TouchableOpacity>

          <View style={styles.activeToggle}>
            <Text style={styles.toggleLabel}>Active</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => { void handleToggleActive(item); }}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => { void handleDelete(item); }}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="qr-code-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Tables Yet</Text>
      <Text style={styles.emptyText}>
        Create tables to generate QR codes for your restaurant
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() =>
          router.push('/(authenticated)/caterer/restaurant/tables-create')
        }
      >
        <Text style={styles.emptyButtonText}>Create Tables</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading tables...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { router.back(); }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Table QR Codes</Text>
        <TouchableOpacity
          onPress={() =>
            router.push('/(authenticated)/caterer/restaurant/tables-create')
          }
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Table List */}
      <FlatList
        data={tables}
        renderItem={renderTableCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          tables.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
          />
        }
      />
      </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  tableCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrThumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  qrThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  viewQROverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 6,
  },
  tableInfo: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createdText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
