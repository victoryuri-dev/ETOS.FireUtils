// memorial/controle_acabamento.js — texto do memorial descritivo para o
// Controle de Material de Acabamento e Revestimento (CMAR, NT 10 CBMMA).
// A tabela impressa reproduz exatamente o "Quadro Resumo de Controle de
// Materiais de Acabamento" (mesmas colunas/ordem: Edificação/Ambiente,
// Elemento construtivo, Classe adotada, Material, Normas de ensaio) — só
// isso, sem comparação contra classe exigida nem conclusão de atendimento
// normativo. A coluna Edificação/Ambiente é mesclada verticalmente (célula
// `{ texto, rowSpan }` + `null` nas linhas cobertas — mesmo mecanismo
// genérico de MemorialDescritivoPage.jsx usado na tabela de distâncias
// máximas de saida_emergencia.js), já que as 5 linhas de elemento de um
// mesmo ambiente repetem o mesmo nome. Usa o MESMO cálculo puro
// (cmar_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de resolução de classe.
//
// Estrutura cuja norma não exige CMAR (useMedidasObrigatorias, por
// estrutura) nem entra no documento — nenhum título, nenhuma tabela vazia
// com "Não informado". Diferente de outras medidas (ex.: compartimentacao.js),
// que ainda citam a estrutura com um parágrafo de dispensa: aqui o pedido
// explícito foi não citar a edificação de jeito nenhum quando o CMAR não é
// exigido para ela.

import { montarLinhas } from '../cmar_calc'

function fmtMaterial(item) {
  if (item?.origem === 'nao_possui') return 'N/A'
  if (!item || !item.origem) return 'Não informado'
  if (item.origem === 'incombustivel') return item.materialNome
  return item.materialNome || 'Material não identificado'
}

function fmtClasse(item) {
  if (item?.origem === 'nao_possui') return 'N/A'
  if (item?.origem === 'incombustivel') return 'I'
  if (item?.origem === 'ensaiado') return item.classeAdotada || 'Não informada'
  if (item?.origem === 'manual' && item.classeAdotada && item.fabricante && item.laudoNumero) return item.classeAdotada
  return 'Não informada'
}

function fmtNormasEnsaio(item) {
  if (item?.origem === 'nao_possui') return 'N/A'
  return item?.normasEnsaio?.trim() || '—'
}

function blocosDaEstrutura(state, est) {
  const ambientes = state.acabamentoAmbientes.filter(a => a.estruturaId === est.id)
  const itens = state.acabamentos.filter(a => a.estruturaId === est.id)
  const nomeEst = est.nome || 'Estrutura'

  const blocos = [{ tipo: 'titulo2', texto: nomeEst }]

  if (ambientes.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Não há ambientes cadastrados em ${nomeEst} — CMAR pendente de definição.` })
    return blocos
  }

  const linhas = ambientes.flatMap(ambiente => {
    const linhasAmbiente = montarLinhas(ambiente, itens)
    const nomeAmbiente = ambiente.nome?.trim() || 'Ambiente sem nome'
    return linhasAmbiente.map((l, i) => [
      // Mescla as 5 linhas do ambiente numa só célula — `null` nas linhas
      // seguintes é "já coberta pelo rowSpan acima" (ver case 'tabela' em
      // MemorialDescritivoPage.jsx), não "sem dado".
      i === 0 ? { texto: nomeAmbiente, rowSpan: linhasAmbiente.length } : null,
      l.elementoLabel,
      fmtClasse(l.item),
      fmtMaterial(l.item),
      fmtNormasEnsaio(l.item),
    ])
  })

  blocos.push({
    tipo: 'tabela',
    colunas: ['Edificação/Ambiente', 'Elemento construtivo', 'Classe adotada', 'Material', 'Normas de ensaio'],
    linhas,
  })

  return blocos
}

export function textoMemorialControleAcabamento(state, sistemas, porEstrutura) {
  const exigidaEm = est => {
    const pe = porEstrutura?.find(p => p.estrutura.id === est.id)
    return pe ? !!pe.sistemas?.controle_acabamento?.ativo : !!sistemas?.controle_acabamento?.ativo
  }

  const blocos = (state.estruturas || [])
    .filter(exigidaEm)
    .flatMap(est => blocosDaEstrutura(state, est))

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há dados suficientes para a análise do CMAR — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Controle de Material de Acabamento e Revestimento', blocos }
}
