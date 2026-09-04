import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

type Modo = "login" | "registro";

export default function Login() {
  const router = useRouter();
  const { login, registrar } = useAuth();
  const [modo, setModo] = useState<Modo>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    setErro(null);
    setCarregando(true);
    try {
      const res = modo === "login" ? await login(email, senha) : await registrar(nome, email, senha);
      if (!res.ok) { setErro(res.erro ?? "Erro"); return; }
      router.replace("/" as never);
    } finally { setCarregando(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Faixa diagonal laranja - inspiração hashtagtreinamentos */}
        <View style={styles.bgShape} />

        <View style={styles.centerWrap}>
          <View style={styles.card}>
            <Text style={styles.title}>{modo === "login" ? "Faça o seu login" : "Crie sua conta"}</Text>
            <View style={styles.underline} />

            {/* Tabs discretas */}
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setModo("login")} style={[styles.tab, modo === "login" && styles.tabActive]}>
                <Text style={[styles.tabText, modo === "login" && styles.tabTextActive]}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModo("registro")} style={[styles.tab, modo === "registro" && styles.tabActive]}>
                <Text style={[styles.tabText, modo === "registro" && styles.tabTextActive]}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {modo === "registro" && (
              <View style={styles.field}>
                <Text style={styles.label}>Seu nome*</Text>
                <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="" autoCapitalize="words" maxLength={60} />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Seu e-mail*</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="" autoCapitalize="none" keyboardType="email-address" maxLength={254} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Sua senha*</Text>
              <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="" secureTextEntry maxLength={128} />
              {modo === "registro" && <Text style={styles.hint}>Mín. 8 caracteres, com maiúscula, minúscula e número</Text>}
            </View>

            {modo === "login" && (
              <TouchableOpacity style={styles.rememberRow} onPress={() => setLembrar(!lembrar)} activeOpacity={0.7}>
                <View style={[styles.checkbox, lembrar && styles.checkboxActive]}>{lembrar && <Text style={styles.checkMark}>✓</Text>}</View>
                <Text style={styles.rememberText}>Lembrar-me</Text>
              </TouchableOpacity>
            )}

            {erro && <View style={styles.erroBox}><Text style={styles.erroText}>{erro}</Text></View>}

            <TouchableOpacity style={[styles.btn, carregando && styles.btnDisabled]} onPress={handleSubmit} disabled={carregando} activeOpacity={0.85}>
              <Text style={styles.btnText}>{carregando ? "Aguarde..." : modo === "login" ? "ENTRAR" : "CRIAR CONTA"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => setModo(modo === "login" ? "registro" : "login")}>
              <Text style={styles.linkText}>
                {modo === "login" ? "Não tem conta? " : "Já tem conta? "}
                <Text style={styles.linkHighlight}>{modo === "login" ? "Cadastre-se" : "Entrar"}</Text>
              </Text>
            </TouchableOpacity>

            {modo === "login" && (
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Esqueceu sua senha? <Text style={styles.forgotHighlight}>Clique aqui!</Text></Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => router.back()} style={styles.voltar}><Text style={styles.voltarText}>← Voltar</Text></TouchableOpacity>
          </View>

          <Text style={styles.footer}>© 2024 Receita Fácil. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f1f1" },
  scroll: { flexGrow: 1, padding: espacamentos.page, paddingTop: 24, paddingBottom: 32, justifyContent: "center", minHeight: "100%" },
  bgShape: {
    position: "absolute",
    bottom: -120,
    right: -80,
    width: 500,
    height: 500,
    backgroundColor: cores.primary, // #AB3500 paprika
    borderRadius: 250,
    transform: [{ rotate: "-12deg" }],
    opacity: 0.95,
  },
  centerWrap: { width: "100%", maxWidth: 420, alignSelf: "center", gap: 12, zIndex: 1 },
  card: {
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  title: { fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: cores.onSurface, textAlign: "left" },
  underline: { width: 64, height: 3, backgroundColor: cores.primary, borderRadius: 2, marginTop: -8, marginBottom: 4 },
  tabs: { flexDirection: "row", gap: 16, borderBottomWidth: 1, borderBottomColor: "#eee", marginBottom: 4 },
  tab: { paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: "transparent", flex: 1, alignItems: "center" },
  tabActive: { borderBottomColor: cores.primary },
  tabText: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: cores.onSurfaceVariant },
  tabTextActive: { color: cores.primary },
  field: { gap: 6 },
  label: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13, color: "#333" },
  input: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: cores.onSurface,
  },
  hint: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: cores.onSurfaceVariant },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: "#bbb", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: cores.primary, borderColor: cores.primary },
  checkMark: { color: "#fff", fontSize: 11, fontFamily: "BeVietnamPro_700Bold" },
  rememberText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: "#333" },
  erroBox: { backgroundColor: cores.errorContainer, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#f5c6cb" },
  erroText: { color: cores.onErrorContainer, fontSize: 13, fontFamily: "BeVietnamPro_600SemiBold" },
  btn: {
    backgroundColor: cores.primary,
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 4,
    shadowColor: cores.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontFamily: "BeVietnamPro_700Bold", fontSize: 14, letterSpacing: 0.3 },
  linkRow: { alignItems: "center", paddingTop: 4 },
  linkText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: "#555" },
  linkHighlight: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold" },
  forgotRow: { alignItems: "center" },
  forgotText: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: "#555" },
  forgotHighlight: { color: cores.primary, fontFamily: "BeVietnamPro_600SemiBold" },
  voltar: { alignItems: "center", padding: 8, marginTop: 2 },
  voltarText: { color: cores.onSurfaceVariant, fontFamily: "BeVietnamPro_500Medium", fontSize: 13 },
  footer: { textAlign: "center", fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: "#999", marginTop: 8 },
});
