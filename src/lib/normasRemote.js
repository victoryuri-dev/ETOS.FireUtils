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
