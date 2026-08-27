// ─────────────────────────────────────────────────────────────────────────────
// brigada_calc.js — Funções universais de dimensionamento da Brigada de
// Incêndio (Anexo A / Tabela A.1 da norma vigente). Recebem os dados
// normativos (TABELA_A1, notas) como parâmetro; não importam nenhum arquivo
// de norma de um estado específico — a mesma função dimensiona qualquer
// tabela A.1 compatível (ver normas/index.js → getBrigada(uf)). Mesmas
// funções alimentam a tela de dimensionamento e o texto do memorial — nunca
// duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0

export const NIVEL_LABEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' }

/** Localiza a linha da Tabela A.1 aplicável a uma divisão/grau de risco.
 *  Divisões com uma única linha na tabela (risco fixo pela norma) ignoram o
 *  risco calculado do pavimento; divisões com múltiplas linhas (ex.: C-2,
 *  D-1, I-1..I-3) escolhem pelo risco informado, com fallback para a
 *  primeira linha cadastrada quando o risco ainda não foi classificado. */
export function linhaTabelaA1(divisao, risco, tabela) {
  if (!divisao) return null
  const linhas = tabela.filter(l => l.divisoes.includes(divisao))
  if (linhas.length === 0) return null
  if (linhas.length === 1) return linhas[0]
  return linhas.find(l => l.risco === risco) || linhas[0]
}

// Incremento de brigadistas por grupo de pessoas acima de 10 (Nota 5),
// conforme o grau de risco da divisão.
const GRUPO_NOTA5 = { baixo: 20, medio: 15, alto: 10 }

/** Número de brigadistas exigidos para uma linha da Tabela A.1 e uma
 *  população fixa informada. Cobre a regra padrão (colunas "Até N" + Nota 5
 *  acima de 10 pessoas) e as regras especiais (isenção, percentuais,
 *  túnel, instalação temporária). */
export function calcularBrigadistas(linha, populacaoFixa) {
  if (!linha) return { brigadistas: null, especial: false, faixaUsada: null, detalhe: 'Divisão não cadastrada na Tabela A.1 — classifique a divisão do pavimento na Etapa 4.' }
  if (linha.isento) return { brigadistas: 0, especial: false, faixaUsada: null, detalhe: 'Divisão isenta de brigada de incêndio.' }

  const pop = Math.max(0, Math.round(num(populacaoFixa)))

  if (linha.regraAcima10 === 'ver_item_5_11_2') {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: 'Instalação temporária — dimensionamento conforme item 5.11.2 da norma (não coberto pela Tabela A.1 padrão).' }
  }
  if (linha.regraAcima10 === 'tunel') {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: 'Túnel — dimensionamento pela extensão (Nota 9): 200–500 m = 2 brigadistas; 501–1000 m = 4 brigadistas; acima de 1000 m = análise por Comissão Técnica.' }
  }
  if (linha.regraAcima10 === 'pct_funcionarios_pav') {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: '80% dos funcionários da edificação, mais 1 (um) brigadista por pavimento — informe o total de funcionários para completar o cálculo manualmente.' }
  }
  if (linha.regraAcima10 === 'pct_populacao') {
    if (pop === 0) return { brigadistas: null, especial: false, faixaUsada: '80% da população fixa', detalhe: 'Informe a população fixa para calcular.' }
    const brigadistas = Math.ceil(pop * 0.8)
    return { brigadistas, especial: false, faixaUsada: '80% da população fixa', detalhe: `80% de ${pop} pessoas = ${brigadistas} brigadistas.` }
  }

  if (!linha.faixas) {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: 'Regra de dimensionamento não tabelada para esta divisão — verifique diretamente a norma vigente.' }
  }

  if (pop === 0) return { brigadistas: null, especial: false, faixaUsada: null, detalhe: 'Informe a população fixa para calcular.' }

  const [v2, v4, v6, v8, v10] = linha.faixas
  let brigadistas, faixaUsada
  if (pop <= 2)       { brigadistas = v2;  faixaUsada = 'Até 2' }
  else if (pop <= 4)  { brigadistas = v4;  faixaUsada = 'Até 4' }
  else if (pop <= 6)  { brigadistas = v6;  faixaUsada = 'Até 6' }
  else if (pop <= 8)  { brigadistas = v8;  faixaUsada = 'Até 8' }
  else if (pop <= 10) { brigadistas = v10; faixaUsada = 'Até 10' }
  else {
    const grupo = GRUPO_NOTA5[linha.risco] || 20
    const extra = Math.ceil((pop - 10) / grupo)
    brigadistas = v10 + extra
    faixaUsada = `Acima de 10 (Nota 5: +${extra} a cada grupo de até ${grupo} pessoas)`
  }

  const maiorCenario = linha.regraAcima10 === 'maior_cenario'
  return {
    brigadistas, especial: false, faixaUsada,
    detalhe: maiorCenario ? 'O valor final deve ser o maior entre este cálculo e a necessidade do cenário de combate a incêndio (Nota 7).' : null,
  }
}

