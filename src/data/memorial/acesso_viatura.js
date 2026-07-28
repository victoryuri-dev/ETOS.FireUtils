// memorial/acesso_viatura.js — texto do memorial descritivo para Acesso de Viatura.
// Usa os MESMOS calc puros (av_calc.js) que alimentam a tela de dimensionamento —
// o texto nunca duplica a lógica de atende/não atende, só narra o resultado.

import { getAV } from '../normas/index'
import { calcGatilho, calcAcessoViatura } from '../av_calc'

const fmt = n => Number(n || 0).toFixed(2).replace('.', ',')
const ok  = (b, simNao = ['atendendo', 'não atendendo']) => b ? simNao[0] : simNao[1]

export function textoMemorialAcessoViatura(state, sistemas) {
  const { GATILHO, VIA_ACESSO } = getAV(state.uf)
  const inputs = state.acessoViatura || {}
  const altura = (state.estruturas || []).reduce((mx, e) => Math.max(mx, parseFloat(e.altura) || 0), 0)
  const temHidrantes = !!(sistemas || state.sistemas)?.hidrantes?.ativo

  const gat = calcGatilho(altura, inputs.afastamentoMeioFio, inputs.isCondominio, GATILHO)
  const paragrafos = []

  if (gat.motivo === 'condominio') {
    paragrafos.push(
      `Por se tratar de condomínio de residências uni/multifamiliares, a edificação está sujeita à exigência de via de acesso dedicada para viaturas do Corpo de Bombeiros, conforme Anexo A da NT 06/2021 CBMMA.`
    )
  } else {
    paragrafos.push(
      `Considerando a altura da edificação (${fmt(altura)} m) e o afastamento de ${fmt(inputs.afastamentoMeioFio)} m em relação ao meio-fio da via pública, ${gat.exigido ? 'superior' : 'dentro'} ao limite de ${gat.afastamentoMax} m estabelecido no Anexo A da NT 06/2021 CBMMA, ${gat.exigido ? 'é exigida via de acesso dedicada para viaturas do Corpo de Bombeiros.' : 'a via pública é suficiente para o acesso das viaturas, não sendo exigida via de acesso dedicada.'}`
    )
  }

  if (!gat.exigido) {
    return { titulo: 'Acesso de Viatura', paragrafos }
  }

  const r = calcAcessoViatura(inputs, VIA_ACESSO, { temHidrantes })

  paragrafos.push(
    `A via de acesso possui largura de ${fmt(r.largura.adotada)} m e altura livre de ${fmt(r.alturaLivre.adotada)} m, ${ok(r.largura.atende && r.alturaLivre.atende)} às dimensões mínimas de ${fmt(r.largura.minima)} m e ${fmt(r.alturaLivre.minima)} m exigidas pelos itens 5.1.1.1 e 5.1.1.2 da NT 06/2021 CBMMA.`
  )

  paragrafos.push(
    r.carga.confirmado
      ? `O pavimento da via de acesso foi dimensionado para suportar viaturas com peso de ${r.carga.minimaKg / 1000} t distribuídas em ${r.carga.eixos} eixos, conforme item 5.1.1.3 da NT 06/2021 CBMMA.`
      : `ATENÇÃO: a capacidade de carga do pavimento da via de acesso (mínimo de ${r.carga.minimaKg / 1000} t distribuídas em ${r.carga.eixos} eixos, item 5.1.1.3) ainda não foi confirmada pelo responsável pela estrutura.`
  )

  paragrafos.push(
    `O desnível da via de acesso é de ${fmt(r.desnivel.longAdotado)}% no sentido longitudinal e ${fmt(r.desnivel.transvAdotado)}% no sentido transversal, ${ok(r.desnivel.atendeLong && r.desnivel.atendeTransv)} ao limite máximo de ${r.desnivel.maximo}% estabelecido pelo item 5.1.1.4 da NT 06/2021 CBMMA.`
  )

  if (r.portao) {
    paragrafos.push(
      `O portão de acesso possui largura de ${fmt(r.portao.largura.adotada)} m e altura de ${fmt(r.portao.altura.adotada)} m, ${ok(r.portao.largura.atende && r.portao.altura.atende)} às dimensões mínimas de ${fmt(r.portao.largura.minima)} m e ${fmt(r.portao.altura.minima)} m exigidas pelo item 5.1.1.5 da NT 06/2021 CBMMA.`
    )
  }

  const tipoRetornoLabel = r.retorno.tipoRetorno === 'outro'
    ? (r.retorno.outroDesc || 'outro (não especificado)')
    : r.retorno.tipoRetorno

  paragrafos.push(
    r.retorno.exigeRetorno
      ? `Por possuir extensão de ${fmt(r.retorno.extensaoVia)} m, superior a ${r.retorno.gatilho} m, a via de acesso conta com retorno do tipo ${tipoRetornoLabel || '[a definir]'}, conforme item 5.1.1.6 da NT 06/2021 CBMMA.`
      : `A via de acesso possui extensão de ${fmt(r.retorno.extensaoVia)} m, não ultrapassando o limite de ${r.retorno.gatilho} m que exigiria a previsão de retorno (item 5.1.1.6 da NT 06/2021 CBMMA).`
  )

  if (r.retorno.saidaIndependente) {
    paragrafos.push(
      `Como as ruas internas não possibilitam manobra de retorno da viatura para saída pelo portão de acesso, foi prevista saída independente com largura de ${fmt(r.retorno.saidaIndependente.largura.adotada)} m e altura de ${fmt(r.retorno.saidaIndependente.altura.adotada)} m, ${ok(r.retorno.saidaIndependente.largura.atende && r.retorno.saidaIndependente.altura.atende)} às dimensões mínimas exigidas pelo item 5.1.1.6.2 da NT 06/2021 CBMMA.`
    )
  }

  paragrafos.push(
    `A via de acesso dista ${fmt(r.distancia.adotada)} m d${r.distancia.baseadoEm === 'hidrante' ? 'o hidrante de recalque' : 'a edificação'}, ${ok(r.distancia.atende)} ao limite máximo de ${r.distancia.maxima} m estabelecido pelo item 5.1.1.7 da NT 06/2021 CBMMA${r.distancia.baseadoEm === 'hidrante' ? ' (edificação com previsão de sistema de hidrantes/mangotinhos)' : ''}.`
  )

  return { titulo: 'Acesso de Viatura', paragrafos, atendeGeral: r.atendeGeral }
}
