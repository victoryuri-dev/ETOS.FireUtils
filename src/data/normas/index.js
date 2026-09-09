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

import * as MA_SE   from './MA/saida_emergencia'
import * as MA_MED  from './MA/medidas'
import * as MA_AV   from './MA/acesso_viatura'
import * as MA_TRRF from './MA/trrf'
import * as MA_EXT  from './MA/extintores'
import * as MA_ILU  from './MA/iluminacao'
import * as MA_SIN  from './MA/sinalizacao'
import * as MA_NTS  from './MA/nts'

import { getNormaRemota } from '../../lib/normasRemote'

const NORMAS      = { MA, PE, PB }
const NORMAS_SE   = { MA: MA_SE }
const NORMAS_MED  = { MA: MA_MED }
const NORMAS_AV   = { MA: MA_AV }
const NORMAS_TRRF = { MA: MA_TRRF }
const NORMAS_EXT  = { MA: MA_EXT }
const NORMAS_ILU  = { MA: MA_ILU }
const NORMAS_SIN  = { MA: MA_SIN }
// getNts() não é parametrizado por UF hoje (só existe o MA_NTS estático,
// e o único consumidor — MemorialDescritivoPage.jsx — sempre foi
// hardcoded pro MA também); mantido assim pra não inventar comportamento
// novo nesta migração, só trocar de onde o dado vem.
const NTS_PADRAO  = MA_NTS

// Estados listados no seletor — ativo:false = aparece mas nao pode selecionar
export const ESTADOS_DISPONIVEIS = [
  { uf: 'MA', nome: 'Maranhao — MA',   ativo: true  },
  { uf: 'PE', nome: 'Pernambuco — PE', ativo: false },
  { uf: 'PB', nome: 'Paraiba — PB',    ativo: false },
]

// A tabela `normas_dados` (ver supabase/migrations/*normas_dados*) guarda
// as chaves em minúsculo, enquanto todo o resto do site sempre esperou os
// nomes SCREAMING_SNAKE_CASE que `import * as X from './UF/sistema'`
// produz a partir dos arquivos estáticos — sem esse adaptador, a
// estrutura da linha remota bate campo a campo mas com nomes de chave
// diferentes, e o app quebra (`Cannot read properties of undefined`)
// assim que a base central responde pela primeira vez. Convenção: cada
// chave devolvida é o nome em maiúsculo, lido de `remoto[chave em
// minúsculo]` (ex.: DISTANCIA_MAXIMA <- remoto.distancia_maxima).
function renomearDaBaseCentral(remoto, chaves) {
  const out = {}
  for (const chave of chaves) out[chave] = remoto[chave.toLowerCase()]
  return out
}

// saida_emergencia é a única exceção a essa convenção — foi o primeiro
// sistema migrado, e herdou os nomes mais curtos que o lado Python já
// usava antes de a base central existir (ver
// Fire Utils.tab/lib/normas/__init__.py._CHAVES_SAIDAS): tabela, notas,
// larguras_minimas, distancias_maximas em vez de TAXA_POPULACIONAL,
// NOTAS_NORMATIVAS, LARGURAS_MINIMAS, DISTANCIAS_MAXIMAS.
function adaptarSEDaBaseCentral(remoto) {
  return {
    ...remoto,
    TAXA_POPULACIONAL: remoto.tabela,
    NOTAS_NORMATIVAS: remoto.notas,
    LARGURAS_MINIMAS: remoto.larguras_minimas,
    DISTANCIAS_MAXIMAS: remoto.distancias_maximas,
  }
}

