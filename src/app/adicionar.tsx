import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { useAuth } from "../contexto/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function AdicionarReceita() {
  const router = useRouter();
  const { isAutenticado, user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tempo, setTempo] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [modo, setModo] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!nome.trim() || !ingredientes.trim() || !modo.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha nome, ingredientes e modo de preparo.");
      return;
    }
    if (!isAutenticado) {
      Alert.alert("Faça login", "Você precisa estar logado para salvar.", [{ text: "Ir para login", onPress: () => router.push("/login" as never) }]);
      return;
    }
    setSalvando(true);
    try {
      // Salva como favorito especial (mock de "criada") — usa tabela favoritos com id temporário
      const idTemp = `user_${Date.now()}`;
      if (isSupabaseConfigured && user) {
        const { error } = await supabase.from("favoritos").insert({
          user_id: user.id,
          id_meal: idTemp,
          str_meal: nome.trim(),
          str_thumb: "https://via.placeholder.com/300x300.png?text=" + encodeURIComponent(nome.trim()),
        });
        if (error) throw error;
      }
      Alert.alert("Sucesso!", `"${nome.trim()}" adicionada às suas receitas.`, [{ text: "Ver minhas receitas", onPress: () => router.push("/perfil" as never) }]);
      setNome(""); setCategoria(""); setTempo(""); setIngredientes(""); setModo("");
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally { setSalvando(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Adicionar Receita" />
      <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Adicionar Receita</Text>
        <Text style={styles.sub}>Compartilhe sua criação com a comunidade</Text>

        <View style={styles.form}>
          <View style={styles.field}><Text style={styles.label}>Nome da receita *</Text><TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Bolo de Cenoura Perfeito" maxLength={60} /></View>
          <View style={[styles.row, isDesktop && styles.rowDesktop]}>
            <View style={[styles.field, isDesktop && { flex: 1 }]}><Text style={styles.label}>Categoria</Text><TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholder="Ex: Sobremesas" /></View>
            <View style={[styles.field, isDesktop && { flex: 1 }]}><Text style={styles.label}>Tempo (min)</Text><TextInput style={styles.input} value={tempo} onChangeText={setTempo} placeholder="Ex: 45" keyboardType="numeric" maxLength={4} /></View>
          </View>
          <View style={styles.field}><Text style={styles.label}>Ingredientes * (um por linha)</Text><TextInput style={[styles.input, styles.textArea]} value={ingredientes} onChangeText={setIngredientes} placeholder="500g de cenoura
3 ovos
..." multiline numberOfLines={4} textAlignVertical="top" /></View>
          <View style={styles.field}><Text style={styles.label}>Modo de preparo *</Text><TextInput style={[styles.input, styles.textArea]} value={modo} onChangeText={setModo} placeholder="Descreva o passo a passo..." multiline numberOfLines={6} textAlignVertical="top" /></View>

          <TouchableOpacity style={[styles.btn, salvando && styles.btnDisabled]} onPress={handleSalvar} disabled={salvando} activeOpacity={0.8}>
            <Text style={styles.btnText}>{salvando ? "Salvando..." : "Salvar Receita"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
  scrollDesktop: { maxWidth: 720, alignSelf: "center", width: "100%", padding: 32 },
  titulo: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, color: cores.onSurface },
  sub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurfaceVariant, marginTop: -8 },
  form: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: cores.surfaceVariant },
  field: { gap: 6 },
  label: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurface },
  input: { borderWidth: 1, borderColor: cores.outlineVariant, borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: cores.surface, fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: cores.onSurface },
  textArea: { height: 100, paddingTop: 12 },
  row: { gap: 12 },
  rowDesktop: { flexDirection: "row" },
  btn: { backgroundColor: cores.primary, paddingVertical: 14, borderRadius: 9999, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 16 },
  cancelBtn: { alignItems: "center", padding: 8 },
  cancelText: { color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium" },
});
