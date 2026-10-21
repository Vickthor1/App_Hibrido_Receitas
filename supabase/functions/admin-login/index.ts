import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticator } from "https://esm.sh/otplib@12.0.1";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "bastionhero3d@gmail.com";
const ADMIN_TOTP_SECRET = Deno.env.get("ADMIN_TOTP_SECRET") || "";
const JWT_ADMIN_SECRET = Deno.env.get("JWT_ADMIN_SECRET") || "fallback-secret";

authenticator.options = { window: [1, 1] };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return new Response(JSON.stringify({ error: "E-mail e código obrigatórios." }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Acesso negado." }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const isValid = authenticator.check(token.trim().replace(/\s+/g, ""), ADMIN_TOTP_SECRET.trim());

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Código MFA inválido ou expirado." }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin.from("audit_logs").insert({
      acao: "LOGIN_ADMIN",
      detalhes: `Admin ${ADMIN_EMAIL} autenticado com sucesso.`,
    });

    const payload = {
      sub: "admin-unique-id",
      email: ADMIN_EMAIL,
      role: "super_admin",
      exp: Math.floor(Date.now() / 1000) + 7200,
    };

    const tokenAdmin = btoa(JSON.stringify(payload)) + "." + btoa(JWT_ADMIN_SECRET);

    return new Response(
      JSON.stringify({ token: tokenAdmin, message: "Autenticado com sucesso." }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
