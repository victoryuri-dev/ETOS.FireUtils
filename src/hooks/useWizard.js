import { useState, useCallback } from 'react'
export function useWizard(total = 8) {
  const [step, setStep] = useState(1)
  const [unlocked, setUnlocked] = useState(1)
  const next = useCallback(() => {
    if (step < total) { const n = step + 1; setStep(n); setUnlocked(u => Math.max(u, n)) }
  }, [step, total])
  const prev = useCallback(() => { if (step > 1) setStep(s => s - 1) }, [step])
  const goTo = useCallback((n) => { if (n >= 1 && n <= unlocked) setStep(n) }, [unlocked])
  return { step, totalSteps: total, next, prev, goTo,
    isUnlocked: (n) => n <= unlocked,
    isDone: (n) => n < step,
    isActive: (n) => n === step }
}
