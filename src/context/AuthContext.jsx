import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)

function traduzErro(msg) {
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/User already registered/i.test(msg)) return 'Já existe uma conta com esse e-mail.'
  if (/Password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (/Unable to validate email address|Email address .* is invalid/i.test(msg)) return 'E-mail inválido.'
  if (/Email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.'
  return msg
}

export function AuthProvider({ children }) {
  // undefined = ainda carregando a sessão inicial; null = deslogado
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { ok: false, error: traduzErro(error.message) } : { ok: true }
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, error: traduzErro(error.message) }
    return { ok: true, needsConfirmation: !data.session }
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <Ctx.Provider value={{
      session,
      user: session?.user ?? null,
      loading: session === undefined,
      signIn, signUp, signOut,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
