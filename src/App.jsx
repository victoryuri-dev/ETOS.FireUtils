import { useEffect, useState } from 'react'
import {
  Routes, Route, Navigate, Outlet,
  useNavigate, useParams, useLocation,
} from 'react-router-dom'
import { ProjetoProvider, useProjeto, newIds } from './context/ProjetoContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import { usePerfil, nomeDeUsuario } from './hooks/usePerfil'
import { criarProjetoExemplo } from './data/projetoExemplo'
import LoginPage      from './pages/LoginPage'
import LandingPage    from './pages/LandingPage'
import PricingPage    from './pages/PricingPage'
import LicencaProvider from './context/LicencaContext'
import { useAcesso }   from './hooks/useLicencas'
import SemLicenca     from './components/perfil/SemLicenca'
import ProjectAside   from './components/layout/ProjectAside'
import DashboardPage  from './pages/DashboardPage'
import ConfiguracaoPage from './pages/ConfiguracaoPage'
import ProjetosPage   from './pages/ProjetosPage'
import PerfilPage     from './pages/PerfilPage'
import DocumentosPage from './pages/DocumentosPage'
import MedidaPage            from './pages/MedidaPage'
import SaidaEmergenciaPage   from './pages/medidas/SaidaEmergenciaPage'
import HidrantesPage          from './pages/medidas/HidrantesPage'
import AcessoViaturaPage      from './pages/medidas/AcessoViaturaPage'
import SegurancaEstruturalPage from './pages/medidas/SegurancaEstruturalPage'
import CompartimentacaoPage    from './pages/medidas/CompartimentacaoPage'
import ExtintoresPage         from './pages/medidas/ExtintoresPage'
import IluminacaoPage         from './pages/medidas/IluminacaoPage'
import SinalizacaoPage        from './pages/medidas/SinalizacaoPage'
import ControleAcabamentoPage from './pages/medidas/ControleAcabamentoPage'
import GerenciamentoRiscoPage from './pages/medidas/GerenciamentoRiscoPage'
import BrigadaIncendioPage    from './pages/medidas/BrigadaIncendioPage'
import AlarmeIncendioPage     from './pages/medidas/AlarmeIncendioPage'
import DeteccaoIncendioPage   from './pages/medidas/DeteccaoIncendioPage'
import Icon           from './components/ui/Icon'
import Loader         from './components/ui/Loader'
import ToastProvider   from './components/ui/ToastProvider'
import landingLogo    from './assets/fireutils-landing.svg'

// ── SaveStatusIndicator ───────────────────────────────────────────────
// Mostra se o projeto esta sendo sincronizado com o servidor ou se ja foi
// salvo — ve syncStatus (ProjetoContext), atualizado pelo autosave debounced.
// Fica invisivel ate a primeira sincronizacao (ex: sem usuario logado, ou
// projeto ainda nao pronto pra salvar).
function SaveStatusIndicator({ status }) {
  if (!status) return null
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Icon name="spinner" size={12} className="animate-spin"/> Salvando...
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-red">
        <Icon name="warn" size={12}/> Erro ao salvar
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
      <Icon name="checkCircle" size={12} className="text-green"/> Salvo
    </span>
  )
}

