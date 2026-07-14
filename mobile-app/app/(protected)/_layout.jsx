import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/constants/colors";

export default function ProtectedLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    />
  );
}
