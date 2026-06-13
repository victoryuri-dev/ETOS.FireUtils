import Icon from '../ui/Icon'
export default function StepsNav({ steps, current, isUnlocked, isDone, onGo }) {
  return (
    <nav style={{width:'var(--steps-w)',flexShrink:0,borderRight:'.5px solid var(--border)',padding:'22px 0',overflowY:'auto'}}>
      <div style={{fontSize:10,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',padding:'0 22px 14px'}}>Etapas</div>
      {steps.map((s,i) => {
        const n=i+1, done=isDone(n), active=n===current, locked=!isUnlocked(n)
        return (
          <div key={n} onClick={()=>!locked&&onGo(n)}
            style={{display:'flex',alignItems:'flex-start',gap:11,padding:'9px 22px',cursor:locked?'default':'pointer',opacity:locked?.5:1,background:active?'rgba(192,21,42,.04)':'transparent',position:'relative'}}>
            <div style={{width:26,height:26,borderRadius:'50%',border:`1.5px solid ${done?'var(--green)':active?'var(--red)':'var(--border)'}`,background:done?'var(--green)':active?'var(--red)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:done||active?'#fff':'var(--text-faint)',flexShrink:0}}>
              {done ? <Icon name="check" size={10} color="#fff"/> : n}
            </div>
            <div style={{flex:1,paddingTop:3}}>
              <div style={{fontSize:12,fontWeight:500,color:active?'var(--text)':done?'var(--text-hint)':'var(--text-faint)',marginBottom:2}}>{s.label}</div>
              <div style={{fontSize:11,color:done?'rgba(29,158,117,.6)':'var(--text-hint)'}}>{s.sub}</div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}