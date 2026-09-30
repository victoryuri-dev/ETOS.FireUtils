// ─────────────────────────────────────────────────────────────────────────────
// normasRemote.js — busca a base normativa central (tabela `normas_dados`
// no Supabase — ver supabase/migrations/*normas_dados*) e mantém um cache
// em memória por (uf, sistema).
//
// Por que não é async/await direto nos componentes: as funções de
// src/data/normas/index.js (getSE, getOcupacoes, etc.) são síncronas e
// chamadas durante o render de várias páginas — trocar isso por Promises
// exigiria reescrever todo mundo que já consome essas funções. Em vez
// disso, este módulo carrega em background assim que o app sobe
// (chamado 1x em ProjetoContext.jsx) e os getters em normas/index.js
// preferem o cache daqui, caindo pro arquivo estático (.js) empacotado
// como fallback enquanto o fetch não completou (ou se falhar — sem
// internet, Supabase fora do ar, etc.).
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabase'

const _cache = {} // uf -> { [sistema]: dados }
const _emAndamento = {} // uf -> Promise

/** Retorna o payload já carregado para (uf, sistema), ou null se ainda não
 * chegou (ou nunca foi buscado) — quem chama decide o fallback. */
export function getNormaRemota(uf, sistema) {
  return _cache[uf]?.[sistema] ?? null
}

/** true assim que o fetch de normas_dados pra `uf` termina (com sucesso ou
 * não) pelo menos uma vez — distingue "ainda carregando" (getNormaRemota
 * ainda vai retornar null de qualquer forma, não é sinal de ausência) de
 * "carregou e não achou nada pra esse sistema" (aí sim, ausência
 * confirmada). Usado por useMedidasObrigatorias pra bloquear sistemas sem
 * base normativa cadastrada pro UF do projeto (ex.: hidrantes/sprinklers
 * num estado sem norma no Supabase) sem piscar bloqueado durante o
 * carregamento inicial. */
export function normasCarregadas(uf) {
  return !!_cache[uf]
}

/** Dispara (ou reaproveita, se já em andamento) a busca de todas as linhas
 * de normas_dados para `uf`. Nunca lança — falha de rede/Supabase deixa o
 * cache como estava (os getters caem pro fallback estático sozinhos). */
export function carregarNormasRemotas(uf) {
  if (!uf || !supabase) return Promise.resolve()
  if (_emAndamento[uf]) return _emAndamento[uf]

  _emAndamento[uf] = (async () => {
    try {
      const { data, error } = await supabase
        .from('normas_dados')
        .select('sistema, dados')
        .eq('uf', uf)
      if (error || !data) return
      _cache[uf] = _cache[uf] || {}
      for (const row of data) _cache[uf][row.sistema] = row.dados
    } catch {
      // sem rede / Supabase fora do ar — mantém o cache (e o fallback
      // estático nos getters) como está
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

/** Dispara (ou reaproveita) a busca de quais (uf, sistema) existem em
 * normas_dados, para todos os estados — chamado 1x no boot do app (ver
 * ProjetoContext.jsx). Nunca lança — falha de rede deixa o catálogo vazio,
 * e disponibilidadeEstado() cai pro fallback estático (só MA, hoje). */
export function carregarCatalogoNormas() {
  if (_catalogoPromise) return _catalogoPromise
  if (!supabase) return Promise.resolve()

  _catalogoPromise = (async () => {
    try {
      const { data, error } = await supabase.from('normas_dados').select('uf, sistema')
      if (error || !data) return
      for (const row of data) {
        if (!_catalogo[row.uf]) _catalogo[row.uf] = new Set()
        _catalogo[row.uf].add(row.sistema)
      }
    } catch {
      // sem rede / Supabase fora do ar — mantém o catálogo como está
    }
  })()

  return _catalogoPromise
}

/** true se `sistema` está cadastrado no Supabase para `uf`, conforme o
 * catálogo carregado por carregarCatalogoNormas(). false tanto se o
 * catálogo ainda não carregou quanto se carregou e não achou nada — quem
 * chama (disponibilidadeEstado) decide o fallback estático. */
export function sistemaExisteNoCatalogo(uf, sistema) {
  return !!_catalogo[uf]?.has(sistema)
}
