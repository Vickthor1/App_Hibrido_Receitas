# Análise de requisitos — Receita Fácil

Análise feita em 06/11/2026 sobre a branch `main`, commit `45a6a6d`. Nenhum código do app foi alterado.

> **Atualização:** o restante deste texto mostra a situação da `main` na data da análise. Depois dela, esta branch recebeu as correções abaixo.
>
> - Problemas 1, 3, 4, 5, 8 e 10.
> - Problema 7 na tela de perfil. O link da tela de autor continua igual.
> - Itens médios de biometria, cadastro, senha, botões sem efeito, busca no celular e tema escuro. O painel admin ficou fora do tema escuro.
> - Recuperação de senha e tradução para pt-BR, que também foram adicionadas.
>
> **Pendente:** os problemas 2, 6 e 9 continuam abertos. A recuperação de senha precisa das Redirect URLs configuradas no Supabase. A tradução do modo de preparo depende de uma cota gratuita de 5.000 caracteres por dia, e o tradutor reserva só existe no Chrome. Detalhes da biometria em [BIOMETRIA.md](BIOMETRIA.md).

## Resultado

**O app ainda não atende totalmente aos requisitos.** Dos 10 requisitos funcionais, 4 estão atendidos e 6 estão parciais. A versão web funciona e está publicada, mas a versão mobile deve fechar ao abrir, e o projeto foi definido como aplicativo mobile.

Três pontos pedem atenção antes da entrega:

1. **Mobile:** `src/componentes/VLibras.tsx` está vazio, o que deve derrubar o app no Android e no iOS.
2. **Painel admin:** `/admin/dashboard` abre sem login no site publicado.
3. **Informações falsas nos detalhes:** toda receita mostra a mesma descrição, tempo, dificuldade, porções e nota.

