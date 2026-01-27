import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "@/src/types/order";

const ORDER_HISTORY_KEY = "@delivery_app_orders";

export const saveOrder = async (order: Order): Promise<void> => {
  try {
    const existingOrders = await getOrders();
    const updatedOrders = [order, ...existingOrders]; // New orders first
    await AsyncStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(updatedOrders));
  } catch (error) {
    console.error("Failed to save order:", error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const ordersJson = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
    if (ordersJson) {
      return JSON.parse(ordersJson);
    }
    return [];
  } catch (error) {
    console.error("Failed to load orders:", error);
    return [];
  }
};

export const clearOrderHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ORDER_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear order history:", error);
    throw error;
  }
};
