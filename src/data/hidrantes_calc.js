// ─────────────────────────────────────────────────────────────────────────────
// hidrantes_calc.js — Classificação do Sistema de Hidrantes/Mangotinhos
// (Tabela 3 da norma). Funções puras: recebem os dados normativos (norma
// de normas/<UF>/hidrantes.js) como parâmetro, nunca importam um estado
// direto — mesma convenção de extintores_calc.js/iluminacao_calc.js.
//
// O que este módulo NÃO faz: dimensionamento hidráulico (perda de carga,
// altura manométrica, potência de bomba) — isso é calculado pelo plugin
// Revit a partir da classificação que sai daqui.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0

/** Coluna da Tabela 3 (1-4) para uma divisão, dada a carga de incêndio
 *  (MJ/m²) do pavimento — usa a faixa quando a divisão depende de carga,
 *  senão a coluna fixa. Retorna null se a divisão não consta na tabela. */
export function colunaDaDivisao(divisao, cargaMJm2, norma) {
  const porCarga = norma.DIVISOES_POR_CARGA[divisao]
  if (porCarga) {
    const carga = num(cargaMJm2)
    const faixa = porCarga.find(f => (f.min == null || carga >= f.min) && (f.max == null || carga < f.max))
    return faixa ? faixa.coluna : null
  }
  return norma.DIVISOES_COLUNA[divisao] ?? null
}

/** Índice da faixa de área (0-based, Tabela 3) para uma área construída
 *  total em m². Retorna -1 se a área for inválida/zero. */
export function faixaAreaIndex(areaTotal, norma) {
  const a = num(areaTotal)
  if (a <= 0) return -1
  return norma.FAIXAS_AREA.findIndex(f => (f.min == null || a > f.min) && (f.max == null || a <= f.max))
}

/** Opções de classificação (Tipo + RTI) para uma coluna/faixa, já
 *  aplicando o rebaixamento automático por chuveiros automáticos (Notas 1
 *  e 2 da Tabela 3) quando `possuiSprinklers` é true. Retorna uma lista —
 *  normalmente 1 opção, mas 2 quando a coluna 1 permite ao projetista
 *  escolher entre Tipo 1 e Tipo 2.
 *
 *  Cada opção: { tipo, rti, origem: 'normal'|'nota1'|'nota2', nota? } —
 *  `nota` traz o texto a exibir/citar no memorial quando o rebaixamento
 *  foi aplicado.
 */
export function opcoesClassificacao(coluna, faixaIndex, possuiSprinklers, norma) {
  if (coluna == null || faixaIndex < 0 || faixaIndex >= norma.TABELA3.length) return []
  const linha = norma.TABELA3[faixaIndex]

  if (coluna === 1) {
    return [
      { tipo: 1, rti: linha.col1.tipo1.rti, origem: 'normal' },
      { tipo: 2, rti: linha.col1.tipo2.rti, origem: 'normal' },
    ]
  }

  if (coluna === 2) {
    return [{ tipo: linha.col2.tipo, rti: linha.col2.rti, origem: 'normal' }]
  }

  if (coluna === 3) {
    const base = { tipo: linha.col3.tipo, rti: linha.col3.rti, origem: 'normal' }
    if (possuiSprinklers) {
      return [{
        tipo: 3, rti: linha.col2.rti, origem: 'nota2',
        nota: 'Rebaixado de Tipo 4 para Tipo 3 (Nota 2 da Tabela 3, NT 22) — edificação possui chuveiros automáticos.',
      }]
    }
    return [base]
  }

  if (coluna === 4) {
    const base = { tipo: linha.col4.tipo, rti: linha.col4.rti, origem: 'normal' }
    if (!possuiSprinklers) return [base]
    if (linha.col4.tipo === 5) {
      return [{
        tipo: 4, rti: linha.col3.rti, origem: 'nota1',
        nota: 'Rebaixado de Tipo 5 para Tipo 4 (Nota 1 da Tabela 3, NT 22) — edificação possui chuveiros automáticos.',
      }]
    }
    // já era Tipo 4 na própria tabela — Nota 2 permite rebaixar mais um nível, pra Tipo 3
    return [{
      tipo: 3, rti: linha.col2.rti, origem: 'nota2',
      nota: 'Rebaixado de Tipo 4 para Tipo 3 (Nota 2 da Tabela 3, NT 22) — edificação possui chuveiros automáticos.',
    }]
  }

  return []
}

