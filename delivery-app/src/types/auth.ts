export type User = {
  id: number;
  phone: string;
  email?: string;        // For caterers (optional)
  role: "customer" | "caterer";
  name: string;
  serviceName?: string;  // For home kitchen caterers
  address?: string;      // For home kitchen caterers
  caterType?: "home" | "restaurant"; // Type of catering service (home or restaurant)
  restaurantName?: string; // For restaurant caterers
  restaurantAddress?: string; // For restaurant caterers
  paymentQrCode?: string; // For caterers - GPay/UPI QR code image URL
  createdAt?: string;
};

export type Subscription = {
  id?: number;
  customerId: number;
  catererId: number;
  createdAt?: string;
  isExisting?: boolean; // Flag to indicate if this was an existing subscription
};

export type SignupData = {
  name: string;
  phone: string;
  email?: string;        // Optional email for caterers
  serviceName: string;
  address: string;
};
