import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

const items = [
  { label: "Início", icon: "⌂", href: "/" },
  { label: "Minhas Receitas", icon: "⚔", href: "/receita/52772" },
  { label: "Salvos", icon: "♡", href: "/favoritos" },
  { label: "Plano Alimentar", icon: "▦", href: "/categorias" },
  { label: "Configurações", icon: "⚙", href: "/perfil" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <View style={styles.wrap}>
      <View style={styles.menu}>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <TouchableOpacity
              key={it.label}
              onPress={() => router.push(it.href as never)}
              style={[styles.item, active && styles.itemActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, active && styles.iconActive]}>{it.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.createBtn} activeOpacity={0.85}>
          <Text style={styles.createText}>Criar Novo Plano</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}><Text style={styles.linkIcon}>?</Text><Text style={styles.linkText}>Ajuda</Text></TouchableOpacity>
        <TouchableOpacity style={styles.link}><Text style={styles.linkIcon}>↗</Text><Text style={styles.linkText}>Sair</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 280,
    backgroundColor: cores.surfaceContainerLow,
    borderRightWidth: 1,
    borderRightColor: cores.outlineVariant + "40",
    padding: espacamentos.page,
    gap: 24,
    alignSelf: "stretch",
  },
  menu: { gap: 4, flex: 1 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 9999 },
  itemActive: { backgroundColor: cores.primaryContainer },
  icon: { fontSize: 18, color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium" },
  iconActive: { color: cores.onPrimaryContainer },
  label: { fontFamily: "BeVietnamPro_500Medium", fontSize: 14, color: cores.onSurfaceVariant },
  labelActive: { color: cores.onPrimaryContainer, fontFamily: "BeVietnamPro_700Bold" },
  bottom: { gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: cores.outlineVariant + "30" },
  createBtn: { backgroundColor: cores.primary, borderRadius: 9999, paddingVertical: 12, alignItems: "center" },
  createText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13 },
  link: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  linkIcon: { fontSize: 16, color: cores.onSurfaceVariant },
  linkText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurfaceVariant },
});
