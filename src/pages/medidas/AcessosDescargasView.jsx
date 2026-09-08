import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Icon from '../../components/ui/Icon'
import { AmbienteForm, DivBadge, fmtM } from './se_shared'
import {
  calcPopAmb, calcNoAcesso, calcNoAmbientePT, contarSaidasPavimento, tipoDoNo,
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

// ── Coluna de estatística (POP./C/U.P./LARGURA MÍN.) ───────────────────
function StatCol({ label, value, big }) {
  return (
    <div className="text-right leading-tight">
      <div className="text-[9px] text-ink-faint uppercase tracking-[.06em]">{label}</div>
      <div className={`text-[13px] font-bold mt-0.5 ${big ? 'text-red' : 'text-ink'}`}>{value}</div>
    </div>
  )
}

// ── Ambiente (folha da árvore) — arrastável ────────────────────────────
function AmbienteChip({ amb, taxaPopulacional, larguras, onEdit, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `amb:${amb.id}`, data: { kind: 'amb', id: amb.id },
  })
  const pop = calcPopAmb(amb, taxaPopulacional)
  const { capPT, pt } = calcNoAmbientePT(amb, taxaPopulacional, larguras)
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-md border border-solid border-border-2 bg-surface-2 transition-colors hover:border-white/20 ${isDragging ? 'opacity-40 relative z-50' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-ink-faint touch-none shrink-0" title="Arrastar ambiente">
          <Icon name="grip" size={13}/>
        </button>
        <button onClick={() => onEdit(amb)} className="text-[13px] font-semibold text-ink truncate hover:underline bg-transparent border-none cursor-pointer p-0 text-left">{amb.nome}</button>
        <DivBadge label={amb.divisao || '?'}/>
      </div>
      <div className="flex items-center gap-2.5 shrink-0 text-[11px] text-ink-faint whitespace-nowrap">
        <span className="font-semibold text-ink-muted">PORTA</span>
        <span className="opacity-30">|</span>
        <span>C {capPT}</span>
        <span className="opacity-30">|</span>
        <span>{pop} pessoas</span>
        <span className="opacity-30">|</span>
        <span className="font-bold text-red">{pt.n} UP</span>
        <span className="opacity-30">|</span>
        <span>L. MÍN.: <strong className="text-ink">{fmtM(pt.la)}</strong></span>
        <button onClick={() => onRemove(amb.id)} className="bg-transparent border-none text-ink-faint hover:text-red cursor-pointer p-1 ml-1"><Icon name="trash" size={12}/></button>
      </div>
    </div>
  )
}

