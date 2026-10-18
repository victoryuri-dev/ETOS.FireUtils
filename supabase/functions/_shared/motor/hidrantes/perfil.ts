// Perfil normativo de hidrantes — o que o motor lê da base central
// (`normas_dados`, uf + sistema='hidrantes') para dimensionar.
//
// Porte de lib/normas/__init__.py (get_estado, parte de hidrantes) e de
// lib/hidrantes/norm_profiles.py (get_profile/req/opt) do plugin. A conversão
// do payload do Supabase para o "vocabulário do motor" (q_min, p_min,
// mang_dn...) é a mesma que o plugin fazia — assim os resultados gravados no
// firedata.json continuam no formato que a dockpane e o site já leem.
//
// Por que a norma é lida AQUI e não enviada pelo cliente: quem manda Pmin,
// vazão ou tolerância junto do pedido poderia baixar o próprio requisito e
// "aprovar" um sistema que não atende. O cliente só diz a UF e o tipo
// classificado; os números normativos vêm sempre do servidor.

export class NormProfileError extends Error {}

export interface VarianteTipo {
  mang_dn: number | null
  mang_comp: number | null
  q_min: number | null
  p_min: number | null
  expedicoes: string | null
  esguicho_dn: number | null
}

export interface TipoSistema {
  descricao: string | null
  variantes: VarianteTipo[]
}

export interface PerfilHidrantes {
  norma?: string
  tipos?: Record<number, TipoSistema>
  hazen_c?: Record<string, number>
  v_max_tubulacao?: number
  v_max_succao_positiva?: number
  v_max_succao_negativa?: number
  tolerancia_equilibrio_mca?: number
  npshd_fator_vazao?: number
  hidrantes_simultaneos?: number
  _uf_solicitada: string
  _uf_efetiva: string
  [chave: string]: unknown
}

// Chaves copiadas direto do payload central, sem mudar de forma.
const CHAVES_HIDRANTES = [
  'v_max_tubulacao',
  'v_max_tubulacao_ref',
  'v_max_succao_positiva',
  'v_max_succao_negativa',
  'v_max_succao_ref',
  'tolerancia_equilibrio_mca',
  'tolerancia_equilibrio_mca_ref',
  'npshd_fator_vazao',
  'npshd_ref',
  'hidrantes_simultaneos',
  'hidrantes_simultaneos_ref',
]

// O payload central usa nomes longos para dois materiais; o motor sempre
// indexou o coeficiente C pelos apelidos curtos.
const ALIAS_MATERIAL_TUBULACAO: Record<string, string> = {
  ferro_fundido_sem_revest: 'ff_sem_revest',
  ferro_fundido_com_cimento: 'ff_revest_cimento',
}

// deno-lint-ignore no-explicit-any
type Json = any

function hazenCDaBaseCentral(materiais: Json): Record<string, number> {
  const hazenC: Record<string, number> = {}
  for (const item of materiais ?? []) {
    const chave = item?.key
    const fator = item?.fatorC
    if (!chave || fator === null || fator === undefined) continue
    hazenC[ALIAS_MATERIAL_TUBULACAO[chave] ?? chave] = fator
  }
  return hazenC
}

function tiposDaBaseCentral(tiposSistemaRemoto: Json): Record<number, TipoSistema> {
  const tipos: Record<number, TipoSistema> = {}
  for (const [tipoStr, dados] of Object.entries(tiposSistemaRemoto ?? {}) as Array<[string, Json]>) {
    const tipoNum = Number.parseInt(tipoStr, 10)
    if (Number.isNaN(tipoNum)) continue
    tipos[tipoNum] = {
      descricao: dados?.label ?? null,
      variantes: (dados?.variantes ?? []).map((v: Json) => ({
        mang_dn: v?.mangueiraDn ?? null,
        mang_comp: v?.mangueiraComprimento ?? null,
        q_min: dados?.vazaoMin ?? null,
        p_min: v?.pressaoMin ?? null,
        expedicoes: dados?.expedicoes ?? null,
        esguicho_dn: v?.esguicho ?? null,
      })),
    }
  }
  return tipos
}

