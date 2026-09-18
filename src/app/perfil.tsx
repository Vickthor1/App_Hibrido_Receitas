import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "../componentes/BottomNav";
import { Carregamento } from "../componentes/Carregamento";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { TopBar } from "../componentes/TopBar";
import { useAuth } from "../contexto/AuthContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { fazerUploadAvatar, selecionarImagem } from "../servicos/avatar";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=5";

export default function Perfil() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { favoritos } = useFavoritos();
  const { user, isAutenticado, logout, carregando, atualizarAvatar } = useAuth();

  const [modalOpcoes, setModalOpcoes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  if (carregando) return <Carregamento mensagem="Carregando perfil..." />;
  if (!isAutenticado || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar titulo="Perfil" />
        <View style={styles.locked}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Acesso restrito</Text>
          <Text style={styles.lockText}>Faça login para ver seu perfil.</Text>
          <TouchableOpacity
            style={styles.lockBtn}
            onPress={() => router.push("/login" as never)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.lockBtnText}>Entrar / Criar conta</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const avatarSource = user.avatarUrl ? { uri: user.avatarUrl } : { uri: DEFAULT_AVATAR };
  const usuarioId = user.id;

  async function handleEscolherImagem(origem: "galeria" | "camera") {
    setModalOpcoes(false);
    setErroUpload(null);
    try {
      const asset = await selecionarImagem(origem);
      if (!asset) return; // cancelado pelo usuário

      setEnviando(true);
      const res = await fazerUploadAvatar(usuarioId, asset);
      if (!res.ok || !res.url) {
        setErroUpload(res.erro ?? "Não foi possível enviar a imagem.");
        Alert.alert("Erro no upload", res.erro ?? "Não foi possível enviar a imagem.");
        return;
      }

      const updateRes = await atualizarAvatar(res.url);
      if (!updateRes.ok) {
        setErroUpload(updateRes.erro ?? "Erro ao salvar perfil.");
        Alert.alert("Erro ao salvar", updateRes.erro ?? "Erro ao salvar perfil.");
        return;
      }

      Alert.alert("Sucesso!", "Foto de perfil atualizada com sucesso.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao alterar foto.";
      setErroUpload(msg);
      Alert.alert("Erro", msg);
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemoverFoto() {
    setModalOpcoes(false);
    setEnviando(true);
    setErroUpload(null);
    try {
      const res = await atualizarAvatar(null);
      if (!res.ok) {
        Alert.alert("Erro", res.erro ?? "Erro ao remover foto.");
      } else {
        Alert.alert("Sucesso", "Foto de perfil removida.");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível remover a foto.");
    } finally {
      setEnviando(false);
    }
  }

  const profileCard = (
    <View style={styles.headerCard}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => setModalOpcoes(true)}
        disabled={enviando}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Alterar foto de perfil"
      >
        <View style={styles.avatarWrap}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          {enviando && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color={cores.onPrimary} size="small" />
            </View>
          )}
        </View>
        <View style={styles.badgeEdit}>
          <Text style={styles.badgeEditIcon}>✎</Text>
        </View>
      </TouchableOpacity>

      {erroUpload && <Text style={styles.erroText}>{erroUpload}</Text>}

      <Text style={styles.nome}>{user.nome ?? "Marina Silva"}</Text>
      <Text style={styles.handle}>@{user.email.split("@")[0] ?? "marinasilva_cooks"}</Text>
      <Text style={styles.bio}>Amante da culinária caseira e confeiteira. Compartilhando receitas de família e toques modernos.</Text>

      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statVal}>{favoritos.length}</Text><Text style={styles.statLabel}>SALVOS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>48</Text><Text style={styles.statLabel}>CRIADAS</Text></View>
        <View style={styles.stat}><Text style={styles.statVal}>4.9 ★</Text><Text style={styles.statLabel}>AVALIAÇÃO</Text></View>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => setModalOpcoes(true)}
        disabled={enviando}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Text style={styles.editText}>{enviando ? "Enviando foto..." : "Alterar Foto de Perfil"}</Text>
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
      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push("/privacidade" as never)} accessibilityRole="button"><Text style={styles.settingsIcon}>🔒</Text><Text style={styles.settingsText}>Privacidade e Segurança</Text></TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Perfil" />
      {isDesktop ? (
        <View style={styles.desktopBody}>
          <View style={styles.desktopLeft}>
            {profileCard}
            {settingsCard}
          </View>
          <ScrollView style={styles.desktopRight} contentContainerStyle={styles.desktopRightContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, styles.tabAtivo]} onPress={() => router.push('/minhas-receitas' as never)} accessibilityRole='button'><Text style={[styles.tabText, styles.tabTextAtivo]}>Minhas Receitas</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => router.push('/favoritos' as never)} accessibilityRole='button'><Text style={styles.tabText}>Salvos</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => router.push('/avaliacoes' as never)} accessibilityRole='button'><Text style={styles.tabText}>Avaliações</Text></TouchableOpacity>
            </View>
            <View style={styles.grid}>
              <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => router.push("/adicionar" as never)}>
                <View style={styles.addIcon}><Text style={styles.addPlus}>+</Text></View><Text style={styles.addText}>Nova Receita</Text>
              </TouchableOpacity>
              {favoritos.slice(0, 4).map((r) => (
                <View key={r.idMeal} style={styles.gridItem}>
                  <CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} onPress={() => router.push(`/receita/${r.idMeal}` as never)} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {profileCard}
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, styles.tabAtivo]} onPress={() => router.push('/minhas-receitas' as never)} accessibilityRole='button'><Text style={[styles.tabText, styles.tabTextAtivo]}>Minhas Receitas</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => router.push('/favoritos' as never)} accessibilityRole='button'><Text style={styles.tabText}>Salvas</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => router.push('/avaliacoes' as never)} accessibilityRole='button'><Text style={styles.tabText}>Avaliações</Text></TouchableOpacity>
          </View>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.addCard} activeOpacity={0.7} onPress={() => router.push("/adicionar" as never)}>
              <View style={styles.addIcon}><Text style={styles.addPlus}>+</Text></View><Text style={styles.addText}>Criar Receita</Text>
            </TouchableOpacity>
            {favoritos.slice(0, 4).map((r) => (
              <View key={r.idMeal} style={styles.gridItem}>
                <CartaoReceita id={r.idMeal} titulo={r.strMeal} imagem={r.strMealThumb} onPress={() => router.push(`/receita/${r.idMeal}` as never)} />
              </View>
            ))}
          </View>
          <View style={styles.mobileSettings}>
            <Text style={styles.mobileSettingsTitle}>Configurações</Text>
            <TouchableOpacity style={styles.mobileRow} onPress={() => router.push('/configuracoes' as never)}><Text>⚙ Configurações da Conta</Text><Text>›</Text></TouchableOpacity>
            <TouchableOpacity style={styles.mobileRow} onPress={() => router.push('/notificacoes' as never)}><Text>🔔 Notificações</Text><Text>›</Text></TouchableOpacity>
            <TouchableOpacity style={styles.mobileRow} onPress={() => router.push('/privacidade' as never)}><Text>🔒 Privacidade e Segurança</Text><Text>›</Text></TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Modal de opções de foto */}
      <Modal visible={modalOpcoes} transparent animationType="fade" onRequestClose={() => setModalOpcoes(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setModalOpcoes(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Foto de Perfil</Text>
            <Text style={styles.modalSub}>Escolha como deseja alterar sua foto:</Text>

            <TouchableOpacity style={styles.modalBtn} onPress={() => handleEscolherImagem("galeria")}>
              <Text style={styles.modalBtnIcon}>🖼️</Text>
              <Text style={styles.modalBtnText}>Escolher da Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={() => handleEscolherImagem("camera")}>
              <Text style={styles.modalBtnIcon}>📷</Text>
              <Text style={styles.modalBtnText}>Tirar Foto com a Câmera</Text>
            </TouchableOpacity>

            {user.avatarUrl && (
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={handleRemoverFoto}>
                <Text style={styles.modalBtnIcon}>🗑️</Text>
                <Text style={[styles.modalBtnText, { color: cores.error }]}>Remover Foto Atual</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalOpcoes(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  desktopBody: { flex: 1, flexDirection: "row" },
  desktopLeft: { width: 320, padding: espacamentos.page, gap: 16, backgroundColor: cores.background },
  desktopRight: { flex: 1 },
  desktopRightContent: { padding: 24, gap: 16, paddingBottom: 40 },
  scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
  headerCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 20, alignItems: "center", gap: 8, borderWidth: 1, borderColor: cores.surfaceVariant },
  avatarContainer: { position: "relative" },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", borderWidth: 3, borderColor: cores.surface, backgroundColor: cores.surfaceVariant },
  avatar: { width: "100%", height: "100%" },
  avatarOverlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  badgeEdit: { position: "absolute", bottom: 2, right: 2, backgroundColor: cores.primary, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: cores.surfaceContainerLowest },
  badgeEditIcon: { color: cores.onPrimary, fontSize: 13, fontFamily: "BeVietnamPro_700Bold" },
  nome: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, color: cores.onSurface },
  handle: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant },
  bio: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, textAlign: "center", lineHeight: 18 },
  stats: { flexDirection: "row", gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: cores.outlineVariant + "30", paddingTop: 12 },
  stat: { alignItems: "center", minWidth: 64, flex: 1 },
  statVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.primary },
  statLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: cores.onSurfaceVariant, letterSpacing: 0.5 },
  editBtn: { marginTop: 12, backgroundColor: cores.surfaceContainerHigh, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999, width: "100%", alignItems: "center" },
  editText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurface },
  logoutBtn: { paddingVertical: 8 },
  logoutText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.onSurfaceVariant },
  erroText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, color: cores.error, textAlign: "center" },
  settingsCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 12, borderWidth: 1, borderColor: cores.surfaceVariant, padding: 8 },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 8 },
  settingsIcon: { fontSize: 18, color: cores.onSurfaceVariant },
  settingsText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurface },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.outlineVariant + "40", gap: 16 },
  tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabAtivo: { borderBottomColor: cores.primary },
  tabText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: cores.onSurfaceVariant },
  tabTextAtivo: { color: cores.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "48%" },
  addCard: { width: "48%", height: 180, backgroundColor: cores.surfaceContainerHigh, borderRadius: 16, borderWidth: 2, borderColor: cores.outlineVariant, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
  addIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: cores.primaryContainer, alignItems: "center", justifyContent: "center" },
  addPlus: { color: cores.onPrimaryContainer, fontSize: 24, fontFamily: "BeVietnamPro_700Bold" },
  addText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12, color: cores.onSurfaceVariant },
  mobileSettings: { backgroundColor: cores.surfaceContainerLow, borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: cores.surfaceVariant, marginTop: 8 },
  mobileSettingsTitle: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 16, color: cores.onSurface },
  mobileRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: cores.surface, padding: 12, borderRadius: 8 },
  locked: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  lockIcon: { fontSize: 48 },
  lockTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface },
  lockText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurfaceVariant, textAlign: "center" },
  lockBtn: { marginTop: 8, backgroundColor: cores.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  lockBtnText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold" },
  // Modal styles
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 24, width: "100%", maxWidth: 360, gap: 12, borderWidth: 1, borderColor: cores.surfaceVariant },
  modalTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: cores.onSurface, textAlign: "center" },
  modalSub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, textAlign: "center", marginBottom: 8 },
  modalBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: cores.surfaceContainerLow, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: cores.surfaceVariant },
  modalBtnDanger: { backgroundColor: cores.errorContainer + "30", borderColor: cores.errorContainer },
  modalBtnIcon: { fontSize: 18 },
  modalBtnText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: cores.onSurface },
  modalCancel: { marginTop: 8, paddingVertical: 10, alignItems: "center" },
  modalCancelText: { fontFamily: "BeVietnamPro_500Medium", fontSize: 13, color: cores.onSurfaceVariant },
});
