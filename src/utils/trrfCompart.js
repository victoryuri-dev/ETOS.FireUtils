// TRRF de uma estrutura (segurança estrutural, norma do estado) — base do
// TRRF automático dos elementos de compartimentação (compart_calc.js). Mesmo
// valor na página de compartimentação, no memorial e no formulário da PB.
import { getTRRF } from '../data/normas/index'
import { calcularTRRF } from '../data/trrf_calc'
import { trrfMaximoDaEstrutura } from '../data/compart_calc'

export function trrfDaEstrutura(state, est) {
  const t = getTRRF(state.uf)
  if (!t?.TABELA_TRRF) return null
  const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
  return trrfMaximoDaEstrutura(calcularTRRF(pavs, est, t.TABELA_TRRF, t.CLASSES_ALTURA, t.CLASSES_SUBSOLO, t.DIVISOES_SEM_OCUPACAO_SUBSOLO))
}
