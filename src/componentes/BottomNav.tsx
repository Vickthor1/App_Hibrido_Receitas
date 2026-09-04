import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { cores } from "../tema/cores";

const tabs = [
  { label: "Início", icon: "⌂", href: "/" },
  { label: "Favoritos", icon: "♡", href: "/favoritos" },
  { label: "central", icon: "+", href: "/busca", fab: true },
  { label: "Minhas Receitas", icon: "⚔", href: "/categorias" },
  { label: "Perfil", icon: "◯", href: "/perfil" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (isDesktop) return null;
  if (pathname?.startsWith("/receita/")) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {tabs.map((t) => {
          if (t.fab) {
            return (
              <TouchableOpacity key={t.label} onPress={() => router.push(t.href as never)} style={styles.fabWrap} activeOpacity={0.85}>
                <View style={styles.fab}><Text style={styles.fabIcon}>{t.icon}</Text></View>
              </TouchableOpacity>
            );
          }
          const active = pathname === t.href;
          return (
            <TouchableOpacity key={t.label} onPress={() => router.push(t.href as never)} style={styles.item} activeOpacity={0.7}>
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
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: cores.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceVariant,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 8,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  item: { alignItems: "center", gap: 2, flex: 1 },
  icon: { fontSize: 20, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium" },
  iconActive: { color: cores.primary },
  label: { fontSize: 10, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium", textAlign: "center" },
  labelActive: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold" },
  fabWrap: { flex: 1, alignItems: "center", marginTop: -28 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: cores.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabIcon: { color: cores.onPrimary, fontSize: 28, fontFamily: "BeVietnamPro_700Bold", marginTop: -2 },
});
