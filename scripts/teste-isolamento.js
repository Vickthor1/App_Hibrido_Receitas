/**
 * Teste de isolamento entre usuários (sem ataques externos).
 *
 * 1. Entra com Usuário A (conta de teste) e lê os próprios dados.
 * 2. Faz logout.
 * 3. Cria/entra com Usuário B (outra conta vazia).
 * 4. Tenta ler favoritos/receitas/avaliacoes/perfil do usuário A.
 *
 * Esperado: qualquer leitura cruzada retorne [] ou erro de RLS.
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(__dirname, "..", ".env");
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const getEnv = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : null;
};
const url = getEnv("EXPO_PUBLIC_SUPABASE_URL") || "https://cpodpuyulqfptldqgdov.supabase.co";
const anon = getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY") || "sb_publishable_49FxzBv_pICGVSDwq0Uvjw_gxOMg3xT";
const supabase = createClient(url, anon);

const EMAIL_A = "teste@receitafacil.com";
const SENHA_A = "Teste123";
const EMAIL_B = "outro.usuario@receitafacil.com";
const SENHA_B = "Outro1234!";

let falhas = 0;

function relatorio(nome, ok, det = "") {
  console.log(`${ok ? "PASSOU" : "FALHOU"} | ${nome}${det ? " | " + det : ""}`);
  if (!ok) falhas++;
}

(async () => {
  // --- Usuário A ---
  const a = await supabase.auth.signInWithPassword({ email: EMAIL_A, password: SENHA_A });
  if (a.error) {
    console.log("Não consegui entrar com Usuário A:", a.error.message);
    console.log("Rode primeiro: node scripts/criar-dados-teste.js");
    return;
  }
  const uidA = a.data.user.id;
  const { data: favA } = await supabase.from("favoritos").select("id_meal").eq("user_id", uidA);
  relatorio("Usuário A lê seus favoritos", Array.isArray(favA), `count=${favA?.length ?? 0}`);

  await supabase.auth.signOut();

  // --- Usuário B ---
  const bSignUp = await supabase.auth.signUp({ email: EMAIL_B, password: SENHA_B, options: { data: { nome: "Usuário B" } } });
  if (bSignUp.error && !bSignUp.error.message.toLowerCase().includes("already")) {
    console.log("Não consegui criar Usuário B:", bSignUp.error.message);
    return;
  }
  const b = await supabase.auth.signInWithPassword({ email: EMAIL_B, password: SENHA_B });
  if (b.error) {
    console.log("Não consegui entrar com Usuário B:", b.error.message);
    return;
  }
  const uidB = b.data.user.id;

  // Tentativa de leitura cruzada (B lendo dados de A) — deve retornar [] ou erro
  const t1 = await supabase.from("favoritos").select("id_meal").eq("user_id", uidA);
  relatorio("Isolamento: B não lê favoritos de A", (t1.data?.length ?? 0) === 0, JSON.stringify(t1.error?.message ?? `rows=${(t1.data ?? []).length}`));

  const t2 = await supabase.from("receitas").select("*").eq("user_id", uidA);
  relatorio("Isolamento: B não lê receitas de A", (t2.data?.length ?? 0) === 0);

  const t3 = await supabase.from("avaliacoes").select("*").eq("user_id", uidA);
  relatorio("Isolamento: B não lê avaliações de A", (t3.data?.length ?? 0) === 0);

  // B não pode alterar perfil de A (upsert em linha de A)
  const t4 = await supabase.from("perfis").upsert({ id: uidA, nome: "HACK" });
  relatorio("Isolamento: B não altera perfil de A (RLS)", !!t4.error, t4.error?.message ?? "Sem erro (vazou!)");

  // Deslogado não acessa dados
  await supabase.auth.signOut();
  const anonRead = await supabase.from("favoritos").select("*").limit(5);
  relatorio("Deslogado não lê favoritos de ninguém", (anonRead.data?.length ?? 0) === 0, anonRead.error?.message ?? "");

  console.log("\n=== RESULTADO ===");
  console.log(falhas === 0 ? "Todos os testes de isolamento passaram (RLS OK)." : `${falhas} teste(s) de isolamento falharam.`);
  console.log("Obs.: se houver 'relation does not exist', execute supabase/schema.sql primeiro.");
})();