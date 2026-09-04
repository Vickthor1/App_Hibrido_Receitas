/**
 * Camada de serviço — integração com TheMealDB
 * https://www.themealdb.com/api.php
 *
 * Usa `fetch` nativo (sem dependência extra) com tratamento de erro,
 * timeout e normalização de respostas. Compatível com `axios` se instalado,
 * mas não exige.
 */

import {
  Receita,
  ReceitaResumo,
  RespostaReceitas,
  RespostaFiltro,
  RespostaCategorias,
  Categoria,
  Ingrediente,
  ErroApi,
} from "../tipos/receita";
import { checkRateLimit, sanitizarEntrada, validarIdMeal } from "../utils/seguranca";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const TIMEOUT_MS = 12000;

// ---------------------------------------------------------------------------
// Helpers de rede
// ---------------------------------------------------------------------------

function montarUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      // permite s="" para listar todas (search.php?s=)
      if (k === "s" && v === "") {
        url.searchParams.set(k, "");
        return;
      }
      if (String(v).trim() === "") return;
      url.searchParams.set(k, String(v).trim());
    });
  }
  return url.toString();
}

function criarErro(mensagem: string, original?: unknown, codigo?: number): ErroApi {
  return { mensagem, codigo, original };
}

async function fetchComTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    return resp;
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw criarErro("Tempo de conexão esgotado. Verifique sua internet.", e);
    }
    throw criarErro("Falha de rede ao comunicar com a API.", e);
  } finally {
    clearTimeout(timeout);
  }
}

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  // rate limit client-side: 30 req/min por endpoint
  const rl = checkRateLimit(`api:${path}`, 30, 60000);
  if (!rl.allowed) throw criarErro("Muitas requisições. Aguarde um momento.", undefined, 429);

  const url = montarUrl(path, params);
  let response: Response;

  try {
    response = await fetchComTimeout(url);
  } catch (e) {
    throw e;
  }

  if (!response.ok) {
    // não vazar detalhes internos
    throw criarErro("Erro ao comunicar com o serviço. Tente novamente.", undefined, response.status);
  }

  try {
    const data = (await response.json()) as T;
    return data;
  } catch (e) {
    throw criarErro("Resposta inválida da API.", e);
  }
}

// ---------------------------------------------------------------------------
// API pública — cobre todos os requisitos do README
// ---------------------------------------------------------------------------

/** 🔎 Pesquisar receitas por nome (search.php?s=) — requisito: pesquisar por nome */
export async function buscarReceitas(nome: string): Promise<Receita[]> {
  const q = sanitizarEntrada(nome ?? "", 60);
  const data = await getJson<RespostaReceitas>("/search.php", { s: q });
  return data.meals ?? [];
}

/** Alias correto do nome com typo antigo — mantém compatibilidade */
export const busccarReceitas = buscarReceitas;

/** 🔎 Pesquisar receitas por ingrediente (filter.php?i=) — requisito: pesquisar por ingrediente */
export async function buscarReceitasPorIngrediente(ingrediente: string): Promise<ReceitaResumo[]> {
  const q = sanitizarEntrada(ingrediente ?? "", 40);
  if (!q) return [];
  const data = await getJson<RespostaFiltro>("/filter.php", { i: q });
  return data.meals ?? [];
}

/** 🍽️ Visualizar receitas disponíveis — lista inicial (search com string vazia retorna algumas) */
export async function listarReceitasDisponiveis(): Promise<Receita[]> {
  // TheMealDB não tem endpoint "list all", mas search.php?s= retorna 25 primeiras
  return buscarReceitas("");
}

/** 🏷️ Filtrar receitas por categoria (filter.php?c=) — requisito: filtrar por categoria */
export async function filtrarReceitasPorCategoria(categoria: string): Promise<ReceitaResumo[]> {
  const q = sanitizarEntrada(categoria ?? "", 30);
  if (!q) return [];
  const data = await getJson<RespostaFiltro>("/filter.php", { c: q });
  return data.meals ?? [];
}

/** 📖 Buscar receita por ID (lookup.php?i=) — requisito: visualizar detalhes */
export async function buscarReceitaPorId(id: string): Promise<Receita | null> {
  const q = (id ?? "").trim();
  if (!validarIdMeal(q)) return null;
  const data = await getJson<RespostaReceitas>("/lookup.php", { i: q });
  return data.meals?.[0] ?? null;
}

/** 🏷️ Listar categorias disponíveis (categories.php) */
export async function buscarCategorias(): Promise<Categoria[]> {
  const data = await getJson<RespostaCategorias>("/categories.php");
  return data.categories ?? [];
}

/**
 * Pesquisa unificada — tenta por nome e, se vazio, por ingrediente.
 * Útil para BarraPesquisa que aceita "nome ou ingrediente".
 */
export async function pesquisarReceitas(termo: string): Promise<Receita[] | ReceitaResumo[]> {
  const t = termo?.trim();
  if (!t) return listarReceitasDisponiveis();
  // tenta busca por nome primeiro
  const porNome = await buscarReceitas(t);
  if (porNome.length > 0) return porNome;
  // fallback: busca por ingrediente
  return buscarReceitasPorIngrediente(t);
}

// ---------------------------------------------------------------------------
// Helpers de domínio
// ---------------------------------------------------------------------------

/** 🥕 Lista ingredientes e quantidades de uma receita */
export function extrairIngredientes(receita: Receita): Ingrediente[] {
  const ingredientes: Ingrediente[] = [];
  for (let i = 1; i <= 20; i++) {
    const nome = (receita as unknown as Record<string, string | null>)[`strIngredient${i}`];
    const medida = (receita as unknown as Record<string, string | null>)[`strMeasure${i}`];
    if (nome && nome.trim()) {
      ingredientes.push({
        nome: nome.trim(),
        medida: medida?.trim() ?? "",
      });
    }
  }
  return ingredientes;
}

/** Converte tags "Chicken,Spicy" -> ["Chicken","Spicy"] */
export function extrairTags(receita: Receita): string[] {
  if (!receita.strTags) return [];
  return receita.strTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Verifica se ErroApi */
export function isErroApi(e: unknown): e is ErroApi {
  return typeof e === "object" && e !== null && "mensagem" in e;
}
