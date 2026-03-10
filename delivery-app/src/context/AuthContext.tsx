import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SignupData } from "@/src/types/auth";
import {
  loginUser as apiLoginUser,
  signupCaterer as apiSignupCaterer,
  refreshAccessToken as apiRefreshToken,
  logoutUser as apiLogoutUser,
} from "@/src/api/authApi";
import { isTokenExpired } from "@/src/utils/apiHelper";
import { registerForPushNotifications } from "@/src/services/notificationService";
import { unregisterPushToken } from "@/src/api/pushTokenApi";
import { saveRefreshToken, getRefreshToken, saveAccessToken, clearAllTokens } from "@/src/utils/secureStorage";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (phone: string, pin?: string) => Promise<boolean>;
  signup: (data: SignupData & { pin: string }) => Promise<boolean>;
  logout: () => void;
  selectedCatererId: number | null;
  setSelectedCatererId: (id: number | null) => void;
  selectedDeliveryDate: string | null;
  setSelectedDeliveryDate: (date: string | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCatererId, setSelectedCatererId] = useState<number | null>(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string | null>(
    new Date().toISOString().split('T')[0] // Default to today
  );
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial auth check

  // ✅ DERIVED state (no separate useState)
  const isAuthenticated = user !== null;

  // Helper function to attempt token refresh
  const attemptTokenRefresh = async (refreshToken: string, savedUser: User): Promise<boolean> => {
    try {
      const refreshedData = await apiRefreshToken(refreshToken);

      if (refreshedData) {
        // Update user with new tokens
        const updatedUser = {
          ...savedUser,
          token: refreshedData.token,
          refreshToken: refreshedData.refreshToken,
        };

        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        await saveAccessToken(refreshedData.token!);
        await saveRefreshToken(refreshedData.refreshToken!);

        console.log('✅ Session restored with new tokens');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  };

  const clearUserSession = async () => {
    await clearAllTokens();
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const handleMissingToken = async (savedUser: User): Promise<boolean> => {
    console.warn('⚠️ User loaded but access token is missing');

    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      console.log('🔄 Attempting to restore session with refresh token...');
      if (await attemptTokenRefresh(refreshToken, savedUser)) {
        return true; // Session restored successfully
      }
    }

    // No refresh token or refresh failed - clear user
    console.warn('⚠️ Cannot restore session - please login again');
    await clearUserSession();
    return false;
  };

  const handleExpiredToken = async (savedUser: User): Promise<boolean> => {
    console.warn('⚠️ Access token has expired');

    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      console.log('🔄 Auto-refreshing expired token...');
      if (await attemptTokenRefresh(refreshToken, savedUser)) {
        return true; // Token refreshed successfully
      }
    }

    // Refresh failed - clear user
    console.warn('⚠️ Session expired - please login again');
    await clearUserSession();
    return false;
  };

  const handleValidToken = (savedUser: User) => {
    setUser(savedUser);
    console.log('✅ Session restored:', savedUser.phone, savedUser.role);
  };

  // Load user from AsyncStorage on app start and auto-refresh if token expired
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (!userJson) return;

        const savedUser = JSON.parse(userJson);

        if (!savedUser.token) {
          await handleMissingToken(savedUser);
        } else if (isTokenExpired(savedUser.token)) {
          await handleExpiredToken(savedUser);
        } else {
          handleValidToken(savedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, []);

  // Save user to AsyncStorage whenever it changes
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
          console.log('✓ User saved to storage');
        } else {
          await AsyncStorage.removeItem('user');
          console.log('✓ User removed from storage');
        }
      } catch (error) {
        console.error('Error saving user to storage:', error);
      }
    };

    // Only save after initial load is complete
    if (!isLoading) {
      void saveUser();
    }
  }, [user, isLoading]);

  // Register for push notifications when customer logs in
  useEffect(() => {
    const setupNotifications = async () => {
      // Only register for push notifications for customers
      if (user?.role === "customer" && !isLoading) {
        console.log('📱 Setting up push notifications for customer...');
        try {
          await registerForPushNotifications();
        } catch (error) {
          console.error('⚠️ Failed to setup push notifications:', error);
          // Don't block login if notification setup fails
        }
      }
    };

    void setupNotifications();
  }, [user, isLoading]);

  // ✅ LOGIN
  const login = async (phone: string, pin?: string): Promise<boolean> => {
    const response = await apiLoginUser(phone, pin); // returns User, LoginResponse, or null

    if (!response) return false;

    // Check if user needs to set PIN (first-time login)
    if ('requiresPinSetup' in response && response.requiresPinSetup) {
      // Throw error with setup info - login screen will catch and navigate
      const error = new Error('PIN_SETUP_REQUIRED') as any;
      error.setupData = {
        userId: response.userId,
        phone: response.phone,
        name: response.name,
      };
      throw error;
    }

    // Normal login - save user and tokens
    const userData = response as User;

    // Save tokens securely
    if (userData.token) {
      await saveAccessToken(userData.token);
    }
    if (userData.refreshToken) {
      await saveRefreshToken(userData.refreshToken);
      console.log('✅ Refresh token saved - persistent login enabled');
    }

    setUser(userData);
    return true;
  };

  // ✅ SIGNUP (Caterer)
  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const userData = await apiSignupCaterer(data as SignupData & { pin: string });

      if (!userData) return false;

      // Save tokens securely
      if (userData.token) {
        await saveAccessToken(userData.token);
      }
      if (userData.refreshToken) {
        await saveRefreshToken(userData.refreshToken);
        console.log('✅ Refresh token saved - persistent login enabled');
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    // Unregister push token if user is a customer
    if (user?.role === "customer") {
      try {
        await unregisterPushToken();
        console.log('✓ Push token unregistered');
      } catch (error) {
        console.error('⚠️ Failed to unregister push token:', error);
        // Don't block logout if unregister fails
      }
    }

    // Revoke refresh token on backend
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiLogoutUser(refreshToken);
        console.log('✅ Refresh token revoked on backend');
      }
    } catch (error) {
      console.error('⚠️ Failed to revoke refresh token:', error);
      // Don't block logout if revoke fails
    }

    // Clear all tokens from secure storage
    await clearAllTokens();

    setUser(null);
    setSelectedCatererId(null);
    setSelectedDeliveryDate(new Date().toISOString().split('T')[0]);

    console.log('✅ Logged out successfully');
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      login,
      signup,
      logout,
      selectedCatererId,
      setSelectedCatererId,
      selectedDeliveryDate,
      setSelectedDeliveryDate,
    }),
    [user, isAuthenticated, selectedCatererId, selectedDeliveryDate, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
