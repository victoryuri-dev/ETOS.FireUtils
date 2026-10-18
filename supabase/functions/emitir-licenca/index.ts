// Edge Function: emitir-licenca
//
// Emite o token de licença assinado que o plugin Revit guarda localmente
// (ver _shared/licencaToken.ts para o formato e o porquê). A dockpane chama
// esta function com a sessão do usuário e entrega o token ao Python.
//
// POST {}  (Authorization: Bearer <access token do usuário>)
//   → 200 { token, exp, modulos: [...] }
//   → 401 sem login / sessão expirada
//   → 429 pedidos demais
//   → 500 chave de assinatura ausente ou inválida
//
// Conta SEM licença também recebe token — com `mod` vazio. Assim o plugin
// sabe que a conta é conhecida e que o resultado é "não contratou", em vez de
// ficar pedindo token de novo; quem barra é a lista de módulos.
//
// Secrets:
//   LICENCA_CHAVE_PRIVADA  chave RSA (PKCS#8, PEM) — gere com
//                          scripts/gerar-chave-licenca.mjs. A parte pública
//                          vai embutida no plugin (lib/licenca.py).
//   LICENCA_TTL_DIAS       validade offline do token, em dias (padrão 30,
//                          limite 1–90). É o tempo máximo que uma licença
//                          cancelada ainda vale para quem nunca abre a
//                          dockpane com internet.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import {
  assinarToken,
  importarChavePrivada,
  montarPayload,
  type LinhaLicenca,
} from '../_shared/licencaToken.ts'

const TTL_PADRAO_DIAS = 30

function ttlDias(): number {
  const bruto = Number(Deno.env.get('LICENCA_TTL_DIAS'))
  if (!Number.isFinite(bruto) || bruto <= 0) return TTL_PADRAO_DIAS
  return Math.min(90, Math.max(1, bruto))
}

// Freio contra uso em laço, por usuário e por instância (não é garantia:
// instâncias não compartilham a contagem). A dockpane pede uma vez por
// sessão, ou quando falta menos de uma semana para o token vencer.
const JANELA_MS = 60_000
const MAX_PEDIDOS_POR_JANELA = 10
const pedidosPorUsuario = new Map<string, number[]>()

function dentroDoLimite(userId: string, agora = Date.now()): boolean {
  const recentes = (pedidosPorUsuario.get(userId) ?? []).filter((t) => agora - t < JANELA_MS)
  const ok = recentes.length < MAX_PEDIDOS_POR_JANELA
  if (ok) recentes.push(agora)
  pedidosPorUsuario.set(userId, recentes)
  return ok
}

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

// A chave importada fica na instância: importar é caro e não muda.
let chaveEmCache: Promise<CryptoKey> | null = null
function chave(): Promise<CryptoKey> {
  const pem = Deno.env.get('LICENCA_CHAVE_PRIVADA')
  if (!pem) return Promise.reject(new Error('LICENCA_CHAVE_PRIVADA ausente'))
  chaveEmCache ??= importarChavePrivada(pem.replaceAll('\\n', '\n'))
  return chaveEmCache
}

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
  const user = auth?.user
  if (erroAuth || !user) return json({ error: 'sessao invalida ou expirada — faca login novamente' }, 401)

  if (!dentroDoLimite(user.id)) return json({ error: 'muitos pedidos em sequencia' }, 429)

  const { data: linhas, error: erroLicencas } = await supabase
    .from('licencas')
    .select('modulo, situacao, expira_em')
    .eq('user_id', user.id)
  if (erroLicencas) {
    console.error('emitir-licenca: falha ao ler licencas', erroLicencas.message)
    return json({ error: 'falha ao consultar as licencas' }, 500)
  }

  const payload = montarPayload({
    userId: user.id,
    email: user.email ?? null,
    linhas: (linhas ?? []) as LinhaLicenca[],
    ttlDias: ttlDias(),
  })

  try {
    const assinado = await assinarToken(payload, await chave())
    return json({ token: assinado, exp: payload.exp, modulos: Object.keys(payload.mod) })
  } catch (ex) {
    console.error('emitir-licenca: falha ao assinar', (ex as Error).message)
    return json({ error: 'falha ao assinar a licenca' }, 500)
  }
})
