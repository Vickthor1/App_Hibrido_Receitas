import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

const items = [
  { label: "Início", icon: "home", href: "/" },
  { label: "Categorias", icon: "grid", href: "/categorias" },
  {
    label: "Favoritos",
    icon: "heart-outline",
    href: "/favoritos",
    protegido: true,
  },
  {
    label: "Minhas Receitas",
    icon: "book-outline",
    href: "/minhas-receitas",
    protegido: true,
  },
  {
    label: "Perfil",
    icon: "account",
    href: "/perfil",
    protegido: true,
  },
  {
    label: "Configurações",
    icon: "cog",
    href: "/configuracoes",
    protegido: true,
  },
  {
    label: "Ajuda",
    icon: "help-circle-outline",
    href: "/ajuda",
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { isAutenticado, logout } = useAuth();
  const { coresTema } = useTema();

  const styles = criarStyles(coresTema);

  function abrir(item: { href: string; protegido?: boolean }) {
    if (item.protegido && !isAutenticado) {
      router.push("/login" as never);
      return;
    }

    router.push(item.href as never);
  }

  return (
    <View style={styles.wrap} accessibilityRole="toolbar">
      <View style={styles.menu}>
        {items.map((it) => {
          const ativo = pathname === it.href;

          return (
            <TouchableOpacity
              key={it.label}
              onPress={() => abrir(it)}
              style={[styles.item, ativo && styles.itemAtivo]}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityState={{ selected: ativo }}
            >
              <Icone
                name={it.icon as keyof typeof Icone.glyphMap}
                size={18}
                color={
                  ativo
                    ? coresTema.primary
                    : coresTema.onSurfaceVariant
                }
              />

              <Text style={[styles.label, ativo && styles.labelAtivo]}>
                {it.label}
              </Text>

              {it.protegido && !isAutenticado && (
                <Icone
                  name="lock-outline"
                  size={13}
                  color={coresTema.onSurfaceVariant}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push(
              isAutenticado
                ? ("/adicionar" as never)
                : ("/login" as never)
            )
          }
          accessibilityRole="button"
        >
          <Text style={styles.createText}>Criar Novo Plano</Text>
        </TouchableOpacity>

        {isAutenticado ? (
          <TouchableOpacity
            style={styles.link}
            onPress={logout}
            accessibilityRole="button"
          >
            <Icone
              name="logout"
              size={16}
              color={coresTema.error}
            />

            <Text
              style={[
                styles.linkText,
                { color: coresTema.error },
              ]}
            >
              Sair
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push("/login" as never)}
            accessibilityRole="button"
          >
            <Icone
              name="login"
              size={16}
              color={coresTema.primary}
            />

            <Text
              style={[
                styles.linkText,
                { color: coresTema.primary },
              ]}
            >
              Entrar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    wrap: {
      width: 260,
      backgroundColor: coresTema.surface,
      borderRightWidth: 1,
      borderRightColor: coresTema.outline,
      padding: 16,
      gap: 20,
      alignSelf: "stretch",
    },

    menu: {
      gap: 4,
      flex: 1,
    },

    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },

    itemAtivo: {
      backgroundColor: coresTema.surfaceContainerHigh,
      borderColor: coresTema.outline,
      borderLeftWidth: 3,
      borderLeftColor: coresTema.primary,
    },

    label: {
      fontFamily: "BeVietnamPro_500Medium",
      fontSize: 13,
      color: coresTema.onSurfaceVariant,
    },

    labelAtivo: {
      color: coresTema.onSurface,
      fontFamily: "BeVietnamPro_600SemiBold",
    },

    bottom: {
      gap: 10,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: coresTema.outline,
    },

    createBtn: {
      backgroundColor: coresTema.primary,
      borderRadius: 8,
      paddingVertical: 11,
      alignItems: "center",
    },

    createText: {
      color: coresTema.onPrimary,
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 12,
      letterSpacing: 0.4,
    },

    link: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    linkText: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 12,
    },
  });