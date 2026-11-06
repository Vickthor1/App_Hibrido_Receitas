import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from "react-native";
import { alertar } from "../utils/alerta";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { CabecalhoSecao } from "../componentes/CabecalhoSecao";
import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import {
  ativarBiometria,
  biometriaAtivaPara,
  removerCredencialBiometrica,
  verificarSuporteBiometria,
} from "../servicos/biometria";

export default function LoginBiometricoConfig() {
  const { coresTema } = useTema();
  const { user } = useAuth();
  const [suporte, setSuporte] = useState<{ disponivel: boolean; tipo: string }>({ disponivel: false, tipo: "Verificando..." });
  const [ativo, setAtivo] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const sup = await verificarSuporteBiometria();
      setSuporte(sup);
      setAtivo(user ? await biometriaAtivaPara(user.id) : false);
      setCarregando(false);
    })();
  }, [user]);

  async function toggleBiometria(valor: boolean) {
    if (Platform.OS === "web") {
      alertar("Indisponível", "A autenticação biométrica não é suportada em navegadores web.");
      return;
    }

    if (valor) {
      // Ativar
      try {
        const resultado = await ativarBiometria();
        if (resultado.ok) {
          setAtivo(true);
          alertar("Sucesso", "Login biométrico ativado com sucesso.");
        } else if (resultado.motivo === "sem_sessao") {
          alertar("Faça login", "Entre na sua conta para ativar a biometria.");
        } else if (resultado.motivo !== "cancelado") {
          alertar("Falha", "Não foi possível ativar a biometria neste aparelho.");
        }
      } catch (e) {
        alertar("Erro", e instanceof Error ? e.message : "Erro ao ativar biometria.");
      }
    } else {
      // Desativar
      alertar("Desativar biometria", "Tem certeza que deseja desativar o login biométrico?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            await removerCredencialBiometrica();
            setAtivo(false);
            alertar("Sucesso", "Login biométrico desativado.");
          },
        },
      ]);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: coresTema.background }}>
      <CabecalhoSecao titulo="Login Biométrico" />
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: coresTema.surfaceVariant, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icone name="fingerprint" size={28} color={coresTema.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: coresTema.onSurface }}>Autenticação por Biometria</Text>
              <Text style={{ fontFamily: "BeVietnamPro_400Regular", fontSize: 12, color: coresTema.onSurfaceVariant }}>{suporte.tipo}</Text>
            </View>
          </View>

          <Text style={{ fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant, lineHeight: 18 }}>
            Use sua impressão digital, Face ID ou Touch ID para acessar sua conta rapidamente sem precisar digitar a senha toda vez. Seus dados biométricos ficam estritamente protegidos no hardware do seu dispositivo. Ao tocar em Sair, sua sessão continua guardada neste aparelho para o próximo acesso; desative a biometria para removê-la.
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: coresTema.outlineVariant + "30" }}>
            <Text style={{ fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: coresTema.onSurface }}>Habilitar Biometria</Text>
            <Switch
              value={ativo}
              onValueChange={toggleBiometria}
              disabled={!suporte.disponivel || carregando}
              trackColor={{ false: "#767577", true: coresTema.primaryContainer }}
              thumbColor={ativo ? coresTema.primary : "#f4f3f4"}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
