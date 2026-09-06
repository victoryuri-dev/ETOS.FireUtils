// ─────────────────────────────────────────────────────────────────────────────
// se_calc.js — Funções universais de dimensionamento de Saídas de Emergência
// Recebem os dados normativos do estado como parâmetro; não importam nenhum
// arquivo de estado diretamente.
// ─────────────────────────────────────────────────────────────────────────────

/** Largura mínima de PT para N UPs (recebe array LARGURAS_MINIMAS.PT) */
export function getLargMinPT(nUp, ptTable) {
  return ptTable.find(e => e.n_up === nUp) ?? (nUp > ptTable.at(-1).n_up ? ptTable.at(-1) : ptTable[0])
}

/** Capacidades por UP (mínima entre divisões presentes) para uma lista
 * qualquer de ambientes — generaliza capPavimento pra poder ser aplicada
 * também a um nó de Acesso (subconjunto de ambientes), não só ao
 * pavimento inteiro. */
export function capAmbientes(ambientes, taxaPopulacional) {
  const divs = [...new Set(ambientes.map(a => a.divisao).filter(d => d && taxaPopulacional[d]))]
  if (!divs.length) return { AD: 100, ER: 75, PT: 100 }
  return {
    AD: Math.min(...divs.map(d => taxaPopulacional[d].AD)),
    ER: Math.min(...divs.map(d => taxaPopulacional[d].ER)),
    PT: Math.min(...divs.map(d => taxaPopulacional[d].PT)),
  }
}

/** Capacidades por UP para um pavimento inteiro (mínima entre divisões presentes) */
export function capPavimento(pav, taxaPopulacional) {
  return capAmbientes(pav.ambientes, taxaPopulacional)
}

/** Calcula a população de um ambiente */
export function calcPopAmb(amb, taxaPopulacional) {
  if (amb.popTipo === 'fixo')   return Math.max(0, parseInt(amb.assentos)  || 0)
  if (amb.popTipo === 'manual') return Math.max(0, parseInt(amb.popManual) || 0)
  const taxa = taxaPopulacional[amb.divisao]
  if (!taxa || taxa.A === null) return Math.max(0, parseInt(amb.popManual) || 0)
  return Math.ceil((parseFloat(amb.area) || 0) / taxa.A)
}

/** Calcula a população total de um pavimento */
export function calcPopPav(pav, taxaPopulacional) {
  return pav.ambientes.reduce((s, a) => s + calcPopAmb(a, taxaPopulacional), 0)
}

/** Pavimento mais populoso excluindo piso de descarga */
export function pavMaisPopuloso(pavimentos, taxaPopulacional) {
  return pavimentos
    .filter(p => p.tipo !== 'descarga')
    .reduce((mx, p) => calcPopPav(p, taxaPopulacional) > (mx ? calcPopPav(mx, taxaPopulacional) : -1) ? p : mx, null)
}

/** Cálculo de AD para um pavimento (ou, na rede de saída, para um nó de Acesso) */
export function calcAD(pop, capAD, larguras) {
  const n  = Math.ceil(pop / capAD)
  const lc = +(n * larguras.LARG_UP).toFixed(2)
  return { n, lc, la: Math.max(lc, larguras.AD), lMin: larguras.AD }
}

/** Cálculo de ER para o pavimento mais populoso */
export function calcER(pop, capER, larguras) {
  const n  = Math.ceil(pop / capER)
  const lc = +(n * larguras.LARG_UP).toFixed(2)
  return { n, lc, la: Math.max(lc, larguras.ER), lMin: larguras.ER }
}

/** Cálculo de PT — recebe a população e a capacidade já resolvidas por
 * quem chama (um ambiente sozinho, na rede de saída; ou um pavimento
 * inteiro, no modelo antigo) */
export function calcPT(pop, capPT, larguras) {
  const n      = Math.ceil(pop / capPT)
  const lc     = +(n * larguras.LARG_UP).toFixed(2)
  const ptInfo = getLargMinPT(n, larguras.PT)
  return { n, lc, la: Math.max(lc, ptInfo.largura), lMin: ptInfo.largura, tipo: ptInfo.tipo }
}

// ── Rede de saída (Ambiente -> Acesso -> Acesso/Descarga) ────────────────────
//
// Substitui o modelo antigo de "um AD e um PT por pavimento inteiro" por uma
// árvore montada pelo usuário, sem limite de profundidade:
//
//   ambiente.acessoId : string|null
//     -- a qual nó de Acesso este ambiente alimenta (null = ainda não
//        posicionado na árvore).
//
//   acesso = { id, nome, alimentaEm: string|null, quantidadeSaidas }
//     -- `alimentaEm` aponta pro id de outro acesso (cascata: a população
//        deste nó soma na do próximo) ou é null quando este acesso É a
//        saída final do pavimento (descarga, ou o ponto que alimenta a
//        Escada/Rampa da estrutura — ER continua calculado à parte, por
//        pavMaisPopuloso/calcPopPav/calcER, sem mudança).
//     -- `quantidadeSaidas` é indicado manualmente pelo usuário (não é
//        calculado por nada aqui) — usado em getDistancia/getDistanciaPavimento
//        no lugar de inferir "saída única" a partir do n de UPs.
//
// Portas (PT) não passam por essa árvore: são por ambiente, direto —
// ver calcNoAmbientePT.

