-- Rubrica do responsável técnico, carregada pela página de perfil ou pelo
-- memorial (quadro "Rubrica" de cada folha do formulário do CBMPB). Fica no
-- perfil para valer em todos os projetos do usuário. Imagem pequena
-- (redimensionada no navegador, PNG) guardada como data URL.

alter table public.perfis add column if not exists rubrica text not null default '';

comment on column public.perfis.rubrica is
  'Rubrica do RT como data URL PNG (redimensionada no navegador, até ~600x200 px); vazio = sem rubrica.';
