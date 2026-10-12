import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolverLinksNormas } from '../src/utils/linksNormas.js'
import { LINKS_NORMAS_MA } from '../src/data/normas/MA/links_normas.js'

test('MA abre a norma específica; outros estados não recebem links do MA', () => {
  assert.equal(resolverLinksNormas('MA','controle_acabamento')[0].titulo,'NT 10')
  assert.equal(resolverLinksNormas('MA','alarme')[0].url,resolverLinksNormas('MA','deteccao')[0].url)
  assert.deepEqual(resolverLinksNormas('PE','controle_acabamento'),[])
  assert.deepEqual(resolverLinksNormas('MA','spda'),[])
})
test('configuração do banco substitui o padrão e suporta múltiplos documentos', () => {
  const links = [{titulo:'IT A',url:'https://bombeiros.exemplo.gov.br/a.pdf'},{titulo:'IT B',url:'https://bombeiros.exemplo.gov.br/b.pdf'}]
  assert.deepEqual(resolverLinksNormas('PE','alarme',{medidas:{alarme:links}}),links)
  assert.deepEqual(resolverLinksNormas('MA','alarme',{medidas:{alarme:[]}}),[])
})
test('ignora URLs inválidas, protocolos executáveis e documentos duplicados', () => {
  const link={titulo:'IT',url:'https://bombeiros.exemplo.gov.br/norma.pdf'}
  assert.deepEqual(resolverLinksNormas('PE','alarme',{medidas:{alarme:[link,link,{titulo:'X',url:'javascript:alert(1)'},{titulo:'X',url:'https://user:senha@exemplo.gov.br/x'},{titulo:'X',url:'inválido'}]}}),[link])
})
test('SQL entrega os mesmos endereços oficiais do fallback', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20261012200000_links_normas_por_estado.sql',import.meta.url),'utf8')
  assert.deepEqual(JSON.parse(sql.split('$links$')[1]),LINKS_NORMAS_MA)
  assert.ok(sql.includes('on conflict (uf, sistema)'))
})
