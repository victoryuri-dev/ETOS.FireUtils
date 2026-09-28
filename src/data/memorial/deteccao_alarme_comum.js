// memorial/deteccao_alarme_comum.js — blocos compartilhados pelos memoriais de
// Alarme (alarme_incendio.js) e Detecção (deteccao_incendio.js) de Incêndio,
// que seguem a mesma norma (NT 19). Nada aqui repete regra de cálculo: os
// números vêm da norma (getDeteccaoAlarme) e do calc puro
// (deteccao_alarme_calc.js), e o texto só narra o resultado.

import { fmtNum } from '../deteccao_alarme_calc'

export const fmt = (n, c = 2) => fmtNum(n, c)

/** "item 5.3 da NT 19/2021 CBMMA" (ou só a sigla, se a norma não numera o item). */
export function cita(norma, chave, opcoes = {}) {
  const item = norma.ITENS?.[chave]
  const sigla = norma.NORMA.sigla
  return item ? `${opcoes.plural ? 'itens' : 'item'} ${item} da ${sigla}` : sigla
}

export function listaDivisoes(pavs) {
  return [...new Set(pavs.map(p => p.divisao).filter(Boolean))].join(', ') || '—'
}

/** Estruturas com pavimentos em que a medida está ativa. Só `ativo` — ele já
 *  cai para `obrigatorio` quando não há override manual (useMedidasObrigatorias);
 *  com `ativo || obrigatorio`, uma estrutura desativada manualmente em
 *  Configuração continuaria entrando no memorial. */
export function estruturasDaMedida(state, porEstrutura, chave) {
  const porId = Object.fromEntries((porEstrutura || []).map(pe => [pe.estrutura.id, pe]))
  return (state.estruturas || [])
    .map(est => ({
      est,
      pavs: (state.pavimentos || []).filter(p => p.estruturaId === est.id),
      pe: porId[est.id],
    }))
    .filter(({ pavs, pe }) => pavs.length > 0 && pe?.sistemas?.[chave]?.ativo)
}
