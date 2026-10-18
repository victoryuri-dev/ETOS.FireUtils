// Token de licença assinado — o que o plugin Revit guarda no computador do
// usuário para liberar as ferramentas de produtividade SEM internet.
//
// Por que existe: até aqui o plugin guardava o resultado da licença num
// arquivo JSON comum (licencas.json), e quem editasse o arquivo — ou o
// código Python que o lê — liberava tudo. Aqui a decisão passa a ser do
// servidor: ele assina "esta conta, estes módulos, até esta data" com uma
// chave privada que só existe nos secrets do Supabase, e o plugin só consegue
// CONFERIR a assinatura (com a chave pública embutida), nunca produzi-la.
// Editar o arquivo invalida a assinatura. Quem edita o código para pular a
// conferência ainda consegue — por isso o que realmente vale (o dimensionamento)
// continua exigindo licença no servidor, a cada chamada.
//
// Formato:   base64url(payload JSON) "." base64url(assinatura)
// Assinatura: RSASSA-PKCS1-v1_5 com SHA-256, sobre os bytes ASCII da PRIMEIRA
//             parte (o payload já codificado) — sem canonicalização de JSON,
//             para o servidor e o plugin assinarem/conferirem os mesmos bytes.
//             RSA e não Ed25519 porque o .NET Framework do Revit confere RSA
//             nativamente (RSACryptoServiceProvider) e não confere Ed25519.

export const VERSAO_TOKEN = 1

export interface LinhaLicenca {
  modulo: string
  situacao: string
  expira_em: string | null
}

export interface PayloadLicenca {
  v: number
  sub: string
  email: string | null
  iat: number
  exp: number
  // módulo → último dia de validade ('AAAA-MM-DD'), ou null se sem término.
  mod: Record<string, string | null>
}

// Data de hoje no Brasil (UTC-3) — mesma régua da function tem_licenca() do
// banco, para a licença não vencer antes da meia-noite local.
export function hojeNoBrasil(agoraMs = Date.now()): string {
  return new Date(agoraMs - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** Módulos com licença vigente: situação ativa/teste e dentro da validade. */
export function modulosVigentes(linhas: LinhaLicenca[], hoje: string): Record<string, string | null> {
  const mod: Record<string, string | null> = {}
  for (const l of linhas) {
    if (l.situacao !== 'ativa' && l.situacao !== 'teste') continue
    if (l.expira_em && l.expira_em < hoje) continue
    mod[l.modulo] = l.expira_em ?? null
  }
  return mod
}

export function montarPayload(p: {
  userId: string
  email: string | null
  linhas: LinhaLicenca[]
  agoraMs?: number
  ttlDias: number
}): PayloadLicenca {
  const agoraMs = p.agoraMs ?? Date.now()
  const iat = Math.floor(agoraMs / 1000)
  return {
    v: VERSAO_TOKEN,
    sub: p.userId,
    email: p.email,
    iat,
    exp: iat + Math.round(p.ttlDias * 86400),
    mod: modulosVigentes(p.linhas, hojeNoBrasil(agoraMs)),
  }
}

function base64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function pemParaDer(pem: string): Uint8Array<ArrayBuffer> {
  const corpo = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, '')
  return Uint8Array.from(atob(corpo), (c) => c.charCodeAt(0))
}

/** Importa a chave privada (PKCS#8, PEM) guardada no secret LICENCA_CHAVE_PRIVADA. */
export function importarChavePrivada(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    pemParaDer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

export async function assinarToken(payload: PayloadLicenca, chave: CryptoKey): Promise<string> {
  const corpo = base64url(new TextEncoder().encode(JSON.stringify(payload)))
  const assinatura = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    chave,
    new TextEncoder().encode(corpo),
  )
  return `${corpo}.${base64url(new Uint8Array(assinatura))}`
}
