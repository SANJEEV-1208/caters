import LoginForm from "@/src/components/auth/LoginForm";

export default function LoginScreen() {
  return (
    <LoginForm
      title="Welcome Back"
      subtitle="Login to continue ordering"
      expectedRole="customer"
      signupRoute="/signup"
      alternateLoginRoutes={[
        { label: "Login as Caterer", route: "/caterer-login" },
        { label: "Login as Restaurant", route: "/restaurant-login" },
      ]}
      currentPath="/login"
    />
  );
}
