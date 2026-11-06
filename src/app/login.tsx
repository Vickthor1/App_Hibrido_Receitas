
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../contexto/AuthContext";
import {
  MotivoFalhaBiometria,
  restaurarSessaoBiometria,
  temCredencialBiometricaSalva,
  verificarSuporteBiometria,
} from "../servicos/biometria";
import { useEffect } from "react";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

type Modo = "login" | "registro" | "recuperar";

const CHAVE_EMAIL_LEMBRADO = "@receita_facil:email_lembrado";

const TITULOS: Record<Modo, string> = {
  login: "Faça o seu login",
  registro: "Crie sua conta",
  recuperar: "Recuperar senha",
};

const ROTULOS_BOTAO: Record<Modo, string> = {
  login: "ENTRAR",
  registro: "CRIAR CONTA",
  recuperar: "ENVIAR LINK",
};

const MENSAGENS_BIOMETRIA: Record<MotivoFalhaBiometria, string> = {
  indisponivel: "Biometria indisponível neste aparelho.",
  cancelado: "Autenticação biométrica cancelada.",
  sem_sessao: "Entre com sua senha para continuar.",
  sem_credencial: "Entre com sua senha e ative a biometria no perfil.",
  sessao_expirada: "Sua sessão expirou. Entre com sua senha e ative a biometria novamente.",
  falha: "Não foi possível entrar agora. Verifique sua internet e tente novamente em 1 minuto ou use sua senha.",
};

