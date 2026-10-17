import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { servidorComNormas } from './helpers/normasDeTeste.mjs'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

// Renderiza (SSR) cada página de medida da PB e as extensões da Configuração
// com um projeto de exemplo — pega erro de execução que lint/build não veem.
const projeto = {
  id: 'x', uf: 'PB', tipoProjeto: 'completo', situacao: 'existente', nome: 'Teste',
  estruturas: [{ id: 'e1', nome: 'Bloco A', areaTotal: '1200', altura: '9', alturaPisoPiso: 9, alturaEdificacao: 9, nPavimentos: 3, nSubsolos: 0, observacoes: {} }],
  pavimentos: [
    { id: 'p1', estruturaId: 'e1', label: 'Térreo', divisao: 'C-1', area: '400', pisoDescarga: true, populacaoFixa: '8' },
    { id: 'p2', estruturaId: 'e1', label: '1º pavimento', divisao: 'D-1', area: '300', pisoDescarga: false },
  ],
  cargaState: { e1: { 'C-1': { metodo: 'levantamento', valorManual: '500' } } },
  sistemas: Object.fromEntries(['acesso_viatura','seg_estrutural','compart_horizontal','compart_vertical','controle_acabamento','saida_emergencia','gerenciamento_risco','brigada','iluminacao','sinalizacao','extintores','hidrantes','alarme','deteccao','sprinklers','controle_fumaca','central_gas','spda'].map(k => [k, { obrigatorio: false, ativo: false }])),
  sistemasPorEstrutura: { e1: { hidrantes: true, alarme: true, deteccao: true } },
  riscosEspeciaisPorEstrutura: { e1: { glp: true } }, riscosOutrosDescPorEstrutura: {},
  hidrantes: { estruturasSelecionadas: [], tipo: '', tipoVariante: 0, rti: '', bombaExiste: true, recalqueEntradas: 1 },
  iluminacaoMesmoSistema: true, iluminacaoSistema: { tipo: 'bloco_autonomo', localizacaoFonte: '' }, iluminacaoSistemaPorEstrutura: {},
  memorialPB: { iluAlturaInstalacao: '2,4', compartElementos: { h: ['paredes'], v: [] }, atestos: {} },
}
// A linha ('PB','hidrantes') só existe no Supabase (sem arquivo de seed):
// no teste, a estrutura da do MA serve para renderizar a página comum.
const MA_HID = await import('../src/data/normas/MA/hidrantes.js')
const hidrantesPB = Object.fromEntries(Object.entries(MA_HID).map(([k, v]) => [k.toLowerCase(), v]))
const server = await servidorComNormas({ PB: { hidrantes: hidrantesPB } }, projeto)
after(() => server.close())
const { PAGINAS_PB } = await server.ssrLoadModule('/src/estados/PB/paginas.jsx')
const ExtensaoConfig = (await server.ssrLoadModule('/src/estados/ExtensaoConfig.jsx')).default
const { ToastContext } = await server.ssrLoadModule('/src/context/toastContext.js')
const toast = { success() {}, error() {}, warning() {}, info() {}, dismiss() {} }
const html = el => renderToString(createElement(MemoryRouter, null, createElement(ToastContext.Provider, { value: toast }, el)))

for (const [key, pagina] of Object.entries(PAGINAS_PB)) {
  test(`página PB "${key}" renderiza`, () => {
    const h = html(pagina)
    if (key === 'saida_emergencia' || key === 'hidrantes') return assert.ok(h.includes('Declarações do responsável técnico'), key)
    if (key === 'brigada') return assert.ok(h.includes('Formulário do CBMPB — item 12'), key)   // página comum + campos da PB
    assert.ok(h.includes('Formulário do Memorial Descritivo'), key)
    assert.ok(h.includes('pbf-tabela'), `${key}: sem prévia`)
  })
}

test('páginas PB mostram os valores calculados', () => {
  assert.ok(html(PAGINAS_PB.iluminacao).includes('9,6'))                 // 4 × 2,4 m
})

test('extensões da Configuração da PB renderizam', () => {
  assert.ok(html(createElement(ExtensaoConfig, { ponto: 'situacao' })).includes('Estágio de construção'))
  assert.ok(html(createElement(ExtensaoConfig, { ponto: 'classificacao' })).includes('natureza da ocupação'))
  assert.ok(html(createElement(ExtensaoConfig, { ponto: 'riscos' })).includes('GLP'))
})

test('registro por estado: documentos e textos da Configuração', async () => {
  const { documentosDoEstado, textosDoEstado, paginaDaMedida } = await server.ssrLoadModule('/src/estados/registro.js')
  assert.deepEqual(documentosDoEstado('PB', 'completo').map(d => d.tipo), ['formulario-pb'])
  assert.deepEqual(documentosDoEstado('MA', 'completo').map(d => d.tipo), ['anexo-b', 'memorial-texto'])
  assert.deepEqual(documentosDoEstado('MA', 'dimensionamento').map(d => d.tipo), ['memorial-texto'])
  assert.equal(textosDoEstado('PB').orgao, 'CBMPB')
  assert.equal(textosDoEstado('MA').orgao, 'CBMMA')
  assert.ok(paginaDaMedida('PB', 'extintores'))
  assert.equal(paginaDaMedida('MA', 'extintores'), null)
})
