// memorial/deteccao_incendio.js — texto do memorial descritivo do Sistema de
// Detecção de Incêndio. Norma e valores vêm de getDeteccaoAlarme(uf) e o
// dimensionamento por pavimento do calc puro (deteccao_alarme_calc.js) — o
// mesmo da tela; o texto só narra o resultado.

import { getDeteccaoAlarme } from '../normas/index'
import {
  TIPOS_DETECTOR, deteccaoDaEstrutura, resumoDeteccaoPavimento, notasAplicaveis, comAreaEfetiva,
} from '../deteccao_alarme_calc'
import {
  fmt, cita, listaDivisoes, estruturasDaMedida, blocosObjetivoEReferencias, blocosExigibilidade,
  blocosComissionamento, blocosManutencao,
} from './deteccao_alarme_comum'

const ROTULO_TIPO = Object.fromEntries(TIPOS_DETECTOR.map(t => [t.key, t.label]))

function refDetector(norma, tipo) {
  const item = norma.DETECTORES.tipos[tipo]?.item
  return item ? ` (${item.startsWith('NBR') ? item : `item ${item} da ${norma.NORMA.sigla}`})` : ''
}

// Regras normativas dos tipos de detector efetivamente adotados no projeto.
function blocosRegrasDoTipo(norma, tipo) {
  const d = norma.DETECTORES
  const t = d.tipos[tipo]
  if (!t) return []
  const ref = refDetector(norma, tipo)
  if (tipo === 'fumaca_pontual') {
    return [{
      tipo: 'paragrafo',
      texto: `Detectores pontuais de fumaça${ref}: ${t.indicacao} A área máxima de cobertura, em ambiente livre e desobstruído, com teto plano ou com vigas de até ${fmt(t.viga_max_sem_reducao_m)} m, a até ${t.altura_max_m} m de altura e com até ${t.trocas_ar_max_sem_reducao} trocas de ar por hora, é de ${t.area_max_m2} m² (quadrado de ${t.lado_m} m de lado inscrito em círculo de raio ${fmt(t.raio_m, 1)} m). Ficam no teto, a no mínimo ${fmt(t.afastamento_parede_min_m)} m de paredes e vigas (em casos justificados, na parede a ${fmt(t.parede_faixa_teto_m[0])} m a ${fmt(t.parede_faixa_teto_m[1])} m do teto). Para vigas de ${fmt(d.reducao_viga[0].min_m)} m a ${fmt(d.reducao_viga[0].max_m)} m a área de cobertura é reduzida para ${d.reducao_viga[0].texto}, e acima de ${fmt(d.reducao_viga[1].min_m)} m para a ${d.reducao_viga[1].texto}, salvo quando houver ao menos um detector em cada caixa formada pelas vigas. Em áreas irregulares, nenhum ponto do teto fica a mais de ${fmt(t.raio_m, 1)} m de um detector.`,
    }]
  }
  if (tipo === 'temperatura_pontual') {
    return [{
      tipo: 'paragrafo',
      texto: `Detectores pontuais de temperatura${ref}: ${t.indicacao} A área máxima de cobertura, em teto plano ou com vigas de até ${fmt(t.viga_max_sem_reducao_m)} m, a até ${t.altura_max_m} m de altura, é de ${t.area_max_m2} m² (quadrado de ${t.lado_m} m de lado inscrito em círculo de raio ${fmt(t.raio_m, 1)} m). Em tetos com altura superior a ${t.altura_max_m} m, o espaçamento é reduzido conforme a tabela da norma, com interpolação para alturas intermediárias (${d.espacamento_altura_temperatura.map(l => `${fmt(l.altura_m, 1)} m: ${fmt(l.espacamento_m, 1)} m`).join('; ')}). A temperatura de atuação é selecionada de acordo com a temperatura máxima do teto, conforme a tabela da norma.`,
    }]
  }
  if (tipo === 'fumaca_linear') {
    return [{
      tipo: 'paragrafo',
      texto: `Detectores lineares de fumaça${ref}: ${t.indicacao} Os feixes de luz são projetados paralelamente ao teto, com distância entre emissor e receptor/refletor limitada à máxima do fabricante e nunca superior a ${t.dist_emissor_receptor_max_m} m, distância entre feixes adjacentes não superior a ${t.dist_entre_feixes_max_m} m, e afastamento de paredes de até a metade dessa distância (no máximo ${fmt(t.dist_parede_max_m, 1)} m). A distância ao teto segue o fabricante ou, na falta, entre ${fmt(t.dist_teto_recomendada_m[0], 1)} m e ${fmt(t.dist_teto_recomendada_m[1], 1)} m.`,
    }]
  }
  if (tipo === 'temperatura_linear') {
    return [{ tipo: 'paragrafo', texto: `Detectores lineares de temperatura${ref}: ${t.indicacao}` }]
  }
  if (tipo === 'chama') {
    return [{
      tipo: 'paragrafo',
      texto: `Detectores de chama${ref}: ${t.indicacao} A localização, o espaçamento e o tipo resultam de análise do risco (finalidade do sistema, materiais combustíveis, outras fontes de radiação, campo de visão, sensibilidade, distância à provável chama e tempo de resposta), com cobertura sem pontos encobertos e redução de ${t.reducao_extremos_campo_visao_pct}% da sensibilidade nos extremos do campo de visão quando não definida pelo fabricante.`,
    }]
  }
  return []
}

