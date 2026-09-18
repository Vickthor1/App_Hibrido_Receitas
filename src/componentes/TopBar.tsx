import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";
import { AvatarUsuario } from "./AvatarUsuario";
import { MenuLateral } from "./MenuLateral";

export function TopBar({
  titulo,
  mostrarVoltar = false,
  onVoltar,
}: {
  titulo?: string;
  mostrarVoltar?: boolean;
  onVoltar?: () => void;
}) {
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
      <View style={styles.desktop} accessibilityRole="header">
        <View style={styles.desktopInner}>
          <View style={styles.left}>
            {mostrarVoltar ? (
              <TouchableOpacity onPress={onVoltar ?? (() => router.back())} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.backDesktopBtn}>
                <Icone name="arrow-left" size={18} color={cores.onSurface} />
              </TouchableOpacity>
            ) : null}
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

          <View style={styles.centerNav} accessibilityRole="toolbar">
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
    <View style={styles.mobile} accessibilityRole="header">
      <View style={styles.mobileRow}>
        {mostrarVoltar ? (
          <TouchableOpacity
            style={styles.mIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onVoltar ?? (() => router.back())}
          >
            <Icone name="arrow-left" size={20} color={cores.onSurface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.mIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
            onPress={() => setMenuAberto(true)}
          >
            <Icone name="menu" size={22} color={cores.onSurface} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => go("/")} accessibilityRole="button">
          <Text style={styles.mTitle}>{titulo ?? "Receita Fácil"}</Text>
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
  backDesktopBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: cores.surfaceContainerLow },
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