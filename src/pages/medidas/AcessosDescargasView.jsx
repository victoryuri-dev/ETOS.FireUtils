import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Icon from '../../components/ui/Icon'
import { AmbienteForm, DivBadge, Toggle, fmt, fmtM } from './SaidaEmergenciaPage'
import {
  calcPopAmb, calcNoAcesso, calcNoAmbientePT, contarSaidasPavimento,
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

// ── Ambiente (folha da árvore) — arrastável ────────────────────────────
function AmbienteChip({ amb, taxaPopulacional, larguras, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `amb:${amb.id}`, data: { kind: 'amb', id: amb.id },
  })
  const pop = calcPopAmb(amb, taxaPopulacional)
  const { pt } = calcNoAmbientePT(amb, taxaPopulacional, larguras)
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-md border border-solid border-border-2 bg-surface-2 ${isDragging ? 'opacity-40 relative z-50' : ''}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-ink-faint touch-none shrink-0" title="Arrastar ambiente">
          <Icon name="grip" size={13}/>
        </button>
        <DivBadge label={amb.divisao || '?'}/>
        <button onClick={() => onEdit(amb)} className="text-xs text-ink truncate hover:underline bg-transparent border-none cursor-pointer p-0 text-left">{amb.nome}</button>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-[11px] text-ink-faint">
        <span>{pop} pess.</span>
        <span className="text-ink-muted">PT {pt.n} UP · {fmtM(pt.la)}</span>
      </div>
    </div>
  )
}

