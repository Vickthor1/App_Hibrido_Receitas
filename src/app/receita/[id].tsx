import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { buscarReceitaPorId, extrairIngredientes } from "../../servicos/api";
import { Receita, Ingrediente } from "../../tipos/receita";
import { useFavoritos } from "../../hooks/useFavoritos";
import { Carregamento } from "../../componentes/Carregamento";
import { EstadoVazio } from "../../componentes/EstadoVazio";
import { cores } from "../../tema/cores";
import { espacamentos, arredondamento } from "../../tema/espacamentos";

type Aba = "ingredientes" | "preparo";

export default function ReceitaDetalhes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorito, alternarFavorito } = useFavoritos();

  const [receita, setReceita] = useState<Receita | null>(null);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [aba, setAba] = useState<Aba>("ingredientes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<number, boolean>>({});

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

  const fav = isFavorito(receita.idMeal);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header voltar */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => fav ? null : null} style={styles.spacer} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: receita.strMealThumb }} style={styles.heroImage} />
          <TouchableOpacity style={styles.favBtn} onPress={() => alternarFavorito(receita)} activeOpacity={0.8}>
            <Text style={[styles.favIcon, fav && styles.favAtivo]}>{fav ? "♥" : "♡"}</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.titulo}>{receita.strMeal}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaStar}>★ 4.9</Text>
            <Text style={styles.metaSep}>•</Text>
            <Text style={styles.metaText}>{receita.strCategory} • {receita.strArea}</Text>
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
            <TouchableOpacity style={styles.btnIcon} onPress={() => receita.strYoutube && Linking.openURL(receita.strYoutube)} activeOpacity={0.7}>
              <Text style={styles.btnIconText}>↗</Text>
            </TouchableOpacity>
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
                  <Text style={[styles.ingText, checks[idx] && styles.ingTextAtivo]}>
                    {ing.medida ? `${ing.medida} ` : ""}{ing.nome}
                  </Text>
                </TouchableOpacity>
              ))}
              {ingredientes.length === 0 && <Text style={styles.vazio}>Ingredientes não informados.</Text>}
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={styles.instrucoes}>{receita.strInstructions}</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  safeErro: { flex: 1, backgroundColor: cores.background, justifyContent: "center" },
  scroll: { paddingBottom: 32 },
  topRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: espacamentos.page, paddingVertical: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: cores.surfaceContainerLowest, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.surfaceVariant },
  backIcon: { fontSize: 20, color: cores.onSurface },
  spacer: { width: 36 },
  hero: { marginHorizontal: espacamentos.page, height: 320, borderRadius: arredondamento.lg, overflow: "hidden", backgroundColor: cores.surfaceVariant },
  heroImage: { width: "100%", height: "100%" },
  favBtn: { position: "absolute", top: 12, right: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  favIcon: { fontSize: 20, color: cores.onSurfaceVariant },
  favAtivo: { color: cores.primary },
  info: { padding: espacamentos.page, gap: 12 },
  titulo: { fontSize: 26, fontWeight: "700", color: cores.onSurface, lineHeight: 30 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaStar: { color: cores.primary, fontWeight: "700", fontSize: 13 },
  metaSep: { color: cores.onSurfaceVariant },
  metaText: { color: cores.onSurfaceVariant, fontSize: 13 },
  descricao: { color: cores.onSurfaceVariant, fontSize: 15, lineHeight: 22 },
  quickCards: { flexDirection: "row", backgroundColor: cores.surfaceContainerLow, borderRadius: arredondamento.lg, borderWidth: 1, borderColor: cores.outlineVariant + "30", padding: 12, marginTop: 8 },
  quickItem: { flex: 1, alignItems: "center", gap: 4, borderRightWidth: 1, borderRightColor: cores.outlineVariant + "50" },
  quickIcon: { fontSize: 16, color: cores.primary },
  quickVal: { fontSize: 16, fontWeight: "700", color: cores.onSurface },
  quickLabel: { fontSize: 10, fontWeight: "600", color: cores.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 },
  acoes: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnPrimario: { flex: 1, backgroundColor: cores.primary, paddingVertical: 14, borderRadius: arredondamento.pill, alignItems: "center" },
  btnPrimarioText: { color: cores.onPrimary, fontWeight: "700", fontSize: 15 },
  btnIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: cores.outline, alignItems: "center", justifyContent: "center" },
  btnIconText: { fontSize: 18, color: cores.onSurfaceVariant },
  tabsWrap: { marginHorizontal: espacamentos.page, backgroundColor: cores.surfaceContainerLowest, borderRadius: arredondamento.lg, borderWidth: 1, borderColor: cores.outlineVariant, overflow: "hidden", marginTop: 8 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.outlineVariant },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabAtivo: { borderBottomWidth: 2, borderBottomColor: cores.primary, backgroundColor: cores.surfaceContainerLow },
  tabText: { fontSize: 14, fontWeight: "600", color: cores.onSurfaceVariant },
  tabTextAtivo: { color: cores.primary },
  tabContent: { padding: espacamentos.lg, gap: 12 },
  tabHeader: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 4 },
  tabIcon: { color: cores.primary, fontSize: 14 },
  tabTitle: { fontSize: 16, fontWeight: "600", color: cores.onSurface },
  ingItem: { flexDirection: "row", gap: 12, padding: 10, borderRadius: 8, alignItems: "center" },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: cores.outline, alignItems: "center", justifyContent: "center" },
  checkAtivo: { backgroundColor: cores.primary, borderColor: cores.primary },
  checkMark: { color: cores.onPrimary, fontSize: 12, fontWeight: "700" },
  ingText: { flex: 1, fontSize: 15, color: cores.onSurface, lineHeight: 20 },
  ingTextAtivo: { textDecorationLine: "line-through", color: cores.onSurfaceVariant, opacity: 0.6 },
  instrucoes: { fontSize: 15, lineHeight: 24, color: cores.onSurface },
  ytBtn: { marginTop: 12, backgroundColor: cores.primaryContainer, padding: 12, borderRadius: arredondamento.pill, alignItems: "center" },
  ytText: { color: cores.onPrimaryContainer, fontWeight: "700" },
  vazio: { color: cores.onSurfaceVariant, fontStyle: "italic" },
});
