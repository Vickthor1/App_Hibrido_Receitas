/**
 * Dicionários para exibir em português os dados da TheMealDB, que só existem
 * em inglês. O que não está aqui passa pela tradução automática
 * (src/servicos/traducao.ts).
 */

const CATEGORIAS: Record<string, { nome: string; descricao: string }> = {
  Beef: { nome: "Carne bovina", descricao: "Assados, ensopados, bifes e outros pratos com carne de boi." },
  Breakfast: { nome: "Café da manhã", descricao: "Receitas para começar o dia, doces ou salgadas." },
  Chicken: { nome: "Frango", descricao: "Pratos com frango, do dia a dia às ocasiões especiais." },
  Dessert: { nome: "Sobremesas", descricao: "Bolos, tortas, doces e outras receitas para fechar a refeição." },
  Goat: { nome: "Cabrito", descricao: "Receitas tradicionais com carne de cabrito." },
  Lamb: { nome: "Cordeiro", descricao: "Assados e ensopados com carne de cordeiro." },
  Miscellaneous: { nome: "Diversos", descricao: "Receitas variadas que não se encaixam nas outras categorias." },
  Pasta: { nome: "Massas", descricao: "Macarrão, lasanha e outras massas com molhos variados." },
  Pork: { nome: "Carne suína", descricao: "Lombos, costelas e outros pratos com carne de porco." },
  Seafood: { nome: "Peixes e frutos do mar", descricao: "Peixes, camarões e outros frutos do mar." },
  Side: { nome: "Acompanhamentos", descricao: "Guarnições para servir junto com o prato principal." },
  Starter: { nome: "Entradas", descricao: "Pratos leves para abrir a refeição." },
  Vegan: { nome: "Veganas", descricao: "Receitas sem nenhum ingrediente de origem animal." },
  Vegetarian: { nome: "Vegetarianas", descricao: "Receitas sem carne, com legumes, grãos e queijos." },
};

const AREAS: Record<string, string> = {
  Algerian: "Argélia", American: "Estados Unidos", Argentine: "Argentina", Argentinian: "Argentina",
  Australian: "Austrália", Austrian: "Áustria", Belgian: "Bélgica", Brazilian: "Brasil",
  British: "Reino Unido", Bulgarian: "Bulgária", Cambodian: "Camboja", Canadian: "Canadá",
  Chilean: "Chile", Chinese: "China", Colombian: "Colômbia", Croatian: "Croácia", Cuban: "Cuba",
  Czech: "República Tcheca", Danish: "Dinamarca", Dutch: "Países Baixos", Egyptian: "Egito",
  Filipino: "Filipinas", Finnish: "Finlândia", French: "França", German: "Alemanha", Greek: "Grécia",
  Hungarian: "Hungria", Indian: "Índia", Indonesian: "Indonésia", Iranian: "Irã", Irish: "Irlanda",
  Israeli: "Israel", Italian: "Itália", Jamaican: "Jamaica", Japanese: "Japão", Kenyan: "Quênia",
  Lebanese: "Líbano", Malaysian: "Malásia", Mexican: "México", Moroccan: "Marrocos",
  Nigerian: "Nigéria", Norwegian: "Noruega", Pakistani: "Paquistão", Peruvian: "Peru", Polish: "Polônia",
  Portuguese: "Portugal", Romanian: "Romênia", Russian: "Rússia", "Saudi Arabian": "Arábia Saudita",
  Slovak: "Eslováquia", "South African": "África do Sul", "South Korean": "Coreia do Sul",
  Spanish: "Espanha", Swedish: "Suécia", Swiss: "Suíça", Syrian: "Síria", Thai: "Tailândia",
  Tunisian: "Tunísia", Turkish: "Turquia", Ukrainian: "Ucrânia", Uruguayan: "Uruguai",
  Venezuelan: "Venezuela", Vietnamese: "Vietnã", Unknown: "Origem não informada",
};

