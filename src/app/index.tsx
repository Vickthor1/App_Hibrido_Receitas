import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarraPesquisa } from "../componentes/BarraPesquisa";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { CartaoCategorias } from "../componentes/CartaoCategorias";
import { Carregamento } from "../componentes/Carregamento";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { buscarCategorias, buscarReceitas, listarReceitasDisponiveis, filtrarReceitasPorCategoria } from "../servicos/api";
import { Receita, Categoria } from "../tipos/receita";
import { useFavoritos } from "../hooks/useFavoritos";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function Inicio() {
  const router = useRouter();
  const { isFavorito, alternarFavorito } = useFavoritos();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [destaque, setDestaque] = useState<Receita | null>(null);
  const [maisAmadas, setMaisAmadas] = useState<Receita[]>([]);
  const [rapidas, setRapidas] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const [cats, todas] = await Promise.all([buscarCategorias(), listarReceitasDisponiveis()]);
      setCategorias(cats.slice(0, 8));
      if (todas.length > 0) {
        setDestaque(todas[0]);
        setMaisAmadas(todas.slice(1, 5));
        setRapidas(todas.slice(5, 9));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar receitas.";
      // tenta extrair mensagem de ErroApi
      const m = (e as { mensagem?: string })?.mensagem ?? msg;
      setErro(m);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCategoriaPress(cat: string) {
    if (categoriaAtiva === cat) {
      setCategoriaAtiva(null);
      carregar();
      return;
    }
    setCategoriaAtiva(cat);
    setCarregando(true);
    try {
      const resumos = await filtrarReceitasPorCategoria(cat);
      // resumos só têm thumb/nome; busca detalhes para exibir (limit 4)
      const detalhes = await Promise.all(resumos.slice(0, 6).map((r) => buscarReceitas(r.strMeal).then((arr) => arr[0]).catch(() => null)));
      const validas = detalhes.filter(Boolean) as Receita[];
      if (validas.length > 0) {
        setMaisAmadas(validas.slice(0, 4));
        setRapidas(validas.slice(4, 6));
      }
    } catch {}
    setCarregando(false);
  }

  function handleBuscar(termo: string) {
    if (!termo) return;
    router.push(`/busca?termo=${encodeURIComponent(termo)}` as never);
  }

  function handleReceitaPress(id: string) {
    router.push(`/receita/${id}` as never);
  }

  if (carregando && !refreshing) return <Carregamento mensagem="Carregando receitas..." />;

  if (erro) return (
    <SafeAreaView style={[styles.safe, { justifyContent: "center" }]}>
      <TopBar />
      <EstadoVazio titulo="Erro de conexão" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregar} icon="⚠️" />
      <BottomNav />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} colors={[cores.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <BarraPesquisa onBuscar={handleBuscar} />

        {/* Hero — Receita do dia */}
        {destaque && (
          <View style={styles.heroWrap}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleReceitaPress(destaque.idMeal)} style={styles.hero}>
              <Image source={{ uri: destaque.strMealThumb }} style={styles.heroImage} />
              <View style={styles.heroGradient} />
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>Receita do dia</Text>
              </View>
              <TouchableOpacity style={styles.heroFav} onPress={() => alternarFavorito(destaque)}>
                <Text style={[styles.heroFavText, isFavorito(destaque.idMeal) && styles.favAtivo]}>{isFavorito(destaque.idMeal) ? "♥" : "♡"}</Text>
              </TouchableOpacity>
              <View style={styles.heroBottom}>
                <Text style={styles.heroTitulo} numberOfLines={2}>{destaque.strMeal}</Text>
                <View style={styles.heroMeta}>
                  <Text style={styles.heroMetaStar}>★ 4.8</Text>
                  <Text style={styles.heroMetaTime}>◷ 25 min</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotAtivo]} /><View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
            </View>
          </View>
        )}

        {/* Categorias */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Categorias</Text>
            <TouchableOpacity onPress={() => router.push("/categorias" as never)}><Text style={styles.verTodas}>Ver todas</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: espacamentos.page }}>
            {categorias.map((c) => (
              <CartaoCategorias key={c.idCategory} nome={c.strCategory} ativo={categoriaAtiva === c.strCategory} onPress={() => handleCategoriaPress(c.strCategory)} />
            ))}
          </ScrollView>
        </View>

        {/* Mais amadas */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Mais amadas</Text>
            <TouchableOpacity onPress={() => router.push(`/busca?termo=` as never)}><Text style={styles.verTodas}>Ver todas</Text></TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {maisAmadas.map((r) => (
              <View key={r.idMeal} style={styles.gridItem}>
                <CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} favoritado={isFavorito(r.idMeal)} onPress={() => handleReceitaPress(r.idMeal)} onFavoritar={() => alternarFavorito(r)} />
              </View>
            ))}
          </View>
        </View>

        {/* Rápidas e fáceis */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Rápidas e fáceis</Text>
          </View>
          <View style={{ gap: 12 }}>
            {rapidas.map((r) => (
              <CartaoReceita key={r.idMeal} id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} variante="horizontal" favoritado={isFavorito(r.idMeal)} onPress={() => handleReceitaPress(r.idMeal)} onFavoritar={() => alternarFavorito(r)} />
            ))}
            {rapidas.length === 0 && <EstadoVazio mensagem="Nenhuma receita rápida encontrada." icon="⏱️" />}
          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  scroll: { padding: espacamentos.page, paddingBottom: 100, gap: espacamentos.lg },
  heroWrap: { gap: 12 },
  hero: { height: 280, borderRadius: arredondamento.lg, overflow: "hidden", backgroundColor: cores.surfaceVariant, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroGradient: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.35)" },
  heroTag: { position: "absolute", top: 12, left: 12, backgroundColor: cores.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: arredondamento.pill },
  heroTagText: { color: cores.onPrimary, fontSize: 10, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  heroFav: { position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  heroFavText: { fontSize: 16, color: cores.onSurfaceVariant },
  favAtivo: { color: cores.primary },
  heroBottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, gap: 6 },
  heroTitulo: { color: "#fff", fontSize: 22, fontWeight: "700", lineHeight: 28 },
  heroMeta: { flexDirection: "row", gap: 12 },
  heroMetaStar: { color: "#FFD54F", fontSize: 13, fontWeight: "700" },
  heroMetaTime: { color: "#fff", fontSize: 13, opacity: 0.9 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: cores.secondaryFixedDim },
  dotAtivo: { backgroundColor: cores.primary },
  secao: { gap: 12 },
  secaoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  secaoTitulo: { fontSize: 18, fontWeight: "600", color: cores.onSurface },
  verTodas: { fontSize: 12, fontWeight: "500", color: cores.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "48%" },
});
