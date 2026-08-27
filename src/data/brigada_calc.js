// ─────────────────────────────────────────────────────────────────────────────
// brigada_calc.js — Funções universais de dimensionamento da Brigada de
// Incêndio (Anexo A / Tabela A.1 da norma vigente). Recebem os dados
// normativos (TABELA_A1, notas) como parâmetro; não importam nenhum arquivo
// de norma de um estado específico — a mesma função dimensiona qualquer
// tabela A.1 compatível (ver normas/index.js → getBrigada(uf)). Mesmas
// funções alimentam a tela de dimensionamento e o texto do memorial — nunca
// duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

import { classificarRisco } from './extintores_calc'

const num = v => parseFloat(v) || 0

export const NIVEL_LABEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' }

/** Carga de incêndio (MJ/m²) de uma divisão, priorizando o valor resolvido ao
 *  vivo pela tabela normativa (CNAE → carga) e caindo para o valor já gravado
 *  em cargaState quando a busca por CNAE não encontra nada. Mesma robustez
 *  usada no resumo do cabeçalho da estrutura (EstruturaHeaderInfo) — cobre o
 *  caso em que o campo `cargaIncendio` do cargaState não ficou persistido no
 *  momento da classificação (Etapa 5), mas o CNAE e o método continuam lá. */
export function cargaDivisaoRobusta(divisao, cnae, cargaEst, cnaesDiv) {
  const st = cargaEst?.[divisao]
  if (!st) return null
  if (st.metodo === 'levantamento') return parseFloat(st.valorManual) || null
  const viaTabela = cnae ? cnaesDiv(divisao)?.[cnae]?.cargaIncendio : null
  return viaTabela ?? st.cargaIncendio ?? null
}

/** Risco predominante (baixo/médio/alto) de um pavimento — maior carga de
 *  incêndio entre a divisão principal e as subsidiárias (pavimento.acess),
 *  usando a resolução robusta acima. */
export function riscoDoPavimentoRobusto(pavimento, cargaEst, cnaesDiv, limiares) {
  const entradas = [
    { divisao: pavimento.divisao, cnae: pavimento.cnae },
    ...(pavimento.acess || []).map(a => ({ divisao: a.divisao, cnae: a.cnae })),
  ].filter(e => e.divisao)
  const cargas = entradas.map(e => cargaDivisaoRobusta(e.divisao, e.cnae, cargaEst, cnaesDiv)).filter(c => c != null)
  if (cargas.length === 0) return null
  return classificarRisco(Math.max(...cargas), limiares)
}

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
 *  acima de 10 pessoas) e as regras especiais (isenção, percentuais, túnel,
 *  instalação temporária). `notasDinamicas` lista os números de nota do
 *  rodapé (NOTAS_TABELA_A1) que este cálculo específico efetivamente
 *  acionou — não a lista estática de notas da linha, ver calcularBrigadaPavimento. */
