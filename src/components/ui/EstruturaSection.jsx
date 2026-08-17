import { useState } from 'react'
import Icon from './Icon'

// Container colapsavel para blocos "por estrutura" — usado em toda tela que
// repete conteudo (formulario, cards, tabela) uma vez pra cada estrutura do
// projeto (torre/bloco). Comeca aberto; o estado aberto/fechado e local a
// tela (nao persiste entre navegacoes nem entra no estado do projeto).
//
// E um card com borda propria (nao so um cabecalho) para que o conteudo
// aberto fique visualmente contido — sem isso, formularios longos de uma
// estrutura se misturam com os da estrutura seguinte.
export default function EstruturaSection({ titulo, extra, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-5 border border-solid border-border rounded-lg overflow-hidden bg-surface last:mb-0">
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 py-4 px-4 cursor-pointer select-none group bg-surface-2 ${open ? 'border-b border-solid border-border' : ''}`}
      >
        <Icon
          name="chevD"
          size={14}
          className={`text-ink-faint shrink-0 transition-transform duration-150 group-hover:text-ink ${open ? '' : '-rotate-90'}`}
        />
        <h3 className="text-sm font-bold text-ink m-0 flex-1 group-hover:text-red transition-colors duration-100">{titulo}</h3>
        {extra}
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}
