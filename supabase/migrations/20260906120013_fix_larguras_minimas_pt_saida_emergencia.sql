-- Corrige a largura mínima de porta (PT) pra 2/3/4 UP nas normas de
-- saída de emergência já semeadas (MA e PB).
--
-- larguras_minimas.PT guardava a largura da FAIXA como 1,00 / 1,50 / 2,00
-- m — só que calcPT (se_calc.js) faz max(N_UP x LARG_UP, largura_da_faixa),
-- e N_UP x LARG_UP (2x0,55=1,10 / 3x0,55=1,65 / 4x0,55=2,20) sempre vencia
-- essa comparação, então o site já EXIBIA os valores certos (1,10/1,65/
-- 2,20) — só que por acidente da fórmula, não porque a tabela dissesse
-- isso. Essa migration alinha a tabela com o valor de fato exigido pra
-- cada faixa, deixando de depender desse acidente. A partir de 5 UP (fora
-- da tabela, sem faixa própria) o cálculo continua multiplicando por
-- LARG_UP livremente — nada muda aí.

update public.normas_dados
set dados = jsonb_set(
  dados,
  '{larguras_minimas,PT}',
  '[
    {"n_up": 1, "largura": 0.8,  "tipo": "1 folha"},
    {"n_up": 2, "largura": 1.1,  "tipo": "1 folha"},
    {"n_up": 3, "largura": 1.65, "tipo": "2 folhas"},
    {"n_up": 4, "largura": 2.2,  "tipo": "2 folhas"}
  ]'::jsonb
),
    versao = versao + 1,
    atualizado_em = now()
where sistema = 'saida_emergencia'
  and uf in ('MA', 'PB');
