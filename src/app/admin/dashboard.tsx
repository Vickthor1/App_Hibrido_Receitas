import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { cores } from "../../tema/cores";

interface LogItem {
  id: string;
  acao: string;
  detalhes: string;
  created_at: string;
}

interface UsuarioItem {
  id: string;
  nome: string;
  created_at?: string;
}

interface ReceitaItem {
  id: string;
  nome: string;
  categoria: string | null;
  tempo: string | null;
}

type TabAdmin = "dash" | "usuarios" | "receitas";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabAdmin>("dash");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [receitas, setReceitas] = useState<ReceitaItem[]>([]);
  const [buscaUser, setBuscaUser] = useState("");
  const [buscaRec, setBuscaRec] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, totalReceitas: 0, totalFavoritos: 0 });

  async function getToken() {
    if (Platform.OS === "web") return localStorage.getItem("admin_jwt");
    try {
      const SecureStore = require("expo-secure-store");
      return await SecureStore.getItemAsync("admin_jwt");
    } catch {
      return null;
    }
  }

  const carregarDados = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      router.replace("/admin/login" as never);
      return;
    }
    // Indicadores
    const { count: cUsers } = await supabase.from("perfis").select("*", { count: "exact", head: true });
    const { count: cRecs } = await supabase.from("receitas").select("*", { count: "exact", head: true });
    const { count: cFavs } = await supabase.from("favoritos").select("*", { count: "exact", head: true });
    setStats({ totalUsers: cUsers ?? 0, totalReceitas: cRecs ?? 0, totalFavoritos: cFavs ?? 0 });

    // Logs
    const { data: logData } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(15);
    if (logData) setLogs(logData);

    // Usuários
    let qU = supabase.from("perfis").select("id, nome, created_at").order("created_at", { ascending: false });
    if (buscaUser.trim()) {
      qU = qU.ilike("nome", `%${buscaUser.trim()}%`);
    }
    const { data: perfis } = await qU.limit(30);
    if (perfis) setUsuarios(perfis);

    // Receitas
    let qR = supabase.from("receitas").select("id, nome, categoria, tempo").order("created_at", { ascending: false });
    if (buscaRec.trim()) {
      qR = qR.ilike("nome", `%${buscaRec.trim()}%`);
    }
    const { data: recData } = await qR.limit(30);
    if (recData) setReceitas(recData);
  }, [buscaUser, buscaRec, router]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function acaoAdmin(action: "DELETE_USER" | "RESET_PASSWORD" | "DELETE_RECIPE", targetId?: string, userEmail?: string) {
    const token = await getToken();
    try {
      if (action === "DELETE_RECIPE" && targetId) {
        await supabase.from("receitas").delete().eq("id", targetId);
        Alert.alert("Sucesso", "Receita excluída.");
        carregarDados();
        return;
      }

      const resp = await fetch("https://cpodpuyulqfptldqgdov.supabase.co/functions/v1/admin-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, userId: targetId, userEmail }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      Alert.alert("Sucesso", data.message);
      carregarDados();
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha na ação administrativa.");
    }
  }

  async function handleLogout() {
    if (Platform.OS === "web") localStorage.removeItem("admin_jwt");
    else {
      try {
        const SecureStore = require("expo-secure-store");
        await SecureStore.deleteItemAsync("admin_jwt");
      } catch {}
    }
    router.replace("/" as never);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Painel Administrativo</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.sairBtn} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={18} color={cores.error} />
          <Text style={styles.sairText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === "dash" && styles.tabAtivo]} onPress={() => setTab("dash")} accessibilityRole="button">
          <Text style={[styles.tabText, tab === "dash" && styles.tabTextAtivo]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "usuarios" && styles.tabAtivo]} onPress={() => setTab("usuarios")} accessibilityRole="button">
          <Text style={[styles.tabText, tab === "usuarios" && styles.tabTextAtivo]}>Usuários</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "receitas" && styles.tabAtivo]} onPress={() => setTab("receitas")} accessibilityRole="button">
          <Text style={[styles.tabText, tab === "receitas" && styles.tabTextAtivo]}>Receitas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === "dash" && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Indicadores Gerais</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}><Text style={styles.statNum}>{stats.totalUsers}</Text><Text style={styles.statLabel}>Usuários</Text></View>
              <View style={styles.statCard}><Text style={styles.statNum}>{stats.totalReceitas}</Text><Text style={styles.statLabel}>Receitas Criadas</Text></View>
              <View style={styles.statCard}><Text style={styles.statNum}>{stats.totalFavoritos}</Text><Text style={styles.statLabel}>Favoritos</Text></View>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Atividades e Auditoria Recentes</Text>
            {logs.length === 0 ? (
              <Text style={styles.vazio}>Nenhum log registrado ainda.</Text>
            ) : (
              logs.map((l) => (
                <View key={l.id} style={styles.logCard}>
                  <Text style={styles.logAcao}>{l.acao}</Text>
                  <Text style={styles.logDetalhe}>{l.detalhes}</Text>
                  <Text style={styles.logData}>{new Date(l.created_at).toLocaleString()}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "usuarios" && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Gerenciamento de Usuários ({usuarios.length})</Text>
            <TextInput style={styles.buscaInput} placeholder="Pesquisar usuário por nome..." placeholderTextColor="#666" value={buscaUser} onChangeText={setBuscaUser} />
            {usuarios.map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.nome}</Text>
                  <Text style={styles.userId}>ID: {u.id}</Text>
                </View>
                <View style={styles.rowBtn}>
                  <TouchableOpacity style={styles.btnReset} onPress={() => acaoAdmin("RESET_PASSWORD", undefined, "usuario@exemplo.com")} accessibilityRole="button">
                    <Text style={styles.btnTextSmall}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnDelete} onPress={() => acaoAdmin("DELETE_USER", u.id)} accessibilityRole="button">
                    <Text style={styles.btnTextSmall}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === "receitas" && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Gerenciamento de Receitas ({receitas.length})</Text>
            <TextInput style={styles.buscaInput} placeholder="Pesquisar receita por título..." placeholderTextColor="#666" value={buscaRec} onChangeText={setBuscaRec} />
            {receitas.map((r) => (
              <View key={r.id} style={styles.userCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{r.nome}</Text>
                  <Text style={styles.userId}>{r.categoria ?? "Sem categoria"} {r.tempo ? `· ${r.tempo} min` : ""}</Text>
                </View>
                <TouchableOpacity style={styles.btnDelete} onPress={() => acaoAdmin("DELETE_RECIPE", r.id)} accessibilityRole="button">
                  <Text style={styles.btnTextSmall}>Excluir</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 52, borderBottomWidth: 1, borderBottomColor: cores.outline, backgroundColor: cores.surface },
  topTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 17, color: cores.onSurface },
  sairBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6 },
  sairText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.error },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.outline, backgroundColor: cores.surface },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabAtivo: { borderBottomColor: cores.primary, backgroundColor: cores.surfaceContainerHigh },
  tabText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurfaceVariant },
  tabTextActive: { color: cores.primary },
  scroll: { padding: 16, paddingBottom: 60 },
  sectionContainer: { gap: 12 },
  sectionHeader: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.onSurface, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: cores.surfaceContainerLowest, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: cores.surfaceVariant, gap: 4 },
  statNum: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.primary },
  statLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: cores.onSurfaceVariant, textAlign: "center" },
  logCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: cores.surfaceVariant, gap: 3 },
  logAcao: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: cores.primary },
  logDetalhe: { fontFamily: "BeVietnamPro_400Regular", fontSize: 12, color: cores.onSurface },
  logData: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: cores.outline },
  vazio: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, fontStyle: "italic" },
  buscaInput: { borderWidth: 1, borderColor: cores.outlineVariant, borderRadius: 8, paddingHorizontal: 12, height: 42, backgroundColor: cores.surface, fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurface, marginBottom: 4 },
  userCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 10, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: cores.surfaceVariant, gap: 8 },
  userName: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: cores.onSurface },
  userId: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: cores.outline },
  rowBtn: { flexDirection: "row", gap: 6 },
  btnReset: { backgroundColor: cores.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnDelete: { backgroundColor: cores.error, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnTextSmall: { color: "#FFF", fontFamily: "BeVietnamPro_600SemiBold", fontSize: 11 },
});