import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { getSubscribedCaterers } from "@/src/api/subscriptionApi";
import { User } from "@/src/types/auth";
import CatererCard from "@/src/components/CatererCard";

export default function CatererSelectionScreen() {
  const [caterers, setCaterers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, setSelectedCatererId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCaterers();
  }, []);

  const loadCaterers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const subscribedCaterers = await getSubscribedCaterers(user.id);
      setCaterers(subscribedCaterers);
    } catch (error) {
      console.error("Error loading caterers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCaterer = (catererId: number) => {
    setSelectedCatererId(catererId);
    router.push("/(authenticated)/customer");
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your caterers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (caterers.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Subscriptions</Text>
          <Text style={styles.emptyText}>
            Contact your caterer to get started with your subscription
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>Select Your Caterer</Text>
        <Text style={styles.subtitle}>
          Choose a caterer to browse their menu
        </Text>
      </View>

      <FlatList
        data={caterers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CatererCard
            caterer={item}
            onPress={() => handleSelectCaterer(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  },
  listContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