/** Divisão de maior carga de incêndio entre uma lista de divisões — a NT 22
 *  não dá um critério explícito pra ocupação mista na classificação do
 *  Tipo/RTI, então adotamos a ocupação de maior carga de incêndio (mais
 *  exigente em termos de risco) como referência. Retorna null se a lista
 *  estiver vazia ou nenhuma divisão constar na Tabela 3. */
export function divisaoMaiorCarga(divisoesComCarga, norma) {
  let melhor = null
  divisoesComCarga.forEach(({ divisao, cargaMJm2 }) => {
    const coluna = colunaDaDivisao(divisao, cargaMJm2, norma)
    if (coluna == null) return
    if (!melhor || cargaMJm2 > melhor.cargaMJm2) melhor = { divisao, coluna, cargaMJm2 }
  })
  return melhor
}

/** Monta a sugestão completa de classificação pra um projeto: cruza área
 *  total (só das estruturas que exigem hidrantes — ver FormularioSistema)
 *  + divisão de maior carga de incêndio + presença de chuveiros
 *  automáticos, e devolve as opções de Tipo/RTI já prontas pro formulário
 *  exibir. `divisoesComCarga`: [{ divisao, cargaMJm2 }]. */
export function sugerirClassificacao(areaTotal, divisoesComCarga, possuiSprinklers, norma) {
  const faixaIndex = faixaAreaIndex(areaTotal, norma)
  if (faixaIndex < 0 || !divisoesComCarga?.length) {
    return { faixaIndex, coluna: null, divisao: null, opcoes: [] }
  }

  const maiorCarga = divisaoMaiorCarga(divisoesComCarga, norma)
  if (!maiorCarga) return { faixaIndex, coluna: null, divisao: null, opcoes: [] }

  const opcoes = opcoesClassificacao(maiorCarga.coluna, faixaIndex, possuiSprinklers, norma)
  return { faixaIndex, coluna: maiorCarga.coluna, divisao: maiorCarga.divisao, opcoes }
}

/** RTI tabelada (Tabela 3) para um Tipo específico numa faixa de área —
 *  usada quando o RT sobrescreve manualmente o Tipo sugerido (item 5.8.10
 *  permite dimensionamento a critério do projetista) e a RTI precisa
 *  continuar automática, buscando na própria linha da tabela. Retorna null
 *  se aquele Tipo não aparecer em nenhuma coluna da faixa (ex.: Tipo 5 numa
 *  faixa cuja coluna 4 ainda é Tipo 4) — nesse caso não há RTI tabelada
 *  pronta e o RT precisa justificar o valor por cálculo (item 5.8.10). */
export function rtiParaTipoNaFaixa(tipo, faixaIndex, norma) {
  if (faixaIndex < 0 || faixaIndex >= norma.TABELA3.length) return null
  const linha = norma.TABELA3[faixaIndex]
  if (tipo === 1) return linha.col1.tipo1.rti
  if (tipo === 2) return linha.col1.tipo2.rti
  if (linha.col2.tipo === tipo) return linha.col2.rti
  if (linha.col3.tipo === tipo) return linha.col3.rti
  if (linha.col4.tipo === tipo) return linha.col4.rti
  return null
}

/** Dados de referência (Tabela 2/4) para um Tipo escolhido — esguicho,
 *  mangueira, componentes obrigatórios. `variante` é o índice dentro de
 *  `TIPOS_SISTEMA[tipo].variantes` (Tipo 4 tem 2; os demais só têm 1). */
export function dadosDoTipo(tipo, variante, norma) {
  const sistema = norma.TIPOS_SISTEMA[tipo]
  if (!sistema) return null
  const v = sistema.variantes[variante] || sistema.variantes[0]
  const componentes = norma.COMPONENTES_POR_TIPO[tipo]
  return {
    label: sistema.label,
    expedicoes: sistema.expedicoes,
    vazaoMin: sistema.vazaoMin,
    pressaoMin: v.pressaoMin,
    esguicho: v.esguicho,
    mangueiraDn: v.mangueiraDn,
    mangueiraComprimento: v.mangueiraComprimento,
    componentes,
  }
}

/** true se o número de entradas do dispositivo de recalque deve ser 2
 *  (item 5.3.3 — vazão do sistema acima do limite normativo). */
export function exigeRecalqueDuplo(vazaoMin, norma) {
  return num(vazaoMin) > norma.VAZAO_LIMITE_RECALQUE_DUPLO
}

/** Bomba reserva obrigatória (Anexo C, C.3.12) pra um risco baixo/medio/alto
 *  — risco 'baixo' nunca exige. Retorna null quando não exige. */
export function bombaReservaObrigatoria(risco, norma) {
  return norma.BOMBA_RESERVA_POR_RISCO[risco] ?? null
}
