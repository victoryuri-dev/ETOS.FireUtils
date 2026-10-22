import test from 'node:test'
import assert from 'node:assert/strict'
import { criarHandler } from '../supabase/functions/_shared/adminCatalogo.ts'

const HASH = 'b'.repeat(64)

// Supabase falso em memória: só o que a function usa.
function criarFake({ admin = true, tabelas = {}, buckets = {} } = {}) {
  const t = {
    admins: admin ? [{ user_id: 'u1' }] : [],
    catalogo_categorias: [], catalogo_familias: [], catalogo_config: [{ id: true, todas_icon_key: null, publicado_em: null }],
    admin_auditoria: [], ...tabelas,
  }
  const b = { 'revit-families': {}, 'plugin-assets': {}, ...buckets }
  const uploads = []
  const removidos = []

  function consulta(nome) {
    const q = { filtros: [], op: null, dados: null }
    const aplica = () => t[nome].filter((r) => q.filtros.every(([c, v]) => r[c] === v))
    const b_ = {
      select: () => b_,
      eq: (c, v) => { q.filtros.push([c, v]); return b_ },
      maybeSingle: async () => ({ data: aplica()[0] ?? null, error: null }),
      insert: async (o) => { t[nome].push(...[].concat(o)); return { error: null } },
      upsert: async (linhas, { onConflict }) => {
        for (const l of linhas) {
          const i = t[nome].findIndex((r) => r[onConflict] === l[onConflict])
          if (i >= 0) t[nome][i] = { ...t[nome][i], ...l }
          else t[nome].push(l)
        }
        return { error: null }
      },
      update: (o) => { q.op = 'update'; q.dados = o; return b_ },
      then: (res, rej) => {
        if (q.op === 'update') aplica().forEach((r) => Object.assign(r, q.dados))
        return Promise.resolve({ data: q.op ? null : aplica(), error: null }).then(res, rej)
      },
    }
    return b_
  }

  const storage = {
    from: (bucket) => ({
      list: async (prefixo, { limit, offset }) => {
        const ini = prefixo ? `${prefixo}/` : ''
        const nomes = new Map()
        for (const [key, obj] of Object.entries(b[bucket])) {
          if (!key.startsWith(ini)) continue
          const resto = key.slice(ini.length)
          const [primeiro, ...mais] = resto.split('/')
          nomes.set(primeiro, mais.length ? { name: primeiro, id: null } : { name: primeiro, id: 'x', metadata: { size: obj.size } })
        }
        return { data: [...nomes.values()].slice(offset, offset + limit), error: null }
      },
      download: async (key) => (b[bucket][key]
        ? { data: { text: async () => b[bucket][key].corpo }, error: null }
        : { data: null, error: { message: 'not found' } }),
      upload: async (key, blob) => {
        const corpo = await blob.text()
        b[bucket][key] = { size: corpo.length, corpo }
        uploads.push({ bucket, key })
        return { error: null }
      },
      remove: async (keys) => { keys.forEach((k) => { delete b[bucket][k]; removidos.push(`${bucket}/${k}`) }); return { error: null } },
    }),
  }

  const supabase = {
    auth: { getUser: async (tok) => (tok === 'ok' ? { data: { user: { id: 'u1', email: 'a@x' } }, error: null } : { data: null, error: { message: 'x' } }) },
    from: consulta,
    storage,
  }
  return { supabase, t, b, uploads, removidos }
}

const chamar = (fake, corpo, token = 'ok') =>
  criarHandler(fake.supabase)(new Request('http://x', {
    method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(corpo),
  })).then(async (r) => ({ status: r.status, corpo: await r.json() }))

const arq = (size) => ({ size, corpo: 'x'.repeat(size) })
const catalogoConsistente = () => ({
  tabelas: {
    catalogo_categorias: [{ id: 'a', nome: 'Alfa', icon_key: 'icons/a.png', ordem: 0 }],
    catalogo_familias: [{ id: 'a__k', nome: 'K', category_id: 'a', thumbnail_key: 'thumbnails/a/k.png', storage_key: 'a/k.rfa', size_bytes: 10, sha256: HASH, ordem: 0 }],
    catalogo_config: [{ id: true, todas_icon_key: 'icons/todas.png', publicado_em: null }],
  },
  buckets: {
    'revit-families': { 'a/k.rfa': arq(10) },
    'plugin-assets': { 'icons/a.png': arq(3), 'icons/todas.png': arq(3), 'thumbnails/a/k.png': arq(3) },
  },
})

test('sem token 401; não-admin 403; ação desconhecida 400', async () => {
  assert.equal((await chamar(criarFake(), { acao: 'verificar' }, '')).status, 401)
  assert.equal((await chamar(criarFake(), { acao: 'verificar' }, 'ruim')).status, 401)
  assert.equal((await chamar(criarFake({ admin: false }), { acao: 'verificar' })).status, 403)
  assert.equal((await chamar(criarFake(), { acao: 'x' })).status, 400)
})

