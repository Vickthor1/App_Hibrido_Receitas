import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarraPesquisa } from "../componentes/BarraPesquisa";
import { BottomNav } from "../componentes/BottomNav";
import { Carregamento } from "../componentes/Carregamento";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";
import { useTema } from "../contexto/TemaContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { interpretarTermo, rotuloCategoria } from "../locales/pt-BR/receitas";
import { buscarReceitas, buscarReceitasPorIngrediente, filtrarReceitasPorCategoria, listarReceitasDisponiveis } from "../servicos/api";
import { traduzirBusca } from "../servicos/traducao";
import { Cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";
import { Receita, ReceitaResumo } from "../tipos/receita";

type Filtro = "Todas" | "Receitas" | "Ingredientes" | "Categorias";
const filtros: Filtro[] = ["Todas", "Receitas", "Ingredientes", "Categorias"];

const POR_PAGINA = 12;

// Os filtros da TheMealDB devolvem só id, nome e foto, que é o que os cartões usam.
function comoReceitas(resumos: ReceitaResumo[], categoria = ""): Receita[] {
  return resumos.map((resumo) => ({ ...resumo, strCategory: categoria }) as Receita);
}

function semRepetidas(receitas: Receita[]): Receita[] {
  const vistas = new Set<string>();
  return receitas.filter((receita) => {
    if (vistas.has(receita.idMeal)) return false;
    vistas.add(receita.idMeal);
    return true;
  });
}

async function buscarPorNomeEIngrediente(termo: string): Promise<Receita[]> {
  const [porNome, porIngrediente] = await Promise.all([
    buscarReceitas(termo),
    buscarReceitasPorIngrediente(termo),
  ]);
  return semRepetidas([...porNome, ...comoReceitas(porIngrediente)]);
}

async function pesquisar(termo: string, filtro: Filtro): Promise<Receita[]> {
  const { ingles, categoria } = interpretarTermo(termo);

  async function porFiltro(busca: string): Promise<Receita[]> {
    if (filtro === "Receitas") return buscarReceitas(busca);
    if (filtro === "Ingredientes") return comoReceitas(await buscarReceitasPorIngrediente(busca));
    if (filtro === "Categorias") {
      const nome = categoria ?? busca;
      return comoReceitas(await filtrarReceitasPorCategoria(nome), nome);
    }
    if (categoria) return comoReceitas(await filtrarReceitasPorCategoria(categoria), categoria);
    return buscarPorNomeEIngrediente(busca);
  }

  const resultados = await porFiltro(ingles);
  if (resultados.length > 0) return resultados;

  // Sem resultado: tenta traduzir a busca para o inglês.
  const traduzido = await traduzirBusca(termo);
  return traduzido ? porFiltro(traduzido) : [];
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
  if (cat === "Todas" || !r.strCategory) return true;
  if (cat === "Prato Principal") return ["Chicken", "Beef", "Pork", "Lamb"].includes(r.strCategory);
  if (cat === "Saladas") return ["Starter", "Side", "Vegetarian", "Vegan"].includes(r.strCategory);
  return r.strCategory === cat;
}

export default function Busca() {
  const router = useRouter();
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const params = useLocalSearchParams<{ termo?: string; filtro?: string }>();
  const termoInicial = typeof params.termo === "string" ? params.termo : Array.isArray(params.termo) ? params.termo[0] : "";
  const filtroInicial = filtros.find((f) => f === params.filtro) ?? "Todas";
  const [termo, setTermo] = useState(termoInicial ?? "");
  const [filtro, setFiltro] = useState<Filtro>(filtroInicial);
  const [resultados, setResultados] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { isFavorito, alternarFavorito } = useFavoritos();
  const [catFiltro, setCatFiltro] = useState<string>("Todas");
  const [tempoFiltro, setTempoFiltro] = useState<string | null>(null);
  const [limite, setLimite] = useState(POR_PAGINA);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const ultimaBusca = useRef(0);

  // Resultados filtrados — derivado de resultados crus
  const exibidos = useMemo(() => {
    return resultados.filter((r) => filtraCategoria(r, catFiltro) && filtraTempo(r, tempoFiltro));
  }, [resultados, catFiltro, tempoFiltro]);
  const visiveis = exibidos.slice(0, limite);

  const executarBusca = useCallback(async (q: string, f: Filtro) => {
    const busca = ++ultimaBusca.current;
    const t = q.trim();

    setCarregando(true);
    setErro(null);
    setLimite(POR_PAGINA);

    try {
      const encontrados = t ? await pesquisar(t, f) : await listarReceitasDisponiveis();
      if (busca === ultimaBusca.current) setResultados(encontrados);
    } catch (e: unknown) {
      if (busca === ultimaBusca.current) {
        setErro((e as { mensagem?: string })?.mensagem ?? "Erro ao buscar.");
      }
    } finally {
      if (busca === ultimaBusca.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    executarBusca(termoInicial ?? "", filtroInicial);
  }, [termoInicial, filtroInicial, executarBusca]);

  function handleBuscar(novo: string) { setTermo(novo); setCatFiltro("Todas"); setTempoFiltro(null); executarBusca(novo, filtro); }
  function handleFiltroPress(f: Filtro) { setFiltro(f); executarBusca(termo, f); }
  function limparFiltros() { setCatFiltro("Todas"); setTempoFiltro(null); setFiltro("Todas"); executarBusca(termo, "Todas"); }

  const header = (
    <View style={styles.header}>
      {!isDesktop && <BarraPesquisa valorInicial={termo} onBuscar={handleBuscar} onFiltroPress={() => setFiltrosAbertos((aberto) => !aberto)} />}
      <View style={styles.chipsRow}>
        {filtros.map((f) => (
          <TouchableOpacity key={f} style={[styles.chip, filtro === f && styles.chipAtivo]} onPress={() => handleFiltroPress(f)} activeOpacity={0.7}>
            <Text style={[styles.chipText, filtro === f && styles.chipTextAtivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.resultHeader}>
        <Text style={styles.titulo}>{termo ? `Resultados para "${rotuloCategoria(termo)}"` : "Todas as receitas"}</Text>
        <Text style={styles.count}>{exibidos.length} receitas</Text>
      </View>
    </View>
  );

  const painelFiltros = (
    <>
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
    </>
  );

  const carregarMais = !carregando && !erro && exibidos.length > limite ? (
    <TouchableOpacity style={styles.carregarMais} activeOpacity={0.8} onPress={() => setLimite((atual) => atual + POR_PAGINA)} accessibilityRole="button">
      <Text style={styles.carregarText}>Carregar Mais</Text>
    </TouchableOpacity>
  ) : null;

  const list = carregando ? (
    <Carregamento mensagem="Buscando receitas..." />
  ) : erro ? (
    <EstadoVazio titulo="Erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={() => executarBusca(termo, filtro)} icon="⚠️" />
  ) : exibidos.length === 0 ? (
    <EstadoVazio titulo="Nenhum resultado" mensagem={termo ? `Não encontramos receitas para "${termo}". Tente "frango" ou "massa".` : "Nenhuma receita corresponde aos filtros."} icon="🔎" />
  ) : (
    <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
      {visiveis.map((r) => (
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
          <View style={styles.filterSidebar}>{painelFiltros}</View>

          <ScrollView style={styles.desktopMain} contentContainerStyle={styles.desktopMainContent}>
            {header}
            {list}
            {carregarMais}
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
      <ScrollView contentContainerStyle={styles.listaMobile} showsVerticalScrollIndicator={false}>
        {filtrosAbertos && <View style={styles.filterMobile}>{painelFiltros}</View>}
        {list}
        {carregarMais}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    filterMobile: { backgroundColor: coresTema.surfaceContainerLowest, borderColor: coresTema.surfaceVariant, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 12, padding: 14 },
    safe: {
      flex: 1,
      backgroundColor: coresTema.background,
    },

    header: {
      gap: 12,
      paddingBottom: 12,
    },

    chipsRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },

    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9999,
      backgroundColor: coresTema.surfaceContainerLow,
      borderWidth: 1,
      borderColor: coresTema.outlineVariant + "30",
    },

    chipAtivo: {
      backgroundColor: coresTema.primary,
      borderColor: coresTema.primary,
    },

    chipText: {
      fontSize: 13,
      fontFamily: "BeVietnamPro_500Medium",
      color: coresTema.onSurface,
    },

    chipTextAtivo: {
      color: coresTema.onPrimary,
    },

    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: coresTema.outlineVariant + "30",
      paddingBottom: 12,
      marginTop: 4,
    },

    titulo: {
      fontSize: 20,
      fontFamily: "BeVietnamPro_700Bold",
      color: coresTema.onSurface,
    },

    count: {
      fontSize: 12,
      fontFamily: "BeVietnamPro_400Regular",
      color: coresTema.onSurfaceVariant,
    },

    grid: {
      gap: 12,
    },

    gridDesktop: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },

    cardMobile: {},

    cardDesktop: {
      width: "31%",
    },

    mobileHeader: {
      paddingHorizontal: espacamentos.page,
      paddingTop: 12,
      paddingBottom: 8,
    },

    listaMobile: {
      padding: espacamentos.page,
      gap: 12,
      paddingBottom: 100,
    },

    desktopBody: {
      flex: 1,
      flexDirection: "row",
    },

    filterSidebar: {
      width: 260,
      backgroundColor: coresTema.surface,
      padding: espacamentos.page,
      gap: 16,
      borderRightWidth: 1,
      borderRightColor: coresTema.outlineVariant + "20",
    },

    filterTitle: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 16,
      color: coresTema.onSurface,
    },

    filterGroup: {
      gap: 8,
    },

    filterLabel: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 11,
      color: coresTema.onSurfaceVariant,
      letterSpacing: 0.5,
    },

    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    check: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: coresTema.outline,
      alignItems: "center",
      justifyContent: "center",
    },

    checkActive: {
      backgroundColor: coresTema.primary,
      borderColor: coresTema.primary,
    },

    checkMark: {
      color: coresTema.onPrimary,
      fontSize: 10,
      fontFamily: "BeVietnamPro_700Bold",
    },

    checkText: {
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 13,
      color: coresTema.onSurface,
    },

    checkTextActive: {
      color: coresTema.primary,
      fontFamily: "BeVietnamPro_600SemiBold",
    },

    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: coresTema.outline,
      alignItems: "center",
      justifyContent: "center",
    },

    radioActive: {
      borderColor: coresTema.primary,
      borderWidth: 2,
    },

    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: coresTema.primary,
    },

    limparBtn: {
      borderWidth: 1,
      borderColor: coresTema.outlineVariant,
      borderRadius: 9999,
      paddingVertical: 10,
      alignItems: "center",
      marginTop: 8,
    },

    limparText: {
      color: coresTema.primary,
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 13,
    },

    desktopMain: {
      flex: 1,
    },

    desktopMainContent: {
      padding: 24,
      gap: 16,
      paddingBottom: 40,
    },

    carregarMais: {
      alignSelf: "center",
      borderWidth: 1,
      borderColor: coresTema.outlineVariant,
      borderRadius: 9999,
      paddingHorizontal: 24,
      paddingVertical: 10,
      marginTop: 16,
    },

    carregarText: {
      color: coresTema.primary,
      fontFamily: "BeVietnamPro_600SemiBold",
    },
  });
