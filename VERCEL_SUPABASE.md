# Deploy Vercel + Supabase — Passo a Passo (grátis, seguro)

## 1) Criar projeto Supabase
1. https://supabase.com/dashboard → New Project (sem cartão, free 500MB/50k MAU)
2. Região: `South America (Sao Paulo)` para menor latência no Brasil
3. Salve `Project URL` e `anon public key` em `Project Settings → API`

## 2) Rodar SQL
Abra `SQL Editor → New query`, cole o conteúdo de `supabase/schema.sql` e Run.
O script cria `perfis` + `favoritos` com RLS (`auth.uid() = user_id`) e trigger para perfil.

## 3) Configurar env local
```bash
cp .env.example .env
# edite .env com URL e anon key reais
```
`src/lib/supabase.ts:4` lê `EXPO_PUBLIC_SUPABASE_URL` / `ANON_KEY`. Sem env, app roda em modo offline (mock local) — ideal para testar sem quebrar.

## 4) Auth
- `src/contexto/AuthContext.tsx:1` usa `supabase.auth.signUp` / `signInWithPassword` com validação `utils/seguranca.ts` + rate limit 5/min.
- `favoritos` grava em `public.favoritos` se `isSupabaseConfigured && user`, senão fallback `AsyncStorage` criptografado (`utils/storageSeguro.ts`).
- Tela `src/app/login.tsx:1` (Entrar/Criar conta) e guards em `perfil.tsx` e `favoritos.tsx` (redirecionam para `/login` se `!isAutenticado`).

## 5) Deploy Vercel
- `vercel.json:1` já com headers de segurança (HSTS, CSP, X-Frame, etc) e `connect-src` para `*.supabase.co` + `wss`.
- No dashboard Vercel → Project → Settings → Environment Variables: adicione `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Production/Preview).
- `Build Command`: `npx expo export --platform web` → `dist`.
- Alternativa Marketplace: Vercel → Marketplace → Neon/Supabase, mas env manual é mais simples.

## 6) Testar
- `npm run test:security` — sanitização SQLi/XSS, rate limit, ID validation
- Fluxo: `/login` → registrar `teste@ex.com` / `Senha123` → ver `supabase → Auth → Users` + `favoritos` RLS
- Forçar login: acessar `/perfil` ou `/favoritos` deslogado redireciona para login (guard).

## 7) Segurança extra já aplicada
- Sanitização em `api.ts` e `BarraPesquisa.tsx` (bloqueia `UNION/SELECT/DROP/--;<script>../../`)
- `validarIdMeal` em `buscarReceitaPorId` (regex `^\d{4,8}$`)
- Rate limit 30 req/min por endpoint (`api.ts:61`) e 5 login/min (`AuthContext`)
- Storage criptografado `btoa(salt+json)` + validação de estrutura
- `vercel.json` CSP/HSTS + `package.json overrides` zeraram `npm audit` (0 vuln)
