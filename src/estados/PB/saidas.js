// Resumo das saídas de emergência para o item 10 do formulário da PB — os
// mesmos cálculos de se_calc.js da página de Saída de Emergência (comum aos
// estados, com a norma do estado: NT 12/2025 na PB). Larguras: a maior
// largura mínima entre os nós/ambientes do projeto; distâncias: os valores
// por divisão; tipo de escada: Tabela 3 por estrutura. O Anexo A do
// formulário é o texto do dimensionamento (memorial/saida_emergencia.js).
import { getSE } from '../../data/normas/index'
import {
  calcPopPav, calcDimsAcesso, dimsDoAcesso, calcNoAmbientePT, contarSaidasPavimento,
  getDistancia, tipoEscadaEstrutura,
} from '../../data/se_calc'

export function resumoSaidasPB(state, porEstrutura = []) {
  const se = getSE(state.uf)
  if (!se) return null
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS, DISTANCIAS_MAXIMAS } = se
  const sistemasPorEst = Object.fromEntries(porEstrutura.map(pe => [pe.estrutura.id, pe.sistemas]))
  let popMax = 0, popTotal = 0, larAD = 0, larER = 0, larPT = 0
  const distDescarga = [], distDemais = [], escadas = []
  // Escadas/rampas só existem com mais de um pavimento (contando subsolos)
  // em alguma estrutura; "demais andares", com pavimento fora do de descarga.
  let temEscada = false, temDemaisAndares = false

  ;(state.estruturas || []).forEach(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    const temChuveiros = !!sistemasPorEst[est.id]?.sprinklers?.ativo
    const temDeteccao  = !!sistemasPorEst[est.id]?.deteccao?.ativo
    pavs.forEach(pav => {
      const ambientes = pav.ambientes || []
      const acessos = pav.acessos || []
      const pop = calcPopPav({ ambientes }, TAXA_POPULACIONAL)
      popTotal += pop
      popMax = Math.max(popMax, pop)
      acessos.forEach(ac => {
        const r = calcDimsAcesso(ac.id, ambientes, acessos, TAXA_POPULACIONAL, LARGURAS_MINIMAS, dimsDoAcesso(ac, !!pav.pisoDescarga))
        if (r.ad) larAD = Math.max(larAD, r.ad.la)
        if (r.er) larER = Math.max(larER, r.er.la)
        if (r.pt) larPT = Math.max(larPT, r.pt.la)
      })
      ambientes.forEach(amb => { larPT = Math.max(larPT, calcNoAmbientePT(amb, TAXA_POPULACIONAL, LARGURAS_MINIMAS).pt.la) })
      if (pav.divisao) {
        const d = getDistancia(pav.divisao, !!pav.pisoDescarga, Math.max(1, contarSaidasPavimento(acessos)), temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS)
        if (d != null) (pav.pisoDescarga ? distDescarga : distDemais).push({ valor: d, divisao: pav.divisao })
      }
    })
    if ((parseInt(est.nPavimentos) || 1) + (parseInt(est.nSubsolos) || 0) > 1) temEscada = true
    if (pavs.some(p => !p.pisoDescarga)) temDemaisAndares = true
    const esc = tipoEscadaEstrutura(est, pavs.map(p => p.divisao), se.TIPOS_ESCADA)
    if (esc?.status === 'ok') escadas.push(esc.exigido)
  })
  return { popMax, popTotal, larAD, larER, larPT, distDescarga, distDemais, escadas, temEscada, temDemaisAndares }
}
