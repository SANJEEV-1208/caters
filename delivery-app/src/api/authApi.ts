import { User, SignupData } from "@/src/types/auth";
import { API_CONFIG } from "../config/api";
import { authenticatedFetch, optionalAuthFetch } from "../utils/apiHelper";

const BASE_URL = API_CONFIG.BASE_URL;

// Login response type for first-time users
interface LoginResponse {
  user : User;
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
        return null; // User not found
      }
      if (res.status === 401) {
        const error = await res.json();
        throw new Error(error.error || "Invalid PIN. Please try again.");
      }
      const errorText = await res.text();
      throw new Error(errorText || "Login failed");
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
    // Only log network errors (unexpected), not validation errors (expected)
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('🔥 NETWORK ERROR: Cannot reach backend server');
      console.error(`   Check if backend is running at ${BASE_URL}`);
      console.error('   Ensure phone and computer are on same WiFi network');
    }
    // Re-throw without logging (login page will handle display)
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

// Search user by phone number (NO PIN REQUIRED - for caterers adding customers)
export const searchUserByPhone = async (phone: string): Promise<User | null> => {
  try {
    const res = await authenticatedFetch(`${BASE_URL}/auth/search-user?phone=${encodeURIComponent(phone)}`);

    if (!res.ok) {
      if (res.status === 404) {
        return null; // User not found
      }
      const error = await res.json();
      throw new Error(error.error || "Failed to search user");
    }

    return await res.json();
  } catch (error) {
    console.error("Search user API error:", error);
    throw error;
  }
};

// Create a new customer (for caterers adding customers via phone - REQUIRES AUTH)
export const createCustomer = async (data: {
  name: string;
  phone: string;
  address?: string;
}): Promise<User> => {
  try {
    const res = await authenticatedFetch(`${BASE_URL}/auth/create-customer`, {
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

// Register guest customer (public - for QR code orders, NO AUTH REQUIRED, NO ADDRESS)
export const registerGuestCustomer = async (data: {
  name: string;
  phone: string;
}): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/auth/guest-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: data.phone,
        name: data.name,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to register guest");
    }

    const createdUser = await res.json();
    return createdUser;
  } catch (error) {
    console.error("Register guest customer error:", error);
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

// Get user by ID - Supports both guest and authenticated access
// Guests can view caterer info (for QR ordering), authenticated users send token
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const res = await optionalAuthFetch(`${BASE_URL}/auth/users/${userId}`);
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
    const res = await authenticatedFetch(`${BASE_URL}/auth/users/${userId}/qr`, {
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
    console.log('🔑 Setting PIN for user:', userId, 'PIN length:', pin.length);

    const res = await fetch(`${BASE_URL}/auth/set-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, pin }),
    });

    console.log('📡 Set PIN response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Set PIN error response:', errorText);

      let errorMessage = "Failed to set PIN";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
        if (errorJson.details) {
          console.error('❌ Validation details:', errorJson.details);
        }
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log('✅ PIN set successfully, user role:', data.role);
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

    const res = await authenticatedFetch(`${BASE_URL}/auth/users/${userId}`, {
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

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<User | null> => {
  try {
    console.log('🔄 Refreshing access token...');

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn('⚠️ Refresh token invalid or expired');
      return null;
    }

    const data = await res.json();
    console.log('✅ Access token refreshed successfully');
    return data as User;
  } catch (error) {
    console.error("❌ Refresh token API error:", error);
    return null;
  }
};

// Logout user and revoke refresh token
export const logoutUser = async (refreshToken: string): Promise<boolean> => {
  try {
    console.log('🚪 Logging out and revoking refresh token...');

    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn('⚠️ Failed to revoke refresh token on backend');
      return false;
    }

    console.log('✅ Refresh token revoked on backend');
    return true;
  } catch (error) {
    console.error("❌ Logout API error:", error);
    return false;
  }
};
