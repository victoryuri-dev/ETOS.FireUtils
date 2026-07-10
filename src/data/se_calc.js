// ─────────────────────────────────────────────────────────────────────────────
// se_calc.js — Funções universais de dimensionamento de Saídas de Emergência
// Recebem os dados normativos do estado como parâmetro; não importam nenhum
// arquivo de estado diretamente.
// ─────────────────────────────────────────────────────────────────────────────

/** Largura mínima de PT para N UPs (recebe array LARGURAS_MINIMAS.PT) */
export function getLargMinPT(nUp, ptTable) {
  return ptTable.find(e => e.nUp === nUp) ?? (nUp > ptTable.at(-1).nUp ? ptTable.at(-1) : ptTable[0])
}

/** Capacidades por UP para um pavimento (mínima entre divisões presentes) */
export function capPavimento(pav, taxaPopulacional) {
  const divs = [...new Set(pav.ambientes.map(a => a.divisao).filter(d => d && taxaPopulacional[d]))]
  if (!divs.length) return { AD: 100, ER: 75, PT: 100 }
  return {
    AD: Math.min(...divs.map(d => taxaPopulacional[d].AD)),
    ER: Math.min(...divs.map(d => taxaPopulacional[d].ER)),
    PT: Math.min(...divs.map(d => taxaPopulacional[d].PT)),
  }
}

/** Calcula a população de um ambiente */
export function calcPopAmb(amb, taxaPopulacional) {
  if (amb.popTipo === 'fixo')   return Math.max(0, parseInt(amb.assentos)  || 0)
  if (amb.popTipo === 'manual') return Math.max(0, parseInt(amb.popManual) || 0)
  const taxa = taxaPopulacional[amb.divisao]
  if (!taxa || taxa.A === null) return Math.max(0, parseInt(amb.popManual) || 0)
  return Math.ceil((parseFloat(amb.area) || 0) / taxa.A)
}

/** Calcula a população total de um pavimento */
export function calcPopPav(pav, taxaPopulacional) {
  return pav.ambientes.reduce((s, a) => s + calcPopAmb(a, taxaPopulacional), 0)
}

/** Pavimento mais populoso excluindo piso de descarga */
export function pavMaisPopuloso(pavimentos, taxaPopulacional) {
  return pavimentos
    .filter(p => p.tipo !== 'descarga')
    .reduce((mx, p) => calcPopPav(p, taxaPopulacional) > (mx ? calcPopPav(mx, taxaPopulacional) : -1) ? p : mx, null)
}

/** Cálculo de AD para um pavimento */
export function calcAD(pop, capAD, larguras) {
  const n  = Math.ceil(pop / capAD)
  const lc = +(n * larguras.LARG_UP).toFixed(2)
  return { n, lc, la: Math.max(lc, larguras.AD), lMin: larguras.AD }
}

/** Cálculo de ER para o pavimento mais populoso */
export function calcER(pop, capER, larguras) {
  const n  = Math.ceil(pop / capER)
  const lc = +(n * larguras.LARG_UP).toFixed(2)
  return { n, lc, la: Math.max(lc, larguras.ER), lMin: larguras.ER }
}

/** Cálculo de PT para um pavimento */
export function calcPT(pop, capPT, larguras) {
  const n      = Math.ceil(pop / capPT)
  const lc     = +(n * larguras.LARG_UP).toFixed(2)
  const ptInfo = getLargMinPT(n, larguras.PT)
  return { n, lc, la: Math.max(lc, ptInfo.largura), lMin: ptInfo.largura, tipo: ptInfo.tipo }
}

/** Retorna o bloco de distância para uma divisão */
export function getBlocoDistancia(divisao, blocosDistancia) {
  return blocosDistancia.find(b => b.divisoes.includes(divisao)) ?? null
}

/** Distância máxima para uma divisão com os parâmetros dados */
export function getDistancia(divisao, pisoDescarga, nUpsAD, temChuveiros, temDeteccao, blocosDistancia) {
  const bloco = getBlocoDistancia(divisao, blocosDistancia)
  if (!bloco) return null
  const andar  = pisoDescarga ? bloco.piso_de_descarga : bloco.demais_andares
  const chuv   = temChuveiros ? 'com_chuveiros' : 'sem_chuveiros'
  const saidas = nUpsAD > 1 ? 'mais_de_uma_saida' : 'saida_unica'
  const detec  = temDeteccao ? 'com_deteccao' : 'sem_deteccao'
  return andar[chuv]?.[saidas]?.[detec] ?? null
}

/** Distância mínima (mais restritiva) para um pavimento inteiro */
export function getDistanciaPavimento(pav, nUpsAD, temChuveiros, temDeteccao, blocosDistancia) {
  const divs = [...new Set(pav.ambientes.map(a => a.divisao).filter(Boolean))]
  if (!divs.length) return null
  const vals = divs
    .map(d => getDistancia(d, pav.tipo === 'descarga', nUpsAD, temChuveiros, temDeteccao, blocosDistancia))
    .filter(v => v !== null)
  return vals.length ? Math.min(...vals) : null
}

/** Retorna as opções de taxa disponíveis para a divisão */
export function taxaOpcoes(divisao, taxaPopulacional) {
  const taxa = taxaPopulacional[divisao]
  if (!taxa) return []
  const opts = []
  if (taxa.A !== null) opts.push({ value:'area',   label: taxa.obs })
  if (taxa.notas?.includes('N')) opts.push({ value:'fixo', label:'Assentos fixos' })
  if (taxa.A === null)  opts.push({ value:'manual', label: taxa.obs })
  return opts
}

/** Tipo de população padrão para uma divisão */
export function popTipoPadrao(divisao, taxaPopulacional) {
  return taxaOpcoes(divisao, taxaPopulacional)[0]?.value || 'manual'
}
