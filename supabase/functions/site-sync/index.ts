// Edge Function: site-sync
//
// Caminho inverso do revit-sync: em vez do plugin empurrar dados pro site,
// aqui o plugin PUXA dados de ocupação/área que o usuário já preencheu no
// site. Somente leitura — nunca grava nada. Identifica o projeto por
// `projetoId` (id escolhido no Dashboard da dockpane, ver revit-sync) —
// mesmo esquema, sem token secreto.
//
// Três ações (mesmo body, campo "acao"):
//   1. listar_estruturas — lista as estruturas do projeto, pro plugin
//      mostrar um seletor e o usuário escolher qual delas aquele arquivo
//      Revit representa (vínculo salvo localmente no plugin).
//   2. ocupacao_area — nome/UF do projeto, dados de ocupação (divisão/grupo/
//      CNAE por pavimento) e área construída de UMA estrutura específica
//      (a vinculada).
//   3. nomes_ambientes — nome atual de cada ambiente (Saída de Emergência)
//      de UMA estrutura específica, casado por `revitId` (Room.UniqueId) —
//      é o caminho Site → Revit: o plugin usa isso pra reaplicar no
//      parâmetro Nome do Room um nome que foi editado no site (ver
//      resolverImportacaoSaidas em SaidaEmergenciaPage.jsx pro caminho
//      inverso, Revit → Site). Só devolve ambiente que tem `revitId` —
//      um ambiente criado manualmente no site (sem Room correspondente no
//      Revit) não tem o que casar, então nem entra na resposta.
//
// Só devolve o recorte necessário — nunca o projeto inteiro, que tem dados
// sensíveis (CPF, dados de proprietário/responsável).

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

  const { projetoId, acao, estruturaId } = body || {}

  if (!projetoId || typeof projetoId !== 'string') return json({ error: 'projetoId obrigatorio' }, 400)
  if (acao !== 'listar_estruturas' && acao !== 'ocupacao_area' && acao !== 'nomes_ambientes') {
    return json({ error: 'acao invalida — use "listar_estruturas", "ocupacao_area" ou "nomes_ambientes"' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  )

  const { data: projeto } = await supabase
    .from('projetos').select('nome, dados').eq('id', projetoId).maybeSingle()

  if (!projeto) return json({ error: 'projetoId invalido' }, 401)

  const dados = projeto.dados || {}
  const estruturas = dados.estruturas || []

  if (acao === 'listar_estruturas') {
    return json(estruturas.map(e => ({ id: e.id, nome: e.nome })))
  }

  // acao === 'ocupacao_area' ou 'nomes_ambientes' — ambas exigem estruturaId
  if (!estruturaId || typeof estruturaId !== 'string') {
    return json({ error: 'estruturaId obrigatorio para esta acao' }, 400)
  }

  const estrutura = estruturas.find(e => e.id === estruturaId)
  if (!estrutura) return json({ error: 'estrutura nao encontrada neste projeto' }, 404)

  if (acao === 'nomes_ambientes') {
    const pavimentos = (dados.pavimentos || [])
      .filter(p => p.estruturaId === estruturaId)
      .map(p => ({
        nome: p.label,
        ambientes: (p.ambientes || [])
          .filter(a => a.revitId)
          .map(a => ({ revitId: a.revitId, nome: a.nome })),
      }))
    return json({ pavimentos })
  }

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
