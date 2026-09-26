import { useEffect, useRef } from 'react'
import Loader from '../ui/Loader'

// Preview de impressão em folhas A4, estilo editor de texto: o Paged.js
// divide o conteúdo em páginas reais (A4, margem de 25 mm), parte parágrafos e
// tabelas nas quebras e devolve as páginas prontas — as mesmas que saem na
// impressão/PDF, então a tela mostra exatamente o que será impresso.
//
// O conteúdo (children) é renderizado escondido pelo React; a cada mudança o
// Paged.js paginha uma cópia dele num palco fora da tela e, só quando termina,
// as páginas trocam as antigas no destino — sem piscar. Nenhum nó do destino é
// gerenciado pelo React.
//
// `css` (texto) traz o @page e demais regras que o Paged.js precisa processar;
// `prepararConteudo(copia)` deixa o chamador ajustar a COPIA antes de paginar
// (ex.: montar um sumario a partir dos titulos); `aposPaginar(destino)` roda
// quando as paginas ja estao no destino (ex.: preencher numeros de pagina).
//
// Passar a lista de folhas de estilo (mesmo com um só item) impede o Paged.js
// de remover e reprocessar os estilos do app (modo polyfill).
export default function PreviewPaginado({ children, css, prepararConteudo, aposPaginar }) {
  const fonteRef = useRef(null)
  const destinoRef = useRef(null)
  const avisoRef = useRef(null)
  const propsRef = useRef({ css, prepararConteudo, aposPaginar })
  const estado = useRef({ ativo: true, rodando: false, pendente: false, timer: null, previewer: null, palco: null, ultimoHtml: null })

  const rodar = useRef(async function rodar() {
    const s = estado.current
    if (s.rodando) { s.pendente = true; return }
    // Só repagina quando o conteúdo mudou de fato: o componente re-renderiza por
    // motivos alheios ao documento (contexto, status de salvamento...) e cada
    // paginação é cara.
    const html = fonteRef.current?.innerHTML
    if (html == null || html === s.ultimoHtml) return
    s.rodando = true
    // O loader só aparece na primeira geração; nas seguintes as páginas antigas
    // ficam na tela até as novas ficarem prontas.
    if (avisoRef.current) avisoRef.current.style.display = destinoRef.current?.childElementCount ? 'none' : ''
    let palco = null
    try {
      const { Previewer } = await import('pagedjs')
      if (!s.ativo || !fonteRef.current || !destinoRef.current) return

      palco = document.createElement('div')
      // Mesma classe do destino: a tipografia do memorial (Arial 12/10pt etc.) precisa
      // valer na hora de medir, senão as alturas mudam depois e a paginação quebra.
      palco.className = 'print-area-memorial'
      palco.style.cssText = 'position:fixed;top:0;left:-100000px;pointer-events:none'
      document.body.appendChild(palco)
      s.palco = palco

      const previewer = new Previewer()
      const conteudo = fonteRef.current.cloneNode(true)
      propsRef.current.prepararConteudo?.(conteudo)
      await previewer.preview(conteudo, [{ 'preview-paginado.css': propsRef.current.css || '@page { size: A4 portrait; margin: 25mm; }' }], palco)
      if (!s.ativo) { previewer.polisher.destroy(); return }

      destinoRef.current.replaceChildren(...palco.childNodes)
      propsRef.current.aposPaginar?.(destinoRef.current)
      const anterior = s.previewer
      s.previewer = previewer
      anterior?.polisher.destroy()
      s.ultimoHtml = html
    } catch (erro) {
      console.error('Falha ao paginar o documento:', erro)
      s.ultimoHtml = html
    } finally {
      palco?.remove()
      s.palco = null
      s.rodando = false
      if (avisoRef.current) avisoRef.current.style.display = 'none'
      if (s.ativo && s.pendente) { s.pendente = false; rodar.current() }

    }
  })

  // Sem deps de propósito: repagina a cada render do documento (com debounce).
  useEffect(() => {
    propsRef.current = { css, prepararConteudo, aposPaginar }
    const s = estado.current
    clearTimeout(s.timer)
    s.timer = setTimeout(() => rodar.current(), 250)
  })

  useEffect(() => {
    const s = estado.current
    s.ativo = true
    return () => {
      s.ativo = false
      clearTimeout(s.timer)
      s.palco?.remove()
      s.previewer?.polisher.destroy()
      s.previewer = null
    }
  }, [])

  return (
    <>
      <div className="hidden" aria-hidden="true">
        <div ref={fonteRef}>{children}</div>
      </div>
      <div ref={avisoRef} className="no-print flex-1 flex items-center justify-center min-h-[96px]" role="status" aria-label="Gerando páginas">
        <Loader size={40}/>
      </div>
      <div ref={destinoRef} className="print-area print-area-memorial"/>
    </>
  )
}
