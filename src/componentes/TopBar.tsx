import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

interface Props {
  titulo?: string;
  mostrarVoltar?: boolean;
  onVoltar?: () => void;
  acaoDireita?: string;
  onAcaoDireita?: () => void;
}

export function TopBar({ titulo = "Receita Fácil", mostrarVoltar, onVoltar, acaoDireita, onAcaoDireita }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.lado}>
        {mostrarVoltar ? (
          <TouchableOpacity onPress={onVoltar} style={styles.iconBtn}>
            <Text style={styles.iconText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.logo}>{titulo}</Text>
        )}
      </View>
      <View style={styles.lado}>
        {acaoDireita ? (
          <TouchableOpacity onPress={onAcaoDireita} style={styles.iconBtn}>
            <Text style={styles.iconText}>{acaoDireita}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espacamentos.page,
    backgroundColor: cores.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: cores.outlineVariant,
  },
  lado: { flexDirection: "row", alignItems: "center" },
  logo: { fontSize: 20, fontWeight: "700", color: cores.primary, letterSpacing: -0.3 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  iconText: { fontSize: 22, color: cores.onSurface },
});
