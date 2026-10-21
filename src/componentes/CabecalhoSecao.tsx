
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

export function CabecalhoSecao({ titulo }: { titulo: string }) {
  const router = useRouter();
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  return (
    <View style={styles.cab}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.voltar}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Icone
          name="arrow-left"
          size={22}
          color={coresTema.onSurface}
        />
      </TouchableOpacity>

      <Text style={styles.titulo}>{titulo}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

export const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    cab: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 52,
      borderBottomWidth: 1,
      borderBottomColor: coresTema.outline,
      backgroundColor: coresTema.surface,
      gap: 8,
    },

    voltar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    titulo: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 17,
      color: coresTema.onSurface,
      flex: 1,
    },

    conteudo: {
      padding: 16,
      gap: 16,
    },

    card: {
      backgroundColor: coresTema.surfaceContainerLowest,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: coresTema.surfaceVariant,
      gap: 6,
    },

    cardTitle: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 15,
      color: coresTema.onSurface,
    },

    cardText: {
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 13,
      color: coresTema.onSurfaceVariant,
      lineHeight: 20,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },

    rowLabel: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 14,
      color: coresTema.onSurface,
    },

    rowIcon: {
      color: coresTema.onSurfaceVariant,
    },

    btnPrimario: {
      backgroundColor: coresTema.primary,
      borderRadius: 10,
      paddingVertical: 13,
      alignItems: "center",
      marginTop: 4,
    },

    btnPrimarioText: {
      color: coresTema.onPrimary,
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 14,
    },

    btnSecundario: {
      borderWidth: 1,
      borderColor: coresTema.outlineVariant,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },

    btnSecundarioText: {
      color: coresTema.onSurfaceVariant,
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 13,
    },

    campo: {
      borderWidth: 1,
      borderColor: coresTema.outlineVariant,
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 46,
      backgroundColor: coresTema.surface,
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 14,
      color: coresTema.onSurface,
    },

    labelCampo: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 12,
      color: coresTema.onSurface,
    },

    safe: {
      flex: 1,
      backgroundColor: coresTema.background,
    },
  });

/**
 * Mantém os estilos estáticos disponíveis para as telas antigas.
 * As telas que precisam de cores dinâmicas devem usar criarStyles(coresTema).
 */
import { cores } from "../tema/cores";

export const styles = StyleSheet.create({
  cab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: cores.outline,
    backgroundColor: cores.surface,
    gap: 8,
  },
  voltar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontFamily: "BeVietnamPro_700Bold",
    fontSize: 17,
    color: cores.onSurface,
    flex: 1,
  },
  conteudo: { padding: 16, gap: 16 },
  card: {
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    gap: 6,
  },
  cardTitle: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 15,
    color: cores.onSurface,
  },
  cardText: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 13,
    color: cores.onSurfaceVariant,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLabel: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 14,
    color: cores.onSurface,
  },
  rowIcon: { color: cores.onSurfaceVariant },
  btnPrimario: {
    backgroundColor: cores.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  btnPrimarioText: {
    color: cores.onPrimary,
    fontFamily: "BeVietnamPro_700Bold",
    fontSize: 14,
  },
  btnSecundario: {
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnSecundarioText: {
    color: cores.onSurfaceVariant,
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 13,
  },
  campo: {
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: cores.surface,
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 14,
    color: cores.onSurface,
  },
  labelCampo: {
    fontFamily: "BeVietnamPro_600SemiBold",
    fontSize: 12,
    color: cores.onSurface,
  },
  safe: { flex: 1, backgroundColor: cores.background },
});
