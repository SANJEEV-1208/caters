
  import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
  import { useRouter } from "expo-router";
  import { FoodItem } from "@/src/types/menu";

  type Props = {
    item: FoodItem;
  };

  export default function Result({ item }: Props) {
    const router = useRouter();

    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/(authenticated)/customer/details",
            params: {
              id: String(item.id),
              name: item.name,
              price: String(item.price),
              rating: item.rating || "4.5",
              description: item.description,
              image: item.image,
              category: item.category,
              cuisine: item.cuisine,
            },
          })
        }
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />

          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: item.category === "veg" ? "#10B981" : "#EF4444",
              },
            ]}
          >
            <View style={styles.categoryDot} />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          {Boolean(item.description) && (
            <Text style={styles.description} numberOfLines={1}>
              {item.description}
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.price}>₹{item.price}</Text>

            {item.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Arrow Icon */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      padding: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },

    imageContainer: {
      position: "relative",
      width: 70,
      height: 70,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "#F3F4F6",
    },

    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    categoryBadge: {
      position: "absolute",
      top: 4,
      left: 4,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },

    categoryDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: "#fff",
    },

    info: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "center",
    },

    name: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 3,
    },

    description: {
      fontSize: 12,
      color: "#6B7280",
      marginBottom: 6,
    },

    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    price: {
      fontSize: 16,
      fontWeight: "700",
      color: "#10B981",
    },

    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 2,
    },

    star: {
      fontSize: 10,
    },

    rating: {
      fontSize: 11,
      fontWeight: "600",
      color: "#92400E",
    },

    arrowContainer: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },

    arrow: {
      fontSize: 24,
      color: "#D1D5DB",
      fontWeight: "300",
    },
  });