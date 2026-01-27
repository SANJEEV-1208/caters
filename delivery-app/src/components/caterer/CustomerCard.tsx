import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Customer = {
  id: number;
  name: string;
  phone: string;
  apartmentName?: string;
  apartmentId?: number;
  addedVia: "code" | "manual";
  orderCount: number;
};

type CustomerCardProps = {
  customer: Customer;
  onPress?: () => void;
  onRemove?: () => void;
};

export default function CustomerCard({
  customer,
  onPress,
  onRemove,
}: CustomerCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={48} color="#10B981" />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{customer.name}</Text>
          {customer.addedVia === "code" && (
            <View style={styles.codeBadge}>
              <Ionicons name="key" size={10} color="#10B981" />
            </View>
          )}
        </View>

        <View style={styles.row}>
          <Ionicons name="call-outline" size={14} color="#6B7280" />
          <Text style={styles.phone}>{customer.phone}</Text>
        </View>

        {customer.apartmentName ? (
          <View style={styles.row}>
            <Ionicons name="business-outline" size={14} color="#10B981" />
            <Text style={styles.apartment}>{customer.apartmentName}</Text>
          </View>
        ) : (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={14} color="#9CA3AF" />
            <Text style={styles.directText}>Direct Customer</Text>
          </View>
        )}

        {customer.orderCount > 0 && (
          <View style={styles.orderBadge}>
            <Ionicons name="bag-outline" size={12} color="#10B981" />
            <Text style={styles.orderCount}>{customer.orderCount} orders</Text>
          </View>
        )}
      </View>

      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}

      {!onRemove && (
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      )}
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
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  codeBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phone: {
    fontSize: 13,
    color: "#6B7280",
  },
  apartment: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
  },
  directText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    backgroundColor: "#F0FDF4",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  removeButton: {
    padding: 8,
  },
});
