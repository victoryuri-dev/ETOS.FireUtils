import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
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
  const [col, setCol] = useState(false)

  const enabledSystems = SISTEMAS.filter(s =>
    state.sistemas?.[s.key]?.ativo || state.sistemas?.[s.key]?.obrigatorio
  )

  const W = col ? 56 : 240

  // Item de navegação genérico
  const Item = ({ pageKey, icon, label, indent }) => {
    const active = activePage === pageKey
    return (
      <div
        onClick={() => onNavigate(pageKey)}
        title={col ? label : undefined}
        style={{
          display:'flex', alignItems:'center',
          gap:10, padding: col ? '9px 0' : `9px ${indent ? 28 : 20}px`,
          justifyContent: col ? 'center' : 'flex-start',
          fontSize:13,
          color: active ? 'var(--text)' : 'var(--text-muted)',
          fontWeight: active ? 500 : 400,
          background: active ? 'var(--red-dim)' : 'transparent',
          borderLeft: active && !col ? '2px solid var(--red)' : '2px solid transparent',
          borderRight: active && col ? '2px solid var(--red)' : 'none',
          cursor:'pointer', whiteSpace:'nowrap',
          transition:'background .1s, color .1s',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.color = 'var(--text)' }}}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}}
      >
        <Icon name={icon} size={14} style={{ flexShrink:0 }}/>
        {!col && <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>}
      </div>
    )
  }

  // Label de seção
  const SectionLabel = ({ text }) => col ? null : (
    <div style={{ fontSize:10, color:'var(--text-faint)', padding:'12px 20px 4px', letterSpacing:'.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
      {text}
    </div>
  )

  return (
    <aside style={{
      width:W, flexShrink:0,
      background:'var(--surface)', borderRight:'.5px solid var(--border)',
      display:'flex', flexDirection:'column', overflow:'hidden',
      transition:'width .2s',
    }}>

      {/* Toggle colapso */}
      <div
        onClick={() => setCol(c => !c)}
        style={{ height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-faint)', borderBottom:'.5px solid var(--border)', flexShrink:0 }}
      >
        <Icon name={col ? 'chevR' : 'chevL'} size={14}/>
      </div>

      {/* Cabeçalho do projeto */}
      {!col && (
        <div style={{ padding:'14px 20px', borderBottom:'.5px solid var(--border)', flexShrink:0 }}>
          <div style={{ fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>
            {state.seqId || 'Projeto'}
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {state.nome || 'Sem nome'}
          </div>
          {state.uf && (
            <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:3 }}>
              {[state.cidade, state.uf].filter(Boolean).join(' — ')}
            </div>
          )}
        </div>
      )}

      {/* Navegação principal */}
      <div style={{ padding:'6px 0', borderBottom:'.5px solid var(--border)', flexShrink:0 }}>
        <Item pageKey="dashboard" icon="dash"     label="Resumo"/>
        <Item pageKey="config"    icon="settings" label="Configuração"/>
      </div>

      {/* Medidas de segurança */}
      {enabledSystems.length > 0 && (
        <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
          <SectionLabel text="Medidas de segurança"/>
          {enabledSystems.map(s => (
            <Item key={s.key} pageKey={`medida-${s.key}`} icon={s.icon} label={s.label} indent/>
          ))}
        </div>
      )}

    </aside>
  )
}
