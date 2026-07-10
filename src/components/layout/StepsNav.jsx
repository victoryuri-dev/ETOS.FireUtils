import Icon from '../ui/Icon'

const STATUS_COLOR = {
  done:    'var(--green)',
  partial: 'var(--amber)',
  empty:   'var(--border)',
}

export default function StepsNav({ steps, current, isUnlocked, getStatus, onGo }) {
  return (
    <nav style={{width:'var(--steps-w)',flexShrink:0,borderRight:'.5px solid var(--border)',padding:'22px 0',overflowY:'auto'}}>
      <div style={{fontSize:10,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',padding:'0 22px 14px'}}>Etapas</div>
      {steps.map((s,i) => {
        const n      = i + 1
        const status = getStatus(n)
        const active = n === current
        const locked = !isUnlocked(n)
        const done   = status === 'done'
        const partial = status === 'partial'

        const circleColor = active
          ? 'var(--red)'
          : done    ? 'var(--green)'
          : partial ? 'transparent'
          : 'transparent'

        const borderColor = active
          ? 'var(--red)'
          : STATUS_COLOR[status]

        const textColor = active || done
          ? '#fff'
          : partial
          ? 'var(--amber)'
          : 'var(--text-faint)'

        return (
          <div key={n} onClick={() => !locked && onGo(n)}
            style={{display:'flex',alignItems:'flex-start',gap:11,padding:'9px 22px',cursor:locked?'default':'pointer',opacity:locked?.5:1,background:active?'rgba(192,21,42,.04)':'transparent',position:'relative'}}>
            <div style={{width:26,height:26,borderRadius:'50%',border:`1.5px solid ${borderColor}`,background:circleColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:textColor,flexShrink:0}}>
              {done && !active ? <Icon name="check" size={10} color="#fff"/> : n}
            </div>
            <div style={{flex:1,paddingTop:3}}>
              <div style={{fontSize:12,fontWeight:500,color:active?'var(--text)':done?'var(--text-muted)':partial?'var(--text-muted)':'var(--text-faint)',marginBottom:2}}>{s.label}</div>
              <div style={{fontSize:11,color:done?'rgba(29,158,117,.75)':partial?'rgba(201,160,40,.75)':'var(--text-hint)'}}>{s.sub}</div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
