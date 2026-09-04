import { View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";
import { useState } from "react";

export function TopBar({ titulo }: { titulo?: string }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const { isAutenticado } = useAuth();
  const [q, setQ] = useState("");

  function go(href: string) {
    router.push(href as never);
  }
  function handleSearch() {
    const t = q.trim();
    if (!t) return;
    router.push(`/busca?termo=${encodeURIComponent(t)}` as never);
  }

  if (isDesktop) {
    return (
      <View style={styles.desktop} accessibilityRole="banner">
        <View style={styles.desktopInner}>
          <View style={styles.left}>
            <TouchableOpacity onPress={() => go("/")} accessibilityRole="button" accessibilityLabel="Receita Fácil - Início">
              <Text style={styles.logo}>Receita Fácil</Text>
            </TouchableOpacity>
            <View style={styles.searchPill}>
              <Text style={styles.searchIcon} aria-hidden>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar receitas, ingredientes..."
                placeholderTextColor={cores.onSurfaceVariant}
                value={q}
                onChangeText={setQ}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                accessibilityLabel="Buscar receitas"
              />
            </View>
          </View>
          <View style={styles.centerNav} accessibilityRole="navigation">
            <TouchableOpacity onPress={() => go("/")} style={[styles.navItem, pathname === "/" && styles.navActive]} accessibilityRole="link" accessibilityState={{ selected: pathname === "/" }}>
              <Text style={[styles.navText, pathname === "/" && styles.navTextActive]}>Explorar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("/categorias")} accessibilityRole="link"><Text style={styles.navText}>Populares</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => go("/categorias")} accessibilityRole="link"><Text style={styles.navText}>Sazonais</Text></TouchableOpacity>
          </View>
          <View style={styles.right}>
            <TouchableOpacity style={styles.addBtn} onPress={() => go(isAutenticado ? "/adicionar" : "/login")} accessibilityRole="button" accessibilityLabel="Adicionar receita">
              <Text style={styles.addText}>Adicionar Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("/favoritos")} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Favoritos">
              <Text style={styles.icon}>♡</Text><Text style={styles.iconLabel}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("/perfil")} style={styles.avatarBtn} accessibilityRole="button" accessibilityLabel="Perfil">
              <Text style={styles.avatarTxt}>◯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobile} accessibilityRole="banner">
      <View style={styles.mobileRow}>
        <TouchableOpacity style={styles.mIconBtn} accessibilityRole="button" accessibilityLabel="Menu"><Text style={styles.mIcon}>☰</Text></TouchableOpacity>
        <Text style={styles.mTitle} accessibilityRole="header">{titulo ?? "Receitas"}</Text>
        <TouchableOpacity style={styles.mIconBtn} accessibilityRole="button" accessibilityLabel="Notificações"><Text style={styles.mIcon}>◯</Text></TouchableOpacity>
      </View>
      {!titulo && (
        <View style={styles.mSearchWrap}>
          <View style={styles.mSearchPill}>
            <Text style={styles.searchIcon} aria-hidden>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar receitas, ingredientes..."
              placeholderTextColor={cores.onSurfaceVariant}
              value={q}
              onChangeText={setQ}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              accessibilityLabel="Buscar receitas"
            />
            <TouchableOpacity style={styles.mFilterBtn} onPress={handleSearch} accessibilityRole="button" accessibilityLabel="Buscar"><Text style={styles.mFilterTxt}>→</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    backgroundColor: cores.surface,
    borderBottomWidth: 1,
    borderBottomColor: cores.outline,
    paddingHorizontal: espacamentos.page,
    height: 56,
    justifyContent: "center",
  },
  desktopInner: { maxWidth: 1280, width: "100%", alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  left: { flexDirection: "row", alignItems: "center", gap: 16, flex: 1 },
  logo: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface, letterSpacing: -0.3 },
  searchPill: {
    flex: 1, maxWidth: 360, flexDirection: "row", alignItems: "center", backgroundColor: cores.surfaceContainerLow, borderRadius: 9999, height: 36, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: cores.outline,
  },
  searchIcon: { color: cores.onSurfaceVariant, fontSize: 16 },
  searchInput: { flex: 1, fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurface, paddingVertical: 0 },
  centerNav: { flexDirection: "row", gap: 20, alignItems: "center" },
  navItem: { paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "transparent" },
  navActive: { borderBottomColor: cores.primary },
  navText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurfaceVariant },
  navTextActive: { color: cores.onSurface, fontFamily: "BeVietnamPro_700Bold" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { backgroundColor: cores.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, borderColor: cores.primary },
  addText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, letterSpacing: 0.3 },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6 },
  icon: { fontSize: 14, color: cores.onSurfaceVariant },
  iconLabel: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.onSurfaceVariant },
  avatarBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: cores.surfaceContainerHigh, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.outline },
  avatarTxt: { fontSize: 14, color: cores.onSurfaceVariant },

  mobile: { backgroundColor: cores.surface, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: cores.outline },
  mobileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: espacamentos.page, height: 48 },
  mIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  mIcon: { fontSize: 18, color: cores.onSurface },
  mTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: cores.onSurface },
  mSearchWrap: { paddingHorizontal: espacamentos.page, paddingBottom: 12 },
  mSearchPill: { flexDirection: "row", alignItems: "center", backgroundColor: cores.surfaceContainerLow, borderRadius: 9999, height: 44, paddingLeft: 14, paddingRight: 6, gap: 8, borderWidth: 1, borderColor: cores.outline },
  mFilterBtn: { backgroundColor: cores.primary, width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mFilterTxt: { color: cores.onPrimary, fontSize: 14, fontFamily: "BeVietnamPro_700Bold" },
});
