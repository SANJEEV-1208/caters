import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Apartment } from "@/src/types/apartment";

type ApartmentCardProps = {
  apartment: Apartment;
  customerCount?: number;
  onPress?: () => void;
  onEdit?: (id: number, name: string) => void;
  onDelete?: (id: number, name: string) => void;
  onViewCustomers?: (apartmentId: number, apartmentName: string) => void;
};

export default function ApartmentCard({
  apartment,
  customerCount = 0,
  onPress,
  onEdit,
  onDelete,
  onViewCustomers,
}: ApartmentCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="business" size={40} color="#10B981" />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{apartment.name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.address} numberOfLines={2}>
            {apartment.address}
          </Text>
        </View>

        <View style={styles.codeRow}>
          <View style={styles.codeBadge}>
            <Ionicons name="key-outline" size={14} color="#3B82F6" />
            <Text style={styles.codeText}>{apartment.accessCode}</Text>
          </View>

          {customerCount > 0 && (
            <TouchableOpacity
              style={styles.customerBadge}
              onPress={() => onViewCustomers?.(apartment.id, apartment.name)}
            >
              <Ionicons name="people" size={12} color="#10B981" />
              <Text style={styles.customerCount}>
                {customerCount} customer{customerCount > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={() => { onEdit(apartment.id, apartment.name); }} style={styles.actionButton}>
            <Ionicons name="create-outline" size={22} color="#3B82F6" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={() => { onDelete(apartment.id, apartment.name); }} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  address: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },
  customerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  customerCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
});
