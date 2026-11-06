/**
 * Tradução automática dos textos da TheMealDB, que só existem em inglês.
 * Usa a API gratuita do MyMemory, sem chave. Se ela falhar, tenta o tradutor
 * embutido do navegador, que existe em versões recentes do Chrome e não tem
 * cota. As traduções ficam em cache no aparelho, e qualquer falha mantém o
 * texto original.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ingredienteEmPortugues } from "../locales/pt-BR/receitas";

const URL_API = "https://api.mymemory.translated.net/get";
const CHAVE_CACHE = "@receita_facil:traducoes";
const MAX_ITENS_CACHE = 400;
const MAX_CARACTERES = 450; // A API aceita até 500 bytes por chamada.
const TIMEOUT_MS = 10000;
const ESPERA_LOTE_MS = 40;
const PAUSA_SEM_COTA_MS = 60 * 60 * 1000;
const TIMEOUT_NAVEGADOR_MS = 60000;

type TradutorNavegador = {
  translate: (texto: string) => Promise<string>;
};

type ApiTradutorNavegador = {
  create: (opcoes: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<TradutorNavegador>;
};

const cache = new Map<string, string>();
let cacheCarregado: Promise<void> | null = null;
let timerSalvar: ReturnType<typeof setTimeout> | null = null;
let semCotaAte = 0;
let tradutorNavegador: Promise<TradutorNavegador> | null = null;

function carregarCache(): Promise<void> {
  if (!cacheCarregado) {
    cacheCarregado = AsyncStorage.getItem(CHAVE_CACHE)
      .then((bruto) => {
        if (!bruto) return;
        const itens = JSON.parse(bruto) as [string, string][];
        itens.forEach(([original, traducao]) => cache.set(original, traducao));
      })
      .catch(() => {});
  }
  return cacheCarregado;
}

function guardar(original: string, traducao: string) {
  cache.set(original, traducao);

  if (timerSalvar) clearTimeout(timerSalvar);
  timerSalvar = setTimeout(() => {
    const itens = [...cache.entries()].slice(-MAX_ITENS_CACHE);
    AsyncStorage.setItem(CHAVE_CACHE, JSON.stringify(itens)).catch(() => {});
  }, 500);
}

function limparResposta(texto: string, original: string): string {
  const decodificado = texto
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

  // A API às vezes devolve tudo em maiúsculas.
  const gritando =
    decodificado === decodificado.toUpperCase() && original !== original.toUpperCase();
  if (!gritando) return decodificado;

  const minusculas = decodificado.toLowerCase();
  return minusculas.replace(/(^|\n)(.)/g, (_t, inicio, letra) => inicio + letra.toUpperCase());
}

async function chamarApi(texto: string, idiomas: string): Promise<string | null> {
  if (Date.now() < semCotaAte) return null;

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TIMEOUT_MS);

  try {
    const url = `${URL_API}?q=${encodeURIComponent(texto)}&langpair=${encodeURIComponent(idiomas)}`;
    const resposta = await fetch(url, { signal: controle.signal });
    const json = await resposta.json();
    const status = Number(json?.responseStatus);
    const traduzido: unknown = json?.responseData?.translatedText;

    if (status === 429 || json?.quotaFinished || String(traduzido).includes("MYMEMORY WARNING")) {
      semCotaAte = Date.now() + PAUSA_SEM_COTA_MS;
      return null;
    }

    if (status !== 200 || typeof traduzido !== "string" || !traduzido.trim()) return null;
    return limparResposta(traduzido, texto);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function traduzirNoNavegador(texto: string): Promise<string | null> {
  const api = (globalThis as { Translator?: ApiTradutorNavegador }).Translator;
  if (!api) return null;

  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    tradutorNavegador ??= api.create({ sourceLanguage: "en", targetLanguage: "pt" });

    // Na primeira vez o Chrome baixa o idioma, e isso pode demorar ou nunca terminar.
    const limite = new Promise<never>((_, rejeitar) => {
      timer = setTimeout(() => rejeitar(new Error("tempo esgotado")), TIMEOUT_NAVEGADOR_MS);
    });
    const tradutor = await Promise.race([tradutorNavegador, limite]);
    const traduzido = await Promise.race([tradutor.translate(texto), limite]);

    return traduzido.trim() ? traduzido : null;
  } catch {
    tradutorNavegador = null;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function traduzirParaPortugues(texto: string): Promise<string | null> {
  return (await chamarApi(texto, "en|pt-BR")) ?? traduzirNoNavegador(texto);
}

function agruparPorTamanho(linhas: string[]): string[] {
  const grupos: string[] = [];
  let atual = "";

  linhas.forEach((linha) => {
    if (atual && atual.length + linha.length + 1 > MAX_CARACTERES) {
      grupos.push(atual);
      atual = "";
    }
    atual = atual ? `${atual}\n${linha}` : linha;
  });

  if (atual) grupos.push(atual);
  return grupos;
}

function quebrarEmLinhas(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .flatMap((linha) => {
      if (linha.length <= MAX_CARACTERES) return [linha];
      return linha.match(/[^.!?]+[.!?]*\s*/g)?.map((frase) => frase.trim()) ?? [linha];
    });
}

