// Edge Function: admin-usuarios
//
// Ações sobre usuários do Auth que exigem service role. A leitura/listagem
// fica nas funções SQL admin_listar_usuarios / admin_resumo_licencas.
//
// POST { acao, ... }  (Authorization: Bearer <access token do admin>)
//   convidar          { email }
//   link_redefinicao  { user_id }                  → { link }
//   banir             { user_id }
//   desbanir          { user_id }
//   excluir           { user_id, confirmacao }     (confirmacao = e-mail do usuário)
//
// Ordem fixa: valida o JWT → confere is_admin (tabela `admins`) → valida as
// entradas → executa → grava em `admin_auditoria`. A service role nunca sai
// daqui. Um admin não pode banir nem excluir a si mesmo nem outro admin.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BAN_PERMANENTE = '876000h' // ~100 anos

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return json({ error: 'login obrigatorio' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: auth, error: erroAuth } = await supabase.auth.getUser(token)
  const admin = auth?.user
  if (erroAuth || !admin) return json({ error: 'sessao invalida ou expirada' }, 401)

  const { data: ehAdmin, error: erroAdmin } = await supabase
    .from('admins').select('user_id').eq('user_id', admin.id).maybeSingle()
  if (erroAdmin) return json({ error: 'falha ao verificar permissao' }, 500)
  if (!ehAdmin) return json({ error: 'sem permissao' }, 403)

  let corpo: Record<string, unknown>
  try {
    corpo = await req.json()
  } catch {
    return json({ error: 'corpo invalido' }, 400)
  }

  const acao = String(corpo.acao ?? '')

  async function auditar(acaoAud: string, alvoId: string | null, antes?: unknown, depois?: unknown) {
    const { error } = await supabase.from('admin_auditoria').insert({
      admin_id: admin!.id,
      admin_email: admin!.email ?? null,
      acao: acaoAud,
      alvo_tipo: 'usuario',
      alvo_id: alvoId,
      antes: antes ?? null,
      depois: depois ?? null,
    })
    if (error) console.error('admin-usuarios: falha ao auditar', error.message)
  }

  if (acao === 'convidar') {
    const email = String(corpo.email ?? '').trim().toLowerCase()
    if (!EMAIL.test(email) || email.length > 254) return json({ error: 'e-mail invalido' }, 400)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)
    if (error) return json({ error: error.message }, 400)
    await auditar('usuario.convidar', data.user?.id ?? null, null, { email })
    return json({ ok: true, user_id: data.user?.id ?? null })
  }

  // As demais ações têm um usuário-alvo.
  const userId = String(corpo.user_id ?? '')
  if (!UUID.test(userId)) return json({ error: 'user_id invalido' }, 400)

  const { data: alvoData, error: erroAlvo } = await supabase.auth.admin.getUserById(userId)
  const alvo = alvoData?.user
  if (erroAlvo || !alvo) return json({ error: 'usuario nao encontrado' }, 404)

  const { data: alvoAdmin } = await supabase
    .from('admins').select('user_id').eq('user_id', userId).maybeSingle()

  if (acao === 'link_redefinicao') {
    if (!alvo.email) return json({ error: 'usuario sem e-mail' }, 400)
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email: alvo.email })
    if (error) return json({ error: error.message }, 400)
    // O link não vai para a auditoria: só o fato de ele ter sido gerado.
    await auditar('usuario.link_redefinicao', userId, null, { email: alvo.email })
    return json({ ok: true, link: data.properties?.action_link ?? null })
  }

  if (acao === 'banir' || acao === 'desbanir' || acao === 'excluir') {
    if (userId === admin.id) return json({ error: 'voce nao pode fazer isso na propria conta' }, 400)
    if (alvoAdmin) return json({ error: 'remova a permissao de administrador antes' }, 400)
  }

  if (acao === 'banir' || acao === 'desbanir') {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: acao === 'banir' ? BAN_PERMANENTE : 'none',
    })
    if (error) return json({ error: error.message }, 400)
    await auditar(`usuario.${acao}`, userId, null, { email: alvo.email })
    return json({ ok: true })
  }

  if (acao === 'excluir') {
    if (String(corpo.confirmacao ?? '') !== (alvo.email ?? '')) {
      return json({ error: 'confirmacao nao confere com o e-mail' }, 400)
    }
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) return json({ error: error.message }, 400)
    await auditar('usuario.excluir', userId, { email: alvo.email }, null)
    return json({ ok: true })
  }

  return json({ error: 'acao desconhecida' }, 400)
})
