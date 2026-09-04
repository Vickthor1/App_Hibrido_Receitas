import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";
import { useRouter, usePathname } from "expo-router";

type Rota = { label: string; icon: string; href: string };

const rotas: Rota[] = [
  { label: "Início", icon: "⌂", href: "/" },
  { label: "Busca", icon: "⌕", href: "/busca" },
  { label: "Favoritos", icon: "♥", href: "/favoritos" },
  { label: "Perfil", icon: "◯", href: "/perfil" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // não mostra em detalhes
  if (pathname?.startsWith("/receita/")) return null;

  return (
    <View style={styles.container}>
      {rotas.map((r, idx) => {
        const ativo = pathname === r.href || (r.href === "/" && pathname === "/");
        const isCenter = idx === 2; // fab visual
        return (
          <TouchableOpacity key={r.href} onPress={() => router.push(r.href as never)} style={styles.item} activeOpacity={0.7}>
            <View style={[styles.iconWrap, ativo && styles.iconWrapAtivo]}>
              <Text style={[styles.icon, ativo && styles.iconAtivo]}>{r.icon}</Text>
            </View>
            <Text style={[styles.label, ativo && styles.labelAtivo]}>{r.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: espacamentos.sm,
    backgroundColor: cores.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceVariant,
    // sombra nav
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  item: { alignItems: "center", gap: 4, minWidth: 64 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  iconWrapAtivo: { backgroundColor: cores.primaryContainer },
  icon: { fontSize: 16, color: cores.onSurfaceVariant },
  iconAtivo: { color: cores.onPrimaryContainer },
  label: { fontSize: 10, fontWeight: "500", color: cores.onSurfaceVariant },
  labelAtivo: { color: cores.primary, fontWeight: "700" },
});
