// Links das normas por medida — só da base central (normas_dados, sistema
// 'links_normas' do estado); sem linha cadastrada, nenhum link. O arquivo
// data/normas/MA/links_normas.js é só a fonte do seed (migração
// 20261012200000_links_normas_por_estado.sql).
export function resolverLinksNormas(uf, sistema, remoto) {
  const links = remoto?.medidas?.[sistema] ?? []
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
