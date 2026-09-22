import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Campos do responsavel tecnico guardados no perfil. Sao os mesmos nomes do
// estado do projeto (ver ProjetoContext.jsx), de proposito: aplicar o perfil
// numa etapa vira copia direta, sem tabela de-para pra manter sincronizada.
//
// A ART (artNumero, artData, artTipoServico, artValorObra) fica de fora: sao
// dados de cada projeto, nao do profissional.
const CAMPOS_RT = [
  'rtNome', 'rtConselho', 'rtCpf', 'rtEspecialidade', 'rtEmpresa', 'rtEmail', 'rtTelefone',
]

// `rtEspecialidade` nasce preenchido (e um select, nao tem opcao vazia), entao
// nao serve pra dizer se alguem chegou a preencher alguma coisa — daqui sai a
// pergunta "tem dado de verdade aqui?", usada nos dois lados: pra saber se o
// perfil tem o que oferecer e se a etapa ainda esta em branco.
const CAMPOS_PREENCHIVEIS = CAMPOS_RT.filter(c => c !== 'rtEspecialidade')

const RT_VAZIO = {
  rtNome: '', rtConselho: '', rtCpf: '', rtEspecialidade: 'Engenharia Civil',
  rtEmpresa: '', rtEmail: '', rtTelefone: '',
}

const PERFIL_VAZIO = { nome: '', telefone: '', responsavelTecnico: RT_VAZIO }

export function temDadosRT(rt) {
  return !!rt && CAMPOS_PREENCHIVEIS.some(c => (rt[c] || '').trim())
}

// So os campos conhecidos, com default pra cada um — o jsonb do Postgres
// aceita qualquer forma, inclusive `{}` de uma linha criada antes de um campo
// novo existir, e o formulario precisa de string em todo input pra nao
// alternar entre controlado e nao controlado.
function normalizarRT(bruto) {
  const rt = { ...RT_VAZIO }
  for (const campo of CAMPOS_RT) {
    if (typeof bruto?.[campo] === 'string') rt[campo] = bruto[campo]
  }
  return rt
}

// Perfil da conta logada. `perfil` e null enquanto carrega; sem usuario ou sem
// linha no banco, vem PERFIL_VAZIO — "ainda nao preencheu" nao e erro.
export function usePerfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!user) { setPerfil(PERFIL_VAZIO); return }

    let cancelado = false
    setPerfil(null)
    setErro(null)

    supabase
      .from('perfis')
      .select('nome, telefone, responsavel_tecnico')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) {
          setErro('Não foi possível carregar seu perfil.')
          setPerfil(PERFIL_VAZIO)
          return
        }
        setPerfil(data
          ? {
              nome: data.nome || '',
              telefone: data.telefone || '',
              responsavelTecnico: normalizarRT(data.responsavel_tecnico),
            }
          : PERFIL_VAZIO)
      })

    return () => { cancelado = true }
  }, [user])

  const salvar = useCallback(async (novo) => {
    if (!user) return { ok: false, erro: 'Você precisa estar logado para salvar o perfil.' }

    const { error } = await supabase.from('perfis').upsert({
      user_id: user.id,
      nome: novo.nome,
      telefone: novo.telefone,
      responsavel_tecnico: normalizarRT(novo.responsavelTecnico),
      atualizado_em: new Date().toISOString(),
    })
    if (error) return { ok: false, erro: 'Não foi possível salvar. Tente de novo.' }

    setPerfil(novo)
    return { ok: true }
  }, [user])

  return { perfil, erro, salvar }
}
