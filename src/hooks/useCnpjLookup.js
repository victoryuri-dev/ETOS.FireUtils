import { useState } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { getEstadosDisponiveis } from '../data/normas/index'
import { supabase } from '../lib/supabase'

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

// Consulta pública de CNPJ (BrasilAPI, dados da Receita Federal) — via a
// Edge Function cnpj-lookup (supabase/functions/cnpj-lookup), que repassa
// a consulta pelo servidor. Chamar a BrasilAPI direto do navegador
// esbarrava com frequência em rate-limit da Cloudflare dela, cuja resposta
// de bloqueio não vem com header de CORS — o navegador relata isso como
// "blocked by CORS policy", mascarando que o problema real é rate-limit.
// Dados da empresa (razao social, CNAE...) sao aplicados direto. O endereco fica em
// espera — e o endereco fiscal da empresa, que pode nao ser o endereco da obra — e so
// e copiado para o projeto se o usuario confirmar em aplicarEndereco().
export function useCnpjLookup() {
  const { dispatch } = useProjeto()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [enderecoFiscal, setEnderecoFiscal] = useState(null)
  // Quadro societario (QSA) do CNPJ buscado — usado pelo seletor de
  // "Proprietario do imovel" (Step1.jsx), pra oferecer cada socio como
  // opcao alem de "mesmo que o responsavel pelo uso".
  const [qsa, setQsa] = useState([])

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
    setQsa([])
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

      dispatch({ type: 'SET_FIELD', field: 'respCNPJ', value: maskCNPJ(digits) })
      dispatch({ type: 'SET_FIELD', field: 'respRazaoSocial', value: d.razao_social || '' })
      dispatch({ type: 'SET_FIELD', field: 'respFantasia', value: d.nome_fantasia || d.razao_social || '' })
      if (d.ddd_telefone_1) dispatch({ type: 'SET_FIELD', field: 'respTelefone', value: d.ddd_telefone_1 })
      if (d.email) dispatch({ type: 'SET_FIELD', field: 'respEmail', value: d.email })
      if (d.cnae_fiscal) {
        dispatch({ type: 'SET_FIELD', field: 'cnaePrincipal', value: maskCNAE(String(d.cnae_fiscal)) })
        dispatch({ type: 'SET_FIELD', field: 'cnaePrincipalDesc', value: d.cnae_fiscal_descricao || '' })
      }

      const estadoSuportado = !!getEstadosDisponiveis().find(e => e.uf === d.uf && e.ativo)
      if (!estadoSuportado && d.uf) {
        setWarning(`Endereco fiscal em ${d.uf} — norma ainda nao disponivel para esse estado nesta versao.`)
      }
      setEnderecoFiscal({
        logradouro: d.logradouro || '',
        numero: d.numero || '',
        complemento: d.complemento || '',
        bairro: d.bairro || '',
        cidade: d.municipio || '',
        cep: maskCEP(d.cep),
        uf: d.uf || '',
        ufSuportado: estadoSuportado,
      })
      setQsa(Array.isArray(d.qsa) ? d.qsa : [])
    } catch (e) {
      setError(e.message || 'Erro ao consultar CNPJ.')
    } finally {
      setLoading(false)
    }
  }

  function aplicarEndereco() {
    if (!enderecoFiscal) return
    dispatch({ type: 'SET_FIELD', field: 'endereco', value: enderecoFiscal.logradouro })
    dispatch({ type: 'SET_FIELD', field: 'numero', value: enderecoFiscal.numero })
    dispatch({ type: 'SET_FIELD', field: 'complemento', value: enderecoFiscal.complemento })
    dispatch({ type: 'SET_FIELD', field: 'bairro', value: enderecoFiscal.bairro })
    dispatch({ type: 'SET_FIELD', field: 'cidade', value: enderecoFiscal.cidade })
    dispatch({ type: 'SET_FIELD', field: 'cep', value: enderecoFiscal.cep })
    if (enderecoFiscal.ufSuportado) {
      dispatch({ type: 'SET_FIELD', field: 'uf', value: enderecoFiscal.uf })
    }
  }

  return { buscar, loading, error, warning, enderecoFiscal, aplicarEndereco, qsa }
}