function ambientesDiretosDoAcesso(acessoId, ambientes) {
  return ambientes.filter(a => a.acessoId === acessoId)
}

function acessosFilhosDiretos(acessoId, acessos) {
  return acessos.filter(ac => ac.alimentaEm === acessoId)
}

/** Todos os ambientes que alimentam um nó de Acesso, direta ou
 * indiretamente (atravessando quantos níveis de cascata houver) — usado
 * pra achar a capacidade (mínimo AD) do nó. */
export function ambientesDoAcesso(acessoId, ambientes, acessos) {
  const diretos = ambientesDiretosDoAcesso(acessoId, ambientes)
  const dosFilhos = acessosFilhosDiretos(acessoId, acessos)
    .flatMap(ac => ambientesDoAcesso(ac.id, ambientes, acessos))
  return [...diretos, ...dosFilhos]
}

/** População acumulada de um nó de Acesso: soma dos ambientes que o
 * alimentam direto + a população (já acumulada) de qualquer outro acesso
 * que também o alimente (cascata) — recursivo, sem limite de profundidade. */
export function calcPopAcesso(acessoId, ambientes, acessos, taxaPopulacional) {
  const diretos = ambientesDiretosDoAcesso(acessoId, ambientes)
    .reduce((s, a) => s + calcPopAmb(a, taxaPopulacional), 0)
  const dosFilhos = acessosFilhosDiretos(acessoId, acessos)
    .reduce((s, ac) => s + calcPopAcesso(ac.id, ambientes, acessos, taxaPopulacional), 0)
  return diretos + dosFilhos
}

/** Pacote pronto (população, capacidade, dimensionamento AD) pra um nó de
 * Acesso da rede de saída. */
export function calcNoAcesso(acessoId, ambientes, acessos, taxaPopulacional, larguras) {
  const pop = calcPopAcesso(acessoId, ambientes, acessos, taxaPopulacional)
  const cap = capAmbientes(ambientesDoAcesso(acessoId, ambientes, acessos), taxaPopulacional)
  const ad  = calcAD(pop, cap.AD, larguras)
  return { pop, cap, ad }
}

/** Pacote pronto (população, capacidade, dimensionamento PT) pra um
 * ambiente — a porta é sempre por ambiente, nunca agregada com outros. */
export function calcNoAmbientePT(amb, taxaPopulacional, larguras) {
  const pop   = calcPopAmb(amb, taxaPopulacional)
  const capPT = taxaPopulacional[amb.divisao]?.PT ?? 100
  const pt    = calcPT(pop, capPT, larguras)
  return { pop, capPT, pt }
}

/** Retorna o grupo de distância (terreo/demais) para uma divisão, a
 * partir do formato { mapa_ocupacao, grupos } (divisão -> id do grupo -> dados). */
export function getGrupoDistancia(divisao, distanciasMaximas) {
  const id = distanciasMaximas?.mapa_ocupacao?.[divisao]
  return id ? (distanciasMaximas.grupos?.[id] ?? null) : null
}

/** Distância máxima para uma divisão com os parâmetros dados.
 * `nSaidas`: quantidade de saídas do ponto em questão — no modelo de
 * rede, vem de `acesso.quantidadeSaidas` (indicado pelo usuário), não
 * mais inferido do número de UPs do AD. */
export function getDistancia(divisao, pisoDescarga, nSaidas, temChuveiros, temDeteccao, distanciasMaximas) {
  const grupo = getGrupoDistancia(divisao, distanciasMaximas)
  if (!grupo) return null
  const andar  = pisoDescarga ? grupo.terreo : grupo.demais
  const chuv   = temChuveiros ? 'com_chuveiro' : 'sem_chuveiro'
  const saidas = nSaidas > 1 ? 'mais_saidas' : 'saida_unica'
  const detec  = temDeteccao ? 'com_deteccao' : 'sem_deteccao'
  return andar?.[chuv]?.[saidas]?.[detec] ?? null
}

/** Distância mínima (mais restritiva) para um pavimento inteiro */
export function getDistanciaPavimento(pav, nSaidas, temChuveiros, temDeteccao, distanciasMaximas) {
  const divs = [...new Set(pav.ambientes.map(a => a.divisao).filter(Boolean))]
  if (!divs.length) return null
  const vals = divs
    .map(d => getDistancia(d, pav.tipo === 'descarga', nSaidas, temChuveiros, temDeteccao, distanciasMaximas))
    .filter(v => v !== null)
  return vals.length ? Math.min(...vals) : null
}

/** Retorna as opções de taxa disponíveis para a divisão */
export function taxaOpcoes(divisao, taxaPopulacional) {
  const taxa = taxaPopulacional[divisao]
  if (!taxa) return []
  const opts = []
  if (taxa.A !== null) opts.push({ value:'area',   label: taxa.obs })
  if (taxa.notas?.includes('N')) opts.push({ value:'fixo', label:'Assentos fixos' })
  if (taxa.A === null)  opts.push({ value:'manual', label: taxa.obs })
  return opts
}

/** Tipo de população padrão para uma divisão */
export function popTipoPadrao(divisao, taxaPopulacional) {
  return taxaOpcoes(divisao, taxaPopulacional)[0]?.value || 'manual'
}
