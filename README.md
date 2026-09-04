# Receita Fácil

> **App online:** https://app-hibrido-receitas.vercel.app/

Aplicativo híbrido (mobile + web) desenvolvido com **React Native + TypeScript + Expo** para pesquisa e visualização de receitas. Consome a **TheMealDB API** e persiste favoritos localmente (AsyncStorage) e na nuvem (Supabase) com autenticação.

## 📸 Protótipo
Fiel ao `warm_culinary` (Paprika `#AB3500`, `Be Vietnam Pro`, `rounded 16px / pill 9999px`, `shadow 0px 4px 20px rgba(0,0,0,0.05)`). Telas: Início (hero Receita do Dia, Categorias, Mais amadas, Rápidas), Busca com Filtros, Detalhes (ingredientes com checkbox + modo de preparo), Perfil e Favoritos.

## 📱 Funcionalidades
- 🔎 Pesquisar por nome ou ingrediente (com sanitização `sanitizarEntrada` e tradução `frango→chicken`)
- 🍽️ Listar receitas disponíveis (`listarReceitasDisponiveis`)
- 📖 Detalhes da receita (`lookup.php?i=`)
- 🥕 Ingredientes e medidas (`extrairIngredientes`)
- 👨‍🍳 Modo de preparo + YouTube
- 🏷️ Filtrar por categoria (`filter.php?c=`) e por tempo (mock)
- ❤️ Favoritar/desfavoritar (coração) — `useFavoritos` + `alternarFavorito`
- 💾 Persistência híbrida: `Supabase (RLS auth.uid()=user_id)` quando logado, senão `AsyncStorage` criptografado (`storageSeguro`)
- 🔐 Cadastro/Login com validação (`validarEmail/Senha` 8+ chars, maiúscula/minúscula/número) e `rateLimit 5/min` + `30 req/min` na API
- ⏳ `Carregamento` + `EstadoVazio` + `RefreshControl`
- ⚠️ Tratamento de erros sem vazar detalhes internos + `timeout 12s`
- 🔒 Telas protegidas (`/perfil`, `/favoritos` exigem login → `/login`)

## 🛠️ Tecnologias
`React Native 0.86` · `React 19` · `TypeScript 6` · `Expo 57` · `Expo Router 57` · `Expo Image` · `Expo Font (Be Vietnam Pro)` · `Supabase JS 2.115` · `AsyncStorage 2.2` · `TheMealDB`

## 🚀 Como rodar
```bash
npm install --legacy-peer-deps
cp .env.example .env # preencha EXPO_PUBLIC_SUPABASE_URL / ANON_KEY
npx expo start        # mobile
npm run web           # web
npx expo export --platform web # gera dist/
```

## 🔑 Supabase (grátis)
1. https://supabase.com/dashboard → New Project (São Paulo, sem cartão)
2. SQL Editor → cole `supabase/schema.sql` (tabelas `perfis` + `favoritos` com RLS)
3. `.env` já configurado para `cpodpuyulqfptldqgdov` — usuário teste: `teste@receitafacil.com / Teste123` (confirme o email em Auth → Users se necessário)

## 🌐 Deploy Vercel
`vercel.json` com `buildCommand: npx expo export --platform web` + `outputDirectory: dist` + headers `HSTS/CSP`. Conectado em `main`/`Front-end`, env vars `EXPO_PUBLIC_SUPABASE_*` em `Vercel → Settings → Env Vars`.

## 📂 Estrutura
```
src/app/{index,busca,receita/[id],favoritos,categorias,perfil,login,adicionar,_layout}
src/componentes/{BarraPesquisa,CartaoReceita,CartaoCategorias,Carregamento,EstadoVazio,TopBar,BottomNav,Sidebar}
src/servicos/api.ts  src/armazenamento/favoritos.ts  src/hooks/useFavoritos.ts
src/tema/{cores,espacamentos,fontes}  src/utils/{seguranca,storageSeguro}  src/lib/supabase.ts
```

## 🧪 Testes
`npm run lint` / `npx tsc --noEmit` / `npm run test:security` (SQLi/XSS/rate-limit) — `npm audit 0 vuln`

## 📄 Licença
MIT
