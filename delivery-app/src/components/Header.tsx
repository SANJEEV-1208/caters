import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

interface HeaderProps {
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export default function Header({ onFilterPress, showFilter = false }: HeaderProps) {
  const { user, logout, selectedCatererId } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleChangeCaterer = () => {
    router.push("/customer/caterer-selection");
  };

  const displayName = user?.role === "caterer"
    ? user.serviceName
    : user?.name || "User";

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.label}>
          {user?.role === "customer" ? "Customer" : "Caterer"}
        </Text>
        <Text style={styles.name}>{displayName}</Text>
      </View>

      <View style={styles.rightSection}>
        {showFilter && onFilterPress && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onFilterPress}
          >
            <Ionicons name="filter" size={20} color="#10B981" />
          </TouchableOpacity>
        )}

        {user?.role === "customer" && selectedCatererId && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleChangeCaterer}
          >
            <Ionicons name="swap-horizontal" size={20} color="#10B981" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
