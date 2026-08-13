// memorial/sinalizacao.js — texto do memorial descritivo para a Sinalização
// de Emergência (NT 20 CBMMA / NBR 13434). Usa o MESMO calc puro
// (sinalizacao_calc.js) que alimenta a tela de quantidades — o texto nunca
// duplica a lógica de totalização, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de parágrafos corridos —
// mesmo padrão do memorial de Iluminação e Extintores.

import { getSinalizacao } from '../normas/index'
import { calcularSinalizacaoPavimento } from '../sinalizacao_calc'

// Larguras fixas — mesmo valor em toda tabela da seção, para as colunas
// ficarem alinhadas entre si mesmo quando o conteúdo de "Placa" varia de
// tamanho de uma tabela para outra (ver BlocoMedida em MemorialDescritivoPage.jsx).
const LARGURAS_TABELA = ['52px', '56px', 'auto', '48px']

function blocosDoPavimento(pav, itensPav, tiposPlaca, categorias) {
  const blocos = [{ tipo: 'titulo2', texto: pav.label }]

  if (itensPav.length === 0) {
    blocos.push({ tipo: 'paragrafo', texto: `Nenhuma placa de sinalização de emergência cadastrada em ${pav.label} até o momento.` })
    return blocos
  }

  const { porTipo } = calcularSinalizacaoPavimento(itensPav, tiposPlaca)

  categorias.forEach(cat => {
    const tiposCat = tiposPlaca.filter(t => t.categoria === cat.key && porTipo[t.key] > 0)
    if (tiposCat.length === 0) return
    blocos.push({
      tipo: 'tabela',
      colunas: ['', 'Código', 'Placa', 'Qtd.'],
      larguras: LARGURAS_TABELA,
      linhas: tiposCat.map(t => [{ tipo: 'imagem', src: t.img, alt: t.codigo }, t.codigo, t.label, String(porTipo[t.key])]),
    })
  })

  return blocos
}

export function textoMemorialSinalizacao(state) {
  const norma = getSinalizacao(state.uf)
  const { TIPOS_PLACA, CATEGORIAS, NOTAS } = norma
  const itensSinalizacao = state.sinalizacao || []

  const blocos = [{
    tipo: 'paragrafo',
    texto: `A sinalização de emergência da edificação segue os pictogramas, cores e formas padronizados pela NBR 13434 (partes 1 a 3), abrangendo placas de proibição, alerta, orientação/saída de emergência e indicação de equipamentos de combate a incêndio, conforme NT 20 CBMMA. ${NOTAS.quantidade}`,
  }]

  const blocosPavimentos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    return [
      { tipo: 'titulo2', texto: est.nome },
      ...pavs.flatMap(pav => blocosDoPavimento(pav, itensSinalizacao.filter(i => i.pavimentoId === pav.id), TIPOS_PLACA, CATEGORIAS)),
    ]
  })

  if (blocosPavimentos.length === 0) {
    blocosPavimentos.push({ tipo: 'paragrafo', texto: 'Não há placas de sinalização de emergência cadastradas ainda — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Sinalização de Emergência', blocos: [...blocos, ...blocosPavimentos] }
}
