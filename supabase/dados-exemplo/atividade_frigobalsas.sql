-- DADOS DE EXEMPLO — atividade fictícia dos últimos 70 dias do projeto
-- FRIGOBALSAS (id "mtu6gznm-i8f"), só pra ver o heatmap do dashboard com
-- histórico. NÃO é migration: rode à mão no SQL Editor do Supabase, depois de
-- aplicar 20260926120000_atividade_diaria_projeto_id_text.sql.
--
-- - O user_id vem do próprio projeto (projetos.user_id), então as linhas
--   respeitam a política de RLS do dono.
-- - Só dias ANTERIORES a hoje (fuso America/Sao_Paulo): o dia atual fica por
--   conta dos salvamentos reais, registrados por registrar_atividade().
-- - Determinístico: rodar de novo gera os mesmos números, e
--   "on conflict do nothing" nunca sobrescreve um dia que já tenha contagem.
-- - Padrão: dias úteis com mais edição (0 a 12 salvamentos, ~20% sem nada),
--   fins de semana quase sempre vazios.

insert into public.atividade_diaria (projeto_id, user_id, dia, contagem)
select
  p.id,
  p.user_id,
  d::date,
  case
    when extract(dow from d) in (0, 6) then
      case when abs(hashtext(p.id || d::text)) % 100 < 85 then 0
           else 1 + abs(hashtext(d::text || p.id)) % 3 end
    else
      case when abs(hashtext(p.id || d::text)) % 100 < 20 then 0
           else 1 + abs(hashtext(d::text || p.id)) % 12 end
  end as contagem
from public.projetos p
cross join generate_series(
  (now() at time zone 'America/Sao_Paulo')::date - 70,
  (now() at time zone 'America/Sao_Paulo')::date - 1,
  interval '1 day'
) as d
where p.id = 'mtu6gznm-i8f'
on conflict (projeto_id, dia) do nothing;

-- Dias sem atividade entram com contagem 0 — o heatmap os trata como vazios.
-- Se preferir não ter essas linhas, apague-as depois:
--   delete from public.atividade_diaria
--   where projeto_id = 'mtu6gznm-i8f' and contagem = 0;

-- Pra remover TODO o histórico de exemplo deste projeto (inclusive o real):
--   delete from public.atividade_diaria where projeto_id = 'mtu6gznm-i8f';
