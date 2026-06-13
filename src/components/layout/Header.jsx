import Icon from '../ui/Icon'
export default function Header({ isDark, onThemeToggle }) {
  return (
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',height:56,background:'var(--surface)',borderBottom:'.5px solid var(--border)',flexShrink:0,zIndex:50}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
          <rect x="1" y="15" width="7" height="14" fill="#C0152A"/>
          <rect x="11" y="8" width="7" height="21" fill="#C0152A"/>
          <rect x="21" y="2" width="7" height="27" fill="#8a0e1e"/>
          <rect x="0" y="26" width="11" height="3" fill="#C0152A" opacity="0.35"/>
        </svg>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--text)',letterSpacing:'.07em'}}>ETOS</div>
          <div style={{fontSize:9,color:'var(--text-faint)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:2}}>Fire Utils</div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--text-muted)'}}>
        <span style={{opacity:.5}}>Projetos</span>
        <span style={{opacity:.3}}>/</span>
        <span>Configuracao do projeto</span>
      </div>
      <button className="btn-ghost" onClick={onThemeToggle}>
        <Icon name={isDark ? 'sun' : 'moon'} size={13}/>
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </button>
    </header>
  )
}