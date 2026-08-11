// memorial/iluminacao.js — texto do memorial descritivo para o Sistema de
// Iluminação de Emergência (NT 18 CBMMA / NBR 10898). Usa o MESMO calc puro
// (iluminacao_calc.js) que alimenta a tela de dimensionamento — o texto
// nunca duplica a lógica de conformidade, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de parágrafos corridos —
// mesmo padrão do memorial de Extintores.

import { getIluminacao } from '../normas/index'
import { calcularAclaramento, calcularBalizamento, nomeEspecificacao } from '../iluminacao_calc'

function blocosDoPavimento(pav, itensPav, balizamentoAplicado, equipamentosUsados, equipamentosSpec, norma) {
  const { ILUMINANCIA_MINIMA, FATOR_UTILIZACAO_ACLARAMENTO, PONTOS_BALIZAMENTO } = norma
  const itensAclaramento = itensPav.filter(i => i.categoria === 'aclaramento')
  const itensBalizamento = itensPav.filter(i => i.categoria === 'balizamento')
  const blocos = [{ tipo: 'titulo2', texto: pav.label }]

  if (itensAclaramento.length > 0) {
    const aclar = calcularAclaramento(itensAclaramento, pav.area, {
      equipamentos: equipamentosSpec,
      iluminanciaMinima: ILUMINANCIA_MINIMA.aclaramento_normal,
      fatorUtilizacao: FATOR_UTILIZACAO_ACLARAMENTO,
    })
    blocos.push({
      tipo: 'tabela',
      colunas: ['Equipamento', 'Qtd.'],
      linhas: itensAclaramento.map(i => {
        const eq = equipamentosUsados.find(e => e.key === i.tipoEquipamento)
        return [eq?.label || i.tipoEquipamento, String(i.quantidade || 0)]
      }),
    })
    blocos.push({ tipo: 'campo', label: 'Aclaramento', valor: `${aclar.areaCobertaTotal.toFixed(1)} m² cobertos / ${aclar.area.toFixed(1)} m² do pavimento` })
    if (!aclar.minimoAtendido) {
      blocos.push({ tipo: 'lista', estilo: 'alerta', itens: [`${pav.label}: a área coberta pelas luminárias de aclaramento cadastradas é inferior à área do pavimento.`] })
    }
  } else {
    blocos.push({ tipo: 'paragrafo', texto: `Nenhuma luminária de aclaramento cadastrada em ${pav.label}.` })
  }

  // Balizamento narra a resposta explícita à pergunta "foi aplicado?" —
  // distingue "não aplicado" (decisão do projetista) de "ainda não
  // respondido" (pendência), em vez de tratar os dois como ausência de dado.
  if (balizamentoAplicado === false) {
    blocos.push({ tipo: 'paragrafo', texto: `Não foram aplicadas luminárias de balizamento em ${pav.label}.` })
  } else if (balizamentoAplicado === true && itensBalizamento.length > 0) {
    const baliz = calcularBalizamento(itensBalizamento, PONTOS_BALIZAMENTO)
    blocos.push({
      tipo: 'tabela',
      colunas: ['Ponto de balizamento', 'Qtd.'],
      linhas: PONTOS_BALIZAMENTO
        .filter(p => baliz.porPonto[p.key] > 0)
        .map(p => [p.label, String(baliz.porPonto[p.key])]),
    })
  } else if (balizamentoAplicado === true) {
    blocos.push({ tipo: 'paragrafo', texto: `Balizamento aplicado em ${pav.label}, mas as quantidades por ponto ainda não foram cadastradas.` })
  } else {
    blocos.push({ tipo: 'paragrafo', texto: `Pendente de definição: ainda não foi informado se há luminárias de balizamento em ${pav.label}.` })
  }

  return blocos
}

export function textoMemorialIluminacao(state) {
  const norma = getIluminacao(state.uf)
  const { ILUMINANCIA_MINIMA, RAZAO_UNIFORMIDADE_MAX, AUTONOMIA_MINIMA_HORAS, TEMPO_RESPOSTA_MAX_S, TIPOS_SISTEMA, EQUIPAMENTOS_ACLARAMENTO, CAMPOS_EQUIPAMENTO } = norma
  const sistema = state.iluminacaoSistema || {}
  const especificacoes = sistema.especificacoes || []

  // Uma opção por especificação cadastrada (não por tipo base) — rotulada
  // com o fluxo luminoso para diferenciar variantes do mesmo equipamento,
  // mesmo critério usado em IluminacaoPage.jsx.
  const equipamentosUsados = especificacoes.map(spec => {
    const base = EQUIPAMENTOS_ACLARAMENTO.find(eq => eq.key === spec.tipoBase)
    return { key: spec.id, label: nomeEspecificacao(spec, base?.label || spec.tipoBase) }
  })
  const equipamentosSpec = Object.fromEntries(especificacoes.map(spec => [spec.id, spec]))

  const blocos = [{
    tipo: 'paragrafo',
    texto: `A iluminação de emergência deve garantir iluminância mínima de ${ILUMINANCIA_MINIMA.aclaramento_normal} lux nos ambientes em geral (${ILUMINANCIA_MINIMA.aclaramento_risco} lux em áreas de risco elevado ou grande concentração de público) e de ${ILUMINANCIA_MINIMA.balizamento} lux no eixo dos percursos de saída, com uniformidade máxima de ${RAZAO_UNIFORMIDADE_MAX}:1, autonomia mínima de bateria de ${AUTONOMIA_MINIMA_HORAS} hora e tempo de resposta de no máximo ${TEMPO_RESPOSTA_MAX_S} segundos após a falta de energia da rede normal (NBR 10898 / NT 18 CBMMA).`,
  }]

  const tipoSistemaInfo = TIPOS_SISTEMA.find(t => t.key === sistema.tipo)
  if (tipoSistemaInfo) {
    const precisaLocalizacao = sistema.tipo === 'central' || sistema.tipo === 'motogerador'
    blocos.push({
      tipo: 'paragrafo',
      texto: `O sistema adotado no projeto é do tipo ${tipoSistemaInfo.label.toLowerCase()}.` +
        (precisaLocalizacao
          ? ` A fonte do sistema (${sistema.tipo === 'motogerador' ? 'grupo motogerador' : 'central de baterias'}) está localizada em ${sistema.localizacaoFonte || 'local a definir pelo responsável técnico'}.`
          : ''),
    })
  } else {
    blocos.push({ tipo: 'paragrafo', texto: 'O sistema de iluminação de emergência utilizado no projeto ainda não foi definido pelo responsável técnico.' })
  }

  if (equipamentosUsados.length > 0) {
    blocos.push({ tipo: 'titulo2', texto: 'Características dos equipamentos' })
    blocos.push({
      tipo: 'tabela',
      colunas: ['Equipamento', ...CAMPOS_EQUIPAMENTO.map(c => c.unidade ? `${c.label} (${c.unidade})` : c.label)],
      linhas: equipamentosUsados.map(eq => [
        eq.label,
        ...CAMPOS_EQUIPAMENTO.map(c => equipamentosSpec[eq.key]?.[c.key] || '—'),
      ]),
    })
  }

  const balizamentoAplicadoMap = state.iluminacaoBalizamentoAplicado || {}
  const blocosPavimentos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    return [
      { tipo: 'titulo2', texto: est.nome },
      ...pavs.flatMap(pav => blocosDoPavimento(
        pav,
        (state.iluminacao || []).filter(i => i.pavimentoId === pav.id),
        balizamentoAplicadoMap[pav.id],
        equipamentosUsados, equipamentosSpec, norma,
      )),
    ]
  })

  if (blocosPavimentos.length === 0) {
    blocosPavimentos.push({ tipo: 'paragrafo', texto: 'Não há itens de iluminação de emergência cadastrados ainda — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Sistema de Iluminação de Emergência', blocos: [...blocos, ...blocosPavimentos] }
}
