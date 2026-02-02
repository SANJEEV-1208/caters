import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CatererTypeSelectionScreen() {
  const router = useRouter();

  const handleHomeKitchen = () => {
    router.push({
      pathname: "/signup",
      params: { caterType: "home" },
    });
  };

  const handleRestaurantKitchen = () => {
    router.push({
      pathname: "/restaurant-signup",
      params: { caterType: "restaurant" },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Service Type</Text>
        <Text style={styles.subtitle}>
          Choose how you want to use KaasproFoods
        </Text>
      </View>

      {/* Home Kitchen Option */}
      <TouchableOpacity
        style={styles.optionCard}
        onPress={handleHomeKitchen}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="home" size={48} color="#10B981" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Home Kitchen</Text>
          <Text style={styles.optionDescription}>
            Run your catering business from home. Perfect for small batch cooking
            and personalized meal delivery.
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>
              ✓ Daily menu management
            </Text>
            <Text style={styles.feature}>
              ✓ Customer delivery subscriptions
            </Text>
            <Text style={styles.feature}>
              ✓ Apartment-based delivery locations
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#10B981" />
      </TouchableOpacity>

      {/* Restaurant Kitchen Option */}
      <TouchableOpacity
        style={styles.optionCard}
        onPress={handleRestaurantKitchen}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="restaurant" size={48} color="#F59E0B" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Restaurant Kitchen</Text>
          <Text style={styles.optionDescription}>
            Manage your restaurant dine-in service. Customers scan table QR
            codes to browse and order.
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>
              ✓ Table-based ordering
            </Text>
            <Text style={styles.feature}>
              ✓ Menu management
            </Text>
            <Text style={styles.feature}>
              ✓ Quick table-to-kitchen tracking
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#F59E0B" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#F0FDF4",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  featuresList: {
    gap: 6,
  },
  feature: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  backLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
});
