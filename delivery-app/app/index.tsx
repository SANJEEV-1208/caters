import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading screen while auth is being restored from AsyncStorage
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // If authenticated, redirect based on role
  if (user) {
    if (user.role === "customer") {
      return <Redirect href="/(authenticated)/customer/caterer-selection" />;
    } else if (user.role === "caterer") {
      // Redirect to appropriate caterer dashboard based on caterType
      const dashboardPath = user.caterType === "restaurant"
        ? "/(authenticated)/caterer/restaurant/dashboard"
        : "/(authenticated)/caterer/dashboard";
      return <Redirect href={dashboardPath as any} />;
    }
  }

  // Not logged in → Login
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
});

