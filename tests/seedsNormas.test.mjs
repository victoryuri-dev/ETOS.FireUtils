import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { servidorComNormas } from './helpers/normasDeTeste.mjs'

// As migrações de seed são a única fonte de norma do site: o conteúdo de cada
// uma, lido pelo loader real (normas/index.js), tem de bater com o arquivo de
// seed de onde foi gerada.
const dadosDoSql = arquivo => JSON.parse(readFileSync(new URL(`../supabase/migrations/${arquivo}`, import.meta.url), 'utf8').split('$j$')[1])

const server = await servidorComNormas({
  MA: {
    compartimentacao: dadosDoSql('20261016140000_seed_normas_compartimentacao_ma.sql'),
    controle_acabamento: dadosDoSql('20261016140001_seed_normas_controle_acabamento_ma.sql'),
  },
})
after(() => server.close())
const normas = await server.ssrLoadModule('/src/data/normas/index.js')
const seed = arquivo => server.ssrLoadModule(`/src/data/normas/MA/${arquivo}.js`)

test('compartimentação do MA: SQL = arquivo de seed (inclusive "sem teto" = Infinity)', async () => {
  const esperado = await seed('compartimentacao')
  const lido = normas.getCompartimentacao('MA')
  for (const [k, v] of Object.entries(esperado)) assert.deepEqual(lido[k], v, k)
  assert.equal(lido.CLASSES_TIPO_EDIFICACAO.at(-1).max, Infinity)
})

test('CMAR do MA: SQL = arquivo de seed', async () => {
  const esperado = await seed('controle_acabamento')
  const lido = normas.getControleAcabamento('MA')
  for (const [k, v] of Object.entries(esperado)) assert.deepEqual(lido[k], v, k)
})

test('tipos de escada do MA: SQL = arquivo de seed', async () => {
  const sql = readFileSync(new URL('../supabase/migrations/20260926140000_add_tipos_escada_saida_emergencia_ma.sql', import.meta.url), 'utf8')
  assert.deepEqual(JSON.parse(sql.split('$j$')[1]), JSON.parse(JSON.stringify((await seed('saida_emergencia')).TIPOS_ESCADA)))
})

test('sem o sistema cadastrado para o estado, o getter devolve null (nunca a norma de outro estado)', () => {
  for (const get of ['getAV', 'getTRRF', 'getExtintores', 'getIluminacao', 'getSinalizacao', 'getCompartimentacao', 'getControleAcabamento', 'getHidrantes', 'getBrigada', 'getDeteccaoAlarme', 'getMedidas', 'getNts']) {
    assert.equal(normas[get]('PB'), null, get)
  }
  assert.ok(normas.getSE('PB'))
})

test('tipos de escada da PB: SQL = arquivo de seed', async () => {
  const sql = readFileSync(new URL('../supabase/migrations/20261016150000_add_tipos_escada_saida_emergencia_pb.sql', import.meta.url), 'utf8')
  const pb = await server.ssrLoadModule('/src/data/normas/PB/saida_emergencia.js')
  assert.deepEqual(JSON.parse(sql.split('$j$')[1]), JSON.parse(JSON.stringify(pb.TIPOS_ESCADA)))
})

test('tipos de escada da PB: linha do grupo, diferenças do MA e "EP+"', async () => {
  const { tipoEscadaEstrutura } = await server.ssrLoadModule('/src/data/se_calc.js')
  const te = normas.getSE('PB').TIPOS_ESCADA
  const est = h => ({ nPavimentos: 3, alturaPisoPiso: h })
  const exigido = (h, divs) => tipoEscadaEstrutura(est(h), divs, te)
  assert.equal(exigido(10, ['B-1']).exigido, 'EP')           // linha do grupo B
  assert.equal(exigido(10, ['L-4']).exigido, 'EP')           // L-4 cai na linha do grupo L
  assert.equal(exigido(40, ['G-3']).exigido, 'PF')           // MA: EP
  assert.equal(tipoEscadaEstrutura(est(40), ['G-3'], normas.getSE('MA').TIPOS_ESCADA).exigido, 'EP')
  const m1 = exigido(20, ['M-1'])
  assert.equal(m1.exigido, 'EP')
  assert.equal(m1.consultar, true)
  assert.equal(exigido(10, ['M-1']).consultar, false)
  assert.equal(exigido(20, ['M-1', 'C-2']).exigido, 'PF')    // mais restritivo
})

test('sinalização: pictograma casado pelo key, fora da base', () => {
  const placas = normas.getSinalizacao('MA').TIPOS_PLACA
  assert.ok(placas.length > 0)
  assert.ok(placas.every(p => p.img), 'toda placa com imagem')
})
