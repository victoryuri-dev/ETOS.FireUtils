import { useState, useRef, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { classificarPavimentos } from '../../utils/classificacao'
import Icon from '../ui/Icon'

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
    const masked = maskCNAE(e.target.value)
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
  const naoEncontrado = query.length >= 3 && results.length === 0

  return (
    <div ref={ref} className="relative">
      <div className="fg">
        <label className="text-[11px]">
          CNAE <span className="req">*</span>
          <span className="fhint"> — clique para ver todos ou digite para filtrar</span>
        </label>
        <div className="relative">
          <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/>
          <input value={query} onChange={handleInput} onFocus={handleFocus}
            placeholder="Clique para ver todos os CNAEs desta divisao..."
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
        <div className="mt-1.5 text-[11px] text-ink-muted py-1.5 px-2.5 bg-surface-2 rounded-md border border-solid border-border">
          <span className="font-mono text-red mr-2">{value}</span>
          {selectedData.descricao}
        </div>
      )}
      {naoEncontrado && (
        <div className="fg mt-2">
          <label className="text-[11px]">CNAE nao encontrado — descreva a atividade</label>
          <input value={descValue || ''} onChange={e => onDescChange(e.target.value)} placeholder="Descreva a atividade para referencia no memorial"/>
        </div>
      )}
    </div>
  )
}

