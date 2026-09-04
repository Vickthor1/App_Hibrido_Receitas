import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, RefreshControl, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarraPesquisa } from "../componentes/BarraPesquisa";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { CartaoCategorias } from "../componentes/CartaoCategorias";
import { Carregamento } from "../componentes/Carregamento";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { Sidebar } from "../componentes/Sidebar";
import { buscarCategorias, buscarReceitas, listarReceitasDisponiveis, filtrarReceitasPorCategoria } from "../servicos/api";
import { Receita, Categoria } from "../tipos/receita";
import { useFavoritos } from "../hooks/useFavoritos";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function Inicio() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
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
      const catsArray = Array.isArray(cats) ? cats : [];
      const todasArray = Array.isArray(todas) ? todas : [];
      setCategorias(catsArray.slice(0, 8));
      if (todasArray.length > 0) {
        setDestaque(todasArray[0]);
        setMaisAmadas(todasArray.slice(1, 5));
        setRapidas(todasArray.slice(5, 9));
      } else {
        setMaisAmadas([]);
        setRapidas([]);
      }
    } catch (e: unknown) {
      const m = (e as { mensagem?: string })?.mensagem ?? (e instanceof Error ? e.message : "Erro");
      setErro(m);
      setMaisAmadas([]);
      setRapidas([]);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function handleCategoriaPress(cat: string) {
    if (categoriaAtiva === cat) { setCategoriaAtiva(null); carregar(); return; }
    setCategoriaAtiva(cat);
    setCarregando(true);
    try {
      const resumos = await filtrarReceitasPorCategoria(cat);
      const detalhes = await Promise.all(resumos.slice(0, 6).map((r) => buscarReceitas(r.strMeal).then((a) => a[0]).catch(() => null)));
      const validas = detalhes.filter(Boolean) as Receita[];
      if (validas.length > 0) {
        setMaisAmadas(validas.slice(0, 4));
        setRapidas(validas.slice(4, 6));
      }
    } catch {} finally { setCarregando(false); }
  }

  function handleBuscar(termo: string) { if (!termo) return; router.push(`/busca?termo=${encodeURIComponent(termo)}` as never); }
  function handleReceitaPress(id: string) { router.push(`/receita/${id}` as never); }

  if (carregando && !refreshing) return <Carregamento mensagem="Carregando receitas..." />;
  if (erro) return (
    <SafeAreaView style={[styles.safe, { justifyContent: "center" }]}>
      <TopBar />
      <EstadoVazio titulo="Erro de conexão" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregar} icon="⚠️" />
      <BottomNav />
    </SafeAreaView>
  );

  const content = (
    <ScrollView
      contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} colors={[cores.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {!isDesktop && <BarraPesquisa onBuscar={handleBuscar} />}

      {destaque && (
        <View style={styles.heroWrap}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleReceitaPress(destaque.idMeal)} style={[styles.hero, isDesktop && styles.heroDesktop]}>
            <Image source={{ uri: destaque.strMealThumb }} style={styles.heroImage} />
            <View style={styles.heroGradient} />
            <View style={styles.heroTag}><Text style={styles.heroTagText}>RECEITA DO DIA</Text></View>
            <TouchableOpacity style={styles.heroFav} onPress={() => alternarFavorito(destaque)}><Text style={[styles.heroFavText, isFavorito(destaque.idMeal) && styles.favAtivo]}>{isFavorito(destaque.idMeal) ? "♥" : "♡"}</Text></TouchableOpacity>
            <View style={styles.heroBottom}>
              <Text style={[styles.heroTitulo, isDesktop && styles.heroTituloDesktop]} numberOfLines={2}>{destaque.strMeal}</Text>
              <View style={styles.heroMeta}><Text style={styles.heroMetaStar}>★ 4.8</Text><Text style={styles.heroMetaTime}>◷ 25 min</Text></View>
            </View>
          </TouchableOpacity>
          <View style={styles.dots}><View style={[styles.dot, styles.dotAtivo]} /><View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} /></View>
        </View>
      )}

      <View style={styles.secao}>
        <View style={styles.secaoHeader}><Text style={styles.secaoTitulo}>Categorias</Text><TouchableOpacity onPress={() => router.push("/categorias" as never)}><Text style={styles.verTodas}>Ver todas</Text></TouchableOpacity></View>
        <ScrollView horizontal={isDesktop ? false : true} showsHorizontalScrollIndicator={false} contentContainerStyle={isDesktop ? styles.catGridDesktop : { gap: 12, paddingRight: espacamentos.page }}>
          {(Array.isArray(categorias) ? categorias : []).map((c) => (
            <CartaoCategorias key={c.idCategory} nome={c.strCategory} ativo={categoriaAtiva === c.strCategory} onPress={() => handleCategoriaPress(c.strCategory)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.secao}>
        <View style={styles.secaoHeader}><Text style={styles.secaoTitulo}>Mais amadas</Text><TouchableOpacity onPress={() => router.push(`/busca?termo=` as never)}><Text style={styles.verTodas}>Ver todas</Text></TouchableOpacity></View>
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {(Array.isArray(maisAmadas) ? maisAmadas : []).map((r) => (
            <View key={r.idMeal} style={[styles.gridItem, isDesktop && styles.gridItemDesktop]}>
              <CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} favoritado={isFavorito(r.idMeal)} onPress={() => handleReceitaPress(r.idMeal)} onFavoritar={() => alternarFavorito(r)} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.secao}>
        <View style={styles.secaoHeader}><Text style={styles.secaoTitulo}>Rápidas e fáceis</Text><TouchableOpacity><Text style={styles.verTodas}>Ver todas</Text></TouchableOpacity></View>
        <View style={[styles.rapidasGrid, isDesktop && styles.rapidasGridDesktop]}>
          {(Array.isArray(rapidas) ? rapidas : []).map((r) => (
            <View key={r.idMeal} style={isDesktop ? styles.rapidasItemDesktop : undefined}>
              <CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} variante="horizontal" favoritado={isFavorito(r.idMeal)} onPress={() => handleReceitaPress(r.idMeal)} onFavoritar={() => alternarFavorito(r)} />
            </View>
          ))}
          {(Array.isArray(rapidas) ? rapidas : []).length === 0 && <EstadoVazio mensagem="Nenhuma receita rápida encontrada." icon="⏱️" />}
        </View>
      </View>

      <View style={styles.footer}><Text style={styles.footerTitle}>Receita Fácil</Text><Text style={styles.footerText}>© 2024 Receita Fácil. Todos os direitos reservados.</Text></View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <View style={styles.body}>
        {isDesktop && <Sidebar />}
        <View style={styles.main}>{content}</View>
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  body: { flex: 1, flexDirection: "row" },
  main: { flex: 1 },
  scroll: { padding: espacamentos.page, paddingBottom: 100, gap: 24 },
  scrollDesktop: { padding: 32, maxWidth: 1280, alignSelf: "center", width: "100%" },
  heroWrap: { gap: 12 },
  hero: { height: 280, borderRadius: 16, overflow: "hidden", backgroundColor: cores.surfaceVariant },
  heroDesktop: { height: 420 },
  heroImage: { width: "100%", height: "100%" },
  heroGradient: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.35)" },
  heroTag: { position: "absolute", top: 16, left: 16, backgroundColor: cores.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  heroTagText: { color: cores.onPrimary, fontSize: 10, fontFamily: "BeVietnamPro_600SemiBold", letterSpacing: 0.5 },
  heroFav: { position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  heroFavText: { fontSize: 18, color: cores.onSurfaceVariant },
  favAtivo: { color: cores.primary },
  heroBottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, gap: 6 },
  heroTitulo: { color: "#fff", fontSize: 22, fontFamily: "BeVietnamPro_700Bold", lineHeight: 28 },
  heroTituloDesktop: { fontSize: 36, lineHeight: 40 },
  heroMeta: { flexDirection: "row", gap: 12 },
  heroMetaStar: { color: "#FFD54F", fontSize: 13, fontFamily: "BeVietnamPro_700Bold" },
  heroMetaTime: { color: "#fff", fontSize: 13, fontFamily: "BeVietnamPro_400Regular", opacity: 0.9 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: cores.secondaryFixedDim },
  dotAtivo: { backgroundColor: cores.primary },
  secao: { gap: 12 },
  secaoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  secaoTitulo: { fontSize: 18, fontFamily: "BeVietnamPro_600SemiBold", color: cores.onSurface },
  verTodas: { fontSize: 12, fontFamily: "BeVietnamPro_500Medium", color: cores.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridDesktop: { gap: 16 },
  gridItem: { width: "48%" },
  gridItemDesktop: { width: "31%" },
  catGridDesktop: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  rapidasGrid: { gap: 12 },
  rapidasGridDesktop: { flexDirection: "row", gap: 16 },
  rapidasItemDesktop: { flex: 1 },
  footer: { backgroundColor: cores.surfaceContainerHighest, padding: 16, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, borderTopWidth: 1, borderTopColor: cores.outlineVariant + "30" },
  footerTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 14, color: cores.onSurface },
  footerText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: cores.onSurfaceVariant },
});
