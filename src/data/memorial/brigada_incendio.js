// memorial/brigada_incendio.js — texto do memorial descritivo para a
// Brigada de Incêndio (Anexo A / Tabela A.1). Usa o MESMO calc puro
// (brigada_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de faixa/nota, só narra o resultado.

import { getBrigada, getExtintores } from '../normas/index'
import { riscoDoPavimento } from '../extintores_calc'
import { calcularBrigadaPavimento } from '../brigada_calc'

const RISCO_LABEL = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }

function blocosDoPavimento(pav, altura, cargaState, limiaresRisco, tabela) {
  const risco = riscoDoPavimento(pav, cargaState, limiaresRisco)
  const blocos = [{ tipo: 'titulo2', texto: pav.label }]

  blocos.push({ tipo: 'campo', label: 'Divisão de ocupação', valor: pav.divisao || '—' })
  blocos.push({ tipo: 'campo', label: 'Grau de risco', valor: risco ? RISCO_LABEL[risco] : 'Não classificado' })
  blocos.push({ tipo: 'campo', label: 'População fixa', valor: pav.populacaoFixa ? `${pav.populacaoFixa} pessoas` : 'Não informada' })

  const { linha, resultado, nivelTreinamento, nivelInstalacao } = calcularBrigadaPavimento(
    pav.divisao, risco, pav.populacaoFixa, altura, tabela
  )

  if (!linha) {
    blocos.push({ tipo: 'paragrafo', texto: `A divisão ${pav.divisao || '(não classificada)'} não possui linha cadastrada na Tabela A.1 desta norma — dimensionamento pendente de verificação direta com o CBM competente.` })
    return blocos
  }

  if (linha.isento) {
    blocos.push({ tipo: 'paragrafo', texto: `${pav.label}, Divisão ${pav.divisao}, é isento de brigada de incêndio conforme o Anexo A.` })
    return blocos
  }

  blocos.push({
    tipo: 'campo', label: 'Brigadistas exigidos',
    valor: resultado.brigadistas != null ? String(resultado.brigadistas) : 'A calcular',
  })
  if (nivelTreinamento?.label) blocos.push({ tipo: 'campo', label: 'Nível de treinamento', valor: nivelTreinamento.label })
  if (nivelInstalacao?.label) blocos.push({ tipo: 'campo', label: 'Nível de instalação', valor: nivelInstalacao.label })

  const notas = []
  if (resultado.detalhe) notas.push(resultado.detalhe)
  if (nivelTreinamento?.detalhe) notas.push(nivelTreinamento.detalhe)
  if (nivelTreinamento?.podeReduzirParaBasico) notas.push('Nota 4: edificação com altura ≤ 12 m — o treinamento pode ser reduzido para o nível básico.')
  if (notas.length > 0) blocos.push({ tipo: 'lista', estilo: 'info', itens: notas })

  return blocos
}

export function textoMemorialBrigadaIncendio(state) {
  const brigNorma = getBrigada(state.uf)
  const extNorma  = getExtintores(state.uf)
  const { NORMA_BRIGADA, TABELA_A1, NOTAS_GERAIS } = brigNorma

  const introducao = [{
    tipo: 'paragrafo',
    texto: `O dimensionamento da brigada de incêndio orgânica segue o Anexo A (Tabela A.1) da ${NORMA_BRIGADA.nome}, considerando a divisão de ocupação, o grau de risco e a população fixa de cada pavimento. ${NOTAS_GERAIS.a}`,
  }]

  const blocos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    return [
      { tipo: 'titulo2', texto: est.nome },
      ...pavs.flatMap(pav => blocosDoPavimento(pav, est.altura, state.cargaState[est.id] || {}, extNorma.LIMIARES_RISCO, TABELA_A1)),
    ]
  })

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há estruturas ou pavimentos cadastrados ainda — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Brigada de Incêndio', blocos: [...introducao, ...blocos] }
}