export function calcularBrigadistas(linha, populacaoFixa) {
  if (!linha) return { brigadistas: null, especial: false, faixaUsada: null, detalhe: 'Divisão não cadastrada na Tabela A.1 — classifique a divisão do pavimento na Etapa 4.', notasDinamicas: [] }
  if (linha.isento) return { brigadistas: 0, especial: false, faixaUsada: null, detalhe: 'Divisão isenta de brigada de incêndio.', notasDinamicas: [] }

  const pop = Math.max(0, Math.round(num(populacaoFixa)))

  if (linha.regraAcima10 === 'ver_item_5_11_2') {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: 'Instalação temporária — dimensionamento conforme item 5.11.2 da norma (não coberto pela Tabela A.1 padrão).', notasDinamicas: [] }
  }
  if (linha.regraAcima10 === 'tunel') {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: null, notasDinamicas: [9] }
  }
  if (linha.regraAcima10 === 'pct_funcionarios_pav') {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: '80% dos funcionários da edificação e 1 (um) brigadista para cada pavimento — informe o total de funcionários para completar o cálculo manualmente.', notasDinamicas: [] }
  }
  if (linha.regraAcima10 === 'pct_populacao') {
    if (pop === 0) return { brigadistas: null, especial: false, faixaUsada: '80% da população fixa', detalhe: 'Informe a população fixa para calcular.', notasDinamicas: [] }
    const brigadistas = Math.ceil(pop * 0.8)
    return { brigadistas, especial: false, faixaUsada: '80% da população fixa', detalhe: null, notasDinamicas: [] }
  }

  if (!linha.faixas) {
    return { brigadistas: null, especial: true, faixaUsada: null, detalhe: 'Regra de dimensionamento não tabelada para esta divisão — verifique diretamente a norma vigente.', notasDinamicas: [] }
  }

  if (pop === 0) return { brigadistas: null, especial: false, faixaUsada: null, detalhe: 'Informe a população fixa para calcular.', notasDinamicas: [] }

  const [v2, v4, v6, v8, v10] = linha.faixas
  let brigadistas, faixaUsada, notasDinamicas = []
  if (pop <= 2)       { brigadistas = v2;  faixaUsada = 'Até 2' }
  else if (pop <= 4)  { brigadistas = v4;  faixaUsada = 'Até 4' }
  else if (pop <= 6)  { brigadistas = v6;  faixaUsada = 'Até 6' }
  else if (pop <= 8)  { brigadistas = v8;  faixaUsada = 'Até 8' }
  else if (pop <= 10) { brigadistas = v10; faixaUsada = 'Até 10' }
  else {
    const grupo = GRUPO_NOTA5[linha.risco] || 20
    const extra = Math.ceil((pop - 10) / grupo)
    brigadistas = v10 + extra
    faixaUsada = `Acima de 10 (+${extra} pela Nota 5, grupos de até ${grupo})`
    notasDinamicas = [5]
  }

  return { brigadistas, especial: false, faixaUsada, detalhe: null, notasDinamicas }
}

/** Nível de treinamento/instalação exigido (Básico/Intermediário/Avançado),
 *  resolvendo os tokens dinâmicos da Tabela A.1: 'nota8' (>20 brigadistas
 *  eleva o patamar mínimo) e 'nota1' (Divisão C-2, decidido pela área
 *  construída, fora do escopo desta função). `temNota4` habilita a
 *  reclassificação opcional da Nota 4 (edificações ≤ 12 m) — só quando a
 *  linha da Tabela A.1 desta divisão/risco traz a Nota 4 no rodapé para esta
 *  coluna especificamente (ver nota4Aplicavel em calcularBrigadaPavimento);
 *  a redução não é uma regra geral para qualquer nível intermediário. */
export function calcularNivel(nivelBase, brigadistas, alturaEdificacao, temNota4) {
  if (!nivelBase) return null

  if (nivelBase === 'nota1') {
    return { nivel: null, dinamico: true, label: 'A confirmar (Nota 1)', detalhe: null, podeReduzirParaBasico: false, notasDinamicas: [1] }
  }

  let nivel = nivelBase
  let notasDinamicas = []
  if (nivelBase === 'nota8') {
    if (brigadistas == null) return { nivel: null, dinamico: true, label: 'A confirmar (Nota 8)', detalhe: 'Depende do total de brigadistas calculado.', podeReduzirParaBasico: false, notasDinamicas: [] }
    nivel = brigadistas > 20 ? 'intermediario' : 'basico'
    if (nivel === 'intermediario') notasDinamicas = [8]
  }

  const alturaOk = alturaEdificacao !== '' && alturaEdificacao != null && num(alturaEdificacao) <= 12
  const podeReduzirParaBasico = nivel === 'intermediario' && !!temNota4 && alturaOk
  if (podeReduzirParaBasico) notasDinamicas = [...notasDinamicas, 4]

  return { nivel, dinamico: false, label: NIVEL_LABEL[nivel] || nivel, detalhe: null, podeReduzirParaBasico, notasDinamicas }
}

const RISCO_LABEL_BRUTO = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }

const NIVEL_TOKEN_LABEL = {
  basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado',
  nota1: '(nota 1)', nota8: '(nota 8)',
}

// Texto da coluna "Acima de 10" (ou, para linhas sem faixas numéricas, o
// texto único que ocupa a célula "Até 2" mesclada no original) tal como
// impresso na Tabela A.1 — não o valor calculado.
const ACIMA10_LABEL_BRUTO = {
  nota5: '(nota 5)',
  maior_cenario: '(nota 5)',
  pct_populacao: '80% da população fixa',
  pct_funcionarios_pav: '80% dos funcionários da edificação e 1 (um) brigadista para cada pavimento',
  ver_item_5_11_2: 'Ver item 5.11.2',
  tunel: '(nota 9)',
}

