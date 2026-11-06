/**
 * Testa o fluxo de biometria com o código real de src/servicos/biometria.ts,
 * src/lib/supabase.ts e o supabase-js real, contra um servidor de autenticação
 * falso e local. Nenhuma conta ou dado real é usado.
 *
 * O servidor imita o Supabase: troca o refresh token a cada uso e, se um token
 * antigo for reutilizado, revoga a sessão. O SecureStore falso aplica a mesma
 * validação de chave do pacote real.
 *
 * Não substitui o teste no celular: o sensor biométrico é simulado.
 * Requer Node 22.18 ou superior. Rodar com: npm run test:biometria
 */
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, resolve as resolverCaminho } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolverCaminho(dirname(fileURLToPath(import.meta.url)), "..");

// --- Aparelho simulado -----------------------------------------------------
// O React Native define window = global, e src/lib/supabase.ts depende disso.
globalThis.window = globalThis;

globalThis.__dispositivo = {
  armazenamentoSeguro: new Map(),
  armazenamento: new Map(),
  biometriaAprova: true,
  prompts: [],
};

const STUBS = {
  "react-native": `export const Platform = { OS: "android" };`,
  "react-native-url-polyfill/auto": ``,
  "@react-native-async-storage/async-storage": `
    const m = globalThis.__dispositivo.armazenamento;
    export default {
      getItem: async (k) => m.get(k) ?? null,
      setItem: async (k, v) => void m.set(k, v),
      removeItem: async (k) => void m.delete(k),
    };`,
  "expo-secure-store": `
    const m = globalThis.__dispositivo.armazenamentoSeguro;
    const validar = (k) => {
      if (!/^[\\w.-]+$/.test(k)) throw new Error("Invalid key provided to SecureStore.");
    };
    export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 5;
    export async function getItemAsync(k) { validar(k); return m.get(k) ?? null; }
    export async function setItemAsync(k, v) { validar(k); m.set(k, v); }
    export async function deleteItemAsync(k) { validar(k); m.delete(k); }`,
  "expo-local-authentication": `
    export const SecurityLevel = { BIOMETRIC_STRONG: 3 };
    export const AuthenticationType = { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 };
    export async function hasHardwareAsync() { return true; }
    export async function isEnrolledAsync() { return true; }
    export async function getEnrolledLevelAsync() { return 3; }
    export async function supportedAuthenticationTypesAsync() { return [1]; }
    export async function authenticateAsync(opcoes) {
      globalThis.__dispositivo.prompts.push(opcoes);
      return { success: globalThis.__dispositivo.biometriaAprova };
    }`,
};

registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador in STUBS) {
      return { url: `stub:${especificador}`, shortCircuit: true };
    }
    if (especificador.startsWith(".") && contexto.parentURL?.startsWith("file:")) {
      const base = fileURLToPath(new URL(especificador, contexto.parentURL));
      if (!existsSync(base) && existsSync(`${base}.ts`)) {
        return { url: pathToFileURL(`${base}.ts`).href, shortCircuit: true };
      }
    }
    return proximo(especificador, contexto);
  },
  load(url, contexto, proximo) {
    if (url.startsWith("stub:")) {
      return { format: "module", source: STUBS[url.slice(5)], shortCircuit: true };
    }
    return proximo(url, contexto);
  },
});

// --- Servidor de autenticação falso -----------------------------------------
const USUARIOS = {
  a: { id: "11111111-1111-4111-8111-111111111111", email: "a@teste.local" },
  b: { id: "22222222-2222-4222-8222-222222222222", email: "b@teste.local" },
};
const tokens = new Map(); // refresh token -> { sessao, ativo }
const sessoesRevogadas = new Set();
const servidor = { chamadasLogout: 0, foraDoAr: false, proximoToken: 1, proximaSessao: 1 };

