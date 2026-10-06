-- memorial/sinalizacao.js parou de injetar NOTAS.quantidade no parágrafo de
-- abertura do memorial (o texto completo — já corrigido pra "NT 11" na
-- migration anterior, 20261005130000 — ainda aparecia no PDF entregue ao
-- CBMMA, mesmo sem a instrução de interface "cadastre aqui..."). O campo
-- continua existindo só pra referência normativa na tela (SinalizacaoPage.jsx
-- lê NOTAS.quantidade no card "Parâmetros normativos") — reduzido à frase
-- objetiva, sem o apêndice de instrução de tela.

update public.normas_dados
set
  dados = jsonb_set(
    dados,
    '{notas,quantidade}',
    '"A quantidade de placas de orientação e saída de emergência decorre diretamente do dimensionamento das rotas de fuga feito em Saída de Emergência (NT 11 CBMMA)."'::jsonb
  ),
  versao = normas_dados.versao + 1,
  atualizado_em = now()
where uf = 'MA' and sistema = 'sinalizacao';
