import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuItem } from "@/src/types/menu";

export type CartItem = MenuItem & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: number) => void;
  removeMultipleItems: (ids: number[]) => void;
  clearCart: () => void;
  reorderItems: (items: CartItem[]) => void;
  totalAmount: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);
const CART_STORAGE_KEY = "@delivery_app_cart";

// Helper: Merge a single order item into cart array
const mergeOrderItemIntoCart = (cart: CartItem[], orderItem: CartItem): CartItem[] => {
  const existingIndex = cart.findIndex(i => i.id === orderItem.id);

  if (existingIndex >= 0) {
    const updated = [...cart];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + orderItem.quantity
    };
    return updated;
  }

  return [...cart, { ...orderItem }];
};

// Helper: Merge multiple order items into cart
const mergeOrderItemsIntoCart = (cart: CartItem[], items: CartItem[]): CartItem[] => {
  let updatedCart = [...cart];

  for (const orderItem of items) {
    updatedCart = mergeOrderItemIntoCart(updatedCart, orderItem);
  }

  return updatedCart;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void loadCart();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      void saveCart();
    }
  }, [cart, isLoaded]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);

      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev =>
      prev
        .map(i =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter(i => i.quantity > 0)
    );
  };

  const removeMultipleItems = (ids: number[]) => {
    setCart(prev => prev.filter(item => !ids.includes(item.id)));
  };

  const clearCart = () => { setCart([]); };

  /**
   * ⭐ RE-ORDER LOGIC
   * Adds past order items with exact quantities
   */
  const reorderItems = (items: CartItem[]) => {
    setCart(prevCart => mergeOrderItemsIntoCart(prevCart, items));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeMultipleItems,
        clearCart,
        reorderItems,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
