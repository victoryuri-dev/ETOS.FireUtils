// Edge Function: revit-sync
//
// Recebe POST { token, medida, payload } do plugin Revit e grava em
// `revit_syncs_latest`, substituindo o firedata.json como transporte.
// O `token` é o sync_token gerado por projeto (tabela `projetos`, exposto
// no card "Integração Revit" do dashboard) — funciona como uma API key
// escopada, já que o plugin nunca tem uma sessão de usuário de verdade.
//
// Usa a service_role key (injetada automaticamente pelo Supabase em toda
// Edge Function, não precisa configurar) porque o RLS de `revit_syncs_latest`
// não libera insert/update para ninguém além desta function — a validação
// do token É a autorização aqui.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MEDIDAS_VALIDAS = ['extintores', 'hidrantes', 'saidas_emergencia']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
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

  const { token, medida, payload } = body || {}

  if (!token || typeof token !== 'string') return json({ error: 'token obrigatorio' }, 400)
  if (!MEDIDAS_VALIDAS.includes(medida)) return json({ error: `medida invalida — use uma de: ${MEDIDAS_VALIDAS.join(', ')}` }, 400)
  if (!payload || typeof payload !== 'object') return json({ error: 'payload obrigatorio' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  )

  const { data: projeto } = await supabase
    .from('projetos').select('id').eq('sync_token', token).maybeSingle()
  // Qualquer falha aqui — token não encontrado ou nem sequer um UUID válido —
  // é tratada como falha de autenticação, não erro de servidor.

  if (!projeto) return json({ error: 'token invalido' }, 401)

  const { error: upsertErr } = await supabase
    .from('revit_syncs_latest')
    .upsert(
      { projeto_id: projeto.id, medida, payload, updated_at: new Date().toISOString() },
      { onConflict: 'projeto_id,medida' },
    )

  if (upsertErr) return json({ error: 'falha ao gravar sincronizacao' }, 500)

  return json({ ok: true })
})
