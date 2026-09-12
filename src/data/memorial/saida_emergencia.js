// memorial/saida_emergencia.js — texto do memorial descritivo pro sistema
// de Saída de Emergência (NT 14 CBMMA / NBR 9077). Estrutura definida pelo
// usuário a partir de um modelo .docx (Generalidades padrão + parametrizada
// pelas larguras mínimas da norma; uma tabela de distância máxima a
// percorrer por estrutura; por pavimento, um organograma da árvore de
// Acessos e Descargas, uma tabela única com todos os ambientes do
// pavimento, e uma tabela individual pra cada Saída/Circulação). Mesmo
// motor de cálculo (se_calc.js) que alimenta pages/medidas/
// AcessosDescargasView.jsx — nunca duplica a lógica aqui, só narra o
// resultado.
//
// Diferente dos builders mais antigos (extintores.js, seg_estrutural.js),
// precisa saber chuveiros automáticos/detecção de incêndio POR ESTRUTURA
// pra resolver a distância máxima a percorrer (getDistancia) — por isso
// recebe `porEstrutura` (useMedidasObrigatorias().porEstrutura), não só o
// `sistemas` agregado do projeto que os outros builders usam.

import { getSE } from '../normas/index'
import {
  contarSaidasPavimento, getDistancia,
  calcDimsAcesso, dimsDoAcesso, calcNoAmbientePT,
} from '../se_calc'

const fmt  = n => Number(n).toFixed(2).replace('.', ',')
const fmtM = n => `${fmt(n)} m`
const fmtEnxuto = n => Number(n).toFixed(2).replace(/,?0+$/, '').replace(/\.$/, '').replace('.', ',') || '0'
const num2 = n => String(n).padStart(2, '0')

function acessosFilhos(acessos, parentId) {
  return acessos.filter(a => a.alimentaEm === parentId)
}
function ambientesDe(ambientes, acessoId) {
  return ambientes.filter(a => a.acessoId === acessoId)
}

// ── Generalidades — mesmo texto pra qualquer projeto, só as larguras
// mínimas (parágrafo de fluxo + tabela de portas) vêm da norma do estado. ──
function fmtLarguraPorta(m) {
  return m < 1 ? `${Math.round(m * 100)} cm` : `${fmtEnxuto(m)} m`
}

function blocosGeneralidades(larguras) {
  const { AD, ER, PT } = larguras
  const textoFluxo = AD === ER
    ? `devem ser de ${fmtM(AD)}`
    : `devem ser de ${fmtM(AD)} para acessos e descargas, e de ${fmtM(ER)} para escadas e rampas`

  const letras = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const bulletsPortas = (PT || []).map((linha, i) => {
    const folhas = linha.tipo && linha.tipo !== '1 folha' ? `, em ${linha.tipo}` : ''
    const unidade = linha.n_up === 1 ? 'unidade' : 'unidades'
    return `${letras[i] || i + 1}) ${fmtLarguraPorta(linha.largura)}${folhas}, valendo por ${linha.n_up} ${unidade} de passagem;`
  })

  return [
    { tipo: 'titulo2', texto: 'Generalidades' },
    { tipo: 'titulo2', texto: 'Acessos' },
    { tipo: 'paragrafo', texto: 'Os acessos devem satisfazer às seguintes condições:' },
    { tipo: 'lista', estilo: 'lettered', itens: [
      'a) permitir o escoamento fácil de todos os ocupantes da edificação;',
      'b) permanecer desobstruídos em todos os pavimentos;',
      'c) ter larguras conforme o estabelecido na NT;',
      'd) ter pé-direito mínimo de 2,30 m, com exceção de obstáculos representados por vigas, vergas de portas e outros, cuja altura mínima livre deve ser de 2,10 m;',
      'e) ser sinalizados e iluminados (iluminação de emergência) com indicação clara do sentido da saída.',
    ]},
    { tipo: 'paragrafo', texto: 'Os acessos devem permanecer livres de quaisquer obstáculos, tais como móveis, divisórias, locais para exposição de mercadorias e outros, de forma permanente, mesmo quando a edificação esteja, supostamente, fora de uso.' },
    { tipo: 'titulo2', texto: 'Larguras Mínimas a Serem Adotadas' },
    { tipo: 'paragrafo', texto: `As larguras mínimas das saídas de emergência para acessos, escadas, rampas ou descargas ${textoFluxo}.` },
    { tipo: 'paragrafo', texto: 'A largura das portas, comuns ou corta-fogo, utilizadas nas rotas de saídas de emergência, devem ter as seguintes dimensões mínimas de vão livre:' },
    { tipo: 'lista', estilo: 'lettered', itens: bulletsPortas },
    { tipo: 'campo', label: 'Notas', valor: '1) Porta com dimensão maior que 1,2 m deve ter duas folhas;\n2) Porta com dimensão maior ou igual a 2,2 m exige coluna central.' },
    { tipo: 'titulo2', texto: 'Distâncias Máximas a Percorrer' },
    { tipo: 'paragrafo', texto: 'As distâncias máximas a serem percorridas para atingir as portas de acesso às saídas das edificações e o acesso às escadas ou às portas das escadas (nos pavimentos) constam nas tabelas abaixo e devem ser consideradas a partir da porta de acesso da unidade autônoma mais distante, desde que o seu caminhamento interno não ultrapasse 10 m.' },
    { tipo: 'titulo2', texto: 'Dimensionamento das Saídas de Emergência' },
  ]
}