Os requisitos usados são os do [README original](https://github.com/Vickthor1/App_Hibrido_Receitas/blob/b25290e/README.md) (commit `b25290e`). O repositório não tem um enunciado formal, então vale comparar esta análise com o enunciado da disciplina.

## Requisitos funcionais

| # | Requisito | Situação | Observação |
|---|---|---|---|
| 1 | Pesquisar por nome ou ingrediente | Parcial | A busca padrão só procura por nome. A busca por ingrediente exige tocar no filtro "Ingredientes". A tradução cobre 7 palavras, e "sobremesa" retorna 0 resultados. |
| 2 | Visualizar receitas disponíveis | Atende | A tela inicial carrega receitas da TheMealDB. |
| 3 | Visualizar detalhes da receita | Parcial | Nome, categoria e origem são reais, mas descrição, tempo, dificuldade, porções e nota são fixos. Receitas criadas por usuários abrem como "não encontrada". |
| 4 | Listar ingredientes e quantidades | Atende | Dados reais da API. |
| 5 | Visualizar modo de preparo | Atende | Texto real da API, com vídeo do YouTube. |
| 6 | Filtrar por categoria | Parcial | Funciona na tela inicial e no filtro "Categorias" da busca. A tela Categorias faz busca por nome e falha (problema 5). |
| 7 | Adicionar e remover favoritos | Parcial | Sem login, o coração salva, mas a tela Favoritos exige login e não mostra esses itens. As telas também não ficam sincronizadas entre si. |
| 8 | Persistir favoritos localmente | Parcial | O AsyncStorage é usado, mas só sem login, e essa lista fica inacessível na tela Favoritos. Com login, os favoritos ficam só no Supabase. |
| 9 | Exibir estados de carregamento | Parcial | Existe na maioria das telas. `/perfil` fica em branco e `/avaliacoes` carrega para sempre quando não há login. |
| 10 | Tratar erros da API | Atende | Tem timeout de 12s, mensagens amigáveis e opção de tentar novamente. |

## Plataforma e tecnologias

| Item | Situação | Observação |
|---|---|---|
| Aplicativo mobile | Não atende | Ver problema 1. A web funciona. |
| React Native, Expo, TheMealDB, AsyncStorage, fetch | Atende | Em uso. |
| TypeScript | Parcial | Em uso, mas `tsc` acusa 56 erros, 41 deles no app. Os outros 15 são das funções Deno e podem ser excluídos do `tsconfig`. |
| React Navigation | Atende com ressalva | O app usa Expo Router, que é construído sobre o React Navigation. Vale confirmar se isso é aceito. |

## Problemas, por prioridade

### Críticos

**1. O app deve fechar ao abrir no Android e no iOS.**
`src/componentes/VLibras.tsx` tem 0 bytes e é renderizado em `src/app/_layout.tsx:36`. Só existe implementação para web (`VLibras.web.tsx`). O bundle Android compila, mas renderizar o componente vazio gera `Element type is invalid`.
*Correção:* colocar em `VLibras.tsx` um componente que retorne `null`. **Corrigido nesta branch.**

**2. O painel administrativo está sem proteção.**
- `src/app/admin/dashboard.tsx` não verifica sessão. O site publicado mostra o painel e a contagem de usuários a qualquer visitante.
- As funções usam um segredo JWT padrão quando a variável não está definida (`supabase/functions/admin-login/index.ts:7` e `admin-actions/index.ts:5`). Sem a variável, seria possível forjar um token de admin.
- O login admin redireciona para uma rota inexistente (`src/app/admin-login.tsx:34`). O correto é `/admin/dashboard`.
- O painel usa `audit_logs`, tabela que não existe em `supabase/schema.sql`.
- O e-mail pessoal do admin está no código e aparece na tela.

*Correção:* exigir token válido no painel, buscar os dados por uma função protegida, falhar quando o segredo não existir e confirmar que `JWT_ADMIN_SECRET` está definido no Supabase.

### Altos

**3. `/perfil` fica em branco sem login.**
`carregandoDados` começa como `true` e só muda quando há usuário (`src/app/perfil.tsx:75` e `:80`), então a tela de login nunca aparece. Confirmado no site.

**4. `/avaliacoes` carrega para sempre sem login.**
A função retorna sem encerrar o carregamento (`src/app/avaliacoes.tsx:27`). Confirmado no site.

**5. A tela Categorias usa busca por nome.**
`src/app/categorias.tsx:81` abre a busca sem indicar que o termo é uma categoria. Dessert, Miscellaneous, Side e Starter retornam 0 resultados. As outras vêm incompletas: Beef traz 25 receitas de 95, e Seafood, 3 de 84.

**6. Dados fixos aparecem como reais.**
Toda receita mostra "90 min", "Média", "6 porções", "★ 4.9" e uma descrição de lasanha, inclusive o Big Mac (`src/app/receita/[id].tsx:83`, `:87` e `:91-93`). Na tela inicial também são fixos os valores em `src/app/index.tsx:137` e `src/componentes/CartaoReceita.tsx:32-33`.
*Correção:* remover esses campos ou deixar claro que são estimativas, já que a TheMealDB não fornece esses dados.

**7. Receitas criadas por usuários não abrem.**
`src/app/perfil.tsx:156` e `src/app/autor/[id].tsx:140` enviam um UUID para `/receita/[id]`, mas `src/servicos/api.ts:133` aceita apenas IDs numéricos.

**8. `Alert.alert` não funciona na web.**
No `react-native-web`, essa função é vazia. Isso afeta 7 telas. Em `src/app/minhas-receitas.tsx:83`, a exclusão fica dentro do alerta, então **não dá para apagar receita na web**. Em `adicionar.tsx`, as mensagens de validação e de sucesso não aparecem.

**9. Favoritos sem login se perdem, e as telas não sincronizam.**
Os favoritos locais não são enviados ao Supabase depois do login. Cada tela tem seu próprio estado (`src/hooks/useFavoritos.ts:20`), e nenhuma recarrega ao voltar ao foco.

**10. O modo offline não funciona.**
`src/contexto/AuthContext.tsx` usa `getItemSeguro`, `setItemSeguro` e `removeItemSeguro` sem importá-los, o que gera 8 erros de TypeScript. Sem `.env`, login e cadastro falham. O site publicado não é afetado porque tem Supabase configurado.

### Médios

- **Biometria:** não funcionava. **Corrigida nesta branch**; ver [BIOMETRIA.md](BIOMETRIA.md).
- **Cadastro:** se a confirmação de e-mail estiver ativa, o usuário vai para a tela inicial sem aviso e sem estar logado (`src/app/login.tsx:95`).
- **Senha:** não há recuperação de senha, e `src/app/privacidade.tsx:18` exige só 8 caracteres, regra mais fraca que a do cadastro.
- **Botões sem efeito:** "Lembrar-me" (`login.tsx:30`), "Ver todas" de Rápidas (`index.tsx:171`), "Ver todas" de Mais amadas, que abre a busca vazia (`index.tsx:160`), e "Carregar Mais", que repete a busca (`busca.tsx:214`).
- **Busca:** filtros de categoria e tempo aparecem só no desktop, e o filtro de tempo usa valores inventados.
- **Tema escuro:** 11 telas usam cores fixas, entre elas login, detalhes e adicionar.
- **Banco de dados:** `npm run db:migrate` aplica só `schema.sql`, sem a migração de seguidores.
- **Build nativo:** `app.json` não configura o plugin `expo-image-picker`, previsto na documentação do Expo v57.
- **Dependências:** pelo menos 10 pacotes estão fora da versão esperada pelo Expo, entre eles `expo-router` e `react-native`.

## O README diz algo diferente do código

| O README diz | O que foi encontrado |
|---|---|
| Storage "criptografado" | É Base64, sem criptografia, como o próprio `storageSeguro.ts` admite. No modo offline, isso inclui a senha. |
| `vercel.json` com HSTS e CSP | O arquivo não tem nenhum dos dois. O site envia HSTS, mas não CSP nem `X-Frame-Options`. |
| `npm audit` com 0 vulnerabilidades | 17 vulnerabilidades: 2 altas, 14 moderadas e 1 baixa. |
| `/perfil` redireciona para login | A tela fica em branco. |
| `test:security` testa SQLi e XSS | O teste usa cópias das regex e não chama `sanitizarEntrada`. Só as validações e o rate limit são testados de verdade. |
| Modo offline disponível | Não funciona (problema 10). |
| Credenciais de teste | Uma conta real de teste está publicada no README e nos scripts. É melhor removê-las e trocar a senha. |

## Verificações executadas

| Verificação | Resultado |
|---|---|
| `npm ci --legacy-peer-deps` | Passou |
| `npx tsc --noEmit` | 56 erros |
| `npx expo lint` | 21 erros e 21 avisos |
| `npm run test:security` | Passou, com a limitação descrita acima |
| `npm audit` | 17 vulnerabilidades |
| `npx expo install --check` | Dependências desatualizadas |
| `npx expo export --platform web` | Passou |
| `npx expo export --platform android` | Passou (só compila, não executa o app) |
| Site publicado no Chrome headless | Confirmou os problemas 2, 3, 4, 5 e 6 |
| Consultas à TheMealDB | Confirmaram os números do problema 5 |

## O que não foi testado

- **Celular ou emulador:** o problema 1 foi concluído pelo código e por uma simulação de renderização. Falta confirmar em um aparelho.
- **Fluxos com login:** nenhuma conta foi usada. Favoritos, avatar e criação de receitas foram avaliados pelo código.
- **Isolamento entre usuários:** `scripts/teste-isolamento.js` não foi executado porque cria contas no banco real. As regras de RLS foram apenas lidas.
- **Configuração do Supabase:** não foi possível ver as variáveis definidas em produção, inclusive `JWT_ADMIN_SECRET`.

## Ordem sugerida de correção

1. Corrigir o `VLibras.tsx` e testar em um celular.
2. Proteger o painel admin e confirmar o segredo JWT.
3. Corrigir `/perfil`, `/avaliacoes` e o link da tela Categorias.
4. Remover os dados fixos dos detalhes da receita.
5. Trocar `Alert.alert` por uma solução que funcione na web.
6. Corrigir favoritos, receitas próprias e os imports do `AuthContext`.
7. Atualizar o README, remover as credenciais e resolver os erros de `tsc` e lint.
