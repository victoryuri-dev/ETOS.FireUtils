import { useId } from 'react'
import Icon from './Icon'

// Indicador de conceito — ícone "i" que, no hover, abre uma caixinha com a
// definição do campo (ex.: distinguir "altura total" de "altura da
// edificação" pros usuários que confundem as duas medidas).
// `side` (top | bottom) e `align` (center | start | end) escolhem onde a caixinha
// abre — dentro de contêineres com rolagem (modais) ela precisa abrir pro lado
// que tem espaço, senão o overflow corta o texto.
const LADO = { top: 'bottom-full mb-2', bottom: 'top-full mt-2' }
const ALINHA = { center: 'left-1/2 -translate-x-1/2', start: 'left-0', end: 'right-0' }

export default function InfoTip({ text, side = 'top', align = 'center' }) {
  const id = useId()
  return (
    <span
      className="relative inline-flex items-center group/tip rounded-full outline-none focus-visible:ring-1 focus-visible:ring-red"
      tabIndex={0}
      aria-describedby={id}
      aria-label="Mais informações"
    >
      <Icon name="info" size={12} className="text-ink-faint group-hover/tip:text-ink group-focus-visible/tip:text-ink cursor-help shrink-0"/>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-50 ${LADO[side]} ${ALINHA[align]} w-64 max-w-[80vw] rounded-md border border-solid border-white/[.18] bg-[#2a2b33] py-2.5 px-3 text-[12px] font-normal normal-case tracking-normal text-ink leading-[1.55] opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible group-focus-visible/tip:opacity-100 group-focus-visible/tip:visible transition-opacity duration-150 shadow-[0_12px_32px_rgba(0,0,0,.6)]`}
      >
        {text}
      </span>
    </span>
  )
}
