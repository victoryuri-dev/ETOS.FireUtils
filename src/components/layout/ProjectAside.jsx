import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import Icon from '../ui/Icon'

// Lista completa de sistemas — mesma ordem do Step7
const SISTEMAS = [
  { key:'acesso_viatura',      icon:'exit',    label:'Acesso de Viatura' },
  { key:'seg_estrutural',      icon:'newbld',  label:'Seg. Estrutural' },
  { key:'compart_vertical',    icon:'stair',   label:'Compartimentação Vertical' },
  { key:'controle_acabamento', icon:'sign',    label:'Controle de Acabamento' },
  { key:'saida_emergencia',    icon:'exit',    label:'Saídas de Emergência' },
  { key:'gerenciamento_risco', icon:'warn',    label:'Gerenciamento de Risco' },
  { key:'brigada',             icon:'drop',    label:'Brigada de Incêndio' },
  { key:'iluminacao',          icon:'sun',     label:'Iluminação de Emergência' },
  { key:'sinalizacao',         icon:'sign',    label:'Sinalização' },
  { key:'extintores',          icon:'ext',     label:'Extintores' },
  { key:'hidrantes',           icon:'drop',    label:'Hidrantes / Mangotinho' },
  { key:'alarme',              icon:'bell',    label:'Alarme de Incêndio' },
  { key:'deteccao',            icon:'sensor',  label:'Detecção de Incêndio' },
  { key:'sprinklers',          icon:'spray',   label:'Chuveiros Automáticos' },
  { key:'controle_fumaca',     icon:'flame',   label:'Controle de Fumaça' },
  { key:'central_gas',         icon:'info',    label:'Central de Gás' },
  { key:'spda',                icon:'warn',    label:'SPDA' },
]

export default function ProjectAside({ activePage, onNavigate }) {
  const { state }  = useProjeto()
  const { sistemas } = useMedidasObrigatorias()
  const [col, setCol] = useState(false)

  const enabledSystems = SISTEMAS.filter(s =>
    sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio
  )

  // Item de navegação genérico
  const Item = ({ pageKey, icon, label, indent }) => {
    const active = activePage === pageKey
    return (
      <div
        onClick={() => onNavigate(pageKey)}
        title={col ? label : undefined}
        className={[
          'flex items-center gap-2.5 cursor-pointer whitespace-nowrap transition-[background-color,color] duration-100 text-[13px] border-l-2 border-solid',
          col ? 'py-2.5 px-0 justify-center' : indent ? 'py-2.5 px-7 justify-start' : 'py-2.5 px-5 justify-start',
          active
            ? 'text-ink font-medium bg-red-dim border-l-red'
            : 'text-ink-muted font-normal bg-transparent border-l-transparent hover:bg-white/[.03] hover:text-ink',
          active && col ? 'border-r-2 border-r-solid border-r-red' : '',
        ].filter(Boolean).join(' ')}
      >
        <Icon name={icon} size={14} className="shrink-0"/>
        {!col && <span className="overflow-hidden text-ellipsis">{label}</span>}
      </div>
    )
  }

  // Label de seção
  const SectionLabel = ({ text }) => col ? null : (
    <div className="text-[10px] text-ink-faint px-5 pt-3 pb-1 tracking-[.08em] uppercase whitespace-nowrap">
      {text}
    </div>
  )

  return (
    <aside className={`shrink-0 bg-surface border-r border-solid border-border flex flex-col overflow-hidden transition-[width] duration-200 ${col ? 'w-14' : 'w-60'}`}>

      {/* Toggle colapso */}
      <div
        onClick={() => setCol(c => !c)}
        className="h-11 flex items-center justify-center cursor-pointer text-ink-faint border-b border-solid border-border shrink-0"
      >
        <Icon name={col ? 'chevR' : 'chevL'} size={14}/>
      </div>

      {/* Cabeçalho do projeto */}
      {!col && (
        <div className="px-5 py-3.5 border-b border-solid border-border shrink-0">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.08em] mb-[3px]">
            {state.seqId || 'Projeto'}
          </div>
          <div className="text-[13px] font-semibold text-ink leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap">
            {state.nome || 'Sem nome'}
          </div>
          {state.uf && (
            <div className="text-[11px] text-ink-faint mt-[3px]">
              {[state.cidade, state.uf].filter(Boolean).join(' — ')}
            </div>
          )}
        </div>
      )}

      {/* Navegação principal */}
      <div className="py-1.5 border-b border-solid border-border shrink-0">
        <Item pageKey="dashboard" icon="dash"     label="Resumo"/>
        <Item pageKey="config"    icon="settings" label="Configuração"/>
      </div>

      {/* Medidas de segurança + Documentos */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {enabledSystems.length > 0 && (
          <>
            <SectionLabel text="Medidas de segurança"/>
            {enabledSystems.map(s => (
              <Item key={s.key} pageKey={`medida-${s.key}`} icon={s.icon} label={s.label} indent/>
            ))}
          </>
        )}

        <div className="border-t border-solid border-border mt-1.5"/>
        <SectionLabel text="Documentos"/>
        <Item pageKey="documentos" icon="file" label="Documentos"/>
      </div>

    </aside>
  )
}
