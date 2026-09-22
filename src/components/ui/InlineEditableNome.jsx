import { useState } from 'react'
import Icon from './Icon'

// ── Nome editável inline — clique vira input; Enter/blur salva, Escape
// cancela. Em vez de window.prompt (abre um diálogo nativo do navegador,
// fora do site). Compartilhado entre os cards das Saídas de Emergência e dos
// Extintores.
export default function InlineEditableNome({ value, onCommit, textClassName }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const commit = () => {
    setEditing(false)
    const novo = draft.trim()
    if (novo && novo !== value) onCommit(novo)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        onClick={e => e.stopPropagation()}
        // Acompanha a largura do texto digitado (em vez do tamanho padrão
        // do <input>, que não tem relação nenhuma com o nome sendo
        // editado) — `max-w-full` deixa o max-w-[…] de `textClassName`
        // (limite de largura do nome no card) valer também aqui.
        style={{ width: `${Math.max(draft.length, 1) + 1}ch` }}
        className={`${textClassName} max-w-full bg-transparent border-none p-0 outline-none min-w-0`}
      />
    )
  }
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); setDraft(value); setEditing(true) }}
      className={`group flex items-center gap-1.5 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left ${textClassName}`}
    >
      <span className="truncate">{value}</span>
      <Icon name="edit" size={11} className="text-ink-hint group-hover:text-ink-muted transition-colors shrink-0"/>
    </button>
  )
}