// Textos curtos pedidos ao mesmo tempo, como os títulos de uma lista, vão juntos
// em uma chamada para gastar menos cota.
type Pedido = { texto: string; resolver: (traducao: string) => void };
let fila: Pedido[] = [];
let timerFila: ReturnType<typeof setTimeout> | null = null;

async function processarFila() {
  const pedidos = fila;
  fila = [];
  timerFila = null;

  const textos = [...new Set(pedidos.map((pedido) => pedido.texto))];
  const resultado = new Map<string, string>();

  for (const grupo of agruparPorTamanho(textos)) {
    const originais = grupo.split("\n");
    const traduzido = await traduzirParaPortugues(grupo);
    const partes = traduzido?.split("\n").map((parte) => parte.trim()) ?? [];

    if (partes.length !== originais.length) continue;

    originais.forEach((original, indice) => {
      resultado.set(original, partes[indice]);
      guardar(original, partes[indice]);
    });
  }

  pedidos.forEach(({ texto, resolver }) => resolver(resultado.get(texto) ?? texto));
}

/** Tradução já conhecida, sem chamar a rede. */
export function traducaoConhecida(texto: string): string | null {
  return ingredienteEmPortugues(texto) ?? cache.get(texto) ?? null;
}

export async function traduzirCurto(texto: string): Promise<string> {
  const limpo = texto.trim();
  if (!limpo) return texto;

  await carregarCache();
  const conhecida = traducaoConhecida(limpo);
  if (conhecida) return conhecida;

  return new Promise((resolver) => {
    fila.push({ texto: limpo, resolver });
    if (!timerFila) timerFila = setTimeout(processarFila, ESPERA_LOTE_MS);
  });
}

export async function traduzirLongo(texto: string): Promise<string> {
  const limpo = texto.trim();
  if (!limpo) return texto;

  await carregarCache();
  const conhecida = cache.get(limpo);
  if (conhecida) return conhecida;

  const partes: string[] = [];
  for (const grupo of agruparPorTamanho(quebrarEmLinhas(limpo))) {
    const traduzido = await traduzirParaPortugues(grupo);
    if (!traduzido) return texto;
    partes.push(traduzido);
  }

  const resultado = partes.join("\n\n");
  guardar(limpo, resultado);
  return resultado;
}

/** Traduz uma busca para o inglês. Retorna null se não conseguir. */
export async function traduzirBusca(termo: string): Promise<string | null> {
  const traduzido = await chamarApi(termo.trim(), "pt-BR|en");
  if (!traduzido) return null;

  const ingles = traduzido.toLowerCase().trim();
  return ingles && ingles !== termo.toLowerCase().trim() ? ingles : null;
}
