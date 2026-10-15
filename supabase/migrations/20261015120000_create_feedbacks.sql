-- Feedbacks enviados pelo botão flutuante presente em toda a plataforma:
-- sugestões de implementação ou relatos de erro. Guarda de qual página veio
-- (pathname) e quem enviou, pra facilitar reproduzir o problema depois.
--
-- Só é possível inserir (nunca ler, editar ou apagar pela interface) — a
-- leitura é feita pela administração direto no painel do Supabase.

create table if not exists public.feedbacks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  usuario     text        not null default '',
  pagina      text        not null default '',
  mensagem    text        not null,
  criado_em   timestamptz not null default now()
);

comment on table public.feedbacks is
  'Feedbacks e relatos de erro enviados pelo botão flutuante da plataforma.';
comment on column public.feedbacks.usuario is
  'E-mail de quem enviou, no momento do envio (texto livre, não referencia auth.users diretamente).';
comment on column public.feedbacks.pagina is
  'Caminho (pathname) da página de onde o feedback foi enviado.';

alter table public.feedbacks enable row level security;

drop policy if exists feedbacks_insert_proprio on public.feedbacks;
create policy feedbacks_insert_proprio
  on public.feedbacks for insert to authenticated
  with check (auth.uid() = user_id);
