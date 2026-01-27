import { Redirect } from "expo-router";

export default function CatererIndex() {
  return <Redirect href="/(authenticated)/caterer/dashboard" />;
}
