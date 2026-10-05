// ─────────────────────────────────────────────────────────────────────────────
// cmar_calc.js — Funções universais do Controle de Material de Acabamento e
// Revestimento (CMAR, NT 10 CBMMA). Não importam nenhum arquivo de estado
// diretamente. As mesmas funções alimentam a tela de dimensionamento e o
// "Quadro Resumo de Controle de Materiais de Acabamento" do memorial —
// nunca duas fontes de verdade.
//
// Uma classe de material nunca é presumida (item 6 das instruções
// normativas do CMAR): só existe classe resolvida quando o material é
// comprovadamente incombustível (catálogo, ver materiaisAcabamento.js),
// vem do catálogo de materiais já ensaiados, ou o usuário informou os
// dados de laudo/fabricante do material cadastrado manualmente.
//
// classesAdmitidasDivisao/resultadoLinha/resumoCMAR (comparação contra a
// Tabela B.1 por divisão) ficam definidas abaixo mas não são mais chamadas
// por montarLinhas — "Edificação/Ambiente" virou uma caixa de nome livre
// editável pelo usuário (acabamentoAmbientes), não necessariamente um
// código de divisão da NT, então deixou de ser cruzável automaticamente
// contra a tabela. Mantidas como lógica já validada, caso a comparação
// volte a ser necessária.
// ─────────────────────────────────────────────────────────────────────────────

import { CLASSE_INCOMBUSTIVEL } from './materiaisAcabamento'

// Elementos construtivos avaliados por divisão — mesma lista e nomenclatura
// do "Quadro Resumo de Controle de Materiais de Acabamento" (memorial).
// 'fachada' segue cadastrada em TABELA_B1 (a Tabela B.1 define classe para
// ela) mas fora desta lista — não faz parte do quadro que o usuário
// preenche na tela.
export const ELEMENTOS = [
  { key: 'piso',       label: 'Piso' },
  { key: 'parede',     label: 'Parede/Divisórias' },
  { key: 'teto',       label: 'Teto/Forro' },
  { key: 'cobertura',  label: 'Cobertura' },
  { key: 'isolamento', label: 'Isolamento Térmico Acústico' },
]

// Normas de ensaio de referência por elemento (item 9 das instruções
// normativas do CMAR — Anexo A da NT 10/2021 CBMMA: "Classificação e
// Ensaios"). Só orienta a marcação na tela/memorial — não entra na
// comparação de classe (ORDEM_CLASSE/TABELA_B1). Cobertura e isolamento
// térmico acústico não têm lista própria nas instruções recebidas — ficam
// só com o campo livre na tela, em vez de uma lista inventada.
export const NORMAS_ENSAIO_POR_ELEMENTO = {
  piso:   ['ISO 1182', 'NBR 8660', 'EN ISO 11925-2', 'ASTM E662'],
  parede: ['ISO 1182', 'NBR 9442', 'ASTM E662'],
  teto:   ['ISO 1182', 'NBR 9442', 'ASTM E662'],
}

/** Quebra o texto livre de "Normas de ensaio" (string separada por vírgula,
 *  como salva em acabamentos[].normasEnsaio) numa lista, pra cruzar com
 *  NORMAS_ENSAIO_POR_ELEMENTO e saber quais checkboxes já estão marcados. */
export function parseNormasEnsaio(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean)
}

// Universo de classes de reação ao fogo que um laudo pode atribuir a um
// material — item 5 das instruções: Classe I a VI, com subdivisão A/B
// (fumaça) dentro de cada classe numérica. NÃO usado para comparar "melhor
// ou igual" em ordem crescente: a Tabela B.1 lista, para cada elemento, o
// CONJUNTO explícito de classes aceitas (às vezes pulando a variante B de
// uma classe intermediária mesmo aceitando a variante A da classe seguinte
// — ex.: aceita II-A e III-A mas não II-B). Por isso a comparação é sempre
// "a classe do material está na lista de classes admitidas?", nunca um
// limiar único.
export const ORDEM_CLASSE = [
  'I', 'II-A', 'II-B', 'III-A', 'III-B', 'IV-A', 'IV-B', 'V-A', 'V-B', 'VI-A', 'VI-B',
]

/** Linha da Tabela B.1 aplicável a uma divisão — busca a divisão exata
 *  primeiro (ex.: 'C-1') e cai para a letra do grupo quando a tabela não
 *  distingue divisões dentro do grupo (ex.: 'B'), mesma convenção de
 *  _medidasDaDivisaoNormal em normas/index.js. */
