import { useEffect } from 'react'
import {
  Routes, Route, Navigate, Outlet,
  useNavigate, useParams, useLocation,
} from 'react-router-dom'
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

function MedidaRoute() {
  const { sistKey } = useParams()
  if (sistKey === 'saida_emergencia')  return <SaidaEmergenciaPage/>
  if (sistKey === 'hidrantes')         return <HidrantesPage/>
  if (sistKey === 'acesso_viatura')    return <AcessoViaturaPage/>
  if (sistKey === 'seg_estrutural')    return <SegurancaEstruturalPage/>
  if (sistKey === 'extintores')        return <ExtintoresPage/>
  return <MedidaPage sistKey={sistKey}/>
}

function DashboardRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <DashboardPage onGoConfig={() => navigate(`/projeto/${id}/config`)}/>
}

function ConfigRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <ConfiguracaoPage onGoDashboard={() => navigate(`/projeto/${id}/dashboard`)}/>
}

// ── ProjetosRoute ─────────────────────────────────────────────────────
// Página "Meus projetos" — fora do contexto de um projeto aberto.
function ProjetosRoute() {
  const navigate = useNavigate()
  const { dispatch } = useProjeto()

  const handleOpenProject = (proj) => {
    dispatch({ type: 'LOAD', payload: proj })
    navigate(`/projeto/${proj.id}/dashboard`)
  }

  const handleNewProject = () => {
    const ids = newIds()
    dispatch({ type: 'NEW_PROJECT', ...ids })
    navigate(`/projeto/${ids.id}/config`)
  }

  const handleNovoProjetoExemplo = () => {
    const proj = criarProjetoExemplo()
    dispatch({ type: 'LOAD', payload: proj })
    navigate(`/projeto/${proj.id}/dashboard`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ProjetosPage
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
        onNovoProjetoExemplo={handleNovoProjetoExemplo}
      />
    </div>
  )
}

// ── ProjectLayout ─────────────────────────────────────────────────────
// Envolve as rotas de um projeto aberto (/projeto/:id/*). Garante que o
// projeto correto esteja carregado no contexto antes de renderizar — isso
// é o que permite recarregar a página (F5) sem cair de volta na lista de
// projetos: o :id na URL é a fonte da verdade, não o estado em memória.
function ProjectLayout() {
  const { id } = useParams()
  const { state, dispatch } = useProjeto()
  const navigate = useNavigate()
  const location = useLocation()

  const carregado = state.id === id

  useEffect(() => {
    if (state.id === id) return
    try {
      const raw = localStorage.getItem('etos-projetos')
      const all = raw ? JSON.parse(raw) : {}
      const proj = all[id]
      if (proj) {
        dispatch({ type: 'LOAD', payload: proj })
      } else {
        navigate('/projetos', { replace: true })
      }
    } catch {
      navigate('/projetos', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, state.id])

  const rest = location.pathname.split(`/projeto/${id}/`)[1]?.split('/') || []
  const activePage = rest[0] === 'medida' ? `medida-${rest[1]}` : (rest[0] || 'dashboard')

  const handleNavigate = (pageKey) => {
    navigate(pageKey.startsWith('medida-')
      ? `/projeto/${id}/medida/${pageKey.slice(7)}`
      : `/projeto/${id}/${pageKey}`)
  }

  if (!carregado) return null

  return (
    <>
      <ProjectAside activePage={activePage} onNavigate={handleNavigate}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet/>
      </div>
    </>
  )
}

// ── AppInner ──────────────────────────────────────────────────────────
function AppInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const isProjectPage = location.pathname.startsWith('/projeto/')

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-bg text-ink">
      <AppHeader
        onGoProjetos={() => navigate('/projetos')}
        isProjectPage={isProjectPage}
      />

      <div className="flex flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/projetos" replace/>}/>
          <Route path="/projetos" element={<ProjetosRoute/>}/>

          <Route path="/projeto/:id" element={<ProjectLayout/>}>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<DashboardRoute/>}/>
            <Route path="config" element={<ConfigRoute/>}/>
            <Route path="documentos" element={<DocumentosPage/>}/>
            <Route path="medida/:sistKey" element={<MedidaRoute/>}/>
          </Route>

          <Route path="*" element={<Navigate to="/projetos" replace/>}/>
        </Routes>
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