// ── AppHeader ─────────────────────────────────────────────────────────
function AppHeader({ onGoProjetos, isProjectPage, showProjectsLink = false }) {
  const { user, signOut } = useAuth()
  const { perfil } = usePerfil()
  const { state, syncStatus } = useProjeto()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const profileName = nomeDeUsuario(perfil, user)

  return (
    <header className="relative flex items-center justify-between gap-3 px-6 h-16 border-b border-border border-solid shrink-0 z-100">
      {/* Logo — omitida dentro de um projeto, ja mostrada no topo do aside */}
      {!isProjectPage && (
        <div className="flex items-center gap-2.5">
          <img src={landingLogo} alt="FireUtils" className="w-[126px] h-auto"/>
        </div>
      )}

      {/* Nav — breadcrumb estilo url: Projeto / UF / nome. So aparece dentro
          de um projeto, ja que fora dele nao ha contexto pra mostrar. */}
      {isProjectPage && (
        <nav className="flex items-center gap-1.5 text-[14px] min-w-0 overflow-hidden whitespace-nowrap">
          <button onClick={onGoProjetos} className="text-ink-muted hover:text-ink transition-colors cursor-pointer">
            PROJETOS
          </button>
          {state.uf && <>
            <span className="text-ink-hint">/</span>
            <span className="text-ink-muted">{state.uf}</span>
          </>}
          <span className="text-ink-hint">/</span>
          <span className="text-ink font-medium truncate">{state.nome || 'Sem nome'}</span>
          {syncStatus && (
            <span className="ml-2 pl-2.5 border-l border-solid border-border">
              <SaveStatusIndicator status={syncStatus}/>
            </span>
          )}
        </nav>
      )}

      {showProjectsLink && (
        <button
          type="button"
          onClick={onGoProjetos}
          className="absolute left-1/2 -translate-x-1/2 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          Meus projetos
        </button>
      )}

      {/* Direita — conta */}
      <div className="flex items-center gap-2 relative shrink-0">
        <button
          onClick={() => setMenuOpen(o => !o)}
          title={user?.email}
          className="group flex items-center gap-2.5 min-w-0 cursor-pointer text-ink-muted hover:text-ink transition-colors"
        >
          <span className="max-w-[180px] truncate text-[12px]">{profileName}</span>
          <span className="w-[30px] h-[30px] rounded-full bg-surface-2 flex items-center justify-center shrink-0 text-ink-faint transition-colors group-hover:text-ink">
            <Icon name="user" size={13}/>
          </span>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}/>
            <div className="absolute right-0 top-[42px] bg-surface border border-border border-solid rounded-lg shadow-lg py-1 min-w-[200px] z-50">
              <div className="px-3 py-2 text-[11px] text-ink-faint border-b border-border border-solid truncate">
                {user?.email}
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/perfil') }}
                className="w-full text-left px-3 py-2 text-[12px] text-ink-muted hover:text-ink hover:bg-surface-2 flex items-center gap-2"
              >
                <Icon name="settings" size={13}/> Perfil e configurações
              </button>
              <button
                onClick={() => { setMenuOpen(false); signOut() }}
                className="w-full text-left px-3 py-2 text-[12px] text-ink-muted hover:text-ink hover:bg-surface-2 flex items-center gap-2"
              >
                <Icon name="exit" size={13}/> Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function MedidaRoute() {
  const { sistKey } = useParams()
  if (sistKey === 'saida_emergencia')  return <SaidaEmergenciaPage/>
  if (sistKey === 'hidrantes')         return <HidrantesPage/>
  if (sistKey === 'acesso_viatura')    return <AcessoViaturaPage/>
  if (sistKey === 'seg_estrutural')    return <SegurancaEstruturalPage/>
  if (sistKey === 'compart_horizontal' || sistKey === 'compart_vertical') return <CompartimentacaoPage/>
  if (sistKey === 'extintores')        return <ExtintoresPage/>
  if (sistKey === 'iluminacao')        return <IluminacaoPage/>
  if (sistKey === 'sinalizacao')       return <SinalizacaoPage/>
  if (sistKey === 'controle_acabamento') return <ControleAcabamentoPage/>
  if (sistKey === 'gerenciamento_risco') return <GerenciamentoRiscoPage/>
  if (sistKey === 'brigada')             return <BrigadaIncendioPage/>
  if (sistKey === 'alarme')              return <AlarmeIncendioPage/>
  if (sistKey === 'deteccao')            return <DeteccaoIncendioPage/>
  return <MedidaPage sistKey={sistKey}/>
}

function DashboardRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <DashboardPage
      onGoConfig={() => navigate(`/projeto/${id}/config`)}
      onNavigate={(pageKey) => navigate(pageKey === 'documentos'
        ? `/projeto/${id}/documentos`
        : `/projeto/${id}/medida/${pageKey}`)}
    />
  )
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

  const handleNewProject = (tipo = 'completo') => {
    const ids = newIds()
    dispatch({ type: 'NEW_PROJECT', ...ids, tipo })
    navigate(`/projeto/${ids.id}/config`)
  }

  const handleNovoProjetoExemplo = () => {
    const proj = criarProjetoExemplo()
    dispatch({ type: 'LOAD', payload: proj })
    navigate(`/projeto/${proj.id}/dashboard`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AppHeader onGoProjetos={() => navigate('/projetos')} isProjectPage={false}/>
      <ProjetosPage
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
        onNovoProjetoExemplo={handleNovoProjetoExemplo}
      />
    </div>
  )
}

