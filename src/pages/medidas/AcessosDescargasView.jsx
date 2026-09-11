import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Icon from '../../components/ui/Icon'
import { AmbienteForm, DivBadge, fmtM } from './se_shared'
import {
  calcPopAmb, calcNoAmbientePT, calcDimsAcesso, dimsDoAcesso, contarSaidasPavimento,
} from '../../data/se_calc'

// ── Árvore: helpers puros (leem ambientes/acessos, não mutam nada) ─────
function acessosFilhos(acessos, parentId) {
  return acessos.filter(a => a.alimentaEm === parentId)
}
function ambientesDe(ambientes, acessoId) {
  return ambientes.filter(a => a.acessoId === acessoId)
}
// Todo o subconjunto que um Acesso arrasta consigo (ele mesmo + descendentes)
// — usado só pra impedir soltar um nó dentro do seu próprio galho (ciclo).
function descendentesDe(acessoId, acessos) {
  const set = new Set([acessoId])
  acessosFilhos(acessos, acessoId).forEach(f => descendentesDe(f.id, acessos).forEach(id => set.add(id)))
  return set
}

function novoAmbienteId() {
  return `amb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// Achata a árvore de Acessos/Saídas em opções de <select> (indentadas por
// profundidade) — usado pela barra de mover-em-massa, pra listar todo
// Acesso/Saída/Escada-Rampa do pavimento como destino possível.
function listarAcessosParaSelect(acessos, parentId = null, profundidade = 0) {
  return acessosFilhos(acessos, parentId).flatMap(a => [
    { id: a.id, label: `${'— '.repeat(profundidade)}${a.nome}` },
    ...listarAcessosParaSelect(acessos, a.id, profundidade + 1),
  ])
}

const ALVO_SEM_ACESSO = '__sem_acesso__'

// ── Nome editável inline — clique vira input; Enter/blur salva, Escape
// cancela. Mesmo padrão de AmbienteBloco em ExtintoresPage.jsx, em vez de
// window.prompt (abre um diálogo nativo do navegador, fora do site).
function InlineEditableNome({ value, onCommit, textClassName }) {
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
        className={`${textClassName} bg-transparent border-none p-0 outline-none min-w-0`}
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

// Quebra "ACESSO/DESCARGA" -> "ACESSO/" + quebra de linha + "DESCARGA"
// (idem "ESCADA/RAMPA") — os únicos rótulos com "/" que chegam aqui
// (ver tipoDoNo em se_calc.js). Sem "/", mostra o texto como veio (ex.: "Portas").
function LabelQuebrado({ texto }) {
  const partes = texto.split('/')
  if (partes.length !== 2) return texto
  return <>{partes[0]}/<br/>{partes[1]}</>
}

// ── Ambiente (folha da árvore) — arrastável, card inteiro clicável ─────
// Só mostra UP (no lugar da ocupação, no cabeçalho) + população + largura
// mínima da porta — capacidade (C) e o código de divisão saíram do card
// (continuam editáveis no formulário, só não aparecem mais aqui). O
// checkbox de seleção fica fora do drag handle e do clique de editar —
// marcar vários ambientes (inclusive em Acessos diferentes) habilita a
// barra de "mover selecionados" no rodapé (ver moverSelecionados).
function AmbienteChip({ amb, taxaPopulacional, larguras, onEdit, onRemove, selecionado, onToggleSelecao }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `amb:${amb.id}`, data: { kind: 'amb', id: amb.id },
  })
  const pop = calcPopAmb(amb, taxaPopulacional)
  const { pt } = calcNoAmbientePT(amb, taxaPopulacional, larguras)
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div ref={setNodeRef} style={style} onClick={() => onEdit(amb)}
      className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-md border border-solid bg-surface-2 cursor-pointer transition-colors ${selecionado ? 'border-red' : 'border-border-2 hover:border-white/20'} ${isDragging ? 'opacity-40 relative z-50' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <input type="checkbox" checked={selecionado} onChange={() => onToggleSelecao(amb.id)} onClick={e => e.stopPropagation()}
          className="w-auto accent-red cursor-pointer shrink-0" title="Selecionar pra mover em massa"/>
        <button {...attributes} {...listeners} onClick={e => e.stopPropagation()} className="cursor-grab active:cursor-grabbing text-ink-faint touch-none shrink-0" title="Arrastar ambiente">
          <Icon name="grip" size={13}/>
        </button>
        <span className="text-[13px] font-semibold text-ink truncate">{amb.nome}</span>
        <DivBadge label={`${pt.n} UP`}/>
      </div>
      <div className="flex items-center gap-2.5 shrink-0 text-[11px] text-ink-faint whitespace-nowrap">
        <span>{pop} pessoas</span>
        <span className="opacity-30">|</span>
        <span>PORTAS: <strong className="text-red">{fmtM(pt.la)}</strong></span>
        <button onClick={e => { e.stopPropagation(); onRemove(amb.id) }} className="bg-transparent border-none text-ink-faint hover:text-red cursor-pointer p-1 ml-1"><Icon name="trash" size={12}/></button>
      </div>
    </div>
  )
}

// ── Botão de dimensionamento (AD/ER/PT) no cabeçalho de Acesso/Saída —
// liga/desliga qual dimensionamento se aplica àquele nó especificamente
// (um nó pode precisar de mais de um ao mesmo tempo, ex.: o piso de
// descarga que é corredor de saída E chegada da escada). Vermelho
// preenchido = ligado; cinza neutro = desligado.
function DimButton({ label, ativo, onClick }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick() }}
      className={`text-[10px] font-bold uppercase tracking-wide py-1 px-2.5 rounded border border-solid transition-colors ${
        ativo ? 'bg-red border-red text-white' : 'bg-surface-2 border-border text-ink-faint'
      }`}
    >
      {label}
    </button>
  )
}

// ── Um par rótulo+valor da linha de larguras mínimas (ex.: "ACESSO/
// DESCARGA  1,20 m") — só aparece quando o dimensionamento correspondente
// está ligado (ver DimButton).
function DimEntry({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[9px] text-ink-faint uppercase tracking-[.06em] text-center leading-tight"><LabelQuebrado texto={label}/></div>
      <div className="text-[15px] font-bold text-red whitespace-nowrap">{value}</div>
    </div>
  )
}

// ── Acesso/Saída/Escada-Rampa (nó da árvore) — arrastável (o nó inteiro),
// soltável (recebe ambientes e outros acessos), cabeçalho inteiro retrai/
// expande. Cada nó decide independentemente quais dimensionamentos (AD/
// ER/PT) se aplicam a ele via `acesso.dims` (ver DimButton) — um nó pode
// precisar de mais de um ao mesmo tempo (ex.: o piso de descarga que é ao
// mesmo tempo corredor de saída e chegada da escada que desce até ali).
// `dimsDoAcesso` resolve o padrão (mesmo critério que a antiga tipoDoNo)
// quando o nó ainda não tem `dims` gravado (projetos antigos). Só a raiz
// pode abrir novos Acessos filhos — um Acesso comum não pode virar "pai"
// de outro Acesso, mas qualquer um pode receber ambientes direto (+
// Adicionar Ambiente).
function AcessoCard({ acesso, ambientes, acessos, taxaPopulacional, larguras, pisoDescarga, dispatch, pavimentoId, onEditAmbiente, onRemoveAmbiente, onCreateAmbiente, colapsados, toggleColapsado, selecionados, onToggleSelecaoAmbiente }) {
  const dims = dimsDoAcesso(acesso, pisoDescarga)
  const { ad, er, pt, nPorta } = calcDimsAcesso(acesso.id, ambientes, acessos, taxaPopulacional, larguras, dims)
  const entradas = [
    ad && { label: 'ACESSO/DESCARGA', value: fmtM(ad.la) },
    pt && { label: 'PORTAS', value: fmtM(pt.la) },
    er && { label: 'ESCADA/RAMPA', value: fmtM(er.la) },
  ].filter(Boolean)
  const filhos = acessosFilhos(acessos, acesso.id)
  const filhosAmbientes = ambientesDe(ambientes, acesso.id)
  const isRaiz = acesso.alimentaEm === null

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `acs:${acesso.id}`, data: { kind: 'acs', id: acesso.id },
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-acs:${acesso.id}`, data: { kind: 'acesso', id: acesso.id },
  })
  const aberto = !colapsados[acesso.id]
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  const renomear = novoNome => dispatch({ type: 'RENOMEAR_ACESSO', pavimentoId, acessoId: acesso.id, nome: novoNome })
  const remover = e => {
    e.stopPropagation()
    if (window.confirm(`Remover "${acesso.nome}"? Os ambientes/acessos dentro dele ficarão sem posição, mas não serão apagados.`)) {
      dispatch({ type: 'REMOVER_ACESSO', pavimentoId, acessoId: acesso.id })
    }
  }
  const criarAcessoFilho = () => {
    dispatch({ type: 'CRIAR_ACESSO', pavimentoId, alimentaEm: acesso.id, nome: `Acesso ${filhos.length + 1}` })
  }
  const toggleDim = d => dispatch({ type: 'SET_ACESSO_DIM', pavimentoId, acessoId: acesso.id, dim: d, valor: !dims[d] })

  return (
    <div ref={node => { setDragRef(node); setDropRef(node) }} style={style}
      className={`rounded-lg border border-solid bg-surface overflow-hidden transition-colors ${isOver ? 'border-red bg-[rgba(192,21,42,.05)]' : 'border-border hover:border-white/20'} ${isDragging ? 'opacity-40' : ''} ${isRaiz ? '' : 'ml-1'}`}
    >
      <div className="flex items-center justify-between gap-4 py-3 px-3.5 cursor-pointer select-none bg-surface-2" onClick={() => toggleColapsado(acesso.id)}>
        <div className="flex items-center gap-2 min-w-0">
          {!isRaiz && (
            <button {...attributes} {...listeners} onClick={e => e.stopPropagation()} className="cursor-grab active:cursor-grabbing text-ink-faint touch-none shrink-0" title="Arrastar (leva tudo dentro)">
              <Icon name="grip" size={14}/>
            </button>
          )}
          <Icon name={aberto ? 'chevD' : 'chevR'} size={15} className="text-ink-faint shrink-0"/>
          <InlineEditableNome value={acesso.nome} onCommit={renomear} textClassName="text-[15px] font-bold text-ink"/>
          <DivBadge label={`${nPorta} UP`}/>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <DimButton label="AD" ativo={dims.AD} onClick={() => toggleDim('AD')}/>
          <DimButton label="ER" ativo={dims.ER} onClick={() => toggleDim('ER')}/>
          <DimButton label="PT" ativo={dims.PT} onClick={() => toggleDim('PT')}/>
          <button onClick={remover} className="bg-transparent border-none text-ink-faint hover:text-red cursor-pointer p-1 ml-1"><Icon name="trash" size={12}/></button>
        </div>
      </div>
      {entradas.length > 0 && (
        <div className="flex items-center justify-center gap-4 pb-3.5 px-3.5 flex-wrap bg-surface-2">
          {entradas.flatMap((e, i) => [
            i > 0 && <span key={`sep-${i}`} className="text-ink-faint opacity-30">|</span>,
            <DimEntry key={e.label} label={e.label} value={e.value}/>,
          ]).filter(Boolean)}
        </div>
      )}
      {aberto && (
        <div className="pl-7 pr-3.5 pb-3.5 flex flex-col gap-2.5 border-t border-solid border-border-2 pt-3">
          {filhos.map(f => (
            <AcessoCard key={f.id} acesso={f} ambientes={ambientes} acessos={acessos}
              taxaPopulacional={taxaPopulacional} larguras={larguras} pisoDescarga={pisoDescarga} dispatch={dispatch}
              pavimentoId={pavimentoId} onEditAmbiente={onEditAmbiente} onRemoveAmbiente={onRemoveAmbiente} onCreateAmbiente={onCreateAmbiente}
              colapsados={colapsados} toggleColapsado={toggleColapsado}
              selecionados={selecionados} onToggleSelecaoAmbiente={onToggleSelecaoAmbiente}/>
          ))}
          {filhosAmbientes.map(a => (
            <AmbienteChip key={a.id} amb={a} taxaPopulacional={taxaPopulacional} larguras={larguras} onEdit={onEditAmbiente} onRemove={onRemoveAmbiente}
              selecionado={selecionados.has(a.id)} onToggleSelecao={onToggleSelecaoAmbiente}/>
          ))}
          {filhos.length === 0 && filhosAmbientes.length === 0 && (
            <div className="text-[11px] text-ink-faint italic py-1">Arraste ambientes para cá.</div>
          )}
          <div className="flex justify-center gap-2 pt-1">
            {isRaiz && (
              <button className="btn-ghost" onClick={criarAcessoFilho}><Icon name="plus" size={12}/> CRIAR ACESSO</button>
            )}
            <button className="btn-ghost" onClick={() => onCreateAmbiente(acesso.id)}><Icon name="plus" size={12}/> ADICIONAR AMBIENTE</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Área pra soltar e "desprender" um acesso, virando uma nova raiz ────
function RootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-root', data: { kind: 'root' } })
  return (
    <div ref={setNodeRef}
      className={`border border-dashed rounded-md py-2.5 px-3 text-[11px] text-center transition-colors ${isOver ? 'border-red text-red bg-[rgba(192,21,42,.05)]' : 'border-border text-ink-faint'}`}
    >
      Solte um acesso aqui para desprendê-lo, tornando-o uma nova raiz da árvore
    </div>
  )
}

// ── Ambientes ainda sem posição na árvore ──────────────────────────────
function SemAcessoDropZone({ ambientes, taxaPopulacional, larguras, onEdit, onRemove, selecionados, onToggleSelecaoAmbiente }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-null', data: { kind: 'null' } })
  return (
    <div ref={setNodeRef}
      className={`flex flex-col gap-2.5 p-3.5 rounded-lg border border-dashed min-h-[56px] transition-colors ${isOver ? 'border-red bg-[rgba(192,21,42,.05)]' : 'border-border'}`}
    >
      {ambientes.length === 0 && <div className="text-[11px] text-ink-faint italic">Todos os ambientes já estão posicionados na árvore.</div>}
      {ambientes.map(a => (
        <AmbienteChip key={a.id} amb={a} taxaPopulacional={taxaPopulacional} larguras={larguras} onEdit={onEdit} onRemove={onRemove}
          selecionado={selecionados.has(a.id)} onToggleSelecao={onToggleSelecaoAmbiente}/>
      ))}
    </div>
  )
}

// ── Switch "piso de descarga" no cabeçalho do popup ────────────────────
function PisoDescargaSwitch({ checked, onChange }) {
  return (
    <div className="flex items-center gap-3 border border-solid border-border rounded-md py-2 px-3.5 shrink-0">
      <span className="text-xs text-ink-faint whitespace-nowrap">Este pavimento é o <strong className="text-ink font-semibold">piso de descarga</strong>?</span>
      <button onClick={() => onChange(!checked)} className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 shrink-0">
        <div className={`w-7 h-4 rounded-[8px] shrink-0 relative transition-colors duration-200 ${checked ? 'bg-red' : 'bg-border'}`}>
          <div className={`absolute top-0.5 ${checked ? 'left-3.5' : 'left-0.5'} w-3 h-3 rounded-full bg-white transition-[left] duration-200`}/>
        </div>
        <span className={`text-xs font-medium ${checked ? 'text-ink' : 'text-ink-faint'}`}>{checked ? 'Sim' : 'Não'}</span>
      </button>
    </div>
  )
}

// ── Popup principal ─────────────────────────────────────────────────────
// `pav` é o pavimento CRU (state.pavimentos[i], não o remodelado de
// derivarPavimentos) — precisamos de `.label`/`.pisoDescarga`/`.estruturaId`
// tal como vivem no reducer, pra despachar SET_PISO_DESCARGA direto sem
// tradução. CRUD de ambiente (criar/editar/remover) vive aqui — não existe
// mais uma etapa separada de "Ambientes e População". Detecção de incêndio
// e chuveiros automáticos não aparecem aqui: vêm automáticos das Medidas
// de Segurança da estrutura (ver SaidaEmergenciaPage.jsx).
export default function AcessosDescargasView({ pav, seNorma, ocupacoes, dispatch, onClose }) {
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS } = seNorma
  const ambientes = pav.ambientes || []
  const acessos = pav.acessos || []
  const [editAmb, setEditAmb] = useState(null)
  const [colapsados, setColapsados] = useState({})
  const toggleColapsado = id => setColapsados(prev => ({ ...prev, [id]: !prev[id] }))

  // Seleção em massa: marcar vários ambientes (em Acessos diferentes ou
  // ainda sem acesso) e movê-los todos de uma vez pra um Acesso/Saída
  // escolhido (ver MOVER_AMBIENTES_ACESSO no reducer).
  const [selecionados, setSelecionados] = useState(new Set())
  const [alvoSelecao, setAlvoSelecao] = useState('')
  const toggleSelecaoAmbiente = id => setSelecionados(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const limparSelecao = () => setSelecionados(new Set())
  const moverSelecionados = () => {
    if (!selecionados.size || !alvoSelecao) return
    const novoAcessoId = alvoSelecao === ALVO_SEM_ACESSO ? null : alvoSelecao
    dispatch({ type: 'MOVER_AMBIENTES_ACESSO', pavimentoId: pav.id, ambienteIds: [...selecionados], novoAcessoId })
    limparSelecao()
    setAlvoSelecao('')
  }

  const raizes = acessosFilhos(acessos, null)
  const semAcesso = ambientes.filter(a => !a.acessoId)
  const nSaidas = Math.max(1, contarSaidasPavimento(acessos))
  const rotuloRaiz = pav.pisoDescarga ? 'Saída' : 'Escada/Rampa'
  const alvosSelecao = listarAcessosParaSelect(acessos)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const criarRaiz = () => dispatch({ type: 'CRIAR_SAIDA', pavimentoId: pav.id, nome: `${rotuloRaiz} ${String(raizes.length + 1).padStart(2, '0')}` })

  // `acessoId` opcional: quando vem de dentro de um card de Acesso ("+
  // Adicionar Ambiente" ali dentro), o ambiente já nasce atribuído a ele
  // em vez de cair em "sem acesso atribuído".
  const criarAmbiente = (acessoId = null) => {
    const id = novoAmbienteId()
    const nome = `Ambiente ${ambientes.length + 1}`
    dispatch({
      type: 'ADD_AMBIENTE_SE', pavimentoId: pav.id, id,
      ambiente: { nome, divisao: '', popTipo: 'area', area: 0, assentos: 0, popManual: 0, acessoId },
    })
    setEditAmb({ id, nome, divisao: '', popTipo: 'area', area: 0, assentos: 0, popManual: 0 })
  }
  const removerAmbiente = id => {
    dispatch({ type: 'REMOVE_AMBIENTE_SE', pavimentoId: pav.id, ambienteId: id })
    if (editAmb?.id === id) setEditAmb(null)
    setSelecionados(prev => { if (!prev.has(id)) return prev; const next = new Set(prev); next.delete(id); return next })
  }
  const renomearAmbiente = novoNome => {
    dispatch({ type: 'UPDATE_AMBIENTE_SE', pavimentoId: pav.id, ambienteId: editAmb.id, changes: { nome: novoNome } })
    setEditAmb(prev => ({ ...prev, nome: novoNome }))
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over) return
    const activeData = active.data.current
    const overData = over.data.current
    if (!activeData || !overData) return

    if (activeData.kind === 'amb') {
      const novoAcessoId = (overData.kind === 'acesso') ? overData.id : null
      dispatch({ type: 'MOVER_AMBIENTE_ACESSO', pavimentoId: pav.id, ambienteId: activeData.id, novoAcessoId })
      return
    }
    if (activeData.kind === 'acs') {
      const acessoId = activeData.id
      const novoAlimentaEm = (overData.kind === 'acesso') ? overData.id : null
      if (novoAlimentaEm === acessoId) return
      const proibidos = descendentesDe(acessoId, acessos)
      if (novoAlimentaEm !== null && proibidos.has(novoAlimentaEm)) return // evitaria um ciclo
      dispatch({ type: 'MOVER_ACESSO', pavimentoId: pav.id, acessoId, novoAlimentaEm })
    }
  }

  return (
    <div className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-surface border border-solid border-border rounded-lg w-[900px] max-w-[96vw] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.55)]">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 py-4 px-5 border-b border-solid border-border shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={onClose} className="btn-ghost p-1.5 shrink-0"><Icon name="left" size={14}/></button>
            <span className="text-base font-bold text-ink truncate">{pav.label}</span>
          </div>
          <PisoDescargaSwitch checked={!!pav.pisoDescarga} onChange={v => dispatch({ type: 'SET_PISO_DESCARGA', pavimentoId: pav.id, estruturaId: pav.estruturaId, valor: v })}/>
        </div>

        {/* Barra de mover ambientes selecionados em massa */}
        {selecionados.size > 0 && (
          <div className="flex items-center gap-3 py-2.5 px-5 border-b border-solid border-border bg-[rgba(192,21,42,.08)] shrink-0">
            <span className="text-xs font-semibold text-ink whitespace-nowrap">{selecionados.size} ambiente{selecionados.size > 1 ? 's' : ''} selecionado{selecionados.size > 1 ? 's' : ''}</span>
            <select value={alvoSelecao} onChange={e => setAlvoSelecao(e.target.value)}
              className="w-auto flex-1 max-w-[320px] text-xs py-1.5 bg-transparent"
            >
              <option value="">Mover para...</option>
              <option value={ALVO_SEM_ACESSO}>— Sem acesso atribuído —</option>
              {alvosSelecao.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <button className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed" disabled={!alvoSelecao} onClick={moverSelecionados}>
              <Icon name="check" size={12}/> Mover
            </button>
            <button className="bg-transparent border-none text-ink-faint hover:text-ink cursor-pointer text-xs underline ml-auto" onClick={limparSelecao}>
              Cancelar seleção
            </button>
          </div>
        )}

        {/* Corpo */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            <div className="text-[11px] text-ink-faint">Quantidade de saídas (automático): <strong className="text-ink">{nSaidas}</strong></div>

            <div className="flex flex-col gap-3">
              <RootDropZone/>

              <div className="flex flex-col gap-3">
                {raizes.map(r => (
                  <AcessoCard key={r.id} acesso={r} ambientes={ambientes} acessos={acessos}
                    taxaPopulacional={TAXA_POPULACIONAL} larguras={LARGURAS_MINIMAS} pisoDescarga={!!pav.pisoDescarga} dispatch={dispatch}
                    pavimentoId={pav.id} onEditAmbiente={setEditAmb} onRemoveAmbiente={removerAmbiente} onCreateAmbiente={criarAmbiente}
                    colapsados={colapsados} toggleColapsado={toggleColapsado}
                    selecionados={selecionados} onToggleSelecaoAmbiente={toggleSelecaoAmbiente}/>
                ))}
                {raizes.length === 0 && (
                  <div className="p-8 text-center text-ink-faint text-[13px] border border-dashed border-border rounded-lg">
                    Nenhuma {rotuloRaiz.toLowerCase()} criada ainda. Clique abaixo para começar a montar a árvore.
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button className="btn-ghost" onClick={criarRaiz}>
                  <Icon name="plus" size={12}/> CRIAR {rotuloRaiz.toUpperCase()}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[13px] font-semibold text-ink">Ambientes sem acesso atribuído</div>
                <button className="btn-ghost" onClick={() => criarAmbiente()}><Icon name="plus" size={12}/> Adicionar Ambiente</button>
              </div>
              <SemAcessoDropZone ambientes={semAcesso} taxaPopulacional={TAXA_POPULACIONAL} larguras={LARGURAS_MINIMAS} onEdit={setEditAmb} onRemove={removerAmbiente}
                selecionados={selecionados} onToggleSelecaoAmbiente={toggleSelecaoAmbiente}/>
            </div>
          </div>
        </DndContext>
      </div>

      {editAmb && (
        <div className="fixed inset-0 z-[600] bg-black/65 backdrop-blur-sm flex items-center justify-center" onClick={() => setEditAmb(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-surface border border-solid border-border rounded-lg w-[560px] max-w-[95vw] p-5">
            <div className="flex items-center justify-between mb-4">
              <InlineEditableNome value={editAmb.nome} onCommit={renomearAmbiente} textClassName="text-base font-bold text-ink"/>
              <button onClick={() => setEditAmb(null)} className="bg-transparent border-none text-ink-faint hover:text-ink cursor-pointer p-1"><Icon name="x" size={14}/></button>
            </div>
            <AmbienteForm initial={editAmb} seNorma={seNorma} ocupacoes={ocupacoes} larguras={LARGURAS_MINIMAS}
              onSave={changes => { dispatch({ type: 'UPDATE_AMBIENTE_SE', pavimentoId: pav.id, ambienteId: editAmb.id, changes }); setEditAmb(null) }}
              onCancel={() => setEditAmb(null)}/>
          </div>
        </div>
      )}
    </div>
  )
}
