import { useState } from 'react'
import { ProjetoProvider, useProjeto, newIds } from './context/ProjetoContext'
import ProjectAside   from './components/layout/ProjectAside'
import DashboardPage  from './pages/DashboardPage'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import ProjetosPage   from './pages/ProjetosPage'
import MedidaPage            from './pages/MedidaPage'
import SaidaEmergenciaPage   from './pages/medidas/SaidaEmergenciaPage'
import HidrantesPage          from './pages/medidas/HidrantesPage'
import Icon           from './components/ui/Icon'

// ── AppHeader ─────────────────────────────────────────────────────────
function AppHeader({ isDark, onThemeToggle, onGoProjetos, isProjectPage }) {
  return (
    <header style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 24px', height:52,
      background:'var(--surface)', borderBottom:'.5px solid var(--border)',
      flexShrink:0, zIndex:100,
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
          <rect x="1" y="15" width="7" height="14" fill="#C0152A"/>
          <rect x="11" y="8" width="7" height="21" fill="#C0152A"/>
          <rect x="21" y="2" width="7" height="27" fill="#8a0e1e"/>
          <rect x="0" y="26" width="11" height="3" fill="#C0152A" opacity="0.35"/>
        </svg>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', letterSpacing:'.07em' }}>ETOS</div>
          <div style={{ fontSize:9, color:'var(--text-faint)', letterSpacing:'.1em', textTransform:'uppercase', marginTop:1 }}>Fire Utils</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', gap:4 }}>
        <button
          onClick={onGoProjetos}
          className="btn-ghost"
          style={{
            fontWeight: !isProjectPage ? 500 : 400,
            color: !isProjectPage ? 'var(--text)' : 'var(--text-muted)',
          }}
        >
          <Icon name="file" size={12}/> Meus projetos
        </button>
      </nav>

      {/* Direita */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button className="btn-ghost" onClick={onThemeToggle}>
          <Icon name={isDark ? 'sun' : 'moon'} size={13}/>
          {isDark ? 'Modo claro' : 'Modo escuro'}
        </button>
        {/* Conta — placeholder */}
        <div style={{
          width:30, height:30, borderRadius:'50%',
          background:'var(--surface-2)', border:'.5px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'var(--text-faint)',
        }}>
          <Icon name="info" size={13}/>
        </div>
      </div>
    </header>
  )
}

// ── AppInner ──────────────────────────────────────────────────────────
function AppInner() {
  const [page,   setPage]   = useState('projetos')
  const [isDark, setIsDark] = useState(true)
  const { dispatch } = useProjeto()

  const toggle = () => setIsDark(d => !d)

  const handleOpenProject = (proj) => {
    dispatch({ type:'LOAD', payload: proj })
    setPage('dashboard')
  }

  const handleNewProject = () => {
    const ids = newIds()
    dispatch({ type:'NEW_PROJECT', ...ids })
    setPage('config')
  }

  const isProjectPage = page !== 'projetos'
  const sistKey = page.startsWith('medida-') ? page.slice(7) : null

  return (
    <div
      className={isDark ? '' : 'light'}
      style={{ width:'100vw', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)', color:'var(--text)' }}
    >
      <AppHeader
        isDark={isDark}
        onThemeToggle={toggle}
        onGoProjetos={() => setPage('projetos')}
        isProjectPage={isProjectPage}
      />

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Aside só aparece dentro de um projeto */}
        {isProjectPage && (
          <ProjectAside
            activePage={page}
            onNavigate={setPage}
          />
        )}

        {/* Conteúdo principal */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {page === 'projetos' && (
            <ProjetosPage
              onOpenProject={handleOpenProject}
              onNewProject={handleNewProject}
            />
          )}
          {page === 'dashboard' && (
            <DashboardPage onGoConfig={() => setPage('config')}/>
          )}
          {page === 'config' && (
            <ConfiguracaoPage onGoDashboard={() => setPage('dashboard')}/>
          )}
          {sistKey === 'saida_emergencia' && <SaidaEmergenciaPage/>}
          {sistKey === 'hidrantes' && <HidrantesPage/>}
          {sistKey && sistKey !== 'saida_emergencia' && sistKey !== 'hidrantes' && <MedidaPage sistKey={sistKey}/>}
        </div>

      </div>
    </div>
  )
}

export default function App() {
  return (
    <ProjetoProvider>
      <AppInner/>
    </ProjetoProvider>
  )
}
