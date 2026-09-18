import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useAuth } from "../contexto/AuthContext";
import { AvatarUsuario } from "./AvatarUsuario";
import { MenuLateral } from "./MenuLateral";
import { cores } from "../tema/cores";

export function TopBar({ titulo }: { titulo?: string }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const { isAutenticado } = useAuth();
  const [q, setQ] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  function go(href: string) {
    router.push(href as never);
  }
  function handleSearch() {
    const t = q.trim();
    if (!t) return;
    go(`/busca?termo=${encodeURIComponent(t)}`);
  }

  // ------------------------- DESKTOP -------------------------
  if (isDesktop) {
    return (
      <View style={styles.desktop} accessibilityRole="banner">
        <View style={styles.desktopInner}>
          <View style={styles.left}>
            <TouchableOpacity onPress={() => go("/")} accessibilityRole="button" accessibilityLabel="Início">
              <Text style={styles.logo}>Receita Fácil</Text>
            </TouchableOpacity>
            <View style={styles.searchPill}>
              <Icone name="magnify" size={16} color={cores.onSurfaceVariant} />
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
              <Icone name="plus" size={16} color={cores.onPrimary} />
              <Text style={styles.addText}>Adicionar Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("/favoritos")} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Favoritos">
              <Icone name="heart-outline" size={16} color={cores.onSurfaceVariant} />
              <Text style={styles.iconLabel}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go(isAutenticado ? "/perfil" : "/login")} style={styles.avatarBtn} accessibilityRole="button" accessibilityLabel="Perfil">
              <AvatarUsuario tamanho={32} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ------------------------- MOBILE -------------------------
  return (
    <View style={styles.mobile} accessibilityRole="banner">
      <View style={styles.mobileRow}>
        <TouchableOpacity
          style={styles.mIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
          onPress={() => setMenuAberto(true)}
        >
          <Icone name="menu" size={22} color={cores.onSurface} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => go("/")} accessibilityRole="button">
          <Text style={styles.mTitle} accessibilityRole="header">{titulo ?? "Receita Fácil"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={() => go(isAutenticado ? "/notificacoes" : "/login")}
        >
          <Icone name="bell-outline" size={20} color={cores.onSurface} />
        </TouchableOpacity>
      </View>

      <MenuLateral aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: { backgroundColor: cores.surface, borderBottomWidth: 1, borderBottomColor: cores.outline, paddingHorizontal: 20, height: 56, justifyContent: "center" },
  desktopInner: { maxWidth: 1280, width: "100%", alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  left: { flexDirection: "row", alignItems: "center", gap: 16, flex: 1 },
  logo: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface, letterSpacing: -0.3 },
  searchPill: { flex: 1, maxWidth: 360, flexDirection: "row", alignItems: "center", backgroundColor: cores.surfaceContainerLow, borderRadius: 9999, height: 36, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: cores.outline },
  searchInput: { flex: 1, fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurface, paddingVertical: 0 },
  centerNav: { flexDirection: "row", gap: 20, alignItems: "center" },
  navItem: { paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "transparent" },
  navActive: { borderBottomColor: cores.primary },
  navText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurfaceVariant },
  navTextActive: { color: cores.onSurface, fontFamily: "BeVietnamPro_700Bold" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: cores.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
  addText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, letterSpacing: 0.3 },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6 },
  iconLabel: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.onSurfaceVariant },
  avatarBtn: { borderRadius: 16 },

  mobile: { backgroundColor: cores.surface, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: cores.outline },
  mobileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 48 },
  mIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  mTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: cores.onSurface },
});