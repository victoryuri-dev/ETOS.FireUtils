// ── Stepper de quantidade (− valor +) — formato Sinalização ──
export default function QuantityStepper({ value, onChange, min = 0 }) {
  const dec = () => onChange(Math.max(min, (value || 0) - 1))
  const inc = () => onChange((value || 0) + 1)
  return (
    <div className="inline-flex items-center gap-1.5">
      <button type="button" onClick={dec}
        className="w-6 h-6 flex items-center justify-center rounded-md border border-solid border-border bg-transparent text-ink-faint text-sm leading-none cursor-pointer hover:bg-white/[.05] hover:text-ink"
      >−</button>
      <input type="number" min={min} value={value || 0}
        onChange={e => onChange(parseInt(e.target.value) || min)}
        className="w-12 text-right px-1.5"/>
      <button type="button" onClick={inc}
        className="w-6 h-6 flex items-center justify-center rounded-md border border-solid border-border bg-transparent text-ink-faint text-sm leading-none cursor-pointer hover:bg-white/[.05] hover:text-ink"
      >+</button>
    </div>
  )
}
