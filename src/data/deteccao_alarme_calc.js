// ─────────────────────────────────────────────────────────────────────────────
// deteccao_alarme_calc.js — funções puras de dimensionamento dos Sistemas de
// Detecção (medida 'deteccao') e Alarme (medida 'alarme') de Incêndio, que
// compartilham a mesma norma (NT 19; ver normas/<UF>/deteccao_alarme.js e a
// linha 'deteccao_alarme' de normas_dados). Recebem a norma como parâmetro
// (`getDeteccaoAlarme(uf)`) — nunca importam um estado diretamente. O texto do
// memorial e as telas usam SEMPRE estas funções, sem repetir a regra.
//
// Tudo que sai daqui é uma ESTIMATIVA MÍNIMA por área: o projetista pode
// substituir a área por detector e a quantidade adotada, e deve conferir a
// distribuição em planta (retângulos contidos no círculo de cobertura).
// ─────────────────────────────────────────────────────────────────────────────

const num = v => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
const vazio = v => v === '' || v === null || v === undefined

export const TIPOS_DETECTOR = [
  { key: 'fumaca_pontual',      label: 'Fumaça pontual' },
  { key: 'temperatura_pontual', label: 'Temperatura pontual' },
  { key: 'fumaca_linear',       label: 'Fumaça linear (feixe)' },
  { key: 'temperatura_linear',  label: 'Temperatura linear (cabo)' },
  { key: 'chama',               label: 'Chama' },
]

// ── Valores do projeto guardados na estrutura/pavimento (com defaults) ────
export function alarmeDaEstrutura(est) {
  return {
    central: '', centralLocal: '', circuito: '', monitoramentoRemoto: false,
    preAlarme: false, subcentral: false, subcentralQtd: '',
    painelRepetidor: false, painelSinoptico: false,
    fonteAuxiliar: '',
    tipoAvisador: '', semFio: false,
    ...(est?.alarme || {}),
  }
}
export function deteccaoDaEstrutura(est) {
  return { entreforros: false, entreforrosDescricao: '', arCondicionado: false, ...(est?.deteccao || {}) }
}
export function alarmePav(pav) {
  return { acionadores: '', avisadoresSonoros: '', avisadoresVisuais: '', ...(pav?.alarme || {}) }
}
export function deteccaoPav(pav) {
  return { tipo: 'fumaca_pontual', peDireito: '', viga: '', areaDetector: '', qtd: '', obs: '', ...(pav?.deteccao || {}) }
}

/** Pavimentos com a área efetiva: a área informada na classificação (Etapa 4) ou,
 *  se ainda em branco, a área da estrutura dividida igualmente pelos pavimentos
 *  (marcada em `_areaEstimada`). Assim o dimensionamento já sai automático. */
export function comAreaEfetiva(pavimentos, est) {
  const total = num(est?.areaTotal)
  const n = pavimentos.length || 1
  return pavimentos.map(p => {
    if (num(p.area) > 0) return p
    return total > 0 ? { ...p, area: String(Math.round((total / n) * 100) / 100), _areaEstimada: true } : p
  })
}

// ── Detectores ─────────────────────────────────────────────────────────────

/** Espaçamento (m) do detector de temperatura para uma altura de teto — Tabela 2,
 *  com interpolação linear entre alturas tabeladas. Até 5 m: espaçamento cheio. */
export function espacamentoTemperatura(altura, tabela) {
  const h = num(altura)
  if (!tabela?.length) return null
  if (h <= tabela[0].altura_m) return tabela[0].espacamento_m
  const ultimo = tabela[tabela.length - 1]
  if (h >= ultimo.altura_m) return ultimo.espacamento_m
  for (let i = 1; i < tabela.length; i++) {
    const a = tabela[i - 1], b = tabela[i]
    if (h <= b.altura_m) {
      const t = (h - a.altura_m) / (b.altura_m - a.altura_m)
      return Math.round((a.espacamento_m + t * (b.espacamento_m - a.espacamento_m)) * 100) / 100
    }
  }
  return ultimo.espacamento_m
}

/** Fator de redução da área de cobertura pela altura da viga sob a laje
 *  (dois terços entre 0,21 e 0,60 m; metade acima disso). */
export function fatorViga(vigaM, reducoes) {
  const v = num(vigaM)
  if (!reducoes?.length || v <= 0.20) return { fator: 1, texto: null }
  const r = reducoes.find(r => v >= r.min_m && (r.max_m == null || v <= r.max_m)) || reducoes[reducoes.length - 1]
  return { fator: r.fator, texto: r.texto }
}

/**
 * Cobertura de um detector para um tipo, pé-direito (altura do teto) e viga.
 * @returns {{ porArea:boolean, areaMax:number|null, espacamento:number|null, fatorViga:number,
 *   fatorTexto:string|null, alertas:string[] }}
 */
