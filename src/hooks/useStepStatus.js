import { useProjeto } from '../context/ProjetoContext'

function getStatus(n, state) {
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
      if (state.rtNome && state.artNumero) return 'done'
      if (state.rtNome || state.artNumero)  return 'partial'
      return 'empty'
    }
    case 4: {
      const pavs = state.pavimentos
      if (!pavs.length) return 'empty'
      if (pavs.every(p => p.divisao && p.cnae)) return 'done'
      return 'partial'
    }
    case 5: {
      const entradas = Object.values(state.cargaState).flatMap(porEst => Object.values(porEst || {}))
      if (!entradas.length) return 'empty'
      const allHave = entradas.every(c => c?.metodo === 'levantamento' ? !!c.valorManual : !!c.cargaIncendio)
      if (allHave) return 'done'
      return 'partial'
    }
    case 6: {
      if (!state.pavimentos.length) return 'empty'
      return 'partial'
    }
    case 7:
      return 'empty'
    default:
      return 'empty'
  }
}

export function useStepStatus() {
  const { state } = useProjeto()
  return (n) => getStatus(n, state)
}
