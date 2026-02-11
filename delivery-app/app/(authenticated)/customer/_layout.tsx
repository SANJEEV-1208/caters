import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/src/context/CartContext";

export default function CustomerLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();

  const tabs = [
    { path: "/(authenticated)/customer/caterer-selection", label: "Home", icon: "home" as const },
    { path: "/(authenticated)/customer/search", label: "Search", icon: "search" as const },
    { path: "/(authenticated)/customer/cart", label: "Cart", icon: "cart" as const },
    { path: "/(authenticated)/customer/orders", label: "Orders", icon: "receipt" as const },
  ];

  const isTabActive = (tabPath: string) => {
    const pageName = tabPath.split('/').pop() || '';
    return pathname.includes(pageName);
  };

  return (
    <View style={styles.container}>
      {/* Render all customer screens */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => {
          const active = isTabActive(tab.path);
          const isCartTab = tab.label === "Cart";

          return (
            <TouchableOpacity
              key={tab.path}
              style={styles.tab}
              onPress={() => {
                if (!active) router.replace(tab.path as any);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {/* Icon with badge */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={active ? tab.icon : `${tab.icon}-outline` as any}
                    size={24}
                    color={active ? "#10B981" : "#9CA3AF"}
                  />

                  {/* Cart Badge */}
                  {isCartTab && totalItems > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {totalItems > 99 ? "99+" : totalItems}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Label */}
                <Text style={[styles.tabLabel, active && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNav: {
    height: 65,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  tabLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  activeLabel: {
    color: "#10B981",
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
