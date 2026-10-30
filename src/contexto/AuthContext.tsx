
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  checkRateLimit,
  validarEmail,
  validarSenha,
} from "../utils/seguranca";
import {
  getItemSeguro,
  removeItemSeguro,
  setItemSeguro,
} from "../utils/storageSeguro";

type User = {
  id: string;
  email: string;
  nome: string;
  avatarUrl?: string | null;
};

type Resultado = {
  ok: boolean;
  erro?: string;
};

type AuthState = {
  user: User | null;
  carregando: boolean;
  isAutenticado: boolean;
  isSupabase: boolean;
  login: (email: string, senha: string) => Promise<Resultado>;
  registrar: (
    nome: string,
    email: string,
    senha: string
  ) => Promise<Resultado>;
  logout: () => Promise<void>;
  atualizarAvatar: (url: string | null) => Promise<Resultado>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const KEY_USER = "@receita_facil:auth_user";
const KEY_USERS = "@receita_facil:users_db";
const KEY_TENTATIVAS = "auth:login";

function mensagemErro(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocorreu um erro inesperado.";
}

function traduzirErroSupabase(msg: string): string {
  if (msg.includes("Invalid login credentials")) {
    return "Email ou senha incorretos.";
  }

  if (msg.includes("already registered")) {
    return "Email já cadastrado.";
  }

  if (msg.includes("Email not confirmed")) {
    return "Confirme seu email antes de entrar.";
  }

  if (msg.includes("rate limit")) {
    return "Muitas tentativas. Aguarde e tente novamente.";
  }

  return msg || "Erro de autenticação. Tente novamente.";
}

type RegistroLocal = {
  nome: string;
  senha: string;
  id: string;
};

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfilUsuario = useCallback(
    async (u: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    }): Promise<User> => {
      let avatarUrl =
        typeof u.user_metadata?.avatar_url === "string"
          ? u.user_metadata.avatar_url
          : null;

      let nome =
        typeof u.user_metadata?.nome === "string"
          ? u.user_metadata.nome
          : u.email?.split("@")[0] ?? "";

      try {
        const { data, error } = await supabase
          .from("perfis")
          .select("nome, avatar_url")
          .eq("id", u.id)
          .maybeSingle();

        if (!error && data) {
          if (data.nome) nome = data.nome;
          if (data.avatar_url) avatarUrl = data.avatar_url;
        }
      } catch (error) {
        console.warn("Erro ao carregar perfil:", error);
      }

      return {
        id: u.id,
        email: u.email ?? "",
        nome,
        avatarUrl,
      };
    },
    []
  );

  useEffect(() => {
    let ativo = true;

    async function carregarSessao() {
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.getSession();

          if (error) throw error;

          const usuario = data.session?.user;

          if (usuario) {
            const perfil = await carregarPerfilUsuario(usuario);
            if (ativo) setUser(perfil);
          } else if (ativo) {
            setUser(null);
          }
        } else {
          const raw = await getItemSeguro(KEY_USER);

          if (raw && ativo) {
            setUser(JSON.parse(raw) as User);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarSessao();

    if (isSupabaseConfigured) {
      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!ativo) return;

          const usuario = session?.user;

          if (!usuario) {
            setUser(null);
            return;
          }

          // Evita executar consultas adicionais dentro
          // do callback de autenticação do Supabase.
          setUser({
            id: usuario.id,
            email: usuario.email ?? "",
            nome:
              typeof usuario.user_metadata?.nome === "string"
                ? usuario.user_metadata.nome
                : usuario.email?.split("@")[0] ?? "",
            avatarUrl:
              typeof usuario.user_metadata?.avatar_url === "string"
                ? usuario.user_metadata.avatar_url
                : null,
          });
        }
      );

      return () => {
        ativo = false;
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      ativo = false;
    };
  }, [carregarPerfilUsuario]);

  const login = useCallback(
    async (email: string, senha: string): Promise<Resultado> => {
      try {
        const emailLimpo = email.trim().toLowerCase();

        if (!validarEmail(emailLimpo)) {
          return { ok: false, erro: "Email inválido." };
        }

        if (!senha) {
          return { ok: false, erro: "Senha obrigatória." };
        }

        const rl = checkRateLimit(
          KEY_TENTATIVAS,
          5,
          60000
        );

        if (!rl.allowed) {
          const segundos = Math.ceil(
            (rl.retryAfterMs ?? 60000) / 1000
          );

          return {
            ok: false,
            erro: `Muitas tentativas. Tente novamente em ${segundos}s.`,
          };
        }

        if (isSupabaseConfigured) {
          const { data, error } =
            await supabase.auth.signInWithPassword({
              email: emailLimpo,
              password: senha,
            });

          if (error) {
            return {
              ok: false,
              erro: traduzirErroSupabase(error.message),
            };
          }

          if (!data.user) {
            return {
              ok: false,
              erro: "Não foi possível obter os dados do usuário.",
            };
          }

          const perfil = await carregarPerfilUsuario(data.user);
          setUser(perfil);

          return { ok: true };
        }

        // Modo offline
        const dbRaw = await getItemSeguro(KEY_USERS);

        const db: Record<string, RegistroLocal> = dbRaw
          ? JSON.parse(dbRaw)
          : {};

        const registro = db[emailLimpo];

        if (!registro) {
          return {
            ok: false,
            erro: "Usuário não encontrado (modo offline).",
          };
        }

        if (registro.senha !== senha) {
          return {
            ok: false,
            erro: "Senha incorreta.",
          };
        }

        const usuario: User = {
          id: registro.id,
          email: emailLimpo,
          nome: registro.nome,
        };

        await setItemSeguro(
          KEY_USER,
          JSON.stringify(usuario)
        );

        setUser(usuario);

        return { ok: true };
      } catch (error) {
        console.error("Erro no login:", error);

        return {
          ok: false,
          erro: mensagemErro(error),
        };
      }
    },
    [carregarPerfilUsuario]
  );

  const registrar = useCallback(
    async (
      nome: string,
      email: string,
      senha: string
    ): Promise<Resultado> => {
      try {
        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (nomeLimpo.length < 2) {
          return {
            ok: false,
            erro: "Nome deve ter pelo menos 2 caracteres.",
          };
        }

        if (!validarEmail(emailLimpo)) {
          return {
            ok: false,
            erro: "Email inválido.",
          };
        }

        const validacao = validarSenha(senha);

        if (!validacao.valido) {
          return {
            ok: false,
            erro: validacao.motivo ?? "Senha inválida.",
          };
        }

        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signUp({
            email: emailLimpo,
            password: senha,
            options: {
              data: {
                nome: nomeLimpo,
              },
            },
          });

          if (error) {
            return {
              ok: false,
              erro: traduzirErroSupabase(error.message),
            };
          }

          // Se a confirmação por email estiver habilitada,
          // o usuário pode existir sem sessão ativa.
          if (data.session && data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email ?? emailLimpo,
              nome: nomeLimpo,
              avatarUrl: null,
            });
          }

          return { ok: true };
        }

        // Modo offline
        const dbRaw = await getItemSeguro(KEY_USERS);

        const db: Record<string, RegistroLocal> = dbRaw
          ? JSON.parse(dbRaw)
          : {};

        if (db[emailLimpo]) {
          return {
            ok: false,
            erro: "Email já cadastrado.",
          };
        }

        const id = `local_${Date.now()}`;

        db[emailLimpo] = {
          id,
          nome: nomeLimpo,
          senha,
        };

        await setItemSeguro(
          KEY_USERS,
          JSON.stringify(db)
        );

        const usuario: User = {
          id,
          email: emailLimpo,
          nome: nomeLimpo,
        };

        await setItemSeguro(
          KEY_USER,
          JSON.stringify(usuario)
        );

        setUser(usuario);

        return { ok: true };
      } catch (error) {
        console.error("Erro no cadastro:", error);

        return {
          ok: false,
          erro: mensagemErro(error),
        };
      }
    },
    []
  );

  const atualizarAvatar = useCallback(
    async (url: string | null): Promise<Resultado> => {
      if (!user) {
        return {
          ok: false,
          erro: "Usuário não autenticado.",
        };
      }

      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from("perfis")
            .upsert({
              id: user.id,
              nome: user.nome,
              avatar_url: url,
            });

          if (error) throw error;
        } else {
          const novoUsuario = {
            ...user,
            avatarUrl: url,
          };

          await setItemSeguro(
            KEY_USER,
            JSON.stringify(novoUsuario)
          );
        }

        setUser((anterior) =>
          anterior
            ? { ...anterior, avatarUrl: url }
            : null
        );

        return { ok: true };
      } catch (error) {
        console.error("Erro ao atualizar avatar:", error);

        return {
          ok: false,
          erro: mensagemErro(error),
        };
      }
    },
    [user]
  );

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        await removeItemSeguro(KEY_USER);
      }

      setUser(null);
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        carregando,
        isAutenticado: !!user,
        isSupabase: isSupabaseConfigured,
        login,
        registrar,
        logout,
        atualizarAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser usado dentro de um AuthProvider"
    );
  }

  return contexto;
}
