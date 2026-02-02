import { Slot, Redirect, usePathname } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";

export default function AuthenticatedLayout() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Customer redirect if not already inside customer routes
  if (user.role === "customer" && !pathname.includes("/customer")) {
    return <Redirect href="/(authenticated)/customer/caterer-selection" />;
  }

  // Caterer redirect based on caterType
  if (user.role === "caterer" && !pathname.includes("/caterer")) {
    // Route to appropriate dashboard based on caterType
    const dashboardPath = user.caterType === "restaurant" 
      ? "/(authenticated)/caterer/restaurant/dashboard"
      : "/(authenticated)/caterer/dashboard";
    return <Redirect href={dashboardPath} />;
  }

  return <Slot />; // Renders child layouts (customer or caterer)
}
