import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { menuFormStyles } from "@/src/styles/menuFormStyles";

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
    <View style={menuFormStyles.field}>
      <Text style={menuFormStyles.label}>Meal Type *</Text>
      <View style={menuFormStyles.chipGroup}>
        {MEAL_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[menuFormStyles.chip, selectedType === type && menuFormStyles.chipActive]}
            onPress={() => { onSelectType(type); }}
            disabled={disabled}
          >
            <Text style={[menuFormStyles.chipText, selectedType === type && menuFormStyles.chipTextActive]}>
              {type.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
