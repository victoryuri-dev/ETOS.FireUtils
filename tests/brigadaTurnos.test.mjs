// Divisão dos brigadistas por turno (utils/brigadaTurnos.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { configTurnos, dividirIgualmente, valoresTurnos, limitarValorTurno, linhasTurnos } from '../src/utils/brigadaTurnos.js'

test('padrão: matutino e vespertino marcados, divisão igual ligada', () => {
  const cfg = configTurnos({})
  assert.deepEqual(cfg.ativos, { matutino: true, vespertino: true, noturno: false })
  assert.equal(cfg.dividirIgual, true)
  assert.deepEqual(valoresTurnos(cfg, 8), { matutino: 4, vespertino: 4 })
})

test('divisão igual: a sobra vai para o matutino', () => {
  assert.deepEqual(dividirIgualmente(5, ['matutino', 'vespertino']), { matutino: 3, vespertino: 2 })
  assert.deepEqual(dividirIgualmente(7, ['matutino', 'vespertino', 'noturno']), { matutino: 3, vespertino: 2, noturno: 2 })
  assert.deepEqual(dividirIgualmente(3, ['vespertino', 'noturno']), { vespertino: 2, noturno: 1 })
})

test('manual: valor que passa do total é reduzido do excesso', () => {
  const est = { brigadaTurnos: { ativos: { noturno: true }, dividirIgual: false, valores: { matutino: 4, vespertino: 3, noturno: 0 } } }
  const cfg = configTurnos(est)
  // total 10: 4 + 3 já usados, cabem 3 no noturno; digitou 6 → 3 a mais
  assert.deepEqual(limitarValorTurno(cfg, 10, 'noturno', '6'), { valor: 3, excesso: 3 })
  assert.deepEqual(limitarValorTurno(cfg, 10, 'noturno', '2'), { valor: 2, excesso: 0 })
})

test('memorial: uma linha por turno marcado', () => {
  assert.deepEqual(linhasTurnos({}, 5), [{ label: 'Matutino', valor: '3' }, { label: 'Vespertino', valor: '2' }])
  const est = { brigadaTurnos: { ativos: { noturno: true }, dividirIgual: false, valores: { matutino: '2', vespertino: '', noturno: 1 } } }
  assert.deepEqual(linhasTurnos(est, 3).map(l => l.valor), ['2', '0', '1'])
})
