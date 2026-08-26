// memorial/brigada_incendio.js — texto do memorial descritivo para a
// Brigada de Incêndio (Anexo A / Tabela A.1). Usa o MESMO calc puro
// (brigada_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de faixa/nota, só narra o resultado. Uma tabela por
// estrutura (mesmas colunas da tela: Pavimento, Divisão, Risco, População
// fixa, Brigadistas, Treinamento, Instalação), com uma linha de total.

import { getBrigada, getExtintores } from '../normas/index'
import { riscoDoPavimento } from '../extintores_calc'
import { calcularBrigadaPavimento, NIVEL_LABEL } from '../brigada_calc'

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

function blocosDaEstrutura(est, pavs, altura, cargaState, limiaresRisco, tabela) {
  const linhasCalculadas = pavs.map(pav => {
    const risco = riscoDoPavimento(pav, cargaState, limiaresRisco)
    return { pav, risco, ...calcularBrigadaPavimento(pav.divisao, risco, pav.populacaoFixa, altura, tabela) }
  })

  const temAsterisco = linhasCalculadas.some(({ linha, resultado, nivelTreinamento, nivelInstalacao }) =>
    linha && !linha.isento && (resultado?.brigadistas == null || nivelTreinamento?.dinamico || nivelInstalacao?.dinamico))

  const blocos = [{ tipo: 'titulo2', texto: est.nome }]

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

  const observacoes = new Set()
  linhasCalculadas.forEach(({ linha, resultado, nivelTreinamento }) => {
    if (!linha) return
    if (resultado?.detalhe) observacoes.add(resultado.detalhe)
    if (nivelTreinamento?.detalhe) observacoes.add(nivelTreinamento.detalhe)
    if (nivelTreinamento?.podeReduzirParaBasico) observacoes.add('Nota 4: edificação com altura ≤ 12 m — o treinamento pode ser reduzido para o nível básico.')
  })
  if (observacoes.size > 0) blocos.push({ tipo: 'lista', itens: [...observacoes] })

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
  const { NORMA_BRIGADA, TABELA_A1, NOTAS_GERAIS } = brigNorma

  const introducao = [{
    tipo: 'paragrafo',
    texto: `O dimensionamento da brigada de incêndio orgânica segue o Anexo A (Tabela A.1) da ${NORMA_BRIGADA.nome}, considerando a divisão de ocupação, o grau de risco e a população fixa de cada pavimento. ${NOTAS_GERAIS.a}`,
  }]

  let temAsterisco = false
  const blocos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    const r = blocosDaEstrutura(est, pavs, est.altura, state.cargaState[est.id] || {}, extNorma.LIMIARES_RISCO, TABELA_A1)
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
