import { useEffect, useState, useCallback } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { AvatarUsuario } from "../componentes/AvatarUsuario";
import { Cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=5";

interface ReceitaPropria {
  id: string;
  nome: string;
  categoria: string | null;
  tempo: string | null;
}

export default function Perfil() {
  const router = useRouter();
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  const { favoritos } = useFavoritos();
  const { user, isAutenticado, logout, carregando } = useAuth();

  const [minhasReceitas, setMinhasReceitas] = useState<ReceitaPropria[]>([]);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [mediaNotas, setMediaNotas] = useState("0.0");
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [modalOpcoes, setModalOpcoes] = useState(false);

  const carregarDadosReaisPerfil = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setCarregandoDados(false);
      return;
    }
    try {
      // 1) Receitas próprias reais do usuário
      const { data: recs } = await supabase
        .from("receitas")
        .select("id, nome, categoria, tempo")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setMinhasReceitas((recs ?? []) as ReceitaPropria[]);

      // 2) Avaliações reais feitas pelo usuário ou sobre suas receitas
      const { data: avals } = await supabase
        .from("avaliacoes")
        .select("nota")
        .eq("user_id", user.id);

      const listaAvals = avals ?? [];
      setTotalAvaliacoes(listaAvals.length);
      if (listaAvals.length > 0) {
        const soma = listaAvals.reduce((acc: number, curr: { nota: number }) => acc + curr.nota, 0);
        setMediaNotas((soma / listaAvals.length).toFixed(1));
      } else {
        setMediaNotas("0.0");
      }
    } catch {
      setMinhasReceitas([]);
    } finally {
      setCarregandoDados(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      carregarDadosReaisPerfil();
    }
  }, [user, carregarDadosReaisPerfil]);

  if (carregando || carregandoDados) return null;

  if (!isAutenticado || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar titulo="Perfil" />
        <View style={styles.locked}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Acesso restrito</Text>
          <Text style={styles.lockText}>Faça login para ver seu perfil.</Text>
          <TouchableOpacity style={styles.lockBtn} onPress={() => router.push("/login" as never)} activeOpacity={0.8} accessibilityRole="button">
            <Text style={styles.lockBtnText}>Entrar / Criar conta</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const avatarSource = user.avatarUrl ? { uri: user.avatarUrl } : { uri: DEFAULT_AVATAR };

  const profileCard = (
    <View style={styles.headerCard}>
      <TouchableOpacity style={styles.avatarContainer} onPress={() => setModalOpcoes(true)} activeOpacity={0.85} accessibilityRole="button">
        <View style={styles.avatarWrap}>
          <Image source={avatarSource} style={styles.avatar} contentFit="cover" transition={300} />
        </View>
        <View style={styles.badgeEdit}><Text style={styles.badgeEditIcon}>✎</Text></View>
      </TouchableOpacity>

      <Text style={styles.nome}>{user.nome ?? "Usuário"}</Text>
      <Text style={styles.handle}>@{user.email.split("@")[0] ?? "usuario"}</Text>
      <Text style={styles.bio}>Amante da culinária caseira. Compartilhando receitas reais com a comunidade.</Text>

      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statVal}>{favoritos.length}</Text><Text style={styles.statLabel}>SALVOS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{minhasReceitas.length}</Text><Text style={styles.statLabel}>CRIADAS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>{mediaNotas} ★</Text><Text style={styles.statLabel}>AVALIAÇÃO</Text></View>
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/configuracoes" as never)} activeOpacity={0.8} accessibilityRole="button">
        <Text style={styles.editText}>Editar Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} accessibilityRole="button">
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );

  const settingsCard = (
    <View style={styles.settingsCard}>
      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push("/configuracoes" as never)} accessibilityRole="button"><Text style={styles.settingsIcon}>⚙</Text><Text style={styles.settingsText}>Configurações da Conta</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push("/notificacoes" as never)} accessibilityRole="button"><Text style={styles.settingsIcon}>🔔</Text><Text style={styles.settingsText}>Preferências de Notificação</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push("/biometria-config" as never)} accessibilityRole="button"><Text style={styles.settingsIcon}>🔓</Text><Text style={styles.settingsText}>Login Biométrico</Text></TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Perfil" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {profileCard}
        {settingsCard}

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabAtivo]} onPress={() => router.push("/minhas-receitas" as never)}><Text style={[styles.tabText, styles.tabTextAtivo]}>Minhas Receitas ({minhasReceitas.length})</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => router.push("/favoritos" as never)}><Text style={styles.tabText}>Salvas ({favoritos.length})</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => router.push("/avaliacoes" as never)}><Text style={styles.tabText}>Avaliações ({totalAvaliacoes})</Text></TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => router.push("/adicionar" as never)}>
            <View style={styles.addIcon}><Text style={styles.addPlus}>+</Text></View><Text style={styles.addText}>Criar Receita</Text>
          </TouchableOpacity>
          {minhasReceitas.slice(0, 3).map((r) => (
            <View key={r.id} style={styles.gridItem}>
              <CartaoReceita id={r.id} titulo={r.nome} imagem="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80" tempo={r.tempo ? `${r.tempo} min` : "30 min"} onPress={() => router.push(`/receita/${r.id}` as never)} />
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalOpcoes} transparent animationType="fade" onRequestClose={() => setModalOpcoes(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setModalOpcoes(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Gerenciar Conta</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => { setModalOpcoes(false); router.push("/configuracoes" as never); }}>
              <Text style={styles.modalBtnIcon}>⚙️</Text><Text style={styles.modalBtnText}>Ir para Configurações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalOpcoes(false)}>
              <Text style={styles.modalCancelText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: coresTema.background },
    scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
    headerCard: { backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 16, padding: 20, alignItems: "center", gap: 8, borderWidth: 1, borderColor: coresTema.surfaceVariant },
    avatarContainer: { position: "relative" },
    avatarWrap: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", borderWidth: 3, borderColor: coresTema.surface, backgroundColor: coresTema.surfaceVariant },
    avatar: { width: "100%", height: "100%" },
    badgeEdit: { position: "absolute", bottom: 2, right: 2, backgroundColor: coresTema.primary, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: coresTema.surfaceContainerLowest },
    badgeEditIcon: { color: coresTema.onPrimary, fontSize: 13, fontFamily: "BeVietnamPro_700Bold" },
    nome: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, color: coresTema.onSurface },
    handle: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant },
    bio: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant, textAlign: "center", lineHeight: 18 },
    stats: { flexDirection: "row", gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: coresTema.outlineVariant + "30", paddingTop: 12, width: "100%" },
    stat: { alignItems: "center", minWidth: 64, flex: 1 },
    statVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: coresTema.primary },
    statLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: coresTema.onSurfaceVariant, letterSpacing: 0.5 },
    editBtn: { marginTop: 12, backgroundColor: coresTema.surfaceContainerHigh, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999, width: "100%", alignItems: "center" },
    editText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: coresTema.onSurface },
    logoutBtn: { paddingVertical: 8 },
    logoutText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: coresTema.onSurfaceVariant },
    settingsCard: { backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 12, borderWidth: 1, borderColor: coresTema.surfaceVariant, padding: 8 },
    settingsRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 8 },
    settingsIcon: { fontSize: 18, color: coresTema.onSurfaceVariant },
    settingsText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: coresTema.onSurface },
    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: coresTema.outlineVariant + "40", gap: 16 },
    tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
    tabAtivo: { borderBottomColor: coresTema.primary },
    tabText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: coresTema.onSurfaceVariant },
    tabTextAtivo: { color: coresTema.primary },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    gridItem: { width: "48%" },
    addCard: { width: "48%", height: 180, backgroundColor: coresTema.surfaceContainerHigh, borderRadius: 16, borderWidth: 2, borderColor: coresTema.outlineVariant, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
    addIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: coresTema.primaryContainer, alignItems: "center", justifyContent: "center" },
    addPlus: { color: coresTema.onPrimaryContainer, fontSize: 24, fontFamily: "BeVietnamPro_700Bold" },
    addText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: coresTema.onSurfaceVariant },
    locked: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
    lockIcon: { fontSize: 48 },
    lockTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: coresTema.onSurface },
    lockText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: coresTema.onSurfaceVariant, textAlign: "center" },
    lockBtn: { marginTop: 8, backgroundColor: coresTema.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
    lockBtnText: { color: coresTema.onPrimary, fontFamily: "BeVietnamPro_700Bold" },
    modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 16, padding: 24, width: "100%", maxWidth: 360, gap: 12, borderWidth: 1, borderColor: coresTema.surfaceVariant },
    modalTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: coresTema.onSurface, textAlign: "center" },
    modalSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant, textAlign: "center", marginBottom: 8 },
    modalBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: coresTema.surfaceContainerLow, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: coresTema.surfaceVariant },
    modalBtnIcon: { fontSize: 18 },
    modalBtnText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: coresTema.onSurface },
    modalCancel: { marginTop: 8, paddingVertical: 10, alignItems: "center" },
    modalCancelTest: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: coresTema.onSurfaceVariant },
    modalCancelText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: coresTema.onSurfaceVariant },
  });
