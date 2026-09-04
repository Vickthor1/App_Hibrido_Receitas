import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getItemSeguro, setItemSeguro, removeItemSeguro } from "../utils/storageSeguro";
import { checkRateLimit, validarEmail, validarSenha } from "../utils/seguranca";

type User = { email: string; nome: string };

type AuthState = {
  user: User | null;
  carregando: boolean;
  isAutenticado: boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  registrar: (nome: string, email: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({} as AuthState);

const KEY_USER = "@receita_facil:auth_user";
const KEY_USERS = "@receita_facil:users_db"; // mock DB local (para demo)
const KEY_TENTATIVAS = "auth:login";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await getItemSeguro(KEY_USER);
        if (raw) setUser(JSON.parse(raw));
      } catch {} finally { setCarregando(false); }
    })();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const rl = checkRateLimit(KEY_TENTATIVAS, 5, 60000);
    if (!rl.allowed) return { ok: false, erro: `Muitas tentativas. Tente em ${Math.ceil((rl.retryAfterMs ?? 60000)/1000)}s` };

    if (!validarEmail(email)) return { ok: false, erro: "Email inválido" };
    if (senha.length < 1) return { ok: false, erro: "Senha obrigatória" };

    // mock: busca em "DB" local
    const dbRaw = await getItemSeguro(KEY_USERS);
    const db: Record<string, { nome: string; senha: string }> = dbRaw ? JSON.parse(dbRaw) : {};
    const registro = db[email.toLowerCase()];
    if (!registro) return { ok: false, erro: "Usuário não encontrado" };
    if (registro.senha !== senha) return { ok: false, erro: "Senha incorreta" };

    const u: User = { email: email.toLowerCase(), nome: registro.nome };
    await setItemSeguro(KEY_USER, JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    if (!nome.trim() || nome.trim().length < 2) return { ok: false, erro: "Nome inválido" };
    if (!validarEmail(email)) return { ok: false, erro: "Email inválido" };
    const vSenha = validarSenha(senha);
    if (!vSenha.valido) return { ok: false, erro: vSenha.motivo };

    const dbRaw = await getItemSeguro(KEY_USERS);
    const db: Record<string, { nome: string; senha: string }> = dbRaw ? JSON.parse(dbRaw) : {};
    if (db[email.toLowerCase()]) return { ok: false, erro: "Email já cadastrado" };

    db[email.toLowerCase()] = { nome: nome.trim(), senha };
    await setItemSeguro(KEY_USERS, JSON.stringify(db));
    const u: User = { email: email.toLowerCase(), nome: nome.trim() };
    await setItemSeguro(KEY_USER, JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await removeItemSeguro(KEY_USER);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, carregando, isAutenticado: !!user, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
