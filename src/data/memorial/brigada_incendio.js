// memorial/brigada_incendio.js — texto do memorial descritivo para a
// Brigada de Incêndio (Anexo A / Tabela A.1). Usa o MESMO calc puro
// (brigada_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de faixa/nota, só narra o resultado.
//
// Cada estrutura entra com três tabelas: o trecho normativo bruto (uma linha
// por divisão realmente usada, só com as colunas da Tabela A.1 que se
// aplicam, com as notas do rodapé logo abaixo), o resultado calculado por
// pavimento (com as parcelas até 10 / acima de 10 / total quando houver
// acréscimo da Nota 5) com o total, e os níveis de treinamento/instalação.

import { getBrigada, getExtintores, getCNAEsDivisao } from '../normas/index'
import { opcoesPublicoBrigada } from '../../utils/brigadaPublico'
import { riscoDoPavimentoRobusto, calcularBrigadaPavimento, linhaTabelaA1Bruta, NIVEL_LABEL, COLUNAS_FAIXA } from '../brigada_calc'
import { blocoObservacao } from '../../utils/observacoes'

const RISCO_LABEL = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }

function labelNivel(nivel) {
  if (!nivel) return '—'
  if (nivel.dinamico) return `${nivel.label} *`
  return NIVEL_LABEL[nivel.nivel] || nivel.label
}

const brigadistasTexto = (linha, resultado) =>
  linha?.isento ? 'Isento' : (resultado?.brigadistas != null ? String(resultado.brigadistas) : 'A calcular *')

// Colunas do trecho normativo que se aplicam à estrutura: só as faixas
// "Até N" realmente usadas pelos pavimentos, "Acima de 10" quando algum
// pavimento passou de 10 pessoas, e "Regra" para as linhas sem faixa
// numérica (isento, % da população, item próprio etc.). Sem nenhuma
// população informada ainda, cai nas cinco faixas da tabela.
function colunasAplicaveis(linhasCalculadas) {
  const faixas = new Set()
  let acima10 = false, regra = false
  linhasCalculadas.forEach(({ linha, resultado }) => {
    if (!linha) return
    const p = resultado?.parcelas
    if (p) {
      faixas.add(p.coluna)
      if (p.acrescimo > 0) acima10 = true
    } else if (linha.isento || !linha.faixas || resultado?.brigadistas != null) {
      regra = true
    }
  })
  const temFaixa = linhasCalculadas.some(({ linha }) => linha?.faixas && !linha.isento)
  if (faixas.size === 0 && !acima10 && temFaixa) COLUNAS_FAIXA.forEach((_, i) => faixas.add(i))
  return { faixas: [...faixas].sort((a, b) => a - b), acima10, regra }
}

function linhaReferencia(divisao, linha, resultados, cols) {
  const b = linhaTabelaA1Bruta(divisao, linha)
  const celulas = cols.faixas.map(i => (linha.faixas && !linha.isento ? b.celulas[i] : '—'))
  if (cols.acima10) celulas.push(linha.faixas && !linha.isento ? b.acima10 : '—')
  if (cols.regra) {
    const regra = linha.isento ? 'Isento'
      : !linha.faixas ? b.celulas[0]
      : resultados.find(r => !r?.parcelas && r?.faixaUsada)?.faixaUsada || '—'
    celulas.push(regra)
  }
  return [b.divisao, b.risco, ...celulas]
}

// Uma linha do Anexo A por divisão distinta usada na estrutura (não por
// pavimento — dois pavimentos na mesma divisão/risco citam a mesma linha
// uma única vez), na ordem em que a divisão aparece pela primeira vez.
function divisoesUsadas(linhasCalculadas) {
  const vistas = new Map()
  linhasCalculadas.forEach(({ pav, linha, resultado }) => {
    if (!linha) return
    if (!vistas.has(linha)) vistas.set(linha, { divisao: pav.divisao, resultados: [] })
    vistas.get(linha).resultados.push(resultado)
  })
  return [...vistas.entries()].map(([linha, v]) => ({ linha, ...v }))
}

