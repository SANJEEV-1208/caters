import { View, Text, TextInput, StyleSheet, FlatList, SafeAreaView, StatusBar } from "react-native";
import { getCatererCuisines } from "@/src/api/foodApi";
import SearchResult from "@/src/components/SearchResult";
import { useEffect, useState } from "react";
import CuisineCard, { CuisineItem } from "@/src/components/CuisineCard";
import Result from "@/src/components/Result";
import { useAuth } from "@/src/context/AuthContext";
import { getCatererMenuItems } from "@/src/api/catererMenuApi";
import { MenuItem } from "@/src/types/menu";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_TRACKING_KEY = "@search_tracking";

export default function Search() {
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState<MenuItem[]>([]);
  const [result, setResult] = useState<MenuItem[]>([]);
  const [cuisine, setCuisine] = useState<CuisineItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const { selectedCatererId } = useAuth();

  useEffect(() => {
    void loadData();
  }, [selectedCatererId]);

  const loadData = async () => {
    if (!selectedCatererId) return;

    try {
      // Get TODAY's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Get ONLY menu items available TODAY
      const todayMenuItems = await getCatererMenuItems(selectedCatererId);

      // Filter to only items available today
      const availableToday = todayMenuItems.filter(item =>
        item.availableDates &&
        item.availableDates.includes(today) &&
        item.inStock
      );

      setAllMenuItems(availableToday);

      // Load caterer-specific cuisines (only from today's items)
      await loadCatererCuisines(availableToday);

      // Load trending items (only from today's items)
      await loadTrendingItems(availableToday);
    } catch (error) {
      console.error("Failed to load search data:", error);
    }
  };

  const loadCatererCuisines = async (menuItems: MenuItem[]) => {
    if (!selectedCatererId) return;

    try {
      // Get caterer-specific cuisines (created by the caterer)
      const catererCuisines = await getCatererCuisines(selectedCatererId);

      // Extract unique cuisines from caterer's menu items
      const menuCuisineNames = new Set(menuItems.map(item => item.cuisine));

      // Filter cuisines to only show those that have menu items available today
      const filteredCuisines = catererCuisines.filter((c: CuisineItem) =>
        menuCuisineNames.has(c.name)
      );

      setCuisine(filteredCuisines);
    } catch (error) {
      console.error("Failed to load cuisines:", error);
      setCuisine([]);
    }
  };

  const loadTrendingItems = async (menuItems: MenuItem[]) => {
    try {
      // Get search tracking data
      const trackingData = await AsyncStorage.getItem(SEARCH_TRACKING_KEY);
      const searchCountsObj: Record<string, number> = trackingData
        ? JSON.parse(trackingData)
        : {};

      // Convert to Map for safe access
      const searchCounts = new Map<string, number>(Object.entries(searchCountsObj));

      // Calculate search count for each menu item
      const itemsWithCounts = menuItems.map(item => ({
        ...item,
        searchCount: searchCounts.get(item.name.toLowerCase()) ?? 0
      }));

      // Sort by search count and get top 5
      const topItems = itemsWithCounts
        .sort((a, b) => b.searchCount - a.searchCount)
        .slice(0, 5);

      setTrending(topItems);
    } catch (error) {
      console.error("Failed to load trending:", error);
      // Fallback: show first 5 items
      setTrending(menuItems.slice(0, 5));
    }
  };

  const trackSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return;

    try {
      const trackingData = await AsyncStorage.getItem(SEARCH_TRACKING_KEY);
      const searchCountsObj: Record<string, number> = trackingData
        ? JSON.parse(trackingData)
        : {};

      // Convert to Map for safe manipulation
      const searchCounts = new Map<string, number>(Object.entries(searchCountsObj));

      const lowerTerm = searchTerm.toLowerCase();
      const currentCount = searchCounts.get(lowerTerm) ?? 0;
      searchCounts.set(lowerTerm, currentCount + 1);

      // Convert back to object for AsyncStorage
      const updatedObj = Object.fromEntries(searchCounts);
      await AsyncStorage.setItem(SEARCH_TRACKING_KEY, JSON.stringify(updatedObj));
    } catch (error) {
      console.error("Failed to track search:", error);
    }
  };

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (!text) {
      setResult([]);
      return;
    }

    // Track this search
    await trackSearch(text);

    // Search in caterer's menu items
    const filteredFood = allMenuItems.filter((item: MenuItem) =>
      item.name.toLowerCase().includes(text.toLowerCase()) ||
      item.cuisine.toLowerCase().includes(text.toLowerCase()) ||
      item.type.toLowerCase().includes(text.toLowerCase())
    );

    setResult(filteredFood);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <TextInput
        placeholder="Search Food..."
        style={styles.inputBar}
        value={query}
        onChangeText={(text) => { void handleSearch(text); }}
      />
      <Text style={styles.heading}>Popular Cuisines</Text>
      <FlatList
        data={cuisine}
        horizontal
        renderItem={({ item }) => <CuisineCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.heading}>Trending</Text>
      <FlatList
        data={trending}
        horizontal
        renderItem={({ item }) => <SearchResult item={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.heading}>Results</Text>
      <FlatList
        data={result}
        renderItem={({ item }) => <Result item={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  inputBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 16,
    marginTop : 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    width : "80%",
    marginLeft : 35,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    marginVertical: 12,
  },
});
