import { Platform } from "react-native";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const CHAVE_REFRESH_BIOMETRIA = "@receita_facil:bio_refresh_token";

export async function verificarSuporteBiometria(): Promise<{ disponivel: boolean; tipo: string }> {
  if (Platform.OS === "web") {
    return { disponivel: false, tipo: "Web (Não suportado nativamente)" };
  }

  try {
    const LocalAuthentication = await import("expo-local-authentication");
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return { disponivel: false, tipo: "Indisponível ou não cadastrada" };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let tipoStr = "Biometria";
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      tipoStr = "Face ID / Reconhecimento Facial";
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      tipoStr = "Impressão Digital / Touch ID";
    }

    return { disponivel: true, tipo: tipoStr };
  } catch {
    return { disponivel: false, tipo: "Erro ao verificar" };
  }
}

export async function autenticarComBiometria(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const LocalAuthentication = await import("expo-local-authentication");
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: "Autentique-se para entrar na sua conta",
      fallbackLabel: "Usar senha",
      cancelLabel: "Cancelar",
    });
    return res.success;
  } catch {
    return false;
  }
}

export async function salvarCredencialBiometrica(refreshToken: string): Promise<void> {
  if (Platform.OS === "web" || !refreshToken) return;
  try {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(CHAVE_REFRESH_BIOMETRIA, refreshToken);
  } catch {}
}

export async function removerCredencialBiometrica(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(CHAVE_REFRESH_BIOMETRIA);
  } catch {}
}

export async function restaurarSessaoBiometria(): Promise<boolean> {
  if (Platform.OS === "web" || !isSupabaseConfigured) return false;

  try {
    const SecureStore = await import("expo-secure-store");
    const tokenSalvo = await SecureStore.getItemAsync(CHAVE_REFRESH_BIOMETRIA);
    if (!tokenSalvo) return false;

    const autorizado = await autenticarComBiometria();
    if (!autorizado) return false;

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: tokenSalvo });
    if (error || !data.session) {
      await removerCredencialBiometrica();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function temCredencialBiometricaSalva(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const SecureStore = await import("expo-secure-store");
    const val = await SecureStore.getItemAsync(CHAVE_REFRESH_BIOMETRIA);
    return !!val;
  } catch {
    return false;
  }
}
