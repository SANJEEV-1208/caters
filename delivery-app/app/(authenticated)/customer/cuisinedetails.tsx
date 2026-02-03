 import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
  } from "react-native";
  import { useLocalSearchParams, useRouter } from "expo-router";
  import { useCart } from "@/src/context/CartContext";
  import { useAuth } from "@/src/context/AuthContext";
  import { getCatererMenuItems } from "@/src/api/catererMenuApi";
  import { MenuItem } from "@/src/types/menu";
  import { useState, useEffect } from "react";

  export default function CuisineDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addToCart, cart, removeFromCart } = useCart();
    const { selectedCatererId } = useAuth();
    const [cuisineItems, setCuisineItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const cuisineName = params.cuisine as string;

    useEffect(() => {
      void loadCuisineItems();
    }, [cuisineName, selectedCatererId]);

    const loadCuisineItems = async () => {
      if (!selectedCatererId) {
        setLoading(false);
        return;
      }

      try {
        // Get TODAY's date
        const today = new Date().toISOString().split('T')[0];

        // Get all menu items from caterer
        const allMenuItems = await getCatererMenuItems(selectedCatererId);

        // Filter by cuisine AND today's date AND in stock
        const filteredItems = allMenuItems.filter(item =>
          item.cuisine === cuisineName &&
          item.availableDates?.includes(today) &&
          item.inStock
        );

        setCuisineItems(filteredItems);
      } catch (error) {
        console.error("Failed to load cuisine items:", error);
        setCuisineItems([]);
      } finally {
        setLoading(false);
      }
    };

    const getCartQuantity = (itemId: number) => {
      const cartItem = cart.find((i) => i.id === itemId);
      return cartItem?.quantity ?? 0;
    };

    const renderFoodItem = ({ item }: { item: MenuItem }) => {
      const quantity = getCartQuantity(item.id);

      return (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() =>
              router.push({
                pathname: "/(authenticated)/customer/details",
                params: {
                  id: String(item.id),
                  name: item.name,
                  price: String(item.price),
                  rating: "4.5",
                  image: JSON.stringify(item.image),
                  description: item.description,
                  category: item.category,
                  cuisine: item.cuisine,
                  type: item.type,
                  availableDates: JSON.stringify(item.availableDates),
                },
              })
            }
            activeOpacity={0.7}
          >
            {/* Image Section with Enhanced Badge */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />

              {/* Gradient Overlay */}
              <View style={styles.imageOverlay} />

              {/* Category Badge with Icon */}
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor:
                      item.category === "veg" ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>
                  {item.category === "veg" ? "🌿" : "🍖"}
                </Text>
              </View>

              {/* Meal Type Badge */}
              <View style={styles.mealTypeBadge}>
                <Text style={styles.mealTypeIcon}>
                  {(() => {
                    if (item.type === "breakfast") return "☀️";
                    if (item.type === "lunch") return "🌤️";
                    if (item.type === "dinner") return "🌙";
                    return "🍽️";
                  })()}
                </Text>
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.details}>
              {/* Name and Type Row */}
              <View style={styles.nameRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description} numberOfLines={2}>
                {item.description || "Delicious and freshly prepared"}
              </Text>

              {/* Bottom Info Row */}
              <View style={styles.bottomRow}>
                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceSymbol}>₹</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>

                {/* Add to Cart / Counter */}
                {quantity === 0 ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addButtonIcon}>+</Text>
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.counter}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.counterBtnText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{quantity}</Text>

                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    if (loading) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
          <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
          <View style={[styles.container, styles.centerContent]}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{cuisineName}</Text>
            <Text style={styles.headerSubtitle}>
              {cuisineItems.length} varieties available
            </Text>
          </View>
        </View>

        {/* Food Items List */}
        <FlatList
          data={cuisineItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFoodItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items available</Text>
            </View>
          }
        />

        {/* Cart Button */}
        {cart.length > 0 && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("./cart")}
            activeOpacity={0.8}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
            <Text style={styles.cartButtonText}>View Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#E8ECF1",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    backIcon: {
      fontSize: 24,
      color: "#1A1A1A",
      fontWeight: "600",
    },

    headerContent: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 2,
    },

    headerSubtitle: {
      fontSize: 13,
      color: "#6B7280",
      fontWeight: "500",
    },

    listContent: {
      padding: 16,
      paddingBottom: 100,
    },

    card: {
      backgroundColor: "#fff",
      borderRadius: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#F3F4F6",
    },

    cardContent: {
      flexDirection: "row",
      padding: 14,
    },

    imageContainer: {
      position: "relative",
      width: 130,
      height: 130,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#F9FAFB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },

    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    imageOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "35%",
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },

    categoryBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },

    categoryIcon: {
      fontSize: 16,
    },

    mealTypeBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },

    mealTypeIcon: {
      fontSize: 16,
    },

    details: {
      flex: 1,
      marginLeft: 14,
      justifyContent: "space-between",
    },

    nameRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },

    itemName: {
      fontSize: 18,
      fontWeight: "800",
      color: "#1A1A1A",
      flex: 1,
      marginRight: 8,
      lineHeight: 22,
      letterSpacing: -0.3,
    },

    typeContainer: {
      backgroundColor: "#F0F9FF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#BFDBFE",
    },

    typeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#1E40AF",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },

    description: {
      fontSize: 13,
      color: "#6B7280",
      lineHeight: 18,
      marginBottom: 10,
      fontWeight: "400",
    },

    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      backgroundColor: "#F0FDF4",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#D1FAE5",
    },

    priceSymbol: {
      fontSize: 16,
      fontWeight: "800",
      color: "#10B981",
      marginRight: 2,
    },

    price: {
      fontSize: 22,
      fontWeight: "900",
      color: "#10B981",
      letterSpacing: -0.5,
    },

    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: "#6B7280",
    },

    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      backgroundColor: "#10B981",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: "#059669",
    },

    addButtonIcon: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },

    addButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    counter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: "#10B981",
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },

    counterBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: "#10B981",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },

    counterBtnText: {
      fontSize: 20,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    quantity: {
      fontSize: 18,
      fontWeight: "800",
      color: "#10B981",
      minWidth: 32,
      textAlign: "center",
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
    },

    emptyText: {
      fontSize: 16,
      color: "#6B7280",
      fontWeight: "500",
    },

    cartButton: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: "#10B981",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      gap: 8,
    },

    cartBadge: {
      backgroundColor: "#fff",
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    cartBadgeText: {
      color: "#10B981",
      fontSize: 12,
      fontWeight: "700",
    },

    cartButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });