import { showValidationError } from './alertHelpers';

export interface MenuFormData {
  name: string;
  price: string;
  imageUrl: string;
  cuisine?: string;
  requireCuisine?: boolean;
  requireDates?: boolean;
  selectedDates?: string[];
}

export const validateMenuForm = (data: MenuFormData): { valid: boolean; priceNum?: number } => {
  // Validate name
  if (!data.name.trim()) {
    showValidationError("Item Name", "Please enter item name");
    return { valid: false };
  }

  // Validate price
  if (!data.price.trim()) {
    showValidationError("Price", "Please enter price");
    return { valid: false };
  }

  const priceNum = Number.parseFloat(data.price);
  if (Number.isNaN(priceNum) || priceNum <= 0) {
    showValidationError("Price", "Please enter a valid price");
    return { valid: false };
  }

  // Validate cuisine (only if required - home kitchen needs it, restaurant doesn't)
  if (data.requireCuisine !== false && (!data.cuisine || !data.cuisine.trim())) {
    showValidationError("Cuisine", "Please select a cuisine or add a new one");
    return { valid: false };
  }

  // Validate dates if required
  if (data.requireDates && (!data.selectedDates || data.selectedDates.length === 0)) {
    showValidationError("Available Dates", "Please select at least one available date");
    return { valid: false };
  }

  // Validate image
  if (!data.imageUrl.trim()) {
    showValidationError("Food Image", "Please upload a food image");
    return { valid: false };
  }

  return { valid: true, priceNum };
};
