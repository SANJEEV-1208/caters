import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { getCatererMenuItems, deleteMenuItem } from "@/src/api/catererMenuApi";
import { MenuItem } from "@/src/types/menu";

export default function RestaurantMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      void loadMenuItems();
    }, [])
  );

  const loadMenuItems = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const items = await getCatererMenuItems(user.id);
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to load menu items:", error);
      Alert.alert("Error", "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this menu item?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            setDeleting(itemId);
            try {
              await deleteMenuItem(itemId);
              setMenuItems(menuItems.filter((item) => item.id !== itemId));
              Alert.alert("Success", "Item deleted successfully");
            } catch (error) {
              console.error("Failed to delete item:", error);
              Alert.alert("Error", "Failed to delete item");
            } finally {
              setDeleting(null);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
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
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Menu Items</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Menu Items List */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.menuCard}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(authenticated)/caterer/restaurant/menu-edit",
                  params: {
                    id: String(item.id),
                    name: item.name,
                    price: String(item.price),
                    category: item.category,
                    image: JSON.stringify(item.image),
                    description: item.description || "",
                  },
                })
              }
              style={styles.cardPressable}
            >
              {/* Image with category indicator overlay */}
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="fast-food-outline" size={40} color="#D1D5DB" />
                  </View>
                )}
                <View
                  style={[
                    styles.categoryIndicator,
                    {
                      backgroundColor:
                        item.category === "veg" ? "#10B981" : "#EF4444",
                    },
                  ]}
                >
                  <View style={styles.categoryDot} />
                </View>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleSection}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color:
                            item.category === "veg" ? "#059669" : "#DC2626",
                        },
                      ]}
                    >
                      {item.category === "veg" ? "Vegetarian" : "Non-Veg"}
                    </Text>
                  </View>
                </View>

                {item.description && (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* Bottom Row: Price and Stock */}
                <View style={styles.bottomRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceCurrency}>₹</Text>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                  </View>
                  <View
                    style={[
                      styles.stockBadge,
                      item.inStock ? styles.stockAvailable : styles.stockOut,
                    ]}
                  >
                    <View
                      style={[
                        styles.stockDot,
                        {
                          backgroundColor: item.inStock
                            ? "#10B981"
                            : "#EF4444",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.stockText,
                        {
                          color: item.inStock ? "#059669" : "#DC2626",
                        },
                      ]}
                    >
                      {item.inStock ? "Available" : "Out of Stock"}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Delete Button - Outside pressable for better UX */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
              disabled={deleting === item.id}
              activeOpacity={0.7}
            >
              {deleting === item.id ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash" size={20} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="menu-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first item to get started
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => router.push("/(authenticated)/caterer/restaurant/menu-add")}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addFirstButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button - Bottom Right */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(authenticated)/caterer/restaurant/menu-add")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for FAB
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardPressable: {
    flexDirection: "row",
  },
  imageContainer: {
    width: 120,
    height: 140,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F9FAFB",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIndicator: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
    marginRight: 2,
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F59E0B",
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  stockAvailable: {
    backgroundColor: "#D1FAE5",
  },
  stockOut: {
    backgroundColor: "#FEE2E2",
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
