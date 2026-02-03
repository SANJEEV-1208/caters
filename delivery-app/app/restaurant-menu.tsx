import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCatererMenuItems } from "@/src/api/catererMenuApi";
import { MenuItem } from "@/src/types/menu";

export default function RestaurantMenuBrowser() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const catererId = Number(params?.catererId || 0);
  const tableNumber = params?.tableNumber || "";
  const restaurantName = (params?.restaurantName as string) || "";

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<"veg" | "non-veg" | "all">("all");
  const [cart, setCart] = useState<{ [key: number]: number }>({}); // itemId -> quantity

  useEffect(() => {
    console.log('Loading restaurant menu - CatererId:', catererId);
    void loadMenuItems();
  }, [catererId]);

  const loadMenuItems = async () => {
    try {
      if (!catererId || catererId === 0) {
        Alert.alert("Error", "Invalid restaurant. Please scan the QR code again.");
        setLoading(false);
        return;
      }

      console.log('Fetching ALL menu items for restaurant:', catererId);
      // Fetch ALL menu items for this restaurant (restaurants serve same items daily)
      const items = await getCatererMenuItems(catererId);
      console.log('Found menu items:', items.length);

      // Filter by stock availability
      const availableItems = items.filter((item) => item.inStock);
      console.log('In stock items:', availableItems.length);

      setMenuItems(availableItems);
    } catch (error: unknown) {
      console.error("Failed to load menu:", error);
      Alert.alert(
        "Error",
        "Failed to load menu. Please try again or contact the restaurant staff."
      );
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

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((i) => i.id === Number(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (itemId in newCart && newCart[itemId] > 1) {
        newCart[itemId]--;
        return newCart;
      } else {
        const { [itemId]: _, ...rest } = newCart;
        return rest;
      }
    });
  };

  const handleCheckout = () => {
    const cartItems = menuItems
      .filter((item) => cart[item.id] > 0)
      .map((item) => ({
        ...item,
        quantity: cart[item.id],
      }));

    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first");
      return;
    }

    // Navigate to checkout with cart data
    router.push({
      pathname: "/restaurant-checkout",
      params: {
        catererId: String(catererId),
        tableNumber: String(tableNumber),
        restaurantName,
        cartData: JSON.stringify(cartItems),
        totalAmount: String(getCartTotal()),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  const filteredItems = getFilteredItems();
  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => { router.back(); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
            {tableNumber && (
              <View style={styles.tableChip}>
                <Ionicons name="location" size={14} color="#FFF" />
                <Text style={styles.tableInfo}>Table {tableNumber}</Text>
              </View>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Category Filter with Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(["all", "veg", "non-veg"] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterPill,
                selectedCategory === cat && styles.filterPillActive,
              ]}
              onPress={() => { setSelectedCategory(cat); }}
              activeOpacity={0.7}
            >
              {cat !== "all" && (
                <View
                  style={[
                    styles.filterDot,
                    {
                      backgroundColor: cat === "veg" ? "#22C55E" : "#EF4444",
                      opacity: selectedCategory === cat ? 1 : 0.6,
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.filterPillText,
                  selectedCategory === cat && styles.filterPillTextActive,
                ]}
              >
                {cat === "all" ? "All Items" : cat === "veg" ? "Vegetarian" : "Non-Veg"}
              </Text>
              {selectedCategory === cat && (
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items with Enhanced Cards */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const itemQuantity = cart[item.id] || 0;

          return (
            <View style={styles.menuCard}>
              <View style={styles.cardRow}>
                {/* Image with Overlay */}
                {item.image && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    <View style={[
                      styles.vegBadge,
                      { backgroundColor: item.category === "veg" ? "#22C55E" : "#EF4444" }
                    ]}>
                      <View style={styles.vegDot} />
                    </View>
                  </View>
                )}

                {/* Content */}
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                    </View>

                    {/* Add to Cart Button */}
                    {itemQuantity === 0 ? (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => { handleAddToCart(item); }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add-circle" size={22} color="#FF6B35" />
                        <Text style={styles.addButtonText}>ADD</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => { handleRemoveFromCart(item.id); }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove-circle" size={28} color="#FF6B35" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{itemQuantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => { handleAddToCart(item); }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add-circle" size={28} color="#FF6B35" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="restaurant-outline" size={64} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>No items available</Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory === "all"
                ? "Menu is currently being updated"
                : `No ${selectedCategory === "veg" ? "vegetarian" : "non-veg"} items available`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Checkout Button */}
      {cartItemCount > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.9}>
            <View style={styles.checkoutLeft}>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
              <View style={styles.checkoutInfo}>
                <Text style={styles.checkoutLabel}>Your Order</Text>
                <Text style={styles.checkoutTotal}>₹{cartTotal}</Text>
              </View>
            </View>
            <View style={styles.checkoutRight}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 48,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  tableChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  tableInfo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRow: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  imageContainer: {
    position: "relative",
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  vegBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTop: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 2,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FF6B35",
    backgroundColor: "#FFF",
    gap: 4,
  },
  addButtonText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    minWidth: 28,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  checkoutButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#22C55E",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#22C55E",
  },
  checkoutInfo: {
    gap: 2,
  },
  checkoutLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  checkoutRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
