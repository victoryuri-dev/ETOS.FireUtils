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
// rate-limit/CORS da BrasilAPI quando chamada direto do navegador), pra
// sugerir grupo/divisao na classificacao de um pavimento qualquer (botão
// "Preencher do CNPJ", ver PavModal em Step4.jsx). Não grava nada no
// projeto sozinho — só devolve o resultado, e quem chamou decide se aplica.
//
// O CNAE PRINCIPAL registrado na Receita nem sempre está cadastrado na
// base normativa (ex.: empresa com CNAE principal genérico — "Lojas de
// departamentos" — mas CNAE secundário específico — "Supermercados" — que
// a norma já cataloga). Por isso o resultado traz dois candidatos
// separados: `principal` (sempre, usável mesmo sem corresponder a nenhuma
// carga de incêndio cadastrada — quem aplicar decide se preenche só o CNAE
// ou também grupo/divisão) e `secundario` (o primeiro CNAE secundário da
// Receita que bate com a base normativa da UF, só quando o principal não
// bateu — null se não houver nenhum).
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
      // incluirEmail:false — esta busca so quer cnae_fiscal; sem isso a
      // function esperava tambem a consulta complementar de e-mail (CNPJ.ws,
      // ate ~4s), atraso a toa pra quem nunca usa esse campo.
      const { data: d, error: fnError } = await supabase.functions.invoke('cnpj-lookup', { body: { cnpj: digits, incluirEmail: false } })
      if (fnError) {
        let msg = 'Nao foi possivel consultar o CNPJ agora. Tente novamente.'
        try {
          const corpo = await fnError.context?.json()
          if (corpo?.error) msg = corpo.error
        } catch { /* resposta sem corpo JSON — mantem a mensagem generica acima */ }
        throw new Error(msg)
      }

      if (!d.cnae_fiscal) throw new Error('Este CNPJ nao tem CNAE fiscal cadastrado na Receita Federal.')

      const cnaePrincipal = maskCNAE(String(d.cnae_fiscal))
      const principal = {
        cnae: cnaePrincipal,
        descricao: d.cnae_fiscal_descricao || '',
        match: buscarCNAEExato(uf, cnaePrincipal),
      }

      let secundario = null
      if (!principal.match && Array.isArray(d.cnaes_secundarios)) {
        for (const sec of d.cnaes_secundarios) {
          const cnaeSec = maskCNAE(String(sec.codigo))
          const match = buscarCNAEExato(uf, cnaeSec)
          if (match) { secundario = { cnae: cnaeSec, descricao: sec.descricao || '', match }; break }
        }
      }

      setResultado({ principal, secundario, razaoSocial: d.razao_social || '' })
    } catch (e) {
      setError(e.message || 'Erro ao consultar CNPJ.')
    } finally {
      setLoading(false)
    }
  }

  function limpar() { setResultado(null); setError('') }

  return { buscar, limpar, loading, error, resultado }
}