function jwt(usuario, sessao) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: usuario.id, session_id: sessao, exp })}.assinatura`;
}

function emitir(usuario, sessao) {
  const refresh = `rt-${servidor.proximoToken++}`;
  tokens.set(refresh, { sessao, usuario, ativo: true });
  return {
    access_token: jwt(usuario, sessao),
    refresh_token: refresh,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { ...usuario, aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" },
  };
}

function responder(res, status, corpo) {
  res.writeHead(status, { "content-type": "application/json", "x-supabase-api-version": "2024-01-01" });
  res.end(JSON.stringify(corpo ?? {}));
}

const http = createServer((req, res) => {
  let bruto = "";
  req.on("data", (d) => (bruto += d));
  req.on("end", () => {
    const url = new URL(req.url, "http://local");
    const corpo = bruto ? JSON.parse(bruto) : {};

    if (servidor.foraDoAr) {
      req.socket.destroy();
      return;
    }

    if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "password") {
      const usuario = Object.values(USUARIOS).find((u) => u.email === corpo.email);
      return responder(res, 200, emitir(usuario, `s${servidor.proximaSessao++}`));
    }

    if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "refresh_token") {
      const registro = tokens.get(corpo.refresh_token);
      if (!registro || sessoesRevogadas.has(registro.sessao)) {
        return responder(res, 400, { error_code: "refresh_token_not_found", msg: "Invalid Refresh Token: Refresh Token Not Found" });
      }
      if (!registro.ativo) {
        sessoesRevogadas.add(registro.sessao);
        return responder(res, 400, { error_code: "refresh_token_already_used", msg: "Invalid Refresh Token: Already Used" });
      }
      registro.ativo = false;
      return responder(res, 200, emitir(registro.usuario, registro.sessao));
    }

    if (url.pathname === "/auth/v1/logout") {
      servidor.chamadasLogout++;
      const token = (req.headers.authorization ?? "").replace("Bearer ", "");
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
      sessoesRevogadas.add(payload.session_id);
      return responder(res, 204);
    }

    return responder(res, 404, { msg: `rota não simulada: ${url.pathname}` });
  });
});

await new Promise((ok) => http.listen(0, "127.0.0.1", ok));
process.env.EXPO_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${http.address().port}`;
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "chave-de-teste";

// --- Código real ------------------------------------------------------------
const importar = (rel) => import(pathToFileURL(resolverCaminho(raiz, rel)).href);
const { supabase, encerrarSessaoLocal } = await importar("src/lib/supabase.ts");
const bio = await importar("src/servicos/biometria.ts");

// Reproduz o listener de AuthContext.tsx.
supabase.auth.onAuthStateChange(async (_evento, session) => {
  if (session) await bio.sincronizarCredencialBiometrica(session);
});

// --- Testes -----------------------------------------------------------------
let falhas = 0;
function verificar(condicao, mensagem) {
  console.log(`${condicao ? "✓" : "✗ FALHOU:"} ${mensagem}`);
  if (!condicao) falhas++;
}

const dispositivo = globalThis.__dispositivo;
const credencial = () => {
  const bruto = [...dispositivo.armazenamentoSeguro.values()][0];
  return bruto ? JSON.parse(bruto) : null;
};
const entrar = (usuario) => supabase.auth.signInWithPassword({ email: usuario.email, password: "senha" });
const logado = async () => !!(await supabase.auth.getSession()).data.session;
const comTimeout = (promessa, ms = 5000) =>
  Promise.race([promessa, new Promise((_, nao) => setTimeout(() => nao(new Error("travou")), ms))]);

console.log("\n=== Ativação ===");
verificar((await bio.ativarBiometria()).motivo === "sem_sessao", "sem login não ativa");
await entrar(USUARIOS.a);
verificar(!(await bio.temCredencialBiometricaSalva()), "login com senha não ativa biometria sozinho");

dispositivo.biometriaAprova = false;
verificar((await bio.ativarBiometria()).motivo === "cancelado", "biometria recusada não ativa");
verificar(!(await bio.temCredencialBiometricaSalva()), "nada foi salvo após a recusa");

dispositivo.biometriaAprova = true;
verificar((await bio.ativarBiometria()).ok, "biometria aprovada ativa");
verificar(credencial()?.userId === USUARIOS.a.id, "credencial salva para o usuário certo");
verificar(dispositivo.prompts.at(-1)?.disableDeviceFallback === true, "prompt não aceita o PIN do aparelho");
verificar(dispositivo.prompts.at(-1)?.biometricsSecurityLevel === "strong", "prompt exige biometria forte");

