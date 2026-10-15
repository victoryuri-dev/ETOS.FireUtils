-- Mantém a autorização do banco alinhada à interface: somente licenças ativas
-- ou de teste, já iniciadas e ainda não expiradas, concedem acesso.
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
      and l.inicio_em <= (now() at time zone 'America/Sao_Paulo')::date
      and (l.expira_em is null or l.expira_em >= (now() at time zone 'America/Sao_Paulo')::date)
      and (p_modulo is null or l.modulo = p_modulo or l.modulo = 'pro')
  );
$$;

revoke all on function public.tem_licenca(text) from public;
grant execute on function public.tem_licenca(text) to authenticated;
