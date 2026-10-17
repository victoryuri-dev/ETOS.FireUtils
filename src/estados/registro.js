// Registro do que cada estado tem de próprio no fluxo do projeto.
//
// O núcleo é comum (configuração, classificação, carga de incêndio, normas
// e cálculos). O que muda por estado é o PREENCHIMENTO e o DOCUMENTO:
//   - MA: páginas de medida com dados detalhados (Revit, quantitativos) e o
//     memorial descritivo em texto — as páginas de src/pages/medidas.
//   - PB: o formulário do Memorial Descritivo do CBMPB — cada medida abre a
//     página da PB (estados/PB/paginas), só com o que o formulário pede e os
//     dimensionamentos padrão da norma.
// Estado sem entrada aqui usa as páginas de src/pages/medidas. Os campos
// próprios nas etapas da Configuração ficam em estados/ExtensaoConfig.jsx.
import { PAGINAS_PB } from './PB/paginas'
import { ESTADOS_COM_FLUXO_PROPRIO } from './fluxos'

const PAGINAS = { PB: PAGINAS_PB }

/** Página (elemento) própria do estado para a medida, ou null (usa a comum). */
export function paginaDaMedida(uf, sistKey) {
  return PAGINAS[uf]?.[sistKey] || null
}

/** O estado tem fluxo próprio de medidas (não usa as páginas do MA)? */
export function temFluxoProprio(uf) {
  return ESTADOS_COM_FLUXO_PROPRIO.has(uf)
}
