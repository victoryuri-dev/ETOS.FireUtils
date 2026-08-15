import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/fireutils-logo.png'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('entrar') // 'entrar' | 'cadastro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const from = location.state?.from?.pathname || '/projetos'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'entrar') {
        const { ok, error: err } = await signIn(email, password)
        if (ok) navigate(from, { replace: true })
        else setError(err)
      } else {
        const { ok, needsConfirmation, error: err } = await signUp(email, password)
        if (!ok) { setError(err); return }
        if (needsConfirmation) setInfo('Conta criada! Verifique seu e-mail para confirmar antes de entrar.')
        else navigate(from, { replace: true })
      }
    } catch {
      setError('Não foi possível conectar. Tente novamente em instantes.')
    } finally {
      setBusy(false)
    }
  }

  const toggleMode = () => {
    setMode(m => m === 'entrar' ? 'cadastro' : 'entrar')
    setError('')
    setInfo('')
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-[380px] bg-surface border border-border border-solid rounded-lg p-8">
        <img src={logo} alt="Fire Utils" className="h-9 w-auto mb-7"/>

        <h1 className="text-[15px] font-semibold text-ink mb-1">
          {mode === 'entrar' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="text-[12px] text-ink-faint mb-5">
          {mode === 'entrar' ? 'Acesse seus projetos.' : 'Comece a usar o Fire Utils.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="fg">
            <label>E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="fg">
            <label>Senha</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="ibox red">{error}</div>}
          {info && <div className="ibox green">{info}</div>}

          <button type="submit" className="btn-primary justify-center mt-1" disabled={busy}>
            {busy ? 'Aguarde…' : (mode === 'entrar' ? 'Entrar' : 'Criar conta')}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="w-full text-center text-[12px] text-ink-faint hover:text-ink mt-4"
        >
          {mode === 'entrar' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
