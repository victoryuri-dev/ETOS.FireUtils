// memorial/extintores.js — texto do memorial descritivo para o Sistema de
// Proteção por Extintores de Incêndio (NT 21 CBMMA). Usa o MESMO calc puro
// (extintores_calc.js) que alimenta a tela de dimensionamento — o texto nunca
// duplica a lógica de risco/mínimo por pavimento, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de `paragrafos` corridos —
// os extintores por ambiente são o dado mais consultado pelo RT, e uma
// tabela é mais fácil de conferir do que um parágrafo de texto.

import { getExtintores } from '../normas/index'
import { riscoDoPavimento, calcularPavimento } from '../extintores_calc'

const RISCO_LABEL = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }
const fmt = n => Number(n).toFixed(2).replace(/,?0+$/, '').replace(/\.$/, '').replace('.', ',')

function linhaTabela(ext, catalogoPortatil, catalogoSobreRodas) {
  const catalogo = ext.sobreRodas ? catalogoSobreRodas : catalogoPortatil
  const tipo = catalogo.find(t => t.key === ext.tipo)
  return [
    ext.ambiente || '—',
    tipo?.label || ext.tipo,
    ext.sobreRodas ? 'Sobre rodas' : 'Portátil',
    ext.capacidade || '—',
    ext.carga ? `${ext.carga} kg` : '—',
    String(ext.quantidade || 0),
  ]
}

function blocosDoPavimento(pav, extintoresDoPav, state, norma) {
  const { LIMIARES_RISCO, AREA_LIMITE_UNIDADE_UNICA, TIPOS_PORTATIL, TIPOS_SOBRE_RODAS, NOTAS } = norma
  const risco = riscoDoPavimento(pav, state.cargaState[pav.estruturaId] || {}, LIMIARES_RISCO)
  const blocos = [{ tipo: 'titulo2', texto: pav.label }]

  if (!risco) {
    blocos.push({ tipo: 'paragrafo', texto: `A carga de incêndio de ${pav.label} ainda não foi classificada — o risco predominante não pôde ser determinado.` })
  } else {
    blocos.push({ tipo: 'campo', label: 'Risco predominante', valor: RISCO_LABEL[risco] })
  }

  if (extintoresDoPav.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Nenhum ambiente ou extintor cadastrado em ${pav.label} até o momento.` })
    return blocos
  }

  blocos.push({
    tipo: 'tabela',
    colunas: ['Ambiente', 'Tipo', 'Formato', 'Capacidade', 'Carga', 'Qtd.'],
    linhas: extintoresDoPav.map(e => linhaTabela(e, TIPOS_PORTATIL, TIPOS_SOBRE_RODAS)),
  })

  const r = calcularPavimento(extintoresDoPav, risco, pav.area, {
    tiposPortatil: TIPOS_PORTATIL, tiposSobreRodas: TIPOS_SOBRE_RODAS,
    areaLimite: AREA_LIMITE_UNIDADE_UNICA,
  })

  if (!r.minimoAtendido) {
    blocos.push({ tipo: 'lista', estilo: 'alerta', itens: [`${pav.label}: ${NOTAS.minimoPorPavimento}`] })
  }

  return blocos
}

// Riscos e tipos (portátil/sobre rodas) que efetivamente aparecem no
// projeto — evita enumerar as 3 faixas de risco quando só uma se aplica.
function riscosETiposUsados(state, limiaresRisco) {
  const riscos = new Set()
  let temPortatil = false, temSobreRodas = false
  ;(state.estruturas || []).forEach(est => {
    (state.pavimentos || []).filter(p => p.estruturaId === est.id).forEach(pav => {
      const r = riscoDoPavimento(pav, state.cargaState[est.id] || {}, limiaresRisco)
      if (r) riscos.add(r)
    })
  })
  ;(state.extintores || []).forEach(e => (e.sobreRodas ? temSobreRodas = true : temPortatil = true))
  return { riscos: [...riscos], temPortatil, temSobreRodas }
}

export function textoMemorialExtintores(state) {
  const norma = getExtintores(state.uf)
  const { DISTANCIA_MAXIMA, ALTURA_INSTALACAO, NOTAS, LIMIARES_RISCO } = norma
  const { riscos, temPortatil, temSobreRodas } = riscosETiposUsados(state, LIMIARES_RISCO)

  const distanciaTexto = riscos.length > 0
    ? riscos.map(r => {
        const partes = []
        if (temPortatil || !temSobreRodas) partes.push(`${DISTANCIA_MAXIMA.portatil[r]} m (portátil)`)
        if (temSobreRodas) partes.push(`${DISTANCIA_MAXIMA.sobreRodas[r]} m (sobre rodas)`)
        return `${RISCO_LABEL[r].toLowerCase()}: ${partes.join(' / ')}`
      }).join('; ')
    : `${DISTANCIA_MAXIMA.portatil.baixo} m (risco baixo), ${DISTANCIA_MAXIMA.portatil.medio} m (risco médio) e ${DISTANCIA_MAXIMA.portatil.alto} m (risco alto) para extintores portáteis`

  const introducao = [
    {
      tipo: 'paragrafo',
      texto: `A distância máxima a percorrer até o extintor, conforme o risco predominante de cada pavimento, é de ${distanciaTexto} (itens 5.1.2 e 5.1.5, NT 21 CBMMA).`,
    },
    {
      tipo: 'paragrafo',
      texto: `Os extintores fixados em suporte de parede ficam instalados com a parte superior a, no máximo, ${fmt(ALTURA_INSTALACAO.suporteParede.alturaMaxima)} m do piso acabado, e a base a, no mínimo, ${fmt(ALTURA_INSTALACAO.suporteParede.alturaMinimaBase)} m do piso; os apoiados sobre o piso, em suporte baixo, ficam com a base entre ${fmt(ALTURA_INSTALACAO.apoiadoPiso.min)} m e ${fmt(ALTURA_INSTALACAO.apoiadoPiso.max)} m de altura (itens 5.2.1.1 e 5.2.1.3, NT 21 CBMMA). ${NOTAS.entradaEscada}`,
    },
  ]

  const blocos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    return [
      { tipo: 'titulo2', texto: est.nome },
      ...pavs.flatMap(pav => blocosDoPavimento(pav, (state.extintores || []).filter(e => e.pavimentoId === pav.id), state, norma)),
    ]
  })

  if (blocos.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: 'Não há ambientes ou extintores cadastrados ainda — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Sistema de Proteção por Extintores de Incêndio', blocos: [...introducao, ...blocos] }
}
