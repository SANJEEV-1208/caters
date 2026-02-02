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
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { useCart } from "@/src/context/CartContext";
import { getCatererMenuItems } from "@/src/api/catererMenuApi";
import { MenuItem } from "@/src/types/menu";

export default function RestaurantMenuBrowser() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const params = useLocalSearchParams();

  const catererId = Number(params?.catererId || 0);
  const tableNumber = Number(params?.tableNumber) || undefined;
  const restaurantName = (params?.restaurantName as string) || "";

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<"veg" | "non-veg" | "all">("all");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // Debug: Log user data
  useEffect(() => {
    console.log('=== Restaurant Menu - User Debug ===');
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User ID:', user?.id);
    console.log('User role:', user?.role);
    console.log('Is Authenticated:', user !== null);
  }, [user]);

  useEffect(() => {
    loadMenuItems();
  }, [catererId]);

  const loadMenuItems = async () => {
    try {
      console.log('Loading restaurant menu for catererId:', catererId);

      // Fetch ALL menu items for this restaurant (no date filter)
      // Restaurants serve the same items regularly, unlike daily catering menus
      const items = await getCatererMenuItems(catererId);
      console.log('Found menu items:', items.length);

      // Filter by stock availability
      const availableItems = items.filter((item) => item.inStock);
      console.log('In stock items:', availableItems.length);

      setMenuItems(availableItems);
    } catch (error) {
      console.error("Failed to load menu:", error);
      Alert.alert("Error", "Failed to load menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    return filtered;
  };

  const handleAddToCart = async (item: MenuItem) => {
    setAddingToCart(item.id);
    try {
      // For restaurant orders, we need to pass table context through cart
      // The item will be added to cart with the table information
      const cartItem = {
        ...item,
        quantity: 1,
      };
      
      addToCart(cartItem as any);
      Alert.alert("Added", `${item.name} added to cart`, [
        {
          text: "Continue Shopping",
          onPress: () => {},
        },
        {
          text: "Go to Cart",
          onPress: () => {
            // When going to cart, we need to navigate with table and caterer context
            router.push({
              pathname: "/(authenticated)/customer/restaurant-checkout",
              params: {
                catererId: String(catererId),
                tableNumber: String(tableNumber),
                restaurantName,
              },
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add item to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          {tableNumber && (
            <View style={styles.tableBadge}>
              <Ionicons name="restaurant" size={12} color="#F59E0B" />
              <Text style={styles.tableInfo}>Table {tableNumber}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {(["all", "veg", "non-veg"] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                selectedCategory === cat && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              {cat !== "all" && (
                <View
                  style={[
                    styles.filterDot,
                    {
                      backgroundColor:
                        cat === "veg" ? "#10B981" : "#EF4444",
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === cat && styles.filterButtonTextActive,
                ]}
              >
                {cat === "all" ? "All Items" : cat === "veg" ? "Vegetarian" : "Non-Veg"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.menuCard}>
            <View style={styles.cardRow}>
              {/* Image */}
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}

              {/* Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.titleSection}>
                    <View style={styles.nameRow}>
                      <View
                        style={[
                          styles.categoryIndicator,
                          {
                            borderColor:
                              item.category === "veg" ? "#10B981" : "#EF4444",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.categoryDot,
                            {
                              backgroundColor:
                                item.category === "veg" ? "#10B981" : "#EF4444",
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    </View>

                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>

                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                    disabled={addingToCart === item.id}
                  >
                    {addingToCart === item.id ? (
                      <ActivityIndicator color="#F59E0B" size="small" />
                    ) : (
                      <>
                        <Ionicons name="add-circle" size={20} color="#F59E0B" />
                        <Text style={styles.addButtonText}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No items available</Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory === "all"
                ? "Menu is currently empty"
                : `No ${selectedCategory === "veg" ? "vegetarian" : "non-veg"} items available`}
            </Text>
          </View>
        }
        contentContainerStyle={[styles.listContent, filteredItems.length === 0 && { flex: 1 }]}
      />

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => {
            router.push({
              pathname: "/(authenticated)/customer/restaurant-checkout",
              params: {
                catererId: String(catererId),
                tableNumber: String(tableNumber),
                restaurantName,
              },
            });
          }}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
          <Ionicons name="cart" size={24} color="#FFFFFF" />
          <Text style={styles.floatingCartText}>View Cart</Text>
        </TouchableOpacity>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    paddingTop: 48,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  tableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tableInfo: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#F59E0B",
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
  },
  itemImage: {
    width: 120,
    height: 120,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardTop: {
    flex: 1,
  },
  titleSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  categoryIndicator: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  itemDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  addButtonText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  floatingCart: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "700",
  },
  floatingCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
