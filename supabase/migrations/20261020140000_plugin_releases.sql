-- Versões do plugin publicadas pelo painel FireUtils.admin.
--
-- Cada linha é um arquivo em `plugin-releases`: um instalador
-- (FireUtils-Setup-X.Y.Z.exe + .sha256) ou um pacote de atualização rápida
-- (FireUtils-Pacote-X.Y.Z-base-B.zip + .sig). A versão só aparece para os
-- clientes depois de `publicada = true`; rascunhos ficam visíveis só para o
-- admin, inclusive no Storage.
--
-- Compatibilidade: enquanto a dockpane ainda lista o bucket pelo nome dos
-- arquivos, os nomes seguem exatamente o padrão de antes. Os arquivos que já
-- estão no bucket entram aqui como publicados (backfill abaixo), senão a
-- política nova os esconderia da dockpane atual.
--
-- Idempotente: pode rodar de novo sem efeito.

create table if not exists public.plugin_releases (
  id            uuid        primary key default gen_random_uuid(),
  versao        text        not null check (versao ~ '^\d+(\.\d+){0,3}$'),
  tipo          text        not null check (tipo in ('instalador', 'pacote')),
  arquivo       text        not null,
  base_minima   text        check (base_minima ~ '^\d+(\.\d+){0,3}$'),
  sha256        text        check (sha256 ~ '^[0-9a-f]{64}$'),
  tamanho_bytes bigint      check (tamanho_bytes >= 0),
  titulo        text        not null default '',
  notas         jsonb       not null default '[]'::jsonb,
  publicada     boolean     not null default false,
  publicada_em  timestamptz,
  criada_em     timestamptz not null default now(),
  criada_por    uuid        default auth.uid() references auth.users(id) on delete set null,
  unique (tipo, versao),
  unique (arquivo),
  check (jsonb_typeof(notas) = 'array'),
  -- Nome do arquivo coerente com o tipo e com a versão (e a base, no pacote).
  check (
    (tipo = 'instalador' and base_minima is null
      and arquivo = 'FireUtils-Setup-' || versao || '.exe')
    or
    (tipo = 'pacote' and base_minima is not null
      and arquivo = 'FireUtils-Pacote-' || versao || '-base-' || base_minima || '.zip')
  )
);

comment on table public.plugin_releases is
  'Versões do plugin (instalador ou pacote) no bucket plugin-releases. Clientes licenciados só veem as publicadas.';

alter table public.plugin_releases enable row level security;

drop policy if exists plugin_releases_select_licenciados on public.plugin_releases;
create policy plugin_releases_select_licenciados on public.plugin_releases
  for select to authenticated
  using (publicada and public.tem_licenca());

-- publicada_em acompanha a publicação; o que identifica o arquivo não muda
-- depois de criado (só título, notas e publicada).
create or replace function public.plugin_releases_guarda()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.versao is distinct from old.versao
       or new.tipo is distinct from old.tipo
       or new.arquivo is distinct from old.arquivo
       or new.base_minima is distinct from old.base_minima
       or new.sha256 is distinct from old.sha256
       or new.tamanho_bytes is distinct from old.tamanho_bytes then
      raise exception 'versao, tipo, arquivo, base, hash e tamanho nao podem ser alterados' using errcode = '23514';
    end if;
    if new.publicada and not old.publicada then
      new.publicada_em := now();
    elsif not new.publicada then
      new.publicada_em := null;
    end if;
  elsif tg_op = 'INSERT' and new.publicada then
    new.publicada_em := coalesce(new.publicada_em, now());
  end if;
  return new;
end;
$$;

drop trigger if exists plugin_releases_guarda on public.plugin_releases;
create trigger plugin_releases_guarda
  before insert or update on public.plugin_releases
  for each row execute function public.plugin_releases_guarda();

-- Admin: lê, cria e altera tudo. Versão publicada não se apaga: despublique
-- primeiro; só rascunho pode ser excluído.
drop policy if exists plugin_releases_admin_select on public.plugin_releases;
create policy plugin_releases_admin_select on public.plugin_releases
  for select to authenticated using (public.is_admin());
drop policy if exists plugin_releases_admin_insert on public.plugin_releases;
create policy plugin_releases_admin_insert on public.plugin_releases
  for insert to authenticated with check (public.is_admin());
drop policy if exists plugin_releases_admin_update on public.plugin_releases;
create policy plugin_releases_admin_update on public.plugin_releases
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists plugin_releases_admin_delete on public.plugin_releases;
create policy plugin_releases_admin_delete on public.plugin_releases
  for delete to authenticated using (public.is_admin() and not publicada);

-- Auditoria das mudanças feitas por um admin logado.
create or replace function public.auditar_plugin_releases()
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
      'versao.' || lower(tg_op),
      'versao',
      coalesce(new.id, old.id)::text,
      case when tg_op <> 'INSERT' then to_jsonb(old) end,
      case when tg_op <> 'DELETE' then to_jsonb(new) end
    );
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function public.auditar_plugin_releases() from public;

drop trigger if exists plugin_releases_auditoria on public.plugin_releases;
create trigger plugin_releases_auditoria
  after insert or update or delete on public.plugin_releases
  for each row execute function public.auditar_plugin_releases();

-- Backfill: arquivos que já estão no bucket entram como publicados, sem notas
-- (as notas continuam em patchNotes.js até a dockpane ler esta tabela).
insert into public.plugin_releases (versao, tipo, arquivo, tamanho_bytes, publicada, publicada_em)
select substring(o.name from '^FireUtils-Setup-(\d+(?:\.\d+){0,3})\.exe$'),
       'instalador', o.name, (o.metadata->>'size')::bigint, true, coalesce(o.created_at, now())
from storage.objects o
where o.bucket_id = 'plugin-releases'
  and o.name ~ '^FireUtils-Setup-\d+(\.\d+){0,3}\.exe$'
on conflict do nothing;

insert into public.plugin_releases (versao, tipo, arquivo, base_minima, tamanho_bytes, publicada, publicada_em)
select (regexp_match(o.name, '^FireUtils-Pacote-(\d+(?:\.\d+){0,3})-base-(\d+(?:\.\d+){0,3})\.zip$'))[1],
       'pacote', o.name,
       (regexp_match(o.name, '^FireUtils-Pacote-(\d+(?:\.\d+){0,3})-base-(\d+(?:\.\d+){0,3})\.zip$'))[2],
       (o.metadata->>'size')::bigint, true, coalesce(o.created_at, now())
from storage.objects o
where o.bucket_id = 'plugin-releases'
  and o.name ~ '^FireUtils-Pacote-\d+(\.\d+){0,3}-base-\d+(\.\d+){0,3}\.zip$'
on conflict do nothing;

-- Storage: o admin gerencia tudo no bucket; o cliente licenciado só lê os
-- arquivos de uma versão publicada (o arquivo, o .sha256 e o .sig).
drop policy if exists plugin_releases_select_licenciados on storage.objects;
create policy plugin_releases_select_licenciados
  on storage.objects for select to authenticated
  using (
    bucket_id = 'plugin-releases'
    and public.tem_licenca()
    and exists (
      select 1 from public.plugin_releases r
      where r.publicada
        and storage.objects.name in (r.arquivo, r.arquivo || '.sha256', r.arquivo || '.sig')
    )
  );

drop policy if exists plugin_releases_admin_select on storage.objects;
create policy plugin_releases_admin_select
  on storage.objects for select to authenticated
  using (bucket_id = 'plugin-releases' and public.is_admin());

drop policy if exists plugin_releases_admin_insert on storage.objects;
create policy plugin_releases_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'plugin-releases' and public.is_admin());

drop policy if exists plugin_releases_admin_update on storage.objects;
create policy plugin_releases_admin_update
  on storage.objects for update to authenticated
  using (bucket_id = 'plugin-releases' and public.is_admin())
  with check (bucket_id = 'plugin-releases' and public.is_admin());

drop policy if exists plugin_releases_admin_delete on storage.objects;
create policy plugin_releases_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'plugin-releases' and public.is_admin());
