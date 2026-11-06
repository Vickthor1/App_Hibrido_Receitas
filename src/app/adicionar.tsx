import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { alertar } from "../utils/alerta";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { useAuth } from "../contexto/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

export default function AdicionarReceita() {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
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
      alertar("Campos obrigatórios", "Preencha nome, ingredientes e modo de preparo.");
      return;
    }
    if (!isAutenticado) {
      alertar("Faça login", "Você precisa estar logado para salvar.", [{ text: "Ir para login", onPress: () => router.push("/login" as never) }]);
      return;
    }
    setSalvando(true);
    try {
      // Salva na tabela "receitas" (receitas criadas pelo usuário — RLS auth.uid() = user_id)
      if (isSupabaseConfigured && user) {
        const { error } = await supabase.from("receitas").insert({
          user_id: user.id,
          nome: nome.trim(),
          categoria: categoria.trim() || null,
          tempo: tempo.trim() || null,
          ingredientes: ingredientes.trim(),
          modo: modo.trim(),
        });
        if (error) throw error;
      }
      alertar("Sucesso!", `"${nome.trim()}" adicionada às suas receitas.`, [{ text: "Ver minhas receitas", onPress: () => router.push("/minhas-receitas" as never) }]);
      setNome(""); setCategoria(""); setTempo(""); setIngredientes(""); setModo("");
    } catch (e) {
      alertar("Erro", e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally { setSalvando(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Adicionar Receita" />
      <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Adicionar Receita</Text>
        <Text style={styles.sub}>Compartilhe sua criação com a comunidade</Text>

        <View style={styles.form}>
          <View style={styles.field}><Text style={styles.label}>Nome da receita *</Text><TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor={coresTema.onSurfaceVariant} placeholder="Ex: Bolo de Cenoura Perfeito" maxLength={60} /></View>
          <View style={[styles.row, isDesktop && styles.rowDesktop]}>
            <View style={[styles.field, isDesktop && { flex: 1 }]}><Text style={styles.label}>Categoria</Text><TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholderTextColor={coresTema.onSurfaceVariant} placeholder="Ex: Sobremesas" /></View>
            <View style={[styles.field, isDesktop && { flex: 1 }]}><Text style={styles.label}>Tempo (min)</Text><TextInput style={styles.input} value={tempo} onChangeText={setTempo} placeholderTextColor={coresTema.onSurfaceVariant} placeholder="Ex: 45" keyboardType="numeric" maxLength={4} /></View>
          </View>
          <View style={styles.field}><Text style={styles.label}>Ingredientes * (um por linha)</Text><TextInput style={[styles.input, styles.textArea]} value={ingredientes} onChangeText={setIngredientes} placeholderTextColor={coresTema.onSurfaceVariant} placeholder="500g de cenoura
3 ovos
..." multiline numberOfLines={4} textAlignVertical="top" /></View>
          <View style={styles.field}><Text style={styles.label}>Modo de preparo *</Text><TextInput style={[styles.input, styles.textArea]} value={modo} onChangeText={setModo} placeholderTextColor={coresTema.onSurfaceVariant} placeholder="Descreva o passo a passo..." multiline numberOfLines={6} textAlignVertical="top" /></View>

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

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: coresTema.background },
  scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
  scrollDesktop: { maxWidth: 720, alignSelf: "center", width: "100%", padding: 32 },
  titulo: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, color: coresTema.onSurface },
  sub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: coresTema.onSurfaceVariant, marginTop: -8 },
  form: { backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: coresTema.surfaceVariant },
  field: { gap: 6 },
  label: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: coresTema.onSurface },
  input: { borderWidth: 1, borderColor: coresTema.outlineVariant, borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: coresTema.surface, fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: coresTema.onSurface },
  textArea: { height: 100, paddingTop: 12 },
  row: { gap: 12 },
  rowDesktop: { flexDirection: "row" },
  btn: { backgroundColor: coresTema.primary, paddingVertical: 14, borderRadius: 9999, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: coresTema.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 16 },
  cancelBtn: { alignItems: "center", padding: 8 },
  cancelText: { color: coresTema.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium" },
});
