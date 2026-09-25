-- Atividade diária por projeto: alimenta o heatmap dos últimos 30 dias no
-- dashboard. Uma linha por (projeto, dia), incrementada a cada salvamento
-- bem-sucedido no Supabase (ver registrarAtividade em ProjetoContext.jsx) —
-- não é um log de cada ação, só uma contagem por dia, o suficiente pro
-- heatmap sem guardar histórico detalhado de cada edição.

create table if not exists public.atividade_diaria (
  projeto_id uuid        not null,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  dia        date        not null,
  contagem   integer     not null default 0,
  primary key (projeto_id, dia)
);

comment on table public.atividade_diaria is
  'Contagem de salvamentos por projeto e por dia, usada pelo heatmap de atividade dos últimos 30 dias no dashboard.';

alter table public.atividade_diaria enable row level security;

-- Mesmo padrão de perfis: cada usuário só enxerga e grava a própria
-- atividade. Sem política de delete — a linha não precisa ser apagada
-- manualmente (fica de fora das consultas de "últimos 30 dias" sozinha
-- conforme o tempo passa).
drop policy if exists atividade_select_proprio on public.atividade_diaria;
create policy atividade_select_proprio
  on public.atividade_diaria for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists atividade_insert_proprio on public.atividade_diaria;
create policy atividade_insert_proprio
  on public.atividade_diaria for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists atividade_update_proprio on public.atividade_diaria;
create policy atividade_update_proprio
  on public.atividade_diaria for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Incrementa (ou cria) a contagem do dia corrente pro projeto informado.
-- Dia calculado no fuso America/Sao_Paulo (não UTC) pra bater com o dia que
-- o usuário brasileiro realmente vê no relógio ao editar à noite.
create or replace function public.registrar_atividade(p_projeto_id uuid)
returns void
language sql
as $$
  insert into public.atividade_diaria (projeto_id, user_id, dia, contagem)
  values (p_projeto_id, auth.uid(), (now() at time zone 'America/Sao_Paulo')::date, 1)
  on conflict (projeto_id, dia)
  do update set contagem = atividade_diaria.contagem + 1;
$$;
