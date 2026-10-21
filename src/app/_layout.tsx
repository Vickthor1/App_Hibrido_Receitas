import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  useFonts,
} from "@expo-google-fonts/be-vietnam-pro";

import { useEffect } from "react";

import { AuthProvider } from "../contexto/AuthContext";
import { TemaProvider, useTema } from "../contexto/TemaContext";

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const { tema, coresTema } = useTema();

  return (
    <>
      <StatusBar style={tema === "escuro" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor: coresTema.background,
          },

          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="busca" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="categorias" />
        <Stack.Screen name="perfil" />

        <Stack.Screen
          name="login"
          options={{ animation: "slide_from_bottom" }}
        />

        <Stack.Screen
          name="adicionar"
          options={{ animation: "slide_from_bottom" }}
        />

        <Stack.Screen name="ajuda" />
        <Stack.Screen name="notificacoes" />
        <Stack.Screen name="privacidade" />
        <Stack.Screen name="minhas-receitas" />
        <Stack.Screen name="avaliacoes" />
        <Stack.Screen name="configuracoes" />
        <Stack.Screen name="admin/login" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="(admin)/dashboard" />
        <Stack.Screen name="receita/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TemaProvider>
          <AppLayout />
        </TemaProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}