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
   NT + item. Sem trecho na base, a IA diz que não encontrou — não
   completa de memória. Isso segue a regra do `PRODUCT.md`: *não inventar
   cobertura normativa*.
3. **A IA propõe, o usuário decide.** Nada é gravado no estado do projeto sem
   um clique do usuário. Sugestões viram `dispatch` só depois de aceitas, e a
   decisão (aceita/recusada + justificativa) fica registrada.
4. **O responsável técnico é o engenheiro.** A IA é apoio; decisões de
   interpretação ficam com o RT e ficam documentadas como decisões dele.
5. **Aprender sem contaminar.** O que um usuário ensina vale primeiro para o
   projeto dele; só vira conhecimento global depois de passar pela comunidade
   (discussão, votação com quórum e moderação — §8.1).
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
│ comunidade_* (novo)           assistente_conversas / _mensagens (novo)    │
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

Para explicar e citar, a IA precisa do texto, não só dos números. A base
textual recebe **todas as NTs do estado, na íntegra** — inclusive as que não
têm nenhum dado em `normas_dados` por não alimentarem dimensionamento nem
memorial (ex.: controle de fumaça, GLP, eventos temporários, procedimentos
administrativos). `normas_dados` continua sendo só o recorte que o motor usa;
`normas_trechos` é a norma inteira, para consulta.

Cada NT é quebrada **por item** (não por tamanho fixo): `5.1.2`, `Tabela 3`,
`Anexo B`.

- Ingestão por script interno (`scripts/ingerir-norma`), a partir dos PDFs
  oficiais do Corpo de Bombeiros (portal em `links_normas.js` /
  `links_normas_por_estado`): extrai o texto, separa por item, revisa
  manualmente e grava com `service_role`.
- Uma tabela-índice `normas_documentos` (uma linha por NT: número, título,
  URL do PDF, data de vigência) permite à IA saber quais normas existem para a
  UF, mesmo antes de buscar um item.
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

### 5.3 Interpretações da comunidade — `comunidade_topicos` (novo)

A norma nem sempre é clara, e na prática o Corpo de Bombeiros aplica um
entendimento que não está escrito no texto — vindo de parecer técnico,
exigência de analista em vistoria ou consulta formal. Uma **interpretação** é
esse entendimento registrado, ligado ao item da norma a que se refere.

Exemplos do tipo de coisa que entra aqui:

- "O CBMMA não considera mezanino de até 1/3 da área do pavimento como
  pavimento adicional para efeito de altura" (item X da NT Y — texto ambíguo).
- "Em análise, o CBMMA tem exigido a planta de rota de fuga mesmo quando a
  NT 20 não obriga para a divisão" (prática de análise, não texto da norma).