test('verificar: catálogo consistente, nada publicado ainda', async () => {
  const f = criarFake(catalogoConsistente())
  const { status, corpo } = await chamar(f, { acao: 'verificar' })
  assert.equal(status, 200)
  assert.equal(corpo.resumo.fantasmas, 0)
  assert.equal(corpo.resumo.orfaos, 0)
  assert.equal(corpo.publicacao.existe, false)
  assert.deepEqual(corpo.publicacao.diferencas.familias.adicionadas, ['K'])
})

test('verificar: acha fantasma e órfão', async () => {
  const dados = catalogoConsistente()
  delete dados.buckets['revit-families']['a/k.rfa']
  dados.buckets['revit-families']['a/lixo.rfa'] = arq(1)
  dados.buckets['plugin-assets']['catalog.json'] = arq(1) // fora do escopo: não conta
  const { corpo } = await chamar(criarFake(dados), { acao: 'verificar' })
  assert.equal(corpo.resumo.fantasmas, 1)
  assert.equal(corpo.problemas.find((p) => p.bloqueia).tipo, 'familia_ausente')
  assert.deepEqual(corpo.arquivos.filter((a) => a.situacao === 'orfao').map((a) => a.key), ['a/lixo.rfa'])
  assert.equal(corpo.arquivos.some((a) => a.key === 'catalog.json'), false)
})

test('publicar: recusa catálogo com fantasma e não escreve nada', async () => {
  const dados = catalogoConsistente()
  delete dados.buckets['plugin-assets']['thumbnails/a/k.png']
  const f = criarFake(dados)
  const { status, corpo } = await chamar(f, { acao: 'publicar' })
  assert.equal(status, 409)
  assert.equal(corpo.problemas[0].tipo, 'thumbnail_ausente')
  assert.deepEqual(f.uploads, [])
})

test('publicar: gera o contrato, grava config e auditoria; depois fica sincronizado', async () => {
  const f = criarFake(catalogoConsistente())
  const r = await chamar(f, { acao: 'publicar' })
  assert.equal(r.status, 200)
  assert.deepEqual(f.uploads, [{ bucket: 'plugin-assets', key: 'catalog.json' }])
  const pub = JSON.parse(f.b['plugin-assets']['catalog.json'].corpo)
  assert.deepEqual(Object.keys(pub), ['generated_at', 'todas_icon_key', 'categories', 'families'])
  assert.equal(pub.families[0].category, 'Alfa')
  assert.ok(f.t.catalogo_config[0].publicado_em)
  assert.equal(f.t.admin_auditoria[0].acao, 'catalogo.publicar')
  const v = await chamar(f, { acao: 'verificar' })
  assert.equal(v.corpo.publicacao.sincronizado, true)
})

test('importar: preenche tabelas vazias a partir do publicado; recusa se já há dados', async () => {
  const origem = criarFake(catalogoConsistente())
  await chamar(origem, { acao: 'publicar' })
  const f = criarFake({ buckets: origem.b })
  const r = await chamar(f, { acao: 'importar' })
  assert.equal(r.status, 200)
  assert.equal(f.t.catalogo_categorias.length, 1)
  assert.equal(f.t.catalogo_familias[0].storage_key, 'a/k.rfa')
  assert.equal(f.t.catalogo_config[0].todas_icon_key, 'icons/todas.png')
  assert.equal((await chamar(f, { acao: 'importar' })).status, 409)
  assert.equal((await chamar(f, { acao: 'importar', sobrescrever: true })).status, 200)
})

test('remover_orfaos: só apaga órfão; protege em uso e o que o publicado ainda cita', async () => {
  const f = criarFake(catalogoConsistente())
  await chamar(f, { acao: 'publicar' })
  // A família sai do rascunho: o .rfa passa a ser "só publicado".
  f.t.catalogo_familias.length = 0
  f.b['revit-families']['a/lixo.rfa'] = arq(1)
  const r = await chamar(f, {
    acao: 'remover_orfaos',
    itens: [
      { bucket: 'revit-families', key: 'a/lixo.rfa' },
      { bucket: 'revit-families', key: 'a/k.rfa' },
      { bucket: 'plugin-assets', key: 'icons/a.png' },
    ],
  })
  assert.equal(r.status, 200)
  assert.deepEqual(f.removidos, ['revit-families/a/lixo.rfa'])
  assert.equal(r.corpo.ignorados.length, 2)
  assert.match(r.corpo.ignorados.find((i) => i.key === 'a/k.rfa').motivo, /publicado/)
})

test('remover_orfaos: rejeita chave fora do escopo', async () => {
  const f = criarFake(catalogoConsistente())
  for (const item of [
    { bucket: 'plugin-assets', key: 'catalog.json' },
    { bucket: 'revit-families', key: '../x' },
    { bucket: 'outro', key: 'a' },
  ]) {
    assert.equal((await chamar(f, { acao: 'remover_orfaos', itens: [item] })).status, 400)
  }
  assert.deepEqual(f.removidos, [])
})
