import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classificarPavimentos } from '../src/utils/classificacao.js'

const pav = area => ({ divisao:'C-2', acess:[{ divisao:'D-1', area }] })
test('até 10% permanece subsidiária; acima de 10% torna a edificação mista', () => {
  for (const area of [99,100]) {
    const c = classificarPavimentos([pav(area)],1000)
    assert.equal(c.edificacaoMista,false)
    assert.deepEqual(c.subsidiarias,['D-1'])
  }
  const c = classificarPavimentos([pav(101)],1000)
  assert.equal(c.edificacaoMista,true)
  assert.deepEqual(c.subsidiarias,[])
  assert.deepEqual(c.mistaDivs,['C-2','D-1'])
})
test('soma a área de uma mesma divisão entre pavimentos', () => {
  const c = classificarPavimentos([pav(60),pav(60)],1000)
  assert.equal(c.edificacaoMista,true)
  assert.equal(c.subsidiariasRaw[0].area,120)
  assert.equal(c.subsidiariasRaw[0].percentual,12)
})
test('sem área da estrutura não presume ocupação secundária', () => {
  assert.equal(classificarPavimentos([pav(500)],'').edificacaoMista,false)
  assert.equal(classificarPavimentos([{divisao:'C-2'}],1000).edificacaoMista,false)
})
