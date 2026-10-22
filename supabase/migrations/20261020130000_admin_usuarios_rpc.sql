-- Leitura de usuários para o painel de administração. auth.users não é
-- exposta pela API, então a listagem passa por funções security definer que
-- exigem is_admin() antes de qualquer coisa.
--
-- Escrita em usuários do Auth (convidar, banir, excluir...) fica na Edge
-- Function `admin-usuarios`, que usa a service role.
--
-- Idempotente: pode rodar de novo sem efeito.

drop function if exists public.admin_listar_usuarios(text, text, int, int);

create or replace function public.admin_listar_usuarios(
  p_busca  text default null,
  p_filtro text default 'todos',   -- todos | sem_licenca | vencendo | expirada
  p_limite int  default 25,
  p_offset int  default 0,
  p_user_id uuid default null      -- um usuário só (tela de detalhe)
)
returns table (
  user_id      uuid,
  email        text,
  nome         text,
  criado_em    timestamptz,
  ultimo_login timestamptz,
  banido       boolean,
  licencas     jsonb,
  total        bigint
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  hoje  date := (now() at time zone 'America/Sao_Paulo')::date;
  busca text := nullif(btrim(coalesce(p_busca, '')), '');
begin
  if not public.is_admin() then
    raise exception 'sem permissao' using errcode = '42501';
  end if;
  if p_filtro not in ('todos', 'sem_licenca', 'vencendo', 'expirada') then
    raise exception 'filtro invalido' using errcode = '22023';
  end if;
  if busca is not null then
    busca := replace(replace(replace(busca, '\', '\\'), '%', '\%'), '_', '\_');
  end if;

  return query
  with base as (
    select
      u.id as uid,
      u.email::text as email,
      p.nome as nome,
      u.created_at as criado_em,
      u.last_sign_in_at as ultimo_login,
      (u.banned_until is not null and u.banned_until > now()) as banido,
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', l.id, 'modulo', l.modulo, 'plano', l.plano, 'situacao', l.situacao,
          'inicio_em', l.inicio_em, 'expira_em', l.expira_em
        ) order by l.modulo)
        from public.licencas l where l.user_id = u.id
      ), '[]'::jsonb) as lic
    from auth.users u
    left join public.perfis p on p.user_id = u.id
    where (p_user_id is null or u.id = p_user_id)
      and (busca is null
           or u.email ilike '%' || busca || '%' escape '\'
           or p.nome  ilike '%' || busca || '%' escape '\')
  ),
  filtrado as (
    select b.* from base b
    where case p_filtro
      when 'sem_licenca' then jsonb_array_length(b.lic) = 0
      when 'vencendo' then exists (
        select 1 from jsonb_array_elements(b.lic) e
        where e->>'situacao' in ('ativa', 'teste')
          and (e->>'expira_em') is not null
          and (e->>'expira_em')::date between hoje and hoje + 15)
      when 'expirada' then exists (
        select 1 from jsonb_array_elements(b.lic) e
        where (e->>'expira_em') is not null and (e->>'expira_em')::date < hoje)
      else true
    end
  )
  select f.uid, f.email, f.nome, f.criado_em, f.ultimo_login, f.banido, f.lic,
         count(*) over ()
  from filtrado f
  order by f.criado_em desc
  limit least(greatest(coalesce(p_limite, 25), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke all on function public.admin_listar_usuarios(text, text, int, int, uuid) from public;
grant execute on function public.admin_listar_usuarios(text, text, int, int, uuid) to authenticated;

-- Visão geral: licenças válidas por módulo e as que vencem em até 15 dias.
create or replace function public.admin_resumo_licencas()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if not public.is_admin() then
    raise exception 'sem permissao' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_usuarios', (select count(*) from auth.users),
    'por_modulo', coalesce((
      select jsonb_agg(jsonb_build_object('modulo', m.modulo, 'ativas', m.ativas, 'teste', m.teste) order by m.modulo)
      from (
        select l.modulo,
               count(*) filter (where l.situacao = 'ativa') as ativas,
               count(*) filter (where l.situacao = 'teste') as teste
        from public.licencas l
        where l.situacao in ('ativa', 'teste')
          and l.inicio_em <= hoje
          and (l.expira_em is null or l.expira_em >= hoje)
        group by l.modulo
      ) m
    ), '[]'::jsonb),
    'vencendo', coalesce((
      select jsonb_agg(v order by v.expira_em)
      from (
        select l.user_id, u.email::text as email, l.modulo, l.situacao, l.expira_em
        from public.licencas l
        join auth.users u on u.id = l.user_id
        where l.situacao in ('ativa', 'teste')
          and l.expira_em between hoje and hoje + 15
        order by l.expira_em
        limit 20
      ) v
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.admin_resumo_licencas() from public;
grant execute on function public.admin_resumo_licencas() to authenticated;
