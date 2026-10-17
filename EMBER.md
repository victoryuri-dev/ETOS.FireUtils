# Ember — Arquitetura do assistente do FireUtils

> Ember é a IA que acompanha o projeto do início ao memorial: ajuda a
> preencher o formulário, tira dúvidas normativas, ajuda a escrever os textos
> do projeto e audita o projeto quando o usuário pede.

## Índice

1. [Papéis](#1-papéis)
2. [Princípios](#2-princípios)
3. [Visão geral](#3-visão-geral)
4. [Contexto do projeto (o que o Ember enxerga)](#4-contexto-do-projeto-o-que-o-ember-enxerga)
5. [Base normativa (o que o Ember consulta)](#5-base-normativa-o-que-o-ember-consulta)
6. [Os quatro modos](#6-os-quatro-modos)
7. [Ferramentas (tool use)](#7-ferramentas-tool-use)
8. [Memória de decisões](#8-memória-de-decisões)
9. [Feedback para a plataforma](#9-feedback-para-a-plataforma)
10. [Modelo de dados (Supabase)](#10-modelo-de-dados-supabase)
11. [Edge Function `ember`](#11-edge-function-ember)
12. [Interface](#12-interface)
13. [Segurança, privacidade e custo](#13-segurança-privacidade-e-custo)
14. [Qualidade: avaliação contínua](#14-qualidade-avaliação-contínua)
15. [Fases de entrega](#15-fases-de-entrega)
16. [Decisões](#16-decisões)
17. [Futuro](#17-futuro)

---

## 1. Papéis

| Papel | Pergunta que responde | Saída |
|---|---|---|
| **Copiloto do formulário** | "O que vai neste campo? Qual a opção certa para o meu caso?" | Sugestão de valor que o usuário aceita ou não |
| **Consultor normativo** | "O que a NT 11 exige para escada em F-6?" | Resposta com citação literal do item da NT |
| **Auxiliar de escrita** | "Me ajuda a escrever a justificativa desta isenção." | Rascunho de texto para um campo livre, que o usuário revisa e aceita |
| **Auditor do projeto** | "Analisa meu projeto." | Achados com severidade, item da NT e link para o campo |

De bastidor, o Ember também **relata problemas da plataforma** que perceber
durante o uso (cálculo divergente da NT, campo que falta, texto do memorial
saindo errado) — ver [§9](#9-feedback-para-a-plataforma).

## 2. Princípios

1. **O motor de cálculo manda; o Ember explica e confere.** Toda exigência
   que o código já calcula (`useMedidasObrigatorias`, `*_calc.js`,
   `camposObrigatorios`) é a fonte da verdade. O Ember nunca recalcula por
   conta própria uma vazão, uma distância máxima ou uma exigência da tabela de
   medidas — ele lê o resultado do motor. Se discordar do motor, isso vira um
   feedback para a equipe, não uma correção silenciosa no projeto.
2. **Sem citação, sem afirmação normativa.** Toda resposta normativa aponta
   NT + item. Sem trecho na base, o Ember diz que não encontrou — não completa
   de memória. Segue a regra do `PRODUCT.md`: *não inventar cobertura
   normativa*.
3. **O Ember propõe, o usuário decide.** Nada é gravado no projeto sem um
   clique do usuário: valores sugeridos e textos escritos viram `dispatch` só
   depois de aceitos.
4. **O responsável técnico é o engenheiro.** O Ember é apoio; decisões de
   interpretação ficam com o RT e ficam registradas como decisões dele.
5. **Por estado (UF).** Base normativa e regras são indexadas por `uf`, igual
   a `normas_dados` hoje.

## 3. Visão geral

```
┌──────────────────────────── Navegador (React) ────────────────────────────┐
│                                                                           │
│  ProjetoContext ──► montarContextoEmber() ─┐    Painel do Ember            │
│  AuditoriaContext (campos/pendências)      │    (chat · achados · sugestões)│
│  useMedidasObrigatorias (porEstrutura)     │            ▲                  │
│  MEMORIAL_BUILDERS (texto do memorial)     │            │ SSE (streaming)  │
│                                            ▼            │                  │
│                            POST /functions/v1/ember                        │
└────────────────────────────────────────────┬──────────────────────────────┘
                                             │ JWT do usuário
┌──────────────────────── Supabase Edge Function ───────────────────────────┐
│  1. valida sessão + licença PRO (_shared/licenca.ts)                      │
│  2. monta prompt: sistema (fixo, cacheado) + base normativa da UF         │
│     (cacheada) + contexto do projeto + histórico                          │
│  3. loop de ferramentas com a API do Claude ──────────► Claude API        │
│  4. grava conversa, achados, sugestões, feedbacks                         │
└────────────────────────────────────────────┬──────────────────────────────┘
                                             │ service_role (só no servidor)
┌──────────────────────────────── Postgres ─────────────────────────────────┐
│ normas_dados (já existe)        normas_documentos / normas_trechos (novo) │
│ ember_conversas / _mensagens    ember_achados   ember_decisoes (novo)     │
│ feedbacks (já existe, ganha colunas)                                      │
└───────────────────────────────────────────────────────────────────────────┘
```

**Por que o cálculo fica no navegador:** todo o motor normativo
(`src/data/*_calc.js`, `auditoriaProjeto.js`, `useMedidasObrigatorias`) roda no
front e lê o cache de `normasRemote.js`. Duplicá-lo em Deno criaria a mesma
divergência que `normas_dados` foi criada para acabar (ver comentário da
migração `20260906120000`). Então o front monta um **instantâneo do projeto já
calculado** e envia junto com a pergunta; o servidor só orquestra a IA e a
base normativa.

## 4. Contexto do projeto (o que o Ember enxerga)

Novo módulo `src/lib/ember/contexto.js` com `montarContextoEmber(state,
porEstrutura, auditoria)`. Reaproveita o que já existe:

| Bloco | Fonte atual | Para quê |
|---|---|---|
| Identificação mínima | `state.uf`, `tipoProjeto`, `situacao`, área total | Escolher a base e o tipo de análise |
| Estruturas e pavimentos | `state.estruturas`, `state.pavimentos` (divisão, CNAE, área, altura) | Classificação e gatilhos |
| Medidas exigidas × adotadas | `useMedidasObrigatorias().porEstrutura` + `sistemasPorEstrutura` + `motivosIsencaoPorEstrutura` | Auditar isenções e medidas faltantes |
| Pendências | `camposObrigatorios` / `camposOpcionais` (com `id`, `rota`, `contexto`) | Saber o que falta e para onde levar |
| Dados de cada medida | recortes de `state.extintores`, `state.iluminacao`, `state.hidrantes`... | Auditoria técnica |
| Resultados do motor | saídas de `se_calc`, `extintores_calc`, `hidrantes_calc`... | O Ember lê o resultado, não recalcula |
| Memorial | `MEMORIAL_BUILDERS[medida](state)` → `{ titulo, paragrafos }` | Encontrar contradição texto × dados; contexto para a escrita |
| Tela atual | rota + `?audit=<campo.id>` | Contexto da dúvida |

Regras do instantâneo:

- **Sem dado pessoal.** Ficam de fora CPF/CNPJ, nomes de proprietário e RT,
  telefones, e-mails, ART — o mesmo cuidado de "só o recorte necessário" da
  `site-sync`. Nenhuma análise normativa precisa deles.
- **IDs estáveis.** Cada item leva o mesmo `campo.id` de `camposObrigatorios`
  (`campoId(...)`), para que achados e sugestões apontem para um campo exato e
  reaproveitem a navegação `corrigir()` da `AuditoriaPage`.
- **Ordenação determinística** das chaves (mesmo JSON → mesmo prefixo, o que
  ajuda o cache de prompt).

## 5. Base normativa (o que o Ember consulta)

### 5.1 Dados estruturados — `normas_dados` (já existe)

Tabelas, limiares, capacidades mínimas, distâncias — exatamente o que o motor
usa. O Ember acessa pela ferramenta `consultar_norma(uf, sistema, caminho)`, o
que garante que ele e o motor leem **o mesmo número**.

### 5.2 Texto das NTs — `normas_documentos` + `normas_trechos` (novo)

Para explicar e citar, o Ember precisa do texto, não só dos números. A base
textual recebe **todas as NTs do estado, na íntegra** — inclusive as que não
têm nenhum dado em `normas_dados` por não alimentarem dimensionamento nem
memorial (ex.: controle de fumaça, GLP, eventos temporários, procedimentos
administrativos). `normas_dados` continua sendo só o recorte que o motor usa.

- `normas_documentos`: uma linha por NT (número, título, URL do PDF oficial,
  vigência). Permite ao Ember saber quais normas existem para a UF.
- `normas_trechos`: cada NT quebrada **por item** (`5.1.2`, `Tabela 3`,
  `Anexo B`), não por tamanho fixo.
- Ingestão por script interno (`scripts/ingerir-norma`) a partir dos PDFs
  oficiais do Corpo de Bombeiros (portal em `links_normas.js` /
  `links_normas_por_estado`): extrai o texto, separa por item, revisa
  manualmente e grava com `service_role`.
- Busca: **busca textual do Postgres em português**
  (`to_tsvector('portuguese', ...)`) + busca direta por número de item. O
  vocabulário normativo é muito específico ("Divisão F-6", "item 5.1.2") e a
  busca textual resolve bem. Busca vetorial (pgvector) entra só se as
  avaliações mostrarem perguntas que a busca textual não encontra.
- Os trechos voltam para o Claude como **documentos com citações ativadas**
  (`citations: { enabled: true }`): a resposta traz o trecho exato citado, que
  a interface mostra como "ver na norma", com link para o PDF.
- Cada trecho tem `vigente_desde`/`revogado_em`. Quando uma NT é atualizada,
  os itens antigos ficam marcados, não apagados.

## 6. Os quatro modos

### 6.1 Copiloto do formulário

- **Gatilho:** o usuário clica na ajuda do Ember ao lado de um campo, ou
  pergunta "o que coloco aqui?". O front envia o `campo.id` atual.
- **Saída:** `propor_valor` com `{ campo_id, valor, justificativa, citacao }`.
  A interface mostra um cartão "Sugestão do Ember · Aceitar / Ignorar".
- **Aplicação:** ao aceitar, o front traduz para o `dispatch` correspondente
  (mapa `campo.id → action` em `src/lib/ember/aplicar.js`) e **valida com as
  mesmas funções de `auditoriaProjeto.js`** (`numeroPositivo`,
  `inteiroPositivo`...). Valor inválido não é aplicado.
- Casos típicos: escolher a divisão a partir do CNAE/descrição da atividade;
  indicar o tipo de retorno de viatura; sugerir capacidade extintora mínima já
  cadastrada na base; explicar o que um campo significa e de onde vem a
  exigência.

### 6.2 Consultor normativo

Chat livre, com o projeto como contexto. O Ember busca trechos
(`buscar_trechos`) em qualquer NT do estado — não só nas que o site
dimensiona —, lê dados estruturados (`consultar_norma`) quando a dúvida
envolve um valor que o motor usa, e responde com citações. Pergunta sobre
outro estado ou norma fora da base: diz claramente que não tem a norma
cadastrada.

### 6.3 Auxiliar de escrita

O memorial é gerado a partir dos dados (`MEMORIAL_BUILDERS`) e não é editado
direto — os textos livres que o usuário escreve no formulário é que entram
nele (por isso `whitespace-pre-line` em `MemorialDescritivoPage`). O Ember
ajuda exatamente nesses campos:

| Campo | Onde está |
|---|---|
| Motivo da isenção de medida | Step 6 (`motivosIsencaoPorEstrutura`) |
| Descrição de risco especial | Step 6 (`riscosOutrosDescPorEstrutura`) |
| Observações complementares | Step 2 (`condicoesAtuais`) |
| Observações do RT | Segurança estrutural, Compartimentação |
| Justificativa do recalque no passeio | Hidrantes (`recalqueJustificativaPasseio`) |
| Localização da detecção em entreforros | Detecção |
| Textos do gerenciamento de risco | Gerenciamento de risco |

Como funciona:

- Botão **"Escrever com Ember"** ao lado de cada um desses campos. O usuário
  pode dar uma instrução curta ("o galpão tem sprinklers da seguradora") ou
  pedir só "redija".
- O Ember escreve com base nos dados do projeto, nos itens da NT aplicáveis e
  no trecho do memorial onde o texto vai entrar — para o parágrafo final ficar
  coeso. Tom técnico, impessoal, em português, sem inventar dado que o projeto
  não tem (se faltar informação, ele pergunta).
- Saída: `propor_texto` com `{ campo_id, texto, citacoes }`. Aparece como
  rascunho ao lado do campo: *Usar texto / Editar / Descartar*. Se o campo já
  tiver texto, o Ember propõe uma revisão e mostra a diferença.
- Também revisa texto já escrito pelo usuário: clareza, termos técnicos,
  coerência com os dados.

### 6.4 Auditor do projeto (sob demanda)

A análise **só roda quando o usuário pede** — pelo chat ("analisa o
projeto", "revisa a parte de alarme") ou pelo botão "Pedir análise do Ember".
Pode ser do projeto inteiro ou de uma medida/estrutura. Duas camadas:

1. **Regras determinísticas (código, sem IA).** Novo
   `src/data/auditoriaNormativa.js`, irmão do `auditoriaProjeto.js`: checagens
   objetivas que hoje não existem (ex.: extintor com capacidade abaixo do
   mínimo de `TIPOS_PORTATIL`; medida exigida desativada sem motivo;
   recalque incompatível com a classificação). Rodam a cada alteração, de
   graça, e entram na `AuditoriaPage` como uma terceira lista: **"Achados
   normativos"**.
2. **Revisão com IA.** O Ember recebe o instantâneo completo, os achados
   determinísticos e o texto do memorial, e procura o que regra fixa não pega:
   - memorial dizendo uma coisa e os dados outra;
   - justificativas de isenção fracas ou sem base normativa;
   - classificação plausível mas questionável (CNAE × divisão × carga);
   - risco especial descrito em texto livre que deveria acionar medidas;
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
não reaparecem na próxima análise enquanto os dados envolvidos não mudarem.

## 7. Ferramentas (tool use)

Todas com `strict: true` e `input_schema` com `additionalProperties: false`.
Executadas na Edge Function.

| Ferramenta | Tipo | O que faz |
|---|---|---|
| `consultar_norma(uf, sistema, caminho?)` | leitura | Lê `normas_dados` (o mesmo JSON do motor) |
| `listar_normas(uf)` | leitura | Lê `normas_documentos` |
| `buscar_trechos(uf, consulta, norma?, item?)` | leitura | Busca em `normas_trechos`; devolve documentos com citações |
| `ler_projeto(secao)` | leitura | Devolve uma parte do instantâneo (evita mandar tudo sempre) |
| `propor_valor(campo_id, valor, justificativa, citacao)` | proposta | Sugestão de valor; a UI pede confirmação |
| `propor_texto(campo_id, texto, citacoes)` | proposta | Rascunho para campo livre; a UI pede confirmação |
| `registrar_achado(...)` | proposta | Achado de auditoria |
| `registrar_feedback_plataforma(...)` | escrita interna | Ver [§9](#9-feedback-para-a-plataforma) |

Nenhuma ferramenta escreve em `projetos.dados` nem em `normas_dados`.

## 8. Memória de decisões

Sem treino de modelo. O Ember "aprende" com o usuário guardando as decisões
dele e consultando-as nas próximas conversas:

| Nível | Tabela | Quem escreve | Alcance |
|---|---|---|---|
| Projeto | `ember_decisoes` | Usuário, ao aceitar/descartar achado ou sugestão, com justificativa | Só aquele projeto |
| Usuário | `ember_decisoes` com `escopo = 'usuario'` | Usuário marca "usar nos meus próximos projetos" | Projetos daquele usuário |

Exemplo: o RT descarta um achado dizendo "o CBMMA aceitou essa solução no
projeto X". No próximo projeto parecido, o Ember lembra e menciona a decisão
anterior — sem tratar como regra.

Sinais para melhorar o Ember:

- 👍/👎 em cada resposta, sugestão e achado (`ember_mensagens.avaliacao`).
- Taxa de aceitação de sugestões e textos, e de descarte de achados, por tipo
  — achado descartado com frequência é sinal de regra ou prompt ruim.
- Respostas com 👎 viram casos do conjunto de avaliação ([§14](#14-qualidade-avaliação-contínua)).

## 9. Feedback para a plataforma

A tabela `feedbacks` já existe e é alimentada pelo `FeedbackWidget`. O Ember
passa a escrever nela também, com estrutura:

| Categoria | Exemplo |
|---|---|
| `calculo_divergente` | Motor exige X, mas o item 5.1.2 da NT 21 diz Y |
| `dado_normativo` | Valor em `normas_dados` difere do texto vigente da NT |
| `campo_faltante` | Usuário precisou descrever em texto livre algo que deveria ser campo |
| `memorial` | Texto gerado pelo builder sai errado |
| `usabilidade` | Usuário perguntou várias vezes onde fica um campo |
| `erro` | Ferramenta falhou, dado inconsistente no estado |

- **Deduplicação:** cada feedback do Ember tem `fingerprint` (hash de
  categoria + sistema + item + campo). Repetição incrementa `ocorrencias` em
  vez de criar linha nova — a equipe vê "aconteceu em 14 projetos".
- **Evidência** em `contexto jsonb` (campo, valor, saída do motor, trecho da
  NT), sem dado pessoal.
- **Nunca corrige sozinho.** `normas_dados` continua restrita ao
  `service_role` e à revisão humana.

## 10. Modelo de dados (Supabase)

```sql
-- Índice das NTs de cada estado (todas, não só as do motor)
create table public.normas_documentos (
  uf            text not null,
  norma         text not null,          -- 'NT 21'
  titulo        text not null,
  fonte_url     text not null,          -- PDF oficial do Corpo de Bombeiros
  vigente_desde date,
  primary key (uf, norma)
);

-- Texto das NTs por item, para busca e citação
create table public.normas_trechos (
  id            uuid primary key default gen_random_uuid(),
  uf            text not null,
  norma         text not null,
  item          text not null,          -- '5.1.2', 'Tabela 3'
  titulo        text,
  texto         text not null,
  sistema       text,                   -- liga a normas_dados.sistema, quando houver
  vigente_desde date,
  revogado_em   date,
  busca         tsvector generated always as (to_tsvector('portuguese', coalesce(titulo,'') || ' ' || texto)) stored,
  foreign key (uf, norma) references public.normas_documentos (uf, norma)
);
create index on public.normas_trechos using gin (busca);
create index on public.normas_trechos (uf, norma, item);
-- normas_documentos e normas_trechos: leitura pública (como normas_dados);
-- escrita só service_role

create table public.ember_conversas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  projeto_id  text,
  modo        text not null check (modo in ('copiloto','consulta','escrita','auditoria')),
  criado_em   timestamptz not null default now()
);

create table public.ember_mensagens (
  id           uuid primary key default gen_random_uuid(),
  conversa_id  uuid not null references public.ember_conversas(id) on delete cascade,
  papel        text not null check (papel in ('user','assistant')),
  conteudo     jsonb not null,           -- blocos completos (inclui tool_use/tool_result)
  avaliacao    smallint check (avaliacao in (-1, 1)),
  tokens       jsonb,                    -- usage devolvido pela API, para custo
  criado_em    timestamptz not null default now()
);

-- Achados de auditoria e sugestões (valor ou texto)
create table public.ember_achados (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  projeto_id  text not null,
  origem      text not null check (origem in ('regra','ia')),
  tipo        text not null check (tipo in ('achado','sugestao_valor','sugestao_texto')),
  campo_ids   text[] not null default '{}',
  severidade  text check (severidade in ('bloqueante','atencao','sugestao')),
  conteudo    jsonb not null,            -- titulo, explicacao, citacao, proposta/texto
  assinatura  text not null,             -- hash dos valores envolvidos: muda o dado, reabre
  situacao    text not null default 'aberto' check (situacao in ('aberto','aceito','corrigido','descartado')),
  criado_em   timestamptz not null default now()
);

create table public.ember_decisoes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  projeto_id    text,                    -- null quando escopo = 'usuario'
  escopo        text not null check (escopo in ('projeto','usuario')),
  achado_id     uuid references public.ember_achados(id) on delete set null,
  decisao       text not null,
  justificativa text,
  criado_em     timestamptz not null default now()
);

-- feedbacks ganha estrutura para o Ember
alter table public.feedbacks
  add column origem      text not null default 'usuario' check (origem in ('usuario','ember')),
  add column categoria   text,
  add column contexto    jsonb not null default '{}',
  add column fingerprint text,
  add column ocorrencias integer not null default 1;
create unique index on public.feedbacks (fingerprint) where fingerprint is not null;
```

RLS: tabelas `ember_*` com política `auth.uid() = user_id` (leitura e
atualização de `situacao`/`avaliacao`); conteúdo gerado pelo Ember só entra
pela Edge Function. `feedbacks` continua sem leitura pela interface.

## 11. Edge Function `ember`

Nova `supabase/functions/ember/index.ts`, no padrão de `site-sync` /
`revit-sync` (CORS, `json()`, `_shared/licenca.ts`).

**Entrada (POST):**

```json
{
  "modo": "copiloto | consulta | escrita | auditoria",
  "conversa_id": "uuid | null",
  "projeto_id": "...",
  "contexto": { /* montarContextoEmber() */ },
  "campo_atual": "est-1.alarme.central",
  "mensagem": "texto do usuário"
}
```

**Passos:**

1. Valida o JWT (`Authorization`) e a licença PRO (`donoTemLicenca(..., [])` —
   lista vazia significa "só o PRO libera").
2. Monta a requisição para o Claude, **na ordem que maximiza o cache**:
   - `tools` (lista fixa, sempre na mesma ordem);
   - `system` fixo (quem é o Ember, princípios, formato de citação, tom de
     escrita) — `cache_control`;
   - bloco da base normativa da UF (dados de `normas_dados` relevantes) —
     `cache_control` (muda só quando a norma muda);
   - histórico da conversa;
   - por último, o instantâneo do projeto e a mensagem.
3. Loop de ferramentas com o SDK oficial `@anthropic-ai/sdk` (via `npm:` no
   Deno), em **streaming**, repassando o texto ao navegador por SSE.
4. Persiste mensagens (blocos completos), achados, sugestões e feedbacks.

**Configuração do modelo:**

- Modelo: `claude-opus-5-5`, com pensamento adaptativo (padrão do modelo).
  `output_config.effort` por modo: `low` no copiloto (resposta rápida),
  `medium` na consulta e na escrita, `high` na auditoria.
- `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`), para que uma
  recusa indevida dos filtros de segurança não deixe o usuário sem resposta;
  tratar `stop_reason: "refusal"` mesmo assim.
- Citações nativas na consulta (`citations: { enabled: true }` nos documentos
  de `buscar_trechos`). Na auditoria e na escrita, a saída estruturada vem
  pelas ferramentas (`registrar_achado`, `propor_valor`, `propor_texto`) com
  `strict: true` — citações e `output_config.format` não podem ser usados
  juntos, por isso a estrutura vai pelas ferramentas.
- Conversas longas: compactação no servidor (beta `compact-2026-01-12`),
  guardando os blocos de compactação que a API devolve.
- `ANTHROPIC_API_KEY` como *secret* da função — nunca no front.

## 12. Interface

- **Painel do Ember** em `src/components/ember/`, aberto pelo
  `ProjectAside`/`Header` em qualquer rota de projeto. Abas: *Chat*,
  *Achados*, *Sugestões*. Tema e tokens do `DESIGN.md`; teclado e
  `prefers-reduced-motion` como no `FeedbackWidget`.
- **Ajuda no campo:** ícone do Ember ao lado de `InfoTip`/`Obrigatorio` que
  abre o painel já com `campo_atual` preenchido.
- **"Escrever com Ember"** nos campos de texto livre ([§6.3](#63-auxiliar-de-escrita)),
  com o rascunho aparecendo junto do campo.
- **Achados na `AuditoriaPage`:** terceira coluna "Achados normativos",
  agrupada por `secao`, usando o mesmo `corrigir(campo)` — o clique leva ao
  campo com `?audit=<id>`, que já destaca o campo hoje. Botão "Pedir análise
  do Ember" no topo.
- **No memorial:** em `MemorialDescritivoPage`, botão "Pedir análise do Ember"
  e, se houver, aviso "N achados abertos" da última análise. Não bloqueia — o
  RT decide.
- **Citação clicável:** mostra o trecho e o link do PDF (`LinkNorma` /
  `links_normas`).
- `src/context/EmberContext.jsx` guarda conversa atual, achados e sugestões,
  no padrão dos outros contexts.

## 13. Segurança, privacidade e custo

- **Chave da API só no servidor.** O front fala apenas com a Edge Function.
- **Dado pessoal fora do prompt** (ver §4). O histórico guarda só o que foi
  enviado — portanto também sem dado pessoal.
- **Conteúdo do usuário é dado, não instrução.** Textos livres do projeto
  entram marcados como conteúdo do projeto; o prompt de sistema deixa claro
  que instruções dentro deles não mudam as regras do Ember.
- **Licença:** incluído no PRO.
- **Custo:**
  - regras determinísticas cobrem o óbvio sem chamar a IA;
  - análise com IA só quando o usuário pede;
  - cache de prompt no sistema + base normativa (conferir
    `usage.cache_read_input_tokens` nos logs);
  - `ler_projeto(secao)` em vez de mandar o projeto inteiro em toda pergunta
    do copiloto;
  - **sem limite de uso por enquanto**; `ember_mensagens.tokens` registra o
    consumo por usuário, projeto e modo desde o primeiro dia. Se um limite for
    necessário, é definido pelo uso real e entra como mais uma checagem no
    passo 1 da função.

### 13.1 Estimativa de custo

Estimativa antes de medir: os números reais saem de `ember_mensagens.tokens`
na fase 1. Preços da API (US$ por milhão de tokens) para `claude-opus-5-5`:
entrada 4,00 · saída 20,00 · leitura de cache 0,20. O raciocínio do modelo
conta como saída. Câmbio assumido: R$ 5,50.

| Uso | Tokens típicos | Custo por uso |
|---|---|---|
| Pergunta ao consultor | ~30k de entrada (maior parte em cache) + ~2k de saída, 2–3 chamadas | US$ 0,05–0,10 (R$ 0,30–0,55) |
| Ajuda em campo (copiloto, esforço `low`) | trecho do projeto + ~500 de saída | US$ 0,02–0,05 (R$ 0,10–0,30) |
| Texto com "Escrever com Ember" | contexto da medida + ~1k de saída | US$ 0,04–0,08 (R$ 0,20–0,45) |
| Análise do projeto (esforço `high`) | projeto completo + memorial (30–80k) + 8–20k de saída | US$ 0,40–1,50 (R$ 2–8) |

Cenário por projeto (30 perguntas, 20 ajudas em campo, 10 textos, 3
análises): **~US$ 4–7 (R$ 22–40)**. Por usuário PRO por mês: ~US$ 3–6 com 1
projeto; ~US$ 20–30 com 4 projetos.

Custos fixos: ingestão das NTs do MA (~US$ 30, uma vez, se o Claude ajudar a
estruturar os PDFs); cada rodada do conjunto de avaliação (~US$ 10); Edge
Functions e armazenamento cabem no plano atual do Supabase.

O que mais pesa e como reduzir, em ordem:

1. **Cache de prompt** (já previsto): sem ele, o custo da consulta e do
   copiloto sobe 3–5×.
2. **Análise do projeto** é o item caro; já é só sob demanda. Analisar só a
   medida alterada, e não o projeto inteiro, corta a maior parte.
3. **Esforço por modo** (já previsto): `low` no copiloto.
4. **Modelo por modo:** Claude Sonnet 5.5 (US$ 2/10) custa metade e o Claude
   Haiku 5.5 (US$ 0,10/0,50) ~40× menos. Dá para usar no copiloto e na escrita,
   mantendo o Opus na consulta e na análise, desde que o conjunto de avaliação
   mostre a mesma qualidade. É decisão de produto, a medir na fase 2.
5. **Alerta de consumo** por usuário (ex.: acima de US$ 30 no mês), sem
   bloquear, para identificar abuso enquanto não há limite.

## 14. Qualidade: avaliação contínua

- **Perguntas normativas** com resposta e item esperados (começar com ~50,
  pelas NTs do MA), revisadas por engenheiro.
- **Projetos de teste com erros plantados** (memorial contradizendo os dados,
  isenção sem justificativa...) — mede se a auditoria acha cada um e quantos
  falsos positivos gera.
- **Textos de referência** para a escrita: casos com dados de entrada e um
  texto bom esperado, avaliados por engenheiro (técnico, sem dado inventado,
  coerente com o memorial).
- Critérios: item citado correto; nada afirmado sem citação; erro plantado
  encontrado; sugestão válida; texto sem dado inventado.
- Rodar antes de cada mudança de prompt, ferramenta ou modelo; respostas com
  👎 em produção entram no conjunto. Ficam em `tests/ember/`.

## 15. Fases de entrega

| Fase | Entrega | Depende de |
|---|---|---|
| **0 — Base** | `normas_documentos` + `normas_trechos` com todas as NTs do MA; `auditoriaNormativa.js` com as primeiras regras; conjunto de avaliação inicial | — |
| **1 — Consultor** | Edge Function `ember` (modo consulta, licença PRO), painel com chat, citações clicáveis, `ember_conversas`/`_mensagens` com registro de consumo | Fase 0 |
| **2 — Copiloto e escrita** | `montarContextoEmber`, ajuda por campo, `propor_valor` + `aplicar.js` com validação, "Escrever com Ember" nos campos livres | Fase 1 |
| **3 — Auditor** | Análise sob demanda, `ember_achados`, coluna na `AuditoriaPage`, botão no memorial, `ember_decisoes` | Fase 2 |
| **4 — Feedback** | `registrar_feedback_plataforma` com deduplicação; memória com escopo de usuário | Fase 3 |

Cada fase é útil sozinha: a fase 1 já entrega dúvidas respondidas com citação
sem mexer no projeto.

## 16. Decisões

| Tema | Decisão |
|---|---|
| Nome | Ember |
| Escopo atual | Copiloto do formulário, consultor normativo, auxiliar de escrita e auditor do projeto |
| Licenciamento | Incluído no PRO |
| Limite de uso | Nenhum por enquanto; consumo registrado desde o início |
| Base textual | Todas as NTs do estado, na íntegra, da fonte oficial |
| Auditoria com IA | Só sob demanda — o usuário pede |
| Plugin Revit | Fora do escopo; o Ember existe só no site |
| NBRs | Fora do escopo por enquanto |

## 17. Futuro

Fora do escopo atual, registrado para não se perder:

- **Comunidade de interpretações.** Tópicos sobre entendimentos do Corpo de
  Bombeiros que não estão escritos na NT, com comentários e votação. A
  administração aprova cada tópico antes de ir ao ar; prazo e quórum mínimo
  definem se a discussão teve resolução. Tópicos resolvidos viram
  conhecimento do Ember, apresentados como *entendimento da comunidade*, com
  placar e link. Pontos a decidir quando for a hora: maioria mínima além do
  quórum, placar oculto ou visível durante a votação, e quem pode votar.
- **NBRs** como referência (número, item, título e resumo próprio).

---

*Proposta inicial — Outubro 2026*
