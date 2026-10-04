// memorial/controle_acabamento.js — texto do memorial descritivo para o
// Controle de Material de Acabamento e Revestimento (CMAR, NT 10 CBMMA).
// A tabela impressa reproduz exatamente o "Quadro Resumo de Controle de
// Materiais de Acabamento" (mesmas colunas/ordem: Edificação/Ambiente,
// Elemento construtivo, Classe adotada, Material, Normas de ensaio) — só
// isso, sem comparação contra classe exigida nem conclusão de
// atendimento normativo (não faz parte do quadro oficial nem do que é
// pedido aqui). Usa o MESMO cálculo puro (cmar_calc.js) que alimenta a
// tela de dimensionamento — o texto nunca duplica a lógica de resolução
// de classe.

import { getControleAcabamento, getOcupacoes } from '../normas/index'
import { divisoesDaEstrutura } from '../../utils/classificacao'
import { montarLinhas } from '../cmar_calc'

// Mesma resolução usada em descricaoDivisao (MemorialDescritivoPage.jsx) e
// ControleAcabamentoPage.jsx — OCUPACOES é indexado pela letra do grupo,
// com as divisões aninhadas em `.divisoes`.
function descricaoAmbiente(ocupacoes, divisao) {
  const desc = ocupacoes?.[divisao.charAt(0)]?.divisoes?.[divisao]
  return desc ? `${divisao} — ${desc}` : divisao
}

function fmtMaterial(item) {
  if (!item || !item.origem) return 'Não informado'
  if (item.origem === 'incombustivel') return item.materialNome
  return item.materialNome || 'Material não identificado'
}

function fmtClasse(item) {
  if (item?.origem === 'incombustivel') return 'I'
  if (item?.origem === 'ensaiado') return item.classeAdotada || 'Não informada'
  if (item?.origem === 'manual' && item.classeAdotada && item.fabricante && item.laudoNumero) return item.classeAdotada
  return 'Não informada'
}

function blocosDaEstrutura(state, est, tabela, ocupacoes) {
  const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
  const divisoes = divisoesDaEstrutura(pavimentos)
  const itens = state.acabamentos.filter(a => a.estruturaId === est.id)
  const linhas = montarLinhas(divisoes, tabela, itens)
  const nomeEst = est.nome || 'Estrutura'

  const blocos = [{ tipo: 'titulo2', texto: nomeEst }]

  if (divisoes.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Não há divisões de ocupação classificadas em ${nomeEst} — CMAR pendente de definição.` })
    return blocos
  }

  blocos.push({
    tipo: 'tabela',
    colunas: ['Edificação/Ambiente', 'Elemento construtivo', 'Classe adotada', 'Material', 'Normas de ensaio'],
    linhas: linhas.map(l => [
      descricaoAmbiente(ocupacoes, l.divisao),
      l.elementoLabel,
      fmtClasse(l.item),
      fmtMaterial(l.item),
      l.item?.normasEnsaio?.trim() || '—',
    ]),
  })

  return blocos
}

export function textoMemorialControleAcabamento(state) {
  const { TABELA_B1 } = getControleAcabamento(state.uf)
  const ocupacoes = getOcupacoes(state.uf)

  const blocos = (state.estruturas || []).flatMap(est => blocosDaEstrutura(state, est, TABELA_B1, ocupacoes))

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há dados suficientes para a análise do CMAR — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Controle de Material de Acabamento e Revestimento', blocos }
}
