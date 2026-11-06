import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? (process.env as unknown as Record<string, string>).VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (process.env as unknown as Record<string, string>).EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  (process.env as unknown as Record<string, string>).VITE_SUPABASE_PUBLISHABLE_KEY ??
  (process.env as unknown as Record<string, string>).VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / ANON_KEY não definidos. Crie .env com base no .env.example. Usando modo offline até configurar."
  );
}

// Fallback para build sem env (evita crash)
const url = supabaseUrl ?? "https://placeholder.supabase.co";
const anonKey = supabaseAnonKey ?? "placeholder-anon-key";

const isWeb = typeof window !== "undefined";
const safeStorage = isWeb
  ? AsyncStorage
  : ({
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    } as unknown as typeof AsyncStorage);

// Mesmo valor padrão do supabase-js, explícito para encerrarSessaoLocal.
const storageKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: safeStorage,
    storageKey,
    autoRefreshToken: isWeb,
    persistSession: isWeb,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

/**
 * Sai da conta só neste aparelho, mantendo a sessão válida no servidor.
 * Até signOut({ scope: "local" }) revoga a sessão quando ela existe, então ela
 * é apagada antes: sem sessão, o signOut não chama o servidor e apenas limpa o
 * estado e avisa os listeners.
 */
export async function encerrarSessaoLocal(): Promise<void> {
  await safeStorage.removeItem(storageKey);
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
