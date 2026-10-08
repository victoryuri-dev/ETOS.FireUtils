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

  let res
  try {
    res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
  } catch {
    return json({ error: 'Nao foi possivel consultar a BrasilAPI agora. Tente novamente.' }, 502)
  }

  if (res.status === 404) return json({ error: 'CNPJ nao encontrado na Receita Federal.' }, 404)
  if (res.status === 429) return json({ error: 'Muitas consultas em pouco tempo — aguarde um instante e tente novamente.' }, 429)
  if (!res.ok) return json({ error: 'Nao foi possivel consultar o CNPJ agora. Tente novamente.' }, 502)

  const data = await res.json()
  return json(data, 200)
})
