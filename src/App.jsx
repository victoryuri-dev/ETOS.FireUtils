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
import SegurancaEstruturalPage from './pages/medidas/SegurancaEstruturalPage'
import ExtintoresPage         from './pages/medidas/ExtintoresPage'
import Icon           from './components/ui/Icon'
import logo           from './assets/fireutils-logo.png'
import etosLogo       from './assets/etos-logo.png'

// ── AppHeader ─────────────────────────────────────────────────────────
function AppHeader({ onGoProjetos, isProjectPage }) {
  return (
    <header className="flex items-center justify-between px-6 h-16 bg-surface border-b border-border border-solid shrink-0 z-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img src={logo} alt="Fire Utils" className="h-11 w-auto"/>
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

// ── AppFooter ─────────────────────────────────────────────────────────
function AppFooter() {
  return (
    <footer className="flex items-center justify-between px-6 h-11 bg-surface border-t border-border border-solid shrink-0 text-[11px] text-ink-faint">
      <div className="flex items-center gap-2.5">
        <img src={etosLogo} alt="ETOS" className="h-7 w-auto"/>
        <span>© {new Date().getFullYear()} ETOS Fire Utils. Todos os direitos reservados.</span>
      </div>
      <span>Ferramenta de apoio técnico — não substitui a ART do responsável habilitado.</span>
    </footer>
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
          {sistKey === 'seg_estrutural' && <SegurancaEstruturalPage/>}
          {sistKey === 'extintores' && <ExtintoresPage/>}
          {sistKey && !['saida_emergencia', 'hidrantes', 'acesso_viatura', 'seg_estrutural', 'extintores'].includes(sistKey) && <MedidaPage sistKey={sistKey}/>}
        </div>

      </div>

      <AppFooter/>
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
