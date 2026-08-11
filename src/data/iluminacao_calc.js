// ─────────────────────────────────────────────────────────────────────────────
// iluminacao_calc.js — Funções universais de dimensionamento da Iluminação de
// Emergência (NT 18 CBMMA / NBR 10898). Recebem os dados normativos (fator de
// utilização, iluminância mínima, catálogo de blocos, pontos de balizamento)
// como parâmetro; não importam nenhum arquivo de estado diretamente. Mesmas
// funções alimentam a tela de dimensionamento e o texto do memorial — nunca
// duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0

/** Área máxima coberta (m²) por uma luminária de aclaramento de determinado
 *  fluxo luminoso, pelo método simplificado (fluxo × fator de utilização ÷
 *  iluminância mínima exigida). */
export function areaCoberta(fluxoLuminoso, iluminanciaMinima, fatorUtilizacao) {
  const lux = num(iluminanciaMinima)
  if (!lux) return 0
  return (num(fluxoLuminoso) * num(fatorUtilizacao)) / lux
}

/** Resultado do dimensionamento de aclaramento de um pavimento: soma a área
 *  coberta por todos os itens cadastrados e compara com a área do pavimento.
 *  `equipamentos` é o mapa state.iluminacaoSistema.equipamentos — o fluxo
 *  luminoso de cada tipo (item.tipoEquipamento) é o dado técnico informado
 *  pelo projetista para o equipamento usado no projeto, não um catálogo fixo. */
export function calcularAclaramento(itens, areaPavimento, config) {
  const { equipamentos, iluminanciaMinima, fatorUtilizacao } = config
  const quantidadeTotal = itens.reduce((s, i) => s + (parseInt(i.quantidade) || 0), 0)
  const areaCobertaTotal = itens.reduce((s, i) => {
    const fluxo = num(equipamentos?.[i.tipoEquipamento]?.fluxoLuminosoLm)
    const cobertura = areaCoberta(fluxo, iluminanciaMinima, fatorUtilizacao)
    return s + cobertura * (parseInt(i.quantidade) || 0)
  }, 0)
  const area = num(areaPavimento)
  const minimoAtendido = quantidadeTotal > 0 && (area === 0 || areaCobertaTotal >= area)
  return { quantidadeTotal, areaCobertaTotal, area, minimoAtendido }
}

/** Resultado do checklist de balizamento de um pavimento: soma as
 *  quantidades cadastradas por tipo de ponto (mudança de direção, escada,
 *  porta de saída etc.) — cada ponto exige ao menos 1 luminária própria. */
export function calcularBalizamento(itens, pontosBalizamento) {
  const porPonto = {}
  pontosBalizamento.forEach(p => { porPonto[p.key] = 0 })
  itens.forEach(i => { porPonto[i.pontoTipo] = (porPonto[i.pontoTipo] || 0) + (parseInt(i.quantidade) || 0) })

  const quantidadeTotal = Object.values(porPonto).reduce((s, v) => s + v, 0)
  const pontosCadastrados = Object.values(porPonto).filter(v => v > 0).length
  const minimoAtendido = quantidadeTotal > 0

  return { porPonto, quantidadeTotal, pontosCadastrados, minimoAtendido }
}

/** Conformidade completa de um pavimento — combina aclaramento e balizamento
 *  num único resultado, usado tanto pelos Chips da tela quanto pelo memorial. */
export function conformidadePavimento(itensAclaramento, itensBalizamento, areaPavimento, config) {
  const aclaramento = calcularAclaramento(itensAclaramento, areaPavimento, config.aclaramento)
  const balizamento = calcularBalizamento(itensBalizamento, config.pontosBalizamento)
  return { aclaramento, balizamento, conforme: aclaramento.minimoAtendido && balizamento.minimoAtendido }
}
