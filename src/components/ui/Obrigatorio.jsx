import { useAuditoria } from '../../context/AuditoriaContext'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Sem id: campo obrigatório de um formulário local ainda não salvo (modal).
export default function Obrigatorio({ id }) {
  const { porId } = useAuditoria()
  const ref = useRef(null)
  const { search } = useLocation()
  const alvo = new URLSearchParams(search).get('audit')
  useEffect(() => {
    if (!id || alvo !== id || !ref.current) return
    let el = ref.current.closest('label, .fg') || ref.current.parentElement
    while (el.parentElement && !el.querySelector('input, select, textarea, button')) el = el.parentElement
    el.scrollIntoView({ block:'center' })
    const input = el.querySelector('input, select, textarea, button')
    input?.focus({ preventScroll:true })
  },[id,alvo])
  if (id && !porId.has(id)) return null
  if (id && porId.get(id).obrigatorio === false) return <span ref={ref} className="hidden" aria-hidden="true" data-audit-id={id}/>
  return <span ref={ref} className="req shrink-0" title="Campo obrigatório" aria-label="obrigatório" data-audit-id={id}> *</span>
}
