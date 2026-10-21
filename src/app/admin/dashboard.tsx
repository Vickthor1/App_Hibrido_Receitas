import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { buscarCategorias, listarReceitasDisponiveis } from "../../servicos/api";
import { cores } from "../../tema/cores";

interface UsuarioReal {
  id: string;
  nome: string;
  created_at: string;
}

interface ReceitaReal {
  id: string;
  nome: string;
  categoria: string | null;
  tempo: string | null;
  created_at?: string;
}

interface LogReal {
  id: string;
  acao: string;
  detalhes: string;
  created_at: string;
}

export default function AdminDashboardReal() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [stats, setStats] = useState({
    usuariosNuvem: 0,
    receitasApp: 0,
    receitasApi: 0,
    favoritosNuvem: 0,
    categoriasApi: 0,
    avaliacoesNuvem: 0,
  });

  const [usuariosRecentes, setUsuariosRecentes] = useState<UsuarioReal[]>([]);
  const [receitasPopulares, setReceitasPopulares] = useState<{ idMeal: string; strMeal: string; total: number }[]>([]);
  const [atividades, setAtividades] = useState<LogReal[]>([]);
  const [buscaUser, setBuscaUser] = useState("");
  const [buscaRec, setBuscaRec] = useState("");
  const [tab, setTab] = useState<"dash" | "usuarios" | "receitas">("dash");

  const carregarDadosReais = useCallback(async () => {
    setCarregando(true);
    try {
      if (!isSupabaseConfigured) {
        setCarregando(false);
        return;
      }

      // 1) Contagens reais do Supabase
      const { count: cU } = await supabase.from("perfis").select("*", { count: "exact", head: true });
      const { count: cR } = await supabase.from("receitas").select("*", { count: "exact", head: true });
      const { count: cF } = await supabase.from("favoritos").select("*", { count: "exact", head: true });
      const { count: cA } = await supabase.from("avaliacoes").select("*", { count: "exact", head: true });

      // Categorias da API externa (TheMealDB)
      const cats = await buscarCategorias();
      const recsApi = await listarReceitasDisponiveis();

      setStats({
        usuariosNuvem: cU ?? 0,
        receitasApp: cR ?? 0,
        receitasApi: recsApi.length,
        favoritosNuvem: cF ?? 0,
        categoriasApi: cats.length,
        avaliacoesNuvem: cA ?? 0,
      });

      // 2) Usuários recentes reais
      const { data: perfis } = await supabase
        .from("perfis")
        .select("id, nome, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setUsuariosRecentes((perfis ?? []) as UsuarioReal[]);

      // 3) Atividades / Auditoria reais
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("id, acao, detalhes, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setAtividades((logs ?? []) as LogReal[]);

      // 4) Favoritos agrupados para "Receitas mais populares" reais na nuvem
      const { data: favs } = await supabase.from("favoritos").select("id_meal, str_meal");
      if (favs && favs.length > 0) {
        const contagem: Record<string, { strMeal: string; total: number }> = {};
        favs.forEach((f: { id_meal: string; str_meal: string }) => {
          if (!contagem[f.id_meal]) contagem[f.id_meal] = { strMeal: f.str_meal, total: 0 };
          contagem[f.id_meal].total += 1;
        });
        const ranking = Object.entries(contagem)
          .map(([idMeal, val]) => ({ idMeal, strMeal: val.strMeal, total: val.total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setReceitasPopulares(ranking);
      }
    } catch (e) {
      console.error("[AdminDashboard] Erro ao carregar dados reais:", e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosReais();
  }, [carregarDadosReais]);

  function sairAdmin() {
    if (typeof localStorage !== "undefined") localStorage.removeItem("admin_jwt");
    router.replace("/" as never);
  }

  return (
    <View style={styles.container}>
      {/* SIDEBAR */}
      <View style={styles.sidebar}>
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}><Icone name="chef-hat" size={24} color="#FFF" /></View>
          <View>
            <Text style={styles.logoTitle}>Receita Fácil</Text>
            <Text style={styles.logoSub}>Painel Administrativo Real</Text>
          </View>
        </View>

        <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.menuGroup}>
            <Text style={styles.groupTitle}>GERENCIAMENTO</Text>
            <TouchableOpacity style={[styles.navItem, tab === "dash" && styles.navItemActive]} onPress={() => setTab("dash")} activeOpacity={0.7}>
              <Icone name="view-dashboard" size={18} color={tab === "dash" ? "#FF6B35" : "#A0A0A0"} />
              <Text style={[styles.navText, tab === "dash" && styles.navTextActive]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, tab === "usuarios" && styles.navItemActive]} onPress={() => setTab("usuarios")} activeOpacity={0.7}>
              <Icone name="account-group" size={18} color={tab === "usuarios" ? "#FF6B35" : "#A0A0A0"} />
              <Text style={[styles.navText, tab === "usuarios" && styles.navTextActive]}>Usuários (Nuvem)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, tab === "receitas" && styles.navItemActive]} onPress={() => setTab("receitas")} activeOpacity={0.7}>
              <Icone name="book-open-variant" size={18} color={tab === "receitas" ? "#FF6B35" : "#A0A0A0"} />
              <Text style={[styles.navText, tab === "receitas" && styles.navTextActive]}>Receitas Próprias</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.userFooter}>
          <View style={styles.userRow}>
            <View style={styles.avatarMini}><Icone name="account" size={18} color="#FFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.admName}>Administrador Único</Text>
              <Text style={styles.admEmail} numberOfLines={1}>bastionhero3d@gmail.com</Text>
              <View style={styles.onlineRow}><View style={styles.dotOnline} /><Text style={styles.onlineTxt}>Online (MFA)</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.sairBtn} onPress={sairAdmin} activeOpacity={0.8}>
            <Icone name="logout" size={16} color="#FF8A80" />
            <Text style={styles.sairTxt}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.dashTitle}>Dashboard de Dados Reais</Text>
            <Text style={styles.dashSub}>Conectado ao Supabase (Sem mocks ou simulações artificiais)</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={carregarDadosReais} activeOpacity={0.8}>
            <Icone name="refresh" size={16} color="#F5F1E8" />
            <Text style={styles.refreshTxt}>Atualizar dados</Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={{ padding: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#AB3500" />
            <Text style={{ color: "#A0A0A0", marginTop: 12, fontFamily: "BeVietnamPro_400Regular" }}>Lendo registros do banco de dados...</Text>
          </View>
        ) : (
          <>
            {/* 6 CARDS DE MÉTRICAS REAIS */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}><Icone name="account-outline" size={20} color="#AB3500" /></View>
                <Text style={styles.metricLabel}>Usuários (Perfis)</Text>
                <Text style={styles.metricVal}>{stats.usuariosNuvem}</Text>
                <Text style={styles.metricSub}>Cadastrados no Supabase</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}><Icone name="book-open-outline" size={20} color="#AB3500" /></View>
                <Text style={styles.metricLabel}>Receitas Próprias</Text>
                <Text style={styles.metricVal}>{stats.receitasApp}</Text>
                <Text style={styles.metricSub}>Criadas por usuários</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}><Icone name="cloud-outline" size={20} color="#AB3500" /></View>
                <Text style={styles.metricLabel}>Receitas Externas</Text>
                <Text style={styles.metricVal}>{stats.receitasApi}</Text>
                <Text style={styles.metricSubTop}>Via TheMealDB API</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}><Icone name="heart-outline" size={20} color="#AB3500" /></View>
                <Text style={styles.metricLabel}>Favoritos na Nuvem</Text>
                <Text style={styles.metricVal}>{stats.favoritosNuvem}</Text>
                <Text style={styles.metricSub}>Sincronizados (Supabase)</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}><Icone name="folder-outline" size={20} color="#AB3500" /></View>
                <Text style={styles.metricLabel}>Categorias</Text>
                <Text style={styles.metricVal}>{stats.categoriasApi}</Text>
                <Text style={styles.metricSub}>Disponíveis na API</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}><Icone name="comment-outline" size={20} color="#AB3500" /></View>
                <Text style={styles.metricLabel}>Avaliações</Text>
                <Text style={styles.metricVal}>{stats.avaliacoesNuvem}</Text>
                <Text style={styles.metricSub}>Notas e comentários</Text>
              </View>
            </View>

            {/* SEÇÕES DETALHADAS */}
            <View style={styles.midRow}>
              
              {/* Usuários Recentes Reais */}
              <View style={[styles.boxCard, { flex: 1 }]}>
                <View style={styles.boxHeader}><Text style={styles.boxTitle}>Usuários Recentes (Banco)</Text></View>
                {usuariosRecentes.length === 0 ? (
                  <Text style={styles.vazio}>Nenhum perfil cadastrado na tabela `perfis` ainda.</Text>
                ) : (
                  <View style={styles.subList}>
                    {usuariosRecentes.map((u) => (
                      <View key={u.id} style={styles.subRow}>
                        <View style={styles.miniAvatar}><Icone name="account" size={14} color="#FFF" /></View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subName}>{u.nome}</Text>
                          <Text style={styles.subMail}>ID: {u.id.slice(0, 10)}...</Text>
                        </View>
                        <Text style={styles.subTime}>{new Date(u.created_at).toLocaleDateString()}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Receitas Mais Populares por Favoritos Reais */}
              <View style={[styles.boxCard, { flex: 1 }]}>
                <View style={styles.boxHeader}><Text style={styles.boxTitle}>Mais Favoritadas (Nuvem)</Text></View>
                {receitasPopulares.length === 0 ? (
                  <Text style={styles.vazio}>Nenhum favorito registrado na nuvem ainda.</Text>
                ) : (
                  <View style={styles.subList}>
                    {receitasPopulares.map((r, idx) => (
                      <View key={r.idMeal} style={styles.subRow}>
                        <View style={styles.badgePos}><Text style={styles.badgePosTxt}>{idx + 1}</Text></View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subName} numberOfLines={1}>{r.strMeal}</Text>
                          <Text style={styles.subMail}>{r.total} salvamentos</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Atividades / Auditoria Reais */}
              <View style={[styles.boxCard, { flex: 1 }]}>
                <View style={styles.boxHeader}><Text style={styles.boxTitle}>Auditoria Real (audit_logs)</Text></View>
                {atividades.length === 0 ? (
                  <Text style={styles.vazio}>Nenhuma atividade de auditoria registrada.</Text>
                ) : (
                  <View style={styles.activityList}>
                    {atividades.map((a) => (
                      <View key={a.id} style={styles.actRow}>
                        <View style={styles.actDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.actTitle} numberOfLines={1}>{a.acao}: {a.detalhes}</Text>
                          <Text style={styles.actTime}>{new Date(a.created_at).toLocaleString()}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

            </View>
          </>
        )}

        <View style={styles.dashFooter}>
          <Text style={styles.footerInfo}>Receita Fácil · Painel Administrativo de Dados Reais</Text>
          <Text style={styles.footerInfo}>Supabase Conectado · RLS Ativo</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#0A0A0A" },
  sidebar: { width: 260, backgroundColor: "#111111", borderRightWidth: 1, borderRightColor: "#222222", display: "flex", flexDirection: "column" },
  logoArea: { flexDirection: "row", alignItems: "center", padding: 20, gap: 12, borderBottomWidth: 1, borderBottomColor: "#222222" },
  logoIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#AB3500", alignItems: "center", justifyContent: "center" },
  logoTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: "#F5F1E8" },
  logoSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },
  navScroll: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  menuGroup: { marginBottom: 18 },
  groupTitle: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: "#777777", letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
  navItemActive: { backgroundColor: "#1A1A1A", borderLeftWidth: 3, borderLeftColor: "#AB3500" },
  navText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: "#A0A0A0" },
  navTextActive: { color: "#F5F1E8", fontFamily: "BeVietnamPro_600SemiBold" },
  userFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#222222", gap: 12, backgroundColor: "#141414" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarMini: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#333", alignItems: "center", justifyContent: "center" },
  admName: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: "#F5F1E8" },
  admEmail: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  dotOnline: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  onlineTxt: { fontSize: 10, color: "#4CAF50", fontFamily: "BeVietnamPro_500Medium" },
  sairBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1F1F1F", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#333" },
  sairTxt: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: "#FF8A80" },
  content: { flex: 1, backgroundColor: "#0A0A0A" },
  scrollContent: { padding: 24, gap: 24, paddingBottom: 60 },
  topHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  dashTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, color: "#F5F1E8" },
  dashSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: "#A0A0A0", marginTop: 2 },
  refreshBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#AB3500", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  refreshTxt: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: "#FFF" },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metricCard: { flex: 1, minWidth: 170, backgroundColor: "#161616", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#2A2A2A", gap: 6, shadowColor: "rgba(0,0,0,0.2)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
  metricIconWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#2A120A", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  metricLabel: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: "#A0A0A0" },
  metricVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, color: "#F5F1E8", marginVertical: 2 },
  metricSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#777777" },
  metricSubTop: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#FFB59D", marginTop: 14 },

  midRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  boxCard: { backgroundColor: "#161616", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#2A2A2A", minWidth: 300, gap: 14 },
  boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  boxTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 15, color: "#F5F1E8" },
  vazio: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: "#A0A0A0", fontStyle: "italic" },

  activityList: { gap: 12 },
  actRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2 },
  actDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#AB3500" },
  actTitle: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: "#F5F1E8" },
  actTime: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: "#777" },

  subList: { gap: 12 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#333", alignItems: "center", justifyContent: "center" },
  subName: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: "#F5F1E8" },
  subMail: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },
  subTime: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: "#777" },
  badgePos: { width: 24, height: 24, borderRadius: 6, backgroundColor: "#262626", alignItems: "center", justifyContent: "center" },
  badgePosTxt: { fontFamily: "BeVietnamPro_700Bold", fontSize: 12, color: "#FFB59D" },

  dashFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#222", paddingTop: 16, flexWrap: "wrap", gap: 8, marginTop: 12 },
  footerInfo: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#777" },
});
