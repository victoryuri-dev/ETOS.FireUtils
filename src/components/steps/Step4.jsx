import { useState, useRef, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useCnaeCnpjLookup } from '../../hooks/useCnaeCnpjLookup'
import Icon from '../ui/Icon'
import EstruturaSection from '../ui/EstruturaSection'
import EstruturaHeaderInfo from '../ui/EstruturaHeaderInfo'
import InfoTip from '../ui/InfoTip'
import { useToast } from '../../hooks/useToast'

const blockTitle = 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border flex items-center justify-between'

function maskCNAE(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 7)
  if (d.length <= 4) return d
  if (d.length === 5) return d.slice(0, 4) + '-' + d[4]
  return d.slice(0, 4) + '-' + d[4] + '/' + d.slice(5, 7)
}

function findGlobally(cargaMap, cnae) {
  for (const [div, cnaes] of Object.entries(cargaMap)) {
    if (cnaes[cnae]) return { cnae, divisao: div, grupo: div.charAt(0), ...cnaes[cnae] }
  }
  return null
}

// ── CNAE Autocomplete ─────────────────────────────────────────────────
function CnaeBusca({ divisao, value, descValue, onSelect, onDescChange, onAutoFill }) {
  const { cnaesDiv, cargaMap } = useNorma()
  const [query, setQuery]     = useState(value || '')
  const [open, setOpen]       = useState(false)
  const [results, setResults] = useState([])
  const ref = useRef()
  const allCnaes = Object.entries(cnaesDiv(divisao))

  useEffect(() => { setQuery(value || '') }, [value])

  const populate = (q) => {
    if (!q) {
      setResults(allCnaes.map(([cnae, d]) => ({ cnae, divisao, ...d })))
    } else {
      const ql = q.toLowerCase()
      setResults(
        allCnaes
          .filter(([cnae, d]) => cnae.includes(q) || d.descricao.toLowerCase().includes(ql))
          .map(([cnae, d]) => ({ cnae, divisao, ...d }))
      )
    }
  }

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleFocus = () => { populate(query); setOpen(true) }
  const handleInput = (e) => {
    const raw = e.target.value
    // Assim que aparece uma letra, é busca por descrição ("hospital",
    // "escola"...) — não pelo número do CNAE. maskCNAE descartaria toda
    // letra digitada (só deixa passar dígito), então precisa desviar dela
    // nesse caso pra deixar o texto livre chegar em populate().
    if (/[a-zA-ZÀ-ſ]/.test(raw)) {
      setQuery(raw)
      populate(raw); setOpen(true)
      return
    }
    const masked = maskCNAE(raw)
    setQuery(masked)
    if (masked.length === 9) {
      const found = findGlobally(cargaMap, masked)
      if (found) { setOpen(false); onAutoFill?.(found); return }
    }
    populate(masked); setOpen(true)
  }
  const handleSelect = (item) => { setQuery(item.cnae); setOpen(false); onSelect(item) }
  const handleClear  = () => { setQuery(''); onSelect({ cnae:'', descricao:'', cargaIncendio:null }); setOpen(false) }

  const selectedData = value ? cnaesDiv(divisao)[value] : null
  // `results` só é populado quando o usuário interage com o campo (foco/
  // digitação — ver populate()) — quando o CNAE chega por fora (ex.: botão
  // "Usar esta classificação" de BuscaCnaePorCnpj, que despacha direto no
  // pavimento sem passar por este componente), `results` fica vazio mesmo
  // com um `value` válido, e sem o `!selectedData` aqui "CNAE não
  // encontrado" aparecia por engano pra CNAEs que já estavam corretamente
  // catalogados (o texto da carga de incêndio ficava certo, só a mensagem
  // de erro que era falsa).
  const naoEncontrado = !selectedData && query.length >= 3 && results.length === 0

  return (
    <div ref={ref} className="relative">
      <div className="fg">
        <label>
          CNAE <span className="req">*</span>
          <InfoTip side="bottom" align="start" text="Clique no campo para ver todos os CNAEs desta divisão, ou digite o número ou parte da descrição para filtrar."/>
        </label>
        <div className="relative">
          <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/>
          <input value={query} onChange={handleInput} onFocus={handleFocus}
            placeholder="Buscar por número ou descrição…"
            className={`pl-8 ${query ? 'pr-[30px]' : 'pr-3'}`}/>
          {query && (
            <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-ink-faint cursor-pointer p-0.5">
              <Icon name="x" size={12}/>
            </button>
          )}
        </div>
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-surface border border-solid border-red-border rounded-md z-[400] max-h-[260px] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,.5)]">
            <div className="px-3 py-1.5 text-[10px] text-ink-faint border-b border-solid border-border-2 bg-surface-2">
              {results.length} resultado{results.length !== 1 ? 's' : ''} {query ? `para "${query}"` : `em ${divisao}`}
            </div>
            {results.map((r, i) => (
              <div key={i} onClick={() => handleSelect(r)}
                className="px-3 py-2.5 cursor-pointer border-b border-solid border-border-2 grid grid-cols-[90px_1fr_72px] gap-3 items-center hover:bg-red-dim">
                <span className="text-xs font-mono text-red font-semibold">{r.cnae}</span>
                <span className="text-xs text-ink leading-[1.4]">{r.descricao}</span>
                <div className={`text-center border border-solid rounded-sm py-1 px-1.5 ${r.cargaIncendio<=300?'bg-green-dim border-green-border':r.cargaIncendio<=1200?'bg-amber-dim border-amber-border':'bg-red-dim border-red-border'}`}>
                  <div className={`text-sm font-bold leading-none ${r.cargaIncendio<=300?'text-green':r.cargaIncendio<=1200?'text-amber':'text-red'}`}>{r.cargaIncendio}</div>
                  <div className="text-[9px] text-ink-faint mt-px">MJ/m2</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedData && (
        <div className="mt-2 text-[12px] text-ink-muted leading-[1.5] py-2 px-3 bg-surface-2 rounded-md border border-solid border-border">
          <span className="font-mono text-ink mr-2">{value}</span>
          {selectedData.descricao}
        </div>
      )}
      {naoEncontrado && (
        <div className="fg mt-2">
          <label>CNAE não encontrado — descreva a atividade</label>
          <input value={descValue || ''} onChange={e => onDescChange(e.target.value)} placeholder="Descreva a atividade para referencia no memorial"/>
        </div>
      )}
    </div>
  )
}

