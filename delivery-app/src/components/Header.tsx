import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import ProfileModal from "@/src/components/ProfileModal";

interface HeaderProps {
  readonly onFilterPress?: () => void;
  readonly showFilter?: boolean;
  readonly showProfile?: boolean;
}

export default function Header({ onFilterPress, showFilter = false, showProfile = true }: HeaderProps) {
  const { user, selectedCatererId } = useAuth();
  const router = useRouter();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

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

        {/* Profile Icon */}
        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setProfileModalVisible(true)}
          >
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={20} color="#10B981" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showProfile && (
        <ProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
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
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F4F0",
    justifyContent: "center",
    alignItems: "center",
  },
});
