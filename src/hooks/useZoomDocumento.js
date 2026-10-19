import { useEffect, useState } from 'react'

// Zoom e "maximizar" do preview dos documentos (memorial do MA e formulário
// da PB) — barra em components/documentos/ZoomDocumento.jsx. Só na tela: a
// impressão sai sempre em 100%. O zoom vai em --memorial-zoom (index.css).

export const NIVEIS_ZOOM = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.25, 1.5]
const CHAVE_ZOOM = 'memorial-zoom'

function lerZoomSalvo() {
  try {
    const salvo = Number(localStorage.getItem(CHAVE_ZOOM))
    return NIVEIS_ZOOM.includes(salvo) ? salvo : 1
  } catch { return 1 }
}

export function proximoZoom(atual, direcao) {
  const i = NIVEIS_ZOOM.indexOf(atual)
  return NIVEIS_ZOOM[Math.min(NIVEIS_ZOOM.length - 1, Math.max(0, (i < 0 ? NIVEIS_ZOOM.indexOf(1) : i) + direcao))]
}

/** `rolagemRef`: área rolável do documento (Ctrl + roda do mouse dá zoom nela). */
export function useZoomDocumento(rolagemRef) {
  const [zoom, setZoom] = useState(lerZoomSalvo)
  const [maximizado, setMaximizado] = useState(false)
  useEffect(() => {
    try { localStorage.setItem(CHAVE_ZOOM, String(zoom)) } catch { /* sem storage: só não lembra */ }
  }, [zoom])
  useEffect(() => {
    const cont = rolagemRef.current
    if (!cont) return
    const aoRodar = e => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setZoom(z => proximoZoom(z, e.deltaY < 0 ? 1 : -1))
    }
    cont.addEventListener('wheel', aoRodar, { passive: false })
    return () => cont.removeEventListener('wheel', aoRodar)
    // maximizar remonta a área rolável (portal) — religa no elemento novo
  }, [rolagemRef, maximizado])
  // Esc sai do modo maximizado.
  useEffect(() => {
    if (!maximizado) return
    const aoTeclar = e => { if (e.key === 'Escape') setMaximizado(false) }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [maximizado])
  return { zoom, setZoom, maximizado, setMaximizado }
}

/** Classes do contêiner da página: maximizado, ocupa quase toda a tela. */
export const classeMaximizado = maximizado => (maximizado
  ? 'fixed inset-3 z-[1001] rounded-xl border border-solid border-border bg-bg shadow-[0_24px_64px_rgba(0,0,0,.45)] print:static print:inset-auto print:border-0 print:shadow-none'
  : '')

