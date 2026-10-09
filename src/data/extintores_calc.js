// ─────────────────────────────────────────────────────────────────────────────
// extintores_calc.js — Funções universais de classificação e verificação da
// proteção por extintores (NT 21 CBMMA). Recebem os dados normativos (tipos,
// distâncias, limites de área) como parâmetro; não importam nenhum arquivo de
// estado diretamente. Mesmas funções alimentam a tela de dimensionamento e o
// texto do memorial — nunca duas fontes de verdade.
// ─────────────────────────────────────────────────────────────────────────────

const num = v => parseFloat(v) || 0

/** Classifica o risco (baixo/médio/alto) a partir da carga de incêndio
 *  (MJ/m²), mesmos limiares usados na Etapa 5 (Carga de Incêndio). */
export function classificarRisco(cargaIncendio, limiares) {
  const q = num(cargaIncendio)
  if (q <= limiares.baixo) return 'baixo'
  if (q <= limiares.medio) return 'medio'
  return 'alto'
}

/** Carga de incêndio de uma divisão a partir de state.cargaState — usa o
 *  valor de levantamento quando esse for o método escolhido, senão o valor
 *  de tabela já resolvido (ver Step5.jsx / INIT_CARGA). */
export function cargaDaDivisao(divisao, cargaState) {
  const st = cargaState?.[divisao]
  if (!st) return null
  if (st.metodo === 'levantamento') return parseFloat(st.valorManual) || null
  return st.cargaIncendio ?? null
}

/** Risco predominante de um pavimento — maior carga de incêndio entre a
 *  divisão principal e as ocupações subsidiárias (p.acess). Retorna null
 *  quando nenhuma divisão do pavimento tem carga de incêndio classificada
 *  ainda (Etapa 5 pendente). */
export function riscoDoPavimento(pavimento, cargaState, limiares) {
  const divisoes = [pavimento.divisao, ...(pavimento.acess || []).map(a => a.divisao)].filter(Boolean)
  const cargas = divisoes.map(d => cargaDaDivisao(d, cargaState)).filter(c => c != null)
  if (cargas.length === 0) return null
  return classificarRisco(Math.max(...cargas), limiares)
}

/** Área máxima do pavimento para admitir unidade extintora única de classe
 *  específica (item 5.2.1.4.2), conforme o risco predominante. */
export function areaLimiteUnidadeUnica(risco, areaLimite) {
  return risco === 'alto' ? areaLimite.alto : areaLimite.demais
}

/** Classes de incêndio (A/B/C) atendidas por uma lista de extintores,
 *  combinando o catálogo portátil/sobre-rodas de cada item. */
export function classesAtendidas(extintores, tiposPortatil, tiposSobreRodas) {
  const classes = new Set()
  extintores.forEach(e => {
    const catalogo = e.sobreRodas ? tiposSobreRodas : tiposPortatil
    const tipo = catalogo.find(t => t.key === e.tipo)
    tipo?.classes.forEach(c => classes.add(c))
  })
  return [...classes]
}

// ── Capacidade extintora mínima por risco de incêndio (extintores
// portáteis) — tabela de referência comum a vários Corpos de Bombeiros
// estaduais (mesmo texto-base citado pela NT 21 CBMMA e pela NBR 12693),
// valores gerais, não variam por estado. Classifica o nível (baixo/médio/
// alto) a partir da mesma carga de incêndio já usada em classificarRisco/
// LIMIARES_RISCO, e dá a unidade extintora mínima + distância máxima a
// percorrer por classe de incêndio A e B. A distância da classe A coincide
// com DISTANCIA_MAXIMA.portatil (mesma tabela, vista por dois ângulos); a
// da classe B é fixa em 15 m, independente do risco.
export const CAPACIDADE_MINIMA_POR_RISCO = {
  A: {
    baixo: { capacidade: '2-A',  distanciaMaxima: 25 },
    medio: { capacidade: '3-A',  distanciaMaxima: 20 },
    alto:  { capacidade: '4-A',  distanciaMaxima: 15 },
  },
  B: {
    baixo: { capacidade: '20-B', distanciaMaxima: 15 },
    medio: { capacidade: '40-B', distanciaMaxima: 15 },
    alto:  { capacidade: '80-B', distanciaMaxima: 15 },
  },
}

/** Capacidade extintora mínima (+ distância máxima a percorrer) para a
 *  classe de incêndio informada ('A' ou 'B'), dado o risco predominante do
 *  pavimento — ver CAPACIDADE_MINIMA_POR_RISCO acima. */
export function capacidadeMinimaPorRisco(risco, classeIncendio) {
  return CAPACIDADE_MINIMA_POR_RISCO[classeIncendio]?.[risco] ?? null
}

/** Resultado completo da verificação de um pavimento: classes atendidas,
 *  se o mínimo do item 5.2.1.4 está satisfeito (ou a exceção de unidade
 *  única do item 5.2.1.4.2) e total de unidades. A distância máxima a
 *  percorrer (item 5.1.2/5.1.5) é informação geral do projeto — não é
 *  verificada por extintor cadastrado (ver DISTANCIA_MAXIMA em
 *  normas/MA/extintores.js). */
export function calcularPavimento(extintores, risco, areaPavimento, config) {
  const { tiposPortatil, tiposSobreRodas, areaLimite } = config
  const classes = classesAtendidas(extintores, tiposPortatil, tiposSobreRodas)
  const temA  = classes.includes('A')
  const temBC = classes.includes('B') || classes.includes('C')
  const totalUnidades = extintores.reduce((s, e) => s + (parseInt(e.quantidade) || 0), 0)

  const limiteAreaUnica    = risco ? areaLimiteUnidadeUnica(risco, areaLimite) : null
  const area               = num(areaPavimento)
  const permiteUnidadeUnica = limiteAreaUnica != null && area > 0 && area <= limiteAreaUnica

  // Regra geral (item 5.2.1.4): duas unidades — uma para classe A, outra
  // para classes B/C. Um único extintor multi-classe (ex.: pó ABC) só
  // conta como UMA unidade, então não basta cobrir as duas classes; é
  // preciso ter ao menos 2 unidades no total.
  const minimoGeral        = totalUnidades >= 2 && temA && temBC
  // Exceção de unidade única (item 5.2.1.4.2): pavimento pequeno (área
  // dentro do limite do risco predominante) pode ter só 1 unidade.
  const minimoUnidadeUnica = permiteUnidadeUnica && totalUnidades >= 1 && (temA || temBC)
  const minimoAtendido     = minimoGeral || minimoUnidadeUnica
  const viaUnidadeUnica    = minimoUnidadeUnica && !minimoGeral

  return { classes, temA, temBC, totalUnidades, limiteAreaUnica, permiteUnidadeUnica, minimoAtendido, viaUnidadeUnica }
}
