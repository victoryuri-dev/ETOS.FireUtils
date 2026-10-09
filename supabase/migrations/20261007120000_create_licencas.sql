-- Licenças por ferramenta: o que cada conta pode usar (Plugin Revit, Memorial
-- Web) e em que situação está. É o que a aba "Ferramentas" da página de
-- perfil mostra.
--
-- Uma linha por usuário + ferramenta. Quem não tem linha simplesmente não tem
-- licença daquela ferramenta — o site trata como "sem licença", não como erro.
--
-- "Expirada" não é um valor de `situacao`: sai de `expira_em` já ter passado,
-- pra não depender de alguém (ou de um job) virar o status na data certa.
--
-- (A divisão por ferramenta foi trocada pela divisão por módulo na migração
-- seguinte, 20261007123000_licencas_por_modulo.)

create table if not exists public.licencas (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  ferramenta    text        not null check (ferramenta in ('plugin', 'memorial')),
  plano         text        not null default '',
  situacao      text        not null default 'ativa'
                            check (situacao in ('ativa', 'teste', 'suspensa', 'cancelada')),
  inicio_em     date        not null default current_date,
  expira_em     date,
  atualizado_em timestamptz not null default now(),
  unique (user_id, ferramenta)
);

comment on table public.licencas is
  'Licença de cada conta por ferramenta (plugin, memorial). Lida pela aba Ferramentas do perfil.';
comment on column public.licencas.plano is
  'Nome comercial exibido ao usuário (ex.: "FireUtils PRO — Anual"). Texto livre.';
comment on column public.licencas.expira_em is
  'Último dia de validade. Nulo = sem data de término.';

alter table public.licencas enable row level security;

-- O usuário só LÊ as próprias licenças. Sem política de insert/update/delete
-- de propósito: quem concede ou altera licença é a administração (painel do
-- Supabase / service role), nunca a própria conta.
drop policy if exists licencas_select_proprio on public.licencas;
create policy licencas_select_proprio
  on public.licencas for select to authenticated
  using (auth.uid() = user_id);
