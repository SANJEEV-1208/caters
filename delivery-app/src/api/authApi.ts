import { User, SignupData } from "@/src/types/auth";
import { API_CONFIG } from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

// Login response type for first-time users
interface LoginResponse {
  requiresPinSetup?: boolean;
  userId?: number;
  phone?: string;
  role?: string;
  name?: string;
  message?: string;
  // Regular user fields
  id?: number;
  token?: string;
  serviceName?: string;
  address?: string;
  caterType?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  paymentQrCode?: string;
  createdAt?: string;
}

// Login - authenticate user with phone and PIN
export const loginUser = async (phone: string, pin?: string): Promise<User | LoginResponse | null> => {
  try {
    console.log('🔍 Login attempt:', { phone, hasPin: !!pin, endpoint: `${BASE_URL}/auth/login` });

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, pin }),
    });

    console.log('📡 Login response:', { status: res.status, ok: res.ok });

    if (!res.ok) {
      if (res.status === 404) {
        console.log('❌ User not found (404)');
        return null; // User not found
      }
      if (res.status === 401) {
        const error = await res.json();
        throw new Error(error.error || "Invalid PIN");
      }
      const errorText = await res.text();
      console.error('❌ Login failed:', { status: res.status, error: errorText });
      throw new Error("Login failed");
    }

    const data = await res.json();

    // Check if user needs to set PIN
    if (data.requiresPinSetup) {
      console.log('⚠️ First-time login - PIN setup required');
      return data as LoginResponse;
    }

    console.log('✅ Login successful:', data.phone, data.role);
    return data as User;
  } catch (error) {
    console.error("❌ Login API error:", error);
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('🔥 NETWORK ERROR: Cannot reach backend server');
      console.error(`   Check if backend is running at ${BASE_URL}`);
      console.error('   Ensure phone and computer are on same WiFi network');
    }
    throw error;
  }
};

// Signup - create new caterer
export const signupCaterer = async (data: SignupData & { pin: string }): Promise<User> => {
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
        pin: data.pin,
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
  pin: string;
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

// Set PIN for first-time users (customers added by caterer)
export const setPin = async (userId: number, pin: string): Promise<User> => {
  try {
    console.log('🔑 Setting PIN for user:', userId);

    const res = await fetch(`${BASE_URL}/auth/set-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, pin }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to set PIN");
    }

    const data = await res.json();
    console.log('✅ PIN set successfully');
    return data as User;
  } catch (error) {
    console.error("❌ Set PIN API error:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: number,
  updates: Record<string, string | undefined>
): Promise<User> => {
  try {
    console.log('📝 Updating profile for user:', userId);

    const res = await fetch(`${BASE_URL}/auth/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update profile");
    }

    const data = await res.json();
    console.log('✅ Profile updated successfully');
    return data as User;
  } catch (error) {
    console.error("❌ Update profile API error:", error);
    throw error;
  }
};
