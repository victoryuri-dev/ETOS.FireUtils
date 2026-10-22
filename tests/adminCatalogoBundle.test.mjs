import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gerar } from '../scripts/gerar-admin-catalogo.mjs'

const lerIndex = () => readFileSync(new URL('../supabase/functions/admin-catalogo/index.ts', import.meta.url), 'utf8')

test('admin-catalogo/index.ts está em dia com os arquivos de _shared', () => {
  assert.equal(lerIndex(), gerar(), 'rode: node scripts/gerar-admin-catalogo.mjs')
})

test('admin-catalogo/index.ts é autossuficiente (só importa o supabase-js)', () => {
  const imports = [...lerIndex().matchAll(/^import .* from '(.+)'/gm)].map((m) => m[1])
  assert.deepEqual(imports, ['jsr:@supabase/supabase-js@2'])
  assert.doesNotMatch(lerIndex(), /^export /m)
})
