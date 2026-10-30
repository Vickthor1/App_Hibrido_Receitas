import { supabase } from "../lib/supabase";
import { Receita } from "../tipos/receita";

export interface PerfilSocial {
  id: string;
  nome: string;
  avatar_url: string | null;
}

/**
 * Seguir um usuário. Impede seguir a si mesmo.
 */
export async function seguirUsuario(seguidoId: string): Promise<{ ok: boolean; erro?: string }> {
  try {
    const { data: sessao } = await supabase.auth.getSession();
    const seguidorId = sessao.session?.user?.id;
    if (!seguidorId) return { ok: false, erro: "Usuário não autenticado." };
    if (seguidorId === seguidoId) return { ok: false, erro: "Você não pode seguir a si mesmo." };

    const { error } = await supabase
      .from("seguidores")
      .insert({ seguidor_id: seguidorId, seguido_id: seguidoId });

    if (error) {
      if (error.code === "23505") return { ok: true }; // já segue
      return { ok: false, erro: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao seguir usuário." };
  }
}

/**
 * Deixar de seguir um usuário.
 */
export async function deixarDeSeguir(seguidoId: string): Promise<{ ok: boolean; erro?: string }> {
  try {
    const { data: sessao } = await supabase.auth.getSession();
    const seguidorId = sessao.session?.user?.id;
    if (!seguidorId) return { ok: false, erro: "Usuário não autenticado." };

    const { error } = await supabase
      .from("seguidores")
      .delete()
      .eq("seguidor_id", seguidorId)
      .eq("seguido_id", seguidoId);

    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao deixar de seguir." };
  }
}

/**
 * Verifica se o usuário logado segue determinado usuário.
 */
export async function verificarSeSegue(seguidoId: string): Promise<boolean> {
  try {
    const { data: sessao } = await supabase.auth.getSession();
    const seguidorId = sessao.session?.user?.id;
    if (!seguidorId || seguidorId === seguidoId) return false;

    const { data, error } = await supabase
      .from("seguidores")
      .select("id")
      .eq("seguidor_id", seguidorId)
      .eq("seguido_id", seguidoId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Busca a lista de perfis que seguem um usuário.
 */
export async function buscarSeguidores(usuarioId: string): Promise<PerfilSocial[]> {
  try {
    const { data, error } = await supabase
      .from("seguidores")
      .select("seguidor_id")
      .eq("seguido_id", usuarioId);

    if (error || !data || data.length === 0) return [];
    const ids = data.map((d: { seguidor_id: string }) => d.seguidor_id);

    const { data: perfis, error: errP } = await supabase
      .from("perfis")
      .select("id, nome, avatar_url")
      .in("id", ids);

    if (errP || !perfis) return [];
    return perfis as PerfilSocial[];
  } catch {
    return [];
  }
}

/**
 * Busca a lista de perfis que um usuário está seguindo.
 */
export async function buscarSeguindo(usuarioId: string): Promise<PerfilSocial[]> {
  try {
    const { data, error } = await supabase
      .from("seguidores")
      .select("seguido_id")
      .eq("seguidor_id", usuarioId);

    if (error || !data || data.length === 0) return [];
    const ids = data.map((d: { seguido_id: string }) => d.seguido_id);

    const { data: perfis, error: errP } = await supabase
      .from("perfis")
      .select("id, nome, avatar_url")
      .in("id", ids);

    if (errP || !perfis) return [];
    return perfis as PerfilSocial[];
  } catch {
    return [];
  }
}

/**
 * Conta seguidores de um usuário.
 */
export async function contarSeguidores(usuarioId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("seguidores")
      .select("*", { count: "exact", head: true })
      .eq("seguido_id", usuarioId);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Conta quantos usuários este usuário está seguindo.
 */
export async function contarSeguindo(usuarioId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("seguidores")
      .select("*", { count: "exact", head: true })
      .eq("seguidor_id", usuarioId);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export interface ReceitaSeguido extends Receita {
  autor_nome?: string;
  autor_avatar?: string | null;
  autor_id?: string;
}

/**
 * Busca receitas publicadas por usuários que o usuário logado segue.
 */
export async function buscarReceitasDosSeguidos(): Promise<ReceitaSeguido[]> {
  try {
    const { data: sessao } = await supabase.auth.getSession();
    const seguidorId = sessao.session?.user?.id;
    if (!seguidorId) return [];

    // 1) Busca IDs dos seguidos
    const { data: seguindo, error: errS } = await supabase
      .from("seguidores")
      .select("seguido_id")
      .eq("seguidor_id", seguidorId);

    if (errS || !seguindo || seguindo.length === 0) return [];
    const idsSeguidos = seguindo.map((s: { seguido_id: string }) => s.seguido_id);

    // 2) Busca receitas desses autores
    const { data: receitas, error: errR } = await supabase
      .from("receitas")
      .select("id, user_id, nome, categoria, tempo, ingredientes, modo, created_at")
      .in("user_id", idsSeguidos)
      .order("created_at", { ascending: false });

    if (errR || !receitas || receitas.length === 0) return [];

    // 3) Busca perfis dos autores
    const { data: perfis } = await supabase
      .from("perfis")
      .select("id, nome, avatar_url")
      .in("id", idsSeguidos);

    const mapaPerfis: Record<string, { nome: string; avatar_url: string | null }> = {};
    (perfis ?? []).forEach((p: { id: string; nome: string; avatar_url: string | null }) => {
      mapaPerfis[p.id] = { nome: p.nome, avatar_url: p.avatar_url };
    });

    return receitas.map((r: { id: string; user_id: string; nome: string; categoria: string | null; tempo: string | null; ingredientes: string | null; modo: string | null; created_at: string }) => {
      const autor = mapaPerfis[r.user_id] ?? { nome: "Usuário", avatar_url: null };
      return {
        idMeal: r.id,
        strMeal: r.nome,
        strCategory: r.categoria ?? "Geral",
        strArea: "Caseira",
        strInstructions: r.modo ?? "",
        strMealThumb: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        strTags: null,
        strYoutube: null,
        strIngredient1: r.ingredientes,
        strMeasure1: r.tempo ? `${r.tempo} min` : null,
        autor_id: r.user_id,
        autor_nome: autor.nome,
        autor_avatar: autor.avatar_url,
      } as unknown as ReceitaSeguido;
    });
  } catch {
    return [];
  }
}

/**
 * Busca usuários pelo nome para descoberta.
 */
export async function descobrirUsuarios(termo: string): Promise<PerfilSocial[]> {
  try {
    const { data: sessao } = await supabase.auth.getSession();
    const meuId = sessao.session?.user?.id;

    let query = supabase.from("perfis").select("id, nome, avatar_url");
    if (termo.trim()) {
      query = query.ilike("nome", `%${termo.trim()}%`);
    }
    const { data, error } = await query.limit(20);
    if (error || !data) return [];

    // Remove o próprio usuário dos resultados
    return (data as PerfilSocial[]).filter((p) => p.id !== meuId);
  } catch {
    return [];
  }
}
