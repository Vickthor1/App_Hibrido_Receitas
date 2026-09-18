import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";

type Tab = { label: string; icon: keyof typeof Icone.glyphMap; iconAtivo: keyof typeof Icone.glyphMap; href: string; tipo: "item" | "fab" };

const tabs: Tab[] = [
  { label: "Início", icon: "home", iconAtivo: "home", href: "/", tipo: "item" },
  { label: "Favoritos", icon: "heart-outline", iconAtivo: "heart", href: "/favoritos", tipo: "item" },
  { label: "Adicionar", icon: "plus", iconAtivo: "plus", href: "/adicionar", tipo: "fab" },
  { label: "Minhas", icon: "book-outline", iconAtivo: "book", href: "/minhas-receitas", tipo: "item" },
  { label: "Perfil", icon: "account", iconAtivo: "account", href: "/perfil", tipo: "item" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isAutenticado } = useAuth();

  if (isDesktop) return null;
  if (pathname?.startsWith("/receita/") || pathname?.startsWith("/login")) return null;

  function destino(t: Tab): string {
    if (isAutenticado) return t.href;
    if (t.label === "Favoritos" || t.label === "Minhas" || t.label === "Perfil" || t.label === "Adicionar") return "/login";
    return t.href;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.bar} accessibilityRole="toolbar">
        {tabs.map((t) => {
          const ativo = pathname === t.href;
          if (t.tipo === "fab") {
            return (
              <TouchableOpacity key={t.label} onPress={() => router.push(destino(t) as never)} style={styles.fabWrap} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Adicionar receita">
                <View style={styles.fab}>
                  <Icone name="plus" size={26} color={cores.onPrimary} />
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={t.label} onPress={() => router.push(destino(t) as never)} style={styles.item} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={t.label} accessibilityState={{ selected: ativo }}>
              <Icone name={ativo ? t.iconAtivo : t.icon} size={20} color={ativo ? cores.primary : cores.onSurfaceVariant} />
              <Text style={[styles.label, ativo && styles.labelAtivo]} numberOfLines={1}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center", pointerEvents: "box-none" },
  bar: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", backgroundColor: cores.surface, borderTopWidth: 1, borderTopColor: cores.outline, paddingTop: 8, paddingBottom: 14, paddingHorizontal: 8, width: "100%" },
  item: { alignItems: "center", gap: 2, flex: 1 },
  label: { fontSize: 9, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium", textAlign: "center", letterSpacing: 0.3 },
  labelAtivo: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold" },
  fabWrap: { flex: 1, alignItems: "center", marginTop: -28 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: cores.primary, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});