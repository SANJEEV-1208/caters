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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: item.category === "veg" ? "#10B981" : "#EF4444" },
          ]}
        >
          <View
            style={[
              styles.categoryDot,
              { backgroundColor: item.category === "veg" ? "#10B981" : "#EF4444" },
            ]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.price}>₹{item.price}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.availability}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.availabilityText}>
            {item.availableDates.length} day{item.availableDates.length > 1 ? 's' : ''}
          </Text>
        </View>

        {onToggleStock && (
          <View style={styles.stockControl}>
            <Text style={styles.stockLabel}>In Stock</Text>
            <Switch
              value={item.inStock}
              onValueChange={(value) => onToggleStock(item.id, value)}
              trackColor={{ false: "#E5E7EB", true: "#10B981" }}
              thumbColor={item.inStock ? "#FFFFFF" : "#F3F4F6"}
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
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  typeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  availability: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: "#6B7280",
  },
  stockControl: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  stockLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
