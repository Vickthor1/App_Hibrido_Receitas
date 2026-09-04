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

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
