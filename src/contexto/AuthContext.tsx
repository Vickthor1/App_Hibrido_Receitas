import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { checkRateLimit, validarEmail, validarSenha } from "../utils/seguranca";
import { getItemSeguro, setItemSeguro, removeItemSeguro } from "../utils/storageSeguro";

type User = { id: string; email: string; nome: string; avatarUrl?: string | null };

type AuthState = {
  user: User | null;
  carregando: boolean;
  isAutenticado: boolean;
  isSupabase: boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  registrar: (nome: string, email: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  logout: () => Promise<void>;
  atualizarAvatar: (url: string | null) => Promise<{ ok: boolean; erro?: string }>;
};

const AuthContext = createContext<AuthState>({} as AuthState);

// fallback local (quando Supabase não configurado)
const KEY_USER = "@receita_facil:auth_user";
const KEY_USERS = "@receita_facil:users_db";
const KEY_TENTATIVAS = "auth:login";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfilUsuario = useCallback(async (u: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<User> => {
    let avatarUrl: string | null = (u.user_metadata?.avatar_url as string) ?? null;
    let nome: string = (u.user_metadata?.nome as string) ?? u.email?.split("@")[0] ?? "";
    try {
      const { data } = await supabase.from("perfis").select("nome, avatar_url").eq("id", u.id).single();
      if (data) {
        if (data.nome) nome = data.nome;
        if (data.avatar_url) avatarUrl = data.avatar_url;
      }
    } catch {}
    return { id: u.id, email: u.email ?? "", nome, avatarUrl };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(async ({ data }) => {
        const u = data.session?.user;
        if (u) {
          const userObj = await carregarPerfilUsuario(u);
          setUser(userObj);
        }
        setCarregando(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user;
        if (u) {
          const userObj = await carregarPerfilUsuario(u);
          setUser(userObj);
        } else {
          setUser(null);
        }
      });
      return () => sub.subscription.unsubscribe();
    } else {
      // modo offline/mock
      (async () => {
        try {
          const raw = await getItemSeguro(KEY_USER);
          if (raw) setUser(JSON.parse(raw));
        } catch {} finally { setCarregando(false); }
      })();
    }
  }, [carregarPerfilUsuario]);

  const login = useCallback(async (email: string, senha: string) => {
    const rl = checkRateLimit(KEY_TENTATIVAS, 5, 60000);
    if (!rl.allowed) return { ok: false, erro: `Muitas tentativas. Tente em ${Math.ceil((rl.retryAfterMs ?? 60000) / 1000)}s` };
    if (!validarEmail(email)) return { ok: false, erro: "Email inválido" };
    if (!senha) return { ok: false, erro: "Senha obrigatória" };

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
      if (error) return { ok: false, erro: traduzirErroSupabase(error.message) };
      return { ok: true };
    } else {
      const dbRaw = await getItemSeguro(KEY_USERS);
      const db: Record<string, { nome: string; senha: string; id: string }> = dbRaw ? JSON.parse(dbRaw) : {};
      const reg = db[email.toLowerCase()];
      if (!reg) return { ok: false, erro: "Usuário não encontrado (modo offline)" };
      if (reg.senha !== senha) return { ok: false, erro: "Senha incorreta" };
      const u: User = { id: reg.id, email: email.toLowerCase(), nome: reg.nome };
      await setItemSeguro(KEY_USER, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    if (!nome.trim() || nome.trim().length < 2) return { ok: false, erro: "Nome inválido" };
    if (!validarEmail(email)) return { ok: false, erro: "Email inválido" };
    const v = validarSenha(senha);
    if (!v.valido) return { ok: false, erro: v.motivo };

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: { data: { nome: nome.trim() } },
      });
      if (error) return { ok: false, erro: traduzirErroSupabase(error.message) };
      // Supabase pode exigir confirmação por email se habilitado
      return { ok: true };
    } else {
      const dbRaw = await getItemSeguro(KEY_USERS);
      const db: Record<string, { nome: string; senha: string; id: string }> = dbRaw ? JSON.parse(dbRaw) : {};
      if (db[email.toLowerCase()]) return { ok: false, erro: "Email já cadastrado" };
      const id = `local_${Date.now()}`;
      db[email.toLowerCase()] = { nome: nome.trim(), senha, id };
      await setItemSeguro(KEY_USERS, JSON.stringify(db));
      const u: User = { id, email: email.toLowerCase(), nome: nome.trim() };
      await setItemSeguro(KEY_USER, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }
  }, []);

  const atualizarAvatar = useCallback(async (url: string | null) => {
    if (!user) return { ok: false, erro: "Usuário não autenticado." };
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("perfis").upsert({ id: user.id, nome: user.nome, avatar_url: url });
        if (error) return { ok: false, erro: error.message };
        setUser((prev) => (prev ? { ...prev, avatarUrl: url } : null));
        return { ok: true };
      } catch (e) {
        return { ok: false, erro: e instanceof Error ? e.message : "Erro ao atualizar foto." };
      }
    } else {
      const novo = { ...user, avatarUrl: url };
      await setItemSeguro(KEY_USER, JSON.stringify(novo));
      setUser(novo);
      return { ok: true };
    }
  }, [user]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    else await removeItemSeguro(KEY_USER);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, carregando, isAutenticado: !!user, isSupabase: isSupabaseConfigured, login, registrar, logout, atualizarAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

function traduzirErroSupabase(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Credenciais inválidas";
  if (msg.includes("already registered")) return "Email já cadastrado";
  if (msg.includes("Email not confirmed")) return "Confirme seu email antes de entrar";
  return "Erro de autenticação. Tente novamente.";
}

export function useAuth() {
  return useContext(AuthContext);
}
