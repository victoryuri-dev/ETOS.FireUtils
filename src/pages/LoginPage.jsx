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

function AbstractBrand() {
  return (
    <section className="signin-art" aria-hidden="true">
      <div className="signin-art-grid" />
      <div className="signin-art-orbits"><i /><i /><i /></div>
      <div className="signin-art-mark-wrap">
      <svg className="signin-art-mark" viewBox="0 0 168 216">
        <defs>
          <linearGradient id="signin-red-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff3f57" />
            <stop offset=".48" stopColor="#ea1330" />
            <stop offset="1" stopColor="#8d0018" />
          </linearGradient>
          <linearGradient id="signin-red-mid" x1=".15" y1="0" x2=".9" y2="1">
            <stop offset="0" stopColor="#ff263f" />
            <stop offset=".55" stopColor="#c70825" />
            <stop offset="1" stopColor="#65000f" />
          </linearGradient>
          <linearGradient id="signin-red-deep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d90e2a" />
            <stop offset="1" stopColor="#52000c" />
          </linearGradient>
        </defs>
        <g className="signin-art-outline" transform="translate(7 7)">
          <path d="M168 0V154.523H121.426V50.9454L168 0Z" />
          <path d="M103.129 61.4769V216H58.2179V112.422L103.129 61.4769Z" />
          <path d="M44.9109 112.985H0V164.492L44.9109 112.985Z" />
        </g>
        <g className="signin-blade-entry"><path className="signin-blade signin-blade-one" d="M168 0V154.523H121.426V50.9454L168 0Z" fill="url(#signin-red-front)" /></g>
        <g className="signin-blade-entry"><path className="signin-blade signin-blade-two" d="M103.129 61.4769V216H58.2179V112.422L103.129 61.4769Z" fill="url(#signin-red-mid)" /></g>
        <g className="signin-blade-entry"><path className="signin-blade signin-blade-three" d="M44.9109 112.985H0V164.492L44.9109 112.985Z" fill="url(#signin-red-deep)" /></g>
      </svg>
      </div>
      <span className="signin-art-sheen" />
    </section>
  )
}

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
        .from('.signin-sidebar', { x: -28, opacity: 0, duration: .85 })
        .from('.signin-brand', { y: -12, opacity: 0, duration: .65 }, .12)
        .from('.signin-copy > *', { y: 24, opacity: 0, duration: .75, stagger: .09 }, .18)
        .from('.signin-form > *, .signin-switch', { y: 18, opacity: 0, duration: .68, stagger: .055 }, .28)
        .from('.signin-art-grid', { opacity: 0, duration: 1.2 }, .08)
        .from('.signin-art-orbits i', { scale: .74, opacity: 0, duration: 1.1, stagger: .1 }, .1)
        .from('.signin-art-mark', { scale: .82, rotate: -7, opacity: 0, duration: 1.35 }, .08)
        .from('.signin-blade-entry', { y: 34, opacity: 0, duration: .9, stagger: .09 }, .2)
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
        if (needsConfirmation) setInfo('Conta criada. Confirme o e-mail enviado para concluir seu acesso.')
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
    <main className="signin-page" ref={pageRef}>
      <section className="signin-sidebar" aria-labelledby="signin-title">
        <header className="signin-header">
          <Link to="/landing" className="signin-brand" aria-label="Voltar para a página inicial do FireUtils">
            <img src={logo} alt="FireUtils" />
          </Link>
          <Link to="/landing" className="signin-back"><ArrowLeft size={15} />Voltar</Link>
        </header>

        <div className="signin-auth">
          <div className="signin-copy">
            <h1 id="signin-title">{isLogin ? 'Bem-vindo de volta.' : 'Crie seu acesso.'}</h1>
            <p>{isLogin ? 'Entre para continuar seus projetos.' : 'Comece a organizar seus projetos no FireUtils.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="signin-form" key={mode}>
            <div className="signin-field">
              <label htmlFor="signin-email">E-mail</label>
              <div className="signin-control">
                <Mail size={17} aria-hidden="true" />
                <input id="signin-email" type="email" required autoComplete="email" inputMode="email" placeholder="voce@escritorio.com.br" value={email} onChange={event => setEmail(event.target.value)} />
              </div>
            </div>

            <div className="signin-field">
              <label htmlFor="signin-password">Senha</label>
              <div className="signin-control">
                <LockKeyhole size={17} aria-hidden="true" />
                <input id="signin-password" type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder={isLogin ? 'Sua senha' : 'Mínimo de 6 caracteres'} value={password} onChange={event => setPassword(event.target.value)} />
                <button type="button" className="signin-password-toggle" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="signin-message" aria-live="polite">
              {error && <div className="signin-alert is-error" role="alert"><TriangleAlert size={16} /><span>{error}</span></div>}
              {info && <div className="signin-alert is-success" role="status"><CheckCircle2 size={16} /><span>{info}</span></div>}
            </div>

            <button type="submit" className="signin-submit" disabled={busy}>
              <span>{busy ? (isLogin ? 'Entrando…' : 'Criando conta…') : (isLogin ? 'Entrar' : 'Criar conta')}</span>
              {busy ? <LoaderCircle className="signin-spinner" size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>

          <div className="signin-switch">
            <span>{isLogin ? 'Ainda não possui acesso?' : 'Já possui uma conta?'}</span>
            <button type="button" onClick={toggleMode} disabled={busy}>{isLogin ? 'Criar uma conta' : 'Voltar para o login'}</button>
          </div>
        </div>

        <p className="signin-footer">FireUtils · Projetos de segurança contra incêndio</p>
      </section>

      <AbstractBrand />
    </main>
  )
}
