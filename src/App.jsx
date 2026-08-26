import { useEffect, useState } from 'react'
import {
  Routes, Route, Navigate, Outlet,
  useNavigate, useParams, useLocation,
} from 'react-router-dom'
import { ProjetoProvider, useProjeto, newIds } from './context/ProjetoContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import { criarProjetoExemplo } from './data/projetoExemplo'
import LoginPage      from './pages/LoginPage'
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
import IluminacaoPage         from './pages/medidas/IluminacaoPage'
import SinalizacaoPage        from './pages/medidas/SinalizacaoPage'
import BrigadaIncendioPage    from './pages/medidas/BrigadaIncendioPage'
import Icon           from './components/ui/Icon'
import logo           from './assets/fireutils-logo.png'

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
function AppHeader({ onGoProjetos, isProjectPage }) {
  const { user, signOut } = useAuth()
  const { state, syncStatus } = useProjeto()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex items-center justify-between px-6 h-16 border-b border-border border-solid shrink-0 z-100">
      {/* Logo — omitida dentro de um projeto, ja mostrada no topo do aside */}
      {!isProjectPage && (
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Fire Utils" className="h-11 w-auto"/>
        </div>
      )}

      {/* Nav — breadcrumb estilo url: Projeto / UF / nome. So aparece dentro
          de um projeto, ja que fora dele nao ha contexto pra mostrar. */}
      {isProjectPage && (
        <nav className="flex items-center gap-1.5 text-[14px]">
          <button onClick={onGoProjetos} className="text-ink-muted hover:text-ink transition-colors cursor-pointer">
            PROJETOS
          </button>
          {state.uf && <>
            <span className="text-ink-hint">/</span>
            <span className="text-ink-muted">{state.uf}</span>
          </>}
          <span className="text-ink-hint">/</span>
          <span className="text-ink font-medium">{state.nome || 'Sem nome'}</span>
          {syncStatus && (
            <span className="ml-2 pl-2.5 border-l border-solid border-border">
              <SaveStatusIndicator status={syncStatus}/>
            </span>
          )}
        </nav>
      )}

      {/* Direita — conta */}
      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          title={user?.email}
          className="w-[30px] h-[30px] rounded-full bg-surface-2 border border-border border-solid flex items-center justify-center cursor-pointer text-ink-faint hover:text-ink"
        >
          <Icon name="user" size={13}/>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}/>
            <div className="absolute right-0 top-[42px] bg-surface border border-border border-solid rounded-lg shadow-lg py-1 min-w-[200px] z-50">
              <div className="px-3 py-2 text-[11px] text-ink-faint border-b border-border border-solid truncate">
                {user?.email}
              </div>
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
  if (sistKey === 'extintores')        return <ExtintoresPage/>
  if (sistKey === 'iluminacao')        return <IluminacaoPage/>
  if (sistKey === 'sinalizacao')       return <SinalizacaoPage/>
  if (sistKey === 'brigada')           return <BrigadaIncendioPage/>
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
      <AppHeader onGoProjetos={() => navigate('/projetos')} isProjectPage={false}/>
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
      <ProjectAside activePage={activePage} onNavigate={handleNavigate}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onGoProjetos={() => navigate('/projetos')} isProjectPage/>
        {conflito && (
          <div className="ibox red m-3" role="alert">
            <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
            <span>Este projeto foi alterado em outra sessão enquanto você editava aqui. Para não perder o que foi salvo lá, recarregue antes de continuar — suas últimas mudanças nesta aba não foram salvas.</span>
            <button className="btn-primary shrink-0" onClick={() => window.location.reload()}>Recarregar</button>
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
    <div className="w-screen h-screen flex overflow-hidden bg-bg text-ink">
      <Outlet/>
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
      <div className="w-screen h-screen flex items-center justify-center bg-bg text-ink-faint text-[13px]">
        Carregando…
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute/>}/>

      <Route element={<AuthedLayout/>}>
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
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProjetoProvider>
        <AppInner/>
      </ProjetoProvider>
    </AuthProvider>
  )
}
