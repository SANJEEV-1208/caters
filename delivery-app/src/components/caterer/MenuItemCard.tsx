import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem } from "@/src/types/menu";
import { useRouter } from "expo-router";

type MenuItemCardProps = {
  item: MenuItem;
  onToggleStock?: (id: number, inStock: boolean) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: number) => void;
};

export default function MenuItemCard({
  item,
  onToggleStock,
  onEdit,
  onDelete,
}: MenuItemCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      {/* Horizontal Layout: Image Left, Content Right */}
      <View style={styles.mainContent}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Category Badge - Circular with Icon */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: item.category === "veg" ? "#10B981" : "#EF4444" },
            ]}
          >
            <Ionicons
              name={item.category === "veg" ? "leaf" : "nutrition"}
              size={14}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Header: Name and Stock Badge */}
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            {item.inStock ? (
              <View style={styles.stockBadge}>
                <View style={styles.stockDot} />
                <Text style={styles.stockBadgeText}>In Stock</Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, styles.stockBadgeOut]}>
                <View style={[styles.stockDot, styles.stockDotOut]} />
                <Text style={[styles.stockBadgeText, styles.stockBadgeTextOut]}>
                  Out of Stock
                </Text>
              </View>
            )}
          </View>

          {/* Cuisine Tag */}
          <View style={styles.cuisineContainer}>
            <Ionicons name="restaurant" size={12} color="#9CA3AF" />
            <Text style={styles.cuisineText}>{item.cuisine}</Text>
          </View>

          {/* Price and Meal Type */}
          <View style={styles.infoRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Ionicons
                name={
                  item.type === "breakfast" ? "sunny" :
                  item.type === "lunch" ? "partly-sunny" :
                  item.type === "dinner" ? "moon" :
                  "fast-food"
                }
                size={12}
                color="#6B7280"
              />
              <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
            </View>
          </View>

          {/* Availability Info */}
          <View style={styles.availabilityRow}>
            <View style={styles.availability}>
              <Ionicons name="calendar" size={14} color="#10B981" />
              <Text style={styles.availabilityText}>
                {item.availableDates.length} day{item.availableDates.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Section: Actions and Stock Toggle */}
      <View style={styles.footer}>
        {/* Action Buttons */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.editButton}>
              <Ionicons name="create" size={16} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stock Toggle */}
        {onToggleStock && (
          <View style={styles.stockControl}>
            <Ionicons
              name={item.inStock ? "checkmark-circle" : "close-circle"}
              size={18}
              color={item.inStock ? "#10B981" : "#9CA3AF"}
            />
            <Text style={styles.stockLabel}>Available</Text>
            <Switch
              value={item.inStock}
              onValueChange={(value) => onToggleStock(item.id, value)}
              trackColor={{ false: "#E5E7EB", true: "#10B981" }}
              thumbColor="#FFFFFF"
              style={styles.switch}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  mainContent: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    position: "relative",
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  stockBadgeOut: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  stockDotOut: {
    backgroundColor: "#9CA3AF",
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
    textTransform: "uppercase",
  },
  stockBadgeTextOut: {
    color: "#9CA3AF",
  },
  cuisineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  cuisineText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    fontStyle: "italic",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginRight: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: -0.5,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  availability: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  stockControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});
