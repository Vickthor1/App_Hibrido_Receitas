import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { useFavoritos } from "../hooks/useFavoritos";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function Perfil() {
  const router = useRouter();
  const { favoritos } = useFavoritos();

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Perfil" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: "https://i.pravatar.cc/300?img=5" }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.nome}>Marina Silva</Text>
          <Text style={styles.handle}>@marinasilva_cooks</Text>
          <Text style={styles.bio}>Amante da culinária caseira. Sempre em busca da receita perfeita de bolo de cenoura. 🥕🍰</Text>
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statVal}>{favoritos.length}</Text><Text style={styles.statLabel}>Salvas</Text></View>
            <View style={styles.stat}><Text style={styles.statVal}>12</Text><Text style={styles.statLabel}>Criadas</Text></View>
            <View style={styles.stat}><Text style={styles.statVal}>4.8</Text><Text style={styles.statLabel}>Avaliação</Text></View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabAtivo]}><Text style={[styles.tabText, styles.tabTextAtivo]}>Minhas Receitas</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Salvas</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Avaliações</Text></TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => router.push("/busca" as never)}>
            <View style={styles.addIcon}><Text style={styles.addPlus}>+</Text></View>
            <Text style={styles.addText}>Criar Receita</Text>
          </TouchableOpacity>
          {favoritos.slice(0, 4).map((r) => (
            <View key={r.idMeal} style={styles.gridItem}>
              <CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} onPress={() => router.push(`/receita/${r.idMeal}` as never)} />
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
  headerCard: {
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: arredondamento.lg,
    padding: espacamentos.lg,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", borderWidth: 3, borderColor: cores.surface },
  avatar: { width: "100%", height: "100%" },
  nome: { fontSize: 22, fontWeight: "700", color: cores.onSurface },
  handle: { fontSize: 14, color: cores.onSurfaceVariant },
  bio: { fontSize: 14, color: cores.onSurfaceVariant, textAlign: "center", lineHeight: 20 },
  stats: { flexDirection: "row", gap: 24, marginTop: 8, borderTopWidth: 1, borderTopColor: cores.outlineVariant + "40", paddingTop: 12 },
  stat: { alignItems: "center", minWidth: 64 },
  statVal: { fontSize: 18, fontWeight: "700", color: cores.primary },
  statLabel: { fontSize: 10, fontWeight: "600", color: cores.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.5 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.outlineVariant, gap: 16 },
  tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabAtivo: { borderBottomColor: cores.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: cores.onSurfaceVariant },
  tabTextAtivo: { color: cores.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "48%" },
  addCard: {
    width: "48%",
    height: 200,
    backgroundColor: cores.surfaceContainerHigh,
    borderRadius: arredondamento.lg,
    borderWidth: 2,
    borderColor: cores.outlineVariant,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: cores.primaryContainer, alignItems: "center", justifyContent: "center" },
  addPlus: { color: cores.onPrimaryContainer, fontSize: 28, fontWeight: "700" },
  addText: { fontSize: 12, fontWeight: "600", color: cores.onSurfaceVariant },
});
