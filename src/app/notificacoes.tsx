import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useAuth } from "../contexto/AuthContext";
import { CabecalhoSecao, styles as s } from "../componentes/CabecalhoSecao";
import { cores } from "../tema/cores";

export default function Notificacoes() {
  const router = useRouter();
  const { isAutenticado, carregando } = useAuth();

  if (carregando) return null;

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Notificações" />
      <View style={styles.center}>
        <Icone name="bell-outline" size={48} color={cores.outlineVariant} />
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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  title: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: cores.onSurface },
  text: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, textAlign: "center" },
  btn: { marginTop: 8, backgroundColor: cores.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  btnText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 13 },
});