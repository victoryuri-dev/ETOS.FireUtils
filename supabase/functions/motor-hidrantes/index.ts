// Edge Function: motor-hidrantes
//
// Motor de dimensionamento do Sistema de Hidrantes. O plugin Revit (e a
// dockpane) lê o modelo — trechos por diâmetro, cotas, tipo classificado — e
// manda aqui; o cálculo, a norma e as verificações normativas ficam só neste
// lado, onde o usuário não consegue editá-los.
//
// POST { uf, valor_sistema, metodo, trechos: {t1..t4: [segmentos]}, cotas,
//        dados_succao }
//   → 200 { ok: true,  versao, norma, resultado }   (mesmo formato do payload
//                                                    "hidrantes" do firedata.json)
//   → 200 { ok: false, versao, erro }                (falha normativa ou de dados, com o
//                                                    texto que o usuário vê)
//   → 400/401/403/405/413/429                        (pedido malformado, sem login, sem licença...)
//
// Autenticação: exige a sessão de um usuário (Authorization: Bearer <access
// token>). A anon key sozinha NÃO basta — ela é pública e vai embutida no
// plugin, e o verify_jwt da plataforma a aceita. Por isso o token é resolvido
// aqui com auth.getUser.
//
// Licença: mesma régua das demais functions do plugin (módulo 'hidrantes' ou
// PRO), ligada pelo secret EXIGIR_LICENCA — ver _shared/licenca.ts.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { donoTemLicenca, ERRO_SEM_LICENCA } from '../_shared/licenca.ts'
import { carregarPerfil, NormProfileError } from '../_shared/motor/hidrantes/perfil.ts'
import { dimensionar, EntradaInvalida, validarEntrada } from '../_shared/motor/hidrantes/dimensionar.ts'

// Contrato da resposta. Aumenta quando o formato do resultado mudar de jeito
// que um cliente antigo não entenderia.
const VERSAO_MOTOR = 1

const TAMANHO_MAX_CORPO = 1024 * 1024 // 1 MB: um projeto grande ocupa na casa de dezenas de KB

// Limite por usuário, por instância da function. É um freio contra uso em
// laço (alguém mapear o comportamento do motor por tentativa e erro), não
// uma garantia: instâncias diferentes não compartilham a contagem.
const JANELA_MS = 60_000
const MAX_PEDIDOS_POR_JANELA = 30
const pedidosPorUsuario = new Map<string, number[]>()

function dentroDoLimite(userId: string, agora = Date.now()): boolean {
  const recentes = (pedidosPorUsuario.get(userId) ?? []).filter((t) => agora - t < JANELA_MS)
  if (recentes.length >= MAX_PEDIDOS_POR_JANELA) {
    pedidosPorUsuario.set(userId, recentes)
    return false
  }
  recentes.push(agora)
  pedidosPorUsuario.set(userId, recentes)
  return true
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ ok: false, erro: 'method not allowed' }, 405)

  const inicio = Date.now()

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return json({ ok: false, erro: 'login obrigatorio' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: auth, error: erroAuth } = await supabase.auth.getUser(token)
  const user = auth?.user
  if (erroAuth || !user) return json({ ok: false, erro: 'sessao invalida ou expirada — faca login novamente' }, 401)

  if (!dentroDoLimite(user.id)) {
    return json({ ok: false, erro: 'muitos pedidos em sequencia — aguarde um minuto e tente de novo' }, 429)
  }

  if (!await donoTemLicenca(supabase, user.id, ['hidrantes'])) {
    return json({ ...ERRO_SEM_LICENCA, ok: false, erro: ERRO_SEM_LICENCA.mensagem }, 403)
  }

  const declarado = Number(req.headers.get('content-length') ?? 0)
  if (declarado > TAMANHO_MAX_CORPO) return json({ ok: false, erro: 'corpo grande demais' }, 413)

  let corpo: string
  try {
    corpo = await req.text()
  } catch {
    return json({ ok: false, erro: 'corpo ilegivel' }, 400)
  }
  if (corpo.length > TAMANHO_MAX_CORPO) return json({ ok: false, erro: 'corpo grande demais' }, 413)

  let entrada
  try {
    entrada = validarEntrada(JSON.parse(corpo))
  } catch (ex) {
    if (ex instanceof EntradaInvalida) return json({ ok: false, erro: ex.message }, 400)
    return json({ ok: false, erro: 'json invalido' }, 400)
  }

  let resposta
  try {
    const perfil = await carregarPerfil(supabase, entrada.uf)
    resposta = dimensionar(entrada, perfil)
  } catch (ex) {
    if (ex instanceof NormProfileError) {
      resposta = { ok: false as const, erro: ex.message }
    } else {
      console.error('motor-hidrantes: falha inesperada', ex)
      return json({ ok: false, erro: 'falha inesperada no motor de calculo' }, 500)
    }
  }

  // Uma linha por pedido, sem dados do projeto: serve para acompanhar uso,
  // latência e o que está sendo recusado.
  console.log(JSON.stringify({
    motor: 'hidrantes',
    usuario: user.id,
    ok: resposta.ok,
    ms: Date.now() - inicio,
  }))

  return json({ versao: VERSAO_MOTOR, ...resposta })
})
