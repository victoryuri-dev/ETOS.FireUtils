# Assistente normativo (IA) — Arquitetura

> Proposta de arquitetura para a IA que acompanha o projeto do início ao
> memorial: ajuda a preencher, audita decisões normativas, tira dúvidas e
> devolve à equipe os problemas que encontrar na própria plataforma.

## Índice

1. [Objetivo e papéis](#1-objetivo-e-papéis)
2. [Princípios](#2-princípios)
3. [Visão geral](#3-visão-geral)
4. [Contexto do projeto (o que a IA enxerga)](#4-contexto-do-projeto-o-que-a-ia-enxerga)
5. [Base normativa (o que a IA consulta)](#5-base-normativa-o-que-a-ia-consulta)
6. [Os três modos](#6-os-três-modos)
7. [Ferramentas (tool use)](#7-ferramentas-tool-use)
8. [Aprendizado com os usuários](#8-aprendizado-com-os-usuários)
9. [Feedback automático para a plataforma](#9-feedback-automático-para-a-plataforma)
10. [Modelo de dados (Supabase)](#10-modelo-de-dados-supabase)
11. [Edge Function `assistente`](#11-edge-function-assistente)
12. [Interface](#12-interface)
13. [Segurança, privacidade e custo](#13-segurança-privacidade-e-custo)
14. [Qualidade: avaliação contínua](#14-qualidade-avaliação-contínua)
15. [Fases de entrega](#15-fases-de-entrega)
16. [Decisões em aberto](#16-decisões-em-aberto)

---

## 1. Objetivo e papéis

Um único assistente, presente em todas as telas do projeto, com três papéis:

| Papel | Pergunta que responde | Saída |
|---|---|---|
| **Copiloto de preenchimento** | "O que vai neste campo? Qual a opção correta para o meu caso?" | Sugestões de valor **propostas**, que o usuário aceita ou não |
| **Auditor normativo** | "O projeto e o memorial estão coerentes com a norma e entre si?" | Achados com severidade, item normativo citado e link para o campo |
| **Consultor normativo** | "O que a NT 11 exige para escada em F-6?" | Resposta com citação literal do item da norma |

E um papel de bastidor: **relator de problemas da plataforma** — quando
percebe que o problema não é do projeto, mas do site (cálculo divergente da
norma, campo que falta, dado normativo desatualizado), registra um feedback
estruturado para a equipe.

## 2. Princípios

1. **O motor determinístico manda; a IA explica e confere.** Toda exigência
   que o código já calcula (`useMedidasObrigatorias`, `*_calc.js`,
   `camposObrigatorios`) é a fonte da verdade. A IA nunca recalcula por conta
   própria uma vazão, uma distância máxima ou uma exigência da Tabela 5/6 —
   ela lê o resultado do motor. Se discordar do motor, isso vira um
   [feedback para a plataforma](#9-feedback-automático-para-a-plataforma), não
   uma correção silenciosa no projeto.
2. **Sem citação, sem afirmação normativa.** Toda resposta normativa aponta
   NT/NBR + item. Sem trecho na base, a IA diz que não encontrou — não
   completa de memória. Isso segue a regra do `PRODUCT.md`: *não inventar
   cobertura normativa*.
3. **A IA propõe, o usuário decide.** Nada é gravado no estado do projeto sem
   um clique do usuário. Sugestões viram `dispatch` só depois de aceitas, e a
   decisão (aceita/recusada + justificativa) fica registrada.
4. **O responsável técnico é o engenheiro.** A IA é apoio; decisões de
   interpretação ficam com o RT e ficam documentadas como decisões dele.
5. **Aprender sem contaminar.** O que um usuário ensina vale primeiro para o
   projeto dele; só vira conhecimento global depois de curadoria humana.
6. **Por estado (UF).** Tudo — base, interpretações, regras — é indexado por
   `uf`, igual a `normas_dados` hoje.

## 3. Visão geral

```
┌──────────────────────────── Navegador (React) ────────────────────────────┐
│                                                                           │
│  ProjetoContext ──► montarContextoIA() ──┐     Painel do assistente       │
│  AuditoriaContext (campos/pendências)    │     (chat + achados + sugestões)│
│  useMedidasObrigatorias (porEstrutura)   │             ▲                  │
│  MEMORIAL_BUILDERS (texto do memorial)   │             │ SSE (streaming)  │
│                                          ▼             │                  │
│                          POST /functions/v1/assistente                    │
└──────────────────────────────────────────┬────────────────────────────────┘
                                           │ JWT do usuário
┌──────────────────────── Supabase Edge Function ───────────────────────────┐
│  1. valida sessão + licença (_shared/licenca.ts)                          │
│  2. limite de uso por usuário                                             │
│  3. monta prompt: sistema (fixo, cacheado) + base normativa da UF         │
│     (cacheada) + contexto do projeto + histórico                          │
│  4. loop de tool use com a API do Claude ─────────────► Claude API        │
│  5. grava conversa, achados, sugestões, feedbacks                         │
└──────────────────────────────────────────┬────────────────────────────────┘
                                           │ service_role (só no servidor)
┌──────────────────────────────── Postgres ─────────────────────────────────┐
│ normas_dados (já existe)      normas_trechos (texto das NTs, novo)        │
│ normas_interpretacoes (novo)  assistente_conversas / _mensagens (novo)    │
│ assistente_achados (novo)     assistente_decisoes (novo)                  │
│ feedbacks (já existe, ganha colunas)                                      │
└───────────────────────────────────────────────────────────────────────────┘
```

**Por que a lógica de cálculo fica no navegador:** todo o motor normativo
(`src/data/*_calc.js`, `auditoriaProjeto.js`, `useMedidasObrigatorias`) roda no
front e lê o cache de `normasRemote.js`. Duplicá-lo em Deno criaria a mesma
divergência que `normas_dados` foi criada para acabar (ver comentário da
migração `20260906120000`). Então o front monta um **instantâneo do projeto já
calculado** e envia junto com a pergunta; o servidor só orquestra a IA e a
base normativa.

## 4. Contexto do projeto (o que a IA enxerga)

Novo módulo `src/lib/assistente/contexto.js` com `montarContextoIA(state,
porEstrutura, auditoria)`. Reaproveita o que já existe:

| Bloco | Fonte atual | Para quê |
|---|---|---|
| Identificação mínima | `state.uf`, `tipoProjeto`, `situacao`, área total | Escolher a base e o tipo de análise |
| Estruturas e pavimentos | `state.estruturas`, `state.pavimentos` (divisão, CNAE, área, altura) | Classificação e gatilhos |
| Medidas exigidas × adotadas | `useMedidasObrigatorias().porEstrutura` + `sistemasPorEstrutura` + `motivosIsencaoPorEstrutura` | Auditar isenções e medidas faltantes |
| Pendências | `camposObrigatorios` / `camposOpcionais` (com `id`, `rota`, `contexto`) | Copiloto sabe o que falta e para onde levar |
| Dados de cada medida | recortes de `state.extintores`, `state.iluminacao`, `state.hidrantes`... | Auditoria técnica |
| Resultados do motor | saídas de `se_calc`, `extintores_calc`, `hidrantes_calc`... | A IA lê o resultado, não recalcula |
| Memorial | `MEMORIAL_BUILDERS[medida](state)` → `{ titulo, paragrafos }` | Encontrar contradição texto × dados |
| Tela atual | rota + `?audit=<campo.id>` | Contexto da dúvida |

Regras do instantâneo:

- **Sem dado pessoal.** Fica de fora CPF/CNPJ, nomes de proprietário e RT,
  telefones, e-mails, ART — o mesmo cuidado de "só o recorte necessário" da
  `site-sync`. A IA não precisa deles para nenhuma análise normativa.
- **IDs estáveis.** Cada item leva o mesmo `campo.id` usado por
  `camposObrigatorios` (`campoId(...)`), para que achados e sugestões apontem
  exatamente para um campo e reaproveitem a navegação `corrigir()` da
  `AuditoriaPage`.
- **Ordenação determinística** das chaves (o JSON igual gera o mesmo prefixo,
  o que ajuda o cache de prompt).

## 5. Base normativa (o que a IA consulta)

Duas camadas, ambas por UF:

### 5.1 Dados estruturados — `normas_dados` (já existe)

Tabelas, limiares, capacidades mínimas, distâncias — exatamente o que o motor
usa. A IA acessa pela ferramenta `consultar_norma(uf, sistema, caminho)`.
Garante que a IA e o motor leem **o mesmo número**.

### 5.2 Texto normativo — `normas_trechos` (novo)

Para explicar e citar, a IA precisa do texto, não só dos números. Cada NT/NBR é
quebrada **por item** (não por tamanho fixo): `5.1.2`, `Tabela 3`, `Anexo B`.

- Ingestão por script interno (`scripts/ingerir-norma`), a partir dos PDFs já
  listados em `links_normas.js`/`links_normas_por_estado`: extrai o texto,
  separa por item, revisa manualmente e grava com `service_role`.
- Busca: começar com **busca textual do Postgres em português**
  (`to_tsvector('portuguese', ...)`) + busca direta por número de item. O
  vocabulário normativo é muito específico (“Divisão F-6”, “item 5.1.2”), e a
  busca textual resolve bem a maior parte. Busca vetorial (pgvector) entra só
  se as avaliações mostrarem perguntas que a busca textual não encontra.
- Os trechos voltam para o Claude como **documentos com citações ativadas**
  (`citations: { enabled: true }`), e a resposta traz o trecho exato citado —
  é isso que a interface mostra como "ver na norma", com link para o PDF.
- Cada trecho tem `vigente_desde`/`revogado_em` e `fonte_url`. Quando uma NT é
  atualizada, os itens antigos ficam marcados, não apagados (projetos antigos
  continuam auditáveis contra a versão da época).

### 5.3 Interpretações curadas — `normas_interpretacoes` (novo)

Ver [§8](#8-aprendizado-com-os-usuários). São entendimentos aprovados pela
equipe (ex.: "para o CBMMA, mezanino até 1/3 da área não conta como
pavimento"), sempre ligados ao item normativo de origem e marcados como
*interpretação*, nunca como texto da norma.

## 6. Os três modos

### 6.1 Copiloto de preenchimento

- **Gatilho:** usuário foca/ajuda em um campo, ou pergunta "o que coloco
  aqui?". O front envia o `campo.id` atual.
- **Saída:** `propor_valor` (ver ferramentas) com `{ campo_id, valor,
  justificativa, citacao }`. A interface mostra um cartão "Sugestão da IA ·
  Aceitar / Ignorar".
- **Aplicação:** ao aceitar, o front traduz para o `dispatch` correspondente
  (mapa `campo.id → action` em `src/lib/assistente/aplicar.js`) e **valida com
  as mesmas funções de `auditoriaProjeto.js`** (`numeroPositivo`,
  `inteiroPositivo`...). Valor inválido não é aplicado.
- Casos típicos: escolher divisão a partir do CNAE/descrição; indicar o tipo
  de retorno de viatura; redigir a justificativa de isenção ou do recalque no
  passeio; sugerir capacidade extintora mínima já cadastrada na base.

### 6.2 Auditor normativo

Duas camadas, de propósito:

1. **Regras determinísticas (código, sem IA).** Novo
   `src/data/auditoriaNormativa.js`, irmão do `auditoriaProjeto.js`: checagens
   objetivas que hoje não existem (ex.: extintor com capacidade abaixo do
   mínimo de `TIPOS_PORTATIL`; medida exigida desativada sem motivo;
   `hidrantes.recalqueTipo` incompatível com a classificação). Rodam a cada
   alteração, de graça e na hora, e entram na `AuditoriaPage` como uma
   terceira lista: **"Achados normativos"**.
2. **Revisão com IA (sob demanda).** Botão "Auditar projeto" (e
   automaticamente antes de gerar o memorial). A IA recebe o instantâneo
   completo, os achados determinísticos e o texto do memorial, e procura o que
   regra fixa não pega:
   - memorial dizendo uma coisa e os dados outra (ex.: texto fala em central
     endereçável e o alarme está como convencional);
   - justificativas de isenção fracas ou sem base normativa;
   - escolhas de classificação plausíveis mas questionáveis (CNAE × divisão ×
     carga de incêndio);
   - riscos especiais descritos em texto livre que deveriam acionar medidas;
   - incoerência entre estruturas do mesmo projeto.

Cada achado é registrado com `registrar_achado`:

```json
{
  "campo_ids": ["est-1.alarme.central"],
  "severidade": "bloqueante | atencao | sugestao",
  "titulo": "Memorial cita central endereçável, mas o sistema está como convencional",
  "explicacao": "...",
  "citacao": { "norma": "NT 19", "item": "5.3.1" },
  "proposta": { "campo_id": "est-1.alarme.central", "valor": "enderecavel" }
}
```

O usuário pode **corrigir** (vai ao campo), **aceitar a proposta** ou
**descartar com justificativa** ("decisão do RT: ..."). Achados descartados
não reaparecem na próxima auditoria enquanto os dados envolvidos não mudarem —
a IA recebe a lista de decisões já tomadas (`assistente_decisoes`).

### 6.3 Consultor normativo

Chat livre, com o projeto como contexto. Fluxo: a IA busca trechos
(`buscar_trechos`), lê dados estruturados (`consultar_norma`) e responde com
citações. Se a pergunta for sobre outro estado ou norma fora da base, diz
claramente que não tem a norma cadastrada.

## 7. Ferramentas (tool use)

Todas definidas com `strict: true` e `input_schema` com
`additionalProperties: false`. Executadas na Edge Function.

| Ferramenta | Tipo | O que faz |
|---|---|---|
| `consultar_norma(uf, sistema, caminho?)` | leitura | Lê `normas_dados` (o mesmo JSON do motor) |
| `buscar_trechos(uf, consulta, norma?, item?)` | leitura | Busca em `normas_trechos`; devolve documentos com citações |
| `buscar_interpretacoes(uf, tema)` | leitura | Lê `normas_interpretacoes` aprovadas |
| `ler_projeto(secao)` | leitura | Devolve uma parte do instantâneo (evita mandar tudo sempre) |
| `propor_valor(campo_id, valor, justificativa, citacao)` | proposta | Grava sugestão pendente; a UI pede confirmação |
| `registrar_achado(...)` | proposta | Grava achado de auditoria |
| `registrar_feedback_plataforma(...)` | escrita interna | Ver [§9](#9-feedback-automático-para-a-plataforma) |
| `sugerir_interpretacao(...)` | escrita interna | Candidata a conhecimento global, vai para curadoria |

Nenhuma ferramenta escreve em `projetos.dados` nem em `normas_dados`.

## 8. Aprendizado com os usuários

Sem treino de modelo. "Aprender" aqui é **memória organizada em três níveis**,
todos consultados pela IA nas próximas conversas:

| Nível | Tabela | Quem escreve | Alcance |
|---|---|---|---|
| Projeto | `assistente_decisoes` | Usuário (ao aceitar/descartar achado ou sugestão, com justificativa) | Só aquele projeto |
| Usuário/escritório | `assistente_decisoes` com `escopo = 'usuario'` | Usuário marca "usar nos meus próximos projetos" | Projetos daquele usuário |
| Global (por UF) | `normas_interpretacoes` | IA **sugere**, equipe **aprova** | Todos os usuários |

Fluxo do nível global:

1. Em uma conversa, surge um entendimento novo (ex.: posição do CBMMA em
   parecer técnico, citado pelo usuário).
2. A IA chama `sugerir_interpretacao` com o item normativo, o entendimento e a
   evidência (trecho da conversa, documento citado).
3. Fica com `situacao = 'pendente'`. Um admin revisa (tela interna ou painel do
   Supabase) e aprova, ajusta ou rejeita.
4. Aprovada, passa a ser retornada por `buscar_interpretacoes` — sempre
   apresentada como interpretação, com a origem.

Sinais adicionais que alimentam a melhoria:

- 👍/👎 em cada resposta e em cada achado (`assistente_mensagens.avaliacao`).
- Taxa de aceitação de sugestões e de descarte de achados, por tipo — achado
  descartado com frequência é sinal de regra ruim ou prompt ruim.
- Respostas com 👎 viram casos do conjunto de avaliação ([§14](#14-qualidade-avaliação-contínua)).

## 9. Feedback automático para a plataforma

A tabela `feedbacks` já existe e é alimentada pelo `FeedbackWidget`. A IA passa
a escrever nela também, com estrutura:

| Categoria | Exemplo |
|---|---|
| `calculo_divergente` | Motor exige X, mas o item 5.1.2 da NT 21 diz Y |
| `dado_normativo` | Valor em `normas_dados` difere do texto vigente da NT |
| `campo_faltante` | Usuário precisou descrever em texto livre algo que deveria ser campo |
| `memorial` | Texto gerado pelo builder sai gramaticalmente ou tecnicamente errado |
| `usabilidade` | Usuário pediu várias vezes onde fica um campo |
| `erro` | Ferramenta falhou, dado inconsistente no estado |

Cuidados:

- **Deduplicação:** cada feedback da IA tem `fingerprint` (hash de categoria +
  sistema + item normativo + campo). Repetição incrementa `ocorrencias` em vez
  de criar linha nova — a equipe vê "aconteceu em 14 projetos".
- **Evidência anexada** em `contexto jsonb`: campo, valor, saída do motor,
  trecho normativo citado — o suficiente para reproduzir, sem dado pessoal.
- **Nunca corrige sozinha.** Correções em `normas_dados` continuam restritas
  ao `service_role` e à revisão humana.
- Opcional na fase 4: resumo semanal dos feedbacks (Batch API, mais barato,
  sem pressa) agrupando por tema para a equipe priorizar.

## 10. Modelo de dados (Supabase)

Esboço das migrações (nomes seguem o padrão `AAAAMMDDHHMMSS_*.sql`):

```sql
-- Texto normativo por item, para busca e citação
create table public.normas_trechos (
  id            uuid primary key default gen_random_uuid(),
  uf            text not null,
  norma         text not null,          -- 'NT 21', 'NBR 12693'
  item          text not null,          -- '5.1.2', 'Tabela 3'
  titulo        text,
  texto         text not null,
  sistema       text,                   -- liga a normas_dados.sistema
  fonte_url     text,
  vigente_desde date,
  revogado_em   date,
  busca         tsvector generated always as (to_tsvector('portuguese', coalesce(titulo,'') || ' ' || texto)) stored
);
create index on public.normas_trechos using gin (busca);
create index on public.normas_trechos (uf, norma, item);
-- leitura pública (como normas_dados); escrita só service_role

-- Interpretações curadas
create table public.normas_interpretacoes (
  id          uuid primary key default gen_random_uuid(),
  uf          text not null,
  trecho_id   uuid references public.normas_trechos(id),
  tema        text not null,
  entendimento text not null,
  evidencia   jsonb not null default '{}',
  situacao    text not null default 'pendente' check (situacao in ('pendente','aprovada','rejeitada')),
  sugerida_por uuid references auth.users(id) on delete set null,
  revisada_por uuid references auth.users(id) on delete set null,
  criado_em   timestamptz not null default now()
);
-- usuários leem só 'aprovada'; escrita via Edge Function

-- Conversas e mensagens
create table public.assistente_conversas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  projeto_id  text,
  modo        text not null check (modo in ('copiloto','auditoria','consulta')),
  criado_em   timestamptz not null default now()
);
create table public.assistente_mensagens (
  id           uuid primary key default gen_random_uuid(),
  conversa_id  uuid not null references public.assistente_conversas(id) on delete cascade,
  papel        text not null check (papel in ('user','assistant')),
  conteudo     jsonb not null,           -- blocos completos (inclui tool_use/tool_result)
  avaliacao    smallint check (avaliacao in (-1, 1)),
  tokens       jsonb,                    -- usage devolvido pela API, para custo
  criado_em    timestamptz not null default now()
);

-- Achados de auditoria e sugestões de preenchimento
create table public.assistente_achados (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  projeto_id  text not null,
  origem      text not null check (origem in ('regra','ia')),
  tipo        text not null check (tipo in ('achado','sugestao')),
  campo_ids   text[] not null default '{}',
  severidade  text check (severidade in ('bloqueante','atencao','sugestao')),
  conteudo    jsonb not null,            -- titulo, explicacao, citacao, proposta
  assinatura  text not null,             -- hash dos valores envolvidos: muda o dado, reabre
  situacao    text not null default 'aberto' check (situacao in ('aberto','aceito','corrigido','descartado')),
  criado_em   timestamptz not null default now()
);

-- Decisões do usuário (memória de projeto/usuário)
create table public.assistente_decisoes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  projeto_id  text,                      -- null quando escopo = 'usuario'
  escopo      text not null check (escopo in ('projeto','usuario')),
  achado_id   uuid references public.assistente_achados(id) on delete set null,
  decisao     text not null,
  justificativa text,
  criado_em   timestamptz not null default now()
);

-- feedbacks ganha estrutura para a IA
alter table public.feedbacks
  add column origem      text not null default 'usuario' check (origem in ('usuario','assistente')),
  add column categoria   text,
  add column contexto    jsonb not null default '{}',
  add column fingerprint text,
  add column ocorrencias integer not null default 1;
create unique index on public.feedbacks (fingerprint) where fingerprint is not null;
```

RLS: todas as tabelas `assistente_*` com política `auth.uid() = user_id`
(leitura e atualização de `situacao`/`avaliacao`); inserções de conteúdo da IA
só pela Edge Function. `feedbacks` continua sem leitura pela interface.

## 11. Edge Function `assistente`

Nova `supabase/functions/assistente/index.ts`, no mesmo padrão de
`site-sync`/`revit-sync` (CORS, `json()`, `_shared/licenca.ts`).

**Entrada (POST):**

```json
{
  "modo": "copiloto | auditoria | consulta",
  "conversa_id": "uuid | null",
  "projeto_id": "...",
  "contexto": { /* montarContextoIA() */ },
  "campo_atual": "est-1.alarme.central",
  "mensagem": "texto do usuário"
}
```

**Passos:**

1. Valida o JWT (`Authorization`) e a licença (`donoTemLicenca`, módulo
   `assistente` ou `pro`).
2. Confere o limite diário do usuário (contador em tabela, como
   `atividade_diaria`).
3. Monta a requisição para o Claude, **na ordem que maximiza o cache**:
   - `tools` (lista fixa, sempre na mesma ordem);
   - `system` fixo (papéis, princípios, formato de citação) — `cache_control`;
   - bloco da base normativa da UF (dados de `normas_dados` relevantes) —
     `cache_control` (muda só quando a norma muda);
   - histórico da conversa;
   - por último, o instantâneo do projeto e a mensagem (o que muda a cada
     chamada).
4. Loop de ferramentas com o SDK oficial `@anthropic-ai/sdk` (via `npm:` no
   Deno), em **streaming**, repassando o texto ao navegador por SSE.
5. Persiste mensagens (blocos completos), achados, sugestões e feedbacks.

**Configuração do modelo:**

- Modelo: `claude-opus-5-5`, com pensamento adaptativo (padrão do modelo).
  `output_config.effort` por modo: `low` no copiloto (resposta rápida),
  `medium` na consulta, `high` na auditoria completa.
- `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`) para que uma
  recusa indevida dos classificadores de segurança não deixe o usuário sem
  resposta; tratar `stop_reason: "refusal"` mesmo assim.
- Citações nativas na consulta (`citations: { enabled: true }` nos documentos
  de `buscar_trechos`). Na auditoria, a saída estruturada vem pelas
  ferramentas `registrar_achado`/`propor_valor` com `strict: true` (citações e
  `output_config.format` não podem ser usados juntos — por isso a estrutura vai
  pelas ferramentas).
- Conversas longas: compactação no servidor (beta `compact-2026-01-12`),
  guardando os blocos de compactação que a API devolve.
- `ANTHROPIC_API_KEY` como *secret* da função — nunca no front.

## 12. Interface

- **Painel lateral do assistente** em `src/components/assistente/`, aberto a
  partir do `ProjectAside`/`Header` em qualquer rota de projeto. Abas: *Chat*,
  *Achados*, *Sugestões*. Tema e tokens do `DESIGN.md`; teclado e
  `prefers-reduced-motion` como no `FeedbackWidget`.
- **Ajuda contextual no campo:** ícone ao lado de `InfoTip`/`Obrigatorio` que
  abre o painel já com `campo_atual` preenchido.
- **Achados na `AuditoriaPage`:** terceira coluna "Achados normativos",
  agrupada por `secao` e usando o mesmo `corrigir(campo)` — clicar leva ao
  campo com `?audit=<id>`, que já destaca o campo hoje.
- **Antes do memorial:** em `MemorialDescritivoPage`, aviso "N achados abertos"
  com atalho para revisão. Não bloqueia — o RT decide.
- **Citação clicável:** cada citação mostra o trecho e o link do PDF
  (`LinkNorma` / `links_normas`).
- `src/context/AssistenteContext.jsx` guarda conversa atual, achados e
  sugestões, no mesmo padrão dos outros contexts.

## 13. Segurança, privacidade e custo

- **Chave da API só no servidor.** O front fala apenas com a Edge Function.
- **Dado pessoal fora do prompt** (ver §4). Logs de mensagens guardam só o que
  foi enviado — portanto também sem dado pessoal.
- **Conteúdo do usuário é dado, não instrução.** Textos livres do projeto
  (descrições, observações) entram marcados como conteúdo do projeto; o prompt
  de sistema deixa claro que instruções dentro deles não mudam as regras.
- **Licença:** módulo próprio (`assistente`) em `licencas`, ou incluído no
  `pro`; checado na função como as outras.
- **Custo sob controle:**
  - regras determinísticas cobrem o óbvio sem chamar a IA;
  - cache de prompt no sistema + base normativa (conferir
    `usage.cache_read_input_tokens` nos logs);
  - `ler_projeto(secao)` em vez de mandar o projeto inteiro em toda pergunta
    do copiloto;
  - limite diário por usuário; auditoria completa com limite próprio;
  - `assistente_mensagens.tokens` permite medir custo por projeto e por modo.

## 14. Qualidade: avaliação contínua

Uma IA normativa sem medição vira risco. Montar desde a fase 1:

- **Conjunto de perguntas normativas** com resposta e item esperados (começar
  com ~50, por NT do MA), escritas/revisadas por engenheiro.
- **Projetos de teste com erros plantados** (ex.: memorial contradizendo os
  dados, isenção sem justificativa) — mede se a auditoria acha cada um e
  quantos falsos positivos gera.
- Critérios: item citado correto; não afirmar sem citação; achado plantado
  encontrado; sugestão aplicável e válida.
- Rodar antes de cada mudança de prompt, ferramenta ou modelo; respostas com
  👎 em produção entram no conjunto.
- Ficam em `tests/assistente/` junto dos testes atuais.

## 15. Fases de entrega

| Fase | Entrega | Depende de |
|---|---|---|
| **0 — Base** | `normas_trechos` populada para o MA (NTs já em `links_normas.js`); `auditoriaNormativa.js` com as primeiras regras determinísticas; conjunto de avaliação inicial | — |
| **1 — Consultor** | Edge Function `assistente` (modo consulta), painel com chat, citações clicáveis, `assistente_conversas/_mensagens`, limite de uso | Fase 0 |
| **2 — Auditor** | `montarContextoIA`, auditoria com IA, `assistente_achados`, coluna na `AuditoriaPage`, aviso no memorial, decisões do RT | Fase 1 |
| **3 — Copiloto** | Ajuda por campo, `propor_valor` + `aplicar.js` com validação, cartões de sugestão | Fase 2 |
| **4 — Aprendizado e feedback** | `assistente_decisoes` com escopo usuário, `normas_interpretacoes` + curadoria, feedback automático com deduplicação, resumo periódico | Fase 2 |

Cada fase é útil sozinha: a fase 1 já entrega valor (dúvidas com citação) sem
mexer no estado do projeto.

## 16. Decisões em aberto

1. **Licenciamento:** o assistente é módulo próprio ou parte do PRO? Qual o
   limite diário por plano?
2. **Fonte do texto normativo:** podemos armazenar o texto integral das NTs
   (publicadas pelo CBMMA) ou só trechos + link? E as NBRs (texto da ABNT, com
   direitos autorais) — provavelmente só referência e resumo próprio.
3. **Curadoria:** quem aprova `normas_interpretacoes` — a equipe ETOS, ou
   também escritórios parceiros, por UF?
4. **Auditoria automática:** só sob demanda e antes do memorial, ou também a
   cada etapa concluída (mais útil, mais caro)?
5. **Plugin Revit:** o mesmo assistente deve responder dentro do Revit? Se
   sim, a função já nasce aceitando o instantâneo vindo do plugin.

---

*Proposta inicial — Outubro 2026*