const INGREDIENTES: Record<string, string> = {
  "all purpose flour": "farinha de trigo", almonds: "amêndoas", apple: "maçã", apples: "maçãs",
  asparagus: "aspargos", aubergine: "berinjela", avocado: "abacate", bacon: "bacon",
  "baking powder": "fermento em pó", "bay leaf": "folha de louro", "bay leaves": "folhas de louro",
  banana: "banana", basil: "manjericão", beef: "carne bovina", "beef stock": "caldo de carne",
  "bicarbonate of soda": "bicarbonato de sódio", "black pepper": "pimenta-do-reino",
  bread: "pão", breadcrumbs: "farinha de rosca", broccoli: "brócolis", "brown sugar": "açúcar mascavo",
  butter: "manteiga", cabbage: "repolho", carrot: "cenoura", carrots: "cenouras",
  "caster sugar": "açúcar refinado", cayenne: "pimenta-caiena", "cayenne pepper": "pimenta-caiena",
  celery: "aipo", "cheddar cheese": "queijo cheddar", cheese: "queijo", "cherry tomatoes": "tomates-cereja",
  chicken: "frango", "chicken breast": "peito de frango", "chicken breasts": "peitos de frango",
  "chicken stock": "caldo de frango", "chicken thighs": "sobrecoxas de frango", chickpeas: "grão-de-bico",
  chilli: "pimenta", "chilli powder": "pimenta em pó", "chopped tomatoes": "tomates picados",
  cinnamon: "canela", cloves: "cravos", cocoa: "cacau", "cocoa powder": "cacau em pó",
  coconut: "coco", "coconut milk": "leite de coco", cod: "bacalhau", "cold water": "água fria",
  "condensed milk": "leite condensado", coriander: "coentro", "coriander leaves": "folhas de coentro",
  cornstarch: "amido de milho", "corn flour": "amido de milho", courgettes: "abobrinhas", cream: "creme de leite",
  "cream cheese": "cream cheese", cucumber: "pepino", cumin: "cominho", "curry powder": "curry em pó",
  "dark chocolate": "chocolate amargo", "double cream": "creme de leite fresco", egg: "ovo", eggs: "ovos",
  "egg white": "clara de ovo", "egg whites": "claras de ovo", "egg yolks": "gemas de ovo",
  "extra virgin olive oil": "azeite de oliva extravirgem", flour: "farinha de trigo", garlic: "alho",
  "garlic clove": "dente de alho", ginger: "gengibre", "green beans": "vagens", "green pepper": "pimentão verde",
  "ground beef": "carne moída", "ground cumin": "cominho em pó", ham: "presunto", "heavy cream": "creme de leite fresco",
  honey: "mel", "icing sugar": "açúcar de confeiteiro", lamb: "cordeiro", leek: "alho-poró",
  lemon: "limão-siciliano", "lemon juice": "suco de limão", lemons: "limões-sicilianos", lentils: "lentilhas",
  lettuce: "alface", lime: "limão", "lime juice": "suco de limão", "minced beef": "carne moída",
  milk: "leite", mint: "hortelã", mozzarella: "mozarela", mushrooms: "cogumelos", mustard: "mostarda",
  nutmeg: "noz-moscada", oil: "óleo", "olive oil": "azeite de oliva", onion: "cebola", onions: "cebolas",
  orange: "laranja", "orange juice": "suco de laranja", oregano: "orégano", paprika: "páprica",
  parmesan: "parmesão", "parmesan cheese": "queijo parmesão", parsley: "salsinha", "peanut butter": "pasta de amendoim",
  peanuts: "amendoins", peas: "ervilhas", pepper: "pimenta-do-reino", "plain flour": "farinha de trigo",
  pork: "carne suína", potato: "batata", potatoes: "batatas", prawns: "camarões", "puff pastry": "massa folhada",
  "red onions": "cebolas-roxas", "red pepper": "pimentão vermelho", "red wine": "vinho tinto", rice: "arroz",
  rosemary: "alecrim", sage: "sálvia", salmon: "salmão", salt: "sal", sausages: "linguiças",
  "self-raising flour": "farinha com fermento", shallots: "chalotas", shrimp: "camarão", "soy sauce": "molho de soja",
  spaghetti: "espaguete", spinach: "espinafre", "spring onions": "cebolinhas", strawberries: "morangos",
  sugar: "açúcar", "sunflower oil": "óleo de girassol", thyme: "tomilho", tomato: "tomate",
  "tomato puree": "purê de tomate", "tomato sauce": "molho de tomate", tomatoes: "tomates", tuna: "atum",
  turmeric: "cúrcuma", "unsalted butter": "manteiga sem sal", vanilla: "baunilha",
  "vanilla extract": "essência de baunilha", "vegetable oil": "óleo vegetal", "vegetable stock": "caldo de legumes",
  vinegar: "vinagre", walnuts: "nozes", water: "água", "white wine": "vinho branco", yeast: "fermento biológico",
  yogurt: "iogurte", zucchini: "abobrinha",
};

