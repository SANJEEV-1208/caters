import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import ApartmentCard from "@/src/components/caterer/ApartmentCard";
import { getCatererApartments, deleteApartment, getCustomerApartmentLinks } from "@/src/api/apartmentApi";
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from "@/src/utils/alertHelpers";
import { HeaderComponent } from "@/src/components/common";
import { screenStyles } from "@/src/styles/screenStyles";

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
      showErrorAlert("Failed to load apartments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadApartments();
  }, []);

  const performDelete = async (id: number) => {
    try {
      await deleteApartment(id);
      setApartments(prev => prev.filter(apt => apt.id !== id));
      showSuccessAlert("Apartment deleted successfully");
    } catch (error) {
      console.error("Failed to delete apartment:", error);
      showErrorAlert("Failed to delete apartment");
    }
  };

  // FIXED: Correct syntax for showConfirmAlert call
  const handleDelete = (id: number, name: string) => {
    showConfirmAlert(
      `Are you sure you want to delete "${name}"? This will remove all customer associations.`,
      () => {
        performDelete(id).catch(console.error);
      },
      undefined,
      "Delete Apartment"
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
      <View style={screenStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <HeaderComponent title="Apartments" onBackPress={() => router.back()} />

      {/* Stats Bar */}
      <View style={screenStyles.statsBar}>
        <View style={screenStyles.statItem}>
          <Ionicons name="business" size={20} color="#10B981" />
          <Text style={screenStyles.statLabel}>Total Apartments</Text>
          <Text style={screenStyles.statValue}>{apartments.length}</Text>
        </View>
        <View style={screenStyles.statDivider} />
        <View style={screenStyles.statItem}>
          <Ionicons name="people" size={20} color="#3B82F6" />
          <Text style={screenStyles.statLabel}>Total Customers</Text>
          <Text style={screenStyles.statValue}>
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
        contentContainerStyle={screenStyles.listContent}
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
          style={screenStyles.fab}
          onPress={() => router.push("/(authenticated)/caterer/apartment-add")}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});