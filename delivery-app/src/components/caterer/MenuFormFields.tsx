import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface MenuFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  category: "veg" | "non-veg";
  setCategory: (value: "veg" | "non-veg") => void;
  description: string;
  setDescription: (value: string) => void;
  disabled?: boolean;
}

export const MenuFormFields: React.FC<MenuFormFieldsProps> = ({
  name,
  setName,
  price,
  setPrice,
  category,
  setCategory,
  description,
  setDescription,
  disabled = false,
}) => {
  return (
    <>
      {/* Item Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Item Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Chicken Biryani"
          value={name}
          onChangeText={setName}
          editable={!disabled}
          placeholderTextColor="#A0AEC0"
        />
      </View>

      {/* Price */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Price (₹) <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.priceWrapper}>
          <Text style={styles.priceCurrency}>₹</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="e.g., 180"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            editable={!disabled}
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      {/* Category */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryButtonsGroup}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              category === "veg" && styles.categoryButtonActive,
            ]}
            onPress={() => { setCategory("veg"); }}
            disabled={disabled}
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: category === "veg" ? "#10B981" : "#9CA3AF" },
              ]}
            />
            <Text
              style={[
                styles.categoryButtonText,
                category === "veg" && styles.categoryButtonTextActive,
              ]}
            >
              Vegetarian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryButton,
              category === "non-veg" && styles.categoryButtonActive,
            ]}
            onPress={() => { setCategory("non-veg"); }}
            disabled={disabled}
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: category === "non-veg" ? "#EF4444" : "#9CA3AF" },
              ]}
            />
            <Text
              style={[
                styles.categoryButtonText,
                category === "non-veg" && styles.categoryButtonTextActive,
              ]}
            >
              Non-Vegetarian
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textAreaInput]}
          placeholder="Describe your dish..."
          value={description}
          onChangeText={setDescription}
          editable={!disabled}
          multiline
          numberOfLines={3}
          placeholderTextColor="#A0AEC0"
          textAlignVertical="top"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: "top",
  },
  priceWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingLeft: 14,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
  },
  categoryButtonsGroup: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryButtonTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
});
