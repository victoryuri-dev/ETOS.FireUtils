// ZIP mínimo (sem compressão, "store") para montar o .docx no navegador sem
// dependência externa. Um .docx é só um ZIP de arquivos XML.

const TABELA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes) {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** arquivos: [{ nome, dados: string | Uint8Array }] → Blob do ZIP. */
export function montarZip(arquivos, tipo = 'application/zip') {
  const enc = new TextEncoder()
  const partes = []
  const central = []
  let deslocamento = 0
  for (const { nome, dados } of arquivos) {
    const nomeB = enc.encode(nome)
    const conteudo = typeof dados === 'string' ? enc.encode(dados) : dados
    const crc = crc32(conteudo)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true)          // nomes em UTF-8
    local.setUint32(14, crc, true)
    local.setUint32(18, conteudo.length, true)
    local.setUint32(22, conteudo.length, true)
    local.setUint16(26, nomeB.length, true)
    partes.push(new Uint8Array(local.buffer), nomeB, conteudo)

    const cen = new DataView(new ArrayBuffer(46))
    cen.setUint32(0, 0x02014b50, true)
    cen.setUint16(4, 20, true)
    cen.setUint16(6, 20, true)
    cen.setUint16(8, 0x0800, true)
    cen.setUint32(16, crc, true)
    cen.setUint32(20, conteudo.length, true)
    cen.setUint32(24, conteudo.length, true)
    cen.setUint16(28, nomeB.length, true)
    cen.setUint32(42, deslocamento, true)
    central.push(new Uint8Array(cen.buffer), nomeB)
    deslocamento += 30 + nomeB.length + conteudo.length
  }
  const tamanhoCentral = central.reduce((s, b) => s + b.length, 0)
  const fim = new DataView(new ArrayBuffer(22))
  fim.setUint32(0, 0x06054b50, true)
  fim.setUint16(8, arquivos.length, true)
  fim.setUint16(10, arquivos.length, true)
  fim.setUint32(12, tamanhoCentral, true)
  fim.setUint32(16, deslocamento, true)
  return new Blob([...partes, ...central, new Uint8Array(fim.buffer)], { type: tipo })
}
