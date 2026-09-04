import AsyncStorage from "@react-native-async-storage/async-storage";
import { getItemSeguro, setItemSeguro } from "../utils/storageSeguro";
import { Receita, ReceitaResumo } from "../tipos/receita";

const CHAVE_FAVORITOS = "@receita_facil:favoritos";

// Favorito pode ser Receita completa ou resumo (filter.php)
export type Favorito = Receita | ReceitaResumo;

function isReceitaCompleta(r: Favorito): r is Receita {
  return "strInstructions" in r;
}

// ---------------------------------------------------------------------------
// Persistência base
// ---------------------------------------------------------------------------

export async function salvarFavoritos(favoritos: Favorito[]): Promise<void> {
  try {
    // limita tamanho para evitar DoS via storage (max 200 itens)
    const limitado = favoritos.slice(0, 200);
    await setItemSeguro(CHAVE_FAVORITOS, JSON.stringify(limitado));
  } catch (e) {
    console.error("[favoritos] erro ao salvar", e);
    throw new Error("Não foi possível salvar os favoritos.");
  }
}

export async function carregarFavoritos(): Promise<Favorito[]> {
  try {
    const dados = await getItemSeguro(CHAVE_FAVORITOS);
    if (!dados) return [];
    const parsed = JSON.parse(dados) as Favorito[];
    if (!Array.isArray(parsed)) return [];
    // valida estrutura mínima para evitar injeção de dados malformados
    return parsed.filter((f) => f && typeof f.idMeal === "string" && typeof f.strMeal === "string" && typeof f.strMealThumb === "string");
  } catch (e) {
    console.error("[favoritos] erro ao carregar", e);
    await AsyncStorage.removeItem(CHAVE_FAVORITOS).catch(() => {});
    return [];
  }
}

// ---------------------------------------------------------------------------
// Operações de domínio — requisitos: adicionar/remover/persistir favoritos
// ---------------------------------------------------------------------------

export async function adicionarFavorito(receita: Favorito): Promise<Favorito[]> {
  const atuais = await carregarFavoritos();
  if (atuais.some((f) => f.idMeal === receita.idMeal)) return atuais;
  const novos = [...atuais, receita];
  await salvarFavoritos(novos);
  return novos;
}

export async function removerFavorito(idMeal: string): Promise<Favorito[]> {
  const atuais = await carregarFavoritos();
  const novos = atuais.filter((f) => f.idMeal !== idMeal);
  await salvarFavoritos(novos);
  return novos;
}

export async function alternarFavorito(receita: Favorito): Promise<{ favoritos: Favorito[]; isFavorito: boolean }> {
  const atuais = await carregarFavoritos();
  const existe = atuais.some((f) => f.idMeal === receita.idMeal);
  const favoritos = existe
    ? atuais.filter((f) => f.idMeal !== receita.idMeal)
    : [...atuais, receita];
  await salvarFavoritos(favoritos);
  return { favoritos, isFavorito: !existe };
}

export async function ehFavorito(idMeal: string): Promise<boolean> {
  const atuais = await carregarFavoritos();
  return atuais.some((f) => f.idMeal === idMeal);
}

export async function limparFavoritos(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE_FAVORITOS);
}

export async function contarFavoritos(): Promise<number> {
  const atuais = await carregarFavoritos();
  return atuais.length;
}

// Helpers sincrôno para uso em memória (sem I/O)
export function isFavoritoNaLista(lista: Favorito[], idMeal: string): boolean {
  return lista.some((f) => f.idMeal === idMeal);
}
