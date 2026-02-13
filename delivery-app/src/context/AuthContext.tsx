import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SignupData } from "@/src/types/auth";
import {
  loginUser as apiLoginUser,
  signupCaterer as apiSignupCaterer,
} from "@/src/api/authApi";
import { isTokenExpired } from "@/src/utils/apiHelper";
import { registerForPushNotifications } from "@/src/services/notificationService";
import { unregisterPushToken } from "@/src/api/pushTokenApi";

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

  // Load user from AsyncStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const savedUser = JSON.parse(userJson);

          // Check if token exists
          if (!savedUser.token) {
            console.warn('⚠️ User loaded but token is missing - clearing stored user');
            console.warn('⚠️ Please login again to get a new token');
            await AsyncStorage.removeItem('user');
            setUser(null);
          }
          // Check if token is expired
          else if (isTokenExpired(savedUser.token)) {
            console.warn('⚠️ Token has expired - clearing stored user');
            console.warn('⚠️ Please login again to get a new token');
            await AsyncStorage.removeItem('user');
            setUser(null);
          }
          // Token exists and is valid
          else {
            setUser(savedUser);
            console.log('✓ User loaded from storage:', savedUser.phone, savedUser.role);
          }
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
      if (user && user.role === "customer" && !isLoading) {
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
    try {
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

      // Normal login - save user
      setUser(response as User);
      return true;
    } catch (error) {
      // Re-throw all errors (login screen will handle display)
      throw error;
    }
  };

  // ✅ SIGNUP (Caterer)
  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const userData = await apiSignupCaterer(data);

      if (!userData) return false;

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
    if (user && user.role === "customer") {
      try {
        await unregisterPushToken();
        console.log('✓ Push token unregistered');
      } catch (error) {
        console.error('⚠️ Failed to unregister push token:', error);
        // Don't block logout if unregister fails
      }
    }

    setUser(null);
    setSelectedCatererId(null);
    setSelectedDeliveryDate(new Date().toISOString().split('T')[0]);
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
