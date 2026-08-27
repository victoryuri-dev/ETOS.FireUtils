// memorial/compartimentacao.js — texto do memorial descritivo para
// Compartimentação Horizontal e Compartimentação Vertical (NT 09 CBMMA).
// Usa os MESMOS calcs puros (compart_calc.js) que alimentam a tela de
// dimensionamento — o texto nunca duplica a lógica de classificação/área
// máxima, só narra o resultado. Mantido enxuto de propósito: só o que o
// Corpo de Bombeiros precisa para analisar o projeto (obrigatoriedade,
// área máxima x adotada, TRRF mínimo e solução construtiva) — sem repetir
// o texto integral da norma.

import { calcularAreaMaximaCompartimentacao } from '../compart_calc'
import { getCompartimentacao } from '../normas/index'

function labelsMarcados(catalogo, chaves) {
  return catalogo.filter(o => (chaves || []).includes(o.key)).map(o => o.label || o.texto)
}

function textosCondicoes(catalogo, chaves) {
  return catalogo.filter(o => (chaves || []).includes(o.key)).map(o => `${o.texto} (item ${o.ref})`)
}

function dispensadaBloco(nomeEst) {
  return { tipo: 'paragrafo', texto: `${nomeEst}: dispensada para a ocupação e altura atuais desta estrutura, conforme a Tabela 5 (simplificada) ou 6 (normal) aplicável da NT 01 CBMMA.` }
}

export function textoMemorialCompartHorizontal(state, sistemas, porEstrutura) {
  const blocos = []
  const { TABELA_AREA_MAXIMA, CLASSES_TIPO_EDIFICACAO, ELEMENTOS_COMPART_HORIZONTAL, CONDICOES_ESPECIAIS_HORIZONTAL, TRRF_MINIMO_PAREDE_COMPARTIMENTACAO, TRRF_REDUCAO_MAXIMA_ABERTURAS } = getCompartimentacao(state.uf)

  ;(state.estruturas || []).forEach(est => {
    // Obrigatoriedade por estrutura (useMedidasObrigatorias) — cai para o
    // agregado do projeto (`sistemas`) só se `porEstrutura` não foi repassado.
    const pe = porEstrutura?.find(p => p.estrutura.id === est.id)
    const obrigatorio = pe ? !!pe.medidas?.compart_horizontal : !!sistemas?.compart_horizontal?.obrigatorio
    blocos.push({ tipo: 'titulo2', texto: est.nome || 'Estrutura' })

    if (!obrigatorio) {
      blocos.push(dispensadaBloco(est.nome || 'Esta estrutura'))
      return
    }

    const pavimentos = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    const r = calcularAreaMaximaCompartimentacao(pavimentos, est, TABELA_AREA_MAXIMA, CLASSES_TIPO_EDIFICACAO)

    if (!r.tipo) {
      blocos.push({ tipo: 'paragrafo', texto: `Altura de ${est.nome} ainda não informada — tipo de edificação (Anexo B, NT 09 CBMMA) e área máxima de compartimentação pendentes de definição.` })
    } else {
      blocos.push({ tipo: 'campo', label: 'Tipo de edificação (Anexo B, NT 09 CBMMA)', valor: `Tipo ${r.tipo} — ${r.tipoNome}` })

      if (r.linhas.length > 0) {
        blocos.push({
          tipo: 'tabela',
          colunas: ['Pavimento', 'Divisão', 'Área do pavimento', 'Área máxima permitida', 'Situação'],
          linhas: r.linhas.map(l => [
            l.pavimento.label,
            l.pavimento.divisao || '—',
            l.area ? `${l.area} m²` : '—',
            !l.encontrado ? '—' : typeof l.valor === 'number' ? `${l.valor} m²` : 'sem limite (item 5.5 ss.)',
            !l.area ? 'Pendente' : l.excede ? 'Excede — subdividir compartimento' : 'Conforme',
          ]),
        })
      }

      if (r.pavimentosExcedentes.length > 0) {
        blocos.push({
          tipo: 'lista', estilo: 'alerta',
          itens: r.pavimentosExcedentes.map(l => `ATENÇÃO: ${l.pavimento.label} (${l.area} m²) excede a área máxima de compartimentação (${l.valor} m²) para a divisão ${l.pavimento.divisao} no Tipo ${r.tipo} — subdividir em mais de um compartimento ou obter isenção por NT específica.`),
        })
      }
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
    blocos.push({ tipo: 'paragrafo', texto: 'Não há estruturas cadastradas no projeto.' })
  }

  return { titulo: 'Compartimentação Horizontal', blocos }
}

export function textoMemorialCompartVertical(state, sistemas, porEstrutura) {
  const blocos = []
  const { ELEMENTOS_COMPART_VERTICAL, CONDICOES_ESPECIAIS_VERTICAL, TRRF_MINIMO_PAREDE_COMPARTIMENTACAO, TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR } = getCompartimentacao(state.uf)

  ;(state.estruturas || []).forEach(est => {
    const pe = porEstrutura?.find(p => p.estrutura.id === est.id)
    const obrigatorio = pe ? !!pe.medidas?.compart_vertical : !!sistemas?.compart_vertical?.obrigatorio
    blocos.push({ tipo: 'titulo2', texto: est.nome || 'Estrutura' })

    if (!obrigatorio) {
      blocos.push(dispensadaBloco(est.nome || 'Esta estrutura'))
      blocos.push({ tipo: 'paragrafo', texto: 'Atenção (item 6.1.1, NT 09 CBMMA): a inexistência ou a quebra da compartimentação vertical, por qualquer meio, implica na somatória das áreas dos pavimentos interligados para fins de cálculo da área máxima de compartimentação horizontal.' })
      return
    }

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
    blocos.push({ tipo: 'paragrafo', texto: 'Não há estruturas cadastradas no projeto.' })
  }

  return { titulo: 'Compartimentação Vertical', blocos }
}
