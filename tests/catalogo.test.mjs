import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canonico, classificarArquivos, diferencas, gerarCatalogo, rascunhoDoCatalogo, slugify, verificarRascunho,
} from '../supabase/functions/_shared/catalogo.ts'

const HASH = 'a'.repeat(64)
const cat = (id, nome, ordem = 0, icon_key = null) => ({ id, nome, icon_key, ordem })
const fam = (id, nome, category_id, extra = {}) => ({
  id, nome, category_id, thumbnail_key: null, storage_key: `${category_id}/${id}.rfa`,
  size_bytes: 100, sha256: HASH, ordem: 0, ...extra,
})

test('slugify igual ao generate_catalog.py', () => {
  assert.equal(slugify('Extintor Portátil - ABC'), 'extintor-portatil-abc')
  assert.equal(slugify('Saída de Emergência'), 'saida-de-emergencia')
  assert.equal(slugify('  ***  '), 'item')
  assert.equal(slugify('Ação ø Ünico'), 'acao-unico')
})

test('gerarCatalogo respeita o contrato e a ordem', () => {
  const r = {
    categorias: [cat('b', 'Beta', 2), cat('a', 'Alfa', 1, 'icons/a.png')],
    familias: [fam('b__z', 'Z', 'b', { ordem: 2 }), fam('b__y', 'Y', 'b', { ordem: 1 }), fam('a__k', 'K', 'a')],
    todasIconKey: 'icons/todas.png',
  }
  const j = gerarCatalogo(r, '2026-10-22T00:00:00Z')
  assert.deepEqual(Object.keys(j), ['generated_at', 'todas_icon_key', 'categories', 'families'])
  assert.deepEqual(j.categories.map((c) => c.id), ['a', 'b'])
  assert.deepEqual(j.families.map((f) => f.id), ['a__k', 'b__y', 'b__z'])
  assert.deepEqual(Object.keys(j.families[0]), ['id', 'name', 'category_id', 'category', 'thumbnail_key', 'storage_key', 'size_bytes', 'sha256'])
  assert.equal(j.families[0].category, 'Alfa')
})

test('importar e gerar de novo devolve o mesmo catálogo', () => {
  const original = gerarCatalogo({
    categorias: [cat('a', 'Alfa', 0, 'icons/a.png'), cat('b', 'Beta', 1)],
    familias: [fam('a__k', 'K', 'a', { thumbnail_key: 'thumbnails/a/k.png' }), fam('b__j', 'J', 'b', { ordem: 1 })],
    todasIconKey: 'icons/todas.png',
  }, 'x')
  const volta = gerarCatalogo(rascunhoDoCatalogo(original), 'y')
  assert.equal(canonico(volta), canonico(original))
})

const base = () => ({
  categorias: [cat('a', 'Alfa', 0, 'icons/a.png')],
  familias: [fam('a__k', 'K', 'a', { thumbnail_key: 'thumbnails/a/k.png' })],
  todasIconKey: 'icons/todas.png',
})
const arquivos = () => [
  { bucket: 'revit-families', key: 'a/a__k.rfa', size: 100 },
  { bucket: 'plugin-assets', key: 'thumbnails/a/k.png', size: 5 },
  { bucket: 'plugin-assets', key: 'icons/a.png', size: 5 },
  { bucket: 'plugin-assets', key: 'icons/todas.png', size: 5 },
]

test('verificarRascunho: consistente não tem bloqueio', () => {
  assert.deepEqual(verificarRascunho(base(), arquivos()).filter((p) => p.bloqueia), [])
})

test('verificarRascunho: fantasmas e tamanho divergente bloqueiam', () => {
  const sem = arquivos().filter((a) => !a.key.endsWith('.rfa') && !a.key.includes('thumbnails') && a.key !== 'icons/todas.png')
  const tipos = verificarRascunho(base(), sem).filter((p) => p.bloqueia).map((p) => p.tipo).sort()
  assert.deepEqual(tipos, ['familia_ausente', 'icone_ausente', 'thumbnail_ausente'])
  const errado = arquivos().map((a) => (a.key.endsWith('.rfa') ? { ...a, size: 99 } : a))
  assert.deepEqual(verificarRascunho(base(), errado).filter((p) => p.bloqueia).map((p) => p.tipo), ['tamanho_divergente'])
})

test('verificarRascunho: avisos não bloqueiam', () => {
  const r = { ...base(), categorias: [cat('a', 'Alfa'), cat('v', 'Vazia', 1)], familias: [fam('a__k', 'K', 'a')] }
  const ps = verificarRascunho(r, arquivos())
  assert.equal(ps.some((p) => p.bloqueia), false)
  assert.deepEqual(ps.map((p) => p.tipo).sort(), ['categoria_sem_icone', 'categoria_sem_icone', 'categoria_vazia', 'familia_sem_miniatura'])
})

test('classificarArquivos: em uso, só publicado e órfão', () => {
  const publicado = { categorias: [cat('a', 'Alfa')], familias: [fam('a__velha', 'Velha', 'a')], todasIconKey: null }
  const lista = [...arquivos(), { bucket: 'revit-families', key: 'a/a__velha.rfa', size: 1 }, { bucket: 'revit-families', key: 'a/lixo.rfa', size: 1 }]
  const s = Object.fromEntries(classificarArquivos(lista, base(), publicado).map((a) => [a.key, a.situacao]))
  assert.equal(s['a/a__k.rfa'], 'em_uso')
  assert.equal(s['a/a__velha.rfa'], 'so_publicado')
  assert.equal(s['a/lixo.rfa'], 'orfao')
})

test('diferencas lista o que mudou em relação ao publicado', () => {
  const pub = base()
  const novo = { ...base(), familias: [fam('a__k', 'K2', 'a', { thumbnail_key: 'thumbnails/a/k.png' }), fam('a__m', 'M', 'a')] }
  const d = diferencas(novo, pub)
  assert.deepEqual(d.familias.adicionadas, ['M'])
  assert.deepEqual(d.familias.alteradas, ['K2'])
  assert.deepEqual(d.familias.removidas, [])
  assert.equal(canonico(gerarCatalogo(pub, 'a')), canonico(gerarCatalogo(base(), 'b')))
})
