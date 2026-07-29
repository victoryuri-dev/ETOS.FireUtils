import { useCallback } from 'react'
import { useProjeto } from '../context/ProjetoContext'

// Progresso do assistente de configuracao vive no proprio projeto (persistido
// via localStorage pelo ProjetoContext) — sair e voltar mantem a etapa atual,
// em vez de reiniciar sempre na Etapa 1.
export function useWizard(total = 8) {
  const { state, dispatch } = useProjeto()
  const step     = state.configStep || 1
  const unlocked = state.configUnlocked || 1

  const setWizard = useCallback((s, u) => dispatch({ type: 'SET_WIZARD', step: s, unlocked: u }), [dispatch])

  const next = useCallback(() => {
    if (step < total) setWizard(step + 1, Math.max(unlocked, step + 1))
  }, [step, total, unlocked, setWizard])

  const prev = useCallback(() => {
    if (step > 1) setWizard(step - 1, unlocked)
  }, [step, unlocked, setWizard])

  const goTo = useCallback((n) => {
    if (n >= 1 && n <= unlocked) setWizard(n, unlocked)
  }, [unlocked, setWizard])

  return { step, totalSteps: total, unlocked, next, prev, goTo,
    isUnlocked: (n) => n <= unlocked,
    isDone: (n) => n < step,
    isActive: (n) => n === step }
}