const CHAVES_AV   = ['GATILHO', 'NOTAS', 'VIA_ACESSO']
const CHAVES_TRRF = ['CLASSES_ALTURA', 'CLASSES_SUBSOLO', 'DIVISOES_SEM_OCUPACAO_SUBSOLO', 'METODOLOGIA_POR_MATERIAL', 'NOTAS_ANEXO_B', 'TABELA_TRRF']
const CHAVES_EXT  = ['ALTURA_INSTALACAO', 'AREA_LIMITE_UNIDADE_UNICA', 'DISTANCIA_ENTRADA_ESCADA', 'DISTANCIA_MAXIMA', 'LIMIARES_RISCO', 'LOCAIS_RISCO_ESPECIAL', 'NOTAS', 'PROPORCAO_RISCO_SECUNDARIO', 'TIPOS_PORTATIL', 'TIPOS_SOBRE_RODAS']
const CHAVES_ILU  = ['AUTONOMIA_MINIMA_HORAS', 'CAMPOS_EQUIPAMENTO', 'EQUIPAMENTOS_ACLARAMENTO', 'ILUMINANCIA_MINIMA', 'NOTAS', 'PONTOS_BALIZAMENTO', 'PRESETS_EQUIPAMENTO', 'RAZAO_UNIFORMIDADE_MAX', 'TEMPO_RESPOSTA_MAX_S', 'TIPOS_SISTEMA']
const CHAVES_SIN  = ['CATEGORIAS', 'NOTAS', 'TIPOS_PLACA']
const CHAVES_MED  = ['LIMIARES', 'MEDIDAS', 'NOTAS_ESPECIFICAS', 'TABELA_SIMPLIFICADA']
const CHAVES_NTS  = ['NTS_PADRAO_MA', 'NTS_POR_SISTEMA', 'NT_CARGA_INCENDIO']

// JSON não serializa `Infinity` (vira `null`) — CLASSES_SUBSOLO usa
// Infinity pra "sem teto" (S2 = profundidade > 10m). A migração grava
// esse valor como a string "Infinity"; desfaz aqui antes de entregar pro
// trrf_calc.js, que compara `profundidade <= classe.max` — com `null` em
// vez de `Infinity`, subsolos > 10m nunca bateriam com nenhuma classe.
function comInfinidade(classes) {
  return classes.map((c) => (c.max === 'Infinity' ? { ...c, max: Infinity } : c))
}

// getSinalizacao: TIPOS_PLACA da base central não carrega `img` (é um
// módulo de asset do bundler — Vite resolve o import pra uma URL em
// build, não dá pra serializar em JSON), então o pictograma continua
// vindo do bundle local (src/assets/sinalizacao/*), casado de volta pelo
// `key` depois do fetch. Sempre usa o catálogo de imagens do MA porque os
// pictogramas seguem a NBR 13434 (nacional) — não variam por estado, só o
// texto normativo ao redor (categoria, local de instalação) pode variar.
function anexarImagens(tiposPlacaRemoto) {
  const imagemPorKey = new Map(MA_SIN.TIPOS_PLACA.map((t) => [t.key, t.img]))
  return tiposPlacaRemoto.map((t) => ({ ...t, img: imagemPorKey.get(t.key) }))
}

// getNorma: ocupacoes.js virou DUAS linhas na base central (sistema
// 'ocupacoes' = NORMA+OCUPACOES; sistema 'carga_incendio' = o mapa de
// CNAEs — CARGADEINCENDIO) por serem duas coisas de natureza bem
// diferente (a primeira pequena e estável, a segunda grande e mais
// sujeita a correção pontual) — mas os consumidores abaixo (getOcupacoes,
// getCargaMap, getNormaInfo) continuam lendo os três campos de um dict
// só, como sempre foi. Não retorna null só por faltar o módulo estático:
// um estado 100% novo (sem arquivo .js local, só linhas na base central)
// também precisa funcionar.
export function getNorma(uf) {
  const base = NORMAS[uf] ?? null
  const remotoOcup  = getNormaRemota(uf, 'ocupacoes')
  const remotoCarga = getNormaRemota(uf, 'carga_incendio')
  if (!base && !remotoOcup && !remotoCarga) return null
  return {
    ...base,
    ...(remotoOcup  ? { NORMA: remotoOcup.norma, OCUPACOES: remotoOcup.ocupacoes } : null),
    ...(remotoCarga ? { CARGADEINCENDIO: remotoCarga.cargadeincendio } : null),
  }
}

