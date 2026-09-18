/**
 * Aplica supabase/schema.sql no projeto Supabase (produção).
 *
 * Uso:
 *   $env:SUPABASE_DB_PASSWORD="..."; npm run db:migrate
 *
 * A senha do banco é lida apenas de SUPABASE_DB_PASSWORD (variável de ambiente).
 * Nenhuma credencial fica no repositório.
 */
const path = require("path");
const fs = require("fs");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..");
const REF = process.env.SUPABASE_PROJECT_REF || "cpodpuyulqfptldqgdov";
const SENHA = process.env.SUPABASE_DB_PASSWORD;
const SQL = fs.readFileSync(path.join(ROOT, "supabase", "schema.sql"), "utf8");

if (!SENHA) {
  console.error("Defina SUPABASE_DB_PASSWORD na variável de ambiente.");
  process.exit(2);
}

const regioes = ["sa-east-1", "us-east-1", "us-east-2", "us-west-1", "us-west-2", "eu-central-1", "eu-west-1", "ap-southeast-1"];

function conectar(host) {
  return new Client({
    host,
    port: 5432,
    database: "postgres",
    user: `postgres.${REF}`,
    password: SENHA,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
}

(async () => {
  for (const r of regioes) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    const c = conectar(host);
    try {
      await c.connect();
      console.log(`Conectado em ${host}`);
      await c.query(SQL);
      console.log("schema.sql aplicado com sucesso.");
      await c.end();
      process.exit(0);
    } catch (e) {
      console.log(`Falha ${r}: ${(e.message || e).toString().slice(0, 100)}`);
      await c.end().catch(() => {});
    }
  }
  console.error("Nenhuma região aceitou a conexão.");
  process.exit(1);
})();