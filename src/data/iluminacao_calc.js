// ─────────────────────────────────────────────────────────────────────────────
// iluminacao_calc.js — Funções universais de dimensionamento da Iluminação de
// Emergência (NT 18 CBMMA / NBR 10898). Recebem os dados normativos
// (iluminância mínima, catálogo de blocos, pontos de balizamento) como
// parâmetro; não importam nenhum arquivo de estado diretamente. Mesmas
// funções alimentam a tela de dimensionamento e o texto do memorial — nunca
// duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

/** Nome de exibição de uma especificação de equipamento — usa a
 *  identificação informada pelo projetista quando houver; caso contrário
 *  cai no padrão "{label do tipo base} — {fluxo} lm" (ou só o label, se o
 *  fluxo ainda não foi preenchido). Mesma função usada na tela e no
 *  memorial — nunca dois textos diferentes para a mesma especificação. */
export function nomeEspecificacao(spec, baseLabel) {
  if (spec.identificacao) return spec.identificacao
  return spec.fluxoLuminosoLm ? `${baseLabel} — ${spec.fluxoLuminosoLm} lm` : baseLabel
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
