import { createContext, useContext, useState } from 'react'
import Icon from '../ui/Icon'
import logoFull from '../../assets/fireutils-logo.png'
import logoSymbol from '../../assets/ETOS-SYMBOLL.png'

// Casca do menu lateral: marca, botao de retrair e a lista de itens. Existe
// porque o site tem dois menus com o mesmo visual e o mesmo comportamento de
// colapso — o global (AppAside) e o de dentro de um projeto (ProjectAside) —
// e so muda o que vai dentro.
//
// O estado de colapso viaja por contexto em vez de prop: os itens sao
// `children`, entao o Aside nao tem como repassar nada pra eles.
const ColapsadoCtx = createContext(false)

export function Aside({ children }) {
  const [colapsado, setColapsado] = useState(false)

  return (
    <aside className={`shrink-0 border-r border-solid border-border flex flex-col overflow-hidden transition-[width] duration-200 ${colapsado ? 'w-14' : 'w-60'}`}>
      <div className="p-2 shrink-0">
        {colapsado ? (
          <button
            onClick={() => setColapsado(false)}
            title="Expandir menu"
            className="w-full h-12 flex items-center justify-center rounded-lg hover:bg-white/[.06] transition-colors cursor-pointer"
          >
            <img src={logoSymbol} alt="Fire Utils" className="h-8 w-auto"/>
          </button>
        ) : (
          <div className="h-12 flex items-center justify-between gap-2 pl-1 pr-1">
            <img src={logoFull} alt="Fire Utils" className="h-8 w-auto"/>
            <button
              onClick={() => setColapsado(true)}
              title="Retrair menu"
              className="w-6 h-6 flex items-center justify-center rounded-md text-ink-faint hover:bg-white/[.06] hover:text-ink transition-colors cursor-pointer shrink-0"
            >
              <Icon name="panelLeft" size={15}/>
            </button>
          </div>
        )}
      </div>

      <ColapsadoCtx.Provider value={colapsado}>
        {children}
      </ColapsadoCtx.Provider>
    </aside>
  )
}

export function AsideItem({ icon, label, ativo, onClick }) {
  const colapsado = useContext(ColapsadoCtx)

  return (
    <div
      onClick={onClick}
      title={colapsado ? label : undefined}
      className={[
        'flex items-center gap-2.5 cursor-pointer whitespace-nowrap transition-[background-color,color] duration-100 text-[13px] border-l-2 border-solid',
        colapsado ? 'py-2.5 px-0 justify-center' : 'py-2.5 px-5 justify-start',
        ativo
          ? 'text-ink font-medium bg-red-dim border-l-red'
          : 'text-ink-muted font-normal bg-transparent border-l-transparent hover:bg-white/[.03] hover:text-ink',
        ativo && colapsado ? 'border-r-2 border-r-solid border-r-red' : '',
      ].filter(Boolean).join(' ')}
    >
      <Icon name={icon} size={18} className="shrink-0"/>
      {!colapsado && <span className="overflow-hidden text-ellipsis">{label}</span>}
    </div>
  )
}

export function AsideSection({ text }) {
  const colapsado = useContext(ColapsadoCtx)
  if (colapsado) return null

  return (
    <div className="text-[10px] text-ink-faint px-5 pt-3 pb-1 tracking-[.08em] uppercase whitespace-nowrap">
      {text}
    </div>
  )
}
