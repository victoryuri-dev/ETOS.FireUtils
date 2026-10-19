-- Bucket PRIVADO com os instaladores do plugin Revit. A dockpane
-- (FireUtils.extension) lê a lista de versões para
-- avisar quem tem o plugin instalado de que há versão nova — ou de que a
-- versão dele é antiga demais para a interface atual — e gera um link de
-- download de curta duração para o instalador.
--
-- Conteúdo: só os instaladores, enviados pelo painel do Supabase (Storage) a
-- cada versão, com o nome que o build.ps1 gera (FireUtils-Setup-X.Y.Z.exe).
-- A dockpane lista o bucket e oferece o de maior versão; não há manifesto.
--
-- Só LÊ quem tem licença válida (qualquer módulo): atualizar o plugin é
-- assunto de quem já é cliente — quem ainda vai instalar pela primeira vez
-- baixa pelo site. Sem política de insert/update/delete de propósito: quem
-- publica é a administração, pelo painel ou service role.
--
-- Idempotente: pode rodar de novo sem efeito.

insert into storage.buckets (id, name, public)
values ('plugin-releases', 'plugin-releases', false)
on conflict (id) do nothing;

drop policy if exists plugin_releases_select_licenciados on storage.objects;
create policy plugin_releases_select_licenciados
  on storage.objects for select to authenticated
  using (bucket_id = 'plugin-releases' and public.tem_licenca());
