// Instalador do plugin Revit (FireUtils-Setup-X.Y.Z.exe), publicado no bucket
// PRIVADO `plugin-releases` do Supabase Storage. A mesma convenção do plugin
// (webapp/src/lib/versoes.js, repositório FireUtils.extension): a versão mais
// nova é a maior entre os nomes de arquivo — não há manifest.

const NOME_DO_INSTALADOR = /^FireUtils-Setup-(\d+(?:\.\d+){0,3})\.exe$/

export const BUCKET_INSTALADOR = 'plugin-releases'

// Validade do link de download — o suficiente para o navegador começar.
const VALIDADE_LINK_S = 600

/** -1, 0 ou 1. Partes que faltam valem 0 ("2.1" = "2.1.0"). */
export function compararVersoes(a, b) {
  const pa = a.trim().split('.').map(Number)
  const pb = b.trim().split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/**
 * A maior versão entre os nomes de arquivo do bucket. Só vale o padrão exato
 * `FireUtils-Setup-X.Y.Z.exe`: rascunhos ("...-teste.exe") e qualquer outro
 * arquivo são ignorados. Devolve `{ versao, arquivo }` ou null.
 */
export function escolherUltimaVersao(nomes) {
  let melhor = null
  for (const nome of nomes) {
    const achou = NOME_DO_INSTALADOR.exec(nome)
    if (!achou) continue
    if (!melhor || compararVersoes(achou[1], melhor.versao) > 0) {
      melhor = { versao: achou[1], arquivo: nome }
    }
  }
  return melhor
}

/**
 * Gera o link temporário do instalador mais recente. Só contas com licença
 * leem o bucket (política em supabase/migrations/*plugin_releases*), então
 * uma conta sem licença cai em `erro`. Nunca lança.
 * @returns {Promise<{ ok: true, versao: string, url: string } | { ok: false, erro: string }>}
 */
export async function linkDoInstalador(supabase) {
  try {
    const { data: itens, error } = await supabase.storage.from(BUCKET_INSTALADOR).list('', { limit: 1000 })
    if (error || !itens) {
      return { ok: false, erro: 'Não foi possível consultar as versões do plugin agora.' }
    }
    const ultima = escolherUltimaVersao(itens.map(i => i.name))
    if (!ultima) return { ok: false, erro: 'Ainda não há instalador publicado.' }

    const { data, error: erroLink } = await supabase.storage
      .from(BUCKET_INSTALADOR)
      .createSignedUrl(ultima.arquivo, VALIDADE_LINK_S, { download: ultima.arquivo })
    if (erroLink || !data?.signedUrl) {
      return { ok: false, erro: 'Não foi possível gerar o link de download.' }
    }
    return { ok: true, versao: ultima.versao, url: data.signedUrl }
  } catch {
    return { ok: false, erro: 'Sem conexão para baixar o plugin.' }
  }
}
