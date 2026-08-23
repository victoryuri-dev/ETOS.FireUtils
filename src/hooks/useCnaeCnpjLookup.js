import { useState } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { buscarCNAEExato } from '../data/normas/index'

const CNPJ_API = 'https://brasilapi.com.br/api/cnpj/v1/'

function maskCNAE(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 7)
  if (d.length <= 4) return d
  if (d.length === 5) return `${d.slice(0, 4)}-${d[4]}`
  return `${d.slice(0, 4)}-${d[4]}/${d.slice(5, 7)}`
}

// Busca o CNAE fiscal de uma empresa pelo CNPJ (mesma API publica de
// useCnpjLookup) e tenta casar esse CNAE contra a base normativa da UF do
// projeto, pra sugerir grupo/divisao automaticamente na classificacao de um
// pavimento (ver PavModal em Step4.jsx). Ao contrario de useCnpjLookup, nao
// grava nada no projeto sozinho — so devolve o resultado, e quem chamou
// decide se aplica (ex: so no Terreo).
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
      const res = await fetch(`${CNPJ_API}${digits}`)
      if (res.status === 404) throw new Error('CNPJ nao encontrado na Receita Federal.')
      if (res.status === 429) throw new Error('Muitas consultas em pouco tempo — aguarde um instante e tente novamente.')
      if (!res.ok) throw new Error('Nao foi possivel consultar o CNPJ agora. Tente novamente.')
      const d = await res.json()

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
