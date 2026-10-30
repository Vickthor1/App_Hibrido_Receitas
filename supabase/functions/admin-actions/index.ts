import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const JWT_ADMIN_SECRET = Deno.env.get("JWT_ADMIN_SECRET") || "fallback-secret";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Token não fornecido." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const key = await getCryptoKey(JWT_ADMIN_SECRET);

    // Validação criptográfica rigorosa do JWT assinado
    let payload;
    try {
      payload = await verify(token, key);
    } catch {
      return new Response(JSON.stringify({ error: "Sessão admin inválida ou expirada." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (payload.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Permissão negada." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action, userId, userEmail } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    if (action === "DELETE_USER") {
      if (!userId) return new Response(JSON.stringify({ error: "userId obrigatório." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;

      await supabaseAdmin.from("audit_logs").insert({
        acao: "DELETAR_USUARIO",
        detalhes: `Admin ${payload.email} excluiu o usuário ID: ${userId}`,
      });

      return new Response(JSON.stringify({ success: true, message: "Usuário excluído com sucesso." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "RESET_PASSWORD") {
      if (!userEmail) return new Response(JSON.stringify({ error: "userEmail obrigatório." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: userEmail,
      });

      if (error) throw error;

      await supabaseAdmin.from("audit_logs").insert({
        acao: "RESET_SENHA_SOLICITADO",
        detalhes: `Admin ${payload.email} solicitou redefinição de senha para: ${userEmail}`,
      });

      return new Response(JSON.stringify({ success: true, link: data.properties.action_link, message: "Link de redefinição gerado com sucesso." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});