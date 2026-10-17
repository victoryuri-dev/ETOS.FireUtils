// CMAR da PB (item 9 do formulário, Tabela B.1 da NT 09/2024): a linha de
// cada estrutura sai das divisões dos pavimentos dela; com mais de uma linha
// aplicável, vale a mais restritiva (a última da tabela). Sem preenchimento
// do RT — só resultado.

export const ELEMENTOS_CMAR = [['piso', 'Piso'], ['parede', 'Parede'], ['teto', 'Teto'], ['fachada', 'Fachada']]

const casa = (divisao, ocupacoes) => ocupacoes.includes(divisao) || ocupacoes.includes(divisao.charAt(0))

/** Linha do CMAR da estrutura (ou null sem divisão enquadrada). */
export function linhaCmarEstrutura(divisoes, linhas = []) {
  let escolhida = null
  for (const l of linhas) if (divisoes.some(d => d && casa(d, l.ocupacoes))) escolhida = l
  return escolhida
}

/** Resultado por estrutura em que o CMAR é exigido. */
export function cmarPorEstrutura(state, porEstrutura = [], linhas = []) {
  return porEstrutura
    .filter(pe => pe.sistemas?.controle_acabamento?.ativo)
    .map(({ estrutura }) => {
      const divisoes = [...new Set((state.pavimentos || []).filter(p => p.estruturaId === estrutura.id).map(p => p.divisao).filter(Boolean))]
      return { estrutura, divisoes, linha: linhaCmarEstrutura(divisoes, linhas) }
    })
}
