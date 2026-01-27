import { Order } from "../types/order";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

export const createOrder = async (orderData: Omit<Order, "id" | "createdAt">): Promise<Order> => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    throw new Error("Failed to create order");
  }

  return await res.json();
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