// ── Árvore do pavimento — uma travessia só produz o organograma (formato
// colchete: raiz/Circulação em negrito, ambientes com o próprio nome
// embaixo) e a lista de ambientes/nós usada nas tabelas, garantindo que
// organograma e tabelas sempre casam. Raiz mantém o próprio nome (Saída
// NN/Escada-Rampa NN, já numerado pelo site); nó não-raiz vira
// "CIRCULAÇÃO NN" — o nome que o usuário deu no site (Acesso 1, Acesso
// 2...) é só um rótulo de trabalho, o memorial usa uma numeração própria e
// contínua por pavimento. Ambiente usa o próprio nome sem numeração
// extra — muitos já vêm numerados pelo Revit ("02 - Sala", ver
// populacao.set_occupancy no plugin); prefixar de novo aqui duplicava o
// número ("01 - 02 - Sala").
function montarArvorePavimento(pav) {
  const acessos = pav.acessos || []
  const ambientes = pav.ambientes || []
  const raizes = acessosFilhos(acessos, null)

  let nCirculacao = 0
  const listaAmbientes = [] // [{ amb }] em ordem de aparição
  const nos = []            // [{ acesso, label }] em ordem — raízes + Circulações

  function visitar(acesso, isRaiz) {
    const label = isRaiz ? String(acesso.nome).toUpperCase() : `CIRCULAÇÃO ${num2(++nCirculacao)}`
    nos.push({ acesso, label })

    const subAmbientes = ambientesDe(ambientes, acesso.id).map(amb => {
      listaAmbientes.push({ amb })
      return { texto: amb.nome, bold: false }
    })
    const subAcessos = acessosFilhos(acessos, acesso.id).map(a => visitar(a, false))

    return { texto: label, bold: true, sub: [...subAmbientes, ...subAcessos] }
  }

  const organograma = raizes.map(r => visitar(r, true))

  // Ambiente ainda sem acesso atribuído não tem nó pra pendurar no
  // organograma, mas continua entrando na tabela única de portas — não
  // faz sentido escondê-lo da tabela só por ainda não ter posição na
  // árvore (ver AcessosDescargasView.jsx).
  ambientes.filter(a => !a.acessoId).forEach(amb => listaAmbientes.push({ amb }))

  return { organograma, listaAmbientes, nos }
}

