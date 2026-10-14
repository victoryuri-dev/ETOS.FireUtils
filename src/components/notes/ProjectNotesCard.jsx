import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import Icon from '../ui/Icon'
import InlineEditableNome from '../ui/InlineEditableNome'

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d} dia${d !== 1 ? 's' : ''}`
  const mo = Math.floor(d / 30)
  return `há ${mo} ${mo !== 1 ? 'meses' : 'mês'}`
}

function newNoteId() {
  return `nota-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function noteTitle(note) {
  if (note.titulo) return note.titulo
  const node = document.createElement('div')
  node.innerHTML = note.html || ''
  const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, 60) : 'Nota sem título'
}

const NOTE_COLORS = [
  { key: null, label: 'Sem cor' }, { key: 'yellow', label: 'Amarelo' },
  { key: 'blue', label: 'Azul' }, { key: 'green', label: 'Verde' },
  { key: 'pink', label: 'Rosa' }, { key: 'orange', label: 'Laranja' },
  { key: 'purple', label: 'Roxo' }, { key: 'red', label: 'Vermelho' },
]

function NotePreview({ note, onOpen, onDelete }) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: note.id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: note.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div ref={node => { setDragRef(node); setDropRef(node) }} style={style} className={`dashboard-notas__block${note.cor ? ` dashboard-notas__block--${note.cor}` : ''}${isDragging ? ' dashboard-notas__block--dragging' : ''}${isOver ? ' dashboard-notas__block--over' : ''}`} role="button" tabIndex={0} onClick={() => onOpen(note.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(note.id) } }}>
      <button {...attributes} {...listeners} type="button" className="dashboard-notas__block-grip" onClick={event => event.stopPropagation()} title="Arrastar para reordenar"><Icon name="grip" size={13}/></button>
      <button type="button" className="dashboard-notas__block-delete" onClick={event => { event.stopPropagation(); onDelete(note.id) }} title="Excluir nota"><Icon name="trash" size={12}/></button>
      <div className="dashboard-notas__block-title">{noteTitle(note)}</div>
      {note.html ? <div className="dashboard-notas__block-html" dangerouslySetInnerHTML={{ __html: note.html }}/> : <span className="dashboard-notas__block-empty">Nota vazia</span>}
      <span className="dashboard-notas__block-meta">{timeAgo(note.atualizadoEm)}</span>
    </div>
  )
}

function NoteEditor({ note, onChange }) {
  const editorRef = useRef(null)
  const savedRangeRef = useRef(null)
  const debounceRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = note.html || ''
    editorRef.current?.focus()
    return () => {
      if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null }
      if (editorRef.current) onChangeRef.current(editorRef.current.innerHTML)
    }
  }, [note.id])

  const flush = () => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null }
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }
  const scheduleSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(flush, 700)
  }
  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) savedRangeRef.current = selection.getRangeAt(0).cloneRange()
  }
  const exec = command => {
    editorRef.current.focus()
    if (savedRangeRef.current) {
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(savedRangeRef.current)
    }
    document.execCommand(command, false)
    saveSelection()
    scheduleSave()
  }

  return (
    <div className="dashboard-notas__editor">
      <div className="dashboard-notas__toolbar">
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => exec('bold')} title="Negrito"><Icon name="bold" size={13}/></button>
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => exec('italic')} title="Itálico"><Icon name="italic" size={13}/></button>
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => exec('underline')} title="Sublinhado"><Icon name="underline" size={13}/></button>
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => exec('strikeThrough')} title="Traçado"><Icon name="strike" size={13}/></button>
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => exec('insertUnorderedList')} title="Lista"><Icon name="list" size={13}/></button>
      </div>
      <div ref={editorRef} className="dashboard-notas__content" contentEditable suppressContentEditableWarning onInput={scheduleSave} onBlur={flush} onMouseUp={saveSelection} onKeyUp={saveSelection} onPaste={event => { event.preventDefault(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain')) }}/>
    </div>
  )
}

export default function ProjectNotesCard({ notes, dispatch, height, className = '' }) {
  const [expandedId, setExpandedId] = useState(null)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const colorMenuRef = useRef(null)
  const bodyRef = useRef(null)
  const expanded = notes.find(note => note.id === expandedId)

  const goTo = nextId => {
    const node = bodyRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setExpandedId(nextId); return }
    gsap.killTweensOf(node)
    gsap.to(node, { opacity: 0, y: 8, scale: .98, duration: .16, ease: 'power2.in', onComplete: () => {
      setExpandedId(nextId)
      requestAnimationFrame(() => gsap.fromTo(node, { opacity: 0, y: -8, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .32, ease: 'power3.out', clearProps: 'transform,opacity' }))
    } })
  }
  const addNote = () => { const id = newNoteId(); dispatch({ type: 'ADD_NOTA', id }); goTo(id) }
  const deleteNote = id => { dispatch({ type: 'REMOVE_NOTA', id }); setExpandedId(current => current === id ? null : current) }
  const goBack = () => { setColorMenuOpen(false); goTo(null) }
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const ids = notes.map(note => note.id)
    const fromIndex = ids.indexOf(active.id)
    const toIndex = ids.indexOf(over.id)
    if (fromIndex === -1 || toIndex === -1) return
    ids.splice(fromIndex, 1); ids.splice(toIndex, 0, active.id)
    dispatch({ type: 'REORDER_NOTAS', ids })
  }

  useEffect(() => {
    if (!colorMenuOpen) return
    const handleOutside = event => { if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) setColorMenuOpen(false) }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [colorMenuOpen])

  return (
    <article className={`dashboard-panel dashboard-notas${className ? ` ${className}` : ''}${expanded?.cor ? ` dashboard-notas--${expanded.cor}` : ''}`} style={height ? { height } : undefined}>
      <div className={`dashboard-section-heading${expanded ? ' dashboard-section-heading--editing' : ''}`}>
        {expanded ? <>
          <div className="dashboard-notas__heading-editing"><button type="button" className="dashboard-notas__back" onClick={goBack} title="Voltar às notas"><Icon name="left" size={15}/></button><InlineEditableNome value={noteTitle(expanded)} onCommit={title => dispatch({ type: 'SET_NOTA_TITULO', id: expanded.id, titulo: title })} textClassName="font-heading text-[15px] tracking-[-.015em] text-[var(--nota-text,var(--color-ink))] truncate"/></div>
          <div className="dashboard-notas__color-picker" ref={colorMenuRef}>
            <button type="button" className={`dashboard-notas__color-trigger${expanded.cor ? ` dashboard-notas__color-trigger--${expanded.cor}` : ''}`} onClick={() => setColorMenuOpen(open => !open)} title="Cor do card"/>
            {colorMenuOpen && <div className="dashboard-notas__color-menu">{NOTE_COLORS.map(color => <button key={color.key || 'none'} type="button" className={`dashboard-notas__color-swatch dashboard-notas__color-swatch--${color.key || 'none'}`} title={color.label} onClick={() => { dispatch({ type: 'SET_NOTA_COR', id: expanded.id, cor: color.key }); setColorMenuOpen(false) }}/>)}</div>}
          </div>
        </> : <>
          <div className="dashboard-notas__heading-copy"><Icon name="notebookPen" size={18}/><div><h2>Notas</h2><p>{notes.length ? `${notes.length} nota${notes.length === 1 ? '' : 's'}` : 'Anotações livres do projeto'}</p></div></div>
          <button type="button" className="dashboard-notas__new" onClick={addNote} title="Nova nota"><Icon name="plus" size={15}/></button>
        </>}
      </div>
      <div className="dashboard-notas__body" ref={bodyRef}>
        {expanded ? <NoteEditor note={expanded} onChange={html => dispatch({ type: 'SET_NOTA_HTML', id: expanded.id, html })}/> : notes.length === 0 ? <div className="dashboard-notas__empty"><p>Crie uma Nota para não esquecer de algo.</p></div> : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><div className="dashboard-notas__scroller">{notes.map(note => <NotePreview key={note.id} note={note} onOpen={goTo} onDelete={deleteNote}/>)}</div></DndContext>}
      </div>
    </article>
  )
}
