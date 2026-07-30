// ─────────────────────────────────────────────────────────────────────────────
// trrf_calc.js — Funções universais de classificação e cálculo do TRRF
// (Anexo B, NT 01 CBMMA). Recebem os dados normativos (tabela/classes) como
// parâmetro; não importam nenhum arquivo de estado diretamente. Mesmas
// funções alimentam a tela de dimensionamento e o texto do memorial — nunca
// duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0

/** Classe de altura (P1-P8) a partir da altura total da edificação. Retorna
 *  null quando a altura está fora da faixa coberta pelo Anexo B (>250 m) ou
 *  ainda não foi informada. */
export function classificarAltura(altura, classes) {
  const h = num(altura)
  if (h <= 0) return null
  const classe = classes.find(c => h > c.min && h <= c.max)
  return classe ? classe.classe : null
}

/** Classe de subsolo (S1/S2) a partir da profundidade do subsolo. Retorna
 *  null quando a edificação não tem subsolo ou a profundidade ainda não foi
 *  informada. */
export function classificarSubsolo(profundidade, classes) {
  const p = num(profundidade)
  if (p <= 0) return null
  const classe = classes.find(c => p > c.min && p <= c.max)
  return classe ? classe.classe : null
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
 */
export function calcularTRRF(pavimentosOrdenados, estrutura, tabela, classesAltura, classesSubsolo) {
  const classeAltura  = classificarAltura(estrutura.altura, classesAltura)
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
    classeAltura, classeSubsolo, linhas, pendenciasNaoRegressao, avisos,
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
