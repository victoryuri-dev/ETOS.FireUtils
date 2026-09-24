import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/fireutils-logo.png'
import './LoginPage.css'

// O redirecionamento após o login é controlado pelo LoginRoute em App.jsx,
// preservando a página de origem sem criar uma segunda navegação concorrente.
export default function LoginPage() {
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

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
        if (needsConfirmation) setInfo('Conta criada! Verifique seu e-mail para confirmar antes de entrar.')
      }
    } catch {
      setError('Não foi possível conectar. Tente novamente em instantes.')
    } finally {
      setBusy(false)
    }
  }

  const toggleMode = () => {
    setMode(current => current === 'entrar' ? 'cadastro' : 'entrar')
    setError('')
    setInfo('')
  }

  const isLogin = mode === 'entrar'

  return (
    <main className="login-original w-screen h-screen flex items-center justify-center bg-bg">
      <div className="login-hero-beams" aria-hidden="true"><i/><i/><i/></div>

      <section className="login-original-card w-full max-w-[380px] bg-surface border border-border border-solid p-8" aria-labelledby="login-title">
        {busy && isLogin && (
          <div className="login-card-loader" role="status" aria-live="polite" aria-label="Entrando">
            <svg className="login-loader-mark" viewBox="0 0 168 216" aria-hidden="true">
              <path d="M168 0V154.523H121.426V50.9454L168 0Z"/>
              <path d="M103.129 61.4769V216H58.2179V112.422L103.129 61.4769Z"/>
              <path d="M44.9109 112.985H0V164.492L44.9109 112.985Z"/>
            </svg>
          </div>
        )}

        <img src={logo} alt="Fire Utils" className="h-9 w-auto mb-7"/>

        <h1 id="login-title" className="text-[15px] font-semibold text-ink mb-1">
          {isLogin ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="text-[12px] text-ink-faint mb-5">
          {isLogin ? 'Acesse seus projetos.' : 'Comece a usar o Fire Utils.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="fg">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
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
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </div>

          {error && <div className="ibox red" role="alert">{error}</div>}
          {info && <div className="ibox green" role="status">{info}</div>}

          <button type="submit" className="btn-primary justify-center mt-1" disabled={busy}>
            {busy ? 'Aguarde…' : (isLogin ? 'Entrar' : 'Criar conta')}
          </button>
        </form>

        <button type="button" onClick={toggleMode} className="login-mode-toggle w-full text-center text-[12px] text-ink-faint hover:text-ink mt-4" disabled={busy}>
          {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </section>
    </main>
  )
}
