// Gera o par de chaves que assina o token de licença do plugin Revit.
//
//   node scripts/gerar-chave-licenca.mjs
//
// Imprime duas coisas:
//   1. A chave PRIVADA, para o secret LICENCA_CHAVE_PRIVADA do Supabase.
//      Fica só lá. Quem a tiver emite licença para qualquer conta — nunca
//      commite, nunca cole em chat, e guarde um backup num cofre de senhas
//      (trocar a chave exige reinstalar o plugin em todos os clientes).
//   2. A chave PÚBLICA (módulo e expoente), para colar em
//      Fire Utils.tab/lib/licenca.py (FireUtils.extension).
//
// Nada é gravado em disco.
import { generateKeyPairSync } from 'node:crypto'

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const jwk = publicKey.export({ format: 'jwk' })
const emBase64Padrao = (b64url) => Buffer.from(b64url, 'base64url').toString('base64')

console.log('=== 1. Secret do Supabase: LICENCA_CHAVE_PRIVADA ===')
console.log('(cole o bloco inteiro, com as linhas BEGIN/END)\n')
console.log(privateKey.export({ type: 'pkcs8', format: 'pem' }))
console.log('Comando:  supabase secrets set LICENCA_CHAVE_PRIVADA="$(cat chave.pem)"')
console.log('(salve o bloco acima num arquivo temporário, rode o comando e apague o arquivo)\n')
console.log('=== 2. Plugin: Fire Utils.tab/lib/licenca.py ===\n')
console.log(`_CHAVE_PUBLICA_MODULO = u"${emBase64Padrao(jwk.n)}"`)
console.log(`_CHAVE_PUBLICA_EXPOENTE = u"${emBase64Padrao(jwk.e)}"`)
