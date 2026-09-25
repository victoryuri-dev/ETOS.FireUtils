// memorial/iluminacao.js — texto do memorial descritivo para o Sistema de
// Iluminação de Emergência (NT 18 CBMMA / NBR 10898). Usa o MESMO calc puro
// (iluminacao_calc.js) que alimenta a tela de dimensionamento — o texto
// nunca duplica a lógica de conformidade, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de parágrafos corridos —
// mesmo padrão do memorial de Extintores.

import { getIluminacao } from '../normas/index'
import { calcularBalizamento, nomeEspecificacao } from '../iluminacao_calc'

// Matriz pavimento x equipamento (em vez de uma tabela por pavimento) —
// só entram como coluna os equipamentos com ao menos 1 unidade cadastrada
// em algum pavimento desta estrutura, pra não poluir com colunas zeradas
// quando estruturas diferentes usam especificações diferentes.
function tabelaAclaramento(pavs, itensPorPav, equipamentosUsados) {
  const colunas = equipamentosUsados.filter(eq =>
    pavs.some(p => itensPorPav.get(p.id).some(i => i.tipoEquipamento === eq.key && (i.quantidade || 0) > 0))
  )
  if (colunas.length === 0) return null

  return {
    tipo: 'tabela',
    colunas: ['Pavimento', ...colunas.map(eq => eq.label)],
    linhas: pavs.map(p => {
      const itens = itensPorPav.get(p.id)
      return [p.label, ...colunas.map(eq => String(itens.find(i => i.tipoEquipamento === eq.key)?.quantidade || 0))]
    }),
  }
}

// Mesma lógica em matriz pra balizamento — só entra pavimento com algo
// cadastrado (linha) e ponto com alguma unidade nessa estrutura (coluna).
function tabelaBalizamento(pavs, itensBalizPorPav, pontosBalizamento) {
  const pavsComItens = pavs.filter(p => itensBalizPorPav.get(p.id).length > 0)
  if (pavsComItens.length === 0) return null

  const porPontoDaEstrutura = calcularBalizamento(pavsComItens.flatMap(p => itensBalizPorPav.get(p.id)), pontosBalizamento).porPonto
  const colunas = pontosBalizamento.filter(pt => porPontoDaEstrutura[pt.key] > 0)
  if (colunas.length === 0) return null

  return {
    tipo: 'tabela',
    colunas: ['Pavimento', ...colunas.map(c => c.label)],
    linhas: pavsComItens.map(p => {
      const { porPonto } = calcularBalizamento(itensBalizPorPav.get(p.id), pontosBalizamento)
      return [p.label, ...colunas.map(c => String(porPonto[c.key] || 0))]
    }),
  }
}

function blocosDaEstrutura(est, pavs, itensDaEstrutura, equipamentosUsados, norma) {
  const itensPorPav = new Map(pavs.map(p => [p.id, itensDaEstrutura.filter(i => i.pavimentoId === p.id && i.categoria === 'aclaramento')]))
  const itensBalizPorPav = new Map(pavs.map(p => [p.id, itensDaEstrutura.filter(i => i.pavimentoId === p.id && i.categoria === 'balizamento')]))

  const blocos = [{ tipo: 'titulo2', texto: est.nome }]

  const tabAclar = tabelaAclaramento(pavs, itensPorPav, equipamentosUsados)
  blocos.push(tabAclar || { tipo: 'paragrafo', texto: `Nenhuma luminária de aclaramento cadastrada em ${est.nome}.` })

  const tabBaliz = tabelaBalizamento(pavs, itensBalizPorPav, norma.PONTOS_BALIZAMENTO)
  if (tabBaliz) {
    blocos.push({ tipo: 'titulo3', texto: 'Luminárias de Balizamento' })
    blocos.push(tabBaliz)
  }

  return blocos
}