// Resultado por pavimento: com algum pavimento acima de 10 pessoas, mostra
// as parcelas do cálculo — valor da Tabela A.1 até 10 pessoas, acréscimo da
// Nota 5 e o total; senão, só a coluna de brigadistas.
function tabelaResultado(linhasCalculadas) {
  const comAcrescimo = linhasCalculadas.some(l => l.resultado?.parcelas?.acrescimo > 0)
  const inicio = ({ pav, risco }) => [pav.label, pav.divisao || '—', risco ? RISCO_LABEL[risco] : 'Não classificado', pav.populacaoFixa || '—']
  if (!comAcrescimo) {
    return {
      tipo: 'tabela',
      colunas: ['Pavimento', 'Divisão', 'Risco', 'Pop. fixa', 'Brigadistas'],
      linhas: linhasCalculadas.map(l => [...inicio(l), brigadistasTexto(l.linha, l.resultado)]),
    }
  }
  return {
    tipo: 'tabela',
    colunas: ['Pavimento', 'Divisão', 'Risco', 'Pop. fixa', 'Até 10', 'Acima de 10 (Nota 5)', 'Total'],
    linhas: linhasCalculadas.map(l => {
      const p = l.resultado?.parcelas
      if (!p) return [...inicio(l), '—', '—', brigadistasTexto(l.linha, l.resultado)]
      const acima = p.acrescimo > 0 ? `${p.acrescimo} (⌈(${p.populacao} − 10) / ${p.grupo}⌉)` : '—'
      return [...inicio(l), String(p.base), acima, String(l.resultado.brigadistas)]
    }),
  }
}