// ── Acesso/Saída (nó da árvore) — arrastável (o nó inteiro) e soltável
// (recebe ambientes e outros acessos) — recursivo pros filhos.
function AcessoCard({ acesso, ambientes, acessos, taxaPopulacional, larguras, dispatch, pavimentoId, onEditAmbiente, colapsados, toggleColapsado }) {
  const { pop, ad } = calcNoAcesso(acesso.id, ambientes, acessos, taxaPopulacional, larguras)
  const filhos = acessosFilhos(acessos, acesso.id)
  const filhosAmbientes = ambientesDe(ambientes, acesso.id)
  const isRoot = acesso.alimentaEm === null

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `acs:${acesso.id}`, data: { kind: 'acs', id: acesso.id },
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-acs:${acesso.id}`, data: { kind: 'acesso', id: acesso.id },
  })
  const aberto = !colapsados[acesso.id]
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  const renomear = () => {
    const nome = window.prompt('Nome:', acesso.nome)
    if (nome && nome.trim()) dispatch({ type: 'RENOMEAR_ACESSO', pavimentoId, acessoId: acesso.id, nome: nome.trim() })
  }
  const remover = () => {
    if (window.confirm(`Remover "${acesso.nome}"? Os ambientes/acessos dentro dele ficarão sem posição, mas não serão apagados.`)) {
      dispatch({ type: 'REMOVER_ACESSO', pavimentoId, acessoId: acesso.id })
    }
  }
  const criarAcessoFilho = () => {
    dispatch({ type: 'CRIAR_ACESSO', pavimentoId, alimentaEm: acesso.id, nome: `Acesso ${filhos.length + 1}` })
  }

  return (
    <div ref={node => { setDragRef(node); setDropRef(node) }} style={style}
      className={`rounded-lg border border-solid bg-surface transition-colors ${isOver ? 'border-red bg-[rgba(192,21,42,.05)]' : 'border-border'} ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 py-2.5 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-ink-faint touch-none shrink-0" title="Arrastar (leva tudo dentro)">
            <Icon name="grip" size={14}/>
          </button>
          <button onClick={() => toggleColapsado(acesso.id)} className="text-ink-faint shrink-0 bg-transparent border-none cursor-pointer p-0">
            <Icon name={aberto ? 'chevD' : 'chevR'} size={13}/>
          </button>
          {isRoot
            ? <span className="text-[9px] py-0.5 px-1.5 rounded bg-red-dim border border-solid border-red-border text-red font-semibold shrink-0">SAÍDA</span>
            : <span className="text-[9px] py-0.5 px-1.5 rounded bg-surface-2 border border-solid border-border text-ink-faint font-semibold shrink-0">ACESSO</span>}
          <button onClick={renomear} className="text-[13px] font-semibold text-ink truncate hover:underline bg-transparent border-none cursor-pointer p-0 text-left">{acesso.nome}</button>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="text-ink-faint">{pop} pess.</span>
          <span className="font-bold text-red">{ad.n} UP</span>
          <span className="text-ink-muted">{fmtM(ad.la)}</span>
          <button className="btn-ghost !py-1 !px-2" onClick={criarAcessoFilho}><Icon name="plus" size={11}/> Acesso</button>
          <button onClick={remover} className="bg-transparent border-none text-ink-faint hover:text-red cursor-pointer p-1"><Icon name="trash" size={12}/></button>
        </div>
      </div>
      {aberto && (
        <div className="pl-6 pr-3 pb-3 flex flex-col gap-2 border-t border-solid border-border-2 pt-2.5">
          {filhos.map(f => (
            <AcessoCard key={f.id} acesso={f} ambientes={ambientes} acessos={acessos}
              taxaPopulacional={taxaPopulacional} larguras={larguras} dispatch={dispatch}
              pavimentoId={pavimentoId} onEditAmbiente={onEditAmbiente}
              colapsados={colapsados} toggleColapsado={toggleColapsado}/>
          ))}
          {filhosAmbientes.map(a => (
            <AmbienteChip key={a.id} amb={a} taxaPopulacional={taxaPopulacional} larguras={larguras} onEdit={onEditAmbiente}/>
          ))}
          {filhos.length === 0 && filhosAmbientes.length === 0 && (
            <div className="text-[11px] text-ink-faint italic py-1">Arraste ambientes ou acessos para cá.</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Área pra soltar e "desprender" um acesso, virando uma nova Saída ───
function RootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-root', data: { kind: 'root' } })
  return (
    <div ref={setNodeRef}
      className={`border border-dashed rounded-md py-2 px-3 text-[11px] text-center transition-colors ${isOver ? 'border-red text-red bg-[rgba(192,21,42,.05)]' : 'border-border text-ink-faint'}`}
    >
      Solte um acesso aqui para transformá-lo em uma nova saída independente
    </div>
  )
}

// ── Ambientes ainda sem posição na árvore ──────────────────────────────
function SemAcessoDropZone({ ambientes, taxaPopulacional, larguras, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-null', data: { kind: 'null' } })
  return (
    <div ref={setNodeRef}
      className={`flex flex-col gap-2 p-3 rounded-lg border border-dashed min-h-[56px] transition-colors ${isOver ? 'border-red bg-[rgba(192,21,42,.05)]' : 'border-border'}`}
    >
      {ambientes.length === 0 && <div className="text-[11px] text-ink-faint italic">Todos os ambientes já estão posicionados na árvore.</div>}
      {ambientes.map(a => (
        <AmbienteChip key={a.id} amb={a} taxaPopulacional={taxaPopulacional} larguras={larguras} onEdit={onEdit}/>
      ))}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────
// `pav` é o pavimento CRU (state.pavimentos[i], não o remodelado de
// derivarPavimentos) — precisamos de `.label`/`.pisoDescarga`/`.temDeteccao`
// tal como vivem no reducer, pra despachar UPDATE_PAV/SET_PAV_DETECCAO
// direto sem tradução.
export default function AcessosDescargasView({ pav, seNorma, ocupacoes, dispatch, onBack }) {
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS } = seNorma
  const ambientes = pav.ambientes || []
  const acessos = pav.acessos || []
  const [editAmb, setEditAmb] = useState(null)
  const [colapsados, setColapsados] = useState({})
  const toggleColapsado = id => setColapsados(prev => ({ ...prev, [id]: !prev[id] }))

  const raizes = acessosFilhos(acessos, null)
  const semAcesso = ambientes.filter(a => !a.acessoId)
  const nSaidas = Math.max(1, contarSaidasPavimento(acessos))

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const criarSaida = () => dispatch({ type: 'CRIAR_SAIDA', pavimentoId: pav.id, nome: `Saída ${raizes.length + 1}` })

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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[12px] text-ink-faint">
          <button onClick={onBack} className="hover:text-ink hover:underline bg-transparent border-none cursor-pointer p-0">Pavimentos</button>
          <span>/</span>
          <span className="text-ink font-medium">{pav.label}</span>
          <span>/</span>
          <span className="text-ink font-medium">Acessos e Descargas</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Toggle checked={!!pav.pisoDescarga} onChange={v => dispatch({ type: 'UPDATE_PAV', id: pav.id, changes: { pisoDescarga: v } })} label="Piso de descarga"/>
          <Toggle checked={!!pav.temDeteccao}  onChange={v => dispatch({ type: 'SET_PAV_DETECCAO', pavimentoId: pav.id, valor: v })} label="Detecção de incêndio"/>
          <span className="ml-auto text-[11px] text-ink-faint">Quantidade de saídas (automático): <strong className="text-ink">{nSaidas}</strong></span>
        </div>

        <RootDropZone/>

        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-ink">Saídas</div>
          <button className="btn-ghost" onClick={criarSaida}><Icon name="plus" size={12}/> Criar saída</button>
        </div>

        <div className="flex flex-col gap-3">
          {raizes.map(r => (
            <AcessoCard key={r.id} acesso={r} ambientes={ambientes} acessos={acessos}
              taxaPopulacional={TAXA_POPULACIONAL} larguras={LARGURAS_MINIMAS} dispatch={dispatch}
              pavimentoId={pav.id} onEditAmbiente={setEditAmb}
              colapsados={colapsados} toggleColapsado={toggleColapsado}/>
          ))}
          {raizes.length === 0 && (
            <div className="p-8 text-center text-ink-faint text-[13px] border border-dashed border-border rounded-lg">
              Nenhuma saída criada ainda. Clique em "Criar saída" para começar a montar a árvore.
            </div>
          )}
        </div>

        <div>
          <div className="text-[13px] font-semibold text-ink mb-2">Ambientes sem acesso atribuído</div>
          <SemAcessoDropZone ambientes={semAcesso} taxaPopulacional={TAXA_POPULACIONAL} larguras={LARGURAS_MINIMAS} onEdit={setEditAmb}/>
        </div>
      </div>

      {editAmb && (
        <div className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm flex items-center justify-center" onClick={() => setEditAmb(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-surface border border-solid border-border rounded-lg w-[620px] max-w-[95vw] p-5">
            <div className="text-[13px] font-semibold text-ink mb-3">Editar ambiente</div>
            <AmbienteForm initial={editAmb} autoFocus seNorma={seNorma} ocupacoes={ocupacoes}
              onSave={changes => { dispatch({ type: 'UPDATE_AMBIENTE_SE', pavimentoId: pav.id, ambienteId: editAmb.id, changes }); setEditAmb(null) }}
              onCancel={() => setEditAmb(null)}/>
          </div>
        </div>
      )}
    </DndContext>
  )
}
