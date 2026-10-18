// Token de licença assinado (supabase/functions/_shared/licencaToken.ts).
// A conferência aqui usa o `crypto` do Node, independente do WebCrypto que a
// function usa para assinar — é o mesmo papel do .NET no plugin: só conferir.
import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'

import {
  assinarToken,
  hojeNoBrasil,
  importarChavePrivada,
  modulosVigentes,
  montarPayload,
} from '../supabase/functions/_shared/licencaToken.ts'

const HOJE = '2026-10-18'
const linha = (modulo, situacao = 'ativa', expira_em = null) => ({ modulo, situacao, expira_em })

test('licença ativa ou em teste, dentro da validade, entra no token', () => {
  const mod = modulosVigentes(
    [linha('hidrantes', 'ativa', '2026-12-31'), linha('saidas', 'teste'), linha('memorial', 'ativa', HOJE)],
    HOJE,
  )
  assert.deepEqual(mod, { hidrantes: '2026-12-31', saidas: null, memorial: HOJE })
})

test('suspensa, cancelada e vencida ficam de fora', () => {
  const mod = modulosVigentes(
    [
      linha('hidrantes', 'suspensa'),
      linha('saidas', 'cancelada'),
      linha('memorial', 'ativa', '2026-10-17'),
      linha('pro', 'pendente'),
    ],
    HOJE,
  )
  assert.deepEqual(mod, {})
})

test('"hoje" é a data do Brasil: 02:00 UTC ainda é o dia anterior', () => {
  assert.equal(hojeNoBrasil(Date.parse('2026-10-18T02:00:00Z')), '2026-10-17')
  assert.equal(hojeNoBrasil(Date.parse('2026-10-18T03:00:00Z')), '2026-10-18')
})

test('payload carrega conta, validade offline e módulos', () => {
  const agoraMs = Date.parse('2026-10-18T15:00:00Z')
  const p = montarPayload({
    userId: 'u-1',
    email: 'a@b.com',
    linhas: [linha('hidrantes', 'ativa', '2026-12-31')],
    agoraMs,
    ttlDias: 30,
  })
  assert.equal(p.v, 1)
  assert.equal(p.sub, 'u-1')
  assert.equal(p.iat, Math.floor(agoraMs / 1000))
  assert.equal(p.exp - p.iat, 30 * 86400)
  assert.deepEqual(p.mod, { hidrantes: '2026-12-31' })
})

test('conta sem nenhuma licença recebe payload válido com módulos vazios', () => {
  const p = montarPayload({ userId: 'u-2', email: null, linhas: [], ttlDias: 30 })
  assert.deepEqual(p.mod, {})
})

async function chavesDeTeste() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  return { publicKey, chave: await importarChavePrivada(pem) }
}

test('token assinado confere com a chave pública e traz o payload original', async () => {
  const { publicKey, chave } = await chavesDeTeste()
  const payload = montarPayload({ userId: 'u-3', email: 'x@y.z', linhas: [linha('pro')], ttlDias: 30 })
  const token = await assinarToken(payload, chave)

  const [corpo, assinatura] = token.split('.')
  assert.equal(token.split('.').length, 2)
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  assert.ok(verify('sha256', Buffer.from(corpo, 'ascii'), publicKey, Buffer.from(assinatura, 'base64url')))
  assert.deepEqual(JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8')), payload)
})

test('alterar o payload (por exemplo, trocar o módulo) invalida a assinatura', async () => {
  const { publicKey, chave } = await chavesDeTeste()
  const token = await assinarToken(
    montarPayload({ userId: 'u-4', email: null, linhas: [], ttlDias: 30 }),
    chave,
  )
  const [corpo, assinatura] = token.split('.')
  const adulterado = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'))
  adulterado.mod = { pro: null }
  const corpoFalso = Buffer.from(JSON.stringify(adulterado)).toString('base64url')
  assert.equal(verify('sha256', Buffer.from(corpoFalso, 'ascii'), publicKey, Buffer.from(assinatura, 'base64url')), false)
})

test('token assinado por outra chave não confere', async () => {
  const a = await chavesDeTeste()
  const b = await chavesDeTeste()
  const token = await assinarToken(montarPayload({ userId: 'u', email: null, linhas: [], ttlDias: 1 }), a.chave)
  const [corpo, assinatura] = token.split('.')
  assert.equal(verify('sha256', Buffer.from(corpo, 'ascii'), b.publicKey, Buffer.from(assinatura, 'base64url')), false)
})
