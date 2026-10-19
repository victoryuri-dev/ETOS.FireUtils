// Lê a imagem da rubrica e a reduz no navegador (máx. 600×200 px, PNG com
// fundo transparente preservado) para guardar como data URL no perfil.
const LARGURA_MAX = 600
const ALTURA_MAX = 200

export function lerRubrica(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo?.type?.startsWith('image/')) { reject(new Error('Escolha um arquivo de imagem (PNG ou JPG).')); return }
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, LARGURA_MAX / img.width, ALTURA_MAX / img.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * escala))
      canvas.height = Math.max(1, Math.round(img.height * escala))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler a imagem.')) }
    img.src = url
  })
}
