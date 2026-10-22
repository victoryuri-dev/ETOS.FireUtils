-- Base do painel de administração (repositório FireUtils.admin).
--
-- Quem é administrador vem desta tabela, nunca do front-end: `is_admin()` é
-- consultada pelas políticas RLS e pelas Edge Functions `admin-*`.
--
-- O primeiro administrador entra por e-mail (a conta precisa já existir em
-- auth.users; se ainda não existir, o insert simplesmente não encontra
-- ninguém — rode de novo depois de criar a conta). Os demais entram pelo
-- painel.
--
-- Idempotente: pode rodar de novo sem efeito.

create table if not exists public.admins (
  user_id   uuid        primary key references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now(),
  criado_por uuid       references auth.users(id) on delete set null
);

alter table public.admins enable row level security;

-- security definer: as políticas de `admins` e de outras tabelas chamam esta
-- função sem depender do RLS de `admins` (evita recursão).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins
  for select to authenticated using (public.is_admin());

drop policy if exists admins_insert on public.admins;
create policy admins_insert on public.admins
  for insert to authenticated with check (public.is_admin());

drop policy if exists admins_delete on public.admins;
create policy admins_delete on public.admins
  for delete to authenticated using (public.is_admin());

insert into public.admins (user_id)
select u.id from auth.users u
where lower(u.email) = 'victoryuri.eng@gmail.com'
on conflict (user_id) do nothing;

-- Auditoria: quem fez o quê, em quem, com o antes/depois. Só leitura para o
-- admin; a escrita é feita por trigger (security definer) ou pelas Edge
-- Functions com a service role. Sem política de insert/update/delete.
create table if not exists public.admin_auditoria (
  id          bigint      generated always as identity primary key,
  admin_id    uuid        references auth.users(id) on delete set null,
  admin_email text,
  acao        text        not null,
  alvo_tipo   text        not null,
  alvo_id     text,
  antes       jsonb,
  depois      jsonb,
  criado_em   timestamptz not null default now()
);

create index if not exists admin_auditoria_criado_em_idx
  on public.admin_auditoria (criado_em desc);

alter table public.admin_auditoria enable row level security;

drop policy if exists admin_auditoria_select on public.admin_auditoria;
create policy admin_auditoria_select on public.admin_auditoria
  for select to authenticated using (public.is_admin());

-- Licenças: o admin lê e escreve; o usuário continua só lendo as próprias
-- (política licencas_select_proprio, da migração original).
drop policy if exists licencas_admin_select on public.licencas;
create policy licencas_admin_select on public.licencas
  for select to authenticated using (public.is_admin());

drop policy if exists licencas_admin_insert on public.licencas;
create policy licencas_admin_insert on public.licencas
  for insert to authenticated with check (public.is_admin());

drop policy if exists licencas_admin_update on public.licencas;
create policy licencas_admin_update on public.licencas
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists licencas_admin_delete on public.licencas;
create policy licencas_admin_delete on public.licencas
  for delete to authenticated using (public.is_admin());

-- O admin lê os perfis (dados do usuário na tela de detalhe). Só leitura.
drop policy if exists perfis_admin_select on public.perfis;
create policy perfis_admin_select on public.perfis
  for select to authenticated using (public.is_admin());

-- A expiração não pode ser anterior ao início. NOT VALID: não reprova linhas
-- antigas, só as novas e as alteradas.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'licencas_expira_apos_inicio') then
    alter table public.licencas
      add constraint licencas_expira_apos_inicio
      check (expira_em is null or expira_em >= inicio_em) not valid;
  end if;
end $$;

-- Toda alteração de licença feita por um admin logado vira linha de auditoria.
-- Mudanças sem usuário (service role, migrações) não são registradas aqui.
create or replace function public.auditar_licencas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and public.is_admin() then
    insert into public.admin_auditoria (admin_id, admin_email, acao, alvo_tipo, alvo_id, antes, depois)
    values (
      auth.uid(),
      (select u.email::text from auth.users u where u.id = auth.uid()),
      'licenca.' || lower(tg_op),
      'licenca',
      coalesce(new.id, old.id)::text,
      case when tg_op <> 'INSERT' then to_jsonb(old) end,
      case when tg_op <> 'DELETE' then to_jsonb(new) end
    );
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function public.auditar_licencas() from public;

drop trigger if exists licencas_auditoria on public.licencas;
create trigger licencas_auditoria
  after insert or update or delete on public.licencas
  for each row execute function public.auditar_licencas();
