// memorial/compartimentacao.js — texto do memorial descritivo para
// Compartimentação Horizontal e Compartimentação Vertical (NT 09 CBMMA).
// Usa os MESMOS calcs puros (compart_calc.js) que alimentam a tela de
// dimensionamento — o texto nunca duplica a lógica de classificação/área
// máxima, só narra o resultado. Mantido enxuto de propósito: só o que o
// Corpo de Bombeiros precisa para analisar o projeto.
//
// Regra geral: só entram tabela, TRRF, elementos de proteção e condições
// especiais quando a compartimentação é EXIGIDA e NÃO ISENTA (nem por
// substituição por sistema alternativo, nem — só a horizontal — por a
// edificação já se enquadrar num único compartimento). Sendo isenta por uma
// dessas condições/notas específicas, a seção vira só a frase explicando o
// motivo. Já quando a dispensa é simplesmente a norma não exigir a medida
// pra esta estrutura (Tabela 6 não exige pra esta ocupação/altura, ou
// processo simplificado — Tabela 5, que nunca exige) a estrutura nem é
// citada nesta seção do memorial.

import { calcularAreaMaximaCompartimentacao } from '../compart_calc'
import { getCompartimentacao } from '../normas/index'
import { fmtUn } from '../../utils/numero'

function labelsMarcados(catalogo, chaves) {
  return catalogo.filter(o => (chaves || []).includes(o.key)).map(o => o.label || o.texto)
}

function textosCondicoes(catalogo, chaves) {
  return catalogo.filter(o => (chaves || []).includes(o.key)).map(o => `${o.texto} (item ${o.ref})`)
}

function fmtArea(valor) {
  return typeof valor === 'number' ? fmtUn(valor, 'm²') : 'sem limite definido'
}
const m2 = v => fmtUn(v, 'm²', 2, `${v} m²`)

// Caso a norma exija a medida mas o responsável técnico tenha desativado o
// toggle manualmente em Configuração (useMedidasObrigatorias: `ativo` segue
// o override quando ele existe) — nunca narrar isso como "dispensada pela
// norma", que seria factualmente errado: a norma exige, a desativação foi
// uma decisão do RT, sob sua responsabilidade.
function textoDesativadaManualmente(medida, pe) {
  const divisoes = pe?.divisoes?.length ? pe.divisoes.join(', ') : 'desta estrutura'
  const altura = pe?.alturaEstrutura ? `${pe.alturaEstrutura} m` : 'atual'
  return `${medida} desativada manualmente pelo responsável técnico nesta estrutura. A NT 01 CBMMA exige ${medida.toLowerCase()} para a(s) divisão(ões) ${divisoes} na altura de ${altura} — a desativação é uma decisão do responsável técnico, sob sua responsabilidade, e deve ser justificada tecnicamente perante o Corpo de Bombeiros.`
}

// Único parágrafo mostrado quando a edificação se enquadra inteira num
// único compartimento (nenhum pavimento excede a área máxima do Anexo B, e
// todos já têm área informada — `r.dentroDoLimite`) — cita a área
// considerada e a área máxima de cada pavimento, sem repetir a tabela.
function textoDentroDoLimite(r) {
  if (r.linhas.length === 1) {
    const l = r.linhas[0]
    return `Compartimentação horizontal dispensada: a área de compartimentação considerada (${m2(l.area)}) está dentro da área máxima de compartimentação permitida (${fmtArea(l.valor)}) para a divisão ${l.pavimento.divisao} no Tipo ${r.tipo} — ${r.tipoNome} (Anexo B, NT 09 CBMMA), de modo que a edificação se enquadra em um único compartimento.`
  }
  const porPavimento = r.linhas.map(l => `${l.pavimento.label}: ${m2(l.area)} (máximo ${fmtArea(l.valor)})`).join('; ')
  return `Compartimentação horizontal dispensada: a área de compartimentação considerada de todos os pavimentos está dentro da área máxima de compartimentação permitida no Tipo ${r.tipo} — ${r.tipoNome} (Anexo B, NT 09 CBMMA), de modo que a edificação se enquadra em um único compartimento — ${porPavimento}.`
}

