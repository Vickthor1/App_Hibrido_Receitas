import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { cores } from "../tema/cores";
import { AuthProvider } from "../contexto/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: cores.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="busca" />
          <Stack.Screen name="favoritos" />
          <Stack.Screen name="categorias" />
          <Stack.Screen name="perfil" />
          <Stack.Screen name="login" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="receita/[id]" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
