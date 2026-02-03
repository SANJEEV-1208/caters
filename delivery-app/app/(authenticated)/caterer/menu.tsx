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
import MenuItemCard from "@/src/components/caterer/MenuItemCard";
import { getCatererMenuItems, deleteMenuItem, toggleStock } from "@/src/api/catererMenuApi";
import { MenuItem } from "@/src/types/menu";

const CATEGORIES = ["All", "Veg", "Non-Veg"];

export default function MenuScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Generate next 7 days
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: date.toISOString().split('T')[0],
        fullDate: date,
      });
    }
    return dates;
  };

  const dates = getDates();

  useEffect(() => {
    void loadMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, selectedDate]);

  const loadMenuItems = async () => {
    if (!user?.id) return;

    try {
      const items = await getCatererMenuItems(user.id);
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to load menu items:", error);
      Alert.alert("Error", "Failed to load menu items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== "All") {
      const category = selectedCategory.toLowerCase();
      filtered = filtered.filter(item => item.category === category);
    }

    // Filter by selected date
    filtered = filtered.filter(item => item.availableDates.includes(selectedDate));

    setFilteredItems(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadMenuItems();
  }, []);

  const handleToggleStock = async (id: number, inStock: boolean) => {
    try {
      await toggleStock(id, inStock);
      setMenuItems(prev =>
        prev.map(item => (item.id === id ? { ...item, inStock } : item))
      );
    } catch (error) {
      console.error("Failed to toggle stock:", error);
      Alert.alert("Error", "Failed to update stock status");
    }
  };

  const handleEdit = (item: MenuItem) => {
    router.push({
      pathname: "/(authenticated)/caterer/menu-edit",
      params: { itemId: item.id.toString() },
    });
  };

  const performDelete = async (id: number) => {
    try {
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
      Alert.alert("Error", "Failed to delete menu item");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Menu Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            performDelete(id).catch(console.error);
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Menu Management</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <FlatList
          horizontal
          data={dates}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateButton,
                selectedDate === item.value && styles.dateButtonActive,
              ]}
              onPress={() => { setSelectedDate(item.value); }}
            >
              <Text
                style={[
                  styles.dateLabel,
                  selectedDate === item.value && styles.dateLabelActive,
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.dateDay,
                  selectedDate === item.value && styles.dateDayActive,
                ]}
              >
                {item.fullDate.getDate()}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => { setSelectedCategory(category); }}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category && styles.filterTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onToggleStock={handleToggleStock}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
            <Ionicons name="restaurant-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No menu items for this date</Text>
            <Text style={styles.emptySubtext}>
              Add items to make them available for customers
            </Text>
          </View>
        }
      />

      {/* FAB - Add Menu Item */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(authenticated)/caterer/menu-add")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  dateContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateList: {
    paddingHorizontal: 12,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    minWidth: 70,
  },
  dateButtonActive: {
    backgroundColor: "#10B981",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  dateLabelActive: {
    color: "#FFFFFF",
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 4,
  },
  dateDayActive: {
    color: "#FFFFFF",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterButtonActive: {
    backgroundColor: "#FC8019",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
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
