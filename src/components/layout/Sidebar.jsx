import { useState } from 'react'
import Icon from '../ui/Icon'

const MEDIDAS = [
  { key:'hidrantes',  icon:'drop',   label:'Hidrantes' },
  { key:'saidas',     icon:'exit',   label:'Saidas de emergencia' },
  { key:'sprinklers', icon:'spray',  label:'Sprinklers' },
  { key:'alarme',     icon:'bell',   label:'Alarme' },
]

export default function Sidebar({ onCollapse, onGoDashboard }) {
  const [col, setCol] = useState(false)

  const toggle = () => {
    setCol(c => !c)
    onCollapse?.(!col)
  }

  const itemClass = (active, disabled) => [
    'flex items-center gap-2.5 whitespace-nowrap transition-[background-color,color] duration-100 border-l-2 border-solid text-sm',
    col ? 'py-2.5 px-0 justify-center' : 'py-2.5 px-5 justify-start',
    active ? 'text-ink font-medium bg-red-dim border-l-red' : 'text-ink-muted font-normal bg-transparent border-l-transparent',
    active && col ? 'border-r-2 border-r-solid border-r-red' : '',
    disabled ? 'opacity-[.28] pointer-events-none cursor-default' : 'cursor-pointer',
  ].filter(Boolean).join(' ')

  const labelClass = `overflow-hidden transition-opacity duration-150 ${col ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`

  return (
    <aside className={`shrink-0 bg-surface border-r border-solid border-border flex flex-col overflow-hidden transition-[width] duration-200 ${col ? 'w-14' : 'w-60'}`}>
      <div className="flex items-center justify-center h-11 cursor-pointer text-ink-faint border-b border-solid border-border shrink-0" onClick={toggle}>
        <Icon name={col ? 'chevR' : 'chevL'} size={15}/>
      </div>

      {/* Resumo — navega pro dashboard */}
      <div className={itemClass(false, false)} onClick={onGoDashboard}>
        <Icon name="dash" size={15}/>
        <span className={labelClass}>Resumo do projeto</span>
      </div>

      {/* Configuracao — ativo */}
      <div className={itemClass(true, false)}>
        <Icon name="settings" size={15}/>
        <span className={labelClass}>Configuracao</span>
      </div>

      {/* Medidas */}
      <div className={`text-[10px] text-ink-faint px-5 pt-3.5 pb-1 tracking-[.08em] uppercase whitespace-nowrap transition-opacity duration-150 ${col ? 'opacity-0' : 'opacity-100'}`}>
        <span className={labelClass}>Medidas de seguranca</span>
      </div>

      {MEDIDAS.map(m => (
        <div key={m.key} className={itemClass(false, true)}>
          <Icon name={m.icon} size={15}/>
          <span className={labelClass}>{m.label}</span>
        </div>
      ))}
    </aside>
  )
}
