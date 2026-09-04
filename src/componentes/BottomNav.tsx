import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";

const tabs = [
  { label: "Início", icon: "⌂", href: "/" },
  { label: "Favoritos", icon: "♡", href: "/favoritos" },
  { label: "central", icon: "+", href: "/adicionar", fab: true },
  { label: "Minhas Receitas", icon: "◈", href: "/categorias" },
  { label: "Perfil", icon: "◯", href: "/perfil" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isAutenticado } = useAuth();
  if (isDesktop) return null;
  if (pathname?.startsWith("/receita/")) return null;
  return (
    <View style={styles.wrap} accessibilityRole="navigation">
      <View style={styles.bar}>
        {tabs.map((t) => {
          if (t.fab) {
            const href = isAutenticado ? t.href : "/login";
            return (
              <TouchableOpacity key={t.label} onPress={() => router.push(href as never)} style={styles.fabWrap} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Adicionar receita">
                <View style={styles.fab}><Text style={styles.fabIcon}>{t.icon}</Text></View>
              </TouchableOpacity>
            );
          }
          const active = pathname === t.href;
          return (
            <TouchableOpacity key={t.label} onPress={() => router.push(t.href as never)} style={styles.item} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={t.label}>
              <Text style={[styles.icon, active && styles.iconActive]}>{t.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center", pointerEvents: "box-none" },
  bar: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", backgroundColor: cores.surface, borderTopWidth: 1, borderTopColor: cores.outline, paddingTop: 8, paddingBottom: 14, paddingHorizontal: 8, width: "100%",
  },
  item: { alignItems: "center", gap: 2, flex: 1 },
  icon: { fontSize: 18, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium" },
  iconActive: { color: cores.primary },
  label: { fontSize: 9, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium", textAlign: "center", letterSpacing: 0.3 },
  labelActive: { color: cores.onSurface, fontFamily: "BeVietnamPro_600SemiBold" },
  fabWrap: { flex: 1, alignItems: "center", marginTop: -28 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: cores.primary, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabIcon: { color: cores.onPrimary, fontSize: 24, fontFamily: "BeVietnamPro_700Bold", marginTop: -1 },
});
