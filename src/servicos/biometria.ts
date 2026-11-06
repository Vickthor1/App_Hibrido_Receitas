import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// O SecureStore só aceita letras, números, ".", "-" e "_" na chave.
const CHAVE_CREDENCIAL = "receita_facil.bio_credencial";

// Respostas do servidor que indicam que o token salvo não serve mais.
// Outros erros, como falta de internet, não apagam a credencial.
const CODIGOS_TOKEN_INVALIDO = [
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_not_found",
  "session_expired",
  "user_not_found",
  "user_banned",
];

type Credencial = {
  userId: string;
  refreshToken: string;
};

export type MotivoFalhaBiometria =
  | "indisponivel"
  | "cancelado"
  | "sem_sessao"
  | "sem_credencial"
  | "sessao_expirada"
  | "falha";

export type ResultadoBiometria = {
  ok: boolean;
  motivo?: MotivoFalhaBiometria;
};

async function lerCredencial(): Promise<Credencial | null> {
  if (Platform.OS === "web") return null;

  try {
    const SecureStore = await import("expo-secure-store");
    const bruto = await SecureStore.getItemAsync(CHAVE_CREDENCIAL);
    if (!bruto) return null;

    const dados = JSON.parse(bruto) as Partial<Credencial>;
    if (typeof dados.userId !== "string" || typeof dados.refreshToken !== "string") {
      return null;
    }

    return { userId: dados.userId, refreshToken: dados.refreshToken };
  } catch (e) {
    console.warn("[biometria] não foi possível ler a credencial", e);
    return null;
  }
}

async function gravarCredencial(credencial: Credencial): Promise<void> {
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(CHAVE_CREDENCIAL, JSON.stringify(credencial), {
    // A credencial fica só neste aparelho e não entra em backups.
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

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

    // authenticateAsync exige biometria forte, então o aparelho precisa ter uma.
    const nivel = await LocalAuthentication.getEnrolledLevelAsync();
    if (nivel !== LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
      return { disponivel: false, tipo: "Biometria forte não cadastrada" };
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
      cancelLabel: "Cancelar",
      // Quem não passar pela biometria entra com a senha da conta,
      // e não com o PIN do aparelho.
      disableDeviceFallback: true,
      fallbackLabel: "",
      biometricsSecurityLevel: "strong",
    });
    return res.success;
  } catch {
    return false;
  }
}

/** Ativa a biometria para a sessão atual. Exige estar logado. */
export async function ativarBiometria(): Promise<ResultadoBiometria> {
  if (Platform.OS === "web" || !isSupabaseConfigured) {
    return { ok: false, motivo: "indisponivel" };
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session) return { ok: false, motivo: "sem_sessao" };

  const autorizado = await autenticarComBiometria();
  if (!autorizado) return { ok: false, motivo: "cancelado" };

  // A sessão é lida de novo porque o token pode ter mudado durante o prompt.
  const { data: atual } = await supabase.auth.getSession();
  if (!atual.session) return { ok: false, motivo: "sem_sessao" };

  try {
    await gravarCredencial({
      userId: atual.session.user.id,
      refreshToken: atual.session.refresh_token,
    });
    return { ok: true };
  } catch (e) {
    console.warn("[biometria] não foi possível salvar a credencial", e);
    return { ok: false, motivo: "falha" };
  }
}

/**
 * O Supabase troca o refresh token a cada renovação. Esta função mantém a
 * credencial atualizada, e só para o usuário que ativou a biometria.
 */
export async function sincronizarCredencialBiometrica(session: Session): Promise<void> {
  if (Platform.OS === "web") return;

  const salva = await lerCredencial();
  if (!salva || salva.userId !== session.user.id) return;
  if (salva.refreshToken === session.refresh_token) return;

  try {
    await gravarCredencial({
      userId: salva.userId,
      refreshToken: session.refresh_token,
    });
  } catch (e) {
    console.warn("[biometria] não foi possível atualizar a credencial", e);
  }
}

export async function removerCredencialBiometrica(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(CHAVE_CREDENCIAL);
  } catch (e) {
    console.warn("[biometria] não foi possível remover a credencial", e);
  }
}

export async function restaurarSessaoBiometria(): Promise<ResultadoBiometria> {
  if (Platform.OS === "web" || !isSupabaseConfigured) {
    return { ok: false, motivo: "indisponivel" };
  }

  const salva = await lerCredencial();
  if (!salva) return { ok: false, motivo: "sem_credencial" };

  const autorizado = await autenticarComBiometria();
  if (!autorizado) return { ok: false, motivo: "cancelado" };

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: salva.refreshToken,
  });

  if (error || !data.session) {
    if (error?.code && CODIGOS_TOKEN_INVALIDO.includes(error.code)) {
      await removerCredencialBiometrica();
      return { ok: false, motivo: "sessao_expirada" };
    }
    return { ok: false, motivo: "falha" };
  }

  await sincronizarCredencialBiometrica(data.session);
  return { ok: true };
}

export async function temCredencialBiometricaSalva(): Promise<boolean> {
  return (await lerCredencial()) !== null;
}

/** Indica se a biometria deste aparelho pertence ao usuário informado. */
export async function biometriaAtivaPara(userId: string): Promise<boolean> {
  const salva = await lerCredencial();
  return salva?.userId === userId;
}