console.log("\n=== Renovação do token ===");
const tokenAntes = credencial().refreshToken;
await supabase.auth.refreshSession();
await new Promise((ok) => setTimeout(ok, 50));
const sessaoAtual = (await supabase.auth.getSession()).data.session;
verificar(credencial().refreshToken !== tokenAntes, "credencial acompanha a troca do token");
verificar(credencial().refreshToken === sessaoAtual.refresh_token, "credencial igual à sessão atual");

console.log("\n=== Sair e entrar com biometria ===");
const logoutsAntes = servidor.chamadasLogout;
await encerrarSessaoLocal();
verificar(!(await logado()), "sair remove a sessão do app");
verificar(servidor.chamadasLogout === logoutsAntes, "sair não revoga a sessão no servidor");
verificar(await bio.temCredencialBiometricaSalva(), "credencial continua salva");

dispositivo.biometriaAprova = false;
verificar((await bio.restaurarSessaoBiometria()).motivo === "cancelado", "biometria recusada não entra");
verificar(!(await logado()), "continua deslogado após a recusa");

dispositivo.biometriaAprova = true;
const entrada = await comTimeout(bio.restaurarSessaoBiometria());
verificar(entrada.ok, "biometria aprovada entra na conta");
verificar(await logado(), "sessão restaurada");
verificar(credencial().refreshToken === (await supabase.auth.getSession()).data.session.refresh_token, "token novo foi salvo");

await encerrarSessaoLocal();
verificar((await comTimeout(bio.restaurarSessaoBiometria())).ok, "segundo ciclo de sair e entrar funciona");

console.log("\n=== Sem internet ===");
await encerrarSessaoLocal();
servidor.foraDoAr = true;
const semRede = await comTimeout(bio.restaurarSessaoBiometria(), 45000);
servidor.foraDoAr = false;
verificar(semRede.motivo === "falha", "sem internet informa falha");
verificar(await bio.temCredencialBiometricaSalva(), "sem internet não apaga a credencial");
// O supabase-js repete a mesma falha por 60s antes de tentar o token de novo.
const relogioReal = Date.now;
Date.now = () => relogioReal() + 61_000;
verificar((await comTimeout(bio.restaurarSessaoBiometria())).ok, "volta a funcionar depois de 1 minuto com internet");
Date.now = relogioReal;

console.log("\n=== Outro usuário no mesmo aparelho ===");
await encerrarSessaoLocal();
const tokenDeA = credencial().refreshToken;
await entrar(USUARIOS.b);
await new Promise((ok) => setTimeout(ok, 50));
verificar(credencial().refreshToken === tokenDeA, "login de B não sobrescreve a credencial de A");
verificar(!(await bio.biometriaAtivaPara(USUARIOS.b.id)), "biometria não fica ativa para B");
await supabase.auth.signOut();
verificar((await comTimeout(bio.restaurarSessaoBiometria())).ok, "A ainda entra com biometria");

console.log("\n=== Sessão revogada no servidor ===");
await supabase.auth.signOut();
verificar((await bio.restaurarSessaoBiometria()).motivo === "sessao_expirada", "token revogado pede a senha");
verificar(!(await bio.temCredencialBiometricaSalva()), "credencial inválida é removida");
verificar((await bio.restaurarSessaoBiometria()).motivo === "sem_credencial", "sem credencial não abre o prompt");

console.log("\n=== Desativação ===");
await entrar(USUARIOS.a);
await bio.ativarBiometria();
await bio.removerCredencialBiometrica();
verificar(!(await bio.temCredencialBiometricaSalva()), "desativar remove a credencial");

http.close();
http.closeAllConnections();
await supabase.auth.stopAutoRefresh();

console.log(falhas === 0 ? "\n=== Todos os testes de biometria passaram ===" : `\n=== ${falhas} teste(s) falharam ===`);
process.exit(falhas === 0 ? 0 : 1);
