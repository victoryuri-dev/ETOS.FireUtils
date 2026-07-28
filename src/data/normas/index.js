/**
 * normas/index.js — Loader central de normas
 *
 * COMO ADICIONAR UM NOVO ESTADO:
 *   1. Crie src/data/normas/UF/ocupacoes.js seguindo o modelo do MA
 *   2. Importe aqui: import * as UF from './UF/ocupacoes'
 *   3. Adicione em NORMAS: UF: { ...UF }
 *   4. Adicione em ESTADOS_DISPONIVEIS: { uf:'UF', nome:'...', ativo:true }
 */

import * as MA from './MA/ocupacoes'
import * as PE from './PE/ocupacoes'
import * as PB from './PB/ocupacoes'

import * as MA_SE  from './MA/saida_emergencia'
import * as MA_MED from './MA/medidas'
import * as MA_AV  from './MA/acesso_viatura'

const NORMAS     = { MA, PE, PB }
const NORMAS_SE  = { MA: MA_SE }
const NORMAS_MED = { MA: MA_MED }
const NORMAS_AV  = { MA: MA_AV }

// Estados listados no seletor — ativo:false = aparece mas nao pode selecionar
export const ESTADOS_DISPONIVEIS = [
  { uf: 'MA', nome: 'Maranhao — MA',   ativo: true  },
  { uf: 'PE', nome: 'Pernambuco — PE', ativo: false },
  { uf: 'PB', nome: 'Paraiba — PB',    ativo: false },
]

export function getNorma(uf)       { return NORMAS[uf] ?? null }
export function getSE(uf)          { return NORMAS_SE[uf] ?? NORMAS_SE['MA'] }
export function getAV(uf)          { return NORMAS_AV[uf] ?? NORMAS_AV['MA'] }
export function getOcupacoes(uf)   { return getNorma(uf)?.OCUPACOES ?? {} }
export function getGrupos(uf)      {
  const oc = getOcupacoes(uf)
  return Object.fromEntries(Object.entries(oc).map(([k, v]) => [k, v.descricao ?? k]))
}
export function getCargaMap(uf)    { return getNorma(uf)?.CARGADEINCENDIO ?? {} }
export function getNormaInfo(uf)   { return getNorma(uf)?.NORMA ?? null }

// Retorna todos os CNAEs de uma divisao especifica
export function getCNAEsDivisao(uf, divisao) {
  const mapa = getCargaMap(uf)
  return mapa[divisao] ?? {}
}

// Retorna a carga de um CNAE especifico numa divisao
export function getCargaCNAE(uf, divisao, cnae) {
  return getCNAEsDivisao(uf, divisao)[cnae] ?? null
}

// ── Medidas de segurança ─────────────────────────────────────────────────────

export function getMedidas(uf) {
  return NORMAS_MED[uf] ?? null
}

/**
 * Resolve as medidas de segurança exigidas para uma edificação.
 *
 * @param {string}   uf       — estado (ex: 'MA')
 * @param {string[]} divisoes — lista de divisões (ex: ['C-2','D-1'])
 * @param {number}   altura   — altura em metros
 * @param {number}   area     — área construída total em m²
 *
 * @returns {{
 *   simplificado: boolean,
 *   medidas: Record<string, { obrigatorio: boolean, notasGerais: string[], notaSimp?: number }>
 * }}
 */
export function getMedidasObrigatorias(uf, divisoes, altura, area) {
  const norma = getMedidas(uf)
  if (!norma) return null

  const h = parseFloat(altura) || 0
  const a = parseFloat(area)   || 0
  const { LIMIARES, TABELA_SIMPLIFICADA, MEDIDAS } = norma
  const simplificado = a < LIMIARES.areaMin && h < LIMIARES.alturaMin

  return simplificado
    ? _resolverSimplificado(TABELA_SIMPLIFICADA, divisoes)
    : _resolverNormal(MEDIDAS, divisoes, h)
}

/**
 * Retorna as letras de grupo (dentre `divisoes`) para as quais a norma
 * ainda nao possui dados cadastrados na tabela aplicavel (simplificada ou
 * normal, conforme altura/area). Usado para sinalizar quando o resultado de
 * `getMedidasObrigatorias` esta incompleto e uma exigencia minima de
 * referencia deve ser aplicada manualmente.
 *
 * @param {string}   uf
 * @param {string[]} divisoes
 * @param {number}   altura
 * @param {number}   area
 * @returns {string[]} letras de grupo sem dados (ex: ['G','K'])
 */
export function getGruposSemDados(uf, divisoes, altura, area) {
  const norma = getMedidas(uf)
  if (!norma) return [...new Set(divisoes.map(d => d.charAt(0)))]

  const h = parseFloat(altura) || 0
  const a = parseFloat(area)   || 0
  const { LIMIARES, TABELA_SIMPLIFICADA, MEDIDAS } = norma
  const simplificado = a < LIMIARES.areaMin && h < LIMIARES.alturaMin

  const faltantes = new Set()
  divisoes.forEach(div => {
    const grupo = div.charAt(0)
    const temDado = simplificado
      ? !!(TABELA_SIMPLIFICADA.divisoes?.[div] || TABELA_SIMPLIFICADA.grupos?.[grupo])
      : !!_medidasDaDivisaoNormal(MEDIDAS, div)
    if (!temDado) faltantes.add(grupo)
  })
  return [...faltantes]
}