// ── Título de seção do modal; o texto normativo fica num "(?)" com hover ──
function SecaoTitulo({ titulo, tip }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-solid border-border-2">
      <h4 className="m-0 font-heading text-[14px] font-semibold text-ink">{titulo}</h4>
      {tip && <InfoTip text={tip} side="bottom" align="start"/>}
    </div>
  )
}

// ── Sugestão de classificação a partir do CNPJ (só no Térreo) ──────────
// O Térreo carrega a ocupação predominante da edificação — por isso só ele
// ganha esse atalho. O CNPJ já foi informado na Etapa 1 (Responsável pelo
// uso), então a busca dispara sozinha ao abrir o modal — sem pedir de novo.
// Acha o CNAE fiscal da empresa (mesma API de useCnpjLookup) e casa contra
// a base normativa pra sugerir grupo/divisão automaticamente.
function BuscaCnaePorCnpj({ pav, dispatch }) {
  const { state } = useProjeto()
  const { buscar, limpar, error, resultado } = useCnaeCnpjLookup()
  const toast = useToast()
  const cnpjDigits = (state.respCNPJ || '').replace(/\D/g, '')

  useEffect(() => {
    if (cnpjDigits.length === 14) buscar(state.respCNPJ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpjDigits])

  const aplicarClassificacao = () => {
    if (!resultado?.match) return
    dispatch({
      type: 'UPDATE_PAV', id: pav.id,
      changes: { grupo: resultado.match.grupo, divisao: resultado.match.divisao, cnae: resultado.match.cnae, cnaeDesc: resultado.match.descricao },
    })
    limpar()
  }

  // Retornos da busca viram notificações. A sugestão de CNAE fica mais tempo
  // na tela porque pede uma decisão; sem correspondencia na base normativa nao
  // ha nada pra sugerir, entao nao notifica.
  useEffect(() => {
    if (error) toast.error(`Nao foi possivel sugerir a classificacao pelo CNPJ da Etapa 1: ${error}`)
  }, [error, toast])

  useEffect(() => {
    if (!resultado?.match) return
    const id = toast.info(
      `${resultado.cnae} — ${resultado.descricao}. Corresponde a ${resultado.match.divisao} — ${resultado.match.descricao} na norma. Pode ser diferente da ocupacao real do Terreo — confirme antes de usar.`,
      { title: 'CNAE encontrado pelo CNPJ da Etapa 1', duration: 20000, action: { label: 'Usar esta classificacao no Terreo', onClick: aplicarClassificacao } },
    )
    return () => toast.dismiss(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado, toast])

  return null
}

// ── Linha de ocupação subsidiária ─────────────────────────────────────
function AcessRow({ pav, acess, index, usadas }) {
  const { dispatch } = useProjeto()
  const { ocupacoes, grupos } = useNorma()

  const grupoAtual  = acess.divisao?.charAt(0) || Object.keys(ocupacoes)[0] || 'A'
  const divisoesGrp = ocupacoes[grupoAtual]?.divisoes || {}
  const gruposKeys  = Object.keys(ocupacoes)

  const setGrupo    = (g) => {
    const firstDiv = Object.keys(ocupacoes[g]?.divisoes || {})[0] || ''
    dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ divisao:firstDiv, cnae:'', cnaeDesc:'' } })
  }
  const setDivisao  = (d) => dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ divisao:d, cnae:'', cnaeDesc:'' } })
  const setCNAE     = (item) => dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ cnae:item.cnae, cnaeDesc:item.descricao } })
  const setCnaeDesc = (v) => dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ cnaeDesc:v } })
  const setArea     = (v) => dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ area:v } })

  const handleAutoFill = (found) => {
    dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ divisao:found.divisao, cnae:found.cnae, cnaeDesc:found.descricao } })
  }

  return (
    <div className="border border-solid border-border rounded-lg p-4 bg-bg">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[12px] font-medium text-ink-muted">Ocupação subsidiária {index + 1}</span>
        <button className="btn-del" title="Remover ocupação subsidiária" aria-label="Remover ocupação subsidiária"
          onClick={() => dispatch({ type:'REMOVE_ACESS', id:pav.id, index })}>
          <Icon name="trash" size={13}/>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3 mb-3.5">
        <div className="fg">
          <label>Grupo</label>
          <select value={grupoAtual} onChange={e => setGrupo(e.target.value)}>
            {gruposKeys.map(g => (
              <option key={g} value={g}>{g} — {grupos[g] || g}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Divisão</label>
          <select value={acess.divisao} onChange={e => setDivisao(e.target.value)} title={divisoesGrp[acess.divisao] ? `${acess.divisao} — ${divisoesGrp[acess.divisao]}` : undefined}>
            {Object.entries(divisoesGrp).map(([code, label]) => {
              const jaUsada = usadas.has(code) && code !== acess.divisao
              return <option key={code} value={code} disabled={jaUsada}>{code} — {label}{jaUsada?' (já utilizada)':''}</option>
            })}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 items-start">
        <CnaeBusca divisao={acess.divisao} value={acess.cnae || ''} descValue={acess.cnaeDesc || ''}
          onSelect={setCNAE} onDescChange={setCnaeDesc} onAutoFill={handleAutoFill}/>
        <div className="fg">
          <label>Área (m²)</label>
          <input type="number" value={acess.area} onChange={e => setArea(e.target.value)} placeholder="0"/>
        </div>
      </div>
    </div>
  )
}

// ── Modal de classificação do pavimento ───────────────────────────────
function PavModal({ pav, onClose }) {
  const { state, dispatch } = useProjeto()
  const { ocupacoes, grupos } = useNorma()
  const estrutura = state.estruturas.find(e => e.id === pav.estruturaId)

  const gruposKeys = Object.keys(ocupacoes)
  const divisoes   = ocupacoes[pav.grupo]?.divisoes || {}

  const setGrupo    = (g) => {
    const firstDiv = Object.keys(ocupacoes[g]?.divisoes || {})[0] || ''
    dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ grupo:g, divisao:firstDiv, cnae:'', cnaeDesc:'' } })
  }
  const setDivisao  = (d) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ divisao:d, cnae:'', cnaeDesc:'' } })
  const setArea     = (v) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ area:v } })
  const setCNAE     = (item) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ cnae:item.cnae, cnaeDesc:item.descricao } })
  const setCnaeDesc = (v) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ cnaeDesc:v } })
  const handleAutoFill = (found) => {
    dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ grupo:found.grupo, divisao:found.divisao, cnae:found.cnae, cnaeDesc:found.descricao } })
  }

  const usadas = new Set([pav.divisao, ...pav.acess.map(a => a.divisao)])

  return (
    <div
      className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-solid border-border rounded-lg w-[760px] max-w-[96vw] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.55)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 py-[18px] px-[24px] border-b border-solid border-border shrink-0">
          <div className="min-w-0">
            <h3 className="m-0 flex items-center gap-2 font-heading text-[19px] font-semibold text-ink leading-tight">
              <Icon name="stair" size={17} className="text-ink-faint shrink-0"/>{pav.label}
            </h3>
            <div className="text-[12px] text-ink-faint mt-1 truncate">{estrutura?.nome || 'Estrutura'}</div>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            {pav.tipo === 'terreo' && (
              <>
                <button className="btn-ghost text-[12px]"
                  onClick={() => dispatch({ type:'REPLICATE_TERREO', estruturaId: pav.estruturaId })}>
                  <Icon name="check" size={12}/> Repetir para todos
                </button>
                <InfoTip side="bottom" align="end" text="Copia esta classificação do térreo para todos os outros pavimentos desta estrutura."/>
              </>
            )}
            <button className="btn-ghost p-1.5" onClick={onClose} aria-label="Fechar">
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-6 px-[24px]">

          {pav.tipo === 'terreo' && <BuscaCnaePorCnpj pav={pav} dispatch={dispatch}/>}

          {/* Ocupação principal */}
          <div className="mb-8">
            <SecaoTitulo
              titulo="Ocupação principal"
              tip="Atividade ou uso principal exercido na edificação ou área de risco (ocupação predominante)."
            />

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3 mb-3.5">
              <div className="fg">
                <label>Grupo</label>
                <select value={pav.grupo} onChange={e => setGrupo(e.target.value)}>
                  {gruposKeys.map(g => (
                    <option key={g} value={g}>{g} — {grupos[g] || g}</option>
                  ))}
                </select>
              </div>
              <div className="fg">
                <label>Divisão</label>
                <select value={pav.divisao} onChange={e => setDivisao(e.target.value)} title={divisoes[pav.divisao] ? `${pav.divisao} — ${divisoes[pav.divisao]}` : undefined}>
                  {Object.entries(divisoes).map(([code, label]) => {
                    const jaUsada = pav.acess.some(a => a.divisao === code)
                    return <option key={code} value={code} disabled={jaUsada}>{code} — {label}{jaUsada?' (já utilizada)':''}</option>
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 items-start">
              <CnaeBusca divisao={pav.divisao} value={pav.cnae} descValue={pav.cnaeDesc}
                onSelect={setCNAE} onDescChange={setCnaeDesc} onAutoFill={handleAutoFill}/>
              <div className="fg">
                <label>Área (m²)</label>
                <input type="number" value={pav.area} onChange={e => setArea(e.target.value)} placeholder="0"/>
              </div>
            </div>
          </div>

          {/* Ocupações subsidiárias */}
          <div>
            <SecaoTitulo
              titulo="Ocupações subsidiárias"
              tip="Atividade ou uso de apoio ou suporte, vinculada à atividade ou uso principal da ocupação predominante. Quando a ocupação subsidiária ultrapassa 10% da área construída da estrutura, ela passa a ser tratada como ocupação mista ou secundária."
            />

            {pav.acess.length > 0 && (
              <div className="flex flex-col gap-3 mb-3">
                {pav.acess.map((a, i) => (
                  <AcessRow key={i} pav={pav} acess={a} index={i} usadas={usadas}/>
                ))}
              </div>
            )}
            <button className="btn-add"
              onClick={() => dispatch({ type:'ADD_ACESS', id:pav.id })}>
              <Icon name="plus" size={11}/> Adicionar ocupação subsidiária
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="py-3.5 px-[24px] border-t border-solid border-border flex justify-end shrink-0">
          <button className="btn-primary" onClick={onClose}>Concluir</button>
        </div>
      </div>
    </div>
  )
}

// ── Card resumo do pavimento ──────────────────────────────────────────
function PavCard({ pav, onOpen }) {
  const { ocupacoes, temCNAE, cnaesDiv, grupos } = useNorma()
  const divisoes = ocupacoes[pav.grupo]?.divisoes || {}
  const divLabel = divisoes[pav.divisao] || pav.divisao || '—'
  // Divisoes sem nenhum CNAE cadastrado (ex: J-1..J-4) nunca terao pav.cnae
  // preenchido — contam como classificadas so com a divisao definida.
  const configured = !!(pav.divisao && (pav.cnae || !temCNAE(pav.divisao)))
  const grupoLabel = grupos?.[pav.divisao?.charAt(0) || pav.grupo] || ''
  const cnaeDesc = pav.cnae ? (pav.cnaeDesc || cnaesDiv(pav.divisao)[pav.cnae]?.descricao || '') : ''

  return (
    <div
      onClick={onOpen}
      className={`bg-surface-2 rounded-lg mb-2 cursor-pointer transition-colors duration-150 border border-solid hover:border-white/25 ${configured ? 'border-border' : 'border-dashed border-border-2'}`}
    >
      <div className="flex items-center justify-between gap-5 py-3.5 px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint uppercase tracking-[.06em] leading-none mb-1.5">
            <Icon name="stair" size={13}/>{pav.label}
          </div>

          {configured ? (
            <>
              {/* CNAE: o que o pavimento faz (principal) */}
              {pav.cnae ? (
                <div className="text-[14px] font-semibold text-ink leading-[1.4]">
                  {cnaeDesc || 'Atividade sem descrição'}
                </div>
              ) : (
                <div className="text-[14px] font-semibold text-ink leading-[1.4]">{divLabel}</div>
              )}
              <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-ink-faint mt-1.5">
                {pav.cnae && <span>CNAE <span className="font-mono text-ink-muted">{pav.cnae}</span></span>}
                {pav.cnae && pav.area && <span aria-hidden="true">·</span>}
                {pav.area && <span>{pav.area} m²</span>}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-ink-faint">Clique para classificar</div>
          )}

          {/* Ocupacoes subsidiarias */}
          {pav.acess.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-solid border-border-2 flex flex-col gap-2">
              <div className="text-[10px] font-medium text-ink-faint uppercase tracking-[.08em]">
                {pav.acess.length === 1 ? 'Ocupação subsidiária' : 'Ocupações subsidiárias'}
              </div>
              {pav.acess.map((a, i) => {
                const aDivLabel = (ocupacoes[a.divisao?.charAt(0)]?.divisoes || {})[a.divisao]
                const aCnaeDesc = a.cnae ? (a.cnaeDesc || cnaesDiv(a.divisao)[a.cnae]?.descricao || '') : ''
                return (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-[13px] text-ink-muted leading-[1.4]">
                      {aCnaeDesc || aDivLabel || a.divisao}
                      <div className="text-[11px] text-ink-faint mt-0.5">
                        {a.cnae && <>CNAE <span className="font-mono">{a.cnae}</span></>}
                        {a.cnae && a.area && ' · '}
                        {a.area && `${a.area} m²`}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-ink-muted py-0.5 px-2 rounded bg-white/[.05] border border-solid border-border shrink-0">{a.divisao}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Grupo e, ao lado, a divisao (resultado, em destaque) */}
        <div className="flex items-center gap-3 shrink-0">
          {configured && pav.divisao && (
            <div className="flex items-center gap-3">
              {grupoLabel && (
                <span className="text-[12px] text-ink-faint text-right leading-[1.35] max-w-[170px]">Grupo {pav.divisao?.charAt(0) || pav.grupo} — {grupoLabel}</span>
              )}
              <span className="font-mono text-[16px] font-bold text-ink py-1 px-3 rounded-md bg-red-dim border border-solid border-red-border">{pav.divisao}</span>
            </div>
          )}
          <span className="text-ink-faint"><Icon name="chevD" size={14} className="-rotate-90"/></span>
        </div>
      </div>
    </div>
  )
}

// ── Step 4 principal ──────────────────────────────────────────────────
export default function Step4({ step, totalSteps }) {
  const { state }    = useProjeto()
  const [openId, setOpenId] = useState(null)

  const openPav = state.pavimentos.find(p => p.id === openId)

  return (
    <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">
      <div className="mb-[26px]">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">Etapa {step} de {totalSteps}</div>
        <h2 className="text-[22px] font-semibold text-ink mb-[5px]">Classificacao por pavimento</h2>
        <p className="text-[13px] text-ink-faint leading-[1.6]">Clique em um pavimento para classificar sua ocupacao principal e ocupacoes subsidiarias.</p>
      </div>

      {state.pavimentos.length === 0
        ? <div className="ibox amber"><Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/><span>Defina o numero de pavimentos na Etapa 2.</span></div>
        : state.estruturas.map(est => {
            const pavsEst = state.pavimentos.filter(p => p.estruturaId === est.id)
            if (!pavsEst.length) return null
            return (
              <EstruturaSection key={est.id} titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est} apenasOcupacao/>}>
                <div>
                  <div className={blockTitle}>Pavimentos</div>
                  {pavsEst.map(pav => (
                    <PavCard key={pav.id} pav={pav} onOpen={() => setOpenId(pav.id)}/>
                  ))}
                </div>
              </EstruturaSection>
            )
          })
      }

      {openPav && <PavModal pav={openPav} onClose={() => setOpenId(null)}/>}
    </div>
  )
}