function blocosDaEstrutura(est, pavs, altura, area, cargaEst, cnaesDiv, limiaresRisco, tabela, notasTabela, exigido, uf) {
  const blocos = [{ tipo: 'titulo2', texto: est.nome }]

  // Não exigida pra esta estrutura (NT 01 CBMMA, por ocupação/altura) — só a
  // nota explicando o motivo, sem a tabela normativa nem a de resultado
  // (não há nada pra calcular quando a medida nem é obrigatória aqui).
  if (!exigido) {
    blocos.push({ tipo: 'paragrafo', texto: 'Brigada de incêndio não exigida para a ocupação/altura atual desta estrutura, conforme NT 01 CBMMA.' })
    return { blocos, temAsterisco: false }
  }

  const opcoes = opcoesPublicoBrigada(uf, pavs)
  const linhasCalculadas = pavs.map(pav => {
    const risco = riscoDoPavimentoRobusto(pav, cargaEst, cnaesDiv, limiaresRisco)
    return { pav, risco, ...calcularBrigadaPavimento(pav.divisao, risco, pav.populacaoFixa, altura, tabela, area, opcoes) }
  })

  const temAsterisco = linhasCalculadas.some(({ linha, resultado, nivelTreinamento, nivelInstalacao }) =>
    linha && !linha.isento && (resultado?.brigadistas == null || nivelTreinamento?.dinamico || nivelInstalacao?.dinamico))

  // ── Trecho normativo (Anexo A) — uma linha por divisão usada, tal como
  // impressa na Tabela A.1 (só as colunas que se aplicam), com as notas do
  // rodapé logo abaixo.
  const usadas = divisoesUsadas(linhasCalculadas)
  if (usadas.length > 0) {
    const cols = colunasAplicaveis(linhasCalculadas)
    blocos.push({
      tipo: 'tabela',
      colunas: ['Divisão', 'Grau de risco', ...cols.faixas.map(i => COLUNAS_FAIXA[i]), ...(cols.acima10 ? ['Acima de 10'] : []), ...(cols.regra ? ['Regra'] : [])],
      linhas: usadas.map(({ divisao, linha, resultados }) => linhaReferencia(divisao, linha, resultados, cols)),
    })

    const notasDaTabela = [...new Set(usadas.flatMap(({ linha }) => linha.notas || []))].sort((a, b) => a - b)
    if (notasDaTabela.length > 0) {
      blocos.push({ tipo: 'lista', itens: notasDaTabela.map(n => `Nota ${n}: ${notasTabela[n]}`) })
    }
  }

  // ── Resultado calculado — uma linha por pavimento, com o total.
  blocos.push(tabelaResultado(linhasCalculadas))

  const totalBrigadistas = linhasCalculadas.reduce((s, l) => s + (l.resultado?.brigadistas || 0), 0)
  const totalNumerico = linhasCalculadas.some(l => l.resultado?.brigadistas != null)
  if (totalNumerico) {
    blocos.push({ tipo: 'campo', label: 'Total de brigadistas exigidos na estrutura', valor: String(totalBrigadistas) })
  }

  // ── Níveis de treinamento (Anexo B) e de instalação (Tabela A.2) — tabela
  // própria, por pavimento (os pavimentos isentos ficam de fora).
  const comNivel = linhasCalculadas.filter(l => l.linha && !l.linha.isento)
  if (comNivel.length > 0) {
    blocos.push({
      tipo: 'tabela',
      colunas: ['Pavimento', 'Divisão', 'Nível do treinamento (Anexo B)', 'Nível da instalação (Tabela A.2)'],
      linhas: comNivel.map(({ pav, nivelTreinamento, nivelInstalacao }) => [pav.label, pav.divisao || '—', labelNivel(nivelTreinamento), labelNivel(nivelInstalacao)]),
    })
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

/** `opcoes.soDimensionamento`: sem o parágrafo introdutório (campo
 *  DIMENSIONAMENTO do formulário da PB). */
export function textoMemorialBrigadaIncendio(state, sistemas, porEstrutura, opcoes = {}) {
  const brigNorma = getBrigada(state.uf)
  const extNorma  = getExtintores(state.uf)
  const { NORMA, TABELA_A1, NOTAS_TABELA_A1, NOTAS_GERAIS } = brigNorma
  const cnaesDiv = divisao => getCNAEsDivisao(state.uf, divisao)

  const introducao = opcoes.soDimensionamento ? [] : [{
    tipo: 'paragrafo',
    texto: `O dimensionamento da brigada de incêndio orgânica segue o Anexo A (Tabela A.1) da ${NORMA.nome}, considerando a divisão de ocupação, o grau de risco e a população fixa de cada pavimento. ${NOTAS_GERAIS.a}`,
  }]

  let temAsterisco = false
  const blocos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    // Obrigatoriedade por estrutura (useMedidasObrigatorias) — mesmo padrão
    // de compartimentacao.js: cai para o agregado do projeto só se
    // `porEstrutura` não foi repassado.
    const pe = porEstrutura?.find(p => p.estrutura.id === est.id)
    const exigido = pe ? !!pe.sistemas?.brigada?.ativo : !!sistemas?.brigada?.ativo
    const r = blocosDaEstrutura(est, pavs, est.altura, est.areaTotal, state.cargaState[est.id] || {}, cnaesDiv, extNorma.LIMIARES_RISCO, TABELA_A1, NOTAS_TABELA_A1, exigido, state.uf)
    if (r.temAsterisco) temAsterisco = true
    return [...r.blocos, ...blocoObservacao(est, 'brigada')]
  })

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há estruturas ou pavimentos cadastrados ainda — pendente de definição pelo responsável técnico.' })
  } else if (temAsterisco) {
    blocos.push({ tipo: 'paragrafo', texto: '* Nível de treinamento/instalação ou número de brigadistas dependente de confirmação adicional — ver observações acima e as Notas da Tabela A.1.' })
  }

  return { titulo: 'Brigada de Incêndio', blocos: [...introducao, ...blocos] }
}
