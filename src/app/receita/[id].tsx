import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleProp, StyleSheet, TextStyle, TouchableOpacity, Linking, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { buscarReceitaPorId, extrairIngredientes } from "../../servicos/api";
import { Receita, Ingrediente } from "../../tipos/receita";
import { useFavoritos } from "../../hooks/useFavoritos";
import { useTraducao } from "../../hooks/useTraducao";
import { rotuloArea, rotuloCategoria, traduzirMedida } from "../../locales/pt-BR/receitas";
import { Carregamento } from "../../componentes/Carregamento";
import { EstadoVazio } from "../../componentes/EstadoVazio";
import { YouTubePlayer } from "../../componentes/YouTubePlayer";
import { TopBar } from "../../componentes/TopBar";
import { useTema } from "../../contexto/TemaContext";
import { Cores } from "../../tema/cores";
import { espacamentos, arredondamento } from "../../tema/espacamentos";

type Aba = "ingredientes" | "preparo";

function TextoIngrediente({ ingrediente, style }: { ingrediente: Ingrediente; style: StyleProp<TextStyle> }) {
  const { texto } = useTraducao(ingrediente.nome);

  return (
    <Text style={style}>
      {ingrediente.medida ? `${traduzirMedida(ingrediente.medida)} ` : ""}{texto}
    </Text>
  );
}

