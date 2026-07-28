import { useState } from 'react'
import { ProjetoProvider, useProjeto, newIds } from './context/ProjetoContext'
import { criarProjetoExemplo } from './data/projetoExemplo'
import ProjectAside   from './components/layout/ProjectAside'
import DashboardPage  from './pages/DashboardPage'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import ProjetosPage   from './pages/ProjetosPage'
import DocumentosPage from './pages/DocumentosPage'
import MedidaPage            from './pages/MedidaPage'
import SaidaEmergenciaPage   from './pages/medidas/SaidaEmergenciaPage'
import HidrantesPage          from './pages/medidas/HidrantesPage'
import AcessoViaturaPage      from './pages/medidas/AcessoViaturaPage'
import Icon           from './components/ui/Icon'

// ── AppHeader ─────────────────────────────────────────────────────────
function AppHeader({ onGoProjetos, isProjectPage }) {
  return (
    <header className="flex items-center justify-between px-6 h-[52px] bg-surface border-b border-border border-solid shrink-0 z-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
          <rect x="1" y="15" width="7" height="14" fill="#C0152A"/>
          <rect x="11" y="8" width="7" height="21" fill="#C0152A"/>
          <rect x="21" y="2" width="7" height="27" fill="#8a0e1e"/>
          <rect x="0" y="26" width="11" height="3" fill="#C0152A" opacity="0.35"/>
        </svg>
        <div>
          <div className="text-base font-bold text-ink tracking-[.07em]">ETOS</div>
          <div className="text-[9px] text-ink-faint tracking-[.1em] uppercase mt-px">Fire Utils</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        <button
          onClick={onGoProjetos}
          className={`btn-ghost ${!isProjectPage ? 'font-medium text-ink' : 'font-normal text-ink-muted'}`}
        >
          <Icon name="file" size={12}/> Meus projetos
        </button>
      </nav>

      {/* Direita */}
      <div className="flex items-center gap-2">
        {/* Conta — placeholder */}
        <div className="w-[30px] h-[30px] rounded-full bg-surface-2 border border-border border-solid flex items-center justify-center cursor-pointer text-ink-faint">
          <Icon name="info" size={13}/>
        </div>
      </div>
    </header>
  )
}

// ── AppInner ──────────────────────────────────────────────────────────
function AppInner() {
  const [page,   setPage]   = useState('projetos')
  const { dispatch } = useProjeto()

  const handleOpenProject = (proj) => {
    dispatch({ type:'LOAD', payload: proj })
    setPage('dashboard')
  }

  const handleNewProject = () => {
    const ids = newIds()
    dispatch({ type:'NEW_PROJECT', ...ids })
    setPage('config')
  }

  const handleNovoProjetoExemplo = () => {
    dispatch({ type:'LOAD', payload: criarProjetoExemplo() })
    setPage('dashboard')
  }

  const isProjectPage = page !== 'projetos'
  const sistKey = page.startsWith('medida-') ? page.slice(7) : null

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-bg text-ink">
      <AppHeader
        onGoProjetos={() => setPage('projetos')}
        isProjectPage={isProjectPage}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* Aside só aparece dentro de um projeto */}
        {isProjectPage && (
          <ProjectAside
            activePage={page}
            onNavigate={setPage}
          />
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {page === 'projetos' && (
            <ProjetosPage
              onOpenProject={handleOpenProject}
              onNewProject={handleNewProject}
              onNovoProjetoExemplo={handleNovoProjetoExemplo}
            />
          )}
          {page === 'dashboard' && (
            <DashboardPage onGoConfig={() => setPage('config')}/>
          )}
          {page === 'config' && (
            <ConfiguracaoPage onGoDashboard={() => setPage('dashboard')}/>
          )}
          {page === 'documentos' && <DocumentosPage/>}
          {sistKey === 'saida_emergencia' && <SaidaEmergenciaPage/>}
          {sistKey === 'hidrantes' && <HidrantesPage/>}
          {sistKey === 'acesso_viatura' && <AcessoViaturaPage/>}
          {sistKey && !['saida_emergencia', 'hidrantes', 'acesso_viatura'].includes(sistKey) && <MedidaPage sistKey={sistKey}/>}
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
