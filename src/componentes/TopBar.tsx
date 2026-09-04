import { View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";
import { useState } from "react";

export function TopBar({ titulo }: { titulo?: string }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  function go(href: string) {
    router.push(href as never);
  }

  function handleSearch() {
    const t = q.trim();
    if (!t) return;
    router.push(`/busca?termo=${encodeURIComponent(t)}` as never);
  }

  // Desktop — fiel ao screenshot: Receita Fácil | busca | Browse Popular Seasonal | Add Recipe Favorites 🔔 👤
  if (isDesktop) {
    return (
      <View style={styles.desktop}>
        <View style={styles.desktopInner}>
          <View style={styles.left}>
            <TouchableOpacity onPress={() => go("/")}><Text style={styles.logo}>Receita Fácil</Text></TouchableOpacity>
            <View style={styles.searchPill}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar receitas, ingredientes..."
                placeholderTextColor={cores.onSurfaceVariant}
                value={q}
                onChangeText={setQ}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
          </View>

          <View style={styles.centerNav}>
            <TouchableOpacity onPress={() => go("/")} style={[styles.navItem, pathname === "/" && styles.navActive]}>
              <Text style={[styles.navText, pathname === "/" && styles.navTextActive]}>Explorar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("/categorias")}><Text style={styles.navText}>Populares</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => go("/categorias")}><Text style={styles.navText}>Sazonais</Text></TouchableOpacity>
          </View>

          <View style={styles.right}>
            <TouchableOpacity style={styles.addBtn} onPress={() => go("/busca")} activeOpacity={0.85}><Text style={styles.addText}>+ Adicionar Receita</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => go("/favoritos")} style={styles.iconBtn}><Text style={styles.icon}>♡</Text><Text style={styles.iconLabel}>Favoritos</Text></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><Text style={styles.icon}>🔔</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => go("/perfil")} style={styles.avatarBtn}><Text style={styles.avatarTxt}>◯</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Mobile — Receitas com menu + sino, ou Receita Fácil com busca se houver titulo custom
  return (
    <View style={styles.mobile}>
      <View style={styles.mobileRow}>
        <TouchableOpacity style={styles.mIconBtn}><Text style={styles.mIcon}>☰</Text></TouchableOpacity>
        <Text style={styles.mTitle}>{titulo ?? "Receitas"}</Text>
        <TouchableOpacity style={styles.mIconBtn}><Text style={styles.mIcon}>🔔</Text></TouchableOpacity>
      </View>
      {!titulo && (
        <View style={styles.mSearchWrap}>
          <View style={styles.mSearchPill}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar receitas, ingredientes..."
              placeholderTextColor={cores.onSurfaceVariant}
              value={q}
              onChangeText={setQ}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.mFilterBtn} onPress={handleSearch}><Text style={styles.mFilterTxt}>⋮</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    backgroundColor: cores.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: cores.outlineVariant + "40",
    paddingHorizontal: espacamentos.page,
    height: 64,
    justifyContent: "center",
  },
  desktopInner: { maxWidth: 1280, width: "100%", alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  left: { flexDirection: "row", alignItems: "center", gap: 16, flex: 1 },
  logo: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.primary, letterSpacing: -0.3 },
  searchPill: {
    flex: 1,
    maxWidth: 380,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: 9999,
    height: 40,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
  },
  searchIcon: { color: cores.onSurfaceVariant, fontSize: 16 },
  searchInput: { flex: 1, fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurface, paddingVertical: 0 },
  centerNav: { flexDirection: "row", gap: 20, alignItems: "center" },
  navItem: { paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: "transparent" },
  navActive: { borderBottomColor: cores.primary },
  navText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 14, color: cores.onSurfaceVariant },
  navTextActive: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { backgroundColor: cores.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
  addText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13 },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6 },
  icon: { fontSize: 16, color: cores.onSurfaceVariant },
  iconLabel: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurfaceVariant },
  avatarBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: cores.surfaceContainerHigh, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.outlineVariant },
  avatarTxt: { fontSize: 16, color: cores.onSurfaceVariant },

  mobile: { backgroundColor: cores.surfaceContainerLowest, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: cores.outlineVariant + "30" },
  mobileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: espacamentos.page, height: 48 },
  mIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  mIcon: { fontSize: 20, color: cores.onSurface },
  mTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface },
  mSearchWrap: { paddingHorizontal: espacamentos.page, paddingBottom: 12 },
  mSearchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: 9999,
    height: 44,
    paddingLeft: 14,
    paddingRight: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  mFilterBtn: { backgroundColor: cores.primary, width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mFilterTxt: { color: cores.onPrimary, fontSize: 16, fontFamily: "BeVietnamPro_700Bold" },
});
