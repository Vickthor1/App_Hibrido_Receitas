import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { cores } from "../tema/cores";
import { arredondamento, espacamentos } from "../tema/espacamentos";

interface Props {
  titulo?: string;
  mensagem?: string;
  acaoTexto?: string;
  onAcao?: () => void;
  icon?: string;
}

export function EstadoVazio({ titulo = "Nada por aqui", mensagem = "Tente ajustar sua busca.", acaoTexto, onAcao, icon = "🍳" }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.mensagem}>{mensagem}</Text>
      {acaoTexto && onAcao && (
        <TouchableOpacity style={styles.botao} onPress={onAcao} activeOpacity={0.8}>
          <Text style={styles.botaoTexto}>{acaoTexto}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  icon: { fontSize: 48 },
  titulo: { fontSize: 18, fontWeight: "600", color: cores.onSurface },
  mensagem: { fontSize: 14, color: cores.onSurfaceVariant, textAlign: "center" },
  botao: {
    marginTop: espacamentos.sm,
    backgroundColor: cores.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: arredondamento.pill,
  },
  botaoTexto: { color: cores.onPrimary, fontWeight: "600", fontSize: 14 },
});
