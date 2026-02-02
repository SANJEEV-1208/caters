import { CartItem } from "@/src/context/CartContext";

export interface Order {
  id?: number; // Backend database ID (auto-generated)
  orderId: string; // Client-generated order ID
  customerId?: number; // Customer user ID
  catererId?: number; // Caterer user ID
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'upi' | 'cod';
  transactionId?: string;
  paymentProofImage?: string; // Payment proof screenshot URL (for UPI payments)
  deliveryAddress?: string; // Delivery location for home kitchen
  tableNumber?: number; // Table number for restaurant kitchen
  itemCount: number;
  orderDate: string; // ISO string
  deliveryDate?: string; // YYYY-MM-DD format
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt?: string; // Backend timestamp
}
