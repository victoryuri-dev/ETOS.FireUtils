import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  TriangleAlert,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/fireutils-logo.png'
import './LoginPage.css'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const pageRef = useRef(null)

  const [mode, setMode] = useState('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } })
      timeline
        .from('.login-topbar', { y: -18, opacity: 0, duration: .7 })
        .from('.login-brand-copy > *', {
          y: 34,
          opacity: 0,
          duration: 1,
          stagger: .1,
        }, .08)
        .from('.login-flow', {
          clipPath: 'inset(0 100% 0 0)',
          opacity: 0,
          duration: 1.25,
        }, .3)
        .from('.login-panel', {
          x: 42,
          opacity: 0,
          duration: 1,
        }, .18)
    })
    return () => media.revert()
  }, { scope: pageRef })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)

    try {
      if (mode === 'entrar') {
        const { ok, error: authError } = await signIn(email, password)
        if (!ok) setError(authError)
      } else {
        const { ok, needsConfirmation, error: authError } = await signUp(email, password)
        if (!ok) {
          setError(authError)
          return
        }
        if (needsConfirmation) {
          setInfo('Conta criada. Confirme o e-mail enviado para concluir seu acesso.')
        }
      }
    } catch {
      setError('Não foi possível conectar. Verifique sua conexão e tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  const toggleMode = () => {
    setMode(current => current === 'entrar' ? 'cadastro' : 'entrar')
    setError('')
    setInfo('')
    setShowPassword(false)
  }

  const isLogin = mode === 'entrar'

  return (
    <main className="login-page" ref={pageRef}>
      <div className="login-atmosphere" aria-hidden="true">
        <span className="login-beam login-beam-one"/>
        <span className="login-beam login-beam-two"/>
        <span className="login-glow"/>
      </div>

      <header className="login-topbar">
        <Link to="/landing" className="login-logo" aria-label="Voltar para a página inicial do FireUtils">
          <img src={logo} alt="FireUtils"/>
        </Link>
        <Link to="/landing" className="login-back">
          <ArrowLeft size={16}/>
          Voltar ao site
        </Link>
      </header>

      <div className="login-layout">
        <section className="login-brand" aria-labelledby="login-brand-title">
          <div className="login-brand-copy">
            <h1 id="login-brand-title">Seu projeto<br/>continua daqui.</h1>
            <p>Entre na plataforma para conectar as informações do modelo, revisar os dimensionamentos e preparar a documentação.</p>
          </div>

          <div className="login-flow" aria-label="Fluxo do projeto: Revit, FireUtils e Memorial">
            <svg className="login-flow-line" viewBox="0 0 760 150" preserveAspectRatio="none" aria-hidden="true">
              <path className="login-flow-rail" d="M16 76 H190 C230 76 234 28 278 28 H458 C500 28 506 122 548 122 H744"/>
              <path className="login-flow-signal" d="M16 76 H190 C230 76 234 28 278 28 H458 C500 28 506 122 548 122 H744"/>
            </svg>
            <div className="login-flow-step is-revit">
              <span className="login-flow-node"/>
              <strong>Revit</strong>
              <small>Modelo</small>
            </div>
            <div className="login-flow-step is-fireutils">
              <span className="login-flow-node"/>
              <strong>FireUtils</strong>
              <small>Dados e dimensionamento</small>
            </div>
            <div className="login-flow-step is-memorial">
              <span className="login-flow-node"/>
              <strong>Memorial</strong>
              <small>Documentação</small>
            </div>
          </div>

          <p className="login-brand-note">MODELO → DADOS → DOCUMENTAÇÃO</p>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel-head">
            <span className="login-panel-mark" aria-hidden="true"><LockKeyhole size={18}/></span>
            <div>
              <h2 id="login-title">{isLogin ? 'Acesse seus projetos.' : 'Crie seu acesso.'}</h2>
              <p>{isLogin ? 'Use seu e-mail e senha para continuar.' : 'Cadastre-se para começar a usar o FireUtils.'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form" key={mode}>
            <div className="login-field">
              <label htmlFor="login-email">E-mail</label>
              <div className="login-control">
                <Mail size={18} aria-hidden="true"/>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="voce@escritorio.com.br"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Senha</label>
              <div className="login-control">
                <LockKeyhole size={18} aria-hidden="true"/>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? 'Sua senha' : 'Mínimo de 6 caracteres'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(current => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="login-message" aria-live="polite">
              {error && <div className="login-alert is-error" role="alert"><TriangleAlert size={17}/><span>{error}</span></div>}
              {info && <div className="login-alert is-success" role="status"><CheckCircle2 size={17}/><span>{info}</span></div>}
            </div>

            <button type="submit" className="login-submit" disabled={busy}>
              <span>{busy ? (isLogin ? 'Entrando…' : 'Criando conta…') : (isLogin ? 'Entrar na plataforma' : 'Criar minha conta')}</span>
              {busy ? <LoaderCircle className="login-spinner" size={19}/> : <ArrowRight size={19}/>}
            </button>
          </form>

          <div className="login-switch">
            <span>{isLogin ? 'Ainda não possui acesso?' : 'Já possui uma conta?'}</span>
            <button type="button" onClick={toggleMode} disabled={busy}>
              {isLogin ? 'Criar uma conta' : 'Voltar para o login'}
            </button>
          </div>

          <p className="login-footnote">FireUtils · Plataforma web para projetos de segurança contra incêndio</p>
        </section>
      </div>
    </main>
  )
}