export default function ReceitaDetalhes() {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorito, alternarFavorito } = useFavoritos();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [receita, setReceita] = useState<Receita | null>(null);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [aba, setAba] = useState<Aba>("ingredientes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [verOriginal, setVerOriginal] = useState(false);
  const { texto: titulo } = useTraducao(receita?.strMeal);
  // O modo de preparo gasta mais cota de tradução, então só é pedido ao abrir a aba.
  const instrucoes = useTraducao(receita?.strInstructions, { longo: true, ativo: aba === "preparo" });

  useEffect(() => {
    async function carregar() {
      try {
        if (!id) return;
        const res = await buscarReceitaPorId(String(id));
        if (!res) { setErro("Receita não encontrada."); return; }
        setReceita(res);
        setIngredientes(extrairIngredientes(res));
      } catch (e: unknown) {
        const m = (e as { mensagem?: string })?.mensagem ?? "Erro ao carregar receita.";
        setErro(m);
      } finally { setCarregando(false); }
    }
    carregar();
  }, [id]);

  function toggleCheck(idx: number) {
    setChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  if (carregando) return <Carregamento mensagem="Carregando receita..." />;
  if (erro || !receita) return (
    <SafeAreaView style={styles.safeErro}>
      <EstadoVazio titulo={erro ?? "Receita não encontrada"} mensagem="Volte e tente outra receita." acaoTexto="Voltar" onAcao={() => router.back()} icon="🍽️" />
    </SafeAreaView>
  );

  const fav = receita ? isFavorito(receita.idMeal) : false;

  return (
    <SafeAreaView style={styles.safe}>
      {isDesktop && <TopBar />}
      <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} showsVerticalScrollIndicator={false}>
        {/* Header voltar */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backIcon}>‹ Voltar</Text></TouchableOpacity>
          <View style={styles.spacer} />
        </View>

        <View style={isDesktop ? styles.twoCol : undefined}>
          {/* Hero */}
          <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
            <Image source={{ uri: receita.strMealThumb }} style={styles.heroImage} />
            <TouchableOpacity style={styles.favBtn} onPress={() => alternarFavorito(receita)} activeOpacity={0.8}>
              <Text style={[styles.favIcon, fav && styles.favAtivo]}>{fav ? "♥" : "♡"}</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={[styles.info, isDesktop && styles.infoDesktop]}>
          <Text style={styles.titulo}>{titulo}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaStar}>★ 4.9</Text>
            <Text style={styles.metaSep}>•</Text>
            <Text style={styles.metaText}>{rotuloCategoria(receita.strCategory)} • {rotuloArea(receita.strArea)}</Text>
          </View>
          <Text style={styles.descricao}>Clássica, saborosa e perfeita para reunir a família. Camadas de massa, molho rico e muito queijo derretido.</Text>

          {/* Quick info cards */}
          <View style={styles.quickCards}>
            <View style={styles.quickItem}><Text style={styles.quickIcon}>◷</Text><Text style={styles.quickVal}>90 min</Text><Text style={styles.quickLabel}>Tempo Total</Text></View>
            <View style={styles.quickItem}><Text style={styles.quickIcon}>◆</Text><Text style={styles.quickVal}>Média</Text><Text style={styles.quickLabel}>Dificuldade</Text></View>
            <View style={styles.quickItem}><Text style={styles.quickIcon}>▭</Text><Text style={styles.quickVal}>6 porções</Text><Text style={styles.quickLabel}>Rendimento</Text></View>
          </View>

          <View style={styles.acoes}>
            <TouchableOpacity style={styles.btnPrimario} activeOpacity={0.85} onPress={() => setAba("preparo")}>
              <Text style={styles.btnPrimarioText}>▶ Iniciar Preparo</Text>
            </TouchableOpacity>
            {receita.strYoutube ? (
              <TouchableOpacity style={styles.btnIcon} onPress={() => Linking.openURL(receita.strYoutube!)} activeOpacity={0.7} accessibilityRole="link" accessibilityLabel="Abrir vídeo no YouTube">
                <Text style={styles.btnIconText}>↗</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* PLAYER DO YOUTUBE INCORPORADO */}
          <YouTubePlayer urlYoutube={receita.strYoutube} tituloReceita={receita.strMeal} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, aba === "ingredientes" && styles.tabAtivo]} onPress={() => setAba("ingredientes")}>
              <Text style={[styles.tabText, aba === "ingredientes" && styles.tabTextAtivo]}>Ingredientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, aba === "preparo" && styles.tabAtivo]} onPress={() => setAba("preparo")}>
              <Text style={[styles.tabText, aba === "preparo" && styles.tabTextAtivo]}>Modo de preparo</Text>
            </TouchableOpacity>
          </View>

          {aba === "ingredientes" ? (
            <View style={styles.tabContent}>
              <View style={styles.tabHeader}><Text style={styles.tabIcon}>◈</Text><Text style={styles.tabTitle}>O que você vai precisar</Text></View>
              {ingredientes.map((ing, idx) => (
                <TouchableOpacity key={idx} style={styles.ingItem} onPress={() => toggleCheck(idx)} activeOpacity={0.6}>
                  <View style={[styles.check, checks[idx] && styles.checkAtivo]}>
                    {checks[idx] && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <TextoIngrediente ingrediente={ing} style={[styles.ingText, checks[idx] && styles.ingTextAtivo]} />
                </TouchableOpacity>
              ))}
              {ingredientes.length === 0 && <Text style={styles.vazio}>Ingredientes não informados.</Text>}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {instrucoes.carregando ? (
                <Text style={styles.instrucoes}>Traduzindo o modo de preparo...</Text>
              ) : (
                <Text style={styles.instrucoes}>{verOriginal ? receita.strInstructions : instrucoes.texto}</Text>
              )}
              {!instrucoes.carregando && !instrucoes.traduzido ? (
                <TouchableOpacity onPress={instrucoes.tentarNovamente} accessibilityRole="button">
                  <Text style={styles.avisoTraducao}>Tradução indisponível no momento · Tentar traduzir</Text>
                </TouchableOpacity>
              ) : null}
              {instrucoes.traduzido ? (
                <TouchableOpacity onPress={() => setVerOriginal((atual) => !atual)} accessibilityRole="button">
                  <Text style={styles.avisoTraducao}>
                    {verOriginal ? "Ver tradução" : "Traduzido automaticamente · Ver original"}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {receita.strYoutube ? (
                <TouchableOpacity style={styles.ytBtn} onPress={() => Linking.openURL(receita.strYoutube!)}>
                  <Text style={styles.ytText}>▶ Ver no YouTube</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: coresTema.background },
  safeErro: { flex: 1, backgroundColor: coresTema.background, justifyContent: "center" },
  scroll: { paddingBottom: 32, maxWidth: 1280, alignSelf: "center", width: "100%" },
  scrollDesktop: { paddingHorizontal: 24 },
  topRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: espacamentos.page, paddingVertical: 8 },
  backBtn: { paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: coresTema.surfaceContainerLowest, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: coresTema.surfaceVariant, flexDirection: "row", gap: 4 },
  backIcon: { fontSize: 14, color: coresTema.onSurface, fontFamily: "BeVietnamPro_600SemiBold" },
  spacer: { width: 36 },
  twoCol: { flexDirection: "row", gap: 24, paddingHorizontal: 24, marginTop: 8 },
  hero: { marginHorizontal: espacamentos.page, height: 320, borderRadius: 16, overflow: "hidden", backgroundColor: coresTema.surfaceVariant },
  heroDesktop: { marginHorizontal: 0, flex: 1, height: 420 },
  heroImage: { width: "100%", height: "100%" },
  favBtn: { position: "absolute", top: 12, right: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: coresTema.surfaceContainerLowest + "EB", alignItems: "center", justifyContent: "center" },
  favIcon: { fontSize: 20, color: coresTema.onSurfaceVariant },
  favAtivo: { color: coresTema.primary },
  info: { padding: espacamentos.page, gap: 12 },
  infoDesktop: { flex: 1, padding: 0, justifyContent: "center" },
  titulo: { fontSize: 26, fontWeight: "700", color: coresTema.onSurface, lineHeight: 30 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaStar: { color: coresTema.primary, fontWeight: "700", fontSize: 13 },
  metaSep: { color: coresTema.onSurfaceVariant },
  metaText: { color: coresTema.onSurfaceVariant, fontSize: 13 },
  descricao: { color: coresTema.onSurfaceVariant, fontSize: 15, lineHeight: 22 },
  quickCards: { flexDirection: "row", backgroundColor: coresTema.surfaceContainerLow, borderRadius: arredondamento.lg, borderWidth: 1, borderColor: coresTema.outlineVariant + "30", padding: 12, marginTop: 8 },
  quickItem: { flex: 1, alignItems: "center", gap: 4, borderRightWidth: 1, borderRightColor: coresTema.outlineVariant + "50" },
  quickIcon: { fontSize: 16, color: coresTema.primary },
  quickVal: { fontSize: 16, fontWeight: "700", color: coresTema.onSurface },
  quickLabel: { fontSize: 10, fontWeight: "600", color: coresTema.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 },
  acoes: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnPrimario: { flex: 1, backgroundColor: coresTema.primary, paddingVertical: 14, borderRadius: arredondamento.pill, alignItems: "center" },
  btnPrimarioText: { color: coresTema.onPrimary, fontWeight: "700", fontSize: 15 },
  btnIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: coresTema.outline, alignItems: "center", justifyContent: "center" },
  btnIconText: { fontSize: 18, color: coresTema.onSurfaceVariant },
  tabsWrap: { marginHorizontal: espacamentos.page, backgroundColor: coresTema.surfaceContainerLowest, borderRadius: arredondamento.lg, borderWidth: 1, borderColor: coresTema.outlineVariant, overflow: "hidden", marginTop: 8 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: coresTema.outlineVariant },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabAtivo: { borderBottomWidth: 2, borderBottomColor: coresTema.primary, backgroundColor: coresTema.surfaceContainerLow },
  tabText: { fontSize: 14, fontWeight: "600", color: coresTema.onSurfaceVariant },
  tabTextAtivo: { color: coresTema.primary },
  tabContent: { padding: espacamentos.lg, gap: 12 },
  tabHeader: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 4 },
  tabIcon: { color: coresTema.primary, fontSize: 14 },
  tabTitle: { fontSize: 16, fontWeight: "600", color: coresTema.onSurface },
  ingItem: { flexDirection: "row", gap: 12, padding: 10, borderRadius: 8, alignItems: "center" },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: coresTema.outline, alignItems: "center", justifyContent: "center" },
  checkAtivo: { backgroundColor: coresTema.primary, borderColor: coresTema.primary },
  checkMark: { color: coresTema.onPrimary, fontSize: 12, fontWeight: "700" },
  ingText: { flex: 1, fontSize: 15, color: coresTema.onSurface, lineHeight: 20 },
  ingTextAtivo: { textDecorationLine: "line-through", color: coresTema.onSurfaceVariant, opacity: 0.6 },
  avisoTraducao: { color: coresTema.primary, fontSize: 12, fontWeight: "600" },
  instrucoes: { fontSize: 15, lineHeight: 24, color: coresTema.onSurface },
  ytBtn: { marginTop: 12, backgroundColor: coresTema.primaryContainer, padding: 12, borderRadius: arredondamento.pill, alignItems: "center" },
  ytText: { color: coresTema.onPrimaryContainer, fontWeight: "700" },
  vazio: { color: coresTema.onSurfaceVariant, fontStyle: "italic" },
});
