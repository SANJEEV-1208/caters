import { Alert } from "react-native";

export interface MenuFormData {
  name: string;
  price: string;
  imageUrl: string;
  requireDates?: boolean;
  selectedDates?: string[];
}

export const validateMenuForm = (data: MenuFormData): { valid: boolean; priceNum?: number } => {
  // Validate name
  if (!data.name.trim()) {
    Alert.alert("Error", "Please enter item name");
    return { valid: false };
  }

  // Validate price
  if (!data.price.trim()) {
    Alert.alert("Error", "Please enter price");
    return { valid: false };
  }

  const priceNum = Number.parseFloat(data.price);
  if (Number.isNaN(priceNum) || priceNum <= 0) {
    Alert.alert("Error", "Please enter a valid price");
    return { valid: false };
  }

  // Validate dates if required
  if (data.requireDates && (!data.selectedDates || data.selectedDates.length === 0)) {
    Alert.alert("Error", "Please select at least one available date");
    return { valid: false };
  }

  // Validate image
  if (!data.imageUrl.trim()) {
    Alert.alert("Error", "Please enter image URL");
    return { valid: false };
  }

  return { valid: true, priceNum };
};
