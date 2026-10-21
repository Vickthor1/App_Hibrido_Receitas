import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { cores } from "../../tema/cores";

export default function AdminDashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState<{ id: string; acao: string; detalhes: string; created_at: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    carregarDadosAdmin();
  }, []);

  async function carregarDadosAdmin() {
    const token = await SecureStore.getItemAsync("admin_jwt");
    if (!token) {
      router.replace("/admin/login" as never);
      return;
    }
    const { data: logData } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10);
    if (logData) setLogs(logData);

    const { data: perfis } = await supabase.from("perfis").select("id, nome").limit(20);
    if (perfis) setUsuarios(perfis);
  }

  async function acaoAdmin(action: "DELETE_USER" | "RESET_PASSWORD", userId?: string, userEmail?: string) {
    const token = await SecureStore.getItemAsync("admin_jwt");
    try {
      const resp = await fetch("https://cpodpuyulqfptldqgdov.supabase.co/functions/v1/admin-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, userId, userEmail }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      Alert.alert("Sucesso", data.message);
      carregarDadosAdmin();
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha na ação administrativa.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Painel do Administrador Único</Text>

        <Text style={styles.section}>Logs de Auditoria Recentes</Text>
        {logs.map((l) => (
          <View key={l.id} style={styles.logCard}>
            <Text style={styles.logAcao}>{l.acao}</Text>
            <Text style={styles.logDetalhe}>{l.detalhes}</Text>
            <Text style={styles.logData}>{new Date(l.created_at).toLocaleString()}</Text>
          </View>
        ))}

        <Text style={styles.section}>Gerenciamento de Usuários</Text>
        {usuarios.map((u) => (
          <View key={u.id} style={styles.userCard}>
            <View>
              <Text style={styles.userName}>{u.nome}</Text>
              <Text style={styles.userId}>ID: {u.id.slice(0, 8)}...</Text>
            </View>
            <View style={styles.rowBtn}>
              <TouchableOpacity style={styles.btnReset} onPress={() => acaoAdmin("RESET_PASSWORD", undefined, "usuario@exemplo.com")}>
                <Text style={styles.btnTextSmall}>Reset Senha</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={() => acaoAdmin("DELETE_USER", u.id)}>
                <Text style={styles.btnTextSmall}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, color: cores.onSurface, marginBottom: 8 },
  section: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.primary, marginTop: 12 },
  logCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: cores.surfaceVariant, gap: 4 },
  logAcao: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurface },
  logDetalhe: { fontFamily: "BeVietnamPro_400Regular", fontSize: 12, color: cores.onSurfaceVariant },
  logData: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: cores.outline },
  userCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 10, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: cores.surfaceVariant },
  userName: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: cores.onSurface },
  userId: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: cores.outline },
  rowBtn: { flexDirection: "row", gap: 8 },
  btnReset: { backgroundColor: cores.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnDelete: { backgroundColor: cores.error, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnTextSmall: { color: "#FFF", fontFamily: "BeVietnamPro_600SemiBold", fontSize: 11 },
});
