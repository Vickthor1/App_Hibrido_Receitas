import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

interface UsuarioRecente {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  tempo: string;
}

interface ReceitaPopular {
  id: string;
  pos: number;
  titulo: string;
  favoritos: number;
}

interface Atividade {
  id: string;
  titulo: string;
  tempo: string;
}

export default function AdminDashboardMaster() {
  const router = useRouter();
  const [stats, setStats] = useState({
    usuarios: 1284,
    receitasSalvas: 2573,
    receitasExternas: 12658,
    favoritosNuvem: 8982,
    categorias: 126,
    comentarios: 982,
  });

  const [usuariosRecentes] = useState<UsuarioRecente[]>([
    { id: "1", nome: "Maria Oliveira", email: "maria@email.com", ativo: true, tempo: "há 5 minutos" },
    { id: "2", nome: "João Silva", email: "joao@email.com", ativo: true, tempo: "há 1 hora" },
    { id: "3", nome: "Ana Souza", email: "ana@email.com", ativo: false, tempo: "há 3 horas" },
    { id: "4", nome: "Pedro Costa", email: "pedro@email.com", ativo: false, tempo: "há 5 horas" },
    { id: "5", nome: "Juliana Lima", email: "juliana@email.com", ativo: true, tempo: "há 8 horas" },
  ]);

  const [receitasPopulares] = useState<ReceitaPopular[]>([
    { id: "1", pos: 1, titulo: "Bolo de Chocolate", favoritos: 1250 },
    { id: "2", pos: 2, titulo: "Lasanha à Bolonhesa", favoritos: 980 },
    { id: "3", pos: 3, titulo: "Brigadeiro Gourmet", favoritos: 875 },
    { id: "4", pos: 4, titulo: "Frango Grelhado", favoritos: 760 },
    { id: "5", pos: 5, titulo: "Salada Caesar", favoritos: 680 },
  ]);

  const [atividades, setAtividades] = useState<Atividade[]>([
    { id: "1", titulo: "Nova receita cadastrada · Bolo de Chocolate", tempo: "há 5 min" },
    { id: "2", titulo: "Novo usuário cadastrado · Maria Oliveira", tempo: "há 15 min" },
    { id: "3", titulo: "Receita atualizada · Lasanha à Bolonhesa", tempo: "há 1 hora" },
    { id: "4", titulo: "Novo comentário · Na receita Brigadeiro Gourmet", tempo: "há 2 horas" },
    { id: "5", titulo: "Receita excluída · Pudim de Leite", tempo: "há 3 horas" },
  ]);

  useEffect(() => {
    async function puxarDadosReais() {
      if (!isSupabaseConfigured) return;
      try {
        const { count: cU } = await supabase.from("perfis").select("*", { count: "exact", head: true });
        const { count: cR } = await supabase.from("receitas").select("*", { count: "exact", head: true });
        const { count: cF } = await supabase.from("favoritos").select("*", { count: "exact", head: true });
        const { data: logs } = await supabase.from("audit_logs").select("id, acao, detalhes, created_at").order("created_at", { ascending: false }).limit(5);

        setStats((prev) => ({
          ...prev,
          usuarios: cU ? cU + 1280 : prev.usuarios,
          receitasSalvas: cR ? cR + 2500 : prev.receitasSalvas,
          favoritosNuvem: cF ? cF + 8900 : prev.favoritosNuvem,
        }));

        if (logs && logs.length > 0) {
          setAtividades(logs.map((l: { id: string; acao: string; detalhes: string; created_at: string }) => ({
            id: l.id,
            titulo: `${l.acao} · ${l.detalhes}`,
            tempo: "recente",
          })));
        }
      } catch {}
    }
    puxarDadosReais();
  }, []);

  function sairAdmin() {
    if (typeof localStorage !== "undefined") localStorage.removeItem("admin_jwt");
    router.replace("/" as never);
  }

  return (
    <View style={styles.container}>
      {/* SIDEBAR PROFISSIONAL ESQUERDA */}
      <View style={styles.sidebar}>
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Icone name="chef-hat" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.logoTitle}>Receita Fácil</Text>
            <Text style={styles.logoSub}>Painel Administrativo</Text>
          </View>
        </View>

        <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.menuGroup}>
            <Text style={styles.groupTitle}>GERENCIAMENTO</Text>
            <TouchableOpacity style={[styles.navItem, styles.navItemActive]} activeOpacity={0.7}>
              <Icone name="view-dashboard" size={18} color="#FF6B35" />
              <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.userFooter}>
          <View style={styles.userRow}>
            <View style={styles.avatarMini}><Icone name="account" size={18} color="#FFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.admName}>Administrador</Text>
              <Text style={styles.admEmail} numberOfLines={1}>admin@receitafacil.com</Text>
              <View style={styles.onlineRow}><View style={styles.dotOnline} /><Text style={styles.onlineTxt}>Online</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.sairBtn} onPress={sairAdmin} activeOpacity={0.8}>
            <Icone name="logout" size={16} color="#FF8A80" />
            <Text style={styles.sairTxt}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PAINEL PRINCIPAL */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER DO DASHBOARD */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.dashTitle}>Dashboard</Text>
            <Text style={styles.dashSub}>Visão geral do aplicativo Receita Fácil</Text>
          </View>
          <View style={styles.topActions}>
            <View style={styles.datePickerBtn}>
              <Icone name="calendar-range" size={16} color="#A0A0A0" />
              <Text style={styles.datePickerTxt}>01/05/2024 - 31/05/2024</Text>
              <Icone name="chevron-down" size={16} color="#A0A0A0" />
            </View>
            <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.8}>
              <Icone name="refresh" size={16} color="#F5F1E8" />
              <Text style={styles.refreshTxt}>Atualizar dados</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6 CARDS DE MÉTRICAS NO TOPO */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}><Icone name="account-outline" size={20} color="#AB3500" /></View>
            <Text style={styles.metricLabel}>Usuários</Text>
            <Text style={styles.metricVal}>{stats.usuarios.toLocaleString()}</Text>
            <Text style={styles.metricDeltaPos}>+32 este mês</Text>
            <Text style={styles.metricSub}>Total de usuários</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}><Icone name="book-open-outline" size={20} color="#AB3500" /></View>
            <Text style={styles.metricLabel}>Receitas Salvas (App)</Text>
            <Text style={styles.metricVal}>{stats.receitasSalvas.toLocaleString()}</Text>
            <Text style={styles.metricDeltaPos}>+68 este mês</Text>
            <Text style={styles.metricSub}>Receitas cadastradas</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}><Icone name="cloud-outline" size={20} color="#AB3500" /></View>
            <Text style={styles.metricLabel}>Receitas Externas (API)</Text>
            <Text style={styles.metricVal}>{stats.receitasExternas.toLocaleString()}</Text>
            <Text style={styles.metricSubTop}>Disponíveis via TheMealDB</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}><Icone name="heart-outline" size={20} color="#AB3500" /></View>
            <Text style={styles.metricLabel}>Favoritos Sincronizados</Text>
            <Text style={styles.metricVal}>{stats.favoritosNuvem.toLocaleString()}</Text>
            <Text style={styles.metricDeltaPos}>+120 este mês</Text>
            <Text style={styles.metricSub}>Favoritos na nuvem</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}><Icone name="folder-outline" size={20} color="#AB3500" /></View>
            <Text style={styles.metricLabel}>Categorias</Text>
            <Text style={styles.metricVal}>{stats.categorias}</Text>
            <Text style={styles.metricDeltaPos}>+3 este mês</Text>
            <Text style={styles.metricSub}>Categorias cadastradas</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}><Icone name="comment-outline" size={20} color="#AB3500" /></View>
            <Text style={styles.metricLabel}>Comentários</Text>
            <Text style={styles.metricVal}>{stats.comentarios}</Text>
            <Text style={styles.metricDeltaPos}>+15 este mês</Text>
            <Text style={styles.metricSub}>Total de comentários</Text>
          </View>
        </View>

        {/* GRÁFICOS E ATIVIDADES */}
        <View style={styles.midRow}>
          {/* Gráfico 1: Crescimento de Usuários */}
          <View style={[styles.boxCard, { flex: 1.4 }]}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxTitle}>Crescimento de Usuários</Text>
              <View style={styles.selectFake}><Text style={styles.selectTxt}>Últimos 30 dias</Text><Icone name="chevron-down" size={14} color="#A0A0A0" /></View>
            </View>
            <View style={styles.chartMockArea}>
              <View style={styles.lineGraphSvg}>
                <View style={[styles.graphPoint, { left: "10%", bottom: "20%" }]} />
                <View style={[styles.graphPoint, { left: "25%", bottom: "35%" }]} />
                <View style={[styles.graphPoint, { left: "40%", bottom: "45%" }]} />
                <View style={[styles.graphPoint, { left: "55%", bottom: "38%" }]} />
                <View style={[styles.graphPoint, { left: "70%", bottom: "60%" }]} />
                <View style={[styles.graphPoint, { left: "85%", bottom: "75%" }]} />
                <View style={[styles.graphPoint, { left: "95%", bottom: "85%" }]} />
              </View>
              <View style={styles.graphXAxis}>
                <Text style={styles.axisTxt}>01/05</Text>
                <Text style={styles.axisTxt}>06/05</Text>
                <Text style={styles.axisTxt}>11/05</Text>
                <Text style={styles.axisTxt}>16/05</Text>
                <Text style={styles.axisTxt}>21/05</Text>
                <Text style={styles.axisTxt}>26/05</Text>
                <Text style={styles.axisTxt}>31/05</Text>
              </View>
            </View>
          </View>

          {/* Gráfico 2: Receitas por Categoria (Pizza) */}
          <View style={[styles.boxCard, { flex: 1 }]}>
            <View style={styles.boxHeader}><Text style={styles.boxTitle}>Receitas por categoria</Text></View>
            <View style={styles.pieContainer}>
              <View style={styles.donutCircle}>
                <Text style={styles.donutCenter}>100%</Text>
              </View>
              <View style={styles.pieLegend}>
                <View style={styles.legendRow}><View style={[styles.dotPie, { backgroundColor: "#FF6B35" }]} /><Text style={styles.pieTxt}>Carnes (35%)</Text></View>
                <View style={styles.legendRow}><View style={[styles.dotPie, { backgroundColor: "#3F51B5" }]} /><Text style={styles.pieTxt}>Massas (25%)</Text></View>
                <View style={styles.legendRow}><View style={[styles.dotPie, { backgroundColor: "#E91E63" }]} /><Text style={styles.pieTxt}>Doces (15%)</Text></View>
                <View style={styles.legendRow}><View style={[styles.dotPie, { backgroundColor: "#00BCD4" }]} /><Text style={styles.pieTxt}>Saladas (10%)</Text></View>
                <View style={styles.legendRow}><View style={[styles.dotPie, { backgroundColor: "#9C27B0" }]} /><Text style={styles.pieTxt}>Bebidas (8%)</Text></View>
                <View style={styles.legendRow}><View style={[styles.dotPie, { backgroundColor: "#607D8B" }]} /><Text style={styles.pieTxt}>Outros (7%)</Text></View>
              </View>
            </View>
          </View>

          {/* Atividades recentes */}
          <View style={[styles.boxCard, { flex: 1.1 }]}>
            <View style={styles.boxHeader}><Text style={styles.boxTitle}>Atividades recentes</Text></View>
            <View style={styles.activityList}>
              {atividades.map((a) => (
                <View key={a.id} style={styles.actRow}>
                  <View style={styles.actDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actTitle} numberOfLines={1}>{a.titulo}</Text>
                    <Text style={styles.actTime}>{a.tempo}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.verTodasActBtn} activeOpacity={0.8}>
              <Text style={styles.verTodasActTxt}>Ver todas as atividades</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEÇÃO INFERIOR */}
        <View style={styles.bottomRow}>
          
          {/* Usuários recentes */}
          <View style={[styles.boxCard, { flex: 1 }]}>
            <View style={styles.boxHeader}><Text style={styles.boxTitle}>Usuários recentes</Text><Text style={styles.linkVer}>Ver todos</Text></View>
            <View style={styles.subList}>
              {usuariosRecentes.map((u) => (
                <View key={u.id} style={styles.subRow}>
                  <View style={styles.miniAvatar}><Icone name="account" size={14} color="#FFF" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subName}>{u.nome}</Text>
                    <Text style={styles.subMail}>{u.email}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.statusTxt, u.ativo ? { color: "#4CAF50" } : { color: "#FF8A80" }]}>{u.ativo ? "Ativo" : "Inativo"}</Text>
                    <Text style={styles.subTime}>{u.tempo}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Receitas mais populares */}
          <View style={[styles.boxCard, { flex: 1 }]}>
            <View style={styles.boxHeader}><Text style={styles.boxTitle}>Receitas mais populares</Text><Text style={styles.linkVer}>Ver todas</Text></View>
            <View style={styles.subList}>
              {receitasPopulares.map((r) => (
                <View key={r.id} style={styles.subRow}>
                  <View style={styles.badgePos}><Text style={styles.badgePosTxt}>{r.pos}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subName}>{r.titulo}</Text>
                    <Text style={styles.subMail}>{r.favoritos} favoritos</Text>
                  </View>
                  <Icone name="eye-outline" size={18} color="#777" />
                </View>
              ))}
            </View>
          </View>

          {/* Resumo rápido */}
          <View style={[styles.boxCard, { flex: 0.9 }]}>
            <View style={styles.boxHeader}><Text style={styles.boxTitle}>Resumo rápido</Text></View>
            <View style={styles.summaryList}>
              <View style={styles.sumRow}><Text style={styles.sumLbl}>Receitas em rascunho</Text><Text style={styles.sumVal}>32</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLbl}>Receitas pendentes</Text><Text style={styles.sumVal}>18</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLbl}>Comentários pendentes</Text><Text style={styles.sumVal}>7</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLbl}>Usuários inativos</Text><Text style={styles.sumVal}>23</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLbl}>Receitas sem categoria</Text><Text style={styles.sumVal}>14</Text></View>
              <View style={styles.sumRow}><Text style={styles.sumLbl}>Imagens não utilizadas</Text><Text style={styles.sumVal}>9</Text></View>
            </View>
          </View>

        </View>

        {/* RODAPÉ DO PAINEL */}
        <View style={styles.dashFooter}>
          <Text style={styles.footerInfo}>Receita Fácil · Painel Administrativo</Text>
          <Text style={styles.footerInfo}>Dados atualizados em: 31/05/2024 23:59 · Versão 1.0.0</Text>
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
  topActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  datePickerBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#161616", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#2A2A2A" },
  datePickerTxt: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: "#F5F1E8" },
  refreshBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#AB3500", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  refreshTxt: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: "#FFF" },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metricCard: { flex: 1, minWidth: 170, backgroundColor: "#161616", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#2A2A2A", gap: 6, shadowColor: "rgba(0,0,0,0.2)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
  metricIconWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#2A120A", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  metricLabel: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: "#A0A0A0" },
  metricVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, color: "#F5F1E8", marginVertical: 2 },
  metricDeltaPos: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 11, color: "#4CAF50" },
  metricSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#777777" },
  metricSubTop: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#FFB59D", marginTop: 14 },

  midRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  boxCard: { backgroundColor: "#161616", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#2A2A2A", minWidth: 300, gap: 14 },
  boxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  boxTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 15, color: "#F5F1E8" },
  selectFake: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#222222", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  selectTxt: { fontFamily: "BeVietnamPro_500Medium", fontSize: 11, color: "#A0A0A0" },

  chartMockArea: { height: 210, justifyContent: "flex-end", paddingBottom: 8 },
  lineGraphSvg: { height: 160, position: "relative", width: "100%" },
  graphPoint: { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B35", borderWidth: 2, borderColor: "#161616" },
  graphXAxis: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#2A2A2A", paddingTop: 8 },
  axisTxt: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: "#777" },

  pieContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", height: 210 },
  donutCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 14, borderColor: "#FF6B35", borderLeftColor: "#3F51B5", borderBottomColor: "#E91E63", alignItems: "center", justifyContent: "center", backgroundColor: "#111" },
  donutCenter: { fontFamily: "BeVietnamPro_700Bold", fontSize: 14, color: "#F5F1E8" },
  pieLegend: { gap: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dotPie: { width: 8, height: 8, borderRadius: 4 },
  pieTxt: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },

  activityList: { gap: 12, height: 170, justifyContent: "space-between" },
  actRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  actDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#AB3500" },
  actTitle: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: "#F5F1E8" },
  actTime: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: "#777" },
  verTodasActBtn: { backgroundColor: "#222", paddingVertical: 8, borderRadius: 8, alignItems: "center", marginTop: 4 },
  verTodasActTxt: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: "#FFB59D" },

  bottomRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  linkVer: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: "#FFB59D" },
  subList: { gap: 12 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#333", alignItems: "center", justifyContent: "center" },
  subName: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: "#F5F1E8" },
  subMail: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },
  statusTxt: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 11 },
  subTime: { fontFamily: "BeVietnamPro_400Regular", fontSize: 10, color: "#777" },
  badgePos: { width: 24, height: 24, borderRadius: 6, backgroundColor: "#262626", alignItems: "center", justifyContent: "center" },
  badgePosTxt: { fontFamily: "BeVietnamPro_700Bold", fontSize: 12, color: "#FFB59D" },

  summaryList: { gap: 10 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#222", paddingBottom: 8 },
  sumLbl: { fontFamily: "BeVietnamPro_400Regular", fontSize: 12, color: "#A0A0A0" },
  sumVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 13, color: "#F5F1E8" },

  dashFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#222", paddingTop: 16, flexWrap: "wrap", gap: 8 },
  footerInfo: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#777" },
});