/**
 * Retorna o texto da nota específica de uma medida para um grupo/divisão.
 * Prioridade: divisão exata → grupo (letra).
 *
 * @param {string} uf
 * @param {string} divisao — ex: 'A-1' ou 'F-3'
 * @param {string} medida  — ex: 'compart_horizontal'
 * @returns {string|null}
 */
export function getNotaMedida(uf, divisao, medida) {
  const norma = getMedidas(uf)
  if (!norma?.NOTAS_ESPECIFICAS) return null
  const notas = norma.NOTAS_ESPECIFICAS
  return notas[divisao.charAt(0)]?.[medida] ?? null
}

// Resolve Tabela 5 — processo simplificado
function _resolverSimplificado(tabela, divisoes) {
  const resultado = {}

  divisoes.forEach(div => {
    const grupo = div.charAt(0)
    const src = tabela.divisoes?.[div] ?? tabela.grupos?.[grupo] ?? {}

    Object.entries(src).forEach(([medida, val]) => {
      if (!resultado[medida]) resultado[medida] = { obrigatorio: true, notasGerais: [] }
      // val pode ser true ou { notaSimp: N } — registra a nota da Tabela 5
      if (val !== true && val?.notaSimp !== undefined) {
        resultado[medida].notaSimp = val.notaSimp
      }
    })
  })

  return { simplificado: true, medidas: resultado }
}

// Resolve Tabela 6 — processo normal (condições por divisão e altura)
function _resolverNormal(MEDIDAS, divisoes, altura) {
  const todasMedidas = new Set()
  divisoes.forEach(div => {
    const medidas = _medidasDaDivisaoNormal(MEDIDAS, div)
    if (medidas) Object.keys(medidas).forEach(m => todasMedidas.add(m))
  })

  const resultado = {}
  todasMedidas.forEach(m => { resultado[m] = { obrigatorio: false, notasGerais: [] } })

  divisoes.forEach(divisao => {
    const medidas = _medidasDaDivisaoNormal(MEDIDAS, divisao)
    if (!medidas) return

    Object.entries(medidas).forEach(([medida, cond]) => {
      const conditions = Array.isArray(cond) ? cond : [cond]

      for (const c of conditions) {
        if (_condSatisfeita(c, divisao, altura)) {
          resultado[medida].obrigatorio = true
          if (c.notaGeral && !resultado[medida].notasGerais.includes(c.notaGeral)) {
            resultado[medida].notasGerais.push(c.notaGeral)
          }
          break
        }
      }
    })
  })

  return { simplificado: false, medidas: resultado }
}

// Retorna o mapa `medida -> condicao` (Tabela 6) aplicavel a uma divisao.
//
// A maioria dos grupos guarda isso diretamente em `MEDIDAS[grupo].medidas`
// (mapa plano medida->condicao, valido para todas as divisoes do grupo,
// com a propria condicao filtrando por `divisoes` quando necessario).
//
// Grupos com multiplas subtabelas por divisao (ex: Grupo F, que tem as
// Tabelas 6F.1 a 6F.5) nao tem `.medidas` direto — em vez disso `MEDIDAS[grupo]`
// e um dicionario de subtabelas, cada uma com seu proprio `.medidas` indexado
// pela(s) divisao(oes) daquela linha (chave exata, ex: 'F-11', ou combinada
// com '_', ex: 'F-3_F-9' para divisoes que compartilham a mesma linha).
function _medidasDaDivisaoNormal(MEDIDAS, divisao) {
  const grupo = MEDIDAS[divisao.charAt(0)]
  if (!grupo) return null
  if (grupo.medidas) return grupo.medidas

  for (const subtabela of Object.values(grupo)) {
    const porDivisao = subtabela?.medidas
    if (!porDivisao) continue
    const chave = Object.keys(porDivisao).find(k => k.split('_').includes(divisao))
    if (chave) return porDivisao[chave]
  }
  return null
}

function _condSatisfeita(cond, divisao, altura) {
  if (Array.isArray(cond.divisoes) && cond.divisoes.length === 0) return false
  if (cond.divisoes !== 'todas' && !cond.divisoes.includes(divisao)) return false
  const min = cond.alturaMin ?? -Infinity
  const max = cond.alturaMax ?? Infinity
  return altura > min && altura <= max
}

// ── CNAEs ────────────────────────────────────────────────────────────────────

// Busca um CNAE em TODAS as divisoes (para autocomplete global)
export function buscarCNAE(uf, query) {
  if (!query || query.length < 3) return []
  const mapa = getCargaMap(uf)
  const results = []
  const q = query.toLowerCase()
  Object.entries(mapa).forEach(([divisao, cnaes]) => {
    Object.entries(cnaes).forEach(([cnae, dados]) => {
      if (
        cnae.includes(query) ||
        dados.descricao.toLowerCase().includes(q)
      ) {
        results.push({ cnae, divisao, ...dados })
      }
    })
  })
  return results.slice(0, 20) // max 20 resultados
}
