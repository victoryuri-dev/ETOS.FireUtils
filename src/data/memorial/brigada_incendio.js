// memorial/brigada_incendio.js — texto do memorial descritivo para a
// Brigada de Incêndio (Anexo A / Tabela A.1). Usa o MESMO calc puro
// (brigada_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de faixa/nota, só narra o resultado.
//
// Cada estrutura entra com duas tabelas: primeiro o trecho normativo bruto
// (uma linha por divisão realmente usada, exatamente como impresso na
// Tabela A.1, com as notas do rodapé logo abaixo), depois a tabela de
// resultado calculado (mesmas colunas da tela: Pavimento, Divisão, Risco,
// População fixa, Brigadistas, Treinamento, Instalação) com o total.

import { getBrigada, getExtintores, getCNAEsDivisao } from '../normas/index'
import { riscoDoPavimentoRobusto, calcularBrigadaPavimento, linhaTabelaA1Bruta, NIVEL_LABEL } from '../brigada_calc'

const RISCO_LABEL = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }

function labelNivel(nivel) {
  if (!nivel) return '—'
  if (nivel.dinamico) return `${nivel.label} *`
  return NIVEL_LABEL[nivel.nivel] || nivel.label
}

function linhaTabela(pav, risco, linha, resultado, nivelTreinamento, nivelInstalacao) {
  const brigadistas = linha?.isento ? 'Isento' : (resultado?.brigadistas != null ? String(resultado.brigadistas) : 'A calcular *')
  return [
    pav.label,
    pav.divisao || '—',
    risco ? RISCO_LABEL[risco] : 'Não classificado',
    pav.populacaoFixa || '—',
    brigadistas,
    linha?.isento ? '—' : labelNivel(nivelTreinamento),
    linha?.isento ? '—' : labelNivel(nivelInstalacao),
  ]
}

function linhaReferencia(divisao, linha) {
  const b = linhaTabelaA1Bruta(divisao, linha)
  return [b.grupo, b.divisao, b.descricao, b.risco, ...b.celulas, b.acima10, b.nivelTreinamento, b.nivelInstalacao]
}

// Uma linha do Anexo A por divisão distinta usada na estrutura (não por
// pavimento — dois pavimentos na mesma divisão/risco citam a mesma linha
// uma única vez), na ordem em que a divisão aparece pela primeira vez.
function divisoesUsadas(linhasCalculadas) {
  const vistas = new Map()
  linhasCalculadas.forEach(({ pav, linha }) => {
    if (linha && !vistas.has(linha)) vistas.set(linha, pav.divisao)
  })
  return [...vistas.entries()].map(([linha, divisao]) => ({ divisao, linha }))
}

