// ─────────────────────────────────────────────────────────────────────────────
// cmar_calc.js — Funções universais do Controle de Material de Acabamento e
// Revestimento (CMAR, NT 10 CBMMA). Recebem os dados normativos (tabela por
// divisão/rotas de fuga) como parâmetro; não importam nenhum arquivo de
// estado diretamente. As mesmas funções alimentam a tela de dimensionamento
// e o texto do memorial — nunca duas fontes de verdade.
//
// Princípio (item 24 das instruções normativas do CMAR):
//   OCUPAÇÃO → ELEMENTO → CLASSE MÁXIMA ADMITIDA → MATERIAL → CLASSE DO
//   MATERIAL → ATENDE?
// Uma classe de material nunca é presumida (item 6): só existe classe
// resolvida quando o material é comprovadamente incombustível (catálogo,
// ver materiaisAcabamento.js) ou quando o usuário informou os dados de
// laudo/fabricante do material cadastrado manualmente.
// ─────────────────────────────────────────────────────────────────────────────

import { CLASSE_INCOMBUSTIVEL } from './materiaisAcabamento'

// Elementos construtivos avaliados por divisão (item 4 das instruções).
export const ELEMENTOS = [
  { key: 'piso',      label: 'Piso' },
  { key: 'parede',    label: 'Parede / divisória' },
  { key: 'teto',      label: 'Teto / forro' },
  { key: 'fachada',   label: 'Fachada' },
  { key: 'cobertura', label: 'Cobertura' },
]

// Itens de rota de fuga avaliados à parte, com classes mais restritivas
// (item 10 das instruções) — não variam por divisão.
export const ROTA_FUGA_ITENS = [
  { key: 'corredorProtegido', label: 'Corredor protegido / acesso à saída enclausurada' },
  { key: 'escadaRampa',       label: 'Escada / rampa' },
]

// Ordem das classes de reação ao fogo, da mais favorável (I) à menos
// favorável (VI-B) — item 5 das instruções: "quanto menor o número da
// classe, melhor o comportamento"; dentro da mesma classe, A é mais
// favorável que B (produção de fumaça).
export const ORDEM_CLASSE = [
  'I', 'II-A', 'II-B', 'III-A', 'III-B', 'IV-A', 'IV-B', 'V-A', 'V-B', 'VI-A', 'VI-B',
]

/** Classe máxima admitida pela norma para um elemento de uma divisão.
 *  Retorna null quando a divisão ainda não tem dado cadastrado na tabela
 *  (não deve ser interpretado como "sem exigência"). */
export function classeAdmitidaDivisao(tabela, divisao, elemento) {
  return tabela?.[divisao]?.[elemento] ?? null
}

/** Classe máxima admitida pela norma para um item de rota de fuga. */
export function classeAdmitidaRotaFuga(rotasFuga, item) {
  return rotasFuga?.[item] ?? null
}

/** Classe efetivamente resolvida para o material informado numa linha, ou
 *  null quando ainda não há classe comprovada (item 6 — nunca presumir). */
export function classeResolvida(item) {
  if (!item) return null
  if (item.origem === 'incombustivel') return CLASSE_INCOMBUSTIVEL
  if (item.origem === 'manual' && item.classeInformada && item.fabricante && item.laudoNumero) return item.classeInformada
  return null
}

/** Resultado de uma linha: ATENDE | NAO_ATENDE | PENDENTE_LAUDO |
 *  NAO_PREENCHIDO | SEM_DADO_NORMATIVO. Regra de comparação (item 19): a
 *  classe do material deve ser igual ou mais favorável que a classe máxima
 *  admitida (índice igual ou menor na ORDEM_CLASSE). */
export function resultadoLinha(item, classeExigida) {
  if (!item || !item.origem) return 'NAO_PREENCHIDO'
  const classe = classeResolvida(item)
  if (!classe) return 'PENDENTE_LAUDO'
  if (!classeExigida) return 'SEM_DADO_NORMATIVO'
  const idxClasse   = ORDEM_CLASSE.indexOf(classe)
  const idxExigida  = ORDEM_CLASSE.indexOf(classeExigida)
  if (idxClasse === -1 || idxExigida === -1) return 'PENDENTE_LAUDO'
  return idxClasse <= idxExigida ? 'ATENDE' : 'NAO_ATENDE'
}

/** Monta todas as linhas (por divisão × elemento, mais rotas de fuga) de
 *  uma estrutura, cruzando os itens já cadastrados (`itens`, filtrados pela
 *  estrutura) com a tabela normativa. Usado tanto pela tela quanto pelo
 *  memorial — nunca duas fontes de verdade sobre o resultado de uma linha. */
export function montarLinhas(divisoes, tabela, rotasFuga, itens) {
  const porChave = new Map(itens.map(a => [a.chave, a]))
  const linhas = []

  divisoes.forEach(divisao => {
    ELEMENTOS.forEach(el => {
      const chave = `${divisao}|${el.key}`
      const classeExigida = classeAdmitidaDivisao(tabela, divisao, el.key)
      const item = porChave.get(chave) || null
      linhas.push({
        chave, escopo: 'divisao', divisao, elemento: el.key, elementoLabel: el.label,
        classeExigida, item, resultado: resultadoLinha(item, classeExigida),
      })
    })
  })

  ROTA_FUGA_ITENS.forEach(el => {
    const chave = `rotaFuga|${el.key}`
    const classeExigida = classeAdmitidaRotaFuga(rotasFuga, el.key)
    const item = porChave.get(chave) || null
    linhas.push({
      chave, escopo: 'rotaFuga', divisao: null, elemento: el.key, elementoLabel: el.label,
      classeExigida, item, resultado: resultadoLinha(item, classeExigida),
    })
  })

  return linhas
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
