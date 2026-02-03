import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "main_course"] as const;
type MealType = typeof MEAL_TYPES[number];

interface MealTypeSelectorProps {
  selectedType: MealType;
  onSelectType: (type: MealType) => void;
  disabled?: boolean;
}

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  disabled = false,
}) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Meal Type *</Text>
      <View style={styles.chipGroup}>
        {MEAL_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, selectedType === type && styles.chipActive]}
            onPress={() => { onSelectType(type); }}
            disabled={disabled}
          >
            <Text style={[styles.chipText, selectedType === type && styles.chipTextActive]}>
              {type.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
