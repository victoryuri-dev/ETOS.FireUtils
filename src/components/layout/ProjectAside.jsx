import { useEffect, useState } from 'react'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import Icon from '../ui/Icon'
import logoFull from '../../assets/fireutils-logo.png'
import logoSymbol from '../../assets/ETOS-SYMBOLL.png'

// Lista completa de sistemas — mesma ordem do Step7
const SISTEMAS = [
  { key:'acesso_viatura',      icon:'van',                   label:'Acesso de Viatura' },
  { key:'seg_estrutural',      icon:'segEstruturalMedida',   label:'Seg. Estrutural' },
  { key:'compart_horizontal',  icon:'stair',                 label:'Compartimentação Horizontal' },
  { key:'compart_vertical',    icon:'stair',                 label:'Compartimentação Vertical' },
  { key:'controle_acabamento', icon:'sign',                  label:'Controle de Acabamento' },
  { key:'saida_emergencia',    icon:'saidaEmergenciaMedida', label:'Saídas de Emergência' },
  { key:'gerenciamento_risco', icon:'warn',                  label:'Gerenciamento de Risco' },
  { key:'brigada',             icon:'shieldAlert',           label:'Brigada de Incêndio' },
  { key:'iluminacao',          icon:'sun',                   label:'Iluminação de Emergência' },
  { key:'sinalizacao',         icon:'sign',                  label:'Sinalização' },
  { key:'extintores',          icon:'extintorMedida',        label:'Extintores' },
  { key:'hidrantes',           icon:'hidranteMedida',        label:'Hidrantes / Mangotinho' },
  { key:'alarme',              icon:'bellElectric',          label:'Alarme de Incêndio' },
  { key:'deteccao',            icon:'detectorMedida',        label:'Detecção de Incêndio' },
  { key:'sprinklers',          icon:'spray',                 label:'Chuveiros Automáticos' },
  { key:'controle_fumaca',     icon:'flame',                 label:'Controle de Fumaça' },
  { key:'central_gas',         icon:'info',                  label:'Central de Gás' },
  { key:'spda',                icon:'warn',                  label:'SPDA' },
]

function NavItem({ pageKey, icon, label, onClick, activePage, collapsed, onNavigate }) {
  const active = activePage === pageKey
  return (
    <button
      type="button"
      onClick={onClick || (() => onNavigate(pageKey))}
      title={collapsed ? label : undefined}
      className={[
        'w-full flex items-center gap-2.5 cursor-pointer whitespace-nowrap transition-[background-color,color] duration-100 text-[13px] border-l-2 border-y-0 border-r-0 border-solid',
        collapsed ? 'py-2.5 px-0 justify-center' : 'py-2.5 px-5 justify-start',
        active
          ? 'text-ink font-medium bg-red-dim border-l-red'
          : 'text-ink-muted font-normal bg-transparent border-l-transparent hover:bg-white/[.03] hover:text-ink',
        active && collapsed ? 'border-r-2 border-r-solid border-r-red' : '',
      ].filter(Boolean).join(' ')}
    >
      <Icon name={icon} size={18} className="shrink-0"/>
      {!collapsed && <span className="overflow-hidden text-ellipsis">{label}</span>}
    </button>
  )
}

function SectionLabel({ text, collapsed }) {
  if (collapsed) return null
  return <div className="text-[10px] text-ink-faint px-5 pt-3 pb-1 tracking-[.08em] uppercase whitespace-nowrap">{text}</div>
}

export default function ProjectAside({ activePage, onNavigate, onSairDoProjeto }) {
  const { sistemas } = useMedidasObrigatorias()
  const [col, setCol] = useState(() => window.matchMedia('(max-width: 720px)').matches)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 720px)')
    const collapseOnMobile = event => { if (event.matches) setCol(true) }
    mobile.addEventListener('change', collapseOnMobile)
    return () => mobile.removeEventListener('change', collapseOnMobile)
  }, [])

  const enabledSystems = SISTEMAS.filter(s =>
    sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio
  )

  const itemProps = { activePage, collapsed: col, onNavigate }

  return (
    <aside className={`shrink-0 border-r border-solid border-border flex flex-col overflow-hidden transition-[width] duration-200 ${col ? 'w-14' : 'w-60'}`}>

      {/* Marca + toggle colapso */}
      <div className="p-2 shrink-0">
        {col ? (
          <button
            onClick={() => { if (!window.matchMedia('(max-width: 720px)').matches) setCol(false) }}
            title={window.matchMedia('(max-width: 720px)').matches ? 'Fire Utils' : 'Expandir menu'}
            className="w-full h-12 flex items-center justify-center rounded-lg hover:bg-white/[.06] transition-colors cursor-pointer"
          >
            <img src={logoSymbol} alt="Fire Utils" className="h-8 w-auto"/>
          </button>
        ) : (
          <div className="h-12 flex items-center justify-between gap-2 pl-1 pr-1">
            <img src={logoFull} alt="Fire Utils" className="h-8 w-auto"/>
            <button
              onClick={() => setCol(true)}
              title="Retrair menu"
              className="w-6 h-6 flex items-center justify-center rounded-md text-ink-faint hover:bg-white/[.06] hover:text-ink transition-colors cursor-pointer shrink-0"
            >
              <Icon name="panelLeft" size={15}/>
            </button>
          </div>
        )}
      </div>

      {/* Saída do projeto */}
      <div className="py-1.5 border-b border-solid border-border shrink-0">
        <NavItem icon="left" label="Projetos" onClick={onSairDoProjeto} {...itemProps}/>
      </div>

      {/* Navegação principal */}
      <div className="py-1.5 border-b border-solid border-border shrink-0">
        <NavItem pageKey="dashboard" icon="dash"     label="Dashboard" {...itemProps}/>
        <NavItem pageKey="config"    icon="settings" label="Configuração" {...itemProps}/>
      </div>

      {/* Medidas de segurança + Documentos */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {enabledSystems.length > 0 && (
          <>
            <SectionLabel text="Medidas de segurança" collapsed={col}/>
            {enabledSystems.map(s => (
              <NavItem key={s.key} pageKey={`medida-${s.key}`} icon={s.icon} label={s.label} {...itemProps}/>
            ))}
          </>
        )}

        <div className="border-t border-solid border-border mt-1.5"/>
        <SectionLabel text="Documentos" collapsed={col}/>
        <NavItem pageKey="documentos" icon="file" label="Documentos" {...itemProps}/>
      </div>

    </aside>
  )
}
