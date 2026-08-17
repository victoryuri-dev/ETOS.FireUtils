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
    blocos.push({ tipo: 'paragrafo', texto: `A carga de incêndio de ${pav.label} ainda não foi classificada — a área-limite para unidade única (item 5.2.1.4.2, NT 21 CBMMA) não pôde ser verificada.` })
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

export function textoMemorialExtintores(state) {
  const norma = getExtintores(state.uf)
  const { DISTANCIA_MAXIMA } = norma

  const introducao = [{
    tipo: 'paragrafo',
    texto: `A distância máxima a percorrer até o extintor, conforme o risco predominante da edificação, é de ${DISTANCIA_MAXIMA.portatil.baixo} m (risco baixo), ${DISTANCIA_MAXIMA.portatil.medio} m (risco médio) e ${DISTANCIA_MAXIMA.portatil.alto} m (risco alto) para extintores portáteis, e de ${DISTANCIA_MAXIMA.sobreRodas.baixo} m, ${DISTANCIA_MAXIMA.sobreRodas.medio} m e ${DISTANCIA_MAXIMA.sobreRodas.alto} m, respectivamente, para extintores sobre rodas (itens 5.1.2 e 5.1.5, NT 21 CBMMA).`,
  }]

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
