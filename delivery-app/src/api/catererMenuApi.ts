import { MenuItem } from "../types/menu";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

export const getCatererMenuItems = async (catererId: number): Promise<MenuItem[]> => {
  const res = await fetch(`${BASE_URL}/menus?catererId=${catererId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch menu items");
  }
  return await res.json();
};

export const getMenuItemsByDate = async (
  catererId: number,
  date: string
): Promise<MenuItem[]> => {
  const url = `${BASE_URL}/menus/by-date?catererId=${catererId}&date=${date}`;
  console.log('=== API: getMenuItemsByDate ===');
  console.log('URL:', url);
  console.log('CatererId:', catererId);
  console.log('Date:', date);

  const res = await fetch(url);
  console.log('Response status:', res.status);

  if (!res.ok) {
    console.error('❌ API Error - Status:', res.status);
    const errorText = await res.text();
    console.error('❌ API Error - Body:', errorText);
    throw new Error("Failed to fetch menu items");
  }

  const data = await res.json();
  console.log('✅ API Response:', data);
  console.log('✅ Number of items:', data.length);
  return data;
};

export const getMenuItemById = async (id: number): Promise<MenuItem> => {
  const res = await fetch(`${BASE_URL}/menus/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch menu item");
  }
  return await res.json();
};

export const createMenuItem = async (
  data: Omit<MenuItem, "id" | "createdAt">
): Promise<MenuItem> => {
  const res = await fetch(`${BASE_URL}/menus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create menu item");
  }

  return await res.json();
};

export const updateMenuItem = async (
  id: number,
  data: Partial<MenuItem>
): Promise<MenuItem> => {
  const res = await fetch(`${BASE_URL}/menus/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update menu item");
  }

  return await res.json();
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/menus/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete menu item");
  }
};

export const toggleStock = async (id: number, inStock: boolean): Promise<MenuItem> => {
  const res = await fetch(`${BASE_URL}/menus/${id}/stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inStock }),
  });

  if (!res.ok) {
    throw new Error("Failed to toggle stock");
  }

  return await res.json();
};
