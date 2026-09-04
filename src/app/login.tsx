import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

type Modo = "login" | "registro";

export default function Login() {
  const router = useRouter();
  const { login, registrar } = useAuth();
  const [modo, setModo] = useState<Modo>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Receita Fácil</Text>
        <Text style={styles.sub}>Acesse para salvar e criar receitas</Text>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, modo === "login" && styles.tabAtivo]} onPress={() => setModo("login")}><Text style={[styles.tabText, modo === "login" && styles.tabTextAtivo]}>Entrar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tab, modo === "registro" && styles.tabAtivo]} onPress={() => setModo("registro")}><Text style={[styles.tabText, modo === "registro" && styles.tabTextAtivo]}>Criar conta</Text></TouchableOpacity>
          </View>

          {modo === "registro" && (
            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Marina Silva" autoCapitalize="words" maxLength={60} />
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" autoCapitalize="none" keyboardType="email-address" maxLength={254} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry maxLength={128} />
            <Text style={styles.hint}>Mín. 8 chars, maiúscula, minúscula e número</Text>
          </View>

          {erro && <View style={styles.erroBox}><Text style={styles.erroText}>{erro}</Text></View>}

          <TouchableOpacity style={[styles.btn, carregando && styles.btnDisabled]} onPress={handleSubmit} disabled={carregando} activeOpacity={0.8}>
            <Text style={styles.btnText}>{carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.voltar}><Text style={styles.voltarText}>Voltar</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  scroll: { padding: espacamentos.page, gap: 16, paddingTop: 32 },
  logo: { fontSize: 28, fontWeight: "700", color: cores.primary, textAlign: "center" },
  sub: { fontSize: 14, color: cores.onSurfaceVariant, textAlign: "center" },
  card: { backgroundColor: cores.surfaceContainerLowest, borderRadius: arredondamento.lg, padding: espacamentos.lg, gap: 16, borderWidth: 1, borderColor: cores.surfaceVariant, marginTop: 8 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.outlineVariant, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabAtivo: { borderBottomColor: cores.primary },
  tabText: { fontWeight: "600", color: cores.onSurfaceVariant },
  tabTextAtivo: { color: cores.primary },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: cores.onSurface },
  input: { borderWidth: 1, borderColor: cores.outlineVariant, borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: cores.surface, fontSize: 14, color: cores.onSurface },
  hint: { fontSize: 11, color: cores.onSurfaceVariant },
  erroBox: { backgroundColor: cores.errorContainer, padding: 12, borderRadius: 10 },
  erroText: { color: cores.onErrorContainer, fontSize: 13, fontWeight: "600" },
  btn: { backgroundColor: cores.primary, paddingVertical: 14, borderRadius: arredondamento.pill, alignItems: "center", marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: cores.onPrimary, fontWeight: "700", fontSize: 16 },
  voltar: { alignItems: "center", padding: 8 },
  voltarText: { color: cores.onSurfaceVariant, fontWeight: "500" },
});
