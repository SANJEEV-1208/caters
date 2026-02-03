import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { User, SignupData } from "@/src/types/auth";
import {
  loginUser as apiLoginUser,
  signupCaterer as apiSignupCaterer,
} from "@/src/api/authApi";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
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

  // ✅ DERIVED state (no separate useState)
  const isAuthenticated = user !== null;

  // ✅ LOGIN
  const login = async (phone: string): Promise<boolean> => {
    try {
      const userData = await apiLoginUser(phone); // returns User or null

      if (!userData) return false;

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
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
  const logout = () => {
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
