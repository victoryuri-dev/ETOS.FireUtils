import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import Icon from './Icon'
import { ToastContext } from '../../context/toastContext'

// Notificações de retorno (importação, login, salvar, busca...) empilhadas no
// canto inferior direito, da mais recente (em cima) à mais antiga (embaixo).
// Somem sozinhas depois de `duration` (barra de tempo no rodapé, pausa com o
// mouse/foco em cima) ou no X.
//
// Animação no padrão "clear and rebuild" do GSAP: uma única timeline mestra
// (a da pilha) é limpa e reconstruída sempre que a fila muda, agendando a
// entrada de uma notificação de cada vez (stagger). A entrada usa fromTo —
// todo aviso parte de um estado conhecido, fora da tela pela direita; a saída
// usa to — parte de onde o card estiver e despenca pra baixo, com rotação
// aleatória, até sair da tela.
const MAX_VISIVEIS = 4
const INTERVALO_ENTRADA = 0.38
const DURACAO_PADRAO = { success: 5000, info: 6000, warning: 8000, error: 9000 }

const TONE = {
  success: { icon: 'checkCircle', color: 'var(--color-green)' },
  error:   { icon: 'warn',        color: 'var(--color-red)' },
  warning: { icon: 'warn',        color: 'var(--color-amber)' },
  info:    { icon: 'info',        color: 'rgba(80,140,220,.95)' },
}

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ToastItem({ toast, onDismiss, onRemove, register, unregister }) {
  const wrapRef = useRef(null)
  const cardRef = useRef(null)
  const iconRef = useRef(null)
  const barRef = useRef(null)
  const enterTl = useRef(null)
  const progress = useRef(null)
  const started = useRef(false)
  const t = TONE[toast.tone]

  // Monta a entrada (parada) e a barra de tempo (parada) e se registra na fila
  // da pilha: quem manda tocar é a timeline mestra, uma notificação por vez.
  // Tudo em fromTo — valores de início e fim explícitos — porque o StrictMode
  // roda este efeito duas vezes em desenvolvimento, e um from() na segunda vez
  // leria a posição já deslocada como destino e não animaria nada.
  useLayoutEffect(() => {
    const d = reduzMovimento() ? 0 : 1
    const wrap = wrapRef.current
    const card = cardRef.current
    const tl = gsap.timeline({ paused: true, onComplete: () => { wrap.style.overflow = '' } })
    wrap.style.overflow = 'hidden'
    tl.fromTo(wrap, { height: 0 }, { height: 'auto', duration: .4 * d, ease: 'expo.out', clearProps: 'height' }, 0)
      .call(() => { wrap.style.overflow = '' }, null, .08 * d)
      .fromTo(card, { x: () => card.offsetWidth + 48 }, { x: 0, duration: .8 * d, ease: 'expo.out', clearProps: 'transform' }, .08 * d)
      .fromTo(iconRef.current, { scale: .3, rotate: -30 }, { scale: 1, rotate: 0, duration: .5 * d, ease: 'back.out(2.4)', clearProps: 'transform' }, .4 * d)
      .fromTo(barRef.current, { opacity: 0 }, { opacity: 1, duration: .3 * d, clearProps: 'opacity' }, .45 * d)

    let bar = null
    if (toast.duration > 0) {
      gsap.set(barRef.current, { scaleX: 1 })
      bar = gsap.to(barRef.current, { scaleX: 0, duration: toast.duration / 1000, ease: 'none', paused: true, onComplete: () => onDismiss(toast.id) })
    }
    enterTl.current = tl
    progress.current = bar
    started.current = false
    register(toast.id, () => { started.current = true; tl.play(); bar?.play() })

    return () => {
      unregister(toast.id)
      tl.kill()
      bar?.kill()
      progress.current = null
    }
  }, [toast.id, toast.duration, onDismiss, register, unregister])

  // O mesmo aviso disparado de novo reinicia a barra de tempo.
  useEffect(() => {
    if (toast.nonce > 0 && started.current) progress.current?.restart()
  }, [toast.nonce])

  // Saída (to: parte de onde o card estiver): despenca pra baixo com rotação
  // aleatória até sair da tela, e o espaço dele recolhe logo depois — as de
  // cima descem pra ocupar a vaga.
  useLayoutEffect(() => {
    if (!toast.closing) return
    const d = reduzMovimento() ? 0 : 1
    const wrap = wrapRef.current
    const card = cardRef.current
    unregister(toast.id)
    enterTl.current?.kill()
    progress.current?.kill()
    wrap.style.overflow = ''
    gsap.set(card, { position: 'relative', zIndex: 10 })
    const queda = window.innerHeight - card.getBoundingClientRect().top + 64
    const tl = gsap.timeline({ onComplete: () => onRemove(toast.id) })
    tl.to(card, { y: queda, rotation: gsap.utils.random(-12, 12), duration: .65 * d, ease: 'power3.in' }, 0)
      .to(wrap, { height: 0, duration: .45 * d, ease: 'power3.inOut' }, .2 * d)
    return () => { tl.kill() }
  }, [toast.closing, toast.id, onRemove, unregister])

  const pausar = () => progress.current?.pause()
  const retomar = () => { if (started.current) progress.current?.resume() }

  return (
    <li ref={wrapRef} className="list-none m-0 pointer-events-auto">
      <div className="pb-2.5">
        <div
          ref={cardRef}
          role={toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status'}
          onMouseEnter={pausar}
          onMouseLeave={retomar}
          onFocus={pausar}
          onBlur={retomar}
          className="relative overflow-hidden rounded-[10px] border border-solid border-border bg-surface-2 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
        >
          <div className="flex items-start gap-3 py-3.5 pl-4 pr-3">
            <span
              ref={iconRef}
              className="shrink-0 grid place-items-center w-5 h-5 mt-px"
              style={{ color: t.color }}
            >
              <Icon name={t.icon} size={16}/>
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && <div className="text-[12px] font-semibold text-ink leading-[1.35] mb-0.5">{toast.title}</div>}
              <div className="text-[12px] text-ink-muted leading-[1.5] break-words">{toast.message}</div>
              {toast.action && (
                <button
                  type="button"
                  className="btn-ghost mt-2.5 text-[11px] py-1 px-2.5"
                  onClick={() => { toast.action.onClick?.(); onDismiss(toast.id) }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Fechar notificação"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 grid place-items-center w-6 h-6 -mr-1 rounded-md bg-transparent border-0 text-ink-faint cursor-pointer transition-colors duration-150 hover:bg-white/[.07] hover:text-ink"
            >
              <Icon name="x" size={13}/>
            </button>
          </div>
          {toast.duration > 0 && (
            <span
              ref={barRef}
              aria-hidden="true"
              className="absolute left-0 right-0 bottom-0 h-px origin-left"
              style={{ background: t.color, opacity: .5 }}
            />
          )}
          {!toast.duration && <span ref={barRef} className="hidden"/>}
        </div>
      </div>
    </li>
  )
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  // Timeline mestra da pilha (clear and rebuild): a cada mudança na fila ela é
  // limpa e reconstruída, agendando o início da entrada de cada notificação
  // que ainda não entrou, uma depois da outra. Quem já começou a entrar
  // segue na própria timeline e não é afetado.
  const mestre = useRef(null)
  if (mestre.current == null) mestre.current = gsap.timeline({ paused: true })
  const fila = useRef([])
  const ultimoInicio = useRef(-Infinity)
  const inicioAnterior = useRef(-Infinity)
  const ultimoId = useRef(null)

  const reconstruir = useCallback(() => {
    const m = mestre.current
    m.clear()
    if (fila.current.length === 0) return
    const intervalo = reduzMovimento() ? 0 : INTERVALO_ENTRADA
    let quando = Math.max(0, ultimoInicio.current + intervalo - gsap.ticker.time)
    fila.current.forEach(item => {
      m.call(() => {
        fila.current = fila.current.filter(x => x.id !== item.id)
        inicioAnterior.current = ultimoInicio.current
        ultimoInicio.current = gsap.ticker.time
        ultimoId.current = item.id
        item.tocar()
      }, null, quando)
      quando += intervalo
    })
    m.restart(false, false)
  }, [])

  const register = useCallback((id, tocar) => {
    // Ordem de chegada (id crescente), não de montagem: a lista é renderizada
    // da mais nova pra mais antiga, então os efeitos rodam na ordem inversa.
    fila.current = [...fila.current.filter(x => x.id !== id), { id, tocar }].sort((x, y) => x.id - y.id)
    reconstruir()
  }, [reconstruir])

  const unregister = useCallback(id => {
    // Item cancelado (ex.: efeito desfeito pelo StrictMode) que já tinha
    // "ocupado" o intervalo: devolve o marcador pra não atrasar o próximo.
    if (ultimoId.current === id) {
      ultimoInicio.current = inicioAnterior.current
      ultimoId.current = null
    }
    if (!fila.current.some(x => x.id === id)) return
    fila.current = fila.current.filter(x => x.id !== id)
    reconstruir()
  }, [reconstruir])

  const dismiss = useCallback(id => {
    setToasts(list => list.map(x => (x.id === id && !x.closing ? { ...x, closing: true } : x)))
  }, [])
  const remove = useCallback(id => setToasts(list => list.filter(x => x.id !== id)), [])

  const push = useCallback((tone, message, opts = {}) => {
    const id = ++idRef.current
    const item = {
      id, tone, message, title: opts.title, action: opts.action,
      duration: opts.duration ?? DURACAO_PADRAO[tone], key: `${tone}|${opts.title || ''}|${message}`, nonce: 0, closing: false,
    }
    setToasts(list => {
      const igual = list.find(x => x.key === item.key && !x.closing)
      if (igual) return list.map(x => (x === igual ? { ...x, nonce: x.nonce + 1 } : x))
      const next = [...list, item]
      const abertos = next.filter(x => !x.closing)
      if (abertos.length <= MAX_VISIVEIS) return next
      const excedentes = new Set(abertos.slice(0, abertos.length - MAX_VISIVEIS).map(x => x.id))
      return next.map(x => (excedentes.has(x.id) ? { ...x, closing: true } : x))
    })
    return id
  }, [])

  const api = useMemo(() => ({
    success: (m, o) => push('success', m, o),
    error:   (m, o) => push('error', m, o),
    warning: (m, o) => push('warning', m, o),
    info:    (m, o) => push('info', m, o),
    dismiss,
  }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <ul
          aria-label="Notificações"
          className="fixed z-[1000] bottom-5 right-5 m-0 p-0 flex flex-col justify-end w-[min(380px,calc(100vw-32px))] pointer-events-none"
        >
          {[...toasts].reverse().map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} onRemove={remove} register={register} unregister={unregister}/>)}
        </ul>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
