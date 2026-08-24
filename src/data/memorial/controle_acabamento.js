// memorial/controle_acabamento.js — texto do memorial descritivo para o
// Controle de Material de Acabamento e Revestimento (CMAR, NT 10 CBMMA).
// Usa o MESMO cálculo puro (cmar_calc.js) que alimenta a tela de
// dimensionamento — o texto nunca duplica a lógica de comparação de
// classes, só narra o resultado (item 22 das instruções normativas do
// CMAR: a resposta deve terminar numa tabela comparativa e numa conclusão
// objetiva).

import { getControleAcabamento } from '../normas/index'
import { divisoesDaEstrutura } from '../../utils/classificacao'
import { montarLinhas, resumoCMAR } from '../cmar_calc'

const CONCLUSAO_TEXTO = {
  ATENDE:                'ATENDE — todos os materiais possuem classificação compatível com as exigências da NT 10/2021 CBMMA.',
  ATENDE_COM_PENDENCIAS: 'ATENDE COM PENDÊNCIAS DOCUMENTAIS — os materiais especificados são potencialmente compatíveis, porém faltam laudos, dados de fabricante/laudo ou seleção de material em uma ou mais linhas.',
  NAO_ATENDE:            'NÃO ATENDE — um ou mais materiais possuem classificação inferior à exigida pela NT 10/2021 CBMMA.',
  DADOS_INSUFICIENTES:   'DADOS INSUFICIENTES — não há dados normativos ou classificação de divisões suficientes para concluir a análise.',
}

function fmtMaterial(item) {
  if (!item || !item.origem) return 'Não informado'
  if (item.origem === 'incombustivel') return item.materialNome
  return item.materialNome || 'Material não identificado'
}

function fmtClasse(item) {
  if (item?.origem === 'incombustivel') return 'I'
  if (item?.origem === 'manual' && item.classeInformada && item.fabricante && item.laudoNumero) return item.classeInformada
  return 'Não informada'
}

function blocosDaEstrutura(state, est, tabela, rotasFuga) {
  const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
  const divisoes = divisoesDaEstrutura(pavimentos)
  const itens = state.acabamentos.filter(a => a.estruturaId === est.id)
  const linhas = montarLinhas(divisoes, tabela, rotasFuga, itens)
  const resumo = resumoCMAR(linhas)
  const nomeEst = est.nome || 'Estrutura'

  const blocos = [{ tipo: 'titulo2', texto: nomeEst }]

  if (divisoes.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Não há divisões de ocupação classificadas em ${nomeEst} — CMAR pendente de definição.` })
    return blocos
  }

  blocos.push({
    tipo: 'tabela',
    colunas: ['Ambiente', 'Elemento', 'Material', 'Classe exigida', 'Classe do material', 'Resultado'],
    linhas: linhas.map(l => [
      l.escopo === 'rotaFuga' ? 'Rota de fuga' : l.divisao,
      l.elementoLabel,
      fmtMaterial(l.item),
      l.classeExigida || 'Pendente de norma',
      fmtClasse(l.item),
      l.resultado === 'ATENDE' ? 'ATENDE' : l.resultado === 'NAO_ATENDE' ? 'NÃO ATENDE' : 'PENDENTE',
    ]),
  })

  const pendentesLaudo = linhas.filter(l => l.resultado === 'PENDENTE_LAUDO' || l.resultado === 'NAO_PREENCHIDO')
  if (pendentesLaudo.length > 0) {
    blocos.push({
      tipo: 'lista', estilo: 'alerta',
      itens: pendentesLaudo.map(l => {
        const ambiente = l.escopo === 'rotaFuga' ? 'rota de fuga' : `ambiente ${l.divisao}`
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
      itens: naoAtende.map(l => {
        const ambiente = l.escopo === 'rotaFuga' ? 'rota de fuga' : `ambiente ${l.divisao}`
        return `${l.elementoLabel} (${ambiente}): "${l.item.materialNome}" — Classe ${fmtClasse(l.item)} — não atende à classe máxima admitida (${l.classeExigida}).`
      }),
    })
  }

  blocos.push({ tipo: 'campo', label: 'Conclusão', valor: CONCLUSAO_TEXTO[resumo] })

  return blocos
}

export function textoMemorialControleAcabamento(state) {
  const { TABELA_B1, ROTAS_FUGA } = getControleAcabamento(state.uf)

  const blocos = (state.estruturas || []).flatMap(est => blocosDaEstrutura(state, est, TABELA_B1, ROTAS_FUGA))

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há dados suficientes para a análise do CMAR — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Controle de Material de Acabamento e Revestimento', blocos }
}
