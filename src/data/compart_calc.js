// ─────────────────────────────────────────────────────────────────────────────
// compart_calc.js — Funções universais de classificação e verificação da
// compartimentação horizontal/vertical (NT 09/2021 CBMMA). Recebem os dados
// normativos (tabela/classes) como parâmetro; não importam nenhum arquivo de
// estado diretamente — mesmas funções alimentam a tela de dimensionamento e o
// texto do memorial, nunca duas fontes de verdade (mesmo padrão de trrf_calc.js).
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0
const vazio = v => v === '' || v == null

/** Tipo de edificação (I a VI) a partir da altura (Anexo B, NT 09 CBMMA).
 *  Retorna null quando a altura ainda não foi informada. Edificação térrea
 *  (altura 0) cai no Tipo I; qualquer altura > 0 segue as faixas normais. */
export function classificarTipoEdificacao(altura, classes) {
  if (vazio(altura)) return null
  const h = num(altura)
  if (h < 0) return null
  if (h === 0) return classes.find(c => c.classe === 'I') || null
  const classe = classes.filter(c => c.classe !== 'I').find(c => h <= c.max)
  return classe || classes[classes.length - 1] || null
}

/** Busca a área máxima de compartimentação (m²) de uma divisão para um tipo
 *  de edificação, na tabela do Anexo B da NT 09 CBMMA. O valor pode ser: um
 *  número (m²) ou null (combinação sem limite de área nessa tabela — outras
 *  regras da NT se aplicam, ex.: unidades autônomas do Grupo A). */
export function buscarAreaMaxima(tabela, divisao, tipo) {
  const linha = tabela.find(r => r.divisoes.includes(divisao))
  if (!linha) return { encontrado: false, valor: null }
  const chave = `t${{ I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 }[tipo]}`
  const valor = linha[chave]
  if (valor === undefined) return { encontrado: false, valor: null }
  return { encontrado: true, valor }
}

/** Resultado completo da verificação de área máxima de compartimentação
 *  horizontal de uma estrutura: classifica o tipo de edificação pela altura
 *  e compara a área de cada pavimento com a área máxima permitida para a
 *  divisão daquele pavimento. Cada pavimento é tratado como um compartimento
 *  independente (o app não modela mezaninos interligados — item 5.1.2 da
 *  NT 09 exige somar áreas de pavimentos/mezaninos interligados quando
 *  houver essa interligação; confirmar manualmente nesse caso). */
export function calcularAreaMaximaCompartimentacao(pavimentosOrdenados, estrutura, tabela, classesTipo) {
  const tipoObj = classificarTipoEdificacao(estrutura.alturaPisoPiso, classesTipo)
  const tipo = tipoObj?.classe ?? null

  const linhas = pavimentosOrdenados
    .filter(p => p.divisao)
    .map(p => {
      const area = num(p.area)
      const busca = tipo ? buscarAreaMaxima(tabela, p.divisao, tipo) : { encontrado: false, valor: null }
      const excede = area > 0 && typeof busca.valor === 'number' && area > busca.valor
      return { pavimento: p, area, ...busca, excede }
    })

  return {
    tipo, tipoNome: tipoObj?.nome ?? null,
    linhas,
    pavimentosExcedentes: linhas.filter(l => l.excede),
  }
}
