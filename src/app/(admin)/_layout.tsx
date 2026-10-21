import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { cores } from "../../tema/cores";

const menuSections = [
  {
    title: "GERENCIAMENTO",
    items: [
      { label: "Dashboard", icon: "view-dashboard", href: "/(admin)/dashboard" },
      { label: "Usuários", icon: "account-group", href: "/(admin)/usuarios" },
      { label: "Receitas", icon: "book-open-variant", href: "/(admin)/receitas" },
      { label: "Categorias", icon: "folder-outline", href: "/(admin)/categorias" },
      { label: "Favoritos", icon: "heart-outline", href: "/(admin)/favoritos" },
      { label: "Comentários", icon: "comment-outline", href: "/(admin)/comentarios" },
    ],
  },
  {
    title: "CONTEÚDO",
    items: [
      { label: "Receitas Externas", icon: "cloud-search", href: "/(admin)/externas", badge: "API" },
      { label: "Mídias", icon: "image-multiple-outline", href: "/(admin)/midias" },
    ],
  },
  {
    title: "RELATÓRIOS",
    items: [
      { label: "Relatórios", icon: "chart-bar", href: "/(admin)/relatorios" },
      { label: "Atividades / Auditoria", icon: "shield-account-outline", href: "/(admin)/auditoria" },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { label: "Configurações", icon: "cog-outline", href: "/(admin)/configuracoes" },
      { label: "Permissões", icon: "key-outline", href: "/(admin)/permissoes" },
    ],
  },
];

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  function sairAdmin() {
    if (typeof localStorage !== "undefined") localStorage.removeItem("admin_jwt");
    router.replace("/" as never);
  }

  return (
    <View style={styles.container}>
      {/* SIDEBAR PROFISSIONAL ESQUERDA */}
      <View style={styles.sidebar}>
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Icone name="chef-hat" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.logoTitle}>Receita Fácil</Text>
            <Text style={styles.logoSub}>Painel Administrativo</Text>
          </View>
        </View>

        <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
          {menuSections.map((sec) => (
            <View key={sec.title} style={styles.menuGroup}>
              <Text style={styles.groupTitle}>{sec.title}</Text>
              {sec.items.map((it) => {
                const ativo = pathname === it.href;
                return (
                  <TouchableOpacity
                    key={it.label}
                    style={[styles.navItem, ativo && styles.navItemActive]}
                    onPress={() => router.push(it.href as never)}
                    activeOpacity={0.7}
                  >
                    <Icone name={it.icon as keyof typeof Icone.glyphMap} size={18} color={ativo ? "#FF6B35" : "#A0A0A0"} />
                    <Text style={[styles.navText, ativo && styles.navTextActive]}>{it.label}</Text>
                    {it.badge && (
                      <View style={styles.badge}><Text style={styles.badgeTxt}>{it.badge}</Text></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={styles.userFooter}>
          <View style={styles.userRow}>
            <View style={styles.avatarMini}><Icone name="account" size={18} color="#FFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.admName}>Administrador</Text>
              <Text style={styles.admEmail} numberOfLines={1}>admin@receitafacil.com</Text>
              <View style={styles.onlineRow}><View style={styles.dotOnline} /><Text style={styles.onlineTxt}>Online</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.sairBtn} onPress={sairAdmin} activeOpacity={0.8}>
            <Icone name="logout" size={16} color="#FF8A80" />
            <Text style={styles.sairTxt}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PAINEL PRINCIPAL */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#0A0A0A" },
  sidebar: { width: 260, backgroundColor: "#111111", borderRightWidth: 1, borderRightColor: "#222222", display: "flex", flexDirection: "column" },
  logoArea: { flexDirection: "row", alignItems: "center", padding: 20, gap: 12, borderBottomWidth: 1, borderBottomColor: "#222222" },
  logoIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#AB3500", alignItems: "center", justifyContent: "center" },
  logoTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: "#F5F1E8" },
  logoSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },
  navScroll: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  menuGroup: { marginBottom: 18 },
  groupTitle: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: "#777777", letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
  navItemActive: { backgroundColor: "#1A1A1A", borderLeftWidth: 3, borderLeftColor: "#AB3500" },
  navText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: "#A0A0A0" },
  navTextActive: { color: "#F5F1E8", fontFamily: "BeVietnamPro_600SemiBold" },
  badge: { backgroundColor: "#2A2A2A", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: "auto" },
  badgeTxt: { fontSize: 9, color: "#FFB59D", fontFamily: "BeVietnamPro_700Bold" },
  userFooter: { padding: 16, borderTopWidth: 1, borderTopColor: "#222222", gap: 12, backgroundColor: "#141414" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarMini: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#333", alignItems: "center", justifyContent: "center" },
  admName: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: "#F5F1E8" },
  admEmail: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#A0A0A0" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  dotOnline: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  onlineTxt: { fontSize: 10, color: "#4CAF50", fontFamily: "BeVietnamPro_500Medium" },
  sairBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1F1F1F", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#333" },
  sairTxt: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: "#FF8A80" },
  content: { flex: 1, backgroundColor: "#0A0A0A" },
});
