// memorial/seg_estrutural.js — texto do memorial descritivo para Segurança
// Estrutural Contra Incêndio (TRRF, Anexo B da norma do estado). Usa o MESMO calc
// puro (trrf_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de classificação/busca de TRRF, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de `paragrafos` corridos —
// os valores de TRRF por pavimento são o dado mais consultado pelo RT, e uma
// tabela é mais fácil de achar um número do que um parágrafo de texto.

import { getTRRF } from '../normas/index'
import { calcularTRRF, alturaEdificacaoBase, edificacaoEhTerrea, refsNormaTRRF } from '../trrf_calc'
import { fmtNum } from '../../utils/numero'

function fmtTRRF(linha) {
  if (typeof linha.valor === 'number') return `${linha.valor} min`
  if (linha.referencia) return `Ver item ${linha.referencia} (Anexo A)`
  if (!linha.classe) return 'Pendente'
  if (linha.encontrado && linha.valor == null) return 'Não enquadrado (nota 1)'
  return '—'
}

function textoAviso(l, refs) {
  const id = `${l.pavimento.label} (${l.pavimento.divisao || 'divisão não informada'})`
  if (!l.classe) return `${id}: classe de altura/subsolo ainda não determinada — informe a altura ou a profundidade do subsolo correspondente.`
  if (!l.encontrado) return `${id}: divisão não encontrada na tabela do Anexo B da ${refs.sigla} — verifique o código da divisão.`
  if (l.referencia) return `${id}: TRRF não determinado diretamente pela tabela — consultar item ${l.referencia} do Anexo A da ${refs.sigla}.`
  return `${id}: combinação não enquadrada no Anexo B — casos não enquadrados são definidos pelo ${refs.orgaoAnalise} (nota 1).`
}

function blocosDaEstrutura(state, est, tabela, classesAltura, classesSubsolo, divisoesSemOcupacao, refs) {
  const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
  const r = calcularTRRF(pavimentos, est, tabela, classesAltura, classesSubsolo, divisoesSemOcupacao)
  const nomeEst = est.nome || 'Estrutura'
  const blocos = [{ tipo: 'titulo2', texto: nomeEst }]

  if (!r.classeAltura) {
    blocos.push({ tipo: 'paragrafo', texto: `A altura de ${nomeEst} ainda não foi informada ou está fora da faixa coberta pelo Anexo B da ${refs.sigla} (acima de 250 m) — TRRF pendente de definição pelo responsável técnico.` })
    return blocos
  }

  const alturaBase = alturaEdificacaoBase(est)
  const alturaTxt = `${fmtNum(alturaBase, 2, alturaBase)} m${edificacaoEhTerrea(est) ? ' (Edificação Térrea)' : ''}`
  const valorAltura = r.subsoloSomado
    ? `${r.classeAltura} — altura de ${alturaTxt} + ${fmtNum(est.profundidadeSubsolo, 2, est.profundidadeSubsolo)} m de subsolo ocupado = ${fmtNum(r.alturaEfetiva, 2, r.alturaEfetiva)} m${refs.terminologia ? refs.terminologia.replace(/\)$/, ' — subsolo com ocupação diferente de estacionamento)') : ' (subsolo com ocupação diferente de estacionamento)'}`
    : `${r.classeAltura} — altura de ${alturaTxt}, do piso de descarga ao último pavimento habitado${refs.terminologia}`
  blocos.push({ tipo: 'campo', label: `Classe de altura (Anexo B, ${refs.sigla})`, valor: valorAltura })
  if (r.classeSubsolo) {
    blocos.push({ tipo: 'campo', label: `Classe de subsolo (Anexo B, ${refs.sigla})`, valor: `${r.classeSubsolo} — profundidade de ${fmtNum(est.profundidadeSubsolo, 2, est.profundidadeSubsolo)} m` })
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
    `ATENÇÃO — não regressão (${refs.naoRegressao}): TRRF de ${pend.pavimentoInferior.label} (${pend.trrfInferior} min) é inferior ao de ${pend.pavimentoSuperior.label} (${pend.trrfSuperior} min), imediatamente acima. A elevação depende de avaliação do risco de colapso progressivo pelo responsável técnico — não foi aplicada automaticamente. Confirmar antes da assinatura.`
  )
  const avisos = r.avisos.map(l => textoAviso(l, refs))

  if (pendencias.length > 0 || avisos.length > 0) {
    blocos.push({ tipo: 'lista', estilo: 'alerta', itens: [...pendencias, ...avisos] })
  }

  if (est.obsSegEstrutural?.trim()) {
    blocos.push({ tipo: 'campo', label: 'Observações complementares', valor: est.obsSegEstrutural.trim() })
  }

  return blocos
}

export function textoMemorialSegEstrutural(state) {
  const norma = getTRRF(state.uf)
  const { TABELA_TRRF, CLASSES_ALTURA, CLASSES_SUBSOLO, DIVISOES_SEM_OCUPACAO_SUBSOLO } = norma
  const refs = refsNormaTRRF(norma)

  const blocos = (state.estruturas || []).flatMap(est =>
    blocosDaEstrutura(state, est, TABELA_TRRF, CLASSES_ALTURA, CLASSES_SUBSOLO, DIVISOES_SEM_OCUPACAO_SUBSOLO, refs)
  )

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há dados suficientes para a determinação do TRRF da edificação — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Segurança Estrutural Contra Incêndio', blocos }
}