export function textoMemorialCompartHorizontal(state, sistemas, porEstrutura) {
  const blocos = []
  const { TABELA_AREA_MAXIMA, CLASSES_TIPO_EDIFICACAO, ELEMENTOS_COMPART_HORIZONTAL, CONDICOES_ESPECIAIS_HORIZONTAL, SUBSTITUICOES_COMPARTIMENTACAO, TRRF_MINIMO_PAREDE_COMPARTIMENTACAO, TRRF_REDUCAO_MAXIMA_ABERTURAS } = getCompartimentacao(state.uf)

  ;(state.estruturas || []).forEach(est => {
    // `ativo` já respeita o toggle manual de Configuração (useMedidasObrigatorias);
    // `obrigatorioPelaNorma` é o que a Tabela 5/6 exige por si só, sem o
    // override.
    const pe = porEstrutura?.find(p => p.estrutura.id === est.id)
    const sistemaPE = pe?.sistemas?.compart_horizontal
    const ativo = sistemaPE ? !!sistemaPE.ativo : !!sistemas?.compart_horizontal?.ativo
    const obrigatorioPelaNorma = sistemaPE ? !!sistemaPE.obrigatorio : !!sistemas?.compart_horizontal?.obrigatorio

    // A norma simplesmente não exige esta medida pra esta estrutura — nem
    // pela Tabela 6 (ocupação/altura não pedem) nem pelo processo
    // simplificado (Tabela 5, que nunca exige compartimentação). Não é uma
    // isenção por nota/condição específica, então nem cita a estrutura
    // nesta seção do memorial.
    if (!ativo && !obrigatorioPelaNorma) return

    blocos.push({ tipo: 'titulo2', texto: est.nome || 'Estrutura' })

    if (!ativo) {
      // Aqui obrigatorioPelaNorma é true: a norma exige, mas o RT desativou
      // manualmente — isso precisa constar e ser justificado, nunca
      // narrado como "dispensada pela norma".
      blocos.push({
        tipo: 'paragrafo',
        texto: textoDesativadaManualmente('Compartimentação horizontal', pe),
      })
      return
    }

    const substituicao = SUBSTITUICOES_COMPARTIMENTACAO.find(o => o.key === est.isencaoCompartHorizontal)
    if (substituicao) {
      blocos.push({
        tipo: 'paragrafo',
        texto: `Compartimentação horizontal isenta mediante adoção de ${substituicao.texto}, conforme nota de rodapé da Tabela 6 aplicável ao grupo/altura desta estrutura (NT 01 CBMMA).`,
      })
      return
    }

    const pavimentos = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    const r = calcularAreaMaximaCompartimentacao(pavimentos, est, TABELA_AREA_MAXIMA, CLASSES_TIPO_EDIFICACAO, state.areaCompartimentacaoHorizontal)

    if (!r.tipo) {
      blocos.push({ tipo: 'paragrafo', texto: `Altura de ${est.nome} ainda não informada — tipo de edificação (Anexo B, NT 09 CBMMA) e área máxima de compartimentação pendentes de definição.` })
      return
    }

    if (r.dentroDoLimite) {
      blocos.push({ tipo: 'paragrafo', texto: textoDentroDoLimite(r) })
      return
    }

    // A partir daqui a compartimentação horizontal é exigida de fato (não
    // isenta por nenhum meio) — mostra tipo, tabela, TRRF, elementos e
    // condições por completo.
    blocos.push({ tipo: 'campo', label: 'Tipo de edificação (Anexo B, NT 09 CBMMA)', valor: `Tipo ${r.tipo} — ${r.tipoNome}` })

    if (r.linhas.length > 0) {
      blocos.push({
        tipo: 'tabela',
        colunas: ['Pavimento', 'Divisão', 'Área do pavimento', 'Área de compartimentação (item 5.1.2)', 'Área máxima permitida', 'Situação'],
        linhas: r.linhas.map(l => [
          l.pavimento.label,
          l.pavimento.divisao || '—',
          l.areaPavimento ? m2(l.areaPavimento) : '—',
          l.area ? `${m2(l.area)}${l.overrideAtivo ? ' (com interligação declarada)' : ''}` : '—',
          !l.encontrado ? '—' : fmtArea(l.valor),
          !l.area ? 'Pendente' : l.excede ? 'Excede — subdividir compartimento' : 'Conforme',
        ]),
      })
    }

    if (r.pavimentosExcedentes.length > 0) {
      blocos.push({
        tipo: 'lista', estilo: 'alerta',
        itens: r.pavimentosExcedentes.map(l => `ATENÇÃO: ${l.pavimento.label} (${m2(l.area)}) excede a área máxima de compartimentação (${fmtArea(l.valor)}) para a divisão ${l.pavimento.divisao} no Tipo ${r.tipo} — subdividir em mais de um compartimento ou substituir por sistema alternativo (chuveiros automáticos e/ou detecção de incêndio, conforme nota de rodapé da Tabela 6 da NT 01 CBMMA aplicável).`),
      })
    }

    blocos.push({ tipo: 'campo', label: 'TRRF mínimo da parede de compartimentação', valor: `EI-${TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} (portas/vedadores/registros podem ter até ${TRRF_REDUCAO_MAXIMA_ABERTURAS} min a menos, nunca abaixo de ${TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min)` })

    const elementos = labelsMarcados(ELEMENTOS_COMPART_HORIZONTAL, est.elementosCompartHorizontal)
    if (elementos.length > 0) {
      blocos.push({ tipo: 'lista', itens: elementos })
    } else {
      blocos.push({ tipo: 'paragrafo', texto: 'Elementos de proteção adotados ainda não informados pelo responsável técnico.' })
    }

    const condicoes = textosCondicoes(CONDICOES_ESPECIAIS_HORIZONTAL, est.condicoesEspeciaisCompartHorizontal)
    if (condicoes.length > 0) {
      blocos.push({ tipo: 'campo', label: 'Condições especiais aplicáveis', valor: condicoes.join('; ') })
    }

    if (est.obsCompartimentacao?.trim()) {
      blocos.push({ tipo: 'campo', label: 'Observações do responsável técnico', valor: est.obsCompartimentacao.trim() })
    }
  })

  if (blocos.length === 0) {
    blocos.push({
      tipo: 'paragrafo',
      texto: (state.estruturas || []).length > 0
        ? 'Compartimentação horizontal não exigida pela NT 01 CBMMA (Tabela 5 ou 6, conforme o processo aplicável a cada estrutura) para nenhuma estrutura deste projeto.'
        : 'Não há estruturas cadastradas no projeto.',
    })
  }

  return { titulo: 'Compartimentação Horizontal', blocos }
}

