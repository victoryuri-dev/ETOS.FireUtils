// Edge Function: cnpj-lookup
//
// Proxy pro endpoint público de CNPJ da BrasilAPI (dados da Receita
// Federal) — ver src/hooks/useCnpjLookup.js, lado do site. O navegador
// batendo direto em brasilapi.com.br falha com frequência: quando a
// Cloudflare dela aplica rate-limit (muitas consultas em pouco tempo), a
// resposta de bloqueio não vem com header de CORS, e o Chrome relata isso
// como "blocked by CORS policy" — mascarando o problema real (é
// rate-limit, não CORS quebrado). Chamando pelo servidor (sem CORS entre
// servidores) e devolvendo pro navegador com nosso próprio header, a
// consulta nunca mais quebra por isso, e o rate-limit passa a ser contado
// no IP do Supabase, não no de cada visitante do site.
//
// Não usa Supabase (createClient) — não lê nem grava nada no banco, só
// repassa a consulta pública.

// `x-client-info` é adicionado automaticamente pelo client supabase-js
// (usado aqui via supabase.functions.invoke, diferente de revit-sync/
// site-sync, chamadas por HTTP cru do plugin/scripts Python) — sem
// liberar esse header, o preflight (OPTIONS) do navegador rejeita a
// chamada antes mesmo do POST sair.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

// A BrasilAPI lista "email" no schema dela, mas não preenche esse campo
// (confirmado testando vários CNPJs, inclusive grandes empresas — sempre
// null), mesmo quando a Receita Federal tem o dado cadastrado. O CNPJ.ws lê
// a mesma base pública e traz o e-mail corretamente, só que o plano
// gratuito é limitado a 3 consultas/minuto — pouco pra ser a fonte
// principal, mas serve como complemento (e, abaixo, como fallback completo
// quando a BrasilAPI falha). Dispara sempre em paralelo com a consulta
// principal (não serializa, pra não atrasar o resto); qualquer falha aqui
// (rate-limit, timeout, CNPJ sem e-mail) só derruba o complemento/fallback,
// nunca propaga erro sozinha.
async function buscarCnpjWs(digits) {
  try {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Converte a resposta do CNPJ.ws pro mesmo formato que a BrasilAPI devolve
// (campos que useCnpjLookup.js/useCnaeCnpjLookup.js já leem), pra servir de
// fallback completo quando a BrasilAPI está fora do ar ou falha pra um CNPJ
// especifico (ex.: BrasilAPI 503 num CNPJ recem-registrado, enquanto o
// CNPJ.ws ja tem o dado).
function mapearCnpjWsParaBrasilApi(data) {
  const est = data?.estabelecimento
  if (!est) return null
  const codigoNumerico = codigo => {
    const digitos = String(codigo || '').replace(/\D/g, '')
    return digitos ? Number(digitos) : null
  }
  return {
    razao_social: data.razao_social || '',
    nome_fantasia: est.nome_fantasia || '',
    ddd_telefone_1: est.ddd1 && est.telefone1 ? `${est.ddd1}${est.telefone1}` : null,
    email: est.email || null,
    cnae_fiscal: codigoNumerico(est.atividade_principal?.subclasse),
    cnae_fiscal_descricao: est.atividade_principal?.descricao || '',
    cnaes_secundarios: Array.isArray(est.atividades_secundarias)
      ? est.atividades_secundarias.map(a => ({ codigo: codigoNumerico(a.subclasse), descricao: a.descricao || '' }))
      : [],
    uf: est.estado?.sigla || '',
    logradouro: est.logradouro || '',
    numero: est.numero || '',
    complemento: est.complemento || '',
    bairro: est.bairro || '',
    municipio: est.cidade?.nome || '',
    cep: est.cep || '',
    qsa: Array.isArray(data.socios) ? data.socios.map(s => ({ nome_socio: s.nome || '' })) : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'json invalido' }, 400)
  }

  const digits = String(body?.cnpj || '').replace(/\D/g, '')
  if (digits.length !== 14) return json({ error: 'CNPJ invalido — informe 14 digitos' }, 400)

  // `incluirEmail: false` pula o uso do CNPJ.ws como complemento de e-mail
  // (useCnaeCnpjLookup.js — sugestão de CNAE na classificação do Térreo —
  // só quer cnae_fiscal, não e-mail). A consulta ao CNPJ.ws roda em paralelo
  // de qualquer forma (serve de fallback abaixo se a BrasilAPI falhar), mas
  // só é esperada quando a BrasilAPI responde com sucesso se isso for
  // realmente usado — nunca atrasa à toa quem não precisa do e-mail.
  const incluirEmail = body?.incluirEmail !== false

  // Dispara a consulta ao CNPJ.ws já aqui (sem await) pra rodar em paralelo
  // com a consulta principal — serve tanto de complemento de e-mail quanto
  // de fallback completo abaixo, se a BrasilAPI falhar.
  const cnpjWsPromise = buscarCnpjWs(digits)

  let res
  try {
    res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
  } catch {
    res = null
  }

  if (res?.ok) {
    const data = await res.json()
    if (incluirEmail && !data.email) {
      const wsData = await cnpjWsPromise
      data.email = wsData?.estabelecimento?.email || null
    }
    return json(data, 200)
  }

  if (res?.status === 404) return json({ error: 'CNPJ nao encontrado na Receita Federal.' }, 404)

  // BrasilAPI indisponivel ou com erro (ex.: upstream dela — minhareceita.org
  // — fora do ar so pra esse CNPJ especifico, mesmo com outros CNPJs
  // funcionando) — tenta a fonte alternativa antes de desistir.
  const wsData = await cnpjWsPromise
  const fallback = mapearCnpjWsParaBrasilApi(wsData)
  if (fallback) return json(fallback, 200)

  if (res?.status === 429) return json({ error: 'Muitas consultas em pouco tempo — aguarde um instante e tente novamente.' }, 429)
  return json({ error: 'Nao foi possivel consultar o CNPJ agora. Tente novamente.' }, 502)
})
