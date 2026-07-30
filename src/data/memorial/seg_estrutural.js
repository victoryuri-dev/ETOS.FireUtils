// memorial/seg_estrutural.js — texto do memorial descritivo para Segurança
// Estrutural Contra Incêndio (TRRF, Anexo B da NT 01 CBMMA). Usa o MESMO calc
// puro (trrf_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de classificação/busca de TRRF, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de `paragrafos` corridos —
// os valores de TRRF por pavimento são o dado mais consultado pelo RT, e uma
// tabela é mais fácil de achar um número do que um parágrafo de texto.

import { getTRRF } from '../normas/index'
import { calcularTRRF, metodologiaDosMateriais } from '../trrf_calc'

function fmtTRRF(linha) {
  if (typeof linha.valor === 'number') return `${linha.valor} min`
  if (linha.referencia) return `Ver item ${linha.referencia} (Anexo A)`
  if (!linha.classe) return 'Pendente'
  if (linha.encontrado && linha.valor == null) return 'Não enquadrado (nota 1)'
  return '—'
}

function textoAviso(l) {
  const id = `${l.pavimento.label} (${l.pavimento.divisao || 'divisão não informada'})`
  if (!l.classe) return `${id}: classe de altura/subsolo ainda não determinada — informe a altura ou a profundidade do subsolo correspondente.`
  if (!l.encontrado) return `${id}: divisão não encontrada na tabela do Anexo B da NT 01 CBMMA — verifique o código da divisão.`
  if (l.referencia) return `${id}: TRRF não determinado diretamente pela tabela — consultar item ${l.referencia} do Anexo A da NT 01 CBMMA.`
  return `${id}: combinação não enquadrada no Anexo B — casos não enquadrados são definidos pelo SSCI do CBMMA (nota 1).`
}

function blocosDaEstrutura(state, est, tabela, classesAltura, classesSubsolo, materiaisMapa) {
  const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
  const r = calcularTRRF(pavimentos, est, tabela, classesAltura, classesSubsolo)
  const nomeEst = est.nome || 'Estrutura'
  const blocos = [{ tipo: 'titulo2', texto: nomeEst }]

  if (!r.classeAltura) {
    blocos.push({ tipo: 'paragrafo', texto: `A altura de ${nomeEst} ainda não foi informada ou está fora da faixa coberta pelo Anexo B da NT 01 CBMMA (acima de 250 m) — TRRF pendente de definição pelo responsável técnico.` })
    return blocos
  }

  blocos.push({ tipo: 'campo', label: 'Classe de altura (Anexo B, NT 01 CBMMA)', valor: `${r.classeAltura} — altura total de ${est.altura} m` })
  if (r.classeSubsolo) {
    blocos.push({ tipo: 'campo', label: 'Classe de subsolo (Anexo B, NT 01 CBMMA)', valor: `${r.classeSubsolo} — profundidade de ${est.profundidadeSubsolo} m` })
  } else if ((parseInt(est.nSubsolos) || 0) > 0) {
    blocos.push({ tipo: 'campo', label: 'Classe de subsolo', valor: 'profundidade ainda não informada — pendente' })
  }

  blocos.push({
    tipo: 'tabela',
    colunas: ['Pavimento', 'Posição', 'Divisão', 'Classe', 'TRRF exigido'],
    linhas: r.linhas.map(l => [
      l.pavimento.label,
      l.posicao === 'subsolo' ? 'Subsolo' : 'Acima do solo',
      l.pavimento.divisao || '—',
      l.classe || '—',
      fmtTRRF(l),
    ]),
  })

  const pendencias = r.pendenciasNaoRegressao.map(pend =>
    `ATENÇÃO — não regressão (item 5.12 NT 01 CBMMA): TRRF de ${pend.pavimentoInferior.label} (${pend.trrfInferior} min) é inferior ao de ${pend.pavimentoSuperior.label} (${pend.trrfSuperior} min), imediatamente acima. A elevação depende de avaliação do risco de colapso progressivo pelo responsável técnico — não foi aplicada automaticamente. Confirmar antes da assinatura.`
  )
  const avisos = r.avisos.map(textoAviso)

  if (pendencias.length > 0 || avisos.length > 0) {
    blocos.push({ tipo: 'lista', estilo: 'alerta', itens: [...pendencias, ...avisos] })
  }

  const metodologias = metodologiaDosMateriais(est.estrutura, materiaisMapa)
  if (metodologias.length > 0) {
    blocos.push({
      tipo: 'tabela',
      colunas: ['Material estrutural', 'Norma', 'Metodologia de comprovação'],
      linhas: metodologias.map(m => [m.material, m.norma, m.metodologia]),
    })
  } else {
    blocos.push({ tipo: 'paragrafo', texto: `Material estrutural de ${nomeEst} ainda não informado — pendente de definição.` })
  }

  if (est.obsSegEstrutural?.trim()) {
    blocos.push({ tipo: 'campo', label: 'Observações do responsável técnico', valor: est.obsSegEstrutural.trim() })
  }

  return blocos
}

export function textoMemorialSegEstrutural(state) {
  const { TABELA_TRRF, CLASSES_ALTURA, CLASSES_SUBSOLO, METODOLOGIA_POR_MATERIAL } = getTRRF(state.uf)

  const blocos = (state.estruturas || []).flatMap(est =>
    blocosDaEstrutura(state, est, TABELA_TRRF, CLASSES_ALTURA, CLASSES_SUBSOLO, METODOLOGIA_POR_MATERIAL)
  )

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há dados suficientes para a determinação do TRRF da edificação — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Segurança Estrutural Contra Incêndio', blocos }
}
