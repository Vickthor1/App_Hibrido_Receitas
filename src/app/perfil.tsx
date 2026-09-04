import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { Sidebar } from "../componentes/Sidebar";
import { useFavoritos } from "../hooks/useFavoritos";
import { useAuth } from "../contexto/AuthContext";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function Perfil() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { favoritos } = useFavoritos();
  const { user, isAutenticado, logout, carregando } = useAuth();

  if (carregando) return null;
  if (!isAutenticado) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar titulo="Perfil" />
        <View style={styles.locked}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Acesso restrito</Text>
          <Text style={styles.lockText}>Faça login para ver seu perfil.</Text>
          <TouchableOpacity style={styles.lockBtn} onPress={() => router.push("/login" as never)} activeOpacity={0.8}><Text style={styles.lockBtnText}>Entrar / Criar conta</Text></TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const profileCard = (
    <View style={styles.headerCard}>
      <View style={styles.avatarWrap}><Image source={{ uri: "https://i.pravatar.cc/300?img=5" }} style={styles.avatar} /></View>
      <Text style={styles.nome}>{user?.nome ?? "Marina Silva"}</Text>
      <Text style={styles.handle}>@{user?.email.split("@")[0] ?? "marinasilva_cooks"}</Text>
      <Text style={styles.bio}>Amante da culinária caseira e confeiteira. Compartilhando receitas de família e toques modernos.</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statVal}>{favoritos.length}</Text><Text style={styles.statLabel}>SALVOS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>48</Text><Text style={styles.statLabel}>CRIADAS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>4.9 ★</Text><Text style={styles.statLabel}>AVALIAÇÃO</Text></View>
      </View>
      <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}><Text style={styles.editText}>Editar Perfil</Text></TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutText}>Sair</Text></TouchableOpacity>
    </View>
  );

  const settingsCard = (
    <View style={styles.settingsCard}>
      <TouchableOpacity style={styles.settingsRow}><Text style={styles.settingsIcon}>⚙</Text><Text style={styles.settingsText}>Configurações da Conta</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingsRow}><Text style={styles.settingsIcon}>🔔</Text><Text style={styles.settingsText}>Preferências de Notificação</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingsRow}><Text style={styles.settingsIcon}>🔒</Text><Text style={styles.settingsText}>Privacidade e Segurança</Text></TouchableOpacity>
    </View>
  );

  if (isDesktop) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar />
        <View style={styles.desktopBody}>
          <View style={styles.desktopLeft}>
            {profileCard}
            {settingsCard}
          </View>
          <ScrollView style={styles.desktopRight} contentContainerStyle={styles.desktopRightContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, styles.tabAtivo]}><Text style={[styles.tabText, styles.tabTextAtivo]}>Minhas Receitas</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Salvos</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Avaliações</Text></TouchableOpacity>
            </View>
            <View style={styles.grid}>
              <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => router.push("/busca" as never)}>
                <View style={styles.addIcon}><Text style={styles.addPlus}>+</Text></View><Text style={styles.addText}>Nova Receita</Text>
              </TouchableOpacity>
              {favoritos.slice(0, 4).map((r) => (
                <View key={r.idMeal} style={styles.gridItem}><CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} onPress={() => router.push(`/receita/${r.idMeal}` as never)} /></View>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Perfil" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {profileCard}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabAtivo]}><Text style={[styles.tabText, styles.tabTextAtivo]}>Minhas Receitas</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Salvas</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Avaliações</Text></TouchableOpacity>
        </View>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => router.push("/busca" as never)}><View style={styles.addIcon}><Text style={styles.addPlus}>+</Text></View><Text style={styles.addText}>Criar Receita</Text></TouchableOpacity>
          {favoritos.slice(0, 4).map((r) => (
            <View key={r.idMeal} style={styles.gridItem}><CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} onPress={() => router.push(`/receita/${r.idMeal}` as never)} /></View>
          ))}
        </View>
        <View style={styles.mobileSettings}>
          <Text style={styles.mobileSettingsTitle}>Configurações</Text>
          <TouchableOpacity style={styles.mobileRow}><Text>⚙ Editar Perfil</Text><Text>›</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mobileRow}><Text>🔔 Notificações</Text><Text>›</Text></TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  desktopBody: { flex: 1, flexDirection: "row" },
  desktopLeft: { width: 320, padding: espacamentos.page, gap: 16, backgroundColor: cores.background },
  desktopRight: { flex: 1 },
  desktopRightContent: { padding: 24, gap: 16, paddingBottom: 40 },
  scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
  headerCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 20, alignItems: "center", gap: 8, borderWidth: 1, borderColor: cores.surfaceVariant },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", borderWidth: 3, borderColor: cores.surface },
  avatar: { width: "100%", height: "100%" },
  nome: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, color: cores.onSurface },
  handle: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant },
  bio: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, textAlign: "center", lineHeight: 18 },
  stats: { flexDirection: "row", gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: cores.outlineVariant + "30", paddingTop: 12 },
  stat: { alignItems: "center", minWidth: 64, flex: 1 },
  statVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.primary },
  statLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: cores.onSurfaceVariant, letterSpacing: 0.5 },
  editBtn: { marginTop: 12, backgroundColor: cores.surfaceContainerHigh, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999, width: "100%", alignItems: "center" },
  editText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurface },
  logoutBtn: { paddingVertical: 8 },
  logoutText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.onSurfaceVariant },
  settingsCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 12, borderWidth: 1, borderColor: cores.surfaceVariant, padding: 8 },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 8 },
  settingsIcon: { fontSize: 18, color: cores.onSurfaceVariant },
  settingsText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurface },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.outlineVariant + "40", gap: 16 },
  tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabAtivo: { borderBottomColor: cores.primary },
  tabText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: cores.onSurfaceVariant },
  tabTextAtivo: { color: cores.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "48%" },
  addCard: { width: "48%", height: 180, backgroundColor: cores.surfaceContainerHigh, borderRadius: 16, borderWidth: 2, borderColor: cores.outlineVariant, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
  addIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: cores.primaryContainer, alignItems: "center", justifyContent: "center" },
  addPlus: { color: cores.onPrimaryContainer, fontSize: 24, fontFamily: "BeVietnamPro_700Bold" },
  addText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: cores.onSurfaceVariant },
  mobileSettings: { backgroundColor: cores.surfaceContainerLow, borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: cores.surfaceVariant, marginTop: 8 },
  mobileSettingsTitle: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 16, color: cores.onSurface },
  mobileRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: cores.surface, padding: 12, borderRadius: 8 },
  locked: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  lockIcon: { fontSize: 48 },
  lockTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface },
  lockText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurfaceVariant, textAlign: "center" },
  lockBtn: { marginTop: 8, backgroundColor: cores.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  lockBtnText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold" },
});
