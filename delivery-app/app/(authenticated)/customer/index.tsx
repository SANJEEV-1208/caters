import { View, ScrollView, StyleSheet, FlatList, Text, ActivityIndicator, Pressable, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../src/components/Header";
import CategoryButton from "../../../src/components/CategoryButton";
import MealTypeButton from "../../../src/components/MealTypeButton";
import FoodCard from "../../../src/components/FoodCard";
import DayFilterModal, { DayFilter } from "../../../src/components/DayFilterModal";
import { useState, useEffect } from "react";
import { getMenuItemsByDate } from "@/src/api/catererMenuApi";
import { useAuth } from "@/src/context/AuthContext";
import { MenuItem } from "@/src/types/menu";
import { useRouter } from "expo-router";
import { getISTDate } from "@/src/utils/dateUtils";

export default function HomeScreen() {
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState<"all" | "breakfast" | "lunch" | "dinner" | "snack">("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "veg" | "non-veg">("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayFilter>({
    label: 'Today',
    value: 'today',
    date: getISTDate(),
  });
  const { selectedCatererId, setSelectedDeliveryDate } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadFoods();
  }, [selectedCatererId, selectedDay]);

  // Format date to YYYY-MM-DD (IST)
  const formatDate = (date: Date): string => {
    // Since date is already IST from getISTDate(), use UTC methods to avoid double conversion
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  async function loadFoods() {
    // Check if caterer is selected
    if (!selectedCatererId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const dateString = formatDate(selectedDay.date);

      // Update the global delivery date in context
      setSelectedDeliveryDate(dateString);

      const res = await getMenuItemsByDate(selectedCatererId, dateString);
      setAllMenuItems(res);

      // Apply current filters
      applyFilters(res, selectedMealType, selectedCategory);
    } catch (error) {
      console.error("Error loading foods:", error);
      setAllMenuItems([]);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(
    items: MenuItem[],
    mealType: "all" | "breakfast" | "lunch" | "dinner" | "snack",
    category: "all" | "veg" | "non-veg"
  ) {
    let filtered = items;

    // Filter by meal type
    if (mealType !== "all") {
      filtered = filtered.filter(item => item.type === mealType);
    }

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(item => item.category === category);
    }

    setFoods(filtered);
  }

  function handleMealType(type: "all" | "breakfast" | "lunch" | "dinner" | "snack") {
    setSelectedMealType(type);
    // Reset category to "all" when selecting "All Meals"
    if (type === "all") {
      setSelectedCategory("all");
      applyFilters(allMenuItems, type, "all");
    } else {
      applyFilters(allMenuItems, type, selectedCategory);
    }
  }

  function handleCategory(type: "all" | "veg" | "non-veg") {
    setSelectedCategory(type);
    applyFilters(allMenuItems, selectedMealType, type);
  }

  const getDayInfo = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = selectedDay.date;

    // Since date is already IST from getISTDate(), use UTC methods to avoid double conversion
    let label = '';
    if (selectedDay.value === 'today') {
      label = 'Today';
    } else if (selectedDay.value === 'tomorrow') {
      label = 'Tomorrow';
    } else {
      label = days[date.getUTCDay()];
    }

    return {
      label,
      day: days[date.getUTCDay()],
      date: date.getUTCDate(),
      month: months[date.getUTCMonth()],
      fullDate: `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    };
  };

  const dayInfo = getDayInfo();

  if (!selectedCatererId) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <Ionicons name="restaurant-outline" size={64} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>No Caterer Selected</Text>
        <Text style={styles.emptyText}>
          Please select a caterer from the selection screen to view their menu
        </Text>
        <Pressable
          style={styles.selectButton}
          onPress={() => router.push("/(authenticated)/customer/caterer-selection")}
        >
          <Text style={styles.selectButtonText}>Select Caterer</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <Header
        showFilter={true}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      <View style={styles.dayCard}>
        <View style={styles.calendarIcon}>
          <Ionicons name="calendar" size={20} color="#10B981" />
        </View>
        <View style={styles.dayInfo}>
          <Text style={styles.dayLabel}>{dayInfo.label}</Text>
          <Text style={styles.dateText}>{dayInfo.fullDate}</Text>
        </View>
        <View style={styles.menuBadge}>
          <Ionicons name="restaurant" size={16} color="#10B981" />
          <Text style={styles.menuCount}>{foods.length}</Text>
        </View>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersHeader}>
        <Ionicons name="filter" size={20} color="#1A1A1A" />
        <Text style={styles.filtersTitle}>Filters</Text>
      </View>

      {/* Meal Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mealTypeRow}
        contentContainerStyle={styles.mealTypeContent}
      >
        <MealTypeButton
          title="All Meals"
          active={selectedMealType === "all"}
          onPress={() => handleMealType("all")}
        />
        <MealTypeButton
          title="Breakfast"
          active={selectedMealType === "breakfast"}
          onPress={() => handleMealType("breakfast")}
        />
        <MealTypeButton
          title="Lunch"
          active={selectedMealType === "lunch"}
          onPress={() => handleMealType("lunch")}
        />
        <MealTypeButton
          title="Dinner"
          active={selectedMealType === "dinner"}
          onPress={() => handleMealType("dinner")}
        />
        <MealTypeButton
          title="Snacks"
          active={selectedMealType === "snack"}
          onPress={() => handleMealType("snack")}
        />
      </ScrollView>

      {/* Category Filter (Veg/Non-Veg) - Only show when specific meal type is selected */}
      {selectedMealType !== "all" && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf-outline" size={18} color="#1A1A1A" />
            <Text style={styles.sectionTitle}>Category</Text>
          </View>
          <View style={styles.categoryRow}>
            <CategoryButton
              title="All"
              active={selectedCategory === "all"}
              onPress={() => handleCategory("all")}
            />

            <CategoryButton
              title="Veg"
              active={selectedCategory === "veg"}
              onPress={() => handleCategory("veg")}
            />

            <CategoryButton
              title="Non-Veg"
              active={selectedCategory === "non-veg"}
              onPress={() => handleCategory("non-veg")}
            />
          </View>
        </>
      )}

      {foods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={64} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>No items available</Text>
          <Text style={styles.emptyText}>
            No food items available for {dayInfo.fullDate}.{'\n'}
            Try selecting a different date or category.
          </Text>
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <FoodCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <DayFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onSelectDay={(day) => {
          setSelectedDay(day);
        }}
        selectedDay={selectedDay}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F8F8",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  calendarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E6F4F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  menuBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#E6F4F0",
    gap: 4,
  },
  menuCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
    gap: 8,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  mealTypeRow: {
    flexGrow: 0,
    marginBottom: 8,
  },
  mealTypeContent: {
    gap: 10,
    paddingRight: 16,
  },
  categoryRow: {
    flexDirection: "row",
    marginVertical: 12,
    marginBottom: 20,
    gap: 10,
  },
  list: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  selectButton: {
    marginTop: 24,
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
