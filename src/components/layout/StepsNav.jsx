import Icon from '../ui/Icon'

export default function StepsNav({ steps, current, isUnlocked, getStatus, onGo }) {
  return (
    <nav className="w-(--steps-w) shrink-0 border-r border-solid border-border py-[22px] overflow-y-auto">
      <div className="text-[10px] text-ink-faint uppercase tracking-[.08em] px-[22px] pb-3.5">Etapas</div>
      {steps.map((s,i) => {
        const n      = i + 1
        const status = getStatus(n)
        const active = n === current
        const locked = !isUnlocked(n)
        const done   = status === 'done'
        const partial = status === 'partial'

        const circleClass = active
          ? 'bg-red border-red text-white'
          : done ? 'bg-green border-green text-white'
          : partial ? 'bg-transparent border-amber text-amber'
          : 'bg-transparent border-border text-ink-faint'

        const labelClass = active ? 'text-ink' : done ? 'text-ink-muted' : partial ? 'text-ink-muted' : 'text-ink-faint'
        const subClass = done ? 'text-[rgba(29,158,117,.75)]' : partial ? 'text-[rgba(201,160,40,.75)]' : 'text-ink-hint'

        return (
          <div key={n} onClick={() => !locked && onGo(n)}
            className={`flex items-start gap-[11px] px-[22px] py-[9px] relative ${locked ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'} ${active ? 'bg-[rgba(192,21,42,.04)]' : 'bg-transparent'}`}>
            <div className={`w-[26px] h-[26px] rounded-full border-[1.5px] border-solid flex items-center justify-center text-[11px] font-semibold shrink-0 ${circleClass}`}>
              {done && !active ? <Icon name="check" size={10} color="#fff"/> : n}
            </div>
            <div className="flex-1 pt-[3px]">
              <div className={`text-xs font-medium mb-0.5 ${labelClass}`}>{s.label}</div>
              <div className={`text-[11px] ${subClass}`}>{s.sub}</div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
