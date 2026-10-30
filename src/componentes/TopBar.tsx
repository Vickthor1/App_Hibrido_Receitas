import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

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
  const { coresTema } = useTema();

  const [q, setQ] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const styles = criarStyles(coresTema);

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
              <Pressable
                onPress={onVoltar ?? (() => router.back())}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                style={({ hovered }: { hovered?: boolean }) => [
                  styles.backDesktopBtn,
                  hovered && styles.hoveredBg,
                ]}
              >
                <Icone
                  name="arrow-left"
                  size={18}
                  color={coresTema.onSurface}
                />
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => go("/")}
              accessibilityRole="button"
              accessibilityLabel="Início"
            >
              <Text style={styles.logo}>Receita Fácil</Text>
            </Pressable>

            <View style={styles.searchPill}>
              <Icone
                name="magnify"
                size={16}
                color={coresTema.onSurfaceVariant}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Buscar receitas, ingredientes..."
                placeholderTextColor={coresTema.onSurfaceVariant}
                value={q}
                onChangeText={setQ}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                accessibilityLabel="Buscar receitas"
              />
            </View>
          </View>

          <View style={styles.centerNav} accessibilityRole="toolbar">
            {/* Explorar */}
            <Pressable
              onPress={() => go("/")}
              style={({ hovered }: { hovered?: boolean }) => [
                styles.navItem,
                pathname === "/" && styles.navActive,
                hovered && styles.navHovered,
              ]}
              accessibilityRole="link"
              accessibilityState={{ selected: pathname === "/" }}
            >
              <Text
                style={[
                  styles.navText,
                  pathname === "/" && styles.navTextActive,
                ]}
              >
                Explorar
              </Text>
            </Pressable>

            {/* Populares (redireciona para favoritos ordenados ou busca inicial rica) */}
            <Pressable
              onPress={() => go("/busca?termo=chicken")}
              style={({ hovered }: { hovered?: boolean }) => [
                styles.navItem,
                pathname.includes("termo=chicken") && styles.navActive,
                hovered && styles.navHovered,
              ]}
              accessibilityRole="link"
            >
              <Text
                style={[
                  styles.navText,
                  pathname.includes("termo=chicken") && styles.navTextActive,
                ]}
              >
                Populares
              </Text>
            </Pressable>

            {/* Sazonais (redireciona para categorias/pesquisa sazonal) */}
            <Pressable
              onPress={() => go("/categorias")}
              style={({ hovered }: { hovered?: boolean }) => [
                styles.navItem,
                pathname === "/categorias" && styles.navActive,
                hovered && styles.navHovered,
              ]}
              accessibilityRole="link"
            >
              <Text
                style={[
                  styles.navText,
                  pathname === "/categorias" && styles.navTextActive,
                ]}
              >
                Sazonais
              </Text>
            </Pressable>
          </View>

          <View style={styles.right}>
            <Pressable
              style={({ hovered }: { hovered?: boolean }) => [
                styles.addBtn,
                hovered && styles.addBtnHovered,
              ]}
              onPress={() =>
                go(isAutenticado ? "/adicionar" : "/login")
              }
              accessibilityRole="button"
              accessibilityLabel="Adicionar receita"
            >
              <Icone
                name="plus"
                size={16}
                color={coresTema.onPrimary}
              />
              <Text style={styles.addText}>Adicionar Receita</Text>
            </Pressable>

            <Pressable
              onPress={() => go("/favoritos")}
              style={({ hovered }: { hovered?: boolean }) => [
                styles.iconBtn,
                hovered && styles.hoveredBg,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Favoritos"
            >
              <Icone
                name="heart-outline"
                size={16}
                color={coresTema.onSurfaceVariant}
              />
              <Text style={styles.iconLabel}>Favoritos</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                go(isAutenticado ? "/perfil" : "/login")
              }
              style={({ hovered }: { hovered?: boolean }) => [
                styles.avatarBtn,
                hovered && styles.hoveredScale,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Perfil"
            >
              <AvatarUsuario tamanho={32} />
            </Pressable>
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
          <Pressable
            style={styles.mIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onVoltar ?? (() => router.back())}
          >
            <Icone
              name="arrow-left"
              size={20}
              color={coresTema.onSurface}
            />
          </Pressable>
        ) : (
          <Pressable
            style={styles.mIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
            onPress={() => setMenuAberto(true)}
          >
            <Icone
              name="menu"
              size={22}
              color={coresTema.onSurface}
            />
          </Pressable>
        )}

        <Pressable
          onPress={() => go("/")}
          accessibilityRole="button"
        >
          <Text style={styles.mTitle}>
            {titulo ?? "Receita Fácil"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.mIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={() =>
            go(isAutenticado ? "/notificacoes" : "/login")
          }
        >
          <Icone
            name="bell-outline"
            size={20}
            color={coresTema.onSurface}
          />
        </Pressable>
      </View>

      <MenuLateral
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
      />
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    desktop: {
      backgroundColor: coresTema.surface,
      borderBottomWidth: 1,
      borderBottomColor: coresTema.outline,
      paddingHorizontal: 20,
      height: 56,
      justifyContent: "center",
    },

    desktopInner: {
      maxWidth: 1280,
      width: "100%",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },

    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flex: 1,
    },

    logo: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 20,
      color: coresTema.onSurface,
      letterSpacing: -0.3,
    },

    searchPill: {
      flex: 1,
      maxWidth: 360,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: coresTema.surfaceContainerLow,
      borderRadius: 9999,
      height: 36,
      paddingHorizontal: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: coresTema.outline,
    },

    searchInput: {
      flex: 1,
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 14,
      color: coresTema.onSurface,
      paddingVertical: 0,
    },

    centerNav: {
      flexDirection: "row",
      gap: 24,
      alignItems: "center",
    },

    navItem: {
      paddingBottom: 4,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
      transitionDuration: "150ms",
    },

    navHovered: {
      borderBottomColor: coresTema.primaryVariant || coresTema.primary,
      opacity: 0.85,
    },

    navActive: {
      borderBottomColor: coresTema.primary,
    },

    navText: {
      fontFamily: "BeVietnamPro_500Medium",
      fontSize: 13,
      color: coresTema.onSurfaceVariant,
    },

    navTextActive: {
      color: coresTema.onSurface,
      fontFamily: "BeVietnamPro_700Bold",
    },

    backDesktopBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: coresTema.surfaceContainerLow,
    },

    hoveredBg: {
      backgroundColor: coresTema.surfaceContainerHigh,
      borderRadius: 6,
    },

    hoveredScale: {
      opacity: 0.9,
    },

    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: coresTema.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9999,
      transitionDuration: "150ms",
    },

    addBtnHovered: {
      backgroundColor: coresTema.primaryHover || "#832600",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },

    addText: {
      color: coresTema.onPrimary,
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 12,
      letterSpacing: 0.3,
    },

    iconBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      padding: 6,
      borderRadius: 6,
      transitionDuration: "150ms",
    },

    iconLabel: {
      fontFamily: "BeVietnamPro_500Medium",
      fontSize: 12,
      color: coresTema.onSurfaceVariant,
    },

    avatarBtn: {
      borderRadius: 16,
    },

    mobile: {
      backgroundColor: coresTema.surface,
      paddingTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: coresTema.outline,
    },

    mobileRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 48,
    },

    mIconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    mTitle: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 18,
      color: coresTema.onSurface,
    },
  });
