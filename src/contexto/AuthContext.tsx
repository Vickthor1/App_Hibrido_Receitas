
import * as Linking from "expo-linking";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  encerrarSessaoLocal,
  isSupabaseConfigured,
  supabase,
} from "../lib/supabase";
import {
  checkRateLimit,
  validarEmail,
  validarSenha,
} from "../utils/seguranca";
import {
  biometriaAtivaPara,
  sincronizarCredencialBiometrica,
} from "../servicos/biometria";
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
  precisaConfirmar?: boolean;
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
  atualizarNome: (nome: string) => Promise<Resultado>;
  recuperarSenha: (email: string) => Promise<Resultado>;
  redefinirSenha: (senha: string) => Promise<Resultado>;
  reenviarConfirmacao: (email: string) => Promise<Resultado>;
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
  const texto = msg.toLowerCase();

  if (texto.includes("invalid login credentials")) {
    return "Email ou senha incorretos.";
  }

  if (texto.includes("already registered") || texto.includes("already exists")) {
    return "Email já cadastrado.";
  }

  if (texto.includes("email not confirmed")) {
    return "Confirme seu email antes de entrar.";
  }

  if (texto.includes("rate limit") || texto.includes("too many")) {
    return "Muitas tentativas. Aguarde e tente novamente.";
  }

  if (texto.includes("should be different")) {
    return "A nova senha precisa ser diferente da atual.";
  }

  if (texto.includes("password")) {
    return "Senha fraca. Use pelo menos 8 caracteres, com maiúscula, minúscula e número.";
  }

  if (texto.includes("signups not allowed") || texto.includes("signup is disabled")) {
    return "Novos cadastros estão desativados no momento.";
  }

  if (texto.includes("session") || texto.includes("expired")) {
    return "Sua sessão expirou. Peça um novo link e tente novamente.";
  }

  if (texto.includes("fetch") || texto.includes("network")) {
    return "Sem conexão com o servidor. Verifique sua internet.";
  }

  return "Erro de autenticação. Tente novamente.";
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
        async (_event, session) => {
          if (!ativo) return;

          const usuario = session?.user;

          if (!session || !usuario) {
            setUser(null);
            return;
          }

          void sincronizarCredencialBiometrica(session);

          // Busca perfil real atualizado (incluindo avatar_url do banco) para evitar perder a foto ao focar/mudar de aba
          const perfil = await carregarPerfilUsuario(usuario);
          if (ativo) setUser(perfil);
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
          erro: traduzirErroSupabase(mensagemErro(error)),
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
              emailRedirectTo: Linking.createURL("login"),
            },
          });

          if (error) {
            return {
              ok: false,
              erro: traduzirErroSupabase(error.message),
            };
          }

          // Com a confirmação por email ativa, um email já cadastrado volta
          // sem erro, mas com a lista de identidades vazia.
          if (data.user?.identities?.length === 0) {
            return {
              ok: false,
              erro: "Email já cadastrado.",
            };
          }

          if (data.session && data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email ?? emailLimpo,
              nome: nomeLimpo,
              avatarUrl: null,
            });

            return { ok: true };
          }

          return { ok: true, precisaConfirmar: true };
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
          erro: traduzirErroSupabase(mensagemErro(error)),
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

  const atualizarNome = useCallback(
    async (nome: string): Promise<Resultado> => {
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
              nome,
              avatar_url: user.avatarUrl ?? null,
            });

          if (error) throw error;
        } else {
          await setItemSeguro(
            KEY_USER,
            JSON.stringify({ ...user, nome })
          );
        }

        setUser((anterior) =>
          anterior ? { ...anterior, nome } : null
        );

        return { ok: true };
      } catch (error) {
        console.error("Erro ao atualizar nome:", error);

        return {
          ok: false,
          erro: "Não foi possível salvar o nome.",
        };
      }
    },
    [user]
  );

  const recuperarSenha = useCallback(
    async (email: string): Promise<Resultado> => {
      const emailLimpo = email.trim().toLowerCase();

      if (!validarEmail(emailLimpo)) {
        return { ok: false, erro: "Email inválido." };
      }

      if (!isSupabaseConfigured) {
        return {
          ok: false,
          erro: "Recuperação indisponível no modo offline.",
        };
      }

      const rl = checkRateLimit("auth:recuperar", 3, 60000);

      if (!rl.allowed) {
        return {
          ok: false,
          erro: "Muitas tentativas. Aguarde um minuto.",
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        emailLimpo,
        { redirectTo: Linking.createURL("redefinir-senha") }
      );

      if (error) {
        return {
          ok: false,
          erro: traduzirErroSupabase(error.message),
        };
      }

      return { ok: true };
    },
    []
  );

  const redefinirSenha = useCallback(
    async (senha: string): Promise<Resultado> => {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        return {
          ok: false,
          erro: traduzirErroSupabase(error.message),
        };
      }

      return { ok: true };
    },
    []
  );

  const reenviarConfirmacao = useCallback(
    async (email: string): Promise<Resultado> => {
      const rl = checkRateLimit("auth:reenviar", 3, 60000);

      if (!rl.allowed) {
        return {
          ok: false,
          erro: "Muitas tentativas. Aguarde um minuto.",
        };
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: Linking.createURL("login"),
        },
      });

      if (error) {
        return {
          ok: false,
          erro: traduzirErroSupabase(error.message),
        };
      }

      return { ok: true };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        // Com biometria ativa, a sessão continua válida para o próximo login.
        if (user && (await biometriaAtivaPara(user.id))) {
          await encerrarSessaoLocal();
        } else {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        }
      } else {
        await removeItemSeguro(KEY_USER);
      }

      setUser(null);
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
      throw error;
    }
  }, [user]);

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
        atualizarNome,
        recuperarSenha,
        redefinirSenha,
        reenviarConfirmacao,
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
