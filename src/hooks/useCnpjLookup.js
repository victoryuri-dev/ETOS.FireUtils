import { useState } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { ESTADOS_DISPONIVEIS } from '../data/normas/index'

const CNPJ_API = 'https://brasilapi.com.br/api/cnpj/v1/'

function maskCNPJ(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function maskCEP(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
}

function maskCNAE(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 7)
  if (d.length <= 4) return d
  if (d.length === 5) return `${d.slice(0, 4)}-${d[4]}`
  return `${d.slice(0, 4)}-${d[4]}/${d.slice(5, 7)}`
}

function formatEndereco(d) {
  const partes = [d.logradouro, d.numero].filter(Boolean).join(', ')
  const resto = [d.complemento, d.bairro].filter(Boolean).join(' - ')
  return [partes, resto].filter(Boolean).join(' - ')
}

// Consulta pública de CNPJ (BrasilAPI, dados da Receita Federal) — sem necessidade de backend.
// Dados da empresa (razao social, CNAE...) sao aplicados direto. O endereco fica em
// espera — e o endereco fiscal da empresa, que pode nao ser o endereco da obra — e so
// e copiado para o projeto se o usuario confirmar em aplicarEndereco().
export function useCnpjLookup() {
  const { dispatch } = useProjeto()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [enderecoFiscal, setEnderecoFiscal] = useState(null)

  async function buscar(cnpjRaw) {
    const digits = (cnpjRaw || '').replace(/\D/g, '')
    if (digits.length !== 14) {
      setError('Informe um CNPJ valido com 14 digitos.')
      return
    }
    setLoading(true)
    setError('')
    setWarning('')
    setEnderecoFiscal(null)
    try {
      const res = await fetch(`${CNPJ_API}${digits}`)
      if (res.status === 404) throw new Error('CNPJ nao encontrado na Receita Federal.')
      if (res.status === 429) throw new Error('Muitas consultas em pouco tempo — aguarde um instante e tente novamente.')
      if (!res.ok) throw new Error('Nao foi possivel consultar o CNPJ agora. Tente novamente.')
      const d = await res.json()

      dispatch({ type: 'SET_FIELD', field: 'respCNPJ', value: maskCNPJ(digits) })
      dispatch({ type: 'SET_FIELD', field: 'respRazaoSocial', value: d.razao_social || '' })
      dispatch({ type: 'SET_FIELD', field: 'respFantasia', value: d.nome_fantasia || d.razao_social || '' })
      if (d.ddd_telefone_1) dispatch({ type: 'SET_FIELD', field: 'respTelefone', value: d.ddd_telefone_1 })
      if (d.cnae_fiscal) {
        dispatch({ type: 'SET_FIELD', field: 'cnaePrincipal', value: maskCNAE(String(d.cnae_fiscal)) })
        dispatch({ type: 'SET_FIELD', field: 'cnaePrincipalDesc', value: d.cnae_fiscal_descricao || '' })
      }

      const estadoSuportado = !!ESTADOS_DISPONIVEIS.find(e => e.uf === d.uf && e.ativo)
      if (!estadoSuportado && d.uf) {
        setWarning(`Endereco fiscal em ${d.uf} — norma ainda nao disponivel para esse estado nesta versao.`)
      }
      setEnderecoFiscal({
        endereco: formatEndereco(d),
        cidade: d.municipio || '',
        cep: maskCEP(d.cep),
        uf: d.uf || '',
        ufSuportado: estadoSuportado,
      })
    } catch (e) {
      setError(e.message || 'Erro ao consultar CNPJ.')
    } finally {
      setLoading(false)
    }
  }

  function aplicarEndereco() {
    if (!enderecoFiscal) return
    dispatch({ type: 'SET_FIELD', field: 'endereco', value: enderecoFiscal.endereco })
    dispatch({ type: 'SET_FIELD', field: 'cidade', value: enderecoFiscal.cidade })
    dispatch({ type: 'SET_FIELD', field: 'cep', value: enderecoFiscal.cep })
    if (enderecoFiscal.ufSuportado) {
      dispatch({ type: 'SET_FIELD', field: 'uf', value: enderecoFiscal.uf })
    }
  }

  return { buscar, loading, error, warning, enderecoFiscal, aplicarEndereco }
}
