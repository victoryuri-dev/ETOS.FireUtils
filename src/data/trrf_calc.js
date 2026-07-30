// ─────────────────────────────────────────────────────────────────────────────
// trrf_calc.js — Funções universais de classificação e cálculo do TRRF
// (Anexo B, NT 01 CBMMA). Recebem os dados normativos (tabela/classes) como
// parâmetro; não importam nenhum arquivo de estado diretamente. Mesmas
// funções alimentam a tela de dimensionamento e o texto do memorial — nunca
// duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0
const vazio = v => v === '' || v == null

/** Classe de altura (P1-P8) a partir da altura da edificação (item 4.31,
 *  NT 03 CBMMA — do piso de descarga ao piso do último pavimento habitado;
 *  ver `alturaParaClassificacao` para a exceção do subsolo ocupado). Retorna
 *  null quando a altura está fora da faixa coberta pelo Anexo B (>250 m) ou
 *  ainda não foi informada. Classes ordenadas por limite superior — a
 *  primeira cujo `max` alcança a altura é a classe (equivalente a "h ≤ Xm"
 *  na primeira faixa e "Xm < h ≤ Ym" nas seguintes, sem tratar 0 como faixa
 *  inválida — edificação térrea tem altura igual ou próxima de zero). */
export function classificarAltura(altura, classes) {
  if (vazio(altura)) return null
  const h = num(altura)
  if (h < 0) return null
  const classe = classes.find(c => h <= c.max)
  return classe ? classe.classe : null
}

/** Classe de subsolo (S1/S2) a partir da profundidade do subsolo. Retorna
 *  null quando a edificação não tem subsolo ou a profundidade ainda não foi
 *  informada. */
export function classificarSubsolo(profundidade, classes) {
  if (vazio(profundidade)) return null
  const p = num(profundidade)
  if (p <= 0) return null
  const classe = classes.find(c => p <= c.max)
  return classe ? classe.classe : null
}

/** Verifica se algum pavimento de subsolo tem ocupação que conta como
 *  "ocupada" para fins do item 4.31 da NT 03 CBMMA — ou seja, qualquer uso
 *  diferente de estacionamento de veículos, vestiário ou instalação
 *  sanitária sem aproveitamento para atividades ou permanência humana
 *  (`divisoesSemOcupacao`, ver trrf.js). */
export function subsoloConsideradoOcupado(pavimentosOrdenados, divisoesSemOcupacao) {
  return pavimentosOrdenados.some(p => p.tipo === 'subsolo' && p.divisao && !divisoesSemOcupacao.includes(p.divisao))
}

/** Altura da edificação a usar na classificação (item 4.31, NT 03 CBMMA):
 *  do piso de descarga ao piso do último pavimento habitado — `alturaPisoPiso`
 *  no modelo do projeto, apesar do nome do campo. Quando o subsolo tem
 *  ocupação (ver `subsoloConsideradoOcupado`), a medição passa a começar no
 *  piso do subsolo mais baixo ocupado, somando a profundidade do subsolo à
 *  altura acima do solo. */
export function alturaParaClassificacao(estrutura, pavimentosOrdenados, divisoesSemOcupacao) {
  if (vazio(estrutura.alturaPisoPiso)) return { altura: '', subsoloSomado: false }
  const base = num(estrutura.alturaPisoPiso)
  const ocupado = subsoloConsideradoOcupado(pavimentosOrdenados, divisoesSemOcupacao)
  if (!ocupado) return { altura: base, subsoloSomado: false }
  return { altura: base + num(estrutura.profundidadeSubsolo), subsoloSomado: true }
}

/** Busca o TRRF de uma divisão numa classe (ex: 'P3', 'S1') na tabela do
 *  Anexo B. O valor pode ser: um número (minutos), null (combinação não
 *  coberta — nota 1, SSCI define) ou uma string (referência a um item do
 *  Anexo A a ser consultado manualmente, ex: grupos F/J). */
