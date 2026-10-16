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
  assert.equal(normas.getSE('PB').TIPOS_ESCADA, null)
})

test('sinalização: pictograma casado pelo key, fora da base', () => {
  const placas = normas.getSinalizacao('MA').TIPOS_PLACA
  assert.ok(placas.length > 0)
  assert.ok(placas.every(p => p.img), 'toda placa com imagem')
})