function linhaDivisao(tabela, divisao) {
  return tabela?.[divisao] ?? tabela?.[divisao?.charAt?.(0)] ?? null
}

/** Classes admitidas pela norma para um elemento de uma divisão. Retorna
 *  null quando a divisão/grupo ainda não tem dado cadastrado na tabela
 *  (não deve ser interpretado como "sem exigência"). */
export function classesAdmitidasDivisao(tabela, divisao, elemento) {
  return linhaDivisao(tabela, divisao)?.[elemento] ?? null
}

/** Formata uma lista de classes admitidas no mesmo estilo da norma (ex.:
 *  "I, II-A, III-A, IV-A ou V-A") para exibição na tela e no memorial. */
export function formatarClasses(classes) {
  if (!classes || classes.length === 0) return null
  if (classes.length === 1) return classes[0]
  return `${classes.slice(0, -1).join(', ')} ou ${classes[classes.length - 1]}`
}

/** Classe efetivamente resolvida para o material informado numa linha, ou
 *  null quando ainda não há classe comprovada (item 6 — nunca presumir).
 *  'ensaiado' confia na classe do catálogo de materiais ensaiados (dado de
 *  ensaio já fornecido pelo usuário — ver materiaisAcabamento.js) sem
 *  exigir fabricante/laudo de novo na tela, igual a 'incombustivel'. */
export function classeResolvida(item) {
  if (!item) return null
  if (item.origem === 'incombustivel') return CLASSE_INCOMBUSTIVEL
  if (item.origem === 'ensaiado') return item.classeAdotada || null
  if (item.origem === 'manual' && item.classeAdotada && item.fabricante && item.laudoNumero) return item.classeAdotada
  return null
}

/** Resultado de uma linha: ATENDE | NAO_ATENDE | PENDENTE_LAUDO |
 *  NAO_PREENCHIDO | SEM_DADO_NORMATIVO. Regra de comparação (item 19): a
 *  classe do material precisa estar entre as classes admitidas pela Tabela
 *  B.1 para aquele elemento/divisão — nunca um limiar numérico único. */
export function resultadoLinha(item, classesExigidas) {
  if (!item || !item.origem) return 'NAO_PREENCHIDO'
  const classe = classeResolvida(item)
  if (!classe) return 'PENDENTE_LAUDO'
  if (!classesExigidas || classesExigidas.length === 0) return 'SEM_DADO_NORMATIVO'
  return classesExigidas.includes(classe) ? 'ATENDE' : 'NAO_ATENDE'
}

/** Monta as 5 linhas (uma por ELEMENTOS) de um ambiente — "Edificação/
 *  Ambiente" é agora uma caixa totalmente editável pelo usuário
 *  (acabamentoAmbientes, ver ProjetoContext.jsx), não mais derivada da
 *  divisão de ocupação do pavimento; por isso não cruza mais com a Tabela
 *  B.1 aqui (um nome livre não é necessariamente um código de divisão da
 *  NT). Cruza só os itens já cadastrados (`itens`, filtrados pela
 *  estrutura) com ELEMENTOS. Usado tanto pela tela quanto pelo memorial —
 *  nunca duas fontes de verdade sobre o conteúdo de uma linha. */
export function montarLinhas(ambiente, itens) {
  const porChave = new Map(itens.map(a => [a.chave, a]))
  return ELEMENTOS.map(el => {
    const chave = `${ambiente.id}|${el.key}`
    return {
      chave, ambienteId: ambiente.id, ambienteNome: ambiente.nome,
      elemento: el.key, elementoLabel: el.label,
      item: porChave.get(chave) || null,
    }
  })
}

/** Conclusão padrão do CMAR (item 23 das instruções), a partir de todas as
 *  linhas de uma estrutura (ou do projeto inteiro). Prioridade: um material
 *  que não atende é sempre o resultado mais grave, independente de outras
 *  pendências; a seguir, ausência de dado normativo (não dá pra concluir);
 *  a seguir, pendência de laudo/preenchimento; senão, atende. */
export function resumoCMAR(linhas) {
  if (linhas.length === 0) return 'DADOS_INSUFICIENTES'
  const resultados = linhas.map(l => l.resultado)
  if (resultados.includes('NAO_ATENDE')) return 'NAO_ATENDE'
  if (resultados.includes('SEM_DADO_NORMATIVO')) return 'DADOS_INSUFICIENTES'
  if (resultados.includes('PENDENTE_LAUDO') || resultados.includes('NAO_PREENCHIDO')) return 'ATENDE_COM_PENDENCIAS'
  return 'ATENDE'
}
