-- Licenças passam a ser por MÓDULO, os mesmos da página de preços — Saídas,
-- Memorial, Hidrantes e PRO (que inclui os três e o FireUtils BIM) — em vez
-- de por ferramenta (plugin, memorial). A coluna `ferramenta` vira `modulo`.
--
-- Linhas antigas: 'memorial' continua 'memorial'; 'plugin' vira 'pro', porque
-- "o plugin inteiro" não corresponde a um módulo avulso (cobria hidrantes e
-- saídas) e o PRO é o único que libera os dois. Confira essas linhas depois,
-- se houver alguma.
--
-- Idempotente: pode rodar de novo sem efeito.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'licencas' and column_name = 'ferramenta'
  ) then
    alter table public.licencas drop constraint if exists licencas_ferramenta_check;
    alter table public.licencas rename column ferramenta to modulo;
    update public.licencas set modulo = 'pro' where modulo = 'plugin';
  end if;
end $$;

alter table public.licencas drop constraint if exists licencas_modulo_check;
alter table public.licencas
  add constraint licencas_modulo_check check (modulo in ('saidas', 'memorial', 'hidrantes', 'pro'));

-- A unicidade (user_id, ferramenta) acompanha o rename da coluna; só o nome
-- da constraint é ajustado, pra não ficar citando a coluna antiga.
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'licencas_user_id_ferramenta_key') then
    alter table public.licencas rename constraint licencas_user_id_ferramenta_key to licencas_user_id_modulo_key;
  end if;
end $$;

comment on table public.licencas is
  'Licença de cada conta por módulo (saidas, memorial, hidrantes, pro). Lida pela aba Ferramentas do perfil e pelo bloqueio de acesso.';
comment on column public.licencas.plano is
  'Período contratado exibido ao usuário (ex.: "Anual", "Semestral", "30 dias"). Texto livre.';

-- A conta logada tem licença válida (ativa ou em teste, dentro da validade)?
--   tem_licenca()            -> de qualquer módulo
--   tem_licenca('memorial')  -> daquele módulo, ou do PRO (que inclui todos)
-- security definer: precisa ler `licencas` de dentro de políticas de outras
-- tabelas sem depender do RLS desta. A data de "hoje" é a do Brasil, pra a
-- licença não vencer três horas antes da meia-noite local.
create or replace function public.tem_licenca(p_modulo text default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.licencas l
    where l.user_id = auth.uid()
      and l.situacao in ('ativa', 'teste')
      and (l.expira_em is null or l.expira_em >= (now() at time zone 'America/Sao_Paulo')::date)
      and (p_modulo is null or l.modulo = p_modulo or l.modulo = 'pro')
  );
$$;

revoke all on function public.tem_licenca(text) from public;
grant execute on function public.tem_licenca(text) to authenticated;
