import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useProjeto } from '../../context/ProjetoContext'
import { previaDoEstado } from '../../estados/registro'
import PreviaMemorial from './PreviaMemorial'
import Icon from '../ui/Icon'

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Largura do painel da prévia: normal (~45% da área) ou expandido (~70%).
const larguraAlvo = (total, expandido) => Math.round(expandido
  ? Math.max(480, total * 0.7)
  : Math.min(820, Math.max(420, total * 0.45)))

const TOPO_BOTAO = 150   // alinhado ao primeiro bloco do formulário
const BOTAO = 48

/**
 * Página de medida com a prévia do documento ao lado. Um botão quadrado
 * flutuante (estilo do botão de feedback) fica ao lado do formulário; ao
 * clicar, a tela vira duas colunas — o formulário (rolagem normal) e a
 * prévia, fixa na tela com rolagem própria. A prévia é a do estado (PB:
 * seção do formulário do CBMPB) ou a do memorial descritivo em texto (MA).
 */
export default function ComPrevia({ sistKey, children }) {
  const { state } = useProjeto()
  const previa = previaDoEstado(state.uf, sistKey) || <PreviaMemorial sistKey={sistKey}/>
  const raizRef = useRef(null)
  const colunaRef = useRef(null)
  const painelRef = useRef(null)
  const conteudoRef = useRef(null)
  const [aberto, setAberto] = useState(false)
  const [montado, setMontado] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const [posBotao, setPosBotao] = useState(null)

  // Botão logo à direita do formulário (o primeiro bloco com largura
  // máxima da página), sem passar da coluna.
  const posicionar = useCallback(() => {
    const raiz = raizRef.current, coluna = colunaRef.current
    if (!raiz || !coluna) return
    const r = raiz.getBoundingClientRect()
    const c = coluna.getBoundingClientRect()
    const form = coluna.querySelector('[class*="max-w-"]')
    const direita = form ? form.getBoundingClientRect().right : c.right - 24
    setPosBotao(Math.min(direita + 16, c.right - BOTAO - 16) - r.left)
  }, [])

  useLayoutEffect(() => {
    posicionar()
    const ro = new ResizeObserver(posicionar)
    if (colunaRef.current) ro.observe(colunaRef.current)
    return () => ro.disconnect()
  }, [posicionar, sistKey])

  // Abrir: o painel cresce da direita e o conteúdo entra deslizando.
  useLayoutEffect(() => {
    if (!montado || !painelRef.current) return
    const d = reduzMovimento() ? 0 : 1
    const alvo = larguraAlvo(raizRef.current.clientWidth, expandido)
    gsap.set(conteudoRef.current, { width: alvo })
    gsap.fromTo(painelRef.current, { width: 0 }, { width: alvo, duration: .5 * d, ease: 'power3.out', onUpdate: posicionar, onComplete: posicionar })
    gsap.fromTo(conteudoRef.current, { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: .45 * d, delay: .12 * d, ease: 'power3.out' })
  }, [montado]) // eslint-disable-line react-hooks/exhaustive-deps

  // Janela redimensionada com o painel aberto: acompanha a largura alvo.
  useEffect(() => {
    if (!montado) return
    const aoRedimensionar = () => {
      const alvo = larguraAlvo(raizRef.current.clientWidth, expandido)
      gsap.set([painelRef.current, conteudoRef.current], { width: alvo })
      posicionar()
    }
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [montado, expandido, posicionar])

  const abrir = () => { setAberto(true); setMontado(true) }
  const fechar = () => {
    setAberto(false)
    const d = reduzMovimento() ? 0 : 1
    gsap.to(conteudoRef.current, { x: 48, opacity: 0, duration: .18 * d, ease: 'power2.in' })
    gsap.to(painelRef.current, {
      width: 0, duration: .4 * d, delay: .08 * d, ease: 'power3.inOut', onUpdate: posicionar,
      onComplete: () => { setMontado(false); setExpandido(false); posicionar() },
    })
  }
  // Expandir/recolher: o painel muda de largura animado; o conteúdo
  // acompanha.
  const alternarExpansao = () => {
    const novo = !expandido
    setExpandido(novo)
    const alvo = larguraAlvo(raizRef.current.clientWidth, novo)
    const d = reduzMovimento() ? 0 : 1
    gsap.to([painelRef.current, conteudoRef.current], { width: alvo, duration: .45 * d, ease: 'power3.inOut', onUpdate: posicionar, onComplete: posicionar })
  }

  return (
    <div ref={raizRef} className="flex-1 flex min-h-0 relative">
      <div ref={colunaRef} className="flex-1 flex flex-col min-w-0">{children}</div>

      {montado && (
        <aside ref={painelRef} className="shrink-0 h-full overflow-hidden border-l border-solid border-border bg-surface-2" aria-label="Prévia do documento">
          <div ref={conteudoRef} className="h-full flex flex-col">
            <div className="flex items-center gap-2 py-3 px-4 border-b border-solid border-border shrink-0">
              <Icon name="fileText" size={15} color="var(--color-red)"/>
              <span className="text-[13px] font-semibold text-ink flex-1">Prévia do documento</span>
              <button type="button" className="btn-ghost py-1 px-2" onClick={alternarExpansao}
                title={expandido ? 'Reduzir prévia' : 'Expandir prévia'} aria-label={expandido ? 'Reduzir prévia' : 'Expandir prévia'}>
                <Icon name={expandido ? 'minimize' : 'maximize'} size={14}/>
              </button>
              <button type="button" className="btn-ghost py-1 px-2" onClick={fechar} title="Fechar prévia" aria-label="Fechar prévia">
                <Icon name="x" size={14}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white rounded-md p-6 shadow-[var(--shadow-md)] text-black">
                {previa}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Botão flutuante: fixo na tela (fora da rolagem da coluna), ao lado
          do formulário; abre e fecha a prévia. */}
      {posBotao != null && (
        <div className="group absolute z-30 w-12 h-12" style={{ top: TOPO_BOTAO, left: posBotao }}>
          <button
            type="button"
            onClick={() => (aberto ? fechar() : abrir())}
            title={aberto ? 'Fechar prévia do documento' : 'Prévia do documento'}
            aria-label={aberto ? 'Fechar prévia do documento' : 'Prévia do documento'}
            aria-expanded={aberto}
            className={`absolute inset-0 grid place-items-center border border-solid text-white shadow-[0_8px_24px_rgba(0,0,0,.38)] transition-[background-color,border-color,box-shadow,scale] duration-300 ease-out hover:scale-105 group-hover:border-red group-hover:bg-red ${aberto ? 'border-red bg-red' : 'border-[rgba(255,255,255,.16)] bg-[#24252c]'}`}
          >
            <Icon name={aberto ? 'x' : 'fileText'} size={22} strokeWidth={aberto ? 3 : 2}/>
          </button>
        </div>
      )}
    </div>
  )
}
