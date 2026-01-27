import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { FoodItem } from "./FoodCard";

type Props = {
  item: FoodItem;
};

export default function SearchResult({ item }: Props) {
  const router = useRouter();

  return (
    
      <Pressable
        style={styles.row}
        onPress={() =>
          router.push({
            pathname: "/(authenticated)/customer/details",
            params: {
              id: String(item.id),
              name: item.name,
              price: String(item.price),
              rating: item.rating,
              description: item.description,
              image: item.image,
              category: item.category,
              cuisine: item.cuisine,
            },
          })
        }
      >
        <Image source={{uri : item.image}} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₹ {item.price}</Text>
        </View>
      </Pressable>
    
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "column",
    padding: 12,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    flex : 1,
  },
  image: {
    width: 130,
    height: 100,
    borderRadius: 10,
  },
  info: {
    marginTop: 8,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  price: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

});
