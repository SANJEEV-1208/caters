import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import ApartmentCard from "@/src/components/caterer/ApartmentCard";
import { getCatererApartments, deleteApartment, getCustomerApartmentLinks } from "@/src/api/apartmentApi";

type Apartment = {
  id: number;
  catererId: number;
  name: string;
  address: string;
  accessCode: string;
  customerCount?: number;
  createdAt: string;
};

export default function ApartmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadApartments();
  }, []);

  const loadApartments = async () => {
    if (!user?.id) return;

    try {
      // Fetch apartments and customer links
      const [apartmentsData, customerLinks] = await Promise.all([
        getCatererApartments(user.id),
        getCustomerApartmentLinks(user.id)
      ]);

      // Count customers per apartment
      const customerCounts: { [apartmentId: number]: number } = {};
      customerLinks.forEach(link => {
        if (link.apartmentId) {
          customerCounts[link.apartmentId] = (customerCounts[link.apartmentId] || 0) + 1;
        }
      });

      // Add customer count to each apartment
      const apartmentsWithCounts = apartmentsData.map(apt => ({
        ...apt,
        customerCount: customerCounts[apt.id] || 0
      }));

      setApartments(apartmentsWithCounts);
    } catch (error) {
      console.error("Failed to load apartments:", error);
      Alert.alert("Error", "Failed to load apartments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadApartments();
  }, []);

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Apartment",
      `Are you sure you want to delete "${name}"? This will remove all customer associations.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteApartment(id);
                setApartments(prev => prev.filter(apt => apt.id !== id));
                Alert.alert("Success", "Apartment deleted successfully");
              } catch (error) {
                console.error("Failed to delete apartment:", error);
                Alert.alert("Error", "Failed to delete apartment");
              }
            })();
          },
        },
      ]
    );
  };

  const handleViewCustomers = (apartmentId: number, apartmentName: string) => {
    // Navigate to customers screen with filter
    router.push({
      pathname: "/(authenticated)/caterer/customers",
      params: { apartmentId: apartmentId.toString(), apartmentName },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apartments</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="business" size={20} color="#10B981" />
          <Text style={styles.statLabel}>Total Apartments</Text>
          <Text style={styles.statValue}>{apartments.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="people" size={20} color="#3B82F6" />
          <Text style={styles.statLabel}>Total Customers</Text>
          <Text style={styles.statValue}>
            {apartments.reduce((sum, apt) => sum + (apt.customerCount || 0), 0)}
          </Text>
        </View>
      </View>

      {/* Apartments List */}
      <FlatList
        data={apartments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ApartmentCard
            apartment={item}
            onDelete={handleDelete}
            onViewCustomers={handleViewCustomers}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="business-outline" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyText}>No apartments yet</Text>
            <Text style={styles.emptySubtext}>
              Create apartments to organize your customers by location
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(authenticated)/caterer/apartment-add")}
            >
              <Ionicons name="add-circle" size={20} color="#10B981" />
              <Text style={styles.emptyButtonText}>Add Your First Apartment</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB - Add Apartment */}
      {apartments.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(authenticated)/caterer/apartment-add")}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
