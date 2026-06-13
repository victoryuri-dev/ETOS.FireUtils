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

  const item = (active, disabled, onClick) => ({
    padding:     col ? '9px 0' : '9px 20px',
    fontSize:    13,
    color:       active ? 'var(--text)' : 'var(--text-muted)',
    cursor:      disabled ? 'default' : 'pointer',
    display:     'flex',
    alignItems:  'center',
    gap:         10,
    borderLeft:  active && !col ? '2px solid var(--red)' : '2px solid transparent',
    borderRight: active &&  col ? '2px solid var(--red)' : 'none',
    justifyContent: col ? 'center' : 'flex-start',
    background:  active ? 'var(--red-dim)' : 'transparent',
    fontWeight:  active ? 500 : 'normal',
    opacity:     disabled ? 0.28 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    whiteSpace:  'nowrap',
  })

  const label = { opacity: col ? 0 : 1, width: col ? 0 : 'auto', overflow: 'hidden', transition: 'opacity .15s' }

  return (
    <aside style={{ width: col ? 56 : 240, flexShrink:0, background:'var(--surface)', borderRight:'.5px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', transition:'width .2s' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:44, cursor:'pointer', color:'var(--text-faint)', borderBottom:'.5px solid var(--border)', flexShrink:0 }} onClick={toggle}>
        <Icon name={col ? 'chevR' : 'chevL'} size={15}/>
      </div>

      {/* Resumo — navega pro dashboard */}
      <div style={item(false, false)} onClick={onGoDashboard}>
        <Icon name="dash" size={15}/>
        <span style={label}>Resumo do projeto</span>
      </div>

      {/* Configuracao — ativo */}
      <div style={item(true, false)}>
        <Icon name="settings" size={15}/>
        <span style={label}>Configuracao</span>
      </div>

      {/* Medidas */}
      <div style={{ fontSize:10, color:'var(--text-faint)', padding:'14px 20px 4px', letterSpacing:'.08em', textTransform:'uppercase', whiteSpace:'nowrap', opacity: col ? 0 : 1, transition:'opacity .15s' }}>
        <span style={label}>Medidas de seguranca</span>
      </div>

      {MEDIDAS.map(m => (
        <div key={m.key} style={item(false, true)}>
          <Icon name={m.icon} size={15}/>
          <span style={label}>{m.label}</span>
        </div>
      ))}
    </aside>
  )
}
