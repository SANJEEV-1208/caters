 import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    TouchableOpacity,
  } from "react-native";
  import { useLocalSearchParams, useRouter } from "expo-router";
  import { useCart } from "@/src/context/CartContext";
  import { FoodItem } from "@/src/components/FoodCard";

  export default function DetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addToCart, cart, removeFromCart } = useCart();
    const rawCategory = params.category;

    const category =
      rawCategory === "veg" || rawCategory === "non-veg"
        ? rawCategory
        : "veg";

    const item: FoodItem = {
      id: Number(params.id),
      name: params.name as string,
      price: Number(params.price),
      rating: params.rating as string,
      image: params.image as string, // No JSON.parse needed, it's already a string URL
      description: params.description as string,
      category,
      cuisine : params.cuisine as string,
    };

    const cartItem = cart.find((i) => i.id === item.id);
    const quantity = cartItem?.quantity ?? 0;

    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Section */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Back Button Overlay */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backIcon}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category === "veg" ? "#10B981" : "#EF4444" },
                ]}
              />
              <Text style={styles.categoryText}>
                {category === "veg" ? "Vegetarian" : "Non-Vegetarian"}
              </Text>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            {/* Title and Rating */}
            <View style={styles.header}>
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStar}>⭐</Text>
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>About this dish</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.bottomSection}>
          {/* ADD TO CART */}
          {quantity === 0 && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
              <Text style={styles.addToCartPrice}>₹{item.price}</Text>
            </TouchableOpacity>
          )}

          {/* COUNTER + PAY */}
          {quantity > 0 && (
            <View style={styles.cartActions}>
              {/* Counter */}
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => removeFromCart(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantity}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => addToCart(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Proceed to Pay */}
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => router.push("./cart")}
                activeOpacity={0.8}
              >
                <Text style={styles.proceedText}>Proceed to Pay</Text>
                <Text style={styles.proceedAmount}>₹{quantity * item.price}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },

    imageContainer: {
      position: "relative",
      width: "100%",
      height: 320,
    },

    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    backButton: {
      position: "absolute",
      top: 48,
      left: 16,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 25,
      gap: 4,
      backdropFilter: "blur(10px)",
    },

    backIcon: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "600",
    },

    backText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "600",
    },

    categoryBadge: {
      position: "absolute",
      top: 48,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    categoryText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#374151",
    },

    content: {
      padding: 20,
    },

    header: {
      marginBottom: 16,
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 8,
      lineHeight: 34,
    },

    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    ratingStar: {
      fontSize: 16,
    },

    rating: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1A1A1A",
    },

    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
      marginBottom: 20,
    },

    priceLabel: {
      fontSize: 14,
      color: "#6B7280",
      fontWeight: "500",
    },

    price: {
      fontSize: 28,
      fontWeight: "700",
      color: "#10B981",
    },

    divider: {
      height: 1,
      backgroundColor: "#E5E7EB",
      marginVertical: 20,
    },

    descriptionContainer: {
      marginBottom: 100,
    },

    descriptionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1A1A1A",
      marginBottom: 12,
    },

    description: {
      fontSize: 15,
      lineHeight: 24,
      color: "#6B7280",
      fontWeight: "400",
    },

    bottomSection: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },

    addToCartButton: {
      backgroundColor: "#10B981",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    addToCartText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    addToCartPrice: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },

    cartActions: {
      flexDirection: "row",
      gap: 12,
    },

    counterContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F3F4F6",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 8,
      gap: 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    counterButton: {
      width: 36,
      height: 36,
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

    counterButtonText: {
      fontSize: 20,
      fontWeight: "600",
      color: "#10B981",
    },

    quantityContainer: {
      minWidth: 32,
      alignItems: "center",
    },

    quantity: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1A1A1A",
    },

    proceedButton: {
      flex: 1,
      backgroundColor: "#10B981",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    proceedText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    proceedAmount: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
  });