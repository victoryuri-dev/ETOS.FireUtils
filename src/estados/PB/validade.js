import { getValidadeInspecao } from '../../data/normas'

// Item 3.4 do Memorial da PB: risco da edificação e validade da inspeção pelo
// Anexo B da NT 02/2023 — vale o maior risco (menor validade) entre as
// divisões do projeto. F-3 só é alto quando o RT informa estádio de futebol.
const ORDEM = { baixo: 1, medio: 2, alto: 3 }

/** { risco, validadeAnos, divisoes } — divisões que definem o risco; null sem
 *  divisão classificada ou sem a tabela cadastrada para o estado. */
export function riscoValidadePB(uf, divisoes, estadioFutebol = false) {
  const tabela = getValidadeInspecao(uf)?.TABELA_ANEXO_B
  if (!tabela) return null
  let maior = null
  for (const d of divisoes) {
    const linha = tabela[d]
    if (!linha) continue
    const r = estadioFutebol && linha.estadioFutebol ? linha.estadioFutebol : linha
    if (!maior || ORDEM[r.risco] > ORDEM[maior.risco]) maior = { risco: r.risco, validadeAnos: r.validadeAnos, divisoes: [d] }
    else if (r.risco === maior.risco) maior.divisoes.push(d)
  }
  return maior
}
