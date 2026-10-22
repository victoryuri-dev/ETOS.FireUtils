-- Enviar miniaturas e ícones para plugin-assets falhava com "new row violates
-- row-level security policy". O Storage grava com INSERT ... RETURNING (e, no
-- upsert, ON CONFLICT DO UPDATE), e o Postgres exige uma política de SELECT
-- que enxergue a linha. A migração 20261020150000 deu SELECT ao admin só em
-- revit-families; aqui vai o de plugin-assets (icons/, category-icons/ e
-- thumbnails/ — o resto do bucket não é do catálogo). Os arquivos já são
-- públicos, então isso não expõe nada novo.
--
-- Idempotente: pode rodar de novo sem efeito.

drop policy if exists catalogo_admin_select on storage.objects;
create policy catalogo_admin_select on storage.objects for select to authenticated
  using (public.is_admin() and (
    bucket_id = 'revit-families'
    or (bucket_id = 'plugin-assets' and (name like 'icons/%' or name like 'category-icons/%' or name like 'thumbnails/%'))
  ));
