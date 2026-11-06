import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CabecalhoSecao, criarStyles as criarEstilosCompartilhados } from "../componentes/CabecalhoSecao";
import { Carregamento } from "../componentes/Carregamento";
import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

export default function Notificacoes() {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const s = criarEstilosCompartilhados(coresTema);
  const router = useRouter();
  const { isAutenticado, carregando } = useAuth();

  if (carregando) return <Carregamento mensagem="Carregando notificações..." />;

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Notificações" />
      <View style={styles.center}>
        <Icone name="bell-outline" size={48} color={coresTema.onSurfaceVariant} />
        <Text style={styles.title}>Sem notificações</Text>
        <Text style={styles.text}>Você não possui novas notificações.</Text>
        <Text style={styles.text}>Em breve você será avisado sobre novidades e receitas novas.</Text>
        {!isAutenticado && (
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/login" as never)} accessibilityRole="button">
            <Text style={styles.btnText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  title: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: coresTema.onSurface },
  text: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant, textAlign: "center" },
  btn: { marginTop: 8, backgroundColor: coresTema.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  btnText: { color: coresTema.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 13 },
});