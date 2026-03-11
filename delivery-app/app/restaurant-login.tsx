import LoginForm from "@/src/components/auth/LoginForm";

export default function RestaurantLoginScreen() {
  return (
    <LoginForm
      title="Restaurant Login"
      subtitle="Manage your restaurant operations"
      expectedRole="caterer"
      expectedCaterType="restaurant"
      signupRoute="/restaurant-signup"
      alternateLoginRoutes={[
        { label: "Login as Customer", route: "/login" },
        { label: "Login as Home Caterer", route: "/caterer-login" },
      ]}
      currentPath="/restaurant-login"
    />
  );
}
