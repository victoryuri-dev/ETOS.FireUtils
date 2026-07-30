import logo from '../../assets/fireutils-logo.png'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-7 h-14 bg-surface border-b border-border border-solid shrink-0 z-50">
      <div className="flex items-center gap-2.5">
        <img src={logo} alt="Fire Utils" className="h-9 w-auto"/>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <span className="opacity-50">Projetos</span>
        <span className="opacity-30">/</span>
        <span>Configuracao do projeto</span>
      </div>
    </header>
  )
}