import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { alertar } from "../utils/alerta";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";
import { CabecalhoSecao, criarStyles as criarEstilosCompartilhados } from "../componentes/CabecalhoSecao";
import { useTema } from "../contexto/TemaContext";
import { validarSenha } from "../utils/seguranca";

export default function Privacidade() {
  const { coresTema } = useTema();
  const s = criarEstilosCompartilhados(coresTema);
  const router = useRouter();
  const { user, logout } = useAuth();
  const [novo, setNovo] = useState("");
  const [cnf, setCnf] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function alterarSenha() {
    const validacao = validarSenha(novo);
    if (!validacao.valido) {
      alertar("Senha fraca", validacao.motivo ?? "Escolha uma senha mais forte.");
      return;
    }
    if (novo !== cnf) {
      alertar("Senhas diferentes", "A confirmação não corresponde à nova senha.");
      return;
    }
    setEnviando(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: novo });
        if (error) throw error;
      }
      alertar("Sucesso!", "Senha atualizada. Use-a no próximo login.");
      setNovo("");
      setCnf("");
    } catch (e) {
      alertar("Erro", e instanceof Error ? e.message : "Não foi possível alterar a senha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Privacidade e Segurança" />
      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.cardTitle}>Conta</Text>
          <Text style={s.cardText}>Usuário: {user?.nome ?? ""}</Text>
          <Text style={s.cardText}>E-mail: {user?.email ?? ""}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Alterar senha</Text>
          <Text style={s.cardText}>Defina uma nova senha para sua conta.</Text>
          <Text style={s.labelCampo}>Nova senha</Text>
          <TextInput secureTextEntry value={novo} onChangeText={setNovo} placeholder="••••••••" placeholderTextColor={coresTema.onSurfaceVariant} style={s.campo} autoCapitalize="none" />
          <Text style={s.labelCampo}>Confirmar nova senha</Text>
          <TextInput secureTextEntry value={cnf} onChangeText={setCnf} placeholder="••••••••" placeholderTextColor={coresTema.onSurfaceVariant} style={s.campo} autoCapitalize="none" />
          <TouchableOpacity style={[s.btnPrimario, { opacity: enviando ? 0.6 : 1 }]} onPress={alterarSenha} disabled={enviando} accessibilityRole="button">
            <Text style={s.btnPrimarioText}>{enviando ? "Salvando..." : "Alterar senha"}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Sessão</Text>
          <TouchableOpacity style={s.btnSecundario} onPress={() => { logout(); router.replace("/" as never); }} accessibilityRole="button">
            <Text style={{ color: coresTema.error, fontFamily: "BeVietnamPro_700Bold" }}>Encerrar sessão (sair)</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Sobre os dados</Text>
          <Text style={s.cardText}>
            Seus favoritos, avatar, avaliações e receitas são armazenados no Supabase e protegidos por Row Level Security — somente você acessa os próprios dados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}