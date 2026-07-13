export default function Header() {
  return (
    <header className="flex items-center justify-between px-7 h-14 bg-surface border-b border-border border-solid shrink-0 z-50">
      <div className="flex items-center gap-2.5">
        <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
          <rect x="1" y="15" width="7" height="14" fill="#C0152A"/>
          <rect x="11" y="8" width="7" height="21" fill="#C0152A"/>
          <rect x="21" y="2" width="7" height="27" fill="#8a0e1e"/>
          <rect x="0" y="26" width="11" height="3" fill="#C0152A" opacity="0.35"/>
        </svg>
        <div>
          <div className="text-[17px] font-bold text-ink tracking-[.07em]">ETOS</div>
          <div className="text-[9px] text-ink-faint tracking-[.1em] uppercase mt-0.5">Fire Utils</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <span className="opacity-50">Projetos</span>
        <span className="opacity-30">/</span>
        <span>Configuracao do projeto</span>
      </div>
    </header>
  )
}