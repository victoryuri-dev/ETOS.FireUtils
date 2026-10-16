import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { servidorComNormas } from './helpers/normasDeTeste.mjs'

// As migrações de seed são a única fonte de norma do site: o conteúdo de cada
// uma, lido pelo loader real (normas/index.js), tem de bater com o arquivo de
// seed de onde foi gerada.
const dadosDoSql = arquivo => JSON.parse(readFileSync(new URL(`../supabase/migrations/${arquivo}`, import.meta.url), 'utf8').split('$j$')[1])

const server = await servidorComNormas({
  PB: {
    extintores: dadosDoSql('20261016170000_seed_normas_extintores_pb.sql'),
    brigada: dadosDoSql('20261016180000_seed_normas_brigada_pb.sql'),
  },
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
  for (const get of ['getAV', 'getTRRF', 'getIluminacao', 'getSinalizacao', 'getCompartimentacao', 'getControleAcabamento', 'getHidrantes', 'getDeteccaoAlarme', 'getMedidas', 'getNts']) {
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

test('extintores da PB: SQL = arquivo de seed', async () => {
  const esperado = await server.ssrLoadModule('/src/data/normas/PB/extintores.js')
  const lido = normas.getExtintores('PB')
  for (const [k, v] of Object.entries(esperado)) assert.deepEqual(lido[k], JSON.parse(JSON.stringify(v)), k)
})

test('extintores do MA: SQL acrescenta norma e capacidade por nível iguais ao seed', async () => {
  const ma = await seed('extintores')
  const sql = dadosDoSql('20261016170001_add_capacidade_por_nivel_extintores_ma.sql')
  assert.deepEqual(sql, JSON.parse(JSON.stringify({ norma: ma.NORMA, capacidade_por_nivel: ma.CAPACIDADE_POR_NIVEL })))
})

test('extintores: distância portátil pela opção adotada (PB nível III) e por risco (MA)', async () => {
  const { distanciaPortatil, opcaoCapacidade } = await server.ssrLoadModule('/src/data/extintores_calc.js')
  const pb = normas.getExtintores('PB'), ma = normas.getExtintores('MA')
  assert.equal(distanciaPortatil(pb, 'baixo'), 20)
  assert.equal(distanciaPortatil(pb, 'alto'), 15)
  assert.equal(distanciaPortatil(pb, 'alto', 'nivel_III_4A'), 20)
  assert.equal(opcaoCapacidade(pb, 'alto', 'nivel_III_4A').B.capacidade, '80-B')
  assert.equal(opcaoCapacidade(pb, 'alto').B.distanciaMaxima, 10)
  assert.deepEqual(['baixo', 'medio', 'alto'].map(r => distanciaPortatil(ma, r)), [25, 20, 15])
  // a classe A da tabela coincide com DISTANCIA_MAXIMA.portatil nos dois estados
  for (const n of [pb, ma]) assert.equal(distanciaPortatil(n, 'medio'), n.DISTANCIA_MAXIMA.portatil.medio)
})

test('brigada da PB: SQL = arquivo de seed', async () => {
  const esperado = await server.ssrLoadModule('/src/data/normas/PB/brigada_incendio.js')
  const lido = normas.getBrigada('PB')
  for (const k of ['NORMA', 'TABELA_A1', 'NOTAS_TABELA_A1', 'NOTAS_GERAIS', 'OBSERVACOES_TRANSCRICAO', 'DIMENSIONAMENTO_PUBLICO']) assert.deepEqual(lido[k], JSON.parse(JSON.stringify(esperado[k])), k)
})

test('brigada da PB: exemplos da NT 17/2024 (Anexo A) e diferenças para o MA', async () => {
  const { calcularBrigadaPavimento } = await server.ssrLoadModule('/src/data/brigada_calc.js')
  const pb = normas.getBrigada('PB').TABELA_A1, ma = normas.getBrigada('MA').TABELA_A1
  const n = (div, risco, pop, tab = pb) => calcularBrigadaPavimento(div, risco, pop, 6, tab, 500).resultado?.brigadistas
  assert.equal(n('D-1', 'baixo', 25), 3)    // exemplo B
  assert.equal(n('D-1', 'medio', 19), 5)    // exemplo C.a (por pavimento)
  assert.equal(n('I-3', 'alto', 116), 19)   // exemplo C.b
  assert.equal(n('I-3', 'alto', 80), 15)    // exemplo A, diurno
  assert.equal(n('I-3', 'alto', 20), 9)     // exemplo A, noturno
  assert.equal(n('H-6', 'baixo', 10), 2)    // PB: 1-2-2-2-2
  assert.equal(n('H-6', 'medio', 10, ma), 6)
  assert.equal(n('M-5', 'alto', 10), 5)     // PB: 2-2-3-4-5 (MA: 8)
  assert.equal(normas.getBrigada('PB').TABELA_A1.find(l => l.divisoes.includes('B-2')).notas.includes(3), false)
  assert.match(calcularBrigadaPavimento('F-7', 'medio', 10, 6, pb, 500).resultado.detalhe, /item 4\.11\.2/)
  assert.match(calcularBrigadaPavimento('F-7', 'medio', 10, 6, ma, 500).resultado.detalhe, /item 5\.11\.2/)
})

test('brigada da PB: item 4.11.2 (F-7 sempre; nota 10 acima de 250 pessoas)', async () => {
  const { calcularBrigadaPavimento, brigadistasPorPublico } = await server.ssrLoadModule('/src/data/brigada_calc.js')
  const brig = normas.getBrigada('PB'), dim = brig.DIMENSIONAMENTO_PUBLICO
  assert.deepEqual([250, 1000, 1001, 2500, 4000, 10000, 10001, 11000].map(p => brigadistasPorPublico(p, dim)), [5, 5, 10, 10, 15, 20, 21, 22])
  const calc = (div, risco, popFixa, publico) => calcularBrigadaPavimento(div, risco, popFixa, 6, brig.TABELA_A1, 500, { publico, dimensionamentoPublico: dim })
  assert.equal(calc('F-7', 'medio', 0, 3000).resultado.brigadistas, 15)
  assert.equal(calc('F-7', 'medio', 0, 0).resultado.brigadistas, null)
  assert.equal(calc('F-2', 'baixo', 10, 200).resultado.brigadistas, 6)    // ≤250: Tabela A.1
  assert.equal(calc('F-2', 'baixo', 10, 800).resultado.brigadistas, 5)    // >250: item 4.11.2
  assert.equal(calc('F-6', 'medio', 10, 1500).resultado.brigadistas, 10)  // F-6 também cita a nota 10
  assert.equal(calc('F-4', 'baixo', 10, 1500).resultado.brigadistas, 6)   // sem nota 10: Tabela A.1
  // MA sem a regra: comportamento de antes
  const ma = normas.getBrigada('MA')
  assert.equal(ma.DIMENSIONAMENTO_PUBLICO, undefined)
  assert.equal(calcularBrigadaPavimento('F-2', 'baixo', 10, 6, ma.TABELA_A1, 500, {}).resultado.brigadistas, 6)
})
