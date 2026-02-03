import { StyleSheet } from "react-native";

export const menuFormStyles = StyleSheet.create({
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
