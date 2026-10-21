import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { cores } from "../../tema/cores";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLoginAdmin() {
    console.log("[AdminLogin] Tentando entrar com:", email);
    if (!email.trim() || token.trim().length !== 6) {
      Alert.alert("Atenção", "Insira o e-mail do admin e o código TOTP de 6 dígitos.");
      return;
    }
    setCarregando(true);
    try {
      console.log("[AdminLogin] Fazendo fetch para Edge Function...");
      const resp = await fetch("https://cpodpuyulqfptldqgdov.supabase.co/functions/v1/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), token: token.trim() }),
      });
      const data = await resp.json();
      console.log("[AdminLogin] Resposta recebida:", resp.status, data);
      if (!resp.ok) throw new Error(data.error || "Falha na autenticação admin.");

      if (Platform.OS === "web") {
        localStorage.setItem("admin_jwt", data.token);
      } else {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.setItemAsync("admin_jwt", data.token);
      }
      router.replace("/admin/dashboard" as never);
    } catch (e) {
      console.error("[AdminLogin] Erro:", e);
      Alert.alert("Erro", e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Painel Restrito — Admin</Text>
        <Text style={styles.sub}>Autenticação por Fator Múltiplo (MFA)</Text>

        <TextInput style={styles.input} placeholder="E-mail do Administrador" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Código de 6 dígitos (Autenticador)" placeholderTextColor="#666" value={token} onChangeText={setToken} keyboardType="numeric" maxLength={6} />

        <TouchableOpacity style={styles.btn} onPress={handleLoginAdmin} disabled={carregando}>
          <Text style={styles.btnText}>{carregando ? "Validando..." : "Entrar como Admin"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background, justifyContent: "center", padding: 20 },
  card: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 24, gap: 16, borderWidth: 1, borderColor: cores.surfaceVariant },
  title: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface },
  sub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant },
  input: { borderWidth: 1, borderColor: cores.outlineVariant, borderRadius: 10, paddingHorizontal: 14, height: 48, backgroundColor: cores.surface, color: cores.onSurface },
  btn: { backgroundColor: cores.primary, paddingVertical: 14, borderRadius: 9999, alignItems: "center", marginTop: 8 },
  btnText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 15 },
});