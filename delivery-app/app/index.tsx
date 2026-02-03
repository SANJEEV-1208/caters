import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const { user } = useAuth();

  // If authenticated, redirect based on role
  if (user) {
    if (user.role === "customer") {
      return <Redirect href="/(authenticated)/customer/caterer-selection" />;
    } else if (user.role === "caterer") {
      // Redirect to appropriate caterer dashboard based on caterType
      const dashboardPath = user.caterType === "restaurant"
        ? "/(authenticated)/caterer/restaurant/dashboard"
        : "/(authenticated)/caterer/dashboard";
      return <Redirect href={dashboardPath as unknown} />;
    }
  }

  // Not logged in → Login
  return <Redirect href="/login" />;
}