// getSE: primeiro sistema migrado pra base normativa central
// (normas_dados no Supabase — ver supabase/migrations/*normas_dados* e
// src/lib/normasRemote.js). getNormaRemota() devolve null enquanto o fetch
// não completou (ou se falhar), e cai pro arquivo estático empacotado
// (./MA/saida_emergencia.js) — que passa a ser só o fallback offline/dev,
// não mais a fonte de verdade.
export function getSE(uf) {
  const remoto = getNormaRemota(uf, 'saida_emergencia')
  return remoto ? adaptarSEDaBaseCentral(remoto) : (NORMAS_SE[uf] ?? NORMAS_SE['MA'])
}
export function getAV(uf) {
  const remoto = getNormaRemota(uf, 'acesso_viatura')
  return remoto ? renomearDaBaseCentral(remoto, CHAVES_AV) : (NORMAS_AV[uf] ?? NORMAS_AV['MA'])
}
export function getTRRF(uf) {
  const remoto = getNormaRemota(uf, 'trrf')
  if (!remoto) return NORMAS_TRRF[uf] ?? NORMAS_TRRF['MA']
  const adaptado = renomearDaBaseCentral(remoto, CHAVES_TRRF)
  return {
    ...adaptado,
    CLASSES_ALTURA: comInfinidade(adaptado.CLASSES_ALTURA),
    CLASSES_SUBSOLO: comInfinidade(adaptado.CLASSES_SUBSOLO),
  }
}
export function getExtintores(uf) {
  const remoto = getNormaRemota(uf, 'extintores')
  return remoto ? renomearDaBaseCentral(remoto, CHAVES_EXT) : (NORMAS_EXT[uf] ?? NORMAS_EXT['MA'])
}
export function getIluminacao(uf) {
  const remoto = getNormaRemota(uf, 'iluminacao')
  return remoto ? renomearDaBaseCentral(remoto, CHAVES_ILU) : (NORMAS_ILU[uf] ?? NORMAS_ILU['MA'])
}
export function getSinalizacao(uf) {
  const remoto = getNormaRemota(uf, 'sinalizacao')
  if (!remoto) return NORMAS_SIN[uf] ?? NORMAS_SIN['MA']
  return { ...renomearDaBaseCentral(remoto, CHAVES_SIN), TIPOS_PLACA: anexarImagens(remoto.tipos_placa) }
}
export function getNts(uf) {
  const remoto = getNormaRemota(uf, 'nts')
  return remoto ? renomearDaBaseCentral(remoto, CHAVES_NTS) : NTS_PADRAO
}
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

// Busca um CNAE (codigo exato) em toda a base, em qualquer divisao — usado
// pra resolver automaticamente grupo/divisao a partir de um CNAE já
// conhecido (ex: vindo da Receita Federal via consulta de CNPJ), ao
// contrario de buscarCNAE (que faz busca textual parcial pro autocomplete).
export function buscarCNAEExato(uf, cnae) {
  const mapa = getCargaMap(uf)
  for (const [divisao, cnaes] of Object.entries(mapa)) {
    if (cnaes[cnae]) return { cnae, divisao, grupo: divisao.charAt(0), ...cnaes[cnae] }
  }
  return null
}

// Indica se a divisao tem algum CNAE cadastrado na base normativa. Algumas
// divisoes (ex: J-1..J-4, varias do grupo M) nao tem nenhum — a carga ja
// vem definida no proprio nome da divisao, e o usuario preenche por
// levantamento em vez de escolher um CNAE. Usado pra nao exigir CNAE de
// divisoes que nunca terao um pra escolher.
export function temCNAECadastrado(uf, divisao) {
  return Object.keys(getCNAEsDivisao(uf, divisao)).length > 0
}

// ── Medidas de segurança ─────────────────────────────────────────────────────

export function getMedidas(uf) {
  const remoto = getNormaRemota(uf, 'medidas_seguranca')
  // Diferente dos outros getters, não cai pro MA quando `uf` não tem dado
  // — sem regra cadastrada pro estado, aplicar a do MA por engano seria
  // pior que simplesmente admitir que a norma ainda não foi cadastrada
  // (comportamento já era esse antes desta migração, mantido de propósito).
  return remoto ? renomearDaBaseCentral(remoto, CHAVES_MED) : (NORMAS_MED[uf] ?? null)
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
