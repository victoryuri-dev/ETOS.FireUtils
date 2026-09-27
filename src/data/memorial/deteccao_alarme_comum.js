// memorial/deteccao_alarme_comum.js — blocos compartilhados pelos memoriais de
// Alarme (alarme_incendio.js) e Detecção (deteccao_incendio.js) de Incêndio,
// que seguem a mesma norma (NT 19). Nada aqui repete regra de cálculo: os
// números vêm da norma (getDeteccaoAlarme) e do calc puro
// (deteccao_alarme_calc.js), e o texto só narra o resultado.

import { fmtNum } from '../deteccao_alarme_calc'

export const fmt = (n, c = 2) => fmtNum(n, c)

/** "item 5.3 da NT 19/2021 CBMMA" (ou só a sigla, se a norma não numera o item). */
export function cita(norma, chave, opcoes = {}) {
  const item = norma.ITENS?.[chave]
  const sigla = norma.NORMA.sigla
  return item ? `${opcoes.plural ? 'itens' : 'item'} ${item} da ${sigla}` : sigla
}

export function listaDivisoes(pavs) {
  return [...new Set(pavs.map(p => p.divisao).filter(Boolean))].join(', ') || '—'
}

/** Estruturas com pavimentos em que a medida está ativa/obrigatória. */
export function estruturasDaMedida(state, porEstrutura, chave) {
  const porId = Object.fromEntries((porEstrutura || []).map(pe => [pe.estrutura.id, pe]))
  return (state.estruturas || [])
    .map(est => ({
      est,
      pavs: (state.pavimentos || []).filter(p => p.estruturaId === est.id),
      pe: porId[est.id],
    }))
    .filter(({ pavs, pe }) => pavs.length > 0 && (pe?.sistemas?.[chave]?.ativo || pe?.sistemas?.[chave]?.obrigatorio))
}

export function blocosObjetivoEReferencias(norma, medida) {
  const n = norma.NORMA
  const blocos = [
    { tipo: 'titulo2', texto: 'Objetivo e aplicação' },
    {
      tipo: 'paragrafo',
      texto: medida === 'alarme'
        ? `Este documento descreve o sistema de alarme de incêndio da edificação, destinado a alertar as pessoas sobre a existência de um incêndio em determinada área, possibilitando o seu combate logo que descoberto e propiciando o abandono da edificação sem que os ocupantes sofram qualquer dano. O dimensionamento atende à ${n.sigla} — ${n.nome}, do ${n.orgao}, instituída no âmbito da ${n.lei}, e à ${n.base_tecnica}, e é aplicável às edificações e áreas de risco em que o sistema é exigido.`
        : `Este documento descreve o sistema de detecção de incêndio da edificação, projetado para garantir a detecção de um princípio de incêndio no menor tempo possível, nos termos da ${n.base_tecnica}, de modo a acionar o alarme e possibilitar o combate ao fogo e o abandono seguro da edificação. O dimensionamento atende à ${n.sigla} — ${n.nome}, do ${n.orgao}, instituída no âmbito da ${n.lei}.`,
    },
    { tipo: 'titulo2', texto: 'Referências normativas' },
    {
      tipo: 'lista',
      itens: [
        `${n.sigla} — ${n.nome}`,
        ...(n.complementares || []),
        ...norma.REFERENCIAS.map(r => `${r.codigo} — ${r.titulo}`),
      ],
    },
  ]
  return blocos
}

export function blocosExigibilidade(norma, chave, rotuloMedida, lista) {
  if (lista.length === 0) return []
  return [
    { tipo: 'titulo2', texto: 'Exigibilidade' },
    {
      tipo: 'paragrafo',
      texto: `A exigência do ${rotuloMedida} decorre da ocupação, da altura e da área de cada edificação, conforme as tabelas de medidas de segurança do Regulamento de Segurança Contra Incêndio (${norma.NORMA.lei}) e da NT 01 — Procedimentos administrativos, e está resumida a seguir.`,
    },
    {
      tipo: 'tabela',
      centralizado: true,
      linhasCabecalho: [
        [{ texto: 'EXIGÊNCIA POR EDIFICAÇÃO', colSpan: 6 }],
        [{ texto: 'EDIFICAÇÃO' }, { texto: 'OCUPAÇÃO' }, { texto: 'PAVIMENTOS' }, { texto: 'ALTURA PISO A PISO' }, { texto: 'ÁREA' }, { texto: 'SITUAÇÃO' }],
      ],
      linhas: lista.map(({ est, pavs, pe }) => {
        const s = pe?.sistemas?.[chave]
        const totalPav = (parseInt(est.nPavimentos) || 1) + (parseInt(est.nSubsolos) || 0)
        return [
          est.nome || 'Edificação',
          listaDivisoes(pavs),
          totalPav === 1 ? 'Térrea' : `${totalPav}`,
          est.alturaPisoPiso ? `${fmt(est.alturaPisoPiso)} m` : '—',
          est.areaTotal ? `${fmt(est.areaTotal)} m²` : '—',
          s?.obrigatorio ? 'Exigido' : 'Adotado',
        ]
      }),
    },
  ]
}

