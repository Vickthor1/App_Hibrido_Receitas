import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

interface Props {
  mensagem?: string;
  tamanho?: "small" | "large";
}

export function Carregamento({
  mensagem = "Carregando...",
  tamanho = "large",
}: Props) {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={tamanho}
        color={coresTema.primary}
      />

      <Text style={styles.texto}>
        {mensagem}
      </Text>
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 16,
      backgroundColor: coresTema.background,
    },

    texto: {
      fontSize: 14,
      color: coresTema.onSurfaceVariant,
    },
  });
