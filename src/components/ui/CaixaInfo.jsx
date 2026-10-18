import { useState } from 'react'
import Icon from './Icon'

// Caixa azul recolhível com o ícone "i" vazado: o cabeçalho inteiro abre e
// fecha; aberta, mostra o conteúdo (children). Começa recolhida.
export default function CaixaInfo({ titulo, children }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="ibox blue flex-col items-stretch gap-0 p-0 m-0">
      <button type="button" onClick={() => setAberto(a => !a)} aria-expanded={aberto}
        className="w-full flex items-center gap-2 bg-transparent border-none cursor-pointer text-left py-2.5 px-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" className="shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="12" y1="7" x2="12.01" y2="7"/>
        </svg>
        <span className="text-[12.5px] font-semibold text-ink flex-1">{titulo}</span>
        <Icon name="chevD" size={14} className={`text-ink-faint transition-transform ${aberto ? 'rotate-180' : ''}`}/>
      </button>
      {aberto && <div className="flex flex-col gap-2 px-3 pb-3 pl-9">{children}</div>}
    </div>
  )
}
