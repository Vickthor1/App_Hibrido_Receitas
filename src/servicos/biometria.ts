import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const CHAVE_REFRESH_BIOMETRIA = "@receita_facil:bio_refresh_token";

/**
 * Verifica se o dispositivo possui hardware biométrico e se o usuário cadastrou biometria.
 */
export async function verificarSuporteBiometria(): { disponivel: boolean; tipo: string } {
  if (Platform.OS === "web") {
    return { disponivel: false, tipo: "Web (Não suportado nativamente)" };
  }

  try {
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

/**
 * Autentica o usuário via biometria nativa.
 */
export async function autenticarComBiometria(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptName: "Receita Fácil",
      promptMessage: "Autentique-se para entrar na sua conta",
      fallbackLabel: "Usar senha",
      cancelLabel: "Cancelar",
    });
    return res.success;
  } catch {
    return false;
  }
}

/**
 * Salva o refresh token do Supabase de forma segura no SecureStore após login bem-sucedido.
 */
export async function salvarCredencialBiometrica(refreshToken: string): Promise<void> {
  if (Platform.OS === "web" || !refreshToken) return;
  try {
    await SecureStore.setItemAsync(CHAVE_REFRESH_BIOMETRIA, refreshToken);
  } catch {}
}

/**
 * Remove o refresh token ao fazer logout ou desativar a biometria.
 */
export async function removerCredencialBiometrica(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await SecureStore.deleteItemAsync(CHAVE_REFRESH_BIOMETRIA);
  } catch {}
}

/**
 * Tenta restaurar a sessão do Supabase utilizando o refresh token protegido por biometria.
 */
export async function restaurarSessaoBiometria(): Promise<boolean> {
  if (Platform.OS === "web" || !isSupabaseConfigured) return false;

  try {
    const tokenSalvo = await SecureStore.getItemAsync(CHAVE_REFRESH_BIOMETRIA);
    if (!tokenSalvo) return false;

    // Solicita biometria ANTES de injetar o token
    const autorizado = await autenticarComBiometria();
    if (!autorizado) return false;

    // Restaura sessão no Supabase
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: tokenSalvo });
    if (error || !data.session) {
      // Token expirado ou revogado -> limpa
      await removerCredencialBiometrica();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se existe credencial biométrica salva.
 */
export async function temCredencialBiometricaSalva(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const val = await SecureStore.getItemAsync(CHAVE_REFRESH_BIOMETRIA);
    return !!val;
  } catch {
    return false;
  }
}
