import { LINKS_NORMAS_MA } from '../data/normas/MA/links_normas.js'

export function resolverLinksNormas(uf, sistema, remoto) {
  const estado = String(uf || '').trim().toUpperCase()
  const fallback = estado === 'MA' ? LINKS_NORMAS_MA : null
  const links = remoto?.medidas?.[sistema] ?? fallback?.medidas?.[sistema] ?? []
  if (!Array.isArray(links)) return []
  const vistos = new Set()
  return links.filter(link => {
    if (!link || typeof link.titulo !== 'string' || !link.titulo.trim()) return false
    try {
      const url = new URL(link.url)
      if (url.protocol !== 'https:' || url.username || url.password || vistos.has(url.href)) return false
      vistos.add(url.href)
      return true
    } catch { return false }
  }).map(link => ({ titulo:link.titulo.trim(), url:new URL(link.url).href }))
}
