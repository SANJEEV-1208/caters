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

  // Caterer redirect if not already inside caterer routes
  if (user.role === "caterer" && !pathname.includes("/caterer")) {
    return <Redirect href="/(authenticated)/caterer/dashboard" />;
  }

  return <Slot />; // Renders child layouts (customer or caterer)
}