function blocosEstrutura(norma, { est, pavs: pavsBrutos }) {
  const pavs = comAreaEfetiva(pavsBrutos, est)
  const cfg = deteccaoDaEstrutura(est)
  const nrm = norma.NORMA
  const blocos = [{ tipo: 'titulo2', texto: est.nome || 'Edificação' }]

  const linhas = pavs.map(pav => ({ pav, r: resumoDeteccaoPavimento(pav, norma.DETECTORES) }))
  const total = linhas.reduce((s, { r }) => s + (r.qtdAdotada || 0), 0)

  blocos.push({
    tipo: 'tabela',
    centralizado: true,
    linhasCabecalho: [
      [{ texto: 'DETECTORES POR PAVIMENTO', colSpan: 8 }],
      [{ texto: 'PAVIMENTO' }, { texto: 'OCUPAÇÃO' }, { texto: 'ÁREA' }, { texto: 'TIPO DE DETECTOR' }, { texto: 'PÉ-DIREITO' }, { texto: 'VIGA' }, { texto: 'ÁREA POR DETECTOR' }, { texto: 'QUANTIDADE' }],
    ],
    linhas: [
      ...linhas.map(({ pav, r }) => [
        pav.label, pav.divisao || '—', pav.area ? `${fmt(pav.area)} m²` : '—',
        ROTULO_TIPO[r.tipo] || r.tipo,
        r.porArea && r.peDireito ? `${fmt(r.peDireito)} m` : '—',
        r.porArea ? (r.viga ? `${fmt(r.viga)} m` : 'até 0,20 m') : '—',
        r.porArea && r.areaDetector ? `${fmt(r.areaDetector, 1)} m²` : '—',
        r.qtdAdotada != null ? String(r.qtdAdotada) : 'a definir',
      ]),
      ['TOTAL', '', '', '', '', '', '', String(total)],
    ],
  })

  const obs = []
  linhas.forEach(({ pav, r }) => {
    if (r.areaSubstituida) obs.push(`${pav.label}: adotada área de cobertura de ${fmt(r.areaDetector, 1)} m² por detector, diferente da calculada pela norma (${fmt(r.cobertura.areaMax, 1)} m²), conforme a especificação do detector e a justificativa do projeto.`)
    r.alertas.forEach(a => obs.push(`${pav.label}: ${a}`))
    if (r.obs) obs.push(`${pav.label}: ${r.obs}`)
  })
  obs.forEach(texto => blocos.push({ tipo: 'paragrafo', texto }))

  if (cfg.entreforros) {
    blocos.push({
      tipo: 'paragrafo',
      texto: `Por haver entreforros/entrepisos com instalações de materiais combustíveis${cfg.entreforrosDescricao ? ` (${cfg.entreforrosDescricao})` : ''}, são instalados detectores nesses espaços (${cita(norma, 'entreforros')}).`,
    })
  }
  if (cfg.arCondicionado) {
    blocos.push({
      tipo: 'paragrafo',
      texto: 'Em ambientes com ar-condicionado ou ventilação forçada, adicionam-se detectores próximos aos retornos do fluxo, evitando-se a instalação de detectores pontuais a menos de 1,50 m da borda dos pontos de insuflamento; o sistema de detecção funciona com e sem a ventilação ligada.',
    })
  }
  const { especificas } = notasAplicaveis(norma, pavs.map(p => p.divisao))
  especificas.forEach(n => blocos.push({ tipo: 'paragrafo', texto: `Ocupação ${listaDivisoes(pavs)} — item ${n.item} da ${nrm.sigla}: ${n.texto}` }))
  return blocos
}

export function textoMemorialDeteccaoIncendio(state, sistemas, porEstrutura) {
  const norma = getDeteccaoAlarme(state.uf)
  const lista = estruturasDaMedida(state, porEstrutura, 'deteccao')
  const d = norma.DETECTORES

  // Tipos de detector realmente adotados no projeto
  const tipos = [...new Set(lista.flatMap(({ pavs }) => pavs.map(p => resumoDeteccaoPavimento(p, d).tipo)))]

  const concepcao = [
    { tipo: 'titulo2', texto: 'Concepção do sistema' },
    {
      tipo: 'paragrafo',
      texto: `O sistema de detecção é composto por central de detecção e alarme, detectores automáticos de incêndio distribuídos por pavimento e acionadores manuais, interligados ao sistema de alarme descrito neste memorial, de modo a garantir a detecção de um princípio de incêndio no menor tempo possível (${cita(norma, 'projeto')}). ${d.fonte ? `Os parâmetros de cobertura e de posicionamento dos detectores seguem ${d.fonte}.` : ''}`,
    },
    { tipo: 'paragrafo', texto: `Onde há sistema de detecção instalado, os acionadores manuais são obrigatórios (${cita(norma, 'acionador_com_deteccao')}).` },
    ...d.regras.map(texto => ({ tipo: 'paragrafo', texto })),
    ...(tipos.length > 0 ? [{ tipo: 'titulo2', texto: 'Tipos de detector adotados' }, ...tipos.flatMap(t => blocosRegrasDoTipo(norma, t))] : []),
  ]

  const blocos = [
    ...blocosObjetivoEReferencias(norma, 'deteccao'),
    ...blocosExigibilidade(norma, 'deteccao', 'sistema de detecção de incêndio', lista),
    ...concepcao,
    ...(lista.length > 0
      ? [{ tipo: 'titulo2', texto: 'Dimensionamento por edificação' }, ...lista.flatMap(item => blocosEstrutura(norma, item))]
      : [{ tipo: 'paragrafo', texto: 'Nenhuma edificação com o sistema de detecção exigido ou adotado até o momento.' }]),
    ...blocosComissionamento(norma, 'deteccao'),
    ...blocosManutencao(norma),
  ]
  return { titulo: 'Detecção de Incêndio', blocos }
}
