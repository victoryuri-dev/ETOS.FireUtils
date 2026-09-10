// memorial/saida_emergencia.js — texto do memorial descritivo pro sistema
// de Saída de Emergência (NT 14 CBMMA / NBR 9077), narrando a árvore de
// Acessos e Descargas de cada pavimento (ver pages/medidas/
// AcessosDescargasView.jsx) — mesmo motor de cálculo (se_calc.js) que
// alimenta a tela de dimensionamento, nunca duplicando a lógica aqui.
//
// Diferente dos builders mais antigos (extintores.js, seg_estrutural.js),
// precisa saber chuveiros automáticos/detecção de incêndio POR ESTRUTURA
// pra resolver a distância máxima a percorrer (getDistanciaPavimento) —
// por isso recebe `porEstrutura` (useMedidasObrigatorias().porEstrutura),
// não só o `sistemas` agregado do projeto que os outros builders usam.

import { getSE } from '../normas/index'
import {
  calcPopPav, contarSaidasPavimento, getDistanciaPavimento,
  calcNoAcesso, calcNoAmbientePT, calcPortaNoAcesso, tipoDoNo,
} from '../se_calc'

const fmt  = n => Number(n).toFixed(2).replace('.', ',')
const fmtM = n => `${fmt(n)} m`

function acessosFilhos(acessos, parentId) {
  return acessos.filter(a => a.alimentaEm === parentId)
}
function ambientesDe(ambientes, acessoId) {
  return ambientes.filter(a => a.acessoId === acessoId)
}

// Item de ambiente (folha da árvore) pro bloco 'lista' — porta calculada
// por população/capacidade normativa de PORTA da própria divisão do
// ambiente (calcNoAmbientePT), igual à tela de dimensionamento.
function itemDoAmbiente(amb, taxaPopulacional, larguras) {
  const { pop, pt } = calcNoAmbientePT(amb, taxaPopulacional, larguras)
  return {
    label: `${amb.nome} (${amb.divisao || '?'})`,
    valor: `Porta · população ${pop} · ${pt.n} UP · largura mínima ${fmtM(pt.la)}`,
  }
}

// Item de nó Acesso/Saída/Escada-Rampa (recursivo — ver AcessosDescargasView.jsx
// pro mesmo desenho de árvore) pro bloco 'lista'. A porta do PRÓPRIO box
// reaproveita o N de UP já calculado pro AD/ER (calcPortaNoAcesso) — não
// recalcula população, só troca a capacidade pela normativa de porta.
function itemDoAcesso(acesso, ambientes, acessos, taxaPopulacional, larguras, pisoDescarga) {
  const { tipo, label } = tipoDoNo(acesso, pisoDescarga)
  const { pop, capValor, dim } = calcNoAcesso(acesso.id, ambientes, acessos, taxaPopulacional, larguras, tipo)
  const porta = calcPortaNoAcesso(dim.n, larguras)
  const filhosAcesso = acessosFilhos(acessos, acesso.id).map(a =>
    itemDoAcesso(a, ambientes, acessos, taxaPopulacional, larguras, pisoDescarga)
  )
  const filhosAmbiente = ambientesDe(ambientes, acesso.id).map(amb => itemDoAmbiente(amb, taxaPopulacional, larguras))
  return {
    label: `${acesso.nome} (${label})`,
    valor: `População ${pop} · capacidade ${capValor}/UP · ${dim.n} UP · largura ${fmtM(dim.la)} · porta mínima ${fmtM(porta.la)}`,
    sub: [...filhosAcesso, ...filhosAmbiente],
  }
}

function blocosDoPavimento(pav, seNorma, temChuveiros, temDeteccao) {
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS, DISTANCIAS_MAXIMAS } = seNorma
  const acessos = pav.acessos || []
  const ambientes = pav.ambientes || []
  const raizes = acessosFilhos(acessos, null)
  const nSaidas = Math.max(1, contarSaidasPavimento(acessos))
  const rotuloRaiz = pav.pisoDescarga ? 'saída' : 'escada/rampa'

  const blocos = [{ tipo: 'titulo2', texto: pav.label }]

  if (!pav.divisao) {
    blocos.push({ tipo: 'paragrafo', texto: `Ocupação de ${pav.label} ainda não classificada (Etapa de Classificação) — população e distância máxima a percorrer pendentes.` })
    return blocos
  }

  const pop = calcPopPav(pav, TAXA_POPULACIONAL)
  const dist = getDistanciaPavimento(pav, nSaidas, temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS)

  blocos.push({
    tipo: 'campo',
    label: pav.pisoDescarga ? 'Piso de descarga' : 'Pavimento',
    valor: `População ${pop} pessoas · ${nSaidas} ${rotuloRaiz}(s)`
      + (dist != null ? ` · distância máxima a percorrer ${fmtM(dist)}` : ' · distância máxima a percorrer: consultar CBMMA (combinação não tabelada)'),
  })

  if (raizes.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Nenhuma ${rotuloRaiz} cadastrada em ${pav.label} até o momento — árvore de acessos e descargas pendente.` })
  } else {
    blocos.push({
      tipo: 'lista',
      itens: raizes.map(r => itemDoAcesso(r, ambientes, acessos, TAXA_POPULACIONAL, LARGURAS_MINIMAS, !!pav.pisoDescarga)),
    })
  }

  const semAcesso = ambientes.filter(a => !a.acessoId)
  if (semAcesso.length > 0) {
    blocos.push({
      tipo: 'lista',
      estilo: 'alerta',
      itens: [`${semAcesso.length} ambiente(s) de ${pav.label} ainda sem acesso atribuído na árvore: ${semAcesso.map(a => a.nome).join(', ')}.`],
    })
  }

  return blocos
}

export function textoMemorialSaidaEmergencia(state, sistemas, porEstrutura) {
  const seNorma = getSE(state.uf)
  const sistemasPorEst = Object.fromEntries((porEstrutura || []).map(pe => [pe.estrutura.id, pe.sistemas]))

  const blocos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []

    const temChuveiros = !!sistemasPorEst[est.id]?.sprinklers?.ativo
    const temDeteccao  = !!sistemasPorEst[est.id]?.deteccao?.ativo

    return [
      { tipo: 'titulo2', texto: est.nome || 'Estrutura' },
      { tipo: 'campo', label: 'Sistemas considerados na distância máxima a percorrer', valor: `Chuveiros automáticos: ${temChuveiros ? 'sim' : 'não'} · Detecção de incêndio: ${temDeteccao ? 'sim' : 'não'}` },
      ...pavs.flatMap(pav => blocosDoPavimento(pav, seNorma, temChuveiros, temDeteccao)),
    ]
  })

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Nenhum pavimento cadastrado — dimensionamento de saída de emergência pendente.' })
  }

  return { titulo: 'Saída de Emergência', blocos }
}
