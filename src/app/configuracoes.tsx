import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";
import { AvatarUsuario } from "../componentes/AvatarUsuario";
import { selecionarImagem, fazerUploadAvatar } from "../servicos/avatar";
import { CabecalhoSecao, styles as s } from "../componentes/CabecalhoSecao";
import { cores } from "../tema/cores";

export default function Configuracoes() {
  const router = useRouter();
  const { user, atualizarAvatar, logout } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? "");
  const [enviando, setEnviando] = useState(false);

  async function handleSalvarNome() {
    if (!nome.trim() || nome.trim().length < 2) {
      Alert.alert("Nome inválido", "Informe um nome com pelo menos 2 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      if (isSupabaseConfigured && user) {
        await supabase.from("perfis").upsert({ id: user.id, nome: nome.trim(), avatar_url: user.avatarUrl ?? null });
      }
      Alert.alert("Sucesso!", "Nome atualizado.");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o nome.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleTrocarFoto() {
    setEnviando(true);
    try {
      const asset = await selecionarImagem("galeria");
      if (!asset) return;
      if (!user) return;
      const res = await fazerUploadAvatar(user.id, asset);
      if (!res.ok || !res.url) {
        Alert.alert("Erro", res.erro ?? "Falha no upload.");
        return;
      }
      const upd = await atualizarAvatar(res.url);
      if (!upd.ok) {
        Alert.alert("Erro", upd.erro ?? "Erro ao salvar.");
        return;
      }
      Alert.alert("Sucesso!", "Foto atualizada.");
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível trocar a foto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Configurações da Conta" />
      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        <View style={[s.card, styles.fotoCard]}>
          <AvatarUsuario tamanho={88} />
          <TouchableOpacity style={[s.btnSecundario, { marginTop: 12 }]} onPress={handleTrocarFoto} disabled={enviando} accessibilityRole="button">
            {enviando ? <ActivityIndicator color={cores.primary} size="small" /> : <Text style={s.btnSecundarioText}>Alterar foto</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Nome de exibição</Text>
          <Text style={s.labelCampo}>Nome</Text>
          <TextInput value={nome} onChangeText={setNome} placeholder="Seu nome" placeholderTextColor={cores.onSurfaceVariant} style={s.campo} maxLength={60} />
          <TouchableOpacity style={[s.btnPrimario, { opacity: enviando ? 0.6 : 1 }]} onPress={handleSalvarNome} disabled={enviando} accessibilityRole="button">
            <Text style={s.btnPrimarioText}>Salvar nome</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Suas opções</Text>
          <TouchableOpacity style={s.row} onPress={() => router.push("/privacidade" as never)} accessibilityRole="button">
            <Text style={s.rowLabel}>Privacidade e segurança</Text>
            <Icone name="chevron-right" size={18} color={cores.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={() => router.push("/ajuda" as never)} accessibilityRole="button">
            <Text style={s.rowLabel}>Ajuda</Text>
            <Icone name="chevron-right" size={18} color={cores.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={() => { logout(); router.replace("/" as never); }} accessibilityRole="button">
            <Text style={[s.rowLabel, { color: cores.error }]}>Sair</Text>
            <Icone name="logout" size={18} color={cores.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fotoCard: { alignItems: "center" },
});