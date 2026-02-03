import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem, FoodItem } from "@/src/types/menu";

type Props = {
  item: FoodItem | MenuItem;
};

export default function FoodCard({ item }: Props) {
  const router = useRouter();
  // Use rating from item or default to "4.5"
  const rating = item.rating || "4.5";

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/(authenticated)/customer/details",
          params: {
            id: String(item.id),
            name: item.name,
            price: String(item.price),
            rating: rating,
            image: item.image,
            description: item.description,
            category: item.category,
            cuisine: item.cuisine,
          }
        });
      }}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      {/* Image Container with Overlay */}
      <View style={styles.imageWrapper}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />

          {/* Subtle gradient overlay */}
          <View style={styles.imageOverlay} />

          {/* Category Badge - Premium Design */}
          <View style={styles.categoryBadge}>
            <View style={[styles.vegIndicator, item.category === 'non-veg' && styles.nonVegIndicator]}>
              <View style={[styles.vegDot, item.category === 'non-veg' && styles.nonVegDot]} />
            </View>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Header with Name and Rating */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Cuisine Badge */}
        {Boolean(item.cuisine) && (
          <View style={styles.cuisineBadge}>
            <Text style={styles.cuisineText}>{item.cuisine}</Text>
          </View>
        )}

        {/* Description/Type indicator */}
        <Text style={styles.subtitle} numberOfLines={1}>
          {(() => {
            const categoryLabel = item.category === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
            if (item.type) {
              const capitalizedType = item.type.charAt(0).toUpperCase() + item.type.slice(1);
              return `${capitalizedType} • ${categoryLabel}`;
            }
            return categoryLabel;
          })()}
        </Text>

        {/* Footer with Price */}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.04)",
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  imageWrapper: {
    padding: 10,
  },
  imageContainer: {
    position: "relative",
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  categoryBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 7,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  vegIndicator: {
    width: 18,
    height: 18,
    borderWidth: 2.5,
    borderColor: "#10B981",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  nonVegIndicator: {
    borderColor: "#EF4444",
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  nonVegDot: {
    backgroundColor: "#EF4444",
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 4,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    gap: 3,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cuisineBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 3,
  },
  cuisineText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
});
