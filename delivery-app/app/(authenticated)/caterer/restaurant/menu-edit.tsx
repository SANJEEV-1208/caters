import { useLocalSearchParams } from "expo-router";
import RestaurantMenuForm from "@/src/components/caterer/RestaurantMenuForm";

export default function RestaurantMenuEdit() {
  const params = useLocalSearchParams();

  const itemId = Number(params?.id || 0);
  const initialName = (params?.name as string) || "";
  const initialPrice = (params?.price as string) || "0";
  const initialCategory = (params?.category as "veg" | "non-veg" | undefined) || "veg";
  const initialImage = params?.image ? JSON.parse(params.image as string) : "";
  const initialDescription = (params?.description as string) || "";

  return (
    <RestaurantMenuForm
      mode="edit"
      itemId={itemId}
      initialData={{
        name: initialName,
        price: initialPrice,
        category: initialCategory,
        image: initialImage,
        description: initialDescription,
      }}
    />
  );
}
