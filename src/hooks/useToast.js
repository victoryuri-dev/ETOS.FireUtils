import { useContext } from 'react'
import { ToastContext } from '../context/toastContext'

// { success, error, warning, info, dismiss } — cada um recebe (mensagem, opções):
//   title     título curto em destaque (opcional)
//   duration  ms até sumir sozinho; 0 = só fecha no X (padrão por tipo)
//   action    { label, onClick } — botão dentro da notificação
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
