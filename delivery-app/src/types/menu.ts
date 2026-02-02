export type MenuItem = {
  id: number;
  catererId: number;
  name: string;
  price: number;
  category: "veg" | "non-veg";
  cuisine: string;
  type: "breakfast" | "lunch" | "dinner" | "snack" | "main_course";
  image: string;
  description: string;
  availableDates: string[]; // YYYY-MM-DD format
  inStock: boolean;
  createdAt: string;
  rating?: string; // Optional rating for compatibility with FoodItem
};

export type MenuFormData = {
  name: string;
  description: string;
  price: string;
  category: "veg" | "non-veg";
  cuisine: string;
  type: "breakfast" | "lunch" | "dinner" | "snack" | "main_course";
  image: string;
  availableDates: string[];
  inStock: boolean;
};

// Legacy FoodItem type for backward compatibility
export type FoodItem = {
  id: number;
  name: string;
  rating?: string;
  price: number;
  image: any;
  description: string;
  category: "veg" | "non-veg";
  cuisine: string;
};
