/**
 * Cria/se prepara a conta de teste do Receita Fácil.
 *
 * Pré-requisito: executar `supabase/schema.sql` no SQL Editor do Supabase
 * (cria tabelas perfis, favoritos, receitas, avaliacoes + bucket avatars + RLS).
 *
 * Uso:
 *   node scripts/criar-dados-teste.js
 *
 * Conta criada:
 *   Nome: Usuário Teste
 *   E-mail: teste@receitafacil.com
 *   Senha:  Teste123
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

const EMAIL = "teste@receitafacil.com";
const SENHA = "Teste123";
const NOME = "Usuário Teste";
const AVATAR = "https://i.pravatar.cc/300?img=12";

function aviso(msg) {
  console.log(`>> ${msg}`);
}

async function garantirUsuario() {
  const { data: signUp } = await supabase.auth.signUp({
    email: EMAIL,
    password: SENHA,
    options: { data: { nome: NOME } },
  });
  // Confirma e-mail automaticamente se houver service_role (apenas para scripts locais de dev)
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && signUp.user) {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    await admin.auth.admin.updateUserById(signUp.user.id, { email_confirm: true });
  }
  const { data: signIn, error: loginErr } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: SENHA,
  });
  if (loginErr) {
    throw new Error(
      `Não foi possível entrar (${loginErr.message}). ` +
        `Confirme o e-mail em Supabase → Authentication → Users → Confirm, ` +
        `ou desative 'Confirm email' em Authentication → Providers.`
    );
  }
  return signIn.user;
}

async function main() {
  console.log("=== Preparação da conta de teste do Receita Fácil ===");
  const user = await garantirUsuario();
  const uid = user.id;
  console.log(`Usuário OK: ${EMAIL} / ${SENHA} (id ${uid.slice(0, 8)}...)`);

  // 1) Perfil (avatar)
  const { error: errPerfil } = await supabase.from("perfis").upsert({ id: uid, nome: NOME, avatar_url: AVATAR });
  if (errPerfil) aviso(`perfis: ${errPerfil.message}`);
  else console.log("Perfil + avatar OK.");

  // 2) Favorito
  const { error: errFav } = await supabase
    .from("favoritos")
    .upsert({ user_id: uid, id_meal: "52772", str_meal: "Teriyaki Chicken Casserole", str_thumb: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg" });
  if (errFav) aviso(`favoritos: ${errFav.message}`);
  else console.log("Favorito OK (Teriyaki Chicken).");

  // 3) Avaliação
  const { error: errAv } = await supabase
    .from("avaliacoes")
    .upsert({ user_id: uid, id_meal: "52772", nota: 5, comentario: "Receita prática e deliciosa! Recomendo." });
  if (errAv) aviso(`avaliacoes: ${errAv.message}`);
  else console.log("Avaliação OK (5 estrelas).");

  // 4) Receita criada pelo usuário
  const { error: errRec } = await supabase.from("receitas").insert({
    user_id: uid,
    nome: "Bolo de Cenoura da Casa",
    categoria: "Sobremesas",
    tempo: "45",
    ingredientes: "3 cenouras\n3 ovos\n2 xícaras de açúcar\n2 xícaras de farinha\n1 xícara de óleo",
    modo: "Bata tudo no liquidificador, despeje em forma untada e asse a 180°C por 40 minutos.",
  });
  if (errRec) aviso(`receitas: ${errRec.message}`);
  else console.log("Receita criada OK (Bolo de Cenoura da Casa).");

  console.log("\n=== Resumo ===");
  console.log("Se alguma linha acima vier com '>>' (aviso), a tabela pode não existir.");
  aviso('Rode o conteúdo de supabase/schema.sql no Supabase → SQL Editor e execute este script de novo.');
  console.log("\nCredenciais para teste manual:");
  console.log(`E-mail: ${EMAIL}`);
  console.log(`Senha:  ${SENHA}`);
}

main().catch((e) => {
  console.error("ERRO:", e.message || e);
  process.exitCode = 1;
});