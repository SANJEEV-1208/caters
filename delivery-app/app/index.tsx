import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  // 1️⃣ Not logged in → Login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // 2️⃣ Redirect based on role
  if (user?.role === "customer") {
    return <Redirect href="/(authenticated)/customer/caterer-selection" />;
  }

  // 3️⃣ Default to caterer dashboard (only customer and caterer roles exist)
  return <Redirect href="/(authenticated)/caterer/dashboard" />;
}
