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
