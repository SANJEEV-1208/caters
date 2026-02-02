 import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
  import { useRouter } from "expo-router";
  import { Ionicons } from "@expo/vector-icons";

  export type CuisineItem = {
      id: number;
      name: string;
      image: any;
  }

  type Props = {
    item: CuisineItem;
  };

  export default function CuisineCard({ item }: Props) {
      const router = useRouter();

      return (
          <TouchableOpacity
              style={styles.container}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname : "/(authenticated)/customer/cuisinedetails",
                  params : {
                    cuisine : item.name,
                  }
                })
              }
          >
              <View style={styles.imageContainer}>
                  {item.image ? (
                      <Image
                          source={{ uri: item.image }}
                          style={styles.image}
                      />
                  ) : (
                      <View style={styles.placeholderContainer}>
                          <Ionicons name="fast-food-outline" size={32} color="#10B981" />
                      </View>
                  )}
              </View>
              <Text style={styles.name} numberOfLines={1}>
                  {item.name}
              </Text>
          </TouchableOpacity>
      );
  }

  const styles = StyleSheet.create({
      container: {
          alignItems: "center",
          marginHorizontal: 12,
          width: 85,
      },

      imageContainer: {
          width: 75,
          height: 75,
          borderRadius: 40,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
          marginBottom: 8,
          overflow: "hidden",
          borderWidth: 3,
          borderColor: "#F3F4F6",
      },

      image: {
          width: "100%",
          height: "100%",
          resizeMode: "cover",
      },

      name: {
          fontSize: 13,
          fontWeight: "600",
          color: "#1A1A1A",
          textAlign: "center",
          maxWidth: 85,
      },

      placeholderContainer: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F0FDF4",
      },
  });