import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MenuItem } from "@/src/types/menu";

export type FoodItem = {
  id: number;
  name: string;
  rating: string;
  price: number;
  image: any;
  description : string;
  category: "veg" | "non-veg";
  cuisine : string;
};

type Props = {
  item: FoodItem | MenuItem;
};

export default function FoodCard({ item }: Props) {
  const router = useRouter();
  // Check if it's a MenuItem (has type field) or FoodItem (has rating field)
  const isMenuItem = 'type' in item;
  const rating = isMenuItem ? "4.5" : (item as FoodItem).rating; // Default rating for menu items

  return (
  <Pressable
    onPress={() => {
      router.push({
        pathname : "/(authenticated)/customer/details",
        params : {
          id: String(item.id),
          name: item.name,
          price: String(item.price),
          rating: rating,
          image : item.image,
          description: item.description,
          category : item.category,
          cuisine : item.cuisine,
        }
      });
    }}
    style={styles.card}
  >

      <Image source={{uri : item.image}} style={styles.image} />

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={[styles.vegBadge, item.category === 'non-veg' && styles.nonVegBadge]}>
            <View style={[styles.vegDot, item.category === 'non-veg' && styles.nonVegDot]} />
          </View>
        </View>
        <Text style={styles.rating}>⭐ {rating}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>

  </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 140,
  },
  info: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  vegBadge: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  nonVegBadge: {
    borderColor: "#EF4444",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  nonVegDot: {
    backgroundColor: "#EF4444",
  },
  rating: {
    marginTop: 4,
    color: "#777",
  },
  price: {
    marginTop: 6,
    fontWeight: "bold",
  },
});
