import { Stack } from "expo-router";
import { cores } from "../../tema/cores";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: cores.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
