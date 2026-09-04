import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarraPesquisa } from "../componentes/BarraPesquisa";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { Carregamento } from "../componentes/Carregamento";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { buscarReceitas, buscarReceitasPorIngrediente, filtrarReceitasPorCategoria } from "../servicos/api";
import { Receita } from "../tipos/receita";
import { useFavoritos } from "../hooks/useFavoritos";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

type Filtro = "Todas" | "Receitas" | "Ingredientes" | "Categorias";
const filtros: Filtro[] = ["Todas", "Receitas", "Ingredientes", "Categorias"];

// Tradução PT -> EN para TheMealDB (inglês)
const TRADUCAO: Record<string, string> = {
  frango: "chicken",
  carne: "beef",
  porco: "pork",
  peixe: "seafood",
  sobremesa: "dessert",
  massa: "pasta",
  salada: "salad",
};

function traduzirTermo(t: string): string {
  const low = t.toLowerCase().trim();
  return TRADUCAO[low] ?? t;
}

// Tempo mockado (TheMealDB não tem tempo) — gera 20-70 min a partir do id
function tempoDaReceita(r: Receita): number {
  const n = parseInt(r.idMeal.slice(-2), 10) || 0;
  return 20 + (n % 50); // 20-69
}
function filtraTempo(r: Receita, filtro: string | null): boolean {
  if (!filtro) return true;
  const t = tempoDaReceita(r);
  if (filtro === "Até 30 min") return t <= 30;
  if (filtro === "30 a 60 min") return t > 30 && t <= 60;
  if (filtro === "Mais de 60 min") return t > 60;
  return true;
}
function filtraCategoria(r: Receita, cat: string): boolean {
  if (cat === "Todas") return true;
  if (cat === "Prato Principal") return ["Chicken", "Beef", "Pork", "Lamb"].includes(r.strCategory);
  if (cat === "Saladas") return ["Starter", "Side", "Vegetarian", "Vegan"].includes(r.strCategory);
  return r.strCategory === cat;
}

