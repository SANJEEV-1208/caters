import LoginForm from "@/src/components/auth/LoginForm";

export default function AuthCatererLoginScreen() {
  return (
    <LoginForm
      title="Caterer Login"
      subtitle="Manage your menu and orders"
      expectedRole="caterer"
      expectedCaterType="home"
      signupRoute="/signup"
      alternateLoginRoutes={[
        { label: "Login as Customer", route: "/login" },
        { label: "Login as Restaurant", route: "/restaurant-login" },
      ]}
      currentPath="/(authenticated)/caterer/caterer-login"
    />
  );
}
