import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";
import { arredondamento, espacamentos } from "../tema/espacamentos";

interface Props {
  titulo?: string;
  mensagem?: string;
  acaoTexto?: string;
  onAcao?: () => void;
  icon?: string;
}

export function EstadoVazio({
  titulo = "Nada por aqui",
  mensagem = "Tente ajustar sua busca.",
  acaoTexto,
  onAcao,
  icon = "🍳",
}: Props) {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>

      <Text style={styles.titulo}>
        {titulo}
      </Text>

      <Text style={styles.mensagem}>
        {mensagem}
      </Text>

      {acaoTexto && onAcao && (
        <TouchableOpacity
          style={styles.botao}
          onPress={onAcao}
          activeOpacity={0.8}
        >
          <Text style={styles.botaoTexto}>
            {acaoTexto}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },

    icon: {
      fontSize: 48,
    },

    titulo: {
      fontSize: 18,
      fontWeight: "600",
      color: coresTema.onSurface,
    },

    mensagem: {
      fontSize: 14,
      color: coresTema.onSurfaceVariant,
      textAlign: "center",
    },

    botao: {
      marginTop: espacamentos.sm,
      backgroundColor: coresTema.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: arredondamento.pill,
    },

    botaoTexto: {
      color: coresTema.onPrimary,
      fontWeight: "600",
      fontSize: 14,
    },
  });