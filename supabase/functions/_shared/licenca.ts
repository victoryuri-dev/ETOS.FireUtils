// Checagem de licença das Edge Functions do plugin (revit-sync, site-sync).
//
// O plugin não manda sessão de usuário — só o `projetoId`. Então a licença
// conferida é a do DONO do projeto (`projetos.user_id`): é a conta dele que
// contratou o módulo.
//
// Só vale quando o secret EXIGIR_LICENCA = "true". Sem ele, as functions
// seguem como antes — assim dá pra publicar o código e ligar o bloqueio
// depois, quando as licenças já estiverem concedidas.

export const EXIGIR_LICENCA = Deno.env.get('EXIGIR_LICENCA') === 'true'

// Data de hoje no Brasil (UTC-3), 'AAAA-MM-DD' — mesma régua da function
// tem_licenca() do banco, pra a licença não vencer antes da meia-noite local.
function hojeNoBrasil(): string {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/**
 * O dono do projeto tem licença válida?
 * @param modulos  null = de qualquer módulo; lista = de algum deles. O PRO
 *                 inclui todos, então sempre serve — uma lista vazia significa
 *                 "só o PRO libera".
 */
// deno-lint-ignore no-explicit-any
export async function donoTemLicenca(supabase: any, userId: string | null, modulos: string[] | null): Promise<boolean> {
  if (!EXIGIR_LICENCA) return true
  if (!userId) return false

  const { data, error } = await supabase
    .from('licencas')
    .select('modulo, expira_em')
    .eq('user_id', userId)
    .in('situacao', ['ativa', 'teste'])
  if (error || !data) return false

  const hoje = hojeNoBrasil()
  return data.some((l: { modulo: string; expira_em: string | null }) =>
    (!l.expira_em || l.expira_em >= hoje) &&
    (modulos === null || l.modulo === 'pro' || modulos.includes(l.modulo))
  )
}

export const ERRO_SEM_LICENCA = {
  error: 'sem_licenca',
  mensagem: 'A conta dona deste projeto não tem licença válida para este módulo. Confira a situação em Perfil > Ferramentas, no site.',
}
