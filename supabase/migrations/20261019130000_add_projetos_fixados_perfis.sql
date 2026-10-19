-- Projetos fixados no topo de "Meus projetos". Preferência da conta (não do
-- projeto): fica no perfil, sem mexer na versão/data de edição do projeto.

alter table public.perfis add column if not exists projetos_fixados text[] not null default '{}';

comment on column public.perfis.projetos_fixados is
  'IDs dos projetos fixados no topo da lista "Meus projetos", na ordem em que foram fixados.';
