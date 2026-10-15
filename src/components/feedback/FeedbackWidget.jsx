import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabase'
import Icon from '../ui/Icon'

// Botão flutuante presente em toda a plataforma — canto inferior direito.
// Abre uma caixa de diálogo ao lado (acima/esquerda) pra enviar sugestões de
// implementação ou relatar erros, direto pra tabela `feedbacks` no Supabase.
export default function FeedbackWidget() {
  const { user } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  const fechar = () => { setOpen(false); setMensagem('') }

  const handleEnviar = async (e) => {
    e.preventDefault()
    const texto = mensagem.trim()
    if (!texto || enviando) return
    setEnviando(true)
    const { error } = await supabase.from('feedbacks').insert({
      user_id:  user?.id ?? null,
      usuario:  user?.email ?? '',
      pagina:   location.pathname,
      mensagem: texto,
    })
    setEnviando(false)
    if (error) {
      toast.error('Não foi possível enviar seu feedback. Tente novamente.')
      return
    }
    toast.success('Obrigado! Seu feedback foi enviado.')
    fechar()
  }

  return (
    <div className="fixed bottom-6 right-6 z-[900]">
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={fechar}/>
          <form
            onSubmit={handleEnviar}
            className="absolute bottom-[calc(100%+12px)] right-0 z-50 w-[320px] max-w-[calc(100vw-48px)] bg-surface border border-border border-solid rounded-lg shadow-[var(--shadow-md)] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-ink">Enviar feedback</h3>
              <button type="button" onClick={fechar} className="text-ink-faint hover:text-ink transition-colors" aria-label="Fechar">
                <Icon name="x" size={16}/>
              </button>
            </div>
            <p className="text-[11px] text-ink-faint leading-[1.5]">
              Sugestões de implementação ou relatos de erro — conte o que aconteceu.
            </p>
            <textarea
              autoFocus
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              placeholder="Escreva aqui..."
              rows={5}
              className="w-full resize-none text-[13px] text-ink bg-surface-2 border border-solid border-border rounded-md p-2.5 outline-none focus:border-red-border placeholder:text-ink-faint"
            />
            <button type="submit" className="btn-primary justify-center" disabled={!mensagem.trim() || enviando}>
              {enviando ? <Icon name="spinner" size={14} className="animate-spin"/> : <Icon name="feedback" size={14}/>}
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="Enviar feedback"
        aria-label="Enviar feedback"
        aria-expanded={open}
        className={`w-12 h-12 rounded-full grid place-items-center bg-transparent border border-solid transition-[opacity,color,border-color] duration-150 ${open ? 'opacity-100 text-red border-red-border' : 'opacity-50 hover:opacity-100 text-ink-faint border-border hover:text-red hover:border-red-border'}`}
      >
        <Icon name={open ? 'x' : 'feedback'} size={20}/>
      </button>
    </div>
  )
}
