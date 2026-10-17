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

// Documentos de cada estado (página Documentos). `tipo` escolhe o componente
// em DocumentosPage: 'memorial-texto' (memorial descritivo do MA),
// 'anexo-b' (Anexo B da NT 01 CBMMA), 'formulario-pb' (formulário do CBMPB).
const DOCUMENTOS_PADRAO = [
  {
    id: 'anexo-b', tipo: 'anexo-b', comDadosCadastrais: true,
    titulo: 'Anexo B — NT 01',
    descricao: 'Formulario de Seguranca Contra Incendio para Processo Tecnico. Preenchido com os dados cadastrados nas etapas de configuracao do projeto.',
  },
  {
    id: 'memorial-descritivo', tipo: 'memorial-texto',
    titulo: 'Memorial Descritivo',
    descricao: 'Uma pagina por medida de seguranca dimensionada, com o texto tecnico gerado a partir dos dados de cada dimensionamento — inclui o Plano de Emergencia (NT 16) quando aplicavel ao projeto.',
  },
]
const DOCUMENTOS = {
  // PB: um único documento — o próprio formulário, no lugar do Anexo B e do
  // memorial em texto corrido.
  PB: [
    {
      id: 'memorial-descritivo', tipo: 'formulario-pb',
      titulo: 'Memorial Descritivo — CBMPB',
      descricao: 'Formulario oficial do Memorial Descritivo do Projeto de Seguranca Contra Incendio do CBMPB, preenchido com os dados do projeto, com os Anexos A a D ao final.',
    },
  ],
}

// Textos das etapas comuns da Configuração que citam o órgão/norma do estado.
const TEXTOS_PADRAO = {
  orgao: 'CBMMA',
  referenciaRiscosEspeciais: 'conforme Anexo B da NT 01.',
}
const TEXTOS = {
  PB: { orgao: 'CBMPB', referenciaRiscosEspeciais: 'conforme item 5 do Memorial Descritivo do CBMPB.' },
}

/** Página (elemento) própria do estado para a medida, ou null (usa a comum). */
export function paginaDaMedida(uf, sistKey) {
  return PAGINAS[uf]?.[sistKey] || null
}

/** O estado tem fluxo próprio de medidas (não usa as páginas do MA)? */
export function temFluxoProprio(uf) {
  return ESTADOS_COM_FLUXO_PROPRIO.has(uf)
}

/** Documentos do estado; "apenas dimensionamento" não gera os que dependem
 *  de dados cadastrais (endereço, responsáveis…), como o Anexo B. */
export function documentosDoEstado(uf, tipoProjeto) {
  const lista = DOCUMENTOS[uf] || DOCUMENTOS_PADRAO
  return tipoProjeto === 'dimensionamento' ? lista.filter(d => !d.comDadosCadastrais) : lista
}

/** Textos do estado usados nas etapas comuns da Configuração. */
export function textosDoEstado(uf) {
  return { ...TEXTOS_PADRAO, ...(TEXTOS[uf] || {}) }
}