Elas são **globais** porque valem para todos os usuários daquela UF — ao
contrário das decisões de um projeto, que ficam só nele. Por isso nascem de
uma discussão na **comunidade do FireUtils**, com votação, prazo e quórum
mínimo, e só valem quando a votação tem resolução ([§8.1](#81-comunidade-de-interpretações)).
A IA sempre as apresenta como *entendimento da comunidade*, com o placar e o
link do tópico, nunca como texto da norma.

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
2. **Revisão com IA (só quando o usuário pede).** A análise nunca roda
   sozinha: o usuário pede pelo chat ("analise o projeto", "revise o
   memorial de alarme") ou pelo botão "Pedir análise da IA". Pode ser do
   projeto inteiro ou de uma medida/estrutura. A IA recebe o instantâneo
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
(`buscar_trechos`) em qualquer NT do estado — não só nas que o site
dimensiona —, lê dados estruturados (`consultar_norma`) quando a dúvida
envolve um valor que o motor usa, e responde com citações. Se a pergunta for
sobre outro estado ou norma fora da base, diz claramente que não tem a norma
cadastrada.

## 7. Ferramentas (tool use)

Todas definidas com `strict: true` e `input_schema` com
`additionalProperties: false`. Executadas na Edge Function.

| Ferramenta | Tipo | O que faz |
|---|---|---|
| `consultar_norma(uf, sistema, caminho?)` | leitura | Lê `normas_dados` (o mesmo JSON do motor) |
| `buscar_trechos(uf, consulta, norma?, item?)` | leitura | Busca em `normas_trechos`; devolve documentos com citações |
| `buscar_interpretacoes(uf, tema)` | leitura | Lê tópicos da comunidade resolvidos, sem consenso e abertos (§8.1) |
| `ler_projeto(secao)` | leitura | Devolve uma parte do instantâneo (evita mandar tudo sempre) |
| `propor_valor(campo_id, valor, justificativa, citacao)` | proposta | Grava sugestão pendente; a UI pede confirmação |
| `registrar_achado(...)` | proposta | Grava achado de auditoria |
| `registrar_feedback_plataforma(...)` | escrita interna | Ver [§9](#9-feedback-automático-para-a-plataforma) |
| `sugerir_topico(...)` | proposta | Monta rascunho de tópico da comunidade; o usuário revisa e envia |

Nenhuma ferramenta escreve em `projetos.dados` nem em `normas_dados`.

## 8. Aprendizado com os usuários

Sem treino de modelo. "Aprender" aqui é **memória organizada em três níveis**,
todos consultados pela IA nas próximas conversas:

| Nível | Tabela | Quem escreve | Alcance |
|---|---|---|---|
| Projeto | `assistente_decisoes` | Usuário (ao aceitar/descartar achado ou sugestão, com justificativa) | Só aquele projeto |
| Usuário/escritório | `assistente_decisoes` com `escopo = 'usuario'` | Usuário marca "usar nos meus próximos projetos" | Projetos daquele usuário |
| Global (por UF) | `comunidade_topicos` resolvidos | Comunidade **discute e vota**, administração **modera** | Todos os usuários |

### 8.1 Comunidade de interpretações

O nível global nasce de uma **comunidade dentro do FireUtils**: cada
interpretação é um tópico de discussão, os usuários comentam e votam, e o
resultado da votação — com prazo e quórum mínimo — decide se o tópico teve
resolução. Só tópicos resolvidos viram conhecimento da IA.

#### Ciclo de vida de um tópico

```
 rascunho ──► em_moderacao ──► aberto ──(prazo vence)──► resolvido
   (autor)     (admin aprova      │                     ├─► sem_consenso
                ou rejeita)       │                     │
                   │              └─(admin)─► arquivado ◄┘ (NT revisada,
                   ▼                                       tópico obsoleto)
               rejeitado
```

1. **Rascunho.** Qualquer usuário PRO cria um tópico. A IA também pode
   sugerir um a partir de uma conversa (`sugerir_topico`): ela monta o
   rascunho — pergunta, item da NT envolvido, posições possíveis, evidência
   citada pelo usuário — e o usuário revisa e envia. A IA nunca publica em
   nome de ninguém.
2. **Em moderação.** Uma pessoa da administração do FireUtils lê, ajusta a
   redação se preciso e define as regras da votação daquele tópico:
   - **prazo** (data de encerramento, ex.: 30 dias);
   - **quórum mínimo** (nº mínimo de votos para a votação valer, ex.: 15);
   - **maioria mínima** (percentual que a posição vencedora precisa ter, ex.:
     60%). Sem isso, um tópico com quórum atingido e votos divididos 51/49
     contaria como resolvido.
   Aprova (vai ao ar) ou rejeita com motivo (duplicado, fora de escopo,
   pergunta já respondida pelo texto da NT).
3. **Aberto.** Usuários comentam (com anexo opcional: parecer, notificação de
   exigência, foto) e votam em **uma** posição — pode trocar o voto até o
   prazo. Ao abrir o tópico, a IA publica um comentário inicial, marcado como
   da IA, com os itens normativos relacionados e as citações literais. Ela não
   vota.
4. **Encerramento automático no prazo** (job agendado no Postgres, `pg_cron`,
   chamando `encerrar_topicos_vencidos()`):
   - votos ≥ quórum **e** posição líder ≥ maioria mínima → **resolvido**, com
     a posição vencedora como entendimento;
   - caso contrário → **sem consenso**.
5. **Arquivado.** A administração arquiva quando a NT do item é revisada ou o
   tópico fica obsoleto. Se o trecho ligado ao tópico for marcado como
   revogado em `normas_trechos`, o tópico entra automaticamente numa fila de
   revisão.

#### O que a IA faz com o resultado

| Situação do tópico | Como a IA usa |
|---|---|
| **Resolvido** | Apresenta como *entendimento da comunidade FireUtils*, com placar ("72% de 25 votos, encerrado em 10/12/2026") e link para o tópico. Nunca como texto da norma. |
| **Sem consenso** | Avisa que o tema é controverso entre os projetistas e recomenda confirmar com o Corpo de Bombeiros (consulta técnica). Também é informação útil. |
| **Aberto** | Pode mencionar que há discussão em andamento e convidar o usuário a participar. Não usa como base. |
| Rascunho / moderação / rejeitado / arquivado | Ignora. |

#### Regras contra distorção

- **Um voto por conta por tópico** (chave única `topico_id, user_id`).
- **Só licença PRO ativa vota e comenta** — o mesmo critério de acesso ao
  assistente; quem só lê não precisa de PRO.
- **Placar parcial oculto até o encerramento**, para o voto não seguir a
  manada; durante a discussão aparecem só o número de votos e os comentários.
- Comentários podem ser denunciados; a administração modera.

No começo a administração aprova todo tópico antes de ir ao ar. O campo
`exige_moderacao` fica nas configurações da comunidade, para no futuro
permitir publicação direta (ex.: para usuários com histórico).

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
-- Índice das normas de cada estado (todas as NTs, não só as do motor)
create table public.normas_documentos (
  uf            text not null,
  norma         text not null,          -- 'NT 21'
  titulo        text not null,
  fonte_url     text not null,          -- PDF oficial do Corpo de Bombeiros
  vigente_desde date,
  primary key (uf, norma)
);

-- Texto normativo por item, para busca e citação
create table public.normas_trechos (
  id            uuid primary key default gen_random_uuid(),
  uf            text not null,
  norma         text not null,          -- 'NT 21'
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

-- Comunidade de interpretações (§8.1)
create table public.comunidade_topicos (
  id            uuid primary key default gen_random_uuid(),
  uf            text not null,
  trecho_ids    uuid[] not null default '{}',   -- itens de normas_trechos envolvidos
  titulo        text not null,
  pergunta      text not null,
  autor_id      uuid references auth.users(id) on delete set null,
  sugerido_por_ia boolean not null default false,
  situacao      text not null default 'rascunho' check (situacao in
                  ('rascunho','em_moderacao','aberto','resolvido','sem_consenso','rejeitado','arquivado')),
  prazo         timestamptz,                    -- definido na moderação
  quorum_minimo integer,                        -- nº mínimo de votos
  maioria_minima numeric(5,2),                  -- % mínimo da posição líder (ex.: 60.00)
  posicao_vencedora uuid,                       -- preenchida ao encerrar
  resultado     jsonb,                          -- placar final congelado
  moderado_por  uuid references auth.users(id) on delete set null,
  motivo_moderacao text,
  criado_em     timestamptz not null default now(),
  encerrado_em  timestamptz
);

create table public.comunidade_posicoes (
  id          uuid primary key default gen_random_uuid(),
  topico_id   uuid not null references public.comunidade_topicos(id) on delete cascade,
  texto       text not null,                    -- o entendimento proposto
  ordem       smallint not null
);

create table public.comunidade_votos (
  topico_id   uuid not null references public.comunidade_topicos(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  posicao_id  uuid not null references public.comunidade_posicoes(id) on delete cascade,
  votado_em   timestamptz not null default now(),
  primary key (topico_id, user_id)              -- um voto por conta; trocar = update
);

create table public.comunidade_comentarios (
  id          uuid primary key default gen_random_uuid(),
  topico_id   uuid not null references public.comunidade_topicos(id) on delete cascade,
  autor_id    uuid references auth.users(id) on delete set null,
  da_ia       boolean not null default false,
  texto       text not null,
  anexos      jsonb not null default '[]',      -- caminhos no Storage (parecer, foto)
  oculto      boolean not null default false,   -- moderação
  criado_em   timestamptz not null default now()
);

-- Encerramento: roda a cada hora via pg_cron
-- encerrar_topicos_vencidos(): para cada tópico 'aberto' com prazo vencido,
-- conta votos, congela o placar em `resultado` e muda para 'resolvido'
-- (votos >= quorum_minimo e líder >= maioria_minima) ou 'sem_consenso'.

-- RLS:
--  * tópicos 'aberto'/'resolvido'/'sem_consenso': leitura para autenticados;
--    rascunho/moderação: só autor e admins.
--  * votos e comentários: insert/update só com licença PRO ativa
--    (tem_licenca()) e tópico 'aberto' com prazo não vencido.
--  * contagem por posição exposta só depois do encerramento (view
--    comunidade_placar filtrando situacao in ('resolvido','sem_consenso')).
--  * moderação (situacao, prazo, quorum, maioria) só para admins.

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

1. Valida o JWT (`Authorization`) e a licença PRO (`donoTemLicenca(..., [])`
   — lista vazia significa "só o PRO libera").
2. Monta a requisição para o Claude, **na ordem que maximiza o cache**:
   - `tools` (lista fixa, sempre na mesma ordem);
   - `system` fixo (papéis, princípios, formato de citação) — `cache_control`;
   - bloco da base normativa da UF (dados de `normas_dados` relevantes) —
     `cache_control` (muda só quando a norma muda);
   - histórico da conversa;
   - por último, o instantâneo do projeto e a mensagem (o que muda a cada
     chamada).
3. Loop de ferramentas com o SDK oficial `@anthropic-ai/sdk` (via `npm:` no
   Deno), em **streaming**, repassando o texto ao navegador por SSE.
4. Persiste mensagens (blocos completos), achados, sugestões e feedbacks.

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
- **No memorial:** em `MemorialDescritivoPage`, botão "Pedir análise da IA"
  e, se houver, aviso "N achados abertos" da última análise. Não bloqueia — o
  RT decide.
- **Citação clicável:** cada citação mostra o trecho e o link do PDF
  (`LinkNorma` / `links_normas`).
- `src/context/AssistenteContext.jsx` guarda conversa atual, achados e
  sugestões, no mesmo padrão dos outros contexts.

**Comunidade** (rotas fora do projeto, ao lado de Projetos/Perfil):

- `/comunidade` — lista de tópicos por UF e norma, com filtros *Abertos*,
  *Resolvidos*, *Sem consenso*; em cada tópico aberto, prazo restante e nº de
  votos.
- `/comunidade/:id` — pergunta, itens da NT citados (com o texto literal),
  posições para votar, comentários com anexos; após o encerramento, placar
  final e selo "Resolvido" ou "Sem consenso".
- `/comunidade/novo` — formulário de tópico (também aberto pela IA já
  preenchido, a partir de uma conversa).
- `/admin/comunidade` — fila de moderação: aprovar/rejeitar, definir prazo,
  quórum e maioria mínima, ocultar comentários, arquivar.
- Na resposta da IA, quando ela usa um tópico, o link leva direto a ele.

## 13. Segurança, privacidade e custo

- **Chave da API só no servidor.** O front fala apenas com a Edge Function.
- **Dado pessoal fora do prompt** (ver §4). Logs de mensagens guardam só o que
  foi enviado — portanto também sem dado pessoal.
- **Conteúdo do usuário é dado, não instrução.** Textos livres do projeto
  (descrições, observações) entram marcados como conteúdo do projeto; o prompt
  de sistema deixa claro que instruções dentro deles não mudam as regras.
- **Licença:** incluído no PRO; checado na função como as outras.
- **Custo sob controle:**
  - regras determinísticas cobrem o óbvio sem chamar a IA;
  - análise com IA só quando o usuário pede (nenhuma chamada automática);
  - cache de prompt no sistema + base normativa (conferir
    `usage.cache_read_input_tokens` nos logs);
  - `ler_projeto(secao)` em vez de mandar o projeto inteiro em toda pergunta
    do copiloto;
  - **sem limite de uso por enquanto**, mas `assistente_mensagens.tokens`
    registra o consumo por usuário, projeto e modo desde o primeiro dia — se
    um limite for necessário depois, ele é definido com base no uso real e
    entra como uma checagem a mais no passo 1 da função.

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
| **0 — Base** | `normas_documentos` + `normas_trechos` com todas as NTs do MA; `auditoriaNormativa.js` com as primeiras regras determinísticas; conjunto de avaliação inicial | — |
| **1 — Consultor** | Edge Function `assistente` (modo consulta, licença PRO), painel com chat, citações clicáveis, `assistente_conversas/_mensagens` com registro de consumo | Fase 0 |
| **2 — Auditor** | `montarContextoIA`, análise com IA a pedido do usuário, `assistente_achados`, coluna na `AuditoriaPage`, botão no memorial, decisões do RT | Fase 1 |
| **3 — Copiloto** | Ajuda por campo, `propor_valor` + `aplicar.js` com validação, cartões de sugestão | Fase 2 |
| **4 — Aprendizado e feedback** | `assistente_decisoes` com escopo usuário, feedback automático com deduplicação, resumo periódico | Fase 2 |
| **5 — Comunidade** | Tabelas `comunidade_*`, páginas da comunidade, fila de moderação, encerramento automático (`pg_cron`), `sugerir_topico` e `buscar_interpretacoes` na IA | Fase 1 (pode correr em paralelo às fases 2–4) |

Cada fase é útil sozinha: a fase 1 já entrega valor (dúvidas com citação) sem
mexer no estado do projeto.

## 16. Decisões

### Tomadas

| Tema | Decisão |
|---|---|
| Licenciamento | Incluído no PRO |
| Limite de uso | Nenhum por enquanto; consumo registrado desde o início |
| Base textual | Todas as NTs do estado, na íntegra, consultadas da fonte oficial |
| Análise com IA | Só sob demanda — o usuário pede |
| Plugin Revit | Fora do escopo; o assistente existe só no site |
| NBRs | Fora do escopo por enquanto; a base textual cobre só as NTs |
| Interpretações | Comunidade com tópicos, comentários e votação; administração aprova cada tópico antes de ir ao ar; prazo e quórum mínimo definem se houve resolução |

### Em aberto

1. **Maioria mínima:** além do quórum, exigir um percentual mínimo para a
   posição vencedora (proposta: 60%)? Fixo para todos ou definido por tópico?
2. **Placar durante a votação:** oculto até o encerramento (proposta) ou
   visível o tempo todo?
3. **Quem vota:** qualquer PRO ativo (proposta), ou só quem tem CREA/CAU
   preenchido no perfil?

---

*Proposta inicial — Outubro 2026*
