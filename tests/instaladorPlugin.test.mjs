import test from 'node:test'
import assert from 'node:assert/strict'
import { escolherUltimaVersao, linkDoInstalador } from '../src/lib/instaladorPlugin.js'

test('escolhe a maior versão pelo nome do arquivo, não pela ordem', () => {
  const r = escolherUltimaVersao(['FireUtils-Setup-3.0.0.exe', 'FireUtils-Setup-3.10.0.exe', 'FireUtils-Setup-3.9.9.exe'])
  assert.deepEqual(r, { versao: '3.10.0', arquivo: 'FireUtils-Setup-3.10.0.exe' })
})

test('ignora rascunhos e outros arquivos', () => {
  assert.equal(escolherUltimaVersao(['FireUtils-Setup-9.0.0-teste.exe', 'manifest.json', 'x.exe']), null)
})

function supabaseFalso({ itens, listaErro = null, link = 'https://x/y.exe', linkErro = null }) {
  return {
    storage: {
      from: () => ({
        list: async () => ({ data: itens, error: listaErro }),
        createSignedUrl: async (arquivo, _s, opcoes) => ({
          data: linkErro ? null : { signedUrl: `${link}?f=${arquivo}&d=${opcoes.download}` },
          error: linkErro,
        }),
      }),
    },
  }
}

test('linkDoInstalador devolve o link do mais recente', async () => {
  const r = await linkDoInstalador(supabaseFalso({ itens: [{ name: 'FireUtils-Setup-3.0.0.exe' }, { name: 'FireUtils-Setup-3.0.1.exe' }] }))
  assert.equal(r.ok, true)
  assert.equal(r.versao, '3.0.1')
  assert.match(r.url, /FireUtils-Setup-3\.0\.1\.exe/)
})

test('sem instalador, sem permissão ou sem rede, devolve erro em vez de lançar', async () => {
  assert.equal((await linkDoInstalador(supabaseFalso({ itens: [] }))).ok, false)
  assert.equal((await linkDoInstalador(supabaseFalso({ itens: null, listaErro: { message: 'x' } }))).ok, false)
  assert.equal((await linkDoInstalador({ storage: { from: () => { throw new Error('rede') } } })).ok, false)
})
