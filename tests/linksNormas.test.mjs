import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolverLinksNormas } from '../src/utils/linksNormas.js'
import { LINKS_NORMAS_MA } from '../src/data/normas/MA/links_normas.js'

test('links só da base central: sem linha cadastrada, nenhum link (nem os do MA)', () => {
  assert.deepEqual(resolverLinksNormas('MA','controle_acabamento'),[])
  assert.deepEqual(resolverLinksNormas('PE','controle_acabamento'),[])
  // Com a linha do MA (mesmo conteúdo do seed), abre a norma específica.
  assert.equal(resolverLinksNormas('MA','controle_acabamento',LINKS_NORMAS_MA)[0].titulo,'NT 10')
  assert.equal(resolverLinksNormas('MA','alarme',LINKS_NORMAS_MA)[0].url,resolverLinksNormas('MA','deteccao',LINKS_NORMAS_MA)[0].url)
  assert.deepEqual(resolverLinksNormas('MA','spda',LINKS_NORMAS_MA),[])
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
test('SQL de seed entrega os mesmos endereços do arquivo de seed', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20261012200000_links_normas_por_estado.sql',import.meta.url),'utf8')
  assert.deepEqual(JSON.parse(sql.split('$links$')[1]),LINKS_NORMAS_MA)
  assert.ok(sql.includes('on conflict (uf, sistema)'))
})