// Texto da taxa populacional aplicada a um ambiente — só faz sentido pra
// popTipo 'area' (a taxa vem da divisão, ver TAXA_POPULACIONAL); 'manual'
// e 'fixo' usam um valor informado direto, sem taxa por área.
function taxaPopulacionalTexto(amb, taxaPopulacional) {
  if (amb.popTipo === 'fixo') return 'Assentos informados'
  if (amb.popTipo === 'manual') return 'Informada manualmente'
  return taxaPopulacional[amb.divisao]?.obs || '—'
}

// ── Tabela única com todos os ambientes do pavimento (largura de porta) ──
function tabelaAmbientes(listaAmbientes, taxaPopulacional, larguras) {
  return {
    tipo: 'tabela',
    centralizado: true,
    linhasCabecalho: [
      [{ texto: 'PORTAS DOS AMBIENTES', colSpan: 8 }],
      [{ texto: 'AMBIENTES' }, { texto: 'ÁREA' }, { texto: 'DIVISÃO' }, { texto: 'TAXA POPULACIONAL' }, { texto: 'POPULAÇÃO' }, { texto: 'CUP' }, { texto: 'UP' }, { texto: 'LARGURA MÍNIMA (m)' }],
    ],
    linhas: listaAmbientes.map(({ amb }) => {
      const { pop, capPT, pt } = calcNoAmbientePT(amb, taxaPopulacional, larguras)
      return [
        amb.nome,
        `${fmt(amb.area || 0)} m²`,
        amb.divisao || '—',
        taxaPopulacionalTexto(amb, taxaPopulacional),
        pop, capPT, pt.n, fmt(pt.la),
      ]
    }),
  }
}

// ── Tabela individual de um nó (Saída/Escada-Rampa raiz, ou Circulação) —
// uma linha por dimensionamento LIGADO no nó (AD/ER/PT, ver acesso.dims em
// AcessosDescargasView.jsx) — um nó pode ter mais de um ao mesmo tempo
// (ex.: piso de descarga que é corredor de saída E chegada de escada). ──
function tabelaNo({ acesso, label }, ambientes, acessos, taxaPopulacional, larguras, pisoDescarga) {
  const dims = dimsDoAcesso(acesso, pisoDescarga)
  const { pop, cap, ad, er, pt } = calcDimsAcesso(acesso.id, ambientes, acessos, taxaPopulacional, larguras, dims)
  const linhas = [
    ad && ['ACESSO/DESCARGA', pop, cap.AD, ad.n, fmt(ad.la)],
    er && ['ESCADAS/RAMPAS', pop, cap.ER, er.n, fmt(er.la)],
    pt && ['PORTAS', pop, cap.PT, pt.n, fmt(pt.la)],
  ].filter(Boolean)
  return {
    tipo: 'tabela',
    centralizado: true,
    linhasCabecalho: [
      [{ texto: label, colSpan: 5 }],
      [{ texto: 'ELEMENTOS' }, { texto: 'POPULAÇÃO' }, { texto: 'CAPACIDADE' }, { texto: 'UP' }, { texto: 'LARGURA MÍNIMA (m)' }],
    ],
    linhas,
  }
}

