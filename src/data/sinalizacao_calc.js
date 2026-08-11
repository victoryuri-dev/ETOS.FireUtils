// ─────────────────────────────────────────────────────────────────────────────
// sinalizacao_calc.js — Funções universais do checklist de Sinalização de
// Emergência (NT 20 CBMMA / NBR 13434). Recebem o catálogo normativo
// (TIPOS_PLACA) como parâmetro; não importam nenhum arquivo de estado
// diretamente. Mesmas funções alimentam a tela de quantidades e o texto do
// memorial — nunca duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

/** Totais de um pavimento: quantidade cadastrada por tipo de placa e total
 *  geral, agrupados por categoria (proibição, alerta, orientação, equipamentos). */
export function calcularSinalizacaoPavimento(itens, tiposPlaca) {
  const porTipo = {}
  tiposPlaca.forEach(t => { porTipo[t.key] = 0 })
  itens.forEach(i => { porTipo[i.tipoPlaca] = (porTipo[i.tipoPlaca] || 0) + (parseInt(i.quantidade) || 0) })

  const quantidadeTotal = Object.values(porTipo).reduce((s, v) => s + v, 0)
  const tiposCadastrados = Object.values(porTipo).filter(v => v > 0).length

  const porCategoria = {}
  tiposPlaca.forEach(t => {
    if (!porCategoria[t.categoria]) porCategoria[t.categoria] = 0
    porCategoria[t.categoria] += porTipo[t.key]
  })

  return { porTipo, porCategoria, quantidadeTotal, tiposCadastrados }
}
