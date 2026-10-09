-- LIGA O BLOQUEIO NO BANCO: sem licença válida, a conta não cria nem altera
-- projetos. Só aplique DEPOIS de conceder licença a quem já usa o sistema —
-- a partir desta migração, quem não tiver linha válida em `licencas` fica
-- sem poder salvar.
--
-- Política RESTRITIVA: soma-se (com AND) às políticas que a tabela já tem,
-- sem substituir nenhuma. Continua valendo "só o dono mexe no próprio
-- projeto"; passa a valer também "e precisa de licença".
--
-- Ler e excluir os próprios projetos continua liberado mesmo sem licença: os
-- dados são do usuário, e o que a licença dá é o direito de trabalhar neles.
-- A tela do site é que deixa de abrir os projetos (ver LicencaContext).
--
-- Pra desligar: drop das duas políticas abaixo.

drop policy if exists projetos_insert_exige_licenca on public.projetos;
create policy projetos_insert_exige_licenca
  on public.projetos as restrictive for insert to authenticated
  with check (public.tem_licenca());

drop policy if exists projetos_update_exige_licenca on public.projetos;
create policy projetos_update_exige_licenca
  on public.projetos as restrictive for update to authenticated
  using (public.tem_licenca())
  with check (public.tem_licenca());
