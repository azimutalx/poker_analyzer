# Poker Analyzer

Plataforma de análise de mãos de poker: importa o histórico exportado pela sala, calcula
as estatísticas do jogador, mostra ranges GTO e refaz a mão passo a passo para achar onde
a linha saiu do lugar.

É uma aplicação completa e não um exercício: tem autenticação, planos de assinatura,
painel administrativo, limites de uso por crédito e backup em S3.

## O que faz

**Importação e leitura de histórico**
Parser de PokerStars e 888poker, detecção automática do formato (cash, torneio, sit-and-go),
validação e processamento em lote dos arquivos de histórico.

**Estatísticas do jogador**
VPIP, PFR, 3-bet, fold to 3-bet, frequência de agressão, WTSD e W$SD, com recorte por
posição e evolução ao longo do tempo.

**Ranges GTO**
Matriz 13×13 interativa com mapa de calor por frequência, filtrada por posição e situação
(abertura, 3-bet, call).

**Replay da mão**
Reconstrução passo a passo, rua por rua, com as cartas e o tamanho do pote a cada ação.

**Sessões e leaks**
Agrupamento por sessão com resultado e duração; análise assistida por IA para apontar
padrões de erro recorrentes.

**Administração e cobrança**
Painel com MRR, churn e conversão; gestão de usuários e papéis; cupons e promoções;
transações com filtro por status e período e exportação em CSV; três planos (grátis,
Starter e Pro) com limites de crédito por plano.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end | React + TypeScript, Vite, Tailwind, componentes Radix UI |
| API | tRPC (contrato tipado ponta a ponta) |
| Banco | PostgreSQL com Drizzle ORM e migrações versionadas |
| Armazenamento | AWS S3 para os arquivos de histórico e backup |
| Testes | Vitest — 94 testes cobrindo mãos, créditos, transações, admin e exclusão de dados |

## Rodando

```bash
pnpm install
pnpm db:push      # aplica o schema no Postgres
pnpm dev
pnpm test
```

Variáveis necessárias (`server/_core/env.ts`): `DATABASE_URL`, `JWT_SECRET`,
`OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `VITE_APP_ID` e as credenciais do provedor de IA.

Aviso honesto: a autenticação e a chamada de IA falam com os serviços da plataforma em que
o projeto foi construído. Fora dela, essas duas peças precisam ser trocadas por
equivalentes (um provedor OAuth e uma API de LLM) antes de a aplicação subir inteira. O
resto — parser, estatísticas, banco, painel — não depende disso.

## Como foi construído

O projeto foi desenvolvido com o **Manus**, um gerador de aplicações por IA, num ciclo de
especificação e ajuste: cada etapa do histórico de commits é uma rodada de escopo definido,
implementado e testado. O que este repositório demonstra é a condução do produto — decidir
o que entra, em que ordem, com que regra de negócio e com que cobertura de teste — mais do
que a digitação linha a linha.

Está publicado como portfólio, com o histórico real preservado.

---

Feito por [Hemerson Abreu](https://github.com/azimutalx)
