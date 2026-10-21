import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { cores } from "../../tema/cores";
import { espacamentos } from "../../tema/espacamentos";

// ---------------------------------------------------------------------------
// TIPAGENS ESTRITAS (TypeScript 6)
// ---------------------------------------------------------------------------
interface Metricas {
  membrosAtivos: number;
  arrecadacaoMensal: number;
  proximoCulto: string;
  voluntariosEscalados: number;
}

interface LancamentoFinanceiro {
  id: string;
  tipo: "dizimo" | "cantina" | "saida";
  descricao: string;
  valor: number;
  data: string;
}

interface EscalaCozinha {
  id: string;
  voluntario: string;
  funcao: string;
  pratoDoDia: string;
  dataEvento: string;
}

interface BarrasMes {
  mes: string;
  entradas: number;
  saidas: number;
}

// ---------------------------------------------------------------------------
// MOCK DATA (Dados fictícios estruturados)
// ---------------------------------------------------------------------------
const MOCK_METRICAS: Metricas = {
  membrosAtivos: 342,
  arrecadacaoMensal: 18450.00,
  proximoCulto: "Domingo, 19:00",
  voluntariosEscalados: 12,
};

const MOCK_LANCAMENTOS: LancamentoFinanceiro[] = [
  { id: "1", tipo: "dizimo", descricao: "Dízimo - Família Oliveira", valor: 850.00, data: "Hoje, 14:30" },
  { id: "2", tipo: "cantina", descricao: "Vendas Cantina - Almoço Beneficente", valor: 2320.50, data: "Ontem, 13:00" },
  { id: "3", tipo: "saida", descricao: "Compra de Insumos (Cantina)", valor: 640.00, data: "21 Out" },
  { id: "4", tipo: "dizimo", descricao: "Oferta Especial - Culto de Missões", valor: 1250.00, data: "20 Out" },
];

const MOCK_ESCALA: EscalaCozinha[] = [
  { id: "1", voluntario: "Marina Silva", funcao: "Chef Principal", pratoDoDia: "Strogonoff Beneficente de Frango", dataEvento: "Próximo Domingo" },
  { id: "2", voluntario: "Carlos Eduardo", funcao: "Auxiliar de Cozinha", pratoDoDia: "Arroz Carreteiro Solidário", dataEvento: "Próximo Domingo" },
  { id: "3", voluntario: "Ana Beatriz", funcao: "Atendimento Cantina", pratoDoDia: "Bolo de Cenoura com Chocolate", dataEvento: "Próximo Domingo" },
];

const MOCK_GRAFICO: BarrasMes[] = [
  { mes: "Jul", entradas: 14200, saidas: 9100 },
  { mes: "Ago", entradas: 16500, saidas: 10400 },
  { mes: "Set", entradas: 15100, saidas: 9800 },
  { mes: "Out", entradas: 18450, saidas: 11200 },
];