/** Nível de treinamento/instalação exigido (Básico/Intermediário/Avançado),
 *  resolvendo os tokens dinâmicos da Tabela A.1: 'nota8' (>20 brigadistas
 *  eleva o patamar mínimo) e 'nota1' (Divisão C-2, decidido pela área
 *  construída, fora do escopo desta função). `temNota4` habilita a
 *  reclassificação opcional da Nota 4 (edificações ≤ 12 m) — só quando a
 *  linha da Tabela A.1 desta divisão/risco traz a Nota 4 no rodapé; a
 *  redução não é uma regra geral para qualquer nível intermediário (ex.:
 *  hoje só a Divisão M-7, risco médio, carrega essa nota). */
export function calcularNivel(nivelBase, brigadistas, alturaEdificacao, temNota4) {
  if (!nivelBase) return null

  if (nivelBase === 'nota1') {
    return { nivel: null, dinamico: true, label: 'A confirmar (Nota 1)', detalhe: 'Divisão C-2: básico para edificações com menos de 5.000 m²; a partir de 5.000 m², mínimo de 4 brigadistas por turno em nível intermediário — confirme pela área construída da estrutura.' }
  }

  let nivel = nivelBase
  let detalhe = null
  if (nivelBase === 'nota8') {
    if (brigadistas == null) return { nivel: null, dinamico: true, label: 'A confirmar (Nota 8)', detalhe: 'Depende do total de brigadistas calculado.' }
    nivel = brigadistas > 20 ? 'intermediario' : 'basico'
    if (nivel === 'intermediario') {
      detalhe = `Nota 8: acima de 20 brigadistas — mínimo de 4 (quatro) por turno em nível intermediário de treinamento/instalações, acrescidos de 1 (um) a cada grupo adicional de 20 brigadistas, os demais em nível básico. Confirme a distribuição exata conforme o total de brigadistas por turno.`
    }
  }

  const alturaOk = alturaEdificacao !== '' && alturaEdificacao != null && num(alturaEdificacao) <= 12
  const podeReduzirParaBasico = nivel === 'intermediario' && !!temNota4 && alturaOk

  return { nivel, dinamico: false, label: NIVEL_LABEL[nivel] || nivel, detalhe, podeReduzirParaBasico }
}

/** Composição completa do dimensionamento de um pavimento/instalação: linha
 *  aplicável da Tabela A.1, número de brigadistas e níveis de treinamento e
 *  de instalação exigidos. */
export function calcularBrigadaPavimento(divisao, risco, populacaoFixa, alturaEdificacao, tabela) {
  const linha = linhaTabelaA1(divisao, risco, tabela)
  const resultado = calcularBrigadistas(linha, populacaoFixa)
  const temNota4 = !!linha?.notas?.includes(4)
  const nivelTreinamento = linha ? calcularNivel(linha.nivelTreinamento, resultado.brigadistas, alturaEdificacao, temNota4) : null
  const nivelInstalacao  = linha ? calcularNivel(linha.nivelInstalacao,  resultado.brigadistas, alturaEdificacao, temNota4) : null
  return { linha, resultado, nivelTreinamento, nivelInstalacao }
}
