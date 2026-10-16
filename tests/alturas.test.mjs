import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { servidorComNormas } from './helpers/normasDeTeste.mjs'

const server = await servidorComNormas()
after(() => server.close())
const { limparAlturasOcultas } = await server.ssrLoadModule('/src/data/trrf_calc.js')

test('térrea sem subsolo: zera altura da edificação e profundidade do subsolo', () => {
  const e = limparAlturasOcultas({ nPavimentos: 1, nSubsolos: 0, alturaEdificacao: '9', profundidadeSubsolo: '3' })
  assert.equal(e.alturaEdificacao, '')
  assert.equal(e.profundidadeSubsolo, '')
})

test('térrea com subsolo mantém a profundidade (é a altura da edificação nesse caso)', () => {
  const e = limparAlturasOcultas({ nPavimentos: 1, nSubsolos: 1, alturaEdificacao: '9', profundidadeSubsolo: '3' })
  assert.equal(e.alturaEdificacao, '')
  assert.equal(e.profundidadeSubsolo, '3')
})

test('mais de um pavimento sem subsolo mantém a altura e zera só a profundidade', () => {
  const e = limparAlturasOcultas({ nPavimentos: 3, nSubsolos: 0, alturaEdificacao: '9', profundidadeSubsolo: '3' })
  assert.equal(e.alturaEdificacao, '9')
  assert.equal(e.profundidadeSubsolo, '')
})

test('nada a limpar devolve o mesmo objeto', () => {
  const est = { nPavimentos: 3, nSubsolos: 1, alturaEdificacao: '9', profundidadeSubsolo: '3' }
  assert.equal(limparAlturasOcultas(est), est)
})