export function textoMemorialIluminacao(state) {
  const norma = getIluminacao(state.uf)
  const { ILUMINANCIA_MINIMA, RAZAO_UNIFORMIDADE_MAX, AUTONOMIA_MINIMA_HORAS, TEMPO_RESPOSTA_MAX_S, TIPOS_SISTEMA, EQUIPAMENTOS_ACLARAMENTO, CAMPOS_EQUIPAMENTO } = norma
  const sistema = state.iluminacaoSistema || {}
  const especificacoes = sistema.especificacoes || []

  // Uma opção por especificação cadastrada (não por tipo base) — rotulada
  // com o fluxo luminoso para diferenciar variantes do mesmo equipamento,
  // mesmo critério usado em IluminacaoPage.jsx.
  const equipamentosUsados = especificacoes.map(spec => {
    const base = EQUIPAMENTOS_ACLARAMENTO.find(eq => eq.key === spec.tipoBase)
    return { key: spec.id, label: nomeEspecificacao(spec, base?.label || spec.tipoBase) }
  })
  const equipamentosSpec = Object.fromEntries(especificacoes.map(spec => [spec.id, spec]))

  const blocos = [{
    tipo: 'paragrafo',
    texto: `A iluminação de emergência deve garantir iluminância mínima de ${ILUMINANCIA_MINIMA.aclaramento_normal} lux nos ambientes em geral (${ILUMINANCIA_MINIMA.aclaramento_risco} lux em áreas de risco elevado ou grande concentração de público) e de ${ILUMINANCIA_MINIMA.balizamento} lux no eixo dos percursos de saída, com uniformidade máxima de ${RAZAO_UNIFORMIDADE_MAX}:1, autonomia mínima de bateria de ${AUTONOMIA_MINIMA_HORAS} hora e tempo de resposta de no máximo ${TEMPO_RESPOSTA_MAX_S} segundos após a falta de energia da rede normal (NBR 10898 / NT 18 CBMMA).`,
  }]

  const tipoSistemaInfo = TIPOS_SISTEMA.find(t => t.key === sistema.tipo)
  if (tipoSistemaInfo) {
    const precisaLocalizacao = sistema.tipo === 'central' || sistema.tipo === 'motogerador'
    blocos.push({
      tipo: 'paragrafo',
      texto: `O sistema adotado no projeto é do tipo ${tipoSistemaInfo.label.toLowerCase()}.` +
        (precisaLocalizacao
          ? ` A fonte do sistema (${sistema.tipo === 'motogerador' ? 'grupo motogerador' : 'central de baterias'}) está localizada em ${sistema.localizacaoFonte || 'local a definir pelo responsável técnico'}.`
          : ''),
    })
  } else {
    blocos.push({ tipo: 'paragrafo', texto: 'O sistema de iluminação de emergência utilizado no projeto ainda não foi definido pelo responsável técnico.' })
  }

  if (equipamentosUsados.length > 0) {
    blocos.push({ tipo: 'titulo2', texto: 'Características dos equipamentos' })
    blocos.push({
      tipo: 'tabela',
      colunas: ['Equipamento', ...CAMPOS_EQUIPAMENTO.map(c => c.unidade ? `${c.label} (${c.unidade})` : c.label)],
      linhas: equipamentosUsados.map(eq => [
        eq.label,
        ...CAMPOS_EQUIPAMENTO.map(c => equipamentosSpec[eq.key]?.[c.key] || '—'),
      ]),
    })
  }

  const blocosPavimentos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    const itensDaEstrutura = (state.iluminacao || []).filter(i => pavs.some(p => p.id === i.pavimentoId))
    return blocosDaEstrutura(est, pavs, itensDaEstrutura, equipamentosUsados, norma)
  })

  if (blocosPavimentos.length === 0) {
    blocosPavimentos.push({ tipo: 'paragrafo', texto: 'Não há itens de iluminação de emergência cadastrados ainda — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Sistema de Iluminação de Emergência', blocos: [...blocos, ...blocosPavimentos] }
}