export function textoMemorialCompartVertical(state, sistemas, porEstrutura) {
  const blocos = []
  const { ELEMENTOS_COMPART_VERTICAL, CONDICOES_ESPECIAIS_VERTICAL, SUBSTITUICOES_COMPARTIMENTACAO, TRRF_MINIMO_PAREDE_COMPARTIMENTACAO, TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR } = getCompartimentacao(state.uf)

  ;(state.estruturas || []).forEach(est => {
    const pe = porEstrutura?.find(p => p.estrutura.id === est.id)
    const sistemaPE = pe?.sistemas?.compart_vertical
    const ativo = sistemaPE ? !!sistemaPE.ativo : !!sistemas?.compart_vertical?.ativo
    const obrigatorioPelaNorma = sistemaPE ? !!sistemaPE.obrigatorio : !!sistemas?.compart_vertical?.obrigatorio

    // Mesma regra da horizontal: dispensa pura pela norma (Tabela 5 ou 6)
    // não cita a estrutura nesta seção.
    if (!ativo && !obrigatorioPelaNorma) return

    blocos.push({ tipo: 'titulo2', texto: est.nome || 'Estrutura' })

    if (!ativo) {
      blocos.push({
        tipo: 'paragrafo',
        texto: textoDesativadaManualmente('Compartimentação vertical', pe),
      })
      blocos.push({ tipo: 'paragrafo', texto: 'Atenção (item 6.1.1, NT 09 CBMMA): a inexistência ou a quebra da compartimentação vertical, por qualquer meio, implica na somatória das áreas dos pavimentos interligados para fins de cálculo da área máxima de compartimentação horizontal.' })
      return
    }

    const substituicaoV = SUBSTITUICOES_COMPARTIMENTACAO.find(o => o.key === est.isencaoCompartVertical)
    if (substituicaoV) {
      blocos.push({
        tipo: 'paragrafo',
        texto: `Compartimentação vertical isenta mediante adoção de ${substituicaoV.texto}, conforme nota de rodapé da Tabela 6 aplicável ao grupo/altura desta estrutura (NT 01 CBMMA). A compartimentação das fachadas e a selagem dos shafts e dutos de instalações continuam exigidas, independentemente da substituição.`,
      })
      return
    }

    // A partir daqui a compartimentação vertical é exigida de fato (não
    // isenta por substituição) — mostra elementos, condições e TRRF.
    const elementos = labelsMarcados(ELEMENTOS_COMPART_VERTICAL, est.elementosCompartVertical)
    if (elementos.length > 0) {
      blocos.push({ tipo: 'lista', itens: elementos })
    } else {
      blocos.push({ tipo: 'paragrafo', texto: 'Elementos de proteção adotados ainda não informados pelo responsável técnico.' })
    }

    const condicoes = textosCondicoes(CONDICOES_ESPECIAIS_VERTICAL, est.condicoesEspeciaisCompartVertical)
    if (condicoes.length > 0) {
      blocos.push({ tipo: 'campo', label: 'Condições especiais aplicáveis', valor: condicoes.join('; ') })
    }

    blocos.push({ tipo: 'campo', label: 'TRRF mínimo dos entrepisos', valor: `EI-${TRRF_MINIMO_PAREDE_COMPARTIMENTACAO}` })
    blocos.push({ tipo: 'campo', label: 'TRRF mínimo do enclausuramento de escadas e elevadores de segurança', valor: `EI-${TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR}` })
  })

  if (blocos.length === 0) {
    blocos.push({
      tipo: 'paragrafo',
      texto: (state.estruturas || []).length > 0
        ? 'Compartimentação vertical não exigida pela NT 01 CBMMA (Tabela 5 ou 6, conforme o processo aplicável a cada estrutura) para nenhuma estrutura deste projeto.'
        : 'Não há estruturas cadastradas no projeto.',
    })
  }

  return { titulo: 'Compartimentação Vertical', blocos }
}
