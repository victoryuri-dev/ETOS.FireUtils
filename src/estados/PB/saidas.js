// Dimensionamento padrão das saídas de emergência da PB (item 10 e Anexo A
// do formulário do CBMPB) — sem a rede de ambientes/acessos do MA. Por
// pavimento, a partir do que a Configuração já tem (área e divisão):
//   população = área ÷ taxa da divisão (Tabela 1, NT 12/2025), ou a
//               informada pelo RT (divisões sem taxa por área, ou ajuste);
//   acessos/descargas e portas = pela população do próprio pavimento;
//   escadas/rampas = pela população do pavimento mais populoso servido
//               pela escada (todos menos o piso de descarga);
//   distância máxima = Tabela 2, pelo nº de saídas informado, com/sem
//               chuveiros e detecção (medidas adotadas na estrutura).
import { getSE } from '../../data/normas/index'
import { calcAD, calcER, calcPT, getDistancia, tipoEscadaEstrutura } from '../../data/se_calc'

const num = v => parseFloat(String(v ?? '').replace(',', '.'))

/** População do pavimento: a informada pelo RT, ou área ÷ taxa. */
export function populacaoPavimentoPB(pav, entrada, taxa) {
  const informada = parseInt(entrada?.populacao, 10)
  if (informada > 0) return { populacao: informada, origem: 'informada' }
  const area = num(pav.area)
  if (taxa?.A && area > 0) return { populacao: Math.ceil(area / taxa.A), origem: 'area' }
  return { populacao: null, origem: null }
}

export function dimensionamentoSaidasPB(state, porEstrutura = []) {
  const se = getSE(state.uf)
  if (!se) return null
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS, DISTANCIAS_MAXIMAS } = se
  const entradas = state.memorialPB?.saidas || {}
  const sistemasDe = id => porEstrutura.find(pe => pe.estrutura.id === id)?.sistemas || {}

  const estruturas = (state.estruturas || []).map(est => {
    const sist = sistemasDe(est.id)
    const temChuveiros = !!sist.sprinklers?.ativo
    const temDeteccao = !!sist.deteccao?.ativo
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id).map(pav => {
      const taxa = TAXA_POPULACIONAL[pav.divisao] || null
      const entrada = entradas[pav.id] || {}
      const { populacao, origem } = populacaoPavimentoPB(pav, entrada, taxa)
      const nSaidas = Math.max(1, parseInt(entrada.nSaidas, 10) || 1)
      const ok = taxa && populacao > 0
      return {
        pav, taxa, populacao, origem, nSaidas,
        ad: ok ? calcAD(populacao, taxa.AD, LARGURAS_MINIMAS) : null,
        pt: ok ? calcPT(populacao, taxa.PT, LARGURAS_MINIMAS) : null,
        distancia: pav.divisao ? getDistancia(pav.divisao, !!pav.pisoDescarga, nSaidas, temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS) : null,
      }
    })
    // Escada/rampa: a mais populosa entre os pavimentos fora do piso de descarga.
    const servidos = pavs.filter(p => !p.pav.pisoDescarga && p.taxa && p.populacao > 0)
    const critico = servidos.reduce((a, b) => (b.populacao > (a?.populacao || 0) ? b : a), null)
    const er = pavs.length > 1 && critico ? { ...calcER(critico.populacao, critico.taxa.ER, LARGURAS_MINIMAS), pavimento: critico.pav.label } : null
    const escada = tipoEscadaEstrutura(est, pavs.map(p => p.pav.divisao), se.TIPOS_ESCADA)
    return { est, pavs, er, escada }
  })

  const todos = estruturas.flatMap(e => e.pavs)
  const pops = todos.map(p => p.populacao || 0)
  const maior = (lista, f) => lista.reduce((m, x) => Math.max(m, f(x) || 0), 0)
  return {
    estruturas,
    popMax: Math.max(0, ...pops),
    popTotal: pops.reduce((a, b) => a + b, 0),
    larAD: maior(todos, p => p.ad?.la),
    larER: maior(estruturas, e => e.er?.la),
    larPT: maior(todos, p => p.pt?.la),
    distDescarga: todos.filter(p => p.pav.pisoDescarga && p.distancia != null).map(p => ({ valor: p.distancia, divisao: p.pav.divisao })),
    distDemais: todos.filter(p => !p.pav.pisoDescarga && p.distancia != null).map(p => ({ valor: p.distancia, divisao: p.pav.divisao })),
    escadas: estruturas.filter(e => e.escada?.status === 'ok').map(e => e.escada.exigido),
    semPopulacao: todos.filter(p => p.pav.divisao && !(p.populacao > 0)),
  }
}

/** Anexo A do formulário: os cálculos por estrutura, em blocos do memorial. */
export function anexoSaidasPB(state, porEstrutura) {
  const r = dimensionamentoSaidasPB(state, porEstrutura)
  if (!r) return []
  const f = v => (v == null || v === '' ? '—' : String(v).replace('.', ','))
  const m = v => (v == null ? '—' : `${f(Number(v).toFixed(2))} m`)
  return r.estruturas.filter(e => e.pavs.length).map(({ est, pavs, er }) => ({
    titulo: est.nome,
    blocos: [
      { tipo: 'titulo2', texto: est.nome },
      {
        tipo: 'tabela',
        colunas: ['Pavimento', 'Divisão', 'Área (m²)', 'Taxa', 'População', 'Acessos/descargas', 'Portas', 'Saídas', 'Dist. máx.'],
        linhas: pavs.map(p => [
          p.pav.label, p.pav.divisao || '—', f(p.pav.area),
          p.taxa?.A ? `1 p/ ${f(p.taxa.A)} m²` : (p.taxa?.obs || '—'),
          p.populacao ? `${p.populacao}${p.origem === 'informada' ? ' (informada)' : ''}` : '—',
          p.ad ? `${p.ad.n} UP — ${m(p.ad.la)}` : '—',
          p.pt ? `${p.pt.n} UP — ${m(p.pt.la)}` : '—',
          String(p.nSaidas),
          p.distancia != null ? m(p.distancia) : '—',
        ]),
      },
      er
        ? { tipo: 'paragrafo', texto: `Escadas e rampas dimensionadas pela população do pavimento mais populoso servido (${er.pavimento}): ${er.n} UP — largura de ${m(er.la)}.` }
        : { tipo: 'paragrafo', texto: 'Edificação sem escadas ou rampas a dimensionar (um único pavimento ou população não informada).' },
    ],
  }))
}
