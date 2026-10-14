import logoLight from '../../assets/logo-fireutils-light.svg'
import logoDark from '../../assets/logo-fireutils-dark.svg'
import { useTheme } from '../../context/theme-context'

export default function Header() {
  const { theme } = useTheme()

  return (
    <header className="flex items-center justify-between px-7 h-14 bg-surface border-b border-border border-solid shrink-0 z-50">
      <div className="flex items-center gap-2.5">
        <img src={theme === 'light' ? logoLight : logoDark} alt="FireUtils" className="h-9 w-auto"/>
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <span className="opacity-50">Projetos</span>
        <span className="opacity-30">/</span>
        <span>Configuracao do projeto</span>
      </div>
    </header>
  )
}