// ── Cabeçalho de seção com descrição normativa ────────────────────────
function SectionHead({ titulo, descricao, aviso }) {
  return (
    <div className="mb-3.5">
      <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-[.08em] mb-1">{titulo}</div>
      {descricao && <p className="text-[11px] text-ink-faint leading-[1.55] mt-0 mb-1 max-w-[600px]">{descricao}</p>}
      {aviso && <p className="text-[11px] text-amber leading-[1.55] m-0 max-w-[600px]">{aviso}</p>}
    </div>
  )
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
    <div className="border border-solid border-border rounded-md p-3.5 bg-bg">
      <div className="grid grid-cols-[1fr_2fr_120px] gap-2.5 mb-3">
        <div className="fg">
          <label className="text-[11px]">Grupo</label>
          <select value={grupoAtual} onChange={e => setGrupo(e.target.value)}>
            {gruposKeys.map(g => (
              <option key={g} value={g}>{g} — {grupos[g] || g}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label className="text-[11px]">Divisao</label>
          <select value={acess.divisao} onChange={e => setDivisao(e.target.value)}>
            {Object.entries(divisoesGrp).map(([code, label]) => {
              const jaUsada = usadas.has(code) && code !== acess.divisao
              return <option key={code} value={code} disabled={jaUsada}>{code} — {label}{jaUsada?' (ja utilizada)':''}</option>
            })}
          </select>
        </div>
        <div className="fg">
          <label className="text-[11px]">Area (m2)</label>
          <input type="number" value={acess.area} onChange={e => setArea(e.target.value)} placeholder="m2"/>
        </div>
      </div>
      <CnaeBusca divisao={acess.divisao} value={acess.cnae || ''} descValue={acess.cnaeDesc || ''}
        onSelect={setCNAE} onDescChange={setCnaeDesc} onAutoFill={handleAutoFill}/>
      <div className="flex justify-end mt-2.5">
        <button className="btn-del" onClick={() => dispatch({ type:'REMOVE_ACESS', id:pav.id, index })}>
          <Icon name="trash" size={12}/> Remover
        </button>
      </div>
    </div>
  )
}

// ── Modal de classificação do pavimento ───────────────────────────────
function PavModal({ pav, onClose }) {
  const { dispatch } = useProjeto()
  const { ocupacoes, grupos } = useNorma()

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
        className="bg-surface border border-solid border-border rounded-lg w-[700px] max-w-[96vw] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.55)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between py-[18px] px-[22px] border-b border-solid border-border shrink-0">
          <div>
            <div className="text-base font-bold text-ink mb-[3px]">{pav.label}</div>
            <div className="text-[11px] text-ink-faint">Classificacao de ocupacao</div>
          </div>
          <div className="flex gap-2 items-center">
            {pav.tipo === 'terreo' && (
              <button className="btn-ghost text-[11px] border-red-border text-red"
                onClick={() => dispatch({ type:'REPLICATE_TERREO', estruturaId: pav.estruturaId })}>
                <Icon name="check" size={11}/> Repetir para todos
              </button>
            )}
            <button className="btn-ghost p-1.5" onClick={onClose}>
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-5 px-[22px]">

          {/* Ocupação principal */}
          <SectionHead
            titulo="Ocupacao principal ou predominante"
            descricao="Atividade ou uso principal exercido na edificacao ou area de risco."
          />

          <div className="grid grid-cols-[1fr_2fr_120px] gap-2.5 mb-3.5">
            <div className="fg">
              <label>Grupo</label>
              <select value={pav.grupo} onChange={e => setGrupo(e.target.value)}>
                {gruposKeys.map(g => (
                  <option key={g} value={g}>{g} — {grupos[g] || g}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Divisao</label>
              <select value={pav.divisao} onChange={e => setDivisao(e.target.value)}>
                {Object.entries(divisoes).map(([code, label]) => {
                  const jaUsada = pav.acess.some(a => a.divisao === code)
                  return <option key={code} value={code} disabled={jaUsada}>{code} — {label}{jaUsada?' (ja utilizada)':''}</option>
                })}
              </select>
            </div>
            <div className="fg">
              <label>Area (m2)</label>
              <input type="number" value={pav.area} onChange={e => setArea(e.target.value)} placeholder="m2"/>
            </div>
          </div>

          <div className="mb-[22px]">
            <CnaeBusca divisao={pav.divisao} value={pav.cnae} descValue={pav.cnaeDesc}
              onSelect={setCNAE} onDescChange={setCnaeDesc} onAutoFill={handleAutoFill}/>
          </div>

          {/* Ocupações subsidiárias */}
          <SectionHead
            titulo="Ocupacao subsidiaria"
            descricao="Atividade ou uso de apoio ou suporte, vinculada a atividade ou uso principal da ocupacao predominante em edificacao ou area de risco."
            aviso="Quando a ocupacao subsidiaria ultrapassa 10% da area construida da estrutura, ela passa a ser tratada como ocupacao mista ou secundaria."
          />

          <div className="flex flex-col gap-2.5">
            {pav.acess.map((a, i) => (
              <AcessRow key={i} pav={pav} acess={a} index={i} usadas={usadas}/>
            ))}
          </div>
          <button className="btn-add mt-2.5"
            onClick={() => dispatch({ type:'ADD_ACESS', id:pav.id })}>
            <Icon name="plus" size={11}/> Adicionar ocupacao subsidiaria
          </button>
        </div>

        {/* Footer */}
        <div className="py-3.5 px-[22px] border-t border-solid border-border flex justify-end shrink-0">
          <button className="btn-primary" onClick={onClose}>Concluir</button>
        </div>
      </div>
    </div>
  )
}

// ── Card resumo do pavimento ──────────────────────────────────────────
function PavCard({ pav, onOpen }) {
  const { ocupacoes } = useNorma()
  const divisoes = ocupacoes[pav.grupo]?.divisoes || {}
  const divLabel = divisoes[pav.divisao] || pav.divisao || '—'
  const configured = !!(pav.divisao && pav.cnae)

  return (
    <div
      onClick={onOpen}
      className={`bg-surface-2 rounded-lg mb-2 cursor-pointer transition-colors duration-150 border border-solid hover:border-red-border ${configured ? 'border-[rgba(192,21,42,.25)]' : 'border-border'}`}
    >
      <div className="flex items-center justify-between py-3 px-4">
        {/* Left: ícone + nome + resumo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-md border border-solid flex items-center justify-center text-xs font-bold shrink-0 ${configured ? 'bg-red-dim border-red-border text-red' : 'bg-surface border-border text-ink-faint'}`}>
            {pav.grupo || '?'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink mb-[3px]">{pav.label}</div>
            {configured ? (
              <div className="flex flex-wrap gap-x-3 gap-y-[3px]">
                {/* Principal */}
                <span className="text-[11px] text-ink-faint">
                  <span className="font-mono text-red font-semibold mr-1">{pav.divisao}</span>
                  {divLabel}
                </span>
                {pav.cnae && (
                  <span className="text-[11px] text-ink-faint">
                    CNAE <span className="font-mono text-ink-muted">{pav.cnae}</span>
                  </span>
                )}
                {pav.area && (
                  <span className="text-[11px] text-ink-faint">
                    {pav.area} m²
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-ink-faint">Clique para classificar</div>
            )}
            {/* Subsidiárias */}
            {pav.acess.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-[3px] mt-1">
                {pav.acess.map((a, i) => {
                  const aLabel = (ocupacoes[a.divisao?.charAt(0)]?.divisoes || {})[a.divisao] || a.divisao
                  return (
                    <span key={i} className="text-[10px] text-ink-faint">
                      <span className="font-mono text-ink-muted font-semibold">{a.divisao}</span>
                      {aLabel && aLabel !== a.divisao && <span className="ml-[3px]">{aLabel}</span>}
                      {a.area && <span className="text-ink-hint ml-1">{a.area} m²</span>}
                      {a.cnae && <span className="font-mono text-ink-hint ml-1">{a.cnae}</span>}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: badges + seta */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {pav.acess.length > 0 && (
            <span className="text-[10px] py-0.5 px-[7px] rounded-[20px] bg-surface border border-solid border-border text-ink-faint">
              +{pav.acess.length} sub.
            </span>
          )}
          <div className="text-ink-faint">
            <Icon name="chevD" size={14} className="-rotate-90"/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Box de classificacao geral derivada de uma estrutura ────────────────
function ClassificacaoBox({ areaEstrutura, pavimentos }) {
  const { principaisDivs, subsidiarias, edificacaoMista, mistaDivs, temOcupacoes, subsidiariasRaw } =
    classificarPavimentos(pavimentos, areaEstrutura)

  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg py-4 px-[18px] flex flex-col gap-3">
      {!temOcupacoes
        ? <span className="text-ink-hint text-[13px]">Nenhuma ocupacao configurada</span>
        : <>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className={`text-[10px] font-semibold uppercase tracking-[.07em] min-w-[140px] shrink-0 ${edificacaoMista ? 'text-amber' : 'text-red'}`}>
                {edificacaoMista ? 'Ocupacao mista' : 'Ocupacao principal'}:
              </span>
              <div className="flex gap-1.5 flex-wrap items-center">
                {(edificacaoMista ? mistaDivs : principaisDivs).map((div, i) => (
                  <span key={div} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-ink-faint text-xs">/</span>}
                    <span className={`py-[3px] px-2.5 rounded font-bold text-[13px] font-mono border border-solid ${edificacaoMista ? 'bg-amber-dim border-amber-border text-amber' : 'bg-red-dim border-red-border text-red'}`}>{div}</span>
                  </span>
                ))}
              </div>
            </div>

            {subsidiarias.length > 0 && (
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-[.07em] text-ink-faint min-w-[140px] shrink-0">
                  {subsidiarias.length === 1 ? 'Ocupacao subsidiaria' : 'Ocupacoes subsidiarias'}:
                </span>
                <div className="flex gap-[5px] flex-wrap">
                  {subsidiarias.map(div => (
                    <span key={div} className="py-[3px] px-2.5 rounded font-semibold text-xs font-mono bg-surface border border-solid border-border text-ink-muted">{div}</span>
                  ))}
                </div>
              </div>
            )}

            {areaEstrutura === 0 && subsidiariasRaw.length > 0 && (
              <div className="text-[11px] text-amber pt-1 border-t border-solid border-border-2">
                Informe a area construida da estrutura na Etapa 2 para identificar automaticamente ocupacoes mistas (acima de 10%).
              </div>
            )}
          </>
      }
    </div>
  )
}

// ── Step 4 principal ──────────────────────────────────────────────────
export default function Step4() {
  const { state }    = useProjeto()
  const [openId, setOpenId] = useState(null)

  const openPav = state.pavimentos.find(p => p.id === openId)

  return (
    <div className="max-w-[720px] mx-auto px-12 pt-[34px] pb-24">
      <div className="mb-[26px]">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">Etapa 4 de 7</div>
        <h2 className="text-[22px] font-semibold text-ink mb-[5px]">Classificacao por pavimento</h2>
        <p className="text-[13px] text-ink-faint leading-[1.6]">Clique em um pavimento para classificar sua ocupacao principal e ocupacoes subsidiarias.</p>
      </div>

      {state.pavimentos.length === 0
        ? <div className="ibox amber"><Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/><span>Defina o numero de pavimentos na Etapa 2.</span></div>
        : state.estruturas.map(est => {
            const pavsEst = state.pavimentos.filter(p => p.estruturaId === est.id)
            if (!pavsEst.length) return null
            const areaEstrutura = parseFloat(est.areaTotal) || 0
            return (
              <div key={est.id} className="mb-[26px]">
                {state.estruturas.length > 1 && (
                  <div className="text-sm font-semibold text-ink mb-3">{est.nome}</div>
                )}

                <div className="mb-4">
                  <div className={blockTitle}>Classificacao geral derivada</div>
                  <ClassificacaoBox areaEstrutura={areaEstrutura} pavimentos={pavsEst}/>
                </div>

                <div>
                  <div className={blockTitle}>Pavimentos</div>
                  {pavsEst.map(pav => (
                    <PavCard key={pav.id} pav={pav} onOpen={() => setOpenId(pav.id)}/>
                  ))}
                </div>
              </div>
            )
          })
      }

      {openPav && <PavModal pav={openPav} onClose={() => setOpenId(null)}/>}
    </div>
  )
}
