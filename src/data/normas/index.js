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

const NORMAS = { MA, PE, PB }

// Estados listados no seletor — ativo:false = aparece mas nao pode selecionar
export const ESTADOS_DISPONIVEIS = [
  { uf: 'MA', nome: 'Maranhao — MA',   ativo: true  },
  { uf: 'PE', nome: 'Pernambuco — PE', ativo: false },
  { uf: 'PB', nome: 'Paraiba — PB',    ativo: false },
]

export function getNorma(uf)       { return NORMAS[uf] ?? null }
export function getOcupacoes(uf)   { return getNorma(uf)?.OCUPACOES ?? {} }
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
