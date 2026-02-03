import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem } from "@/src/types/menu";
import { getCatererMenuItems } from "@/src/api/catererMenuApi";

type ItemHistoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectItem: (item: MenuItem) => void;
  catererId: number;
};

export default function ItemHistoryModal({
  visible,
  onClose,
  onSelectItem,
  catererId,
}: ItemHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [uniqueItems, setUniqueItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (visible && catererId) {
      void fetchItems();
    }
  }, [visible, catererId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const menuItems = await getCatererMenuItems(catererId);

      // Get unique items based on name (to avoid showing duplicates with different dates)
      const unique = menuItems.reduce((acc: MenuItem[], current) => {
        const exists = acc.find(item =>
          item.name.toLowerCase() === current.name.toLowerCase()
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setUniqueItems(unique);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: MenuItem) => {
    onSelectItem(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select from Previous Items</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {(() => {
            if (loading) {
              return (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.loadingText}>Loading your items...</Text>
                </View>
              );
            }

            if (uniqueItems.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No items found</Text>
                  <Text style={styles.emptySubtext}>
                    Create your first menu item to get started
                  </Text>
                </View>
              );
            }

            return (
              <ScrollView style={styles.itemsList} contentContainerStyle={styles.itemsListContent}>
              {uniqueItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => { handleSelectItem(item); }}
                >
                  {/* Item Image */}
                  <Image source={{ uri: item.image }} style={styles.itemImage} />

                  <View style={styles.itemInfo}>
                    {/* Name and Category */}
                    <View style={styles.itemHeader}>
                      <View style={styles.nameRow}>
                        <View
                          style={[
                            styles.vegDot,
                            { backgroundColor: item.category === "veg" ? "#10B981" : "#EF4444" },
                          ]}
                        />
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>₹{item.price}</Text>
                    </View>

                    {/* Cuisine and Type */}
                    <View style={styles.itemTags}>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.cuisine}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          {item.type.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>

                  {/* Select Icon */}
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
              </ScrollView>
            );
          })()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
  },
  itemTags: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  itemDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
});