/** Uma divisão específica (código, ex.: "E-5") formatada exatamente como a
 *  Tabela A.1 imprime — grupo, descrição, grau de risco, as colunas "Até N"
 *  literais (números, "Isento" ou o texto da regra especial) e os tokens de
 *  nível ("Básico"/"(nota 8)"/etc., com "(nota 4)" anexado só na coluna a
 *  que essa nota se aplica). Usada para reproduzir o trecho normativo no
 *  memorial — nunca o resultado calculado (ver calcularBrigadaPavimento). */
export function linhaTabelaA1Bruta(divisao, linha) {
  if (!linha) return null

  let celulas, acima10
  if (linha.isento) {
    celulas = ['Isento', 'Isento', 'Isento', 'Isento', 'Isento']
    acima10 = 'Isento'
  } else if (linha.faixas) {
    celulas = linha.faixas.map(String)
    acima10 = ACIMA10_LABEL_BRUTO[linha.regraAcima10] || '—'
  } else {
    // Regra especial sem faixas numéricas (A-2, F-7, M-1): no original é uma
    // única célula mesclada — aqui vai no primeiro campo, o resto em branco.
    celulas = [ACIMA10_LABEL_BRUTO[linha.regraAcima10] || '—', '—', '—', '—', '—']
    acima10 = '—'
  }

  const nivelBruto = (token, coluna) => {
    if (linha.isento || !token) return 'Isento'
    let label = NIVEL_TOKEN_LABEL[token] || token
    if (linha.nota4Aplicavel === coluna || linha.nota4Aplicavel === 'ambos') label += ' (nota 4)'
    return label
  }

  return {
    grupo: divisao.charAt(0),
    divisao,
    descricao: linha.descricao,
    risco: linha.risco ? RISCO_LABEL_BRUTO[linha.risco] : '—',
    celulas,
    acima10,
    nivelTreinamento: nivelBruto(linha.nivelTreinamento, 'treinamento'),
    nivelInstalacao: nivelBruto(linha.nivelInstalacao, 'instalacao'),
  }
}

// Números de nota que só aparecem quando o cálculo específico os aciona
// (nunca estáticos pela divisão) — o restante das notas de `linha.notas`
// (ex.: 2, 3, 6, 7, 9, 10) descreve a divisão/regra em si e vale sempre que
// a linha é usada, independente da população ou altura informadas.
const NOTAS_SO_DINAMICAS = new Set([1, 4, 5, 8])

/** Composição completa do dimensionamento de um pavimento/instalação: linha
 *  aplicável da Tabela A.1, número de brigadistas, níveis de treinamento e
 *  de instalação exigidos, e `notasIdentificadas` — a lista exata (e só ela)
 *  das notas do rodapé que se aplicam a este resultado específico, pronta
 *  para render verbatim (ver NOTAS_TABELA_A1). */
export function calcularBrigadaPavimento(divisao, risco, populacaoFixa, alturaEdificacao, tabela) {
  const linha = linhaTabelaA1(divisao, risco, tabela)
  const resultado = calcularBrigadistas(linha, populacaoFixa)
  // nota4Aplicavel diferencia a coluna: na única linha que hoje cita a Nota 4
  // (M-7 risco médio), ela vale só para o Treinamento — a Instalação não a cita.
  const temNota4Treinamento = linha?.nota4Aplicavel === 'treinamento' || linha?.nota4Aplicavel === 'ambos'
  const temNota4Instalacao  = linha?.nota4Aplicavel === 'instalacao'  || linha?.nota4Aplicavel === 'ambos'
  const nivelTreinamento = linha ? calcularNivel(linha.nivelTreinamento, resultado.brigadistas, alturaEdificacao, temNota4Treinamento) : null
  const nivelInstalacao  = linha ? calcularNivel(linha.nivelInstalacao,  resultado.brigadistas, alturaEdificacao, temNota4Instalacao)  : null

  const estaticas = (linha?.notas || []).filter(n => !NOTAS_SO_DINAMICAS.has(n))
  const dinamicas = [
    ...(resultado.notasDinamicas || []),
    ...(nivelTreinamento?.notasDinamicas || []),
    ...(nivelInstalacao?.notasDinamicas || []),
  ]
  const notasIdentificadas = [...new Set([...estaticas, ...dinamicas])].sort((a, b) => a - b)

  return { linha, resultado, nivelTreinamento, nivelInstalacao, notasIdentificadas }
}
