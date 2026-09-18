import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useCallback } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";
import { AvatarUsuario } from "./AvatarUsuario";

interface ItemMenu {
  label: string;
  icon: keyof typeof Icone.glyphMap;
  href: string;
  protegido?: boolean;
}

export function MenuLateral({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAutenticado, user, logout } = useAuth();

  const itens: ItemMenu[] = [
    { label: "Home", icon: "home", href: "/" },
    { label: "Busca", icon: "magnify", href: "/busca" },
    { label: "Categorias", icon: "grid", href: "/categorias" },
    { label: "Favoritos", icon: "heart-outline", href: "/favoritos", protegido: true },
    { label: "Minhas Receitas", icon: "book-outline", href: "/minhas-receitas", protegido: true },
    { label: "Perfil", icon: "account", href: "/perfil", protegido: true },
    { label: "Configurações", icon: "cog", href: "/configuracoes", protegido: true },
    { label: "Ajuda", icon: "help-circle-outline", href: "/ajuda" },
  ];

  const lidarNavegacao = useCallback(
    (item: ItemMenu) => {
      onFechar();
      if (item.protegido && !isAutenticado) {
        router.push("/login" as never);
        return;
      }
      router.push(item.href as never);
    },
    [isAutenticado, onFechar, router]
  );

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.backdrop} onPress={onFechar}>
        {/* Painel lateral à esquerda */}
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <View style={styles.panelHeader}>
            <View style={styles.whoBox}>
              <AvatarUsuario tamanho={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{isAutenticado ? user?.nome ?? "Usuário" : "Visitante"}</Text>
                <Text style={styles.email} numberOfLines={1}>
                  {isAutenticado ? user?.email ?? "" : "Entre para salvar receitas"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.menu}>
            {itens.map((it) => {
              const ativo = pathname === it.href;
              return (
                <TouchableOpacity
                  key={it.label}
                  style={[styles.item, ativo && styles.itemAtivo]}
                  onPress={() => lidarNavegacao(it)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                >
                  <Icone name={it.icon} size={20} color={ativo ? cores.primary : cores.onSurfaceVariant} />
                  <Text style={[styles.itemText, ativo && styles.itemTextAtivo]}>{it.label}</Text>
                  {it.protegido && !isAutenticado && <Icone name="lock-outline" size={14} color={cores.onSurfaceVariant} style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.panelFooter}>
            {isAutenticado ? (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  onFechar();
                  logout();
                }}
                accessibilityRole="button"
              >
                <Icone name="logout" size={18} color={cores.error} />
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => {
                  onFechar();
                  router.push("/login" as never);
                }}
                accessibilityRole="button"
              >
                <Icone name="login" size={18} color={cores.onPrimary} />
                <Text style={styles.loginText}>Entrar / Criar conta</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", flexDirection: "row" },
  panel: {
    width: "82%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: cores.surface,
    paddingTop: 24,
    paddingBottom: 20,
  },
  panelHeader: { borderBottomWidth: 1, borderBottomColor: cores.outline, paddingHorizontal: 16, paddingBottom: 16 },
  whoBox: { flexDirection: "row", alignItems: "center", gap: 12 },
  nome: { fontFamily: "BeVietnamPro_700Bold", fontSize: 15, color: cores.onSurface },
  email: { fontFamily: "BeVietnamPro_400Regular", fontSize: 12, color: cores.onSurfaceVariant },
  menu: { paddingVertical: 8, paddingHorizontal: 12, gap: 2 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 8 },
  itemAtivo: { backgroundColor: cores.surfaceContainerHigh, borderLeftWidth: 3, borderLeftColor: cores.primary },
  itemText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 14, color: cores.onSurface },
  itemTextAtivo: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold" },
  panelFooter: { marginTop: "auto", paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: cores.outline, paddingTop: 16, gap: 8 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12, paddingVertical: 10 },
  logoutText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: cores.error },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.primary, borderRadius: 10, paddingVertical: 12 },
  loginText: { fontFamily: "BeVietnamPro_700Bold", fontSize: 13, color: cores.onPrimary },
});