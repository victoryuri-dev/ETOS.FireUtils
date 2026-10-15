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
  const [resultado, setResultado] = useState({ userId: null, licencas: null, erro: null })

  useEffect(() => {
    if (!user) return

    let cancelado = false

    const carregar = () => {
      supabase
        .from('licencas')
        .select('modulo, plano, situacao, inicio_em, expira_em')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (cancelado) return
          if (error) {
            setResultado({
              userId: user.id,
              licencas: {},
              erro: 'Não foi possível consultar as licenças desta conta.',
            })
            return
          }
          setResultado({
            userId: user.id,
            licencas: Object.fromEntries((data || []).map(l => [l.modulo, l])),
            erro: null,
          })
        })
    }

    carregar()

    // Uma concessão, suspensão ou renovação feita pela administração passa a
    // valer na sessão aberta sem exigir logout. O foco cobre ambientes em que
    // o Realtime não estiver habilitado para a tabela.
    const canal = supabase
      .channel(`licencas:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'licencas',
        filter: `user_id=eq.${user.id}`,
      }, carregar)
      .subscribe()

    const aoFocar = () => carregar()
    window.addEventListener('focus', aoFocar)

    return () => {
      cancelado = true
      window.removeEventListener('focus', aoFocar)
      supabase.removeChannel(canal)
    }
  }, [user])

  // Associa o resultado ao usuário consultado. Assim, durante uma troca de
  // conta, licenças da sessão anterior nunca ficam visíveis para a nova.
  const valor = useMemo(() => {
    if (!user) return { licencas: {}, erro: null }
    if (resultado.userId !== user.id) return { licencas: null, erro: null }
    return { licencas: resultado.licencas, erro: resultado.erro }
  }, [resultado, user])

  return <LicencaContext.Provider value={valor}>{children}</LicencaContext.Provider>
}
