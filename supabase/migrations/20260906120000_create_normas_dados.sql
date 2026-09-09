-- Base normativa centralizada, compartilhada entre o site (ETOS.FireUtils)
-- e o plugin Revit (FireUtils.extension). Uma linha por estado + sistema
-- normativo (ex.: 'MA' + 'saida_emergencia'). Antes desta tabela, a mesma
-- tabela normativa era escrita à mão duas vezes — uma em JS
-- (src/data/normas/<UF>/*.js) outra em Python (lib/normas/<UF>/*.py) —
-- e as duas cópias podiam divergir sem que ninguém percebesse (foi o que
-- aconteceu com saída de emergência do MA antes desta migração).
--
-- Leitura pública porque o conteúdo é norma técnica publicada (NBR/NT/IT),
-- não dado de usuário — só o service_role (edição manual via SQL Editor,
-- ou uma tela interna futura) deve gravar aqui.

create table if not exists public.normas_dados (
  uf            text        not null,
  sistema       text        not null,
  dados         jsonb       not null,
  versao        integer     not null default 1,
  atualizado_em timestamptz not null default now(),
  primary key (uf, sistema)
);

comment on table public.normas_dados is
  'Fonte única da base normativa (NBR/NT/IT por estado), consumida pelo site e pelo plugin Revit. Editar uma linha aqui propaga para os dois lados sem precisar de deploy em nenhum dos dois repositórios.';
comment on column public.normas_dados.sistema is
  'Domínio normativo: saida_emergencia, extintores, hidrantes, etc. Cada sistema define seu próprio formato dentro de "dados" — ver o loader de cada lado (src/data/normas/index.js no site, lib/normas/__init__.py no plugin).';
comment on column public.normas_dados.dados is
  'Payload JSON consumido diretamente pelos dois clientes. Para saida_emergencia: ocupacoes, tabela, notas, larguras_minimas, distancias_maximas.';
comment on column public.normas_dados.versao is
  'Incrementada manualmente (ou por trigger futuro) a cada atualização, só para os clientes conseguirem logar/detectar que a base mudou.';

alter table public.normas_dados enable row level security;

drop policy if exists normas_dados_select_public on public.normas_dados;
create policy normas_dados_select_public
  on public.normas_dados
  for select
  to anon, authenticated
  using (true);

-- Sem política de insert/update/delete: escrita fica restrita ao
-- service_role, nunca pelo anon key que o site e o plugin usam pra ler.