export default function Login() {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const router = useRouter();
  const {
    login,
    registrar,
    recuperarSenha,
    reenviarConfirmacao,
    isAutenticado,
  } = useAuth();

  const [modo, setModo] = useState<Modo>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [podeReenviar, setPodeReenviar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);
  const [tipoBio, setTipoBio] = useState("Biometria");

  useEffect(() => {
    if (isAutenticado) return;

    let ativo = true;

    Promise.all([
      verificarSuporteBiometria(),
      temCredencialBiometricaSalva(),
    ]).then(([suporte, temCredencial]) => {
      if (!ativo) return;
      setBiometriaDisponivel(suporte.disponivel && temCredencial);
      setTipoBio(suporte.tipo);
    });

    return () => {
      ativo = false;
    };
  }, [isAutenticado]);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_EMAIL_LEMBRADO)
      .then((salvo) => {
        if (!salvo) return;
        setEmail(salvo);
        setLembrar(true);
      })
      .catch(() => {});
  }, []);

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setErro(null);
    setAviso(null);
    setPodeReenviar(false);
    setSenha("");
  }

  async function handleLoginBiometrico() {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await restaurarSessaoBiometria();
      if (resultado.ok) {
        router.replace("/" as never);
        return;
      }

      setErro(MENSAGENS_BIOMETRIA[resultado.motivo ?? "falha"]);
      if (resultado.motivo === "sessao_expirada" || resultado.motivo === "sem_credencial") {
        setBiometriaDisponivel(false);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro na biometria.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit() {
    if (carregando) return;

    setErro(null);
    setAviso(null);
    setPodeReenviar(false);

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || (modo !== "recuperar" && !senha)) {
      setErro(
        modo === "recuperar"
          ? "Informe seu email."
          : "Preencha o email e a senha."
      );
      return;
    }

    if (modo === "registro" && nome.trim().length < 2) {
      setErro("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      if (modo === "recuperar") {
        const resultado = await recuperarSenha(emailLimpo);

        if (!resultado.ok) {
          setErro(resultado.erro ?? "Não foi possível enviar o link.");
          return;
        }

        setAviso(
          "Se este email tiver cadastro, enviamos um link para criar uma nova senha. Confira também o spam."
        );
        return;
      }

      const resultado =
        modo === "login"
          ? await login(emailLimpo, senha)
          : await registrar(nome.trim(), emailLimpo, senha);

      if (!resultado.ok) {
        const mensagem =
          resultado.erro ??
          "Não foi possível realizar a autenticação.";

        setErro(mensagem);
        setPodeReenviar(mensagem.startsWith("Confirme seu email"));
        return;
      }

      if (resultado.precisaConfirmar) {
        setModo("login");
        setSenha("");
        setAviso(
          `Conta criada! Enviamos um link de confirmação para ${emailLimpo}. Confirme o email para entrar.`
        );
        return;
      }

      if (modo === "login") {
        if (lembrar) {
          await AsyncStorage.setItem(CHAVE_EMAIL_LEMBRADO, emailLimpo);
        } else {
          await AsyncStorage.removeItem(CHAVE_EMAIL_LEMBRADO);
        }
      }

      router.replace("/" as never);
    } catch (error) {
      console.error("Erro na tela de login:", error);

      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleReenviar() {
    setCarregando(true);
    setErro(null);

    const resultado = await reenviarConfirmacao(email);

    setCarregando(false);
    setPodeReenviar(false);

    if (resultado.ok) {
      setAviso("Enviamos um novo link de confirmação.");
    } else {
      setErro(resultado.erro ?? "Não foi possível reenviar o email.");
    }
  }

  function alternarModo() {
    trocarModo(modo === "login" ? "registro" : "login");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bgShape} />

        <View style={styles.centerWrap}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {TITULOS[modo]}
            </Text>

            <View style={styles.underline} />

            {modo !== "recuperar" && (
            <View style={styles.tabs}>
              <TouchableOpacity
                onPress={() => trocarModo("login")}
                style={[
                  styles.tab,
                  modo === "login" && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    modo === "login" && styles.tabTextActive,
                  ]}
                >
                  Entrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => trocarModo("registro")}
                style={[
                  styles.tab,
                  modo === "registro" && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    modo === "registro" && styles.tabTextActive,
                  ]}
                >
                  Criar conta
                </Text>
              </TouchableOpacity>
            </View>
            )}

            {modo === "recuperar" && (
              <Text style={styles.hint}>
                Informe seu email e enviaremos um link para criar uma nova senha.
              </Text>
            )}

            {modo === "registro" && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  Seu nome*
                </Text>

                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholderTextColor={coresTema.onSurfaceVariant}
                placeholder="Digite seu nome"
                  autoCapitalize="words"
                  maxLength={60}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>
                Seu e-mail*
              </Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={coresTema.onSurfaceVariant}
                placeholder="Digite seu email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                maxLength={254}
              />
            </View>

            {modo !== "recuperar" && (
            <View style={styles.field}>
              <Text style={styles.label}>
                Sua senha*
              </Text>

              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholderTextColor={coresTema.onSurfaceVariant}
                placeholder="Digite sua senha"
                secureTextEntry
                maxLength={128}
              />

              {modo === "registro" && (
                <Text style={styles.hint}>
                  Mín. 8 caracteres, com maiúscula,
                  minúscula e número.
                </Text>
              )}
            </View>
            )}

            {modo === "login" && (
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setLembrar(!lembrar)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    lembrar && styles.checkboxActive,
                  ]}
                >
                  {lembrar && (
                    <Text style={styles.checkMark}>
                      ✓
                    </Text>
                  )}
                </View>

                <Text style={styles.rememberText}>
                  Lembrar-me
                </Text>
              </TouchableOpacity>
            )}

            {erro && (
              <View style={styles.erroBox}>
                <Text style={styles.erroText}>
                  {erro}
                </Text>
              </View>
            )}

            {aviso && (
              <View style={styles.avisoBox}>
                <Text style={styles.avisoText}>
                  {aviso}
                </Text>
              </View>
            )}

            {podeReenviar && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={handleReenviar}
                disabled={carregando}
                accessibilityRole="button"
              >
                <Text style={styles.linkHighlight}>
                  Reenviar email de confirmação
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.btn,
                carregando && styles.btnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={carregando}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {carregando
                  ? "Aguarde..."
                  : ROTULOS_BOTAO[modo]}
              </Text>
            </TouchableOpacity>

            {modo === "login" && biometriaDisponivel && (
              <TouchableOpacity
                style={[
                  styles.bioBtn,
                  carregando && styles.btnDisabled,
                ]}
                onPress={handleLoginBiometrico}
                disabled={carregando}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Entrar com biometria"
              >
                <Text style={styles.bioBtnText}>
                  Entrar com biometria ({tipoBio})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.linkRow}
              onPress={alternarModo}
            >
              <Text style={styles.linkText}>
                {modo === "login"
                  ? "Não tem conta? "
                  : "Já tem conta? "}

                <Text style={styles.linkHighlight}>
                  {modo === "login"
                    ? "Cadastre-se"
                    : "Entrar"}
                </Text>
              </Text>
            </TouchableOpacity>

            {modo === "login" && (
              <TouchableOpacity
                style={styles.forgotRow}
                onPress={() => trocarModo("recuperar")}
                accessibilityRole="button"
              >
                <Text style={styles.forgotText}>
                  Esqueceu sua senha?{" "}
                  <Text style={styles.forgotHighlight}>
                    Clique aqui!
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
              <TouchableOpacity
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/");
                  }
                }}
                style={styles.voltar}
              >
                <Text style={styles.voltarText}>
                  ← Voltar
                </Text>
              </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            © 2024 Receita Fácil. Todos os direitos
            reservados.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        );
      }

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: coresTema.background,
  },

  scroll: {
    flexGrow: 1,
    padding: espacamentos.page,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: "center",
    minHeight: "100%",
  },

  bgShape: {
    position: "absolute",
    bottom: -120,
    right: -80,
    width: 500,
    height: 500,
    backgroundColor: coresTema.primary,
    borderRadius: 250,
    transform: [{ rotate: "-12deg" }],
    opacity: 0.95,
  },

  centerWrap: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 12,
    zIndex: 1,
  },

  card: {
    backgroundColor: coresTema.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: coresTema.surfaceVariant,
  },

  title: {
    fontFamily: "BeVietnamPro_700Bold",
    fontSize: 20,
    color: coresTema.onSurface,
    textAlign: "left",
  },

  underline: {
    width: 64,
    height: 3,
    backgroundColor: coresTema.primary,
    borderRadius: 2,
    marginTop: -8,
    marginBottom: 4,
  },

  tabs: {
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: coresTema.outlineVariant,
    marginBottom: 4,
  },

  tab: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flex: 1,
    alignItems: "center",
  },

  tabActive: {
    borderBottomColor: coresTema.primary,
  },

  tabText: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 13,
    color: coresTema.onSurfaceVariant,
  },

  tabTextActive: {
    color: coresTema.primary,
  },

  field: {
    gap: 6,
  },

  label: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 13,
    color: coresTema.onSurface,
  },

  input: {
    backgroundColor: coresTema.surfaceContainerLow,
    borderWidth: 1,
    borderColor: coresTema.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: coresTema.onSurface,
  },

  hint: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 11,
    color: coresTema.onSurfaceVariant,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: coresTema.outline,
    backgroundColor: coresTema.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: coresTema.primary,
    borderColor: coresTema.primary,
  },

  checkMark: {
    color: coresTema.onPrimary,
    fontSize: 11,
    fontFamily: "BeVietnamPro_700Bold",
  },

  rememberText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: coresTema.onSurface,
  },

  avisoBox: {
    backgroundColor: coresTema.surfaceContainerLow,
    borderColor: coresTema.primary,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
  },

  avisoText: {
    color: coresTema.onSurface,
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },

  erroBox: {
    backgroundColor: coresTema.errorContainer,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: coresTema.error,
  },

  erroText: {
    color: coresTema.onErrorContainer,
    fontSize: 13,
    fontFamily: "BeVietnamPro_600SemiBold",
  },

  btn: {
    backgroundColor: coresTema.primary,
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 4,
    shadowColor: coresTema.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  bioBtn: {
    backgroundColor: coresTema.surfaceContainerHigh,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: coresTema.outlineVariant,
  },
  bioBtnText: {
    color: coresTema.onSurface,
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
  },
  btnText: {
    color: coresTema.onPrimary,
    fontFamily: "BeVietnamPro_700Bold",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  linkRow: {
    alignItems: "center",
    paddingTop: 4,
  },

  linkText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: coresTema.onSurfaceVariant,
  },

  linkHighlight: {
    color: coresTema.primary,
    fontFamily: "BeVietnamPro_700Bold",
  },

  forgotRow: {
    alignItems: "center",
  },

  forgotText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: coresTema.onSurfaceVariant,
  },

  forgotHighlight: {
    color: coresTema.primary,
    fontFamily: "BeVietnamPro_600SemiBold",
  },

  voltar: {
    alignItems: "center",
    padding: 8,
    marginTop: 2,
  },

  voltarText: {
    color: coresTema.onSurfaceVariant,
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 13,
  },

  footer: {
    textAlign: "center",
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 11,
    color: coresTema.onSurfaceVariant,
    marginTop: 8,
  },
});
