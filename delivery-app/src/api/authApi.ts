import { User, SignupData } from "@/src/types/auth";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

// Login - check if phone number exists in users collection
export const loginUser = async (phone: string): Promise<User | null> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // User not found
      }
      throw new Error("Login failed");
    }

    const user = await res.json();
    return user;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

// Signup - create new caterer
export const signupCaterer = async (data: SignupData): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: data.phone,
        name: data.name,
        serviceName: data.serviceName,
        address: data.address,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Signup failed");
    }

    const createdUser = await res.json();
    return createdUser;
  } catch (error) {
    console.error("Signup API error:", error);
    throw error;
  }
};

// Search user by phone number
export const searchUserByPhone = async (phone: string): Promise<User | null> => {
  try {
    // Reuse loginUser which now uses the new endpoint
    return await loginUser(phone);
  } catch (error) {
    console.error("Search user API error:", error);
    throw error;
  }
};

// Create a new customer (for caterers adding customers via phone)
export const createCustomer = async (data: {
  name: string;
  phone: string;
  address?: string;
}): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/create-customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: data.phone,
        name: data.name,
        address: data.address,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create customer");
    }

    const createdUser = await res.json();
    return createdUser;
  } catch (error) {
    console.error("Create customer API error:", error);
    throw error;
  }
};

// Signup as restaurant caterer (handles both new and existing users)
export const signupRestaurant = async (data: {
  phone: string;
  name: string;
  restaurantName: string;
  restaurantAddress: string;
}): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/restaurant-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Restaurant signup failed");
    }

    const createdUser = await res.json();
    return createdUser;
  } catch (error) {
    console.error("Restaurant signup API error:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/users/${userId}`);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Get user by ID error:", error);
    return null;
  }
};

// Update caterer's payment QR code
export const updatePaymentQrCode = async (
  userId: number,
  qrCodeUrl: string
): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/users/${userId}/qr`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentQrCode: qrCodeUrl }),
    });

    if (!res.ok) {
      throw new Error("Failed to update QR code");
    }

    return await res.json();
  } catch (error) {
    console.error("Update QR code error:", error);
    throw error;
  }
};
