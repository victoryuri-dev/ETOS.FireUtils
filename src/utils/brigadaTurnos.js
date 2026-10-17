// Divisão dos brigadistas da estrutura por turno (Matutino/Vespertino/
// Noturno) — gravada em `estrutura.brigadaTurnos`:
//   { ativos: { matutino, vespertino, noturno }, dividirIgual, valores: { ... } }
// Sem nada gravado: matutino e vespertino marcados e divisão igual ligada.
// Mesma função alimenta a página da brigada e o memorial.

export const TURNOS = [
  { key: 'matutino', label: 'Matutino' },
  { key: 'vespertino', label: 'Vespertino' },
  { key: 'noturno', label: 'Noturno' },
]

const ATIVOS_PADRAO = { matutino: true, vespertino: true, noturno: false }

/** Configuração normalizada (padrões aplicados). */
export function configTurnos(est) {
  const c = est?.brigadaTurnos || {}
  return {
    ativos: { ...ATIVOS_PADRAO, ...(c.ativos || {}) },
    dividirIgual: c.dividirIgual ?? true,
    valores: c.valores || {},
  }
}

/** Chaves dos turnos marcados, na ordem matutino → noturno. */
export const turnosAtivos = cfg => TURNOS.filter(t => cfg.ativos[t.key]).map(t => t.key)

/** Divide `total` igualmente entre os turnos; a sobra vai, um a um, a partir
 *  do primeiro turno marcado (o matutino, quando marcado). */
export function dividirIgualmente(total, chaves) {
  if (chaves.length === 0) return {}
  const base = Math.floor(total / chaves.length)
  const resto = total % chaves.length
  return Object.fromEntries(chaves.map((k, i) => [k, base + (i < resto ? 1 : 0)]))
}

/** Valores por turno da estrutura: a divisão igual quando ligada, senão os
 *  informados (vazio = 0). Só os turnos marcados. */
export function valoresTurnos(cfg, total) {
  const chaves = turnosAtivos(cfg)
  if (cfg.dividirIgual) return dividirIgualmente(total, chaves)
  return Object.fromEntries(chaves.map(k => [k, Math.max(0, parseInt(cfg.valores[k], 10) || 0)]))
}

/** Valor digitado em um turno, limitado ao que falta para o total — a soma
 *  dos turnos nunca passa do calculado. `excesso` = quantos foram tirados. */
export function limitarValorTurno(cfg, total, chave, digitado) {
  const valores = valoresTurnos(cfg, total)
  const outros = Object.entries(valores).filter(([k]) => k !== chave).reduce((s, [, v]) => s + v, 0)
  const pedido = Math.max(0, parseInt(digitado, 10) || 0)
  const maximo = Math.max(0, total - outros)
  return { valor: Math.min(pedido, maximo), excesso: Math.max(0, pedido - maximo) }
}

/** Linhas do memorial ({ label, valor }) dos turnos marcados. */
export function linhasTurnos(est, total) {
  const cfg = configTurnos(est)
  const valores = valoresTurnos(cfg, total)
  return TURNOS.filter(t => t.key in valores).map(t => ({ label: t.label, valor: String(valores[t.key]) }))
}