export function buscarTRRF(tabela, divisao, classe) {
  const linha = tabela.find(r => r.divisoes.includes(divisao))
  if (!linha) return { encontrado: false, valor: null, referencia: null }

  const valor = linha[classe.toLowerCase()]
  if (valor === undefined) return { encontrado: false, valor: null, referencia: null }
  if (typeof valor === 'string') return { encontrado: true, valor: null, referencia: valor }
  return { encontrado: true, valor, referencia: null }
}

/** Resultado completo do TRRF de uma estrutura: classifica altura/subsolo,
 *  busca o TRRF de cada pavimento na sua posição (subsolo × acima do solo) e
 *  verifica a não regressão entre pavimentos adjacentes (item 5.12 — o
 *  pavimento inferior nunca pode ter TRRF menor que o imediatamente acima,
 *  seja por causa do subsolo ou por divisões diferentes em uso misto).
 *
 *  `pavimentosOrdenados` deve vir do subsolo mais profundo até o pavimento
 *  mais alto (mesma ordem produzida por REBUILD_PAVIMENTOS em ProjetoContext).
 *  `divisoesSemOcupacao` vem de trrf.js (ver `alturaParaClassificacao`).
 */
export function calcularTRRF(pavimentosOrdenados, estrutura, tabela, classesAltura, classesSubsolo, divisoesSemOcupacao) {
  const { altura: alturaEfetiva, subsoloSomado } = alturaParaClassificacao(estrutura, pavimentosOrdenados, divisoesSemOcupacao)
  const classeAltura  = classificarAltura(alturaEfetiva, classesAltura)
  const classeSubsolo = classificarSubsolo(estrutura.profundidadeSubsolo, classesSubsolo)

  const linhas = pavimentosOrdenados.map(p => {
    const posicao = p.tipo === 'subsolo' ? 'subsolo' : 'acima do solo'
    const classe = posicao === 'subsolo' ? classeSubsolo : classeAltura
    const busca = classe && p.divisao ? buscarTRRF(tabela, p.divisao, classe) : { encontrado: false, valor: null, referencia: null }
    return { pavimento: p, posicao, classe, ...busca }
  })

  const pendenciasNaoRegressao = []
  for (let i = 0; i < linhas.length - 1; i++) {
    const inferior = linhas[i]
    const superior = linhas[i + 1]
    if (typeof inferior.valor === 'number' && typeof superior.valor === 'number' && inferior.valor < superior.valor) {
      pendenciasNaoRegressao.push({
        pavimentoInferior: inferior.pavimento, pavimentoSuperior: superior.pavimento,
        trrfInferior: inferior.valor, trrfSuperior: superior.valor,
      })
    }
  }

  // Pavimentos cujo TRRF não pôde ser determinado diretamente (classe ainda
  // não informada, combinação fora da tabela, ou remete a item do Anexo A).
  const avisos = linhas.filter(l => l.pavimento.divisao && (!l.classe || !l.encontrado || l.referencia || (l.encontrado && l.valor == null)))

  return {
    alturaEfetiva, subsoloSomado, classeAltura, classeSubsolo, linhas, pendenciasNaoRegressao, avisos,
    resumoAcimaSolo: _resumoPorPosicao(linhas, 'acima do solo'),
    resumoSubsolo:   _resumoPorPosicao(linhas, 'subsolo'),
  }
}

// TRRF final por posição pode ter mais de um valor (uma edificação de uso
// misto tem uma divisão por pavimento) — deduplica por divisão+valor.
function _resumoPorPosicao(linhas, posicao) {
  const vistos = new Map()
  linhas
    .filter(l => l.posicao === posicao && typeof l.valor === 'number')
    .forEach(l => {
      const key = `${l.pavimento.divisao}-${l.valor}`
      if (!vistos.has(key)) vistos.set(key, { divisao: l.pavimento.divisao, valor: l.valor })
    })
  return [...vistos.values()]
}

/** Metodologia normativa de cada material estrutural adotado — usada tanto
 *  na tela quanto no memorial para citar a norma/método de comprovação. */
export function metodologiaDosMateriais(materiais, mapa) {
  const lista = Array.isArray(materiais) ? materiais : [materiais].filter(Boolean)
  return lista.map(m => ({ material: m, ...(mapa[m] || null) })).filter(m => m.norma)
}
