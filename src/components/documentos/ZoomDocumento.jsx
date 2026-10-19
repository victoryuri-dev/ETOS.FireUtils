import { createPortal } from 'react-dom'
import Icon from '../ui/Icon'
import { useTheme } from '../../context/theme-context'
import { NIVEIS_ZOOM, proximoZoom, classeMaximizado } from '../../hooks/useZoomDocumento'

// Zoom e "maximizar" do preview dos documentos (memorial do MA e formulário
// da PB). Só na tela — a impressão sai sempre em 100% e no fluxo normal.
// Estado e atalhos em hooks/useZoomDocumento.js.

/** Contêiner da página do documento. Maximizado, vai num portal no <body>
 *  (acima do header e do menu, fora dos contextos de empilhamento do layout)
 *  e ocupa quase toda a tela, com o fundo escurecido (clique fecha). */
export function JanelaDocumento({ maximizado, onFechar, className = '', children }) {
  const { theme } = useTheme()
  if (!maximizado) return <div className={className}>{children}</div>
  // Fora do ThemeProvider no DOM: repete o .platform-theme para herdar o tema.
  return createPortal(
    <div className="platform-theme contents text-ink" data-theme={theme}>
      <div className="no-print fixed inset-0 z-[1000] bg-black/50" onClick={onFechar} aria-hidden="true"/>
      <div className={`${className} ${classeMaximizado(true)}`} role="dialog" aria-modal="true" aria-label="Documento maximizado">{children}</div>
    </div>,
    document.body,
  )
}

export function BarraZoom({ zoom, setZoom, maximizado, setMaximizado }) {
  const mudar = direcao => setZoom(z => proximoZoom(z, direcao))
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Zoom do documento">
      <button type="button" className="btn-ghost px-2" onClick={() => mudar(-1)} disabled={zoom <= NIVEIS_ZOOM[0]} aria-label="Diminuir zoom" title="Diminuir zoom (Ctrl + roda do mouse)">
        <Icon name="minus" size={13}/>
      </button>
      <button type="button" className="btn-ghost px-2 min-w-[58px] justify-center tabular-nums" onClick={() => setZoom(1)} title="Voltar para 100%">
        {Math.round(zoom * 100)}%
      </button>
      <button type="button" className="btn-ghost px-2" onClick={() => mudar(1)} disabled={zoom >= NIVEIS_ZOOM[NIVEIS_ZOOM.length - 1]} aria-label="Aumentar zoom" title="Aumentar zoom (Ctrl + roda do mouse)">
        <Icon name="plus" size={13}/>
      </button>
      <span className="w-px h-5 bg-border mx-1" aria-hidden="true"/>
      <button type="button" className="btn-ghost px-2" onClick={() => setMaximizado(m => !m)}
        aria-pressed={maximizado} aria-label={maximizado ? 'Restaurar tamanho' : 'Maximizar documento'} title={maximizado ? 'Restaurar (Esc)' : 'Maximizar documento'}>
        <Icon name={maximizado ? 'minimize' : 'maximize'} size={13}/>
      </button>
    </div>
  )
}
