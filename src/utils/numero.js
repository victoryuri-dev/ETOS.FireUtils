// utils/numero.js — formato numérico oficial do projeto (padrão brasileiro):
// milhar com ponto, decimal com vírgula, até `casas` casas decimais e zeros
// finais cortados — 5.000 · 1,5 · 167,68 · 12.345.678,9.
//
// Toda exibição de valor numérico (telas, memorial, Anexo B, dashboard) passa
// por aqui, em vez de cada arquivo ter seu próprio toFixed/replace — é o que
// garante o mesmo formato no projeto inteiro. Campos de digitação continuam
// aceitando o que o usuário digitar (ver paraNumero).

const cache = new Map()
function formatador(casas) {
  if (!cache.has(casas)) {
    cache.set(casas, new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: casas,
      useGrouping: true,
    }))
  }
  return cache.get(casas)
}

/** Converte número ou texto digitado ("1.234,5", "1234.5", "12,5") em número;
 *  NaN quando não é um número. */
export function paraNumero(v) {
  if (typeof v === 'number') return v
  if (v == null) return NaN
  let s = String(v).trim()
  if (!s) return NaN
  // Com vírgula: é o separador decimal e os pontos são milhar ("1.234,5").
  // Sem vírgula: o ponto é o decimal ("1234.5", vindo de input type=number).
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  return Number(s)
}

/** Valor formatado no padrão do projeto; `vazio` quando não há número. */
export function fmtNum(v, casas = 2, vazio = '') {
  const n = paraNumero(v)
  if (!Number.isFinite(n)) return vazio
  // Evita "-0" quando o valor arredonda pra zero.
  const r = Math.abs(n) < 0.5 * 10 ** -casas ? 0 : n
  return formatador(casas).format(r)
}

/** Valor com unidade ("5.000 m²"); `vazio` quando não há número. */
export function fmtUn(v, unidade, casas = 2, vazio = '') {
  const s = fmtNum(v, casas, '')
  return s ? `${s} ${unidade}` : vazio
}