// Termos em português que não têm correspondência direta no dicionário acima.
const BUSCA_EXTRA: Record<string, string> = {
  bolo: "cake", carne: "beef", peixe: "fish", porco: "pork", massa: "pasta", macarrao: "pasta",
  salada: "salad", sopa: "soup", torta: "pie", pao: "bread", ovo: "egg", cordeiro: "lamb",
  sobremesa: "dessert", doce: "dessert", camarao: "prawns",
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const CATEGORIA_POR_TERMO = new Map<string, string>();
Object.entries(CATEGORIAS).forEach(([ingles, { nome }]) => {
  CATEGORIA_POR_TERMO.set(normalizar(ingles), ingles);
  CATEGORIA_POR_TERMO.set(normalizar(nome), ingles);
});
CATEGORIA_POR_TERMO.set("sobremesa", "Dessert");
CATEGORIA_POR_TERMO.set("massa", "Pasta");
CATEGORIA_POR_TERMO.set("frutos do mar", "Seafood");
CATEGORIA_POR_TERMO.set("vegana", "Vegan");
CATEGORIA_POR_TERMO.set("vegetariana", "Vegetarian");

const TERMO_EM_INGLES = new Map<string, string>();
Object.entries(INGREDIENTES).forEach(([ingles, portugues]) => {
  TERMO_EM_INGLES.set(normalizar(portugues), ingles);
});
Object.entries(BUSCA_EXTRA).forEach(([portugues, ingles]) => {
  TERMO_EM_INGLES.set(portugues, ingles);
});

export function rotuloCategoria(categoria?: string | null): string {
  if (!categoria) return "";
  return CATEGORIAS[categoria]?.nome ?? categoria;
}

export function descricaoCategoria(categoria: string): string {
  return CATEGORIAS[categoria]?.descricao ?? "";
}

export function rotuloArea(area?: string | null): string {
  if (!area) return "";
  return AREAS[area] ?? area;
}

export function ingredienteEmPortugues(nome: string): string | null {
  return INGREDIENTES[nome.toLowerCase().trim()] ?? null;
}

/** Converte o que a pessoa digitou para os termos que a TheMealDB entende. */
export function interpretarTermo(termo: string): { ingles: string; categoria: string | null } {
  const chave = normalizar(termo);
  return {
    ingles: TERMO_EM_INGLES.get(chave) ?? termo.trim(),
    categoria: CATEGORIA_POR_TERMO.get(chave) ?? null,
  };
}

const UNIDADES: [RegExp, string, string][] = [
  [/\b(tablespoons?|tblsps?|tbsps?|tbls|tbs)\b\.?/gi, "colher de sopa", "colheres de sopa"],
  [/\b(teaspoons?|tsps?)\b\.?/gi, "colher de chá", "colheres de chá"],
  [/\bcups?\b/gi, "xícara", "xícaras"],
  [/\bcloves?\b/gi, "dente", "dentes"],
  [/\bcans?\b/gi, "lata", "latas"],
  [/\bslices?\b/gi, "fatia", "fatias"],
  [/\bsprigs?\b/gi, "ramo", "ramos"],
  [/\bleaves\b/gi, "folhas", "folhas"],
  [/\bpinch(es)?\b/gi, "pitada", "pitadas"],
  [/\bbunch(es)?\b/gi, "maço", "maços"],
  [/\bhandfuls?\b/gi, "punhado", "punhados"],
];

const EXPRESSOES: [RegExp, string][] = [
  [/\bzest and juice of\b/gi, "raspas e suco de"],
  [/\bjuice of\b/gi, "suco de"],
  [/\bzest of\b/gi, "raspas de"],
  [/\bto taste\b/gi, "a gosto"],
  [/\bto serve\b/gi, "para servir"],
  [/\bfor frying\b/gi, "para fritar"],
  [/\bgarnish\b/gi, "para decorar"],
  [/\btopping\b/gi, "para cobrir"],
  [/\bfinely\b/gi, "bem"],
  [/\bthinly\b/gi, "fino"],
  [/\bchopped\b/gi, "picado"],
  [/\bminced\b/gi, "picado"],
  [/\bsliced\b/gi, "fatiado"],
  [/\bdiced\b/gi, "em cubos"],
  [/\bcrushed\b/gi, "amassado"],
  [/\bpeeled\b/gi, "descascado"],
  [/\bbeaten\b/gi, "batido"],
  [/\bshredded\b/gi, "ralado"],
  [/\bgrated\b/gi, "ralado"],
  [/\bwhole\b/gi, "inteiro"],
  [/\blarge\b/gi, "grande"],
  [/\bmedium\b/gi, "médio"],
  [/\bsmall\b/gi, "pequeno"],
  [/\bdash\b/gi, "um toque"],
  [/\bsplash\b/gi, "um pouco"],
  [/\bdrizzle\b/gi, "um fio"],
  [/\bsprinkling\b/gi, "um pouco"],
  [/\bknob\b/gi, "um pedaço"],
  [/\bfresh\b/gi, "fresco"],
  [/\band\b/gi, "e"],
  [/\bof\b/gi, "de"],
];

export function traduzirMedida(medida: string): string {
  // Frações como 3/4 ficam no singular.
  const plural = /^\s*(\d{2,}|[2-9])(?!\d*\s*\/)/.test(medida);
  let texto = medida;
  UNIDADES.forEach(([padrao, singular, varias]) => {
    texto = texto.replace(padrao, plural ? varias : singular);
  });
  EXPRESSOES.forEach(([padrao, portugues]) => {
    texto = texto.replace(padrao, portugues);
  });
  return texto;
}
