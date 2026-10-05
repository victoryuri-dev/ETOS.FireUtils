-- O catálogo de sinalização (normas_dados, uf='MA', sistema='sinalizacao')
-- citava "NT 14 CBMMA" como a norma de Saída de Emergência — errado: NT 14
-- é Carga de Incêndio; Saída de Emergência é NT 11 (ver normas/MA/nts.js).
-- A nota também trazia uma instrução de interface ("cadastre aqui as
-- placas...") que não deveria aparecer no memorial final entregue ao
-- CBMMA — só fazia sentido como texto de tela.
--
-- Corrige a referência em NOTAS.quantidade e em cada quantidadeRef de
-- tipos_placa (S1 a S17) sem reescrever o restante do catálogo, pra não
-- arriscar reintroduzir qualquer ajuste feito por outras migrations desde
-- a seed original (20261005120000_seed_normas_sinalizacao_s1_s2_variantes).

update public.normas_dados
set
  dados = jsonb_set(
    jsonb_set(
      dados,
      '{notas,quantidade}',
      '"A quantidade de placas de orientação e saída de emergência decorre diretamente do dimensionamento das rotas de fuga feito em Saída de Emergência (NT 11 CBMMA). As tabelas a seguir relacionam as placas efetivamente adotadas no projeto, por estrutura."'::jsonb
    ),
    '{tipos_placa}',
    (
      select jsonb_agg(
        case
          when elem->>'quantidadeRef' like '%NT 14%'
            then jsonb_set(elem, '{quantidadeRef}', '"O necessário para atender ao dimensionamento de Saída de Emergência (NT 11)"'::jsonb)
          else elem
        end
      )
      from jsonb_array_elements(dados->'tipos_placa') as elem
    )
  ),
  versao = normas_dados.versao + 1,
  atualizado_em = now()
where uf = 'MA' and sistema = 'sinalizacao';