// ── Acesso/Saída/Escada-Rampa (nó da árvore) — arrastável (o nó inteiro)
// e soltável (recebe ambientes e outros acessos) — recursivo pros filhos.
// `pisoDescarga` (do pavimento) + `acesso.alimentaEm` decidem o tipo via
// tipoDoNo: raiz num piso de descarga é Saída (AD); raiz em outro
// pavimento é Escada/Rampa (ER); qualquer nó que não é raiz é sempre
// Acesso/Descarga (AD). Só a raiz pode abrir novos Acessos filhos — um
// Acesso comum não pode virar "pai" de outro Acesso.
function AcessoCard({ acesso, ambientes, acessos, taxaPopulacional, larguras, pisoDescarga, dispatch, pavimentoId, onEditAmbiente, onRemoveAmbiente, colapsados, toggleColapsado }) {
  const { tipo, label } = tipoDoNo(acesso, pisoDescarga)
  const { pop, capValor, dim } = calcNoAcesso(acesso.id, ambientes, acessos, taxaPopulacional, larguras, tipo)
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
      className={`rounded-lg border border-solid bg-surface transition-colors ${isOver ? 'border-red bg-[rgba(192,21,42,.05)]' : 'border-border hover:border-white/20'} ${isDragging ? 'opacity-40' : ''} ${isRaiz ? '' : 'ml-1'}`}
    >
      <div className="flex items-center justify-between gap-4 py-3.5 px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-ink-faint touch-none shrink-0" title="Arrastar (leva tudo dentro)">
            <Icon name="grip" size={14}/>
          </button>
          <button onClick={() => toggleColapsado(acesso.id)} className="text-ink-faint shrink-0 bg-transparent border-none cursor-pointer p-0">
            <Icon name={aberto ? 'chevD' : 'chevR'} size={15}/>
          </button>
          <button onClick={renomear} className="text-[15px] font-bold text-ink truncate hover:underline bg-transparent border-none cursor-pointer p-0 text-left">{acesso.nome}</button>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-[9px] text-ink-faint uppercase tracking-[.06em] text-right leading-tight w-[72px]">{label}</div>
          <StatCol label="POP." value={pop}/>
          <StatCol label="C" value={capValor}/>
          <StatCol label="U.P." value={dim.n}/>
          <StatCol label="LARGURA MÍN." value={fmtM(dim.la)} big/>
          <button onClick={remover} className="bg-transparent border-none text-ink-faint hover:text-red cursor-pointer p-1"><Icon name="trash" size={12}/></button>
        </div>
      </div>
      {aberto && (
        <div className="pl-7 pr-4 pb-4 flex flex-col gap-2.5 border-t border-solid border-border-2 pt-3">
          {filhos.map(f => (
            <AcessoCard key={f.id} acesso={f} ambientes={ambientes} acessos={acessos}
              taxaPopulacional={taxaPopulacional} larguras={larguras} pisoDescarga={pisoDescarga} dispatch={dispatch}
              pavimentoId={pavimentoId} onEditAmbiente={onEditAmbiente} onRemoveAmbiente={onRemoveAmbiente}
              colapsados={colapsados} toggleColapsado={toggleColapsado}/>
          ))}
          {filhosAmbientes.map(a => (
            <AmbienteChip key={a.id} amb={a} taxaPopulacional={taxaPopulacional} larguras={larguras} onEdit={onEditAmbiente} onRemove={onRemoveAmbiente}/>
          ))}
          {filhos.length === 0 && filhosAmbientes.length === 0 && (
            <div className="text-[11px] text-ink-faint italic py-1">Arraste ambientes para cá.</div>
          )}
          {isRaiz && (
            <div className="flex justify-center pt-1">
              <button className="btn-ghost" onClick={criarAcessoFilho}><Icon name="plus" size={12}/> CRIAR ACESSO</button>
            </div>
          )}
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
function SemAcessoDropZone({ ambientes, taxaPopulacional, larguras, onEdit, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-null', data: { kind: 'null' } })
  return (
    <div ref={setNodeRef}
      className={`flex flex-col gap-2.5 p-3.5 rounded-lg border border-dashed min-h-[56px] transition-colors ${isOver ? 'border-red bg-[rgba(192,21,42,.05)]' : 'border-border'}`}
    >
      {ambientes.length === 0 && <div className="text-[11px] text-ink-faint italic">Todos os ambientes já estão posicionados na árvore.</div>}
      {ambientes.map(a => (
        <AmbienteChip key={a.id} amb={a} taxaPopulacional={taxaPopulacional} larguras={larguras} onEdit={onEdit} onRemove={onRemove}/>
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
// derivarPavimentos) — precisamos de `.label`/`.pisoDescarga` tal como
// vivem no reducer, pra despachar UPDATE_PAV direto sem tradução. CRUD de
// ambiente (criar/editar/remover) vive aqui — não existe mais uma etapa
// separada de "Ambientes e População". Detecção de incêndio e chuveiros
// automáticos não aparecem aqui: vêm automáticos das Medidas de Segurança
// da estrutura (ver SaidaEmergenciaPage.jsx), não são editáveis por
// pavimento nem dentro desta árvore.
export default function AcessosDescargasView({ pav, seNorma, ocupacoes, dispatch, onClose }) {
  const { TAXA_POPULACIONAL, LARGURAS_MINIMAS } = seNorma
  const ambientes = pav.ambientes || []
  const acessos = pav.acessos || []
  const [editAmb, setEditAmb] = useState(null)
  const [colapsados, setColapsados] = useState({})
  const toggleColapsado = id => setColapsados(prev => ({ ...prev, [id]: !prev[id] }))

  const raizes = acessosFilhos(acessos, null)
  const semAcesso = ambientes.filter(a => !a.acessoId)
  const nSaidas = Math.max(1, contarSaidasPavimento(acessos))
  const rotuloRaiz = pav.pisoDescarga ? 'Saída' : 'Escada/Rampa'

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const criarRaiz = () => dispatch({ type: 'CRIAR_SAIDA', pavimentoId: pav.id, nome: `${rotuloRaiz} ${String(raizes.length + 1).padStart(2, '0')}` })

  const criarAmbiente = () => {
    const id = novoAmbienteId()
    const nome = `Ambiente ${ambientes.length + 1}`
    dispatch({
      type: 'ADD_AMBIENTE_SE', pavimentoId: pav.id, id,
      ambiente: { nome, divisao: '', popTipo: 'area', area: 0, assentos: 0, popManual: 0, acessoId: null },
    })
    setEditAmb({ id, nome, divisao: '', popTipo: 'area', area: 0, assentos: 0, popManual: 0 })
  }
  const removerAmbiente = id => {
    dispatch({ type: 'REMOVE_AMBIENTE_SE', pavimentoId: pav.id, ambienteId: id })
    if (editAmb?.id === id) setEditAmb(null)
  }
  const renomearAmbiente = () => {
    const nome = window.prompt('Nome do ambiente:', editAmb.nome)
    if (nome && nome.trim()) {
      dispatch({ type: 'UPDATE_AMBIENTE_SE', pavimentoId: pav.id, ambienteId: editAmb.id, changes: { nome: nome.trim() } })
      setEditAmb(prev => ({ ...prev, nome: nome.trim() }))
    }
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
          <PisoDescargaSwitch checked={!!pav.pisoDescarga} onChange={v => dispatch({ type: 'UPDATE_PAV', id: pav.id, changes: { pisoDescarga: v } })}/>
        </div>

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
                    pavimentoId={pav.id} onEditAmbiente={setEditAmb} onRemoveAmbiente={removerAmbiente}
                    colapsados={colapsados} toggleColapsado={toggleColapsado}/>
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
                <button className="btn-ghost" onClick={criarAmbiente}><Icon name="plus" size={12}/> Adicionar Ambiente</button>
              </div>
              <SemAcessoDropZone ambientes={semAcesso} taxaPopulacional={TAXA_POPULACIONAL} larguras={LARGURAS_MINIMAS} onEdit={setEditAmb} onRemove={removerAmbiente}/>
            </div>
          </div>
        </DndContext>
      </div>

      {editAmb && (
        <div className="fixed inset-0 z-[600] bg-black/65 backdrop-blur-sm flex items-center justify-center" onClick={() => setEditAmb(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-surface border border-solid border-border rounded-lg w-[560px] max-w-[95vw] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-ink">{editAmb.nome}</span>
                <button onClick={renomearAmbiente} className="bg-transparent border-none text-ink-faint hover:text-ink cursor-pointer p-1"><Icon name="edit" size={13}/></button>
              </div>
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
