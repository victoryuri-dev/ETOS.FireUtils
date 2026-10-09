import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import { LicencaContext } from '../hooks/useLicencas'

// Carrega as licenças da conta logada uma vez e entrega pra todo o app
// autenticado (aba Ferramentas do perfil e bloqueios de acesso). Só leitura —
// conceder ou alterar licença não é feito pelo site (ver migração
// create_licencas).
//
// Falha na consulta vira `licencas = {}` + `erro`: com o bloqueio ligado isso
// barra o acesso (não dá pra confirmar a licença), e a tela mostra o erro em
// vez de "sem licença".
export default function LicencaProvider({ children }) {
  const { user } = useAuth()
  const [licencas, setLicencas] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!user) { setLicencas({}); return }

    let cancelado = false
    setLicencas(null)
    setErro(null)

    supabase
      .from('licencas')
      .select('modulo, plano, situacao, inicio_em, expira_em')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) {
          setErro('Não foi possível consultar as licenças desta conta.')
          setLicencas({})
          return
        }
        setLicencas(Object.fromEntries((data || []).map(l => [l.modulo, l])))
      })

    return () => { cancelado = true }
  }, [user])

  const valor = useMemo(() => ({ licencas, erro }), [licencas, erro])
  return <LicencaContext.Provider value={valor}>{children}</LicencaContext.Provider>
}