export function blocosManutencao(norma) {
  const m = norma.MANUTENCAO || {}
  const blocos = [{ tipo: 'titulo2', texto: 'Manutenção' }]
  blocos.push({
    tipo: 'paragrafo',
    texto: (m.texto || `A manutenção preventiva e corretiva do sistema será realizada por técnicos habilitados e treinados, nos termos da ${norma.NORMA.base_tecnica}.`)
      + (m.periodicidade_preventiva_max_meses ? '' : ` O relatório de manutenção periódica deve permanecer disponível na edificação.`),
  })
  return blocos
}

export function blocosComissionamento(norma, medida) {
  const c = norma.COMISSIONAMENTO
  const blocos = [{ tipo: 'titulo2', texto: 'Comissionamento' }]
  if (!c) {
    blocos.push({
      tipo: 'paragrafo',
      texto: `O sistema será comissionado após a instalação, com a verificação das condições de funcionamento e sinalização de 100% dos equipamentos, nos termos da ${norma.NORMA.base_tecnica}, e a documentação técnica atualizada de acordo com a montagem final será mantida na edificação.`,
    })
    return blocos
  }
  const ref = cita(norma, 'comissionamento')
  blocos.push({
    tipo: 'paragrafo',
    texto: `Todo o sistema instalado será comissionado, com a verificação das condições de funcionamento e sinalização de 100% dos equipamentos, conforme o ${ref}, registrando-se o resultado dos ensaios, assinado pelo instalador, como parte da documentação final de entrega.`,
  })
  const itens = [
    'Verificação da documentação técnica do sistema (manuais, desenhos de instalação e diagrama de interligação, atualizados de acordo com a montagem final).',
  ]
  if (medida === 'deteccao') {
    itens.push(
      `Detectores térmicos e termovelocimétricos: ensaio com ${c.detector_termico_teste}.`,
      `Detectores de fumaça: ensaio com dispositivo de acionamento adequado ou gás de ensaio, com atuação do sinal de alarme na central em no máximo ${c.detector_fumaca_alarme_max_s} s (${c.detector_fumaca_retardo_max_s} s para detectores com retardo).`,
      'Verificação em campo de que todos os detectores estão montados e corretamente posicionados conforme o projeto, sem objetos que bloqueiem sua visão, e de sua ligação, alimentação e configuração.',
    )
  } else {
    itens.push(
      `Acionadores manuais: ativação verificando que a central seja ativada em no máximo ${c.acionador_ativacao_central_max_s} s, indicando corretamente o local ou a linha em alarme.`,
      `Circuitos elétricos: ensaios de circuito aberto, fuga à terra e curto-circuito, com sinalização na central em no máximo ${c.falha_circuito_sinalizada_max_min} min.`,
      `Avisadores: ensaio de atuação (dentro de ${c.avisador_atuacao_max_s} s), de audibilidade e de visibilidade (distância frontal mínima de ${norma.AVISADOR.visibilidade_m} m).`,
      `Central: verificação de cada uma de suas funções, da sinalização padrão (vermelha para alarme, amarela para falha, verde para funcionamento), da memorização dos alarmes e das falhas de alimentação primária, de bateria e de isolação/fuga à terra; área livre mínima de 1 m² em frente à central.`,
      `Fonte de alimentação: energização do circuito de maior consumo por ${c.fonte_principal_teste_min} min, sem falha e com tensão entre 24 e 32 Vcc; conferência dos dados da fonte de emergência conforme a planilha de cálculo da bateria.`,
      `Tempo de resposta de sinalização: atuação dos comandos em até ${c.tempo_resposta_sinalizacao_max_s} s e sinalização de falhas em até ${c.falha_sinalizacao_max_min} min; painel repetidor e/ou sinóptico ensaiados em conjunto com a central.`,
    )
  }
  itens.push(`Após a conclusão satisfatória, serão emitidos ${c.documentos}.`)
  blocos.push({ tipo: 'lista', itens })
  blocos.push({ tipo: 'paragrafo', texto: `O relatório de comissionamento e inspeção será encaminhado ao Corpo de Bombeiros por ocasião da vistoria (${c.relatorio}).` })
  return blocos
}