export default function DashboardTemplo() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [metricas, setMetricas] = useState<Metricas>(MOCK_METRICAS);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(MOCK_LANCAMENTOS);
  const [escala, setEscala] = useState<EscalaCozinha[]>(MOCK_ESCALA);
  const [grafico, setGrafico] = useState<BarrasMes[]>(MOCK_GRAFICO);
  const [carregando, setCarregando] = useState(false);

  // Esqueleto comentado para integração assíncrona com Supabase
  useEffect(() => {
    async function sincronizarSupabase() {
      if (!isSupabaseConfigured) return;
      setCarregando(true);
      try {
        // Exemplo de chamadas reais do Supabase:
        // const { count: totalMembros } = await supabase.from('perfis').select('*', { count: 'exact', head: true });
        // const { data: lances } = await supabase.from('lancamentos_financeiros').select('*').order('created_at', { ascending: false }).limit(5);
        // if (lances) setLancamentos(lances);
      } catch (err) {
        console.error("Erro ao sincronizar com Supabase:", err);
      } finally {
        setCarregando(false);
      }
    }
    sincronizarSupabase();
  }, []);

  // Altura máxima para cálculo proporcional do gráfico de barras (escala visual)
  const maxValorGrafico = Math.max(...grafico.map(g => Math.max(g.entradas, g.saidas))) || 20000;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Painel do Templo & Cantina</Text>
            <Text style={styles.headerSub}>Gestão unificada e administração beneficente</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/" as never)} accessibilityRole="button" accessibilityLabel="Voltar ao site">
            <Icone name="arrow-left" size={20} color={cores.onSurface} />
            <Text style={styles.backText}>Sair do Admin</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS DE MÉTRICAS (GRID 2x2) */}
        <View style={[styles.gridMetrics, isDesktop && styles.gridMetricsDesktop]}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Icone name="account-group" size={22} color={cores.primary} />
            </View>
            <View>
              <Text style={styles.metricVal}>{metricas.membrosAtivos}</Text>
              <Text style={styles.metricLabel}>Membros Ativos</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#E8F5E9" }]}>
              <Icone name="cash-multiple" size={22} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.metricVal}>R$ {metricas.arrecadacaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metricLabel}>Arrecadação Mensal</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#FFF3E0" }]}>
              <Icone name="calendar-clock" size={22} color="#EF6C00" />
            </View>
            <View>
              <Text style={[styles.metricVal, { fontSize: 16 }]} numberOfLines={1}>{metricas.proximoCulto}</Text>
              <Text style={styles.metricLabel}>Próximo Culto</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#EDE7F6" }]}>
              <Icone name="silverware-fork-knife" size={22} color="#512DA8" />
            </View>
            <View>
              <Text style={styles.metricVal}>{metricas.voluntariosEscalados}</Text>
              <Text style={styles.metricLabel}>Voluntários Escalados</Text>
            </View>
          </View>
        </View>

        {/* GRÁFICO CUSTOMIZADO DE BARRAS (Entradas vs Saídas) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Entradas vs Saídas (Últimos Meses)</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: cores.primary }]} /><Text style={styles.legendText}>Entradas</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: cores.outline }]} /><Text style={styles.legendText}>Saídas</Text></View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {grafico.map((item) => {
              const alturaEntrada = Math.max(12, (item.entradas / maxValorGrafico) * 140);
              const alturaSaida = Math.max(12, (item.saidas / maxValorGrafico) * 140);
              return (
                <View key={item.mes} style={styles.chartBarGroup}>
                  <View style={styles.barsWrapper}>
                    <View style={[styles.bar, { height: alturaEntrada, backgroundColor: cores.primary }]} />
                    <View style={[styles.bar, { height: alturaSaida, backgroundColor: cores.outlineVariant }]} />
                  </View>
                  <Text style={styles.chartLabel}>{item.mes}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* DUAS COLUNAS NO DESKTOP / EMPILHADO NO MOBILE */}
        <View style={[styles.rowContainer, isDesktop && styles.rowContainerDesktop]}>
          
          {/* LISTA DE MOVIMENTAÇÕES (Dízimos + Cantina) */}
          <View style={[styles.sectionCard, isDesktop && { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Movimentações Recentes</Text>
            <View style={styles.listWrap}>
              {lancamentos.map((l) => (
                <View key={l.id} style={styles.itemRow}>
                  <View style={[styles.itemDot, l.tipo === 'saida' ? styles.dotSaida : styles.dotEntrada]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemDesc}>{l.descricao}</Text>
                    <Text style={styles.itemDate}>{l.data}</Text>
                  </View>
                  <Text style={[styles.itemVal, l.tipo === 'saida' ? styles.valSaida : styles.valEntrada]}>
                    {l.tipo === 'saida' ? '-' : '+'} R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ESCALA DA COZINHA / CANTINA */}
          <View style={[styles.sectionCard, isDesktop && { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Escala da Cozinha & Prato do Dia</Text>
            <View style={styles.listWrap}>
              {escala.map((e) => (
                <View key={e.id} style={styles.escalaRow}>
                  <View style={styles.escalaAvatar}>
                    <Icone name="account" size={18} color={cores.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.escalaVoluntario}>{e.voluntario} <Text style={styles.escalaFuncao}>({e.funcao})</Text></Text>
                    <Text style={styles.escalaPrato}>🍽️ {e.pratoDoDia}</Text>
                  </View>
                  <Text style={styles.escalaData}>{e.dataEvento}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  scroll: { padding: espacamentos.page, gap: 20, paddingBottom: 60 },
  scrollDesktop: { padding: 32, maxWidth: 1280, alignSelf: "center", width: "100%" },
  
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  headerTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, color: cores.onSurface, letterSpacing: -0.5 },
  headerSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, marginTop: 2 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: cores.surfaceContainerLowest, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: cores.surfaceVariant },
  backText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: cores.onSurface },

  gridMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridMetricsDesktop: { gap: 16 },
  metricCard: { width: "48%", flexGrow: 1, backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: cores.surfaceVariant, shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 20, elevation: 2 },
  metricIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: cores.primaryFixed, alignItems: "center", justifyContent: "center" },
  metricVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: cores.onSurface },
  metricLabel: { fontFamily: "BeVietnamPro_500Medium", fontSize: 11, color: cores.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 },

  sectionCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: cores.surfaceVariant, shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 20, elevation: 2, gap: 14 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.onSurface },
  
  legendRow: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 11, color: cores.onSurfaceVariant },

  chartContainer: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 170, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: cores.outlineVariant + "40" },
  chartBarGroup: { alignItems: "center", gap: 8, flex: 1 },
  barsWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 140 },
  bar: { width: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: cores.onSurfaceVariant },

  rowContainer: { gap: 16 },
  rowContainerDesktop: { flexDirection: "row" },

  listWrap: { gap: 12 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  itemDot: { width: 8, height: 8, borderRadius: 4 },
  dotEntrada: { backgroundColor: "#2E7D32" },
  dotSaida: { backgroundColor: cores.error },
  itemDesc: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurface },
  itemDate: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: cores.onSurfaceVariant },
  itemVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 13 },
  valEntrada: { color: "#2E7D32" },
  valSaida: { color: cores.error },

  escalaRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: cores.outlineVariant + "20" },
  escalaAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: cores.surfaceContainerHigh, alignItems: "center", justifyContent: "center" },
  escalaVoluntario: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurface },
  escalaFuncao: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: cores.onSurfaceVariant },
  escalaPrato: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.primary, marginTop: 2 },
  escalaData: { fontFamily: "BeVietnamPro_500Medium", fontSize: 11, color: cores.onSurfaceVariant },
});
