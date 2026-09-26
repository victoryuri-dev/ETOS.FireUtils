-- Corrige atividade_diaria: o id do projeto no app NÃO é UUID (é uma string
-- base36 gerada por newIds() em ProjetoContext.jsx, ex.: "mtu6gznm-i8f") — a
-- mesma forma usada em projetos.id e revit_syncs_latest.projeto_id. Com a
-- coluna e o parâmetro da função como uuid, registrar_atividade e a consulta
-- do heatmap falhavam com "invalid input syntax for type uuid", então nenhuma
-- atividade era gravada nem lida.

alter table public.atividade_diaria
  alter column projeto_id type text using projeto_id::text;

drop function if exists public.registrar_atividade(uuid);

create or replace function public.registrar_atividade(p_projeto_id text)
returns void
language sql
as $$
  insert into public.atividade_diaria (projeto_id, user_id, dia, contagem)
  values (p_projeto_id, auth.uid(), (now() at time zone 'America/Sao_Paulo')::date, 1)
  on conflict (projeto_id, dia)
  do update set contagem = atividade_diaria.contagem + 1;
$$;