/**
 * Converte o payload cru de normas_dados (sistema='hidrantes') no perfil do
 * motor. Devolve null se o payload não tem nada do domínio — quem chama
 * decide o fallback.
 */
export function montarPerfil(remoto: Json): Omit<PerfilHidrantes, '_uf_solicitada' | '_uf_efetiva'> | null {
  if (!remoto) return null

  const perfil: Json = {}
  for (const chave of CHAVES_HIDRANTES) {
    if (chave in remoto) perfil[chave] = remoto[chave]
  }

  const hazenC = hazenCDaBaseCentral(remoto.materiais_tubulacao)
  if (Object.keys(hazenC).length) perfil.hazen_c = hazenC

  const norma = remoto.norma
  if (norma && typeof norma === 'object' && norma.nome) perfil.norma = norma.nome

  const tipos = tiposDaBaseCentral(remoto.tipos_sistema)
  if (Object.keys(tipos).length) perfil.tipos = tipos

  return Object.keys(perfil).length ? perfil : null
}

/** Mesmo `get_profile` do plugin: UF sem domínio de hidrantes cai inteira para MA. */
export function resolverPerfil(
  uf: string | null | undefined,
  buscar: (uf: string) => Json,
): PerfilHidrantes {
  const solicitada = (uf || 'MA').toUpperCase()

  let dados = montarPerfil(buscar(solicitada))
  let efetiva = solicitada

  if (!dados) {
    efetiva = 'MA'
    dados = montarPerfil(buscar('MA'))
    if (!dados) {
      throw new NormProfileError(
        "Nenhum perfil normativo de hidrantes disponivel (nem 'MA'). " +
          "Verifique se a tabela normas_dados do Supabase tem uma linha uf='MA', sistema='hidrantes'.",
      )
    }
  }

  return { ...dados, _uf_solicitada: solicitada, _uf_efetiva: efetiva }
}

/** Chave obrigatória do perfil; erro claro se faltar, nunca usa outro estado como fallback. */
export function req<T = unknown>(perfil: PerfilHidrantes, chave: string): T {
  if (!(chave in perfil)) {
    throw new NormProfileError(
      `O perfil normativo '${perfil._uf_efetiva ?? '?'}' (${perfil.norma ?? '?'}) nao define o parametro ` +
        `obrigatorio '${chave}'. Verifique a linha uf='${perfil._uf_efetiva ?? '?'}', ` +
        `sistema='hidrantes' na tabela normas_dados do Supabase.`,
    )
  }
  return perfil[chave] as T
}

/** Chave opcional do perfil. */
export function opt<T>(perfil: PerfilHidrantes, chave: string, padrao: T): T {
  const valor = perfil[chave]
  return valor === null || valor === undefined ? padrao : (valor as T)
}

// Cache em memória da instância da function: a norma é pública e muda pouco,
// então poupar uma ida ao banco por pedido vale mais que a defasagem de
// segundos. A janela curta garante que uma correção em normas_dados chegue
// logo, sem deploy.
const TTL_MS = 60_000
const cacheNormas = new Map<string, { quando: number; dados: Json }>()

export async function carregarPerfil(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  uf: string | null | undefined,
  agora: () => number = Date.now,
): Promise<PerfilHidrantes> {
  const ufs = new Set([(uf || 'MA').toUpperCase(), 'MA'])
  const lidos: Record<string, Json> = {}

  for (const u of ufs) {
    const emCache = cacheNormas.get(u)
    if (emCache && agora() - emCache.quando < TTL_MS) {
      lidos[u] = emCache.dados
      continue
    }
    const { data, error } = await supabase
      .from('normas_dados')
      .select('dados')
      .eq('uf', u)
      .eq('sistema', 'hidrantes')
      .maybeSingle()
    if (error) throw new NormProfileError('Não foi possível ler a base normativa de hidrantes.')
    lidos[u] = data?.dados ?? null
    cacheNormas.set(u, { quando: agora(), dados: lidos[u] })
  }

  return resolverPerfil(uf, (u) => lidos[u] ?? null)
}
