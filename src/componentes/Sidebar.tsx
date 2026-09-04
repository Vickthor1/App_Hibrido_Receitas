import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";

const items = [
  { label: "Início", icon: "⌂", href: "/" },
  { label: "Minhas Receitas", icon: "◈", href: "/receita/52772" },
  { label: "Salvos", icon: "♡", href: "/favoritos" },
  { label: "Plano Alimentar", icon: "▦", href: "/categorias" },
  { label: "Configurações", icon: "⚙", href: "/perfil" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAutenticado, logout } = useAuth();
  return (
    <View style={styles.wrap} accessibilityRole="navigation">
      <View style={styles.menu}>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <TouchableOpacity
              key={it.label}
              onPress={() => router.push(it.href as never)}
              style={[styles.item, active && styles.itemActive]}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.icon, active && styles.iconActive]}>{it.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.createBtn} activeOpacity={0.85} onPress={() => router.push(isAutenticado ? "/adicionar" as never : "/login" as never)} accessibilityRole="button">
          <Text style={styles.createText}>Criar Novo Plano</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} accessibilityRole="button"><Text style={styles.linkIcon}>?</Text><Text style={styles.linkText}>Ajuda</Text></TouchableOpacity>
        {isAutenticado ? (
          <TouchableOpacity style={styles.link} onPress={logout} accessibilityRole="button"><Text style={styles.linkIcon}>↗</Text><Text style={styles.linkText}>Sair</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.link} onPress={() => router.push("/login" as never)} accessibilityRole="button"><Text style={[styles.linkText, { color: cores.primary }]}>Entrar</Text></TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 260, backgroundColor: cores.surface, borderRightWidth: 1, borderRightColor: cores.outline, padding: 16, gap: 20, alignSelf: "stretch" },
  menu: { gap: 4, flex: 1 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "transparent" },
  itemActive: { backgroundColor: cores.surfaceContainerHigh, borderColor: cores.outline, borderLeftWidth: 3, borderLeftColor: cores.primary },
  icon: { fontSize: 16, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium" },
  iconActive: { color: cores.onSurface },
  label: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurfaceVariant },
  labelActive: { color: cores.onSurface, fontFamily: "BeVietnamPro_600SemiBold" },
  bottom: { gap: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: cores.outline },
  createBtn: { backgroundColor: cores.primary, borderRadius: 8, paddingVertical: 11, alignItems: "center", borderWidth: 1, borderColor: cores.primary },
  createText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, letterSpacing: 0.4 },
  link: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  linkIcon: { fontSize: 14, color: cores.onSurfaceVariant },
  linkText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.onSurfaceVariant },
});
