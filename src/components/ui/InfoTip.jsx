import Icon from './Icon'

// Indicador de conceito — ícone "i" que, no hover, abre uma caixinha com a
// definição do campo (ex.: distinguir "altura total" de "altura da
// edificação" pros usuários que confundem as duas medidas).
export default function InfoTip({ text }) {
  return (
    <span className="relative inline-flex items-center group/tip">
      <Icon name="info" size={12} className="text-ink-hint hover:text-ink-faint cursor-help shrink-0"/>
      <span
        role="tooltip"
        className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 max-w-[70vw] rounded-md border border-solid border-border bg-surface-2 py-2 px-2.5 text-[11px] font-normal normal-case tracking-normal text-ink-muted leading-[1.5] opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-opacity duration-150 shadow-[0_10px_28px_rgba(0,0,0,.5)]"
      >
        {text}
      </span>
    </span>
  )
}
