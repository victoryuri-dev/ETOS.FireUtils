// memorial/controle_acabamento.js — texto do memorial descritivo para o
// Controle de Material de Acabamento e Revestimento (CMAR, NT 10 CBMMA).
// A tabela impressa reproduz o "Quadro Resumo de Controle de Materiais de
// Acabamento" (mesmas colunas/ordem: Edificação/Ambiente, Elemento
// construtivo, Classe adotada, Material, Normas de ensaio) — a conclusão
// ATENDE/NÃO ATENDE fica num campo à parte, já que não é uma coluna do
// quadro oficial. Usa o MESMO cálculo puro (cmar_calc.js) que alimenta a
// tela de dimensionamento — o texto nunca duplica a lógica de comparação
// de classes, só narra o resultado (item 22 das instruções normativas do
// CMAR).

import { getControleAcabamento, getOcupacoes } from '../normas/index'
import { divisoesDaEstrutura } from '../../utils/classificacao'
import { montarLinhas, resumoCMAR, formatarClasses } from '../cmar_calc'

const CONCLUSAO_TEXTO = {
  ATENDE:                'ATENDE — todos os materiais possuem classificação compatível com as exigências da NT 10/2021 CBMMA.',
  ATENDE_COM_PENDENCIAS: 'ATENDE COM PENDÊNCIAS DOCUMENTAIS — os materiais especificados são potencialmente compatíveis, porém faltam laudos, dados de fabricante/laudo ou seleção de material em uma ou mais linhas.',
  NAO_ATENDE:            'NÃO ATENDE — um ou mais materiais possuem classificação inferior à exigida pela NT 10/2021 CBMMA.',
  DADOS_INSUFICIENTES:   'DADOS INSUFICIENTES — não há dados normativos ou classificação de divisões suficientes para concluir a análise.',
}

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
  const resumo = resumoCMAR(linhas)
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

  const pendentesLaudo = linhas.filter(l => l.resultado === 'PENDENTE_LAUDO' || l.resultado === 'NAO_PREENCHIDO')
  if (pendentesLaudo.length > 0) {
    blocos.push({
      tipo: 'lista', estilo: 'alerta',
      itens: pendentesLaudo.map(l => {
        const ambiente = `ambiente ${l.divisao}`
        return l.item?.origem === 'manual'
          ? `${l.elementoLabel} (${ambiente}): é necessário apresentar laudo ou ficha técnica do fabricante para confirmar a classificação de reação ao fogo de "${l.item.materialNome || 'material não identificado'}" conforme a NT 10/2021 CBMMA.`
          : `${l.elementoLabel} (${ambiente}): material ainda não informado.`
      }),
    })
  }

  const naoAtende = linhas.filter(l => l.resultado === 'NAO_ATENDE')
  if (naoAtende.length > 0) {
    blocos.push({
      tipo: 'lista', estilo: 'alerta',
      itens: naoAtende.map(l =>
        `${l.elementoLabel} (ambiente ${l.divisao}): "${l.item.materialNome}" — Classe ${fmtClasse(l.item)} — não atende às classes admitidas pela norma (${formatarClasses(l.classesExigidas)}).`
      ),
    })
  }

  blocos.push({ tipo: 'campo', label: 'Conclusão', valor: CONCLUSAO_TEXTO[resumo] })

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
