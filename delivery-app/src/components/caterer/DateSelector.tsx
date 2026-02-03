import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { menuFormStyles } from "@/src/styles/menuFormStyles";

interface DateOption {
  label: string;
  value: string;
}

interface DateSelectorProps {
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  disabled?: boolean;
}

const getDates = (): DateOption[] => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    let label;
    if (i === 0) {
      label = "Today";
    } else if (i === 1) {
      label = "Tomorrow";
    } else {
      label = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    dates.push({
      label,
      value: date.toISOString().split("T")[0],
    });
  }
  return dates;
};

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDates,
  onToggleDate,
  disabled = false,
}) => {
  const dates = getDates();

  return (
    <View style={menuFormStyles.field}>
      <Text style={menuFormStyles.label}>Available Dates * (Select at least one)</Text>
      <View style={styles.datesGrid}>
        {dates.map((date) => (
          <TouchableOpacity
            key={date.value}
            style={[
              styles.dateChip,
              selectedDates.includes(date.value) && styles.dateChipActive,
            ]}
            onPress={() => { onToggleDate(date.value); }}
            disabled={disabled}
          >
            <Ionicons
              name={
                selectedDates.includes(date.value)
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={selectedDates.includes(date.value) ? "#10B981" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.dateChipText,
                selectedDates.includes(date.value) && styles.dateChipTextActive,
              ]}
            >
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  datesGrid: {
    gap: 8,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
  },
  dateChipActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  dateChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    flex: 1,
  },
  dateChipTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
});
