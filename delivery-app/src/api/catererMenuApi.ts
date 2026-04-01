import { MenuItem } from "../types/menu";
import { API_CONFIG } from "../config/api";
import { authenticatedFetch } from "../utils/apiHelper";

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
  const res = await authenticatedFetch(`${BASE_URL}/menus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // Try to extract error message from response
    let errorMessage = "Failed to create menu item";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || "Failed to create menu item";
    } catch (parseError) {
      // If JSON parsing fails, use default message
      console.error("Failed to parse error response:", parseError);
    }
    throw new Error(errorMessage);
  }

  return await res.json();
};

export const updateMenuItem = async (
  id: number,
  data: Partial<MenuItem>
): Promise<MenuItem> => {
  console.log('=== UPDATE MENU ITEM ===');
  console.log('ID:', id);
  console.log('Data:', JSON.stringify(data, null, 2));

  const res = await authenticatedFetch(`${BASE_URL}/menus/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log('Response status:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Update failed - Status:', res.status);
    console.error('❌ Error response:', errorText);

    let errorMessage = "Failed to update menu item";
    try {
      const errorJson = JSON.parse(errorText);
      console.error('❌ Error details:', errorJson);
      errorMessage = errorJson.error || errorJson.message || errorMessage;

      // If there are validation errors, log them
      if (errorJson.errors) {
        console.error('❌ Validation errors:', errorJson.errors);
        errorMessage = errorJson.errors.map((e: any) => e.msg).join(', ');
      }
    } catch (e) {
      console.error('❌ Could not parse error:', errorText);
    }

    throw new Error(errorMessage);
  }

  const result = await res.json();
  console.log('✅ Update successful:', result);
  return result;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const res = await authenticatedFetch(`${BASE_URL}/menus/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete menu item");
  }
};

export const toggleStock = async (id: number, inStock: boolean): Promise<MenuItem> => {
  const res = await authenticatedFetch(`${BASE_URL}/menus/${id}/stock`, {
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
