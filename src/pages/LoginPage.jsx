import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'
import Icon from '../components/ui/Icon'
import { ModuleNetwork } from './LandingPage'
import './LoginPage.css'

function LoginNetwork() {
  const networkRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const network = networkRef.current
    const stage = stageRef.current
    if (!network || !stage) return
    const resize = () => {
      if (window.innerWidth > 700) {
        stage.style.setProperty('--login-network-scale', stage.clientWidth / 1160)
        return
      }
      stage.style.removeProperty('--login-network-scale')
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(network)
    observer.observe(stage)
    window.addEventListener('resize', resize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <aside ref={networkRef} className="login-network" aria-label="Ecossistema de módulos FireUtils"><div ref={stageRef} className="login-network-stage"><ModuleNetwork/></div></aside>
}

// O redirecionamento após o login é controlado pelo LoginRoute em App.jsx,
// preservando a página de origem sem criar uma segunda navegação concorrente.
// Erros e avisos aparecem dentro do próprio card — os toasts ficam reservados
// ao retorno das importações do Revit.
export default function LoginPage() {
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'erro' | 'sucesso', texto }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMensagem(null)

    try {
      if (mode === 'entrar') {
        const { ok, error: authError } = await signIn(email, password)
        if (!ok) setMensagem({ tipo: 'erro', texto: authError })
      } else {
        const { ok, needsConfirmation, error: authError } = await signUp(email, password)
        if (!ok) {
          setMensagem({ tipo: 'erro', texto: authError })
          return
        }
        if (needsConfirmation) setMensagem({ tipo: 'sucesso', texto: 'Conta criada! Verifique seu e-mail para confirmar antes de entrar.' })
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível conectar. Tente novamente em instantes.' })
    } finally {
      setBusy(false)
    }
  }

  const toggleMode = () => {
    setMode(current => current === 'entrar' ? 'cadastro' : 'entrar')
    setMensagem(null)
  }

  const isLogin = mode === 'entrar'
  const erro = mensagem?.tipo === 'erro'

  return (
    <main className="login-original w-screen bg-bg">
      <LoginNetwork/>
      <div className="login-form-pane">
      <section className="login-original-card w-full max-w-[380px] bg-surface border border-border border-solid p-8" aria-labelledby="login-title">
        {busy && isLogin && (
          <div className="login-card-loader" role="status" aria-live="polite" aria-label="Entrando">
            <Loader size={44}/>
          </div>
        )}

        <h1 id="login-title" className="text-[15px] font-semibold text-ink mb-1">
          {isLogin ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="login-intro text-[12px] text-ink-faint mb-5">
          {isLogin ? 'Acesse seus projetos.' : 'Comece a usar o Fire Utils.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="fg">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder=" "
              required
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </div>

          <div className="fg">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              placeholder=" "
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </div>

          {mensagem && (
            <div className={`ibox ${erro ? 'red' : 'green'} m-0`} role={erro ? 'alert' : 'status'}>
              <Icon name={erro ? 'warn' : 'check'} size={13} color={`var(--color-${erro ? 'red' : 'green'})`} className="shrink-0"/>
              <span className="text-xs">{mensagem.texto}</span>
            </div>
          )}

          <button type="submit" className="btn-primary justify-center mt-1" disabled={busy}>
            {busy ? 'Aguarde…' : (isLogin ? 'Entrar' : 'Criar conta')}
          </button>
        </form>

        <button type="button" onClick={toggleMode} className="login-mode-toggle w-full text-center text-[12px] text-ink-faint hover:text-ink mt-4" disabled={busy}>
          {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </section></div>
    </main>
  )
}
