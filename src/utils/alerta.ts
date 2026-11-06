import { Alert, Platform } from "react-native";

type Botao = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

/**
 * Alert.alert não faz nada na web. Esta função usa os diálogos do navegador
 * nesse caso e mantém o alerta nativo no Android e no iOS.
 */
export function alertar(titulo: string, mensagem?: string, botoes?: Botao[]) {
  if (Platform.OS !== "web") {
    Alert.alert(titulo, mensagem, botoes);
    return;
  }

  const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;
  const acao = botoes?.find((botao) => botao.style !== "cancel");
  const temCancelar = botoes?.some((botao) => botao.style === "cancel");

  if (temCancelar) {
    if (window.confirm(texto)) acao?.onPress?.();
    return;
  }

  window.alert(texto);
  acao?.onPress?.();
}
