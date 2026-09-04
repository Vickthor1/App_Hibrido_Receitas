import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { cores } from "../tema/cores";

interface Props {
  mensagem?: string;
  tamanho?: "small" | "large";
}

export function Carregamento({ mensagem = "Carregando...", tamanho = "large" }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={tamanho} color={cores.primary} />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16, backgroundColor: cores.background },
  texto: { fontSize: 14, color: cores.onSurfaceVariant },
});
