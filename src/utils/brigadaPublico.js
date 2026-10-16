import { getBrigada, getSE } from '../data/normas/index'
import { calcPopPav } from '../data/se_calc'

// Opções de calcularBrigadaPavimento para o dimensionamento pela população
// máxima do local (DIMENSIONAMENTO_PUBLICO da norma de brigada — PB, item
// 4.11.2): o público é a população da edificação inteira — soma dos
// pavimentos da estrutura, calculada na Saída de Emergência. Estado sem
// essa regra → {} (cálculo só pela Tabela A.1).
export function opcoesPublicoBrigada(uf, pavimentosDaEstrutura) {
  const dimensionamentoPublico = getBrigada(uf)?.DIMENSIONAMENTO_PUBLICO
  if (!dimensionamentoPublico) return {}
  const taxa = getSE(uf)?.TAXA_POPULACIONAL
  const publico = taxa
    ? (pavimentosDaEstrutura || []).reduce((s, p) => s + calcPopPav({ ambientes: p.ambientes || [] }, taxa), 0)
    : 0
  return { dimensionamentoPublico, publico }
}