export default function Busca() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const params = useLocalSearchParams<{ termo?: string }>();
  const termoInicial = typeof params.termo === "string" ? params.termo : Array.isArray(params.termo) ? params.termo[0] : "";
  const [termo, setTermo] = useState(termoInicial ?? "");
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [resultados, setResultados] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { isFavorito, alternarFavorito } = useFavoritos();
  const [catFiltro, setCatFiltro] = useState<string>("Todas");
  const [tempoFiltro, setTempoFiltro] = useState<string | null>(null);

  // Resultados filtrados (sidebar) — derivado de resultados crus
  const exibidos = useMemo(() => {
    return resultados.filter((r) => filtraCategoria(r, catFiltro) && filtraTempo(r, tempoFiltro));
  }, [resultados, catFiltro, tempoFiltro]);

  async function executarBusca(q: string, f: Filtro = filtro) {
    const t = q.trim();
    if (!t) { setResultados([]); return; }
    setCarregando(true);
    setErro(null);
    try {
      const termoEn = traduzirTermo(t);
      if (f === "Ingredientes") {
        const resumos = await buscarReceitasPorIngrediente(termoEn);
        const detalhes = await Promise.all(resumos.slice(0, 9).map((r) => buscarReceitas(r.strMeal).then((a) => a[0]).catch(() => null)));
        const validos = detalhes.filter(Boolean) as Receita[];
        // fallback: se nada por ingrediente, tenta por nome
        if (validos.length === 0) {
          const porNome = await buscarReceitas(termoEn);
          setResultados(porNome);
        } else setResultados(validos);
      } else if (f === "Categorias") {
        const resumos = await filtrarReceitasPorCategoria(termoEn);
        if (resumos.length > 0) {
          const detalhes = await Promise.all(resumos.slice(0, 9).map((r) => buscarReceitas(r.strMeal).then((a) => a[0]).catch(() => null)));
          setResultados(detalhes.filter(Boolean) as Receita[]);
        } else {
          // tenta busca por nome como fallback
          const porNome = await buscarReceitas(termoEn);
          setResultados(porNome.filter((r) => r.strCategory.toLowerCase().includes(termoEn.toLowerCase())));
        }
      } else {
        // Todas / Receitas -> busca por nome (com tradução)
        const porNome = await buscarReceitas(termoEn);
        // se nada e termo era PT, tenta termo original também
        if (porNome.length === 0 && termoEn !== t) {
          const orig = await buscarReceitas(t);
          setResultados(orig);
        } else setResultados(porNome);
      }
    } catch (e: unknown) {
      const m = (e as { mensagem?: string })?.mensagem ?? "Erro ao buscar.";
      setErro(m);
    } finally { setCarregando(false); }
  }

  useEffect(() => {
    if (termoInicial) { setTermo(termoInicial); executarBusca(termoInicial); }
  }, [termoInicial]);

  function handleBuscar(novo: string) { setTermo(novo); setCatFiltro("Todas"); setTempoFiltro(null); executarBusca(novo); }
  function handleFiltroPress(f: Filtro) { setFiltro(f); if (termo) executarBusca(termo, f); }
  function limparFiltros() { setCatFiltro("Todas"); setTempoFiltro(null); setFiltro("Todas"); }

  const header = (
    <View style={styles.header}>
      {!isDesktop && <BarraPesquisa valorInicial={termo} onBuscar={handleBuscar} />}
      <View style={styles.chipsRow}>
        {filtros.map((f) => (
          <TouchableOpacity key={f} style={[styles.chip, filtro === f && styles.chipAtivo]} onPress={() => handleFiltroPress(f)} activeOpacity={0.7}>
            <Text style={[styles.chipText, filtro === f && styles.chipTextAtivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {termo ? (
        <View style={styles.resultHeader}>
          <Text style={styles.titulo}>Resultados para "{termo}"</Text>
          <Text style={styles.count}>{exibidos.length} receitas</Text>
        </View>
      ) : null}
    </View>
  );

  const list = carregando ? (
    <Carregamento mensagem="Buscando receitas..." />
  ) : erro ? (
    <EstadoVazio titulo="Erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={() => executarBusca(termo)} icon="⚠️" />
  ) : exibidos.length === 0 && termo ? (
    <EstadoVazio titulo="Nenhum resultado" mensagem={`Não encontramos receitas para "${termo}". Tente "chicken" ou "pasta".`} icon="🔎" />
  ) : exibidos.length === 0 ? (
    <EstadoVazio titulo="Busque receitas" mensagem="Digite um nome ou ingrediente acima." icon="🍳" />
  ) : (
    <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
      {exibidos.map((r) => (
        <View key={r.idMeal} style={isDesktop ? styles.cardDesktop : styles.cardMobile}>
          <CartaoReceita
            id={r.idMeal}
            titulo={r.strMeal}
            imagem={r.strMealThumb}
            variante={isDesktop ? "vertical" : "horizontal"}
            favoritado={isFavorito(r.idMeal)}
            onPress={() => router.push(`/receita/${r.idMeal}` as never)}
            onFavoritar={() => alternarFavorito(r)}
          />
        </View>
      ))}
    </View>
  );

  if (isDesktop) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar />
        <View style={styles.desktopBody}>
          <View style={styles.filterSidebar}>
            <Text style={styles.filterTitle}>Filtros</Text>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>CATEGORIA</Text>
              {["Todas", "Prato Principal", "Saladas"].map((c) => (
                <TouchableOpacity key={c} style={styles.checkRow} onPress={() => setCatFiltro(c)} activeOpacity={0.7}>
                  <View style={[styles.check, catFiltro === c && styles.checkActive]}>{catFiltro === c && <Text style={styles.checkMark}>✓</Text>}</View>
                  <Text style={[styles.checkText, catFiltro === c && styles.checkTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>TEMPO DE PREPARO</Text>
              {["Até 30 min", "30 a 60 min", "Mais de 60 min"].map((c) => (
                <TouchableOpacity key={c} style={styles.checkRow} onPress={() => setTempoFiltro((prev) => (prev === c ? null : c))} activeOpacity={0.7}>
                  <View style={[styles.radio, tempoFiltro === c && styles.radioActive]}>{tempoFiltro === c && <View style={styles.radioDot} />}</View>
                  <Text style={[styles.checkText, tempoFiltro === c && styles.checkTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.limparBtn} onPress={limparFiltros} activeOpacity={0.8}><Text style={styles.limparText}>Limpar Filtros</Text></TouchableOpacity>
          </View>

          <ScrollView style={styles.desktopMain} contentContainerStyle={styles.desktopMainContent}>
            {header}
            {list}
            {exibidos.length > 0 && (
              <TouchableOpacity style={styles.carregarMais} activeOpacity={0.8} onPress={() => executarBusca(termo)}><Text style={styles.carregarText}>Carregar Mais</Text></TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <View style={styles.mobileHeader}>{header}</View>
      <ScrollView contentContainerStyle={styles.listaMobile} showsVerticalScrollIndicator={false}>{list}</ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  header: { gap: 12, paddingBottom: 12 },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, backgroundColor: cores.surfaceContainerLow, borderWidth: 1, borderColor: cores.outlineVariant + "30" },
  chipAtivo: { backgroundColor: cores.primary, borderColor: cores.primary },
  chipText: { fontSize: 13, fontFamily: "BeVietnamPro_500Medium", color: cores.onSurface },
  chipTextAtivo: { color: cores.onPrimary },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: cores.outlineVariant + "30", paddingBottom: 12, marginTop: 4 },
  titulo: { fontSize: 20, fontFamily: "BeVietnamPro_700Bold", color: cores.onSurface },
  count: { fontSize: 12, fontFamily: "BeVietnamPro_400Regular", color: cores.onSurfaceVariant },
  grid: { gap: 12 },
  gridDesktop: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  cardMobile: {},
  cardDesktop: { width: "31%" },
  listaMobile: { padding: espacamentos.page, gap: 12, paddingBottom: 100 },

  desktopBody: { flex: 1, flexDirection: "row" },
  filterSidebar: { width: 260, backgroundColor: cores.surface, padding: espacamentos.page, gap: 16, borderRightWidth: 1, borderRightColor: cores.outlineVariant + "20" },
  filterTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.onSurface },
  filterGroup: { gap: 8 },
  filterLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 11, color: cores.onSurfaceVariant, letterSpacing: 0.5 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  check: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: cores.outline, alignItems: "center", justifyContent: "center" },
  checkActive: { backgroundColor: cores.primary, borderColor: cores.primary },
  checkMark: { color: cores.onPrimary, fontSize: 10, fontFamily: "BeVietnamPro_700Bold" },
  checkText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurface },
  checkTextActive: { color: cores.primary, fontFamily: "BeVietnamPro_600SemiBold" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: cores.outline, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: cores.primary, borderWidth: 2 },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: cores.primary },
  limparBtn: { borderWidth: 1, borderColor: cores.outlineVariant, borderRadius: 9999, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  limparText: { color: cores.primary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13 },
  desktopMain: { flex: 1 },
  desktopMainContent: { padding: 24, gap: 16, paddingBottom: 40 },
  carregarMais: { alignSelf: "center", borderWidth: 1, borderColor: cores.outlineVariant, borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 10, marginTop: 16 },
  carregarText: { color: cores.primary, fontFamily: "BeVietnamPro_600SemiBold" },
});