export function coberturaDetector(tipo, { peDireito, viga } = {}, detectores) {
  const cfg = detectores?.tipos?.[tipo]
  const alertas = []
  if (!cfg) return { porArea: false, areaMax: null, espacamento: null, fatorViga: 1, fatorTexto: null, alertas }
  if (!cfg.por_area) return { porArea: false, areaMax: null, espacamento: null, fatorViga: 1, fatorTexto: null, alertas }

  const h = num(peDireito)
  let areaMax = cfg.area_max_m2
  let espacamento = cfg.lado_m

  if (tipo === 'temperatura_pontual' && h > cfg.altura_max_m) {
    espacamento = espacamentoTemperatura(h, detectores.espacamento_altura_temperatura)
    areaMax = Math.round(espacamento * espacamento * 100) / 100
    alertas.push(`Pé-direito de ${h} m acima de ${cfg.altura_max_m} m: espaçamento reduzido para ${espacamento} m (interpolado da tabela de redução por altura).`)
  }
  if (tipo === 'fumaca_pontual' && h > cfg.altura_max_m) {
    alertas.push(`Pé-direito de ${h} m acima de ${cfg.altura_max_m} m: instalar detectores em níveis de no máximo ${cfg.altura_max_m} m (recomenda-se coletores de fumaça de 900 cm² nos níveis intermediários) ou avaliar detector linear.`)
  }

  const v = fatorViga(viga, detectores.reducao_viga)
  if (v.fator < 1) {
    areaMax = Math.round(areaMax * v.fator * 100) / 100
    alertas.push(`Viga de ${num(viga)} m: área de cobertura reduzida para ${v.texto} (a redução não se aplica se houver ao menos um detector em cada caixa formada pelas vigas, respeitada a área máxima).`)
    espacamento = Math.round(Math.sqrt(areaMax) * 100) / 100
  }
  return { porArea: true, areaMax, espacamento, fatorViga: v.fator, fatorTexto: v.texto, alertas }
}

/**
 * Resumo do dimensionamento de detecção de um pavimento (já com as substituições
 * do usuário). `qtdMin` é só por área; `qtdAdotada` é o que vale.
 */
export function resumoDeteccaoPavimento(pav, detectores) {
  const d = deteccaoPav(pav)
  const area = num(pav?.area)
  const cob = coberturaDetector(d.tipo, { peDireito: d.peDireito, viga: d.viga }, detectores)
  const areaDetector = !vazio(d.areaDetector) ? num(d.areaDetector) : cob.areaMax
  const qtdMin = cob.porArea && area > 0 && areaDetector > 0 ? Math.max(1, Math.ceil(area / areaDetector)) : null
  const qtdAdotada = !vazio(d.qtd) ? Math.round(num(d.qtd)) : qtdMin
  const areaSubstituida = !vazio(d.areaDetector) && cob.porArea
  const abaixoDoMinimo = qtdMin != null && qtdAdotada != null && qtdAdotada < qtdMin
  const porArea = cob.porArea
  const completo = porArea ? (area > 0 && qtdAdotada != null) : qtdAdotada != null
  return {
    tipo: d.tipo, area, peDireito: num(d.peDireito), viga: num(d.viga),
    cobertura: cob, areaDetector, areaSubstituida, qtdMin, qtdAdotada, abaixoDoMinimo,
    porArea, completo, obs: d.obs, alertas: cob.alertas,
  }
}

// ── Alarme ─────────────────────────────────────────────────────────────────

/** Acionadores manuais mínimos de um pavimento: ao menos 1 por pavimento e o
 *  suficiente para que nenhum ponto exceda a distância máxima de percurso. */
export function acionadoresMinimos(area, acionador) {
  const a = num(area)
  const cob = num(acionador?.area_cobertura_estimada_m2)
  if (a <= 0 || cob <= 0) return 1
  return Math.max(1, Math.ceil(a / cob))
}

export function resumoAlarmePavimento(pav, acionador, avisador, cfgEst) {
  const p = alarmePav(pav)
  const minAcion = acionadoresMinimos(pav?.area, acionador)
  const acionadores = !vazio(p.acionadores) ? Math.round(num(p.acionadores)) : minAcion
  const sonoros = !vazio(p.avisadoresSonoros) ? Math.round(num(p.avisadoresSonoros)) : (avisador?.minimo_por_pavimento ?? 1)
  const tipo = cfgEst?.tipoAvisador
  const visualObrig = tipo === 'visual' || tipo === 'audiovisual'
  const sonoroObrig = tipo === 'sonoro' || tipo === 'audiovisual'
  const visuais = !vazio(p.avisadoresVisuais) ? Math.round(num(p.avisadoresVisuais)) : (visualObrig ? (avisador?.minimo_por_pavimento ?? 1) : 0)
  return {
    minAcionadores: minAcion, acionadores, abaixoDoMinimo: acionadores < minAcion,
    sonoros: sonoroObrig ? sonoros : 0, visuais, visualObrigatorio: visualObrig,
    visualFaltando: visualObrig && visuais < 1,
  }
}

/** Autonomia informada (ou o mínimo da norma, se em branco) e se cumpre o mínimo. */
export function autonomiaEfetiva(valor, minimo) {
  const informado = !vazio(valor)
  const v = informado ? num(valor) : minimo
  return { valor: v, informado, atende: v >= minimo }
}

/** Notas da norma aplicáveis às divisões presentes (por divisão exata ou por grupo)
 *  + as notas gerais. Só exibidas — nunca viram configuração. */
export function notasAplicaveis(norma, divisoes) {
  const porDiv = norma?.notas_por_divisao || norma?.NOTAS_POR_DIVISAO || {}
  const gerais = norma?.notas_gerais || norma?.NOTAS_GERAIS || []
  const divs = [...new Set((divisoes || []).filter(Boolean))]
  const especificas = []
  divs.forEach(d => {
    const grupo = d[0]
    ;[d, grupo].forEach(chave => {
      (porDiv[chave] || []).forEach(n => {
        if (!especificas.some(e => e.item === n.item && e.texto === n.texto)) especificas.push({ ...n, ocupacao: chave })
      })
    })
  })
  return { especificas, gerais }
}

export const fmtNum = (n, casas = 2) => Number(n).toFixed(casas).replace('.', ',')
