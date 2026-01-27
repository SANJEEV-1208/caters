 import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
  } from "react-native";
  import { useLocalSearchParams, useRouter } from "expo-router";
  import { useCart } from "@/src/context/CartContext";
  import { FoodItem } from "@/src/components/FoodCard";
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
      loadCuisineItems();
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
          item.availableDates &&
          item.availableDates.includes(today) &&
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

      const foodItem: FoodItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        rating: 4.5, // Default rating for menu items
        image: item.image,
        description: item.description,
        category: item.category,
        cuisine: item.cuisine,
      };

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
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />

              {/* Category Badge */}
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor:
                      item.category === "veg" ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                <View style={styles.categoryDot} />
              </View>
            </View>

            {/* Details */}
            <View style={styles.details}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{item.price}</Text>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Add to Cart / Counter */}
          <View style={styles.cartSection}>
            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(foodItem)}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => removeFromCart(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => addToCart(foodItem)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    };

    if (loading) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      );
    }

    return (
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
      paddingTop: 48,
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
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      overflow: "hidden",
    },

    cardContent: {
      flexDirection: "row",
      padding: 12,
    },

    imageContainer: {
      position: "relative",
      width: 100,
      height: 100,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#F3F4F6",
    },

    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    categoryBadge: {
      position: "absolute",
      top: 6,
      left: 6,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },

    categoryDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#fff",
    },

    details: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "space-between",
    },

    itemName: {
      fontSize: 17,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 4,
    },

    description: {
      fontSize: 13,
      color: "#6B7280",
      lineHeight: 18,
      marginBottom: 8,
    },

    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    price: {
      fontSize: 18,
      fontWeight: "700",
      color: "#10B981",
    },

    typeContainer: {
      backgroundColor: "#EFF6FF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },

    typeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#3B82F6",
      textTransform: "capitalize",
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

    cartSection: {
      paddingHorizontal: 12,
      paddingBottom: 12,
    },

    addButton: {
      backgroundColor: "#10B981",
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
      width : 100,
      marginLeft : "70%",
    },

    addButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    counter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#F3F4F6",
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      width : 100,
      marginLeft : "70%",
    },

    counterBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    counterBtnText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#10B981",
    },

    quantity: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1A1A1A",
      minWidth: 30,
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