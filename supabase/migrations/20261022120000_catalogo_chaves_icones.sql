-- O catálogo publicado guarda os ícones das categorias em
-- `category-icons/<id>.svg`, não só em `icons/`. Aceita as duas pastas nas
-- restrições das tabelas, nas políticas de Storage do admin e (na Edge
-- Function) na leitura do bucket. Corrige a migração 20261020150000 já
-- aplicada: a importação do catálogo atual falhava em icon_key_check.
--
-- Idempotente: pode rodar de novo sem efeito.

alter table public.catalogo_categorias drop constraint if exists catalogo_categorias_icon_key_check;
alter table public.catalogo_categorias add constraint catalogo_categorias_icon_key_check
  check (icon_key ~ '^(icons|category-icons)/[A-Za-z0-9_.-]+$' and icon_key not like '%..%');

alter table public.catalogo_config drop constraint if exists catalogo_config_todas_icon_key_check;
alter table public.catalogo_config add constraint catalogo_config_todas_icon_key_check
  check (todas_icon_key ~ '^(icons|category-icons)/[A-Za-z0-9_.-]+$' and todas_icon_key not like '%..%');

-- Storage: o admin gerencia os .rfa e, em plugin-assets, icons/,
-- category-icons/ e thumbnails/ (o catalog.json é escrito só pela Edge Function).
drop policy if exists catalogo_admin_insert on storage.objects;
create policy catalogo_admin_insert on storage.objects for insert to authenticated
  with check (public.is_admin() and (
    bucket_id = 'revit-families'
    or (bucket_id = 'plugin-assets' and (name like 'icons/%' or name like 'category-icons/%' or name like 'thumbnails/%'))
  ));

drop policy if exists catalogo_admin_update on storage.objects;
create policy catalogo_admin_update on storage.objects for update to authenticated
  using (public.is_admin() and (
    bucket_id = 'revit-families'
    or (bucket_id = 'plugin-assets' and (name like 'icons/%' or name like 'category-icons/%' or name like 'thumbnails/%'))
  ))
  with check (public.is_admin() and (
    bucket_id = 'revit-families'
    or (bucket_id = 'plugin-assets' and (name like 'icons/%' or name like 'category-icons/%' or name like 'thumbnails/%'))
  ));

drop policy if exists catalogo_admin_delete on storage.objects;
create policy catalogo_admin_delete on storage.objects for delete to authenticated
  using (public.is_admin() and (
    bucket_id = 'revit-families'
    or (bucket_id = 'plugin-assets' and (name like 'icons/%' or name like 'category-icons/%' or name like 'thumbnails/%'))
  ));
