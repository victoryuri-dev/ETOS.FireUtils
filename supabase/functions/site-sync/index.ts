// Edge Function: site-sync
//
// Caminho inverso do revit-sync: em vez do plugin empurrar dados pro site,
// aqui o plugin PUXA dados de ocupação/área que o usuário já preencheu no
// site. Somente leitura — nunca grava nada. Usa o mesmo sync_token por
// projeto (tabela `projetos`) como credencial, já que o plugin não tem
// sessão de usuário.
//
// Duas ações (mesmo body, campo "acao"):
//   1. listar_estruturas — lista as estruturas do projeto, pro plugin
//      mostrar um seletor e o usuário escolher qual delas aquele arquivo
//      Revit representa (vínculo salvo localmente no plugin).
//   2. ocupacao_area — nome/UF do projeto, dados de ocupação (divisão/grupo/
//      CNAE por pavimento) e área construída de UMA estrutura específica
//      (a vinculada).
//
// Só devolve o recorte necessário — nunca o projeto inteiro, que tem dados
// sensíveis (CPF, dados de proprietário/responsável) que o token não deveria
// expor.

import { createClient } from 'jsr:@supabase/supabase-js@2'

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

  const { token, acao, estruturaId } = body || {}

  if (!token || typeof token !== 'string') return json({ error: 'token obrigatorio' }, 400)
  if (acao !== 'listar_estruturas' && acao !== 'ocupacao_area') {
    return json({ error: 'acao invalida — use "listar_estruturas" ou "ocupacao_area"' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  )

  const { data: projeto } = await supabase
    .from('projetos').select('nome, dados').eq('sync_token', token).maybeSingle()

  if (!projeto) return json({ error: 'token invalido' }, 401)

  const dados = projeto.dados || {}
  const estruturas = dados.estruturas || []

  if (acao === 'listar_estruturas') {
    return json(estruturas.map(e => ({ id: e.id, nome: e.nome })))
  }

  // acao === 'ocupacao_area'
  if (!estruturaId || typeof estruturaId !== 'string') {
    return json({ error: 'estruturaId obrigatorio para a acao ocupacao_area' }, 400)
  }

  const estrutura = estruturas.find(e => e.id === estruturaId)
  if (!estrutura) return json({ error: 'estrutura nao encontrada neste projeto' }, 404)

  const pavimentos = (dados.pavimentos || [])
    .filter(p => p.estruturaId === estruturaId)
    .map(p => ({ id: p.id, label: p.label, divisao: p.divisao, grupo: p.grupo, cnae: p.cnae }))

  return json({
    projeto: {
      nome: projeto.nome,
      uf: dados.uf,
    },
    estrutura: {
      id: estrutura.id,
      nome: estrutura.nome,
      areaTotal: estrutura.areaTotal,
      altura: estrutura.altura,
      nPavimentos: estrutura.nPavimentos,
      nSubsolos: estrutura.nSubsolos,
    },
    pavimentos,
  })
})
