-- Perfil da conta: dados do usuário e do responsável técnico que ele costuma
-- assinar. Antes desta tabela, o RT era redigitado na Etapa 3 a cada projeto
-- novo, sempre com os mesmos valores (nome, CREA/CAU, CPF, empresa) — aqui
-- eles ficam uma vez só e a etapa passa a copiar deles.
--
-- Uma linha por usuário (user_id é a chave primária), criada sob demanda no
-- primeiro salvamento da página de perfil — não há trigger de signup, então
-- quem nunca abriu a página simplesmente não tem linha, e o site trata isso
-- como perfil vazio.

create table if not exists public.perfis (
  user_id             uuid        primary key references auth.users(id) on delete cascade,
  nome                text        not null default '',
  telefone            text        not null default '',
  responsavel_tecnico jsonb       not null default '{}'::jsonb,
  atualizado_em       timestamptz not null default now()
);

comment on table public.perfis is
  'Configurações da conta e dados padrão do responsável técnico, reaproveitados ao preencher a Etapa 3 de um projeto.';
comment on column public.perfis.responsavel_tecnico is
  'Bloco do projetista com as MESMAS chaves do estado do projeto (rtNome, rtConselho, rtCpf, rtEspecialidade, rtEmpresa, rtEmail, rtTelefone), pra que aplicar o perfil num projeto seja cópia direta, sem tabela de-para. A ART fica de fora de propósito: número, data e valor da obra são de cada projeto, não do profissional.';

alter table public.perfis enable row level security;

-- Cada usuário enxerga e grava apenas a própria linha. Sem política de
-- delete: a linha some junto com a conta, pelo cascade acima.
drop policy if exists perfis_select_proprio on public.perfis;
create policy perfis_select_proprio
  on public.perfis for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists perfis_insert_proprio on public.perfis;
create policy perfis_insert_proprio
  on public.perfis for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists perfis_update_proprio on public.perfis;
create policy perfis_update_proprio
  on public.perfis for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
