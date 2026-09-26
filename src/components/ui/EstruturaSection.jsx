import { useState } from 'react'
import Icon from './Icon'

// Container colapsavel para blocos "por estrutura" — usado em toda tela que
// repete conteudo (formulario, cards, tabela) uma vez pra cada estrutura do
// projeto (torre/bloco). Comeca aberto por padrao (as telas de medidas de
// seguranca passam defaultOpen={false}); o estado aberto/fechado e local a
// tela (nao persiste entre navegacoes nem entra no estado do projeto).
//
// E um card com borda propria (nao so um cabecalho) para que o conteudo
// aberto fique visualmente contido — sem isso, formularios longos de uma
// estrutura se misturam com os da estrutura seguinte.
//
// overflow-clip (e não -hidden): recorta os cantos arredondados igual, mas
// não vira um contêiner de rolagem — com hidden, qualquer `sticky` dentro
// (ex.: barra de seleção em massa dos Extintores) grudaria na borda deste
// card em vez da borda da tela.
//
// `status` ({ tone, label }, ver utils/statusEstrutura.js) mostra, mesmo com o
// card fechado, se a configuração/os dados da estrutura estão pendentes ou
// resolvidos: pílula ao lado do título + linha de destaque na borda esquerda.
const STATUS_TONE = {
  pendente:  { pill: 'bg-white/[.04] border-border text-ink-faint',                          bar: 'bg-white/15',  dot: 'ring-1 ring-current bg-transparent' },
  andamento: { pill: 'bg-[rgba(186,117,23,.12)] border-amber-border text-amber',              bar: 'bg-amber',     dot: 'bg-current shadow-[0_0_8px_currentColor]' },
  concluido: { pill: 'bg-[rgba(29,158,117,.12)] border-green-border text-green',              bar: 'bg-green',     dot: '' },
  atencao:   { pill: 'bg-red-dim border-red-border text-red',                   bar: 'bg-red',       dot: 'bg-current shadow-[0_0_8px_currentColor]' },
}

function StatusPill({ status }) {
  const t = STATUS_TONE[status.tone] || STATUS_TONE.pendente
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 py-[3px] pl-2 pr-2.5 rounded-full border border-solid text-[10px] font-semibold tracking-[.02em] whitespace-nowrap shrink-0 ${t.pill}`}
    >
      {status.tone === 'concluido'
        ? <Icon name="check" size={11} strokeWidth={3}/>
        : <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${t.dot}`}/>}
      {status.label}
    </span>
  )
}

export default function EstruturaSection({ titulo, extra, status, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const bar = status ? (STATUS_TONE[status.tone] || STATUS_TONE.pendente).bar : null

  return (
    <div className="relative mb-5 border border-solid border-border rounded-lg overflow-clip bg-surface transition-colors duration-300 ease-out hover:border-[rgba(255,255,255,.3)] focus-within:border-[rgba(255,255,255,.3)] last:mb-0">
      {bar && <span aria-hidden="true" className={`absolute left-0 top-0 bottom-0 w-[2px] ${bar} opacity-80`}/>}
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 py-4 px-4 cursor-pointer select-none group ${open ? 'border-b border-solid border-border' : ''}`}
      >
        <Icon
          name="chevD"
          size={14}
          className={`text-ink-faint shrink-0 transition-transform duration-150 group-hover:text-ink ${open ? '' : '-rotate-90'}`}
        />
        <h3 className="text-sm font-bold text-ink m-0 min-w-0 truncate">{titulo}</h3>
        {status && <StatusPill status={status}/>}
        <div className="flex-1"/>
        {extra}
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}
