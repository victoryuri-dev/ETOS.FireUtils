import { useEffect, useState } from 'react'

// Menu flutuante de navegação do memorial (lado direito): parado, são só linhas finas (a da
// seção em leitura é maior e opaca); com o mouse (ou o foco do teclado) em
// cima — clicar não deixa o menu preso aberto — revelam-se os nomes, com a seção atual em destaque e as vizinhas
// esmaecendo com a distância. Painel escuro translucido, pra o texto branco
// ficar legível mesmo sobre a folha do documento.
//
// `secoes`: [{ id, numero, texto, el }] (títulos de nível 1 já paginados);
// `rolagemRef`: o contêiner que rola o documento.
export default function MenuSecoes({ secoes, rolagemRef }) {
  const [ativo, setAtivo] = useState(0)

  // Seção em leitura = a última cujo título já passou de ~35% da altura visível.
  useEffect(() => {
    const cont = rolagemRef.current
    if (!cont || secoes.length === 0) return
    let quadro = 0
    const atualizar = () => {
      quadro = 0
      const limite = cont.getBoundingClientRect().top + cont.clientHeight * 0.35
      let atual = 0
      secoes.forEach((s, i) => { if (s.el.getBoundingClientRect().top <= limite) atual = i })
      setAtivo(atual)
    }
    const aoRolar = () => { if (!quadro) quadro = requestAnimationFrame(atualizar) }
    aoRolar()
    cont.addEventListener('scroll', aoRolar, { passive: true })
    return () => { cont.removeEventListener('scroll', aoRolar); cancelAnimationFrame(quadro) }
  }, [secoes, rolagemRef])

  const ir = secao => {
    const cont = rolagemRef.current
    if (!cont) return
    const topo = secao.el.getBoundingClientRect().top - cont.getBoundingClientRect().top + cont.scrollTop - 72
    cont.scrollTo({ top: Math.max(0, topo), behavior: 'smooth' })
  }

  if (secoes.length === 0) return null

  return (
    <nav className="menu-secoes no-print" aria-label="Seções do memorial">
      <ul>
        {secoes.map((s, i) => (
          <li key={s.id || s.numero}>
            <button
              type="button"
              className={`menu-secoes__item${i === ativo ? ' is-ativo' : ''}`}
              style={{ '--o': i === ativo ? 1 : Math.max(0.16, 0.44 - (Math.abs(i - ativo) - 1) * 0.1) }}
              aria-current={i === ativo ? 'true' : undefined}
              onClick={e => { e.currentTarget.blur(); ir(s) }}
            >
              <span className="menu-secoes__linha"/>
              <span className="menu-secoes__rotulo">{s.numero} {s.texto}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
