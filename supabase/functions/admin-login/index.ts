import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "bastionhero3d@gmail.com";
const ADMIN_TOTP_SECRET = Deno.env.get("ADMIN_TOTP_SECRET") || "";
const JWT_ADMIN_SECRET = Deno.env.get("JWT_ADMIN_SECRET") || "fallback-secret";

// Chave criptográfica HMAC-SHA256 real para djwt
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Decodificador Base32 nativo
function base32ToBuffer(base32: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let cleaned = base32.replace(/=+$/, "").toUpperCase();
  let bits = 0, value = 0, index = 0;
  const output = new Uint8Array(Math.floor((cleaned.length * 5) / 8));
  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output[index++] = (value >> bits) & 0xff;
    }
  }
  return output.slice(0, index);
}

async function verifyTOTP(tokenStr: string, secretBase32: string, window = 1): Promise<boolean> {
  try {
    const token = tokenStr.trim().replace(/\s+/g, "");
    if (!/^\d{6}$/.test(token)) return false;
    const keyBytes = base32ToBuffer(secretBase32);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const counter = Math.floor(epoch / timeStep);

    for (let i = -window; i <= window; i++) {
      const c = counter + i;
      const msg = new Uint8Array(8);
      let temp = c;
      for (let j = 7; j >= 0; j--) {
        msg[j] = temp & 0xff;
        temp = Math.floor(temp / 256);
      }
      const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, msg);
      const hmac = new Uint8Array(signature);
      const offset = hmac[hmac.length - 1] & 0x0f;
      const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
      const otp = (binary % 1000000).toString().padStart(6, "0");
      if (otp === token) return true;
    }
    return false;
  } catch {
    return false;
  }
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return new Response(JSON.stringify({ error: "E-mail e código obrigatórios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Acesso negado." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyTOTP(token, ADMIN_TOTP_SECRET, 1);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Código MFA inválido ou expirado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin.from("audit_logs").insert({
      acao: "LOGIN_ADMIN",
      detalhes: `Admin ${ADMIN_EMAIL} autenticado via TOTP com criptografia HMAC-SHA256 e JWT assinado.`,
    });

    const key = await getCryptoKey(JWT_ADMIN_SECRET);
    const jwtToken = await create({ alg: "HS256", typ: "JWT" }, { sub: "admin-unique-id", email: ADMIN_EMAIL, role: "super_admin", exp: Math.floor(Date.now() / 1000) + 7200 }, key);

    return new Response(
      JSON.stringify({ token: jwtToken, message: "Autenticado com sucesso." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