// ── PerfilRoute ───────────────────────────────────────────────────────
// Página da conta — fora do contexto de um projeto, como "Meus projetos".
function PerfilRoute() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AppHeader onGoProjetos={() => navigate('/projetos')} isProjectPage={false} showProjectsLink/>
      <PerfilPage/>
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
  const { state, dispatch, conflito, definirVersaoConhecida } = useProjeto()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const carregado = state.id === id

  // Roda a cada entrada no projeto (troca de :id ou de sessão) — sempre
  // busca a versão atual do Postgres, mesmo se o projeto já estiver em
  // memória (cache local ou navegação anterior), pra manter a versão
  // conhecida em dia e o controle de concorrência (ver ProjetoContext.jsx)
  // funcionando. Não depende de `state.id` — LOAD mudaria `state.id` e
  // re-disparia este efeito, criando um loop de refetch.
  useEffect(() => {
    let cancelado = false

    function carregarDoCacheLocal() {
      try {
        const raw = localStorage.getItem('etos-projetos')
        const all = raw ? JSON.parse(raw) : {}
        const proj = all[id]
        if (proj) dispatch({ type: 'LOAD', payload: proj })
        else if (state.id !== id) navigate('/projetos', { replace: true })
      } catch {
        if (state.id !== id) navigate('/projetos', { replace: true })
      }
    }

    async function carregar() {
      if (!user) return carregarDoCacheLocal()
      const { data, error } = await supabase
        .from('projetos').select('dados, version').eq('id', id).eq('user_id', user.id).maybeSingle()
      if (cancelado) return
      if (data) {
        dispatch({ type: 'LOAD', payload: data.dados })
        definirVersaoConhecida(data.version)
      } else if (!error) {
        if (state.id === id) {
          // Projeto novo (NEW_PROJECT), ainda não existe no Postgres — o
          // primeiro autosave cria a linha. Não é "não encontrado".
          definirVersaoConhecida(0)
        } else {
          navigate('/projetos', { replace: true })
        }
      } else {
        // Erro de rede (ex.: offline) — cai pro cache local como fallback
        carregarDoCacheLocal()
      }
    }
    carregar()

    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

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
      <ProjectAside
        activePage={activePage}
        onNavigate={handleNavigate}
        onSairDoProjeto={() => navigate('/projetos')}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onGoProjetos={() => navigate('/projetos')} isProjectPage/>
        {/* Conflito de edição: banner fixo (não some sozinho) — perder as
            edições desta aba é o tipo de aviso que precisa ficar visível. */}
        {conflito && (
          <div className="ibox red m-0 rounded-none border-x-0 border-t-0 shrink-0" role="alert">
            <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
            <span className="text-xs flex-1">
              <strong>Projeto alterado em outra sessão.</strong> Para não perder o que foi salvo lá, recarregue antes de continuar — suas últimas mudanças nesta aba não foram salvas.
            </span>
            <button type="button" className="btn-ghost text-[11px] py-1 px-2.5 shrink-0" onClick={() => window.location.reload()}>Recarregar</button>
          </div>
        )}
        <Outlet/>
      </div>
    </>
  )
}

// ── AuthedLayout ──────────────────────────────────────────────────────
// Rota-layout das páginas autenticadas: navegação de verdade pro /login
// (preservando a página de origem em state.from) em vez de só trocar o
// que é renderizado — assim o back/forward do navegador e o retorno pós
// -login funcionam como esperado.
function AuthedLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace/>

  return (
    <LicencaProvider>
      <div className="w-screen h-screen flex overflow-hidden bg-bg text-ink">
        <PortaoLicenca/>
      </div>
    </LicencaProvider>
  )
}

// ── PortaoLicenca ─────────────────────────────────────────────────────
// Com o bloqueio ligado (VITE_EXIGIR_LICENCA), a conta sem nenhuma licença
// válida não entra na plataforma. O perfil fica sempre liberado: é lá que
// ela vê a situação das licenças. Com o bloqueio desligado, não barra nada.
function PortaoLicenca() {
  const location = useLocation()
  const navigate = useNavigate()
  const { carregando, liberado } = useAcesso()

  if (liberado || location.pathname === '/perfil') return <Outlet/>

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AppHeader onGoProjetos={() => navigate('/projetos')} isProjectPage={false}/>
      {carregando
        ? <div className="flex-1 flex items-center justify-center"><Loader size={32}/></div>
        : <SemLicenca
            titulo="Sua conta não tem licença ativa"
            texto="Para criar e editar projetos é preciso ter uma licença válida de algum módulo do FireUtils."
          />}
    </div>
  )
}

// ── LoginRoute ────────────────────────────────────────────────────────
// Única fonte de verdade pro redirecionamento pós-login: quando `user`
// muda de null pra autenticado, este componente re-renderiza e navega —
// LoginPage não precisa (e não deve) chamar navigate() ela mesma, senão
// as duas navegações competem e a que preserva `from` pode perder a corrida.
function LoginRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (user) {
    const from = location.state?.from?.pathname || '/projetos'
    return <Navigate to={from} replace/>
  }
  return <LoginPage/>
}

// ── AppInner ──────────────────────────────────────────────────────────
function AppInner() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-bg">
        <Loader size={40}/>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage/>}/>
      <Route path="/pricing" element={<PricingPage/>}/>
      <Route path="/login" element={<LoginRoute/>}/>

      <Route element={<AuthedLayout/>}>
        <Route path="/" element={<Navigate to="/projetos" replace/>}/>
        <Route path="/projetos" element={<ProjetosRoute/>}/>
        <Route path="/perfil" element={<PerfilRoute/>}/>

        <Route path="/projeto/:id" element={<ProjectLayout/>}>
          <Route index element={<Navigate to="dashboard" replace/>}/>
          <Route path="dashboard" element={<DashboardRoute/>}/>
          <Route path="config" element={<ConfigRoute/>}/>
          <Route path="documentos" element={<DocumentosPage/>}/>
          <Route path="documentos/:docId" element={<DocumentosPage/>}/>
          <Route path="medida/:sistKey" element={<MedidaRoute/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/projetos" replace/>}/>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProjetoProvider>
          <AppInner/>
        </ProjetoProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
