import { useProjeto } from '../context/ProjetoContext'
import { useAuditoria } from '../context/AuditoriaContext'

export function useStepStatus() {
  const { state } = useProjeto()
  const { campos } = useAuditoria()
  return (n) => {
    const daEtapa = campos.filter(c => c.etapa === n)
    if (!daEtapa.length) return n === 6 && state.pavimentos.length ? 'done' : 'empty'
    const preenchidos = daEtapa.filter(c => !c.pendente).length
    return preenchidos === daEtapa.length ? 'done' : preenchidos > 0 ? 'partial' : 'empty'
  }
}
