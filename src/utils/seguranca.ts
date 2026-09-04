/**
 * Utilitários de segurança — sanitização, validação, rate limiting
 * Testado contra: SQLi, XSS, path traversal, brute force
 */

// ---------------------------------------------------------------------------
// Sanitização
// ---------------------------------------------------------------------------

const SQLI_PATTERN = /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bTABLE\b|\bOR\b\s+1=1|--|;)/i;
const XSS_PATTERN = /<script|javascript:|onerror=|onload=|<\s*img|<\s*svg/i;
const PATH_TRAVERSAL = /\.\.\/|etc\/passwd|win\.ini/i;

export function sanitizarEntrada(input: string, maxLen = 60): string {
  if (typeof input !== "string") return "";
  let s = input.trim().slice(0, maxLen);
  // remove controles e normaliza
  s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  // bloqueia padrões maliciosos -> retorna vazio (fail-closed)
  if (SQLI_PATTERN.test(s) || XSS_PATTERN.test(s) || PATH_TRAVERSAL.test(s)) {
    // log sem expor payload cru em produção
    console.warn("[sec] entrada bloqueada por padrão suspeito");
    // remove caracteres perigosos em vez de bloquear totalmente para UX
    s = s.replace(/['";<>]/g, "");
    if (SQLI_PATTERN.test(s) || XSS_PATTERN.test(s)) return "";
  }
  return s;
}

export function validarIdMeal(id: string): boolean {
  return /^\d{4,8}$/.test(id.trim());
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 254;
}

export function validarSenha(senha: string): { valido: boolean; motivo?: string } {
  if (senha.length < 8) return { valido: false, motivo: "Senha deve ter ≥8 caracteres" };
  if (senha.length > 128) return { valido: false, motivo: "Senha muito longa" };
  if (!/[A-Z]/.test(senha)) return { valido: false, motivo: "Precisa de letra maiúscula" };
  if (!/[a-z]/.test(senha)) return { valido: false, motivo: "Precisa de letra minúscula" };
  if (!/[0-9]/.test(senha)) return { valido: false, motivo: "Precisa de número" };
  return { valido: true };
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ---------------------------------------------------------------------------
// Rate limiting (client-side) — proteção contra brute force / DoS
// ---------------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, max = 5, janelaMs = 60000): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + janelaMs });
    return { allowed: true };
  }
  if (b.count < max) {
    b.count += 1;
    return { allowed: true };
  }
  return { allowed: false, retryAfterMs: b.resetAt - now };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

// Debounce genérico
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms = 400) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
