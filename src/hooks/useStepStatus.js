import { useProjeto } from '../context/ProjetoContext'
import { useMedidasObrigatorias } from './useMedidasObrigatorias'
import { divisoesDaEstrutura } from '../utils/classificacao'

function getStatus(n, state, medidas) {
  switch (n) {
    case 1: {
      const campos = [state.nome, state.endereco, state.cidade, state.propNome, state.propDocumento, state.respRazaoSocial, state.respCNPJ]
      const filled = campos.filter(Boolean).length
      if (filled === campos.length) return 'done'
      if (filled > 0) return 'partial'
      return 'empty'
    }
    case 2: {
      const estruturas = state.estruturas || []
      const hasDims = estruturas.length > 0 && estruturas.every(e => e.areaTotal && e.altura)
      const hasAny  = estruturas.some(e => e.areaTotal || e.altura || e.nPavimentos > 1)
      if (hasDims) return 'done'
      if (hasAny)  return 'partial'
      return 'empty'
    }
    case 3: {
      const artOk = !state.usaArt || state.artNumero
      if (state.rtNome && artOk) return 'done'
      if (state.rtNome || state.artNumero) return 'partial'
      return 'empty'
    }
    case 4: {
      const pavs = state.pavimentos
      if (!pavs.length) return 'empty'
      if (pavs.every(p => p.divisao && p.cnae)) return 'done'
      return 'partial'
    }
    // Confere toda divisão de cada estrutura (não só as que já têm entrada
    // em cargaState) — uma divisão nova sem carga lançada ainda deixa a
    // etapa como 'partial', nunca 'done' por omissão (mesma lógica do
    // teste "Carga de incêndio" em DashboardPage.jsx).
    case 5: {
      const estruturas = state.estruturas || []
      if (!estruturas.length) return 'empty'
      const porEstrutura = estruturas.map(est => ({
        est, divisoes: divisoesDaEstrutura((state.pavimentos || []).filter(p => p.estruturaId === est.id)),
      }))
      if (!porEstrutura.some(d => d.divisoes.length > 0)) return 'empty'
      const completo = porEstrutura.every(({ est, divisoes }) => {
        const cargaEst = state.cargaState[est.id] || {}
        return divisoes.every(code => {
          const c = cargaEst[code]
          return c?.metodo === 'levantamento' ? !!c.valorManual : !!c?.cargaIncendio
        })
      })
      return completo ? 'done' : 'partial'
    }
    // Antes nunca retornava 'done' (só 'empty'/'partial', fixo) — agora usa
    // a mesma condição do teste "Medidas de segurança" em DashboardPage.jsx:
    // precisa ter sistema ativo/obrigatório identificado, e todo sistema
    // obrigatório desligado manualmente (não a isenção automática da
    // Compartimentação) precisa do motivo da isenção preenchido.
    case 6: {
      if (!state.pavimentos.length) return 'empty'
      const { porEstrutura, sistemas } = medidas
      const activeSystems = Object.values(sistemas || {}).filter(s => s.ativo || s.obrigatorio)
      if (!activeSystems.length) return 'empty'
      const completo = (porEstrutura || []).every(pe => {
        const estId = pe.estrutura.id
        const manuais = state.sistemasPorEstrutura[estId] || {}
        const motivos = state.motivosIsencaoPorEstrutura[estId] || {}
        return Object.keys(pe.sistemas).every(key =>
          !(pe.sistemas[key]?.obrigatorio && manuais[key] === false) || !!motivos[key])
      })
      return completo ? 'done' : 'partial'
    }
    default:
      return 'empty'
  }
}

export function useStepStatus() {
  const { state } = useProjeto()
  const { porEstrutura, sistemas } = useMedidasObrigatorias()
  return (n) => getStatus(n, state, { porEstrutura, sistemas })
}
