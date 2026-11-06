# Login biométrico — correção e funcionamento

Relatório de 06/11/2026, na branch `natalya/analise-requisitos`.

## Resumo

O login biométrico não funcionava em nenhum aparelho. Ele foi corrigido e passou em 29 verificações automáticas com o código real, mas **ainda precisa ser testado em um celular**, porque o sensor biométrico foi simulado.

## O que estava errado

| # | Problema | Efeito |
|---|---|---|
| 1 | A chave do SecureStore tinha `@` e `:`, caracteres proibidos. O erro era escondido por um `catch {}` vazio. | A credencial nunca foi salva. |
| 2 | A tela de login não tinha botão de biometria, embora a função existisse. | Não havia como usar o recurso. |
| 3 | O logout apagava a credencial e revogava a sessão no servidor. | A biometria não funcionaria depois de sair. |
| 4 | O token salvo não acompanhava as renovações do Supabase. | O token vencia, e seu reuso podia derrubar a sessão. |
| 5 | A credencial era gravada em todo login com senha, sem o usuário pedir. | A biometria seria ativada sem consentimento. |
| 6 | Qualquer erro apagava a credencial, até falta de internet. | Uma queda de rede desativava a biometria. |
| 7 | `VLibras.tsx` estava vazio. | O app deve fechar ao abrir no celular, único lugar onde a biometria existe. |

## O que foi feito

| Arquivo | Mudança |
|---|---|
| `src/servicos/biometria.ts` | Chave válida, credencial ligada ao usuário, ativação explícita, sincronização do token e motivos de falha. |
| `src/lib/supabase.ts` | Nova função `encerrarSessaoLocal`, que sai sem revogar a sessão no servidor. |
| `src/contexto/AuthContext.tsx` | Mantém a credencial atualizada e escolhe o tipo de logout. Não salva mais credencial no login. |
| `src/app/login.tsx` | Botão "Entrar com biometria" e mensagens para cada falha. |
| `src/app/biometria-config.tsx` | A chave agora ativa a biometria de verdade e mostra o estado do usuário logado. |
| `app.json` | Plugin `expo-local-authentication` e mensagem do Face ID em português. |
| `src/componentes/VLibras.tsx` | Componente vazio para Android e iOS (commit separado). |
| `scripts/test-biometria.mjs` | Teste automatizado do fluxo, com `npm run test:biometria`. |

## Como funciona agora

**Ativar**
1. O usuário entra com a senha e abre Perfil > Login Biométrico.
2. Ao ligar a chave, o app pede a biometria.
3. Se ela for aprovada, o app guarda o ID do usuário e o refresh token no SecureStore. A credencial fica só neste aparelho e não entra em backups.

**Usar o app**
- Sempre que o Supabase troca o token, a credencial é atualizada.
- Isso só acontece para o usuário que ativou a biometria. O login de outra pessoa no mesmo aparelho não altera a credencial.

**Sair**
- Com biometria ativa, o app apaga a sessão local e mantém a sessão válida no servidor.
- Sem biometria, o logout continua normal e revoga a sessão.

**Entrar com biometria**
1. A tela de login mostra o botão apenas se o aparelho tem biometria e há credencial salva.
2. Depois da biometria aprovada, o app renova a sessão com o token guardado e salva o novo token.
3. Se a biometria falhar, o usuário entra com a senha. O PIN do aparelho não é aceito.

**Quando algo dá errado**

| Situação | Comportamento |
|---|---|
| Biometria cancelada ou recusada | Continua deslogado, e a credencial é mantida. |
| Sem internet | Avisa o usuário e mantém a credencial. |
| Sessão revogada ou expirada no servidor | Remove a credencial e pede a senha. |

**Desativar:** ao desligar a chave, a credencial é apagada do aparelho.

## Como foi testado

`npm run test:biometria` executa o código real do app e o `supabase-js` real contra um servidor falso local, sem usar contas nem dados reais. Esse servidor troca o token a cada uso e revoga a sessão se um token antigo for reutilizado, como o Supabase. O SecureStore falso rejeita chaves inválidas como o pacote original.

| Verificação | Antes | Depois |
|---|---|---|
| `npm run test:biometria` | Não existia | 29 de 29 passaram |
| `npx tsc --noEmit` | 56 erros | 55 erros, nenhum novo |
| `npx expo lint` | 21 erros | 21 erros, nenhum novo |
| `npm run test:security` | Passou | Passou |
| Bundles web e Android | Passaram | Passaram |
| Bundle iOS | Não testado | Passou, antes dos últimos ajustes de estilo e tipo |
| Configuração nativa | Sem o plugin | Tem a permissão do Face ID e `USE_BIOMETRIC` |

Os testes cobrem ativar, recusar, renovar o token, sair e entrar repetidas vezes, ficar sem internet, trocar de usuário, sessão revogada e desativar.

## O que falta testar no celular

O teste automatizado não usa sensor real nem mostra as telas. Para validar no aparelho:

1. Use Android com impressão digital cadastrada. No iPhone, o Face ID exige um development build, porque não funciona no Expo Go.
2. Configure o `.env` e entre com uma conta.
3. Em Perfil > Login Biométrico, ligue a chave e confirme a biometria.
4. Toque em Sair e confira se o botão aparece na tela de login.
5. Entre com a biometria e confira se a conta abre.
6. Cancele o prompt e confira se o app continua deslogado.
7. Desligue a chave, saia e confira se o botão sumiu.

## Limitações conhecidas

- **Sessão ativa depois de sair:** com biometria ligada, a sessão continua válida no servidor. Isso é necessário para o recurso funcionar, e a tela de configuração avisa o usuário.
- **Desativar não revoga no servidor:** a credencial some do aparelho, mas a sessão só termina ao expirar ou com um logout global.
- **Proteção feita pelo app:** o token não usa a opção `requireAuthentication` do SecureStore porque ela pediria a biometria a cada renovação. Em um aparelho com root, a proteção é menor.
- **Falha de rede:** a tentativa pode levar cerca de 30 segundos. Depois, o `supabase-js` repete o mesmo erro por 60 segundos, e a tela orienta tentar de novo em 1 minuto ou usar a senha.
- **Aparelhos sem biometria forte:** quem só tem reconhecimento facial por câmera no Android verá o recurso como indisponível.
- **Uma credencial por aparelho:** se outro usuário ativar a biometria, a credencial anterior é substituída.
- **Web:** a biometria não está disponível, e o comportamento do site não muda.
