import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjeto } from '../context/ProjetoContext'

// A etapa atual vive na URL (/projeto/:id/config/:step) — não só em
// state.configStep. Antes, um F5 recarregava o projeto do Supabase e podia
// voltar pra uma etapa desatualizada (SET_WIZARD nunca sincroniza com a
// nuvem — ver NAO_BROADCAST em ProjetoContext.jsx, de propósito: trocar de
// etapa sozinho não deveria contar como edição real do projeto). Com a
// etapa na URL, o próprio recarregamento do navegador já restaura o número
// certo, sem depender de state ter terminado de carregar.
export function useWizard(total = 8) {
  const { state, dispatch } = useProjeto()
  const { id, step: stepParam } = useParams()
  const navigate = useNavigate()

  // Math.min(..., total) protege projetos salvos com configUnlocked/
  // configStep de antes de uma etapa ser removida do wizard (ex.: Step7)
  // — sem isso, um projeto que já tinha chegado na etapa removida ficaria
  // preso numa posição que não existe mais.
  const unlocked = Math.min(state.configUnlocked || 1, total)
  const parsed = parseInt(stepParam, 10)
  // URL sem número (primeiro acesso) ou fora do intervalo liberado: usa a
  // última etapa conhecida do projeto como ponto de partida — o efeito
  // abaixo escreve ela de volta na URL.
  const step = (parsed >= 1 && parsed <= unlocked) ? parsed : Math.min(state.configStep || 1, unlocked)

  const setWizard = useCallback((s, u) => dispatch({ type: 'SET_WIZARD', step: s, unlocked: u }), [dispatch])

  const next = useCallback(() => {
    if (step >= total) return
    const novoUnlocked = Math.max(unlocked, step + 1)
    navigate(`/projeto/${id}/config/${step + 1}`)
    setWizard(step + 1, novoUnlocked)
  }, [step, total, unlocked, id, navigate, setWizard])

  const prev = useCallback(() => {
    if (step <= 1) return
    navigate(`/projeto/${id}/config/${step - 1}`)
    setWizard(step - 1, unlocked)
  }, [step, unlocked, id, navigate, setWizard])

  const goTo = useCallback((n) => {
    if (n < 1 || n > unlocked) return
    navigate(`/projeto/${id}/config/${n}`)
    setWizard(n, unlocked)
  }, [unlocked, id, navigate, setWizard])

  // Corrige a URL quando ela ainda não tem o número certo (sem etapa, etapa
  // antiga de antes de uma troca, ou uma fora do intervalo liberado).
  useEffect(() => {
    if (parsed !== step) navigate(`/projeto/${id}/config/${step}`, { replace: true })
  }, [parsed, step, id, navigate])

  return { step, totalSteps: total, unlocked, next, prev, goTo,
    isUnlocked: (n) => n <= unlocked,
    isDone: (n) => n < step,
    isActive: (n) => n === step }
}
