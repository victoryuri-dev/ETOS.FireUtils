// ─────────────────────────────────────────────────────────────────────────────
// normasRemote.js — busca a base normativa central (tabela `normas_dados`
// no Supabase — ver supabase/migrations/*normas_dados*) e mantém um cache
// em memória por (uf, sistema).
//
// É a ÚNICA fonte de norma do site: não há fallback para arquivo local.
// As funções de src/data/normas/index.js (getSE, getOcupacoes, etc.) são
// síncronas e leem este cache; por isso o projeto só é aberto depois que
// carregarNormasRemotas(uf) termina com sucesso (ver ProjectLayout em
// App.jsx, que mostra carregando/erro com "tentar de novo").
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabase'

const _cache = {} // uf -> { [sistema]: dados }
const _status = {} // uf -> 'ok' | 'erro'
const _emAndamento = {} // uf -> Promise

/** Payload carregado para (uf, sistema), ou null se o estado não tem esse
 * sistema cadastrado (ou as normas ainda não carregaram). */
export function getNormaRemota(uf, sistema) {
  return _cache[uf]?.[sistema] ?? null
}

/** true assim que as normas de `uf` carregaram com sucesso. */
export function normasCarregadas(uf) {
  return _status[uf] === 'ok'
}

/** 'ok' | 'erro' | 'carregando' (ainda não terminou ou nunca foi pedido). */
export function statusNormas(uf) {
  return _status[uf] ?? 'carregando'
}

/** Dispara (ou reaproveita, se já em andamento) a busca de todas as linhas
 * de normas_dados para `uf`. Nunca lança — falha deixa statusNormas(uf) =
 * 'erro'; chamar de novo tenta outra vez. */
export function carregarNormasRemotas(uf) {
  if (!uf) return Promise.resolve()
  if (!supabase) { _status[uf] = 'erro'; return Promise.resolve() }
  if (_emAndamento[uf]) return _emAndamento[uf]
  if (_status[uf] === 'erro') delete _status[uf]

  _emAndamento[uf] = (async () => {
    try {
      const { data, error } = await supabase
        .from('normas_dados')
        .select('sistema, dados')
        .eq('uf', uf)
      if (error || !data) { _status[uf] = 'erro'; return }
      _cache[uf] = {}
      for (const row of data) _cache[uf][row.sistema] = row.dados
      _status[uf] = 'ok'
    } catch {
      _status[uf] = 'erro'
    } finally {
      delete _emAndamento[uf]
    }
  })()

  return _emAndamento[uf]
}

// ─────────────────────────────────────────────────────────────────────────
// Catálogo — só "quais (uf, sistema) existem", pra TODOS os estados de uma
// vez (não só o do projeto atual, como o cache acima). Usado por
// normas/index.js:disponibilidadeEstado() pra decidir dinamicamente quais
// UFs entram como opção pra projeto completo/dimensionamento no seletor de
// estado (Step1/Step2) — sem isso, cada estado novo cadastrado no Supabase
// exigiria também editar à mão uma lista fixa (ativo/ativoDimensionamento)
// aqui no front. Só `uf, sistema` (sem `dados`, que pode ser grande) porque
// aqui importa só existência, não o conteúdo.
// ─────────────────────────────────────────────────────────────────────────
const _catalogo = {} // uf -> Set(sistema)
let _catalogoPromise = null
let _statusCatalogo = 'carregando' // 'carregando' | 'ok' | 'erro'

/** Dispara (ou reaproveita) a busca de quais (uf, sistema) existem em
 * normas_dados, para todos os estados — chamado no boot do app (ver
 * ProjetoContext.jsx). Nunca lança — falha deixa statusCatalogo() = 'erro'
 * e o catálogo vazio (nenhum estado disponível); chamar de novo tenta outra vez. */
export function carregarCatalogoNormas() {
  if (_catalogoPromise) return _catalogoPromise
  if (_statusCatalogo === 'ok') return Promise.resolve()
  if (!supabase) { _statusCatalogo = 'erro'; return Promise.resolve() }
  _statusCatalogo = 'carregando'

  _catalogoPromise = (async () => {
    try {
      const { data, error } = await supabase.from('normas_dados').select('uf, sistema')
      if (error || !data) { _statusCatalogo = 'erro'; return }
      for (const row of data) {
        if (!_catalogo[row.uf]) _catalogo[row.uf] = new Set()
        _catalogo[row.uf].add(row.sistema)
      }
      _statusCatalogo = 'ok'
    } catch {
      _statusCatalogo = 'erro'
    } finally {
      _catalogoPromise = null
    }
  })()

  return _catalogoPromise
}

export function statusCatalogo() {
  return _statusCatalogo
}

/** true se `sistema` está cadastrado no Supabase para `uf`, conforme o
 * catálogo carregado por carregarCatalogoNormas(). */
export function sistemaExisteNoCatalogo(uf, sistema) {
  return !!_catalogo[uf]?.has(sistema)
}
