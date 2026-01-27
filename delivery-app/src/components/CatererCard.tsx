import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User } from "@/src/types/auth";
import { Ionicons } from "@expo/vector-icons";

type CatererCardProps = {
  caterer: User;
  onPress: () => void;
};

export default function CatererCard({ caterer, onPress }: CatererCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant" size={32} color="#10B981" />
      </View>

      <View style={styles.content}>
        <Text style={styles.serviceName}>{caterer.serviceName}</Text>
        <Text style={styles.name}>by {caterer.name}</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.address}>{caterer.address}</Text>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={24} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    flex: 1,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});
