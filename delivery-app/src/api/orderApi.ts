import { Order } from "../types/order";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

export const createOrder = async (orderData: Omit<Order, "id" | "createdAt">): Promise<Order> => {
  try {
    console.log('=== orderApi.createOrder ===');
    console.log('URL:', `${BASE_URL}/orders`);
    console.log('Order Data:', JSON.stringify(orderData, null, 2));

    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error Response:', errorText);

      let errorMessage = "Failed to create order";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const result = await res.json();
    console.log('✅ Order created successfully:', result);
    return result;
  } catch (error: unknown) {
    console.error('❌ createOrder error:', error);

    if (error instanceof Error && error.message?.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check your network connection and ensure the backend is running.');
    }

    throw error;
  }
};

export const getCustomerOrders = async (customerId: number): Promise<Order[]> => {
  const res = await fetch(`${BASE_URL}/orders/customer?customerId=${customerId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch customer orders");
  }

  return await res.json();
};

export const getCatererOrders = async (catererId: number): Promise<Order[]> => {
  const res = await fetch(`${BASE_URL}/orders/caterer?catererId=${catererId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch caterer orders");
  }

  return await res.json();
};

export const getOrdersByDate = async (
  catererId: number,
  date: string
): Promise<Order[]> => {
  // Get all caterer orders and filter by date on client side
  const orders = await getCatererOrders(catererId);
  return orders.filter(order => order.deliveryDate === date);
};

export const getOrdersByStatus = async (
  catererId: number,
  status: string
): Promise<Order[]> => {
  // Get all caterer orders and filter by status on client side
  const orders = await getCatererOrders(catererId);
  return orders.filter(order => order.status === status);
};

export const getOrderById = async (id: number): Promise<Order> => {
  const res = await fetch(`${BASE_URL}/orders/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch order");
  }

  return await res.json();
};

export const updateOrderStatus = async (
  id: number,
  status: Order["status"]
): Promise<Order> => {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update order status");
  }

  return await res.json();
};
