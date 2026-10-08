import { useState } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { buscarCNAEExato } from '../data/normas/index'
import { supabase } from '../lib/supabase'

function maskCNAE(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 7)
  if (d.length <= 4) return d
  if (d.length === 5) return `${d.slice(0, 4)}-${d[4]}`
  return `${d.slice(0, 4)}-${d[4]}/${d.slice(5, 7)}`
}

// Busca o CNAE fiscal de uma empresa pelo CNPJ (mesma Edge Function
// cnpj-lookup de useCnpjLookup.js — nunca duas fontes de verdade pra
// consulta de CNPJ, nem duas formas diferentes de esbarrar no mesmo
// rate-limit/CORS da BrasilAPI quando chamada direto do navegador) e tenta
// casar esse CNAE contra a base normativa da UF do projeto, pra sugerir
// grupo/divisao automaticamente na classificacao de um pavimento (ver
// PavModal em Step4.jsx). Ao contrario de useCnpjLookup, nao grava nada no
// projeto sozinho — so devolve o resultado, e quem chamou decide se aplica
// (ex: so no Terreo).
export function useCnaeCnpjLookup() {
  const { state } = useProjeto()
  const uf = state.uf || 'MA'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)

  async function buscar(cnpjRaw) {
    const digits = (cnpjRaw || '').replace(/\D/g, '')
    if (digits.length !== 14) {
      setError('Informe um CNPJ valido com 14 digitos.')
      return
    }
    setLoading(true)
    setError('')
    setResultado(null)
    try {
      const { data: d, error: fnError } = await supabase.functions.invoke('cnpj-lookup', { body: { cnpj: digits } })
      if (fnError) {
        let msg = 'Nao foi possivel consultar o CNPJ agora. Tente novamente.'
        try {
          const corpo = await fnError.context?.json()
          if (corpo?.error) msg = corpo.error
        } catch { /* resposta sem corpo JSON — mantem a mensagem generica acima */ }
        throw new Error(msg)
      }

      if (!d.cnae_fiscal) throw new Error('Este CNPJ nao tem CNAE fiscal cadastrado na Receita Federal.')

      const cnae = maskCNAE(String(d.cnae_fiscal))
      setResultado({
        cnae,
        descricao: d.cnae_fiscal_descricao || '',
        razaoSocial: d.razao_social || '',
        match: buscarCNAEExato(uf, cnae),
      })
    } catch (e) {
      setError(e.message || 'Erro ao consultar CNPJ.')
    } finally {
      setLoading(false)
    }
  }

  function limpar() { setResultado(null); setError('') }

  return { buscar, limpar, loading, error, resultado }
}