function blocosDoPavimento(pav, seNorma, temChuveiros, temDeteccao) {
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS, DISTANCIAS_MAXIMAS } = seNorma
  const acessos = pav.acessos || []
  const ambientes = pav.ambientes || []
  const raizes = acessosFilhos(acessos, null)
  const rotuloRaiz = pav.pisoDescarga ? 'saída' : 'escada/rampa'

  const blocos = [{ tipo: 'titulo2', texto: pav.pisoDescarga ? `${pav.label} (Piso de Descarga)` : pav.label }]

  if (!pav.divisao) {
    blocos.push({ tipo: 'paragrafo', texto: `Ocupação de ${pav.label} ainda não classificada (Etapa de Classificação) — dimensionamento pendente.` })
    return blocos
  }
  if (raizes.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Nenhuma ${rotuloRaiz} cadastrada em ${pav.label} até o momento — árvore de acessos e descargas pendente.` })
    return blocos
  }

  // A tabela de distância máxima da estrutura (ver blocosDaEstrutura) só
  // cobre a referência de saída única — pavimentos com mais de uma saída
  // têm distância admissível maior, avisado aqui (não repete o valor de
  // referência quando a saída já é única, pra não poluir o documento).
  const nSaidas = Math.max(1, contarSaidasPavimento(acessos))
  if (nSaidas > 1) {
    const dist = getDistancia(pav.divisao, !!pav.pisoDescarga, nSaidas, temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS)
    blocos.push({
      tipo: 'campo',
      label: 'Distância máxima aplicável',
      valor: `${pav.label} tem ${nSaidas} saídas — distância máxima a percorrer de ${dist != null ? fmtM(dist) : 'consultar NT (combinação não tabelada)'} (maior que a referência de saída única da tabela acima).`,
    })
  }

  const { organograma, listaAmbientes, nos } = montarArvorePavimento(pav)

  blocos.push({ tipo: 'titulo2', texto: 'Organograma' })
  blocos.push({ tipo: 'organograma', nos: organograma })

  blocos.push({ tipo: 'titulo2', texto: 'Larguras Mínimas' })
  nos.forEach(no => {
    blocos.push(tabelaNo(no, ambientes, acessos, TAXA_POPULACIONAL, LARGURAS_MINIMAS, !!pav.pisoDescarga))
  })
  if (listaAmbientes.length > 0) {
    blocos.push(tabelaAmbientes(listaAmbientes, TAXA_POPULACIONAL, LARGURAS_MINIMAS))
  }

  return blocos
}

function blocosDaEstrutura(est, pavs, seNorma, temChuveiros, temDeteccao) {
  const { DISTANCIAS_MAXIMAS } = seNorma
  const divisoes = [...new Set(pavs.map(p => p.divisao).filter(Boolean))]

  const blocos = [{ tipo: 'titulo2', texto: est.nome || 'Estrutura' }]

  if (divisoes.length > 0) {
    blocos.push({
      tipo: 'tabela',
      centralizado: true,
      linhasCabecalho: [
        [{ texto: 'DISTÂNCIAS MÁXIMA A PERCORRER', colSpan: 3 }],
        [{ texto: 'DIVISÃO' }, { texto: 'ANDAR' }, { texto: `${temChuveiros ? 'COM' : 'SEM'} CHUVEIROS AUTOMÁTICOS · ${temDeteccao ? 'COM' : 'SEM'} DETECÇÃO · SAÍDA ÚNICA` }],
      ],
      linhas: divisoes.flatMap(divisao => [
        [divisao, 'Piso de descarga', fmtDistOuConsultar(getDistancia(divisao, true, 1, temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS))],
        [divisao, 'Demais andares', fmtDistOuConsultar(getDistancia(divisao, false, 1, temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS))],
      ]),
    })
  }

  blocos.push(...pavs.flatMap(pav => blocosDoPavimento(pav, seNorma, temChuveiros, temDeteccao)))
  return blocos
}

function fmtDistOuConsultar(valor) {
  return valor != null ? fmtM(valor) : 'Consultar NT'
}

export function textoMemorialSaidaEmergencia(state, sistemas, porEstrutura) {
  const seNorma = getSE(state.uf)
  const sistemasPorEst = Object.fromEntries((porEstrutura || []).map(pe => [pe.estrutura.id, pe.sistemas]))

  const blocosEstruturas = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    const temChuveiros = !!sistemasPorEst[est.id]?.sprinklers?.ativo
    const temDeteccao  = !!sistemasPorEst[est.id]?.deteccao?.ativo
    return blocosDaEstrutura(est, pavs, seNorma, temChuveiros, temDeteccao)
  })

  const blocos = [
    ...blocosGeneralidades(seNorma.LARGURAS_MINIMAS),
    ...(blocosEstruturas.length > 0
      ? blocosEstruturas
      : [{ tipo: 'paragrafo', texto: 'Nenhum pavimento cadastrado — dimensionamento de saída de emergência pendente.' }]),
  ]

  return { titulo: 'Saída de Emergência', blocos }
}