function blocosDaEstrutura(est, pavs, altura, cargaEst, cnaesDiv, limiaresRisco, tabela, notasTabela) {
  const linhasCalculadas = pavs.map(pav => {
    const risco = riscoDoPavimentoRobusto(pav, cargaEst, cnaesDiv, limiaresRisco)
    return { pav, risco, ...calcularBrigadaPavimento(pav.divisao, risco, pav.populacaoFixa, altura, tabela) }
  })

  const temAsterisco = linhasCalculadas.some(({ linha, resultado, nivelTreinamento, nivelInstalacao }) =>
    linha && !linha.isento && (resultado?.brigadistas == null || nivelTreinamento?.dinamico || nivelInstalacao?.dinamico))

  const blocos = [{ tipo: 'titulo2', texto: est.nome }]

  // ── Trecho normativo (Anexo A) — uma linha por divisão usada, tal como
  // impressa na Tabela A.1, com as notas do rodapé logo abaixo.
  const usadas = divisoesUsadas(linhasCalculadas)
  if (usadas.length > 0) {
    blocos.push({
      tipo: 'tabela',
      colunas: ['Grupo', 'Divisão', 'Descrição', 'Grau de risco', 'Até 2', 'Até 4', 'Até 6', 'Até 8', 'Até 10', 'Acima de 10', 'Nível do treinamento (Anexo B)', 'Nível da instalação (Tabela A.2)'],
      linhas: usadas.map(({ divisao, linha }) => linhaReferencia(divisao, linha)),
    })

    const notasDaTabela = [...new Set(usadas.flatMap(({ linha }) => linha.notas || []))].sort((a, b) => a - b)
    if (notasDaTabela.length > 0) {
      blocos.push({ tipo: 'lista', itens: notasDaTabela.map(n => `Nota ${n}: ${notasTabela[n]}`) })
    }
  }

  // ── Resultado calculado — uma linha por pavimento, com o total.
  blocos.push({
    tipo: 'tabela',
    colunas: ['Pavimento', 'Divisão', 'Risco', 'Pop. fixa', 'Brigadistas', 'Treinamento', 'Instalação'],
    linhas: linhasCalculadas.map(({ pav, risco, linha, resultado, nivelTreinamento, nivelInstalacao }) =>
      linhaTabela(pav, risco, linha, resultado, nivelTreinamento, nivelInstalacao)),
  })

  const totalBrigadistas = linhasCalculadas.reduce((s, l) => s + (l.resultado?.brigadistas || 0), 0)
  const totalNumerico = linhasCalculadas.some(l => l.resultado?.brigadistas != null)
  if (totalNumerico) {
    blocos.push({ tipo: 'campo', label: 'Total de brigadistas exigidos na estrutura', valor: String(totalBrigadistas) })
  }

  // Observações sem número de nota (não cabem no rodapé da tabela de
  // referência acima) — ex.: "informe a população fixa para calcular".
  const observacoesLivres = new Set()
  linhasCalculadas.forEach(({ resultado, nivelTreinamento, nivelInstalacao }) => {
    if (resultado?.detalhe) observacoesLivres.add(resultado.detalhe)
    if (nivelTreinamento?.detalhe) observacoesLivres.add(nivelTreinamento.detalhe)
    if (nivelInstalacao?.detalhe) observacoesLivres.add(nivelInstalacao.detalhe)
  })
  if (observacoesLivres.size > 0) blocos.push({ tipo: 'lista', itens: [...observacoesLivres] })

  const semDivisao = linhasCalculadas.filter(l => !l.linha)
  if (semDivisao.length > 0) {
    blocos.push({
      tipo: 'lista', estilo: 'alerta',
      itens: semDivisao.map(({ pav }) => pav.divisao
        ? `${pav.label}: divisão ${pav.divisao} não cadastrada na Tabela A.1 — dimensionamento pendente de verificação direta com o CBM competente.`
        : `${pav.label}: divisão de ocupação ainda não classificada.`),
    })
  }

  return { blocos, temAsterisco }
}

export function textoMemorialBrigadaIncendio(state) {
  const brigNorma = getBrigada(state.uf)
  const extNorma  = getExtintores(state.uf)
  const { NORMA_BRIGADA, TABELA_A1, NOTAS_TABELA_A1, NOTAS_GERAIS } = brigNorma
  const cnaesDiv = divisao => getCNAEsDivisao(state.uf, divisao)

  const introducao = [{
    tipo: 'paragrafo',
    texto: `O dimensionamento da brigada de incêndio orgânica segue o Anexo A (Tabela A.1) da ${NORMA_BRIGADA.nome}, considerando a divisão de ocupação, o grau de risco e a população fixa de cada pavimento. ${NOTAS_GERAIS.a}`,
  }]

  let temAsterisco = false
  const blocos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    const r = blocosDaEstrutura(est, pavs, est.altura, state.cargaState[est.id] || {}, cnaesDiv, extNorma.LIMIARES_RISCO, TABELA_A1, NOTAS_TABELA_A1)
    if (r.temAsterisco) temAsterisco = true
    return r.blocos
  })

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há estruturas ou pavimentos cadastrados ainda — pendente de definição pelo responsável técnico.' })
  } else if (temAsterisco) {
    blocos.push({ tipo: 'paragrafo', texto: '* Nível de treinamento/instalação ou número de brigadistas dependente de confirmação adicional — ver observações acima e as Notas da Tabela A.1.' })
  }

  return { titulo: 'Brigada de Incêndio', blocos: [...introducao, ...blocos] }
}
