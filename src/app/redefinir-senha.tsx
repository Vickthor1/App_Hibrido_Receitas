import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CabecalhoSecao,
  criarStyles as criarEstilosCompartilhados,
} from "../componentes/CabecalhoSecao";
import { Carregamento } from "../componentes/Carregamento";
import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { supabase } from "../lib/supabase";
import { lerLinkRecuperacao } from "../utils/linkRecuperacao";
import { validarSenha } from "../utils/seguranca";

type Estado = "verificando" | "pronto" | "invalido" | "concluido";

async function abrirSessaoDoLink(url: string): Promise<boolean> {
  const { accessToken, refreshToken, codigo, erro } = lerLinkRecuperacao(url);
  if (erro) return false;

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }

  if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    return !error;
  }

  return false;
}

export default function RedefinirSenha() {
  const router = useRouter();
  const url = Linking.useLinkingURL();
  const { coresTema } = useTema();
  const { redefinirSenha } = useAuth();
  const s = criarEstilosCompartilhados(coresTema);

  const [estado, setEstado] = useState<Estado>("verificando");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const linkProcessado = useRef(false);

  useEffect(() => {
    if (!url || linkProcessado.current) return;
    linkProcessado.current = true;

    abrirSessaoDoLink(url)
      .then((ok) => setEstado(ok ? "pronto" : "invalido"))
      .catch(() => setEstado("invalido"));
  }, [url]);

  async function handleSalvar() {
    setErro(null);

    const validacao = validarSenha(senha);
    if (!validacao.valido) {
      setErro(validacao.motivo ?? "Senha inválida.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("A confirmação não corresponde à nova senha.");
      return;
    }

    setEnviando(true);
    const resultado = await redefinirSenha(senha);
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.erro ?? "Não foi possível alterar a senha.");
      return;
    }

    setEstado("concluido");
  }

  if (estado === "verificando") {
    return <Carregamento mensagem="Verificando o link..." />;
  }

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Redefinir senha" />

      <View style={s.conteudo}>
        {estado === "invalido" && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Link inválido ou expirado</Text>
            <Text style={s.cardText}>
              Peça um novo link na tela de login e abra-o neste aparelho.
            </Text>
            <TouchableOpacity
              style={s.btnPrimario}
              onPress={() => router.replace("/login" as never)}
              accessibilityRole="button"
            >
              <Text style={s.btnPrimarioText}>Ir para o login</Text>
            </TouchableOpacity>
          </View>
        )}

        {estado === "concluido" && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Senha alterada</Text>
            <Text style={s.cardText}>Sua nova senha já está valendo.</Text>
            <TouchableOpacity
              style={s.btnPrimario}
              onPress={() => router.replace("/" as never)}
              accessibilityRole="button"
            >
              <Text style={s.btnPrimarioText}>Ir para o início</Text>
            </TouchableOpacity>
          </View>
        )}

        {estado === "pronto" && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Crie uma nova senha</Text>
            <Text style={s.cardText}>
              Use pelo menos 8 caracteres, com maiúscula, minúscula e número.
            </Text>

            <Text style={s.labelCampo}>Nova senha</Text>
            <TextInput
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              placeholder="••••••••"
              placeholderTextColor={coresTema.onSurfaceVariant}
              style={s.campo}
              autoCapitalize="none"
              maxLength={128}
            />

            <Text style={s.labelCampo}>Confirmar nova senha</Text>
            <TextInput
              secureTextEntry
              value={confirmacao}
              onChangeText={setConfirmacao}
              placeholder="••••••••"
              placeholderTextColor={coresTema.onSurfaceVariant}
              style={s.campo}
              autoCapitalize="none"
              maxLength={128}
            />

            {erro && <Text style={{ color: coresTema.error }}>{erro}</Text>}

            <TouchableOpacity
              style={[s.btnPrimario, { opacity: enviando ? 0.6 : 1 }]}
              onPress={handleSalvar}
              disabled={enviando}
              accessibilityRole="button"
            >
              <Text style={s.btnPrimarioText}>
                {enviando ? "Salvando..." : "Salvar nova senha"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
