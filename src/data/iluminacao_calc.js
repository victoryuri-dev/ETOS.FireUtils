// ─────────────────────────────────────────────────────────────────────────────
// iluminacao_calc.js — Funções universais de dimensionamento da Iluminação de
// Emergência (NT 18 CBMMA / NBR 10898). Recebem os dados normativos
// (iluminância mínima, catálogo de blocos) como parâmetro; não importam
// nenhum arquivo de estado diretamente. Mesmas funções alimentam a tela de
// dimensionamento e o texto do memorial — nunca duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

import { fmtNum } from '../utils/numero'

/** Nome de exibição de uma especificação de equipamento — usa a
 *  identificação informada pelo projetista quando houver; caso contrário
 *  cai no padrão "{label do tipo base} — {fluxo} lm" (ou só o label, se o
 *  fluxo ainda não foi preenchido). Mesma função usada na tela e no
 *  memorial — nunca dois textos diferentes para a mesma especificação. */
export function nomeEspecificacao(spec, baseLabel) {
  if (spec.identificacao) return spec.identificacao
  return spec.fluxoLuminosoLm ? `${baseLabel} — ${fmtNum(spec.fluxoLuminosoLm, 2, spec.fluxoLuminosoLm)} lm` : baseLabel
}
