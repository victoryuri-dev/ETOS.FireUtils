import { useState, useCallback, useRef, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { getSE } from '../../data/normas/index'
import Icon from '../../components/ui/Icon'
import {
  calcPopAmb, calcPopPav, capPavimento, pavMaisPopuloso,
  calcAD, calcER, calcPT,
  getDistanciaPavimento,
  taxaOpcoes, popTipoPadrao,
} from '../../data/se_calc'

// ── Helpers ───────────────────────────────────────────────────────────
let _seq = 0
const uid  = () => `se-${Date.now()}-${++_seq}`
const fmt  = n  => Number(n).toFixed(2).replace('.', ',')
const fmtM = n  => `${fmt(n)} m`

function syncPavimentos(projetoPavs, prev = []) {
  if (!projetoPavs?.length) return []
  const anteriores = new Map(prev.map(p => [p.id, p]))
  return projetoPavs.map(p => ({
    id: p.id, nome: p.label,
    tipo: p.tipo === 'terreo' ? 'descarga' : 'tipo',
    ambientes: anteriores.get(p.id)?.ambientes || [],
  }))
}

// ── Shared UI ─────────────────────────────────────────────────────────
const inputClass = 'bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 w-full outline-none box-border'
function Label({ children }) {
  return <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">{children}</div>
}
function DivBadge({ label }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded bg-red text-white text-[11px] font-bold">{label || '?'}</span>
  )
}
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} className={`flex items-center gap-2 bg-transparent border border-solid border-border rounded-md py-1.5 px-3 cursor-pointer text-xs ${checked ? 'text-ink font-medium' : 'text-ink-faint font-normal'}`}>
      <div className={`w-7 h-4 rounded-[8px] shrink-0 relative transition-colors duration-200 ${checked ? 'bg-red' : 'bg-border'}`}>
        <div className={`absolute top-0.5 ${checked ? 'left-3.5' : 'left-0.5'} w-3 h-3 rounded-full bg-white transition-[left] duration-200`}/>
      </div>
      {label}
    </button>
  )
}
function TH({ children, right, center }) {
  return <th className={`text-[10px] text-ink-faint uppercase tracking-[.07em] font-medium py-[9px] px-3.5 border-b border-solid border-border whitespace-nowrap bg-surface-2 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>{children}</th>
}
function TD({ children, red, bold, muted, right, center }) {
  const colorClass = red ? 'text-red' : muted ? 'text-ink-faint' : 'text-ink'
  return <td className={`py-2.5 px-3.5 text-[13px] ${colorClass} ${bold ? 'font-bold' : 'font-normal'} border-b border-solid border-border-2 align-middle ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>{children}</td>
}
function Chip({ val, green }) {
  return <span className={`inline-block py-[3px] px-2.5 rounded font-bold text-[13px] font-mono border border-solid ${green ? 'bg-green-dim border-green-border text-green' : 'bg-red-dim border-red-border text-red'}`}>{val}</span>
}
function DimTable({ children }) {
  return <div className="border border-solid border-border rounded-md overflow-hidden mb-1"><table className="w-full border-collapse">{children}</table></div>
}
function SectionTitle({ label, desc }) {
  return (
    <div className={desc ? 'mb-2' : 'mb-3'}>
      <h3 className="text-[13px] font-semibold text-ink mt-0 mx-0 mb-1">{label}</h3>
      {desc && <p className="text-[11px] text-ink-faint m-0 leading-[1.5]">{desc}</p>}
    </div>
  )
}
function LargAdotadaInput({ laMin, value, onChange }) {
  const [err, setErr] = useState(false)
  const display = value != null ? value : laMin
  return (
    <td className="py-1.5 px-3.5 border-b border-solid border-border-2 text-right align-middle">
      <div className="relative inline-flex items-center gap-1">
        <input type="number" step="0.05" min={laMin} value={display}
          onChange={e => { const v = parseFloat(e.target.value); if (isNaN(v)||v<laMin){setErr(true);onChange(laMin)}else{setErr(false);onChange(+v.toFixed(2))} }}
          onBlur={e => { const v = parseFloat(e.target.value); if (isNaN(v)||v<laMin){setErr(false);onChange(laMin)} }}
          className={`w-[90px] bg-surface border border-solid rounded-md text-green font-bold text-[13px] py-1 px-2 text-right outline-none font-mono ${err ? 'border-red' : 'border-border'}`}
        />
        <span className="text-[11px] text-ink-faint">m</span>
        {err && <div className="absolute top-[calc(100%+4px)] right-0 whitespace-nowrap text-[10px] bg-red text-white py-[3px] px-[7px] rounded z-10">Mín: {fmtM(laMin)}</div>}
      </div>
    </td>
  )
}

// ── DivisaoSelect — usa OCUPACOES do estado vigente ───────────────────
function DivisaoSelect({ value, onChange, ocupacoes }) {
  return (
    <select className={inputClass} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Selecionar divisão...</option>
      {Object.keys(ocupacoes).sort().map(grupo => (
        <optgroup key={grupo} label={`Grupo ${grupo} — ${ocupacoes[grupo]?.descricao || grupo}`}>
          {Object.keys(ocupacoes[grupo]?.divisoes || {}).map(div => (
            <option key={div} value={div}>{div} — {ocupacoes[grupo].divisoes[div]}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ── Formulário de ambiente ────────────────────────────────────────────
function AmbienteForm({ initial, onSave, onCancel, autoFocus, seNorma, ocupacoes }) {
  const { TAXA_POPULACIONAL, NOTAS_NORMATIVAS } = seNorma
  const blank = { nome:'', divisao:'', popTipo:'area', area:'', assentos:'', popManual:'' }
  const [form, setForm] = useState(() => initial ? {
    nome: initial.nome, divisao: initial.divisao, popTipo: initial.popTipo,
    area: initial.area ? String(initial.area) : '',
    assentos: initial.assentos ? String(initial.assentos) : '',
    popManual: initial.popManual ? String(initial.popManual) : '',
  } : blank)

  const taxa    = TAXA_POPULACIONAL[form.divisao]
  const opcoes  = taxaOpcoes(form.divisao, TAXA_POPULACIONAL)
  const isManual = form.popTipo === 'manual'
  const isFixo   = form.popTipo === 'fixo'
  const isArea   = form.popTipo === 'area'

  const popCalc = () => {
    if (isFixo)   return parseInt(form.assentos)  || 0
    if (isManual) return parseInt(form.popManual) || 0
    return taxa?.A && form.area ? Math.ceil(parseFloat(form.area) / taxa.A) : 0
  }

  const setDivisao = div => setForm(f => ({ ...f, divisao: div, popTipo: popTipoPadrao(div, TAXA_POPULACIONAL), area:'', assentos:'', popManual:'' }))
  const setTipo    = tipo => setForm(f => ({ ...f, popTipo: tipo, area:'', assentos:'', popManual:'' }))

  const canSave = () => {
    if (!form.nome || !form.divisao) return false
    if (isArea && !form.area) return false
    if (isFixo && !form.assentos) return false
    if (isManual && !form.popManual) return false
    return true
  }

  const handleSave = () => {
    if (!canSave()) return
    onSave({ nome: form.nome.trim(), divisao: form.divisao, popTipo: form.popTipo, area: parseFloat(form.area)||0, assentos: parseInt(form.assentos)||0, popManual: parseInt(form.popManual)||0 })
  }

  const inputLabel = isArea ? 'Área (m²)' : isFixo ? 'N° de assentos' : 'N° de pessoas'

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-[1fr_1.5fr] gap-2.5">
        <div>
          <Label>Nome do ambiente</Label>
          <input className={inputClass} placeholder="ex.: Sala 101, Loja..." autoFocus={autoFocus}
            value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} onKeyDown={e => e.key==='Enter' && handleSave()}/>
        </div>
        <div>
          <Label>Divisão de ocupação</Label>
          <DivisaoSelect value={form.divisao} onChange={setDivisao} ocupacoes={ocupacoes}/>
        </div>
      </div>

      {form.divisao && (
        <div className={`grid gap-2.5 items-end ${opcoes.length > 1 ? 'grid-cols-[1.4fr_1fr_100px]' : 'grid-cols-[1.8fr_1fr_100px]'}`}>
          <div>
            <Label>Taxa normativa — {form.divisao}</Label>
            {opcoes.length > 1 ? (
              <select className={inputClass} value={form.popTipo} onChange={e => setTipo(e.target.value)}>
                {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <div className={`${inputClass} bg-surface text-ink-faint flex items-center`}>
                {opcoes[0]?.label || '—'}
              </div>
            )}
          </div>
          <div>
            <Label>{inputLabel}</Label>
            {isArea   && <input className={inputClass} type="number" min="0" placeholder="ex.: 64,5" value={form.area}     onChange={e => setForm(f=>({...f,area:e.target.value}))}     onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
            {isFixo   && <input className={inputClass} type="number" min="0" placeholder="ex.: 120"  value={form.assentos} onChange={e => setForm(f=>({...f,assentos:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
            {isManual && <input className={inputClass} type="number" min="0" placeholder="ex.: 8"    value={form.popManual} onChange={e => setForm(f=>({...f,popManual:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
          </div>
          <div>
            <Label>Pop. calculada</Label>
            <div className={`${inputClass} bg-surface flex items-center justify-center font-bold text-[15px] ${popCalc()>0 ? 'text-red' : 'text-ink-faint'}`}>
              {popCalc() || '—'}
            </div>
          </div>
        </div>
      )}

      {taxa?.notas?.length > 0 && taxa.A === null && (
        <div className="ibox amber mb-0">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-[11px]">{taxa.obs}</span>
        </div>
      )}

      <div className="flex gap-1.5 justify-end">
        <button className="btn-ghost" onClick={onCancel}><Icon name="x" size={12}/> Cancelar</button>
        <button className={`btn-primary ${canSave() ? 'opacity-100 pointer-events-auto' : 'opacity-45 pointer-events-none'}`} onClick={handleSave}>
          <Icon name="check" size={12}/> {initial ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}

// ── PavimentoModal ────────────────────────────────────────────────────
const MODAL_COL = 'grid-cols-[1.4fr_56px_1.6fr_80px_54px_48px]'

function PavimentoModal({ pav, onClose, onSave, seNorma, ocupacoes }) {
  const { TAXA_POPULACIONAL, NOTAS_NORMATIVAS } = seNorma
  const [ambientes, setAmbientes] = useState(() => pav.ambientes.map(a => ({...a})))
  const [showAdd,   setShowAdd]   = useState(false)
  const [editId,    setEditId]    = useState(null)

  const totalPop  = ambientes.reduce((s,a) => s + calcPopAmb(a, TAXA_POPULACIONAL), 0)
  const totalArea = ambientes.reduce((s,a) => s + (a.popTipo==='area' ? (a.area||0) : 0), 0)
  const divisoes  = [...new Set(ambientes.map(a => a.divisao).filter(Boolean))]
  const notasAtivas = [...new Set(ambientes.flatMap(a => TAXA_POPULACIONAL[a.divisao]?.notas || []))]

  const addAmb  = d => { setAmbientes(p => [...p, {id:uid(),...d}]); setShowAdd(false) }
  const saveAmb = (id,d) => { setAmbientes(p => p.map(a => a.id===id ? {...a,...d} : a)); setEditId(null) }
  const delAmb  = id => { setAmbientes(p => p.filter(a => a.id!==id)); if (editId===id) setEditId(null) }

  return (
    <div className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-surface border border-solid border-border rounded-lg w-[900px] max-w-[96vw] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.55)]">

        {/* Header */}
        <div className="flex items-start justify-between py-[18px] px-[22px] border-b border-solid border-border shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base font-bold text-ink">{pav.nome}</span>
              {pav.tipo === 'descarga'
                ? <span className="text-[10px] py-[3px] px-2 rounded bg-amber-dim border border-solid border-amber-border text-amber font-semibold">PISO DE DESCARGA</span>
                : <span className="text-[10px] py-[3px] px-2 rounded bg-surface-2 border border-solid border-border text-ink-faint font-medium">PAVIMENTO TIPO</span>}
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-[5px] text-[11px] text-ink-faint">
              <span>{ambientes.length} ambiente{ambientes.length!==1?'s':''}</span>
              <span className="opacity-25">·</span>
              <span>Pop. total: <strong className="text-red font-bold">{totalPop} pessoas</strong></span>
              {divisoes.length > 0 && <><span className="opacity-25">·</span><span className="flex items-center gap-1">Divisões: {divisoes.map(d=><DivBadge key={d} label={d}/>)}</span></>}
            </div>
          </div>
          <button className="btn-ghost p-1.5 ml-3" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Col headers */}
        <div className={`grid ${MODAL_COL} gap-2 py-2 px-[22px] bg-surface-2 border-b border-solid border-border shrink-0 text-[10px] text-ink-faint uppercase tracking-[.06em]`}>
          <span>Nome</span><span>Div.</span><span>Taxa / Entrada</span><span>Valor</span><span className="text-right">Pop.</span><span/>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          {ambientes.length === 0 && !showAdd && (
            <div className="p-10 text-center text-ink-faint text-[13px]">
              Nenhum ambiente adicionado. Clique em "Adicionar ambiente".
            </div>
          )}
          {ambientes.map(a => {
            const pop = calcPopAmb(a, TAXA_POPULACIONAL)
            const opcoes = taxaOpcoes(a.divisao, TAXA_POPULACIONAL)
            const taxaLabel = opcoes.find(o => o.value===a.popTipo)?.label || TAXA_POPULACIONAL[a.divisao]?.obs || '—'
            if (editId === a.id) {
              return (
                <div key={a.id} className="py-3.5 px-[22px] bg-[rgba(192,21,42,.04)] border-b border-solid border-red-border">
                  <div className="text-[10px] text-red font-semibold uppercase tracking-[.07em] mb-2.5">Editando: {a.nome}</div>
                  <AmbienteForm initial={a} autoFocus onSave={d => saveAmb(a.id,d)} onCancel={() => setEditId(null)} seNorma={seNorma} ocupacoes={ocupacoes}/>
                </div>
              )
            }
            return (
              <div key={a.id}
                onClick={() => { setShowAdd(false); setEditId(a.id) }}
                className={`grid ${MODAL_COL} gap-2 items-center py-[11px] px-[22px] border-b border-solid border-border-2 cursor-pointer transition-colors duration-100 hover:bg-white/[.025]`}
              >
                <span className="text-[13px] font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">{a.nome}</span>
                <DivBadge label={a.divisao||'?'}/>
                <div>
                  <div className="text-[11px] text-ink-faint leading-[1.3]">{taxaLabel}</div>
                  {a.popTipo==='manual' && <div className="text-[10px] text-amber mt-px">Manual</div>}
                </div>
                <span className="text-xs text-ink-muted">
                  {a.popTipo==='area' ? `${a.area} m²` : a.popTipo==='fixo' ? `${a.assentos} assentos` : `${a.popManual} pess.`}
                </span>
                <span className="text-sm font-bold text-red text-right">{pop}</span>
                <div className="flex justify-end">
                  <button onClick={e => { e.stopPropagation(); delAmb(a.id) }}
                    className="bg-transparent border border-solid border-transparent rounded-md text-ink-faint cursor-pointer py-1 px-[5px] flex hover:border-red-border hover:text-red"
                  ><Icon name="trash" size={12}/></button>
                </div>
              </div>
            )
          })}
          {showAdd && (
            <div className="py-4 px-[22px] bg-[rgba(192,21,42,.05)] border-t border-solid border-red-border">
              <div className="text-[10px] text-red font-semibold uppercase tracking-[.07em] mb-3">Novo ambiente</div>
              <AmbienteForm autoFocus onSave={addAmb} onCancel={() => setShowAdd(false)} seNorma={seNorma} ocupacoes={ocupacoes}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0">
          {notasAtivas.length > 0 && (
            <div className="py-2 px-[22px] bg-surface-2 border-t border-solid border-border">
              {notasAtivas.map(k => NOTAS_NORMATIVAS[k] && <div key={k} className="text-[10px] text-ink-faint leading-[1.5]">{NOTAS_NORMATIVAS[k]}</div>)}
            </div>
          )}
          <div className="flex items-center justify-between py-3.5 px-[22px] border-t border-solid border-border">
            <div className="flex gap-6">
              {[{ label:'Ambientes', val:String(ambientes.length), red:false },{ label:'Área (m²)', val:totalArea.toLocaleString('pt-BR'), red:false },{ label:'Pop. total', val:`${totalPop} pess.`, red:true }].map(s => (
                <div key={s.label}>
                  <div className="text-[9px] text-ink-faint uppercase tracking-[.07em] mb-0.5">{s.label}</div>
                  <div className={`text-lg font-bold ${s.red ? 'text-red' : 'text-ink'}`}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              {!showAdd && !editId && <button className="btn-ghost" onClick={() => { setEditId(null); setShowAdd(true) }}><Icon name="plus" size={12}/> Adicionar ambiente</button>}
              <button className="btn-primary" onClick={() => { onSave({...pav, ambientes}); onClose() }}>Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Importação do firedata.json (plugin Revit) ────────────────────────
function importarFiredata(json) {
  const se = json?.saidas_emergencia ?? json?.se_import
  if (!se?.pavimentos) throw new Error('Chave "saidas_emergencia" não encontrada no arquivo.')
  const pavimentos = se.pavimentos.map((p, pi) => ({
    id:        p.id   || `P${pi + 1}`,
    nome:      p.nome || `Pavimento ${pi + 1}`,
    tipo:      p.tipo || 'normal',
    ambientes: (p.ambientes || []).map((a, ai) => ({
      id:        uid(),
      nome:      a.nome      || `Ambiente ${ai + 1}`,
      divisao:   a.divisao   || '',
      area:      a.area      ?? 0,
      popTipo:   a.popTipo   || 'area',
      assentos:  a.assentos  ?? 0,
      popManual: a.popManual ?? 0,
    })),
  }))
  return {
    pavimentos,
    temChuveiros: se.temChuveiros === true || se.temChuveiros === 'true' || se.temChuveiros === 'True',
    temDeteccao:  se.temDeteccao  === true || se.temDeteccao  === 'true' || se.temDeteccao  === 'True',
    timestamp:    se._timestamp   || null,
  }
}

// ── Page principal ────────────────────────────────────────────────────
const MAIN_COL = 'grid-cols-[1fr_80px_130px_1fr]'

export default function SaidaEmergenciaPage() {
  const { state }       = useProjeto()
  const { uf, info, ocupacoes } = useNorma()
  const seNorma         = getSE(uf)
  const { TAXA_POPULACIONAL, NOTAS_NORMATIVAS: _, LARGURAS_MINIMAS, BLOCOS_DISTANCIA } = seNorma

  const [pavimentos,   setPavimentos]   = useState(() => syncPavimentos(state.pavimentos))
  const [openId,       setOpenId]       = useState(null)
  const [temChuveiros, setTemChuveiros] = useState(false)
  const [temDeteccao,  setTemDeteccao]  = useState(false)
  const [largAdotada,  setLargAdotada]  = useState({})
  const [importInfo,   setImportInfo]   = useState(null)
  const [importErro,   setImportErro]   = useState(null)
  const [saidaUnica,   setSaidaUnica]   = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    setPavimentos(prev => syncPavimentos(state.pavimentos, prev))
  }, [state.pavimentos])

  const getSaidaUnica = (pavId, adN) => saidaUnica[pavId] ?? (adN <= 1)
  const toggleSaidaUnica = (pavId, val) => setSaidaUnica(prev => ({ ...prev, [pavId]: val }))

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json   = JSON.parse(ev.target.result)
        const result = importarFiredata(json)
        setPavimentos(result.pavimentos)
        setTemChuveiros(result.temChuveiros)
        setTemDeteccao(result.temDeteccao)
        setLargAdotada({})
        setImportErro(null)
        setImportInfo(result.timestamp)
      } catch (err) {
        setImportErro(err.message || 'Arquivo inválido.')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  const setLarg = useCallback((pavId, tipo, val) => {
    setLargAdotada(prev => ({ ...prev, [pavId]: { ...prev[pavId], [tipo]: val } }))
  }, [])

  const openPav = pavimentos.find(p => p.id === openId)
  const govPav  = pavMaisPopuloso(pavimentos, TAXA_POPULACIONAL)

  const savePav = updated => {
    setPavimentos(prev => prev.map(p => p.id===updated.id ? updated : p))
    setLargAdotada(prev => {
      const cap = capPavimento(updated, TAXA_POPULACIONAL)
      const pop = calcPopPav(updated, TAXA_POPULACIONAL)
      const ad = calcAD(pop, cap.AD, LARGURAS_MINIMAS)
      const pt = calcPT(pop, cap.PT, LARGURAS_MINIMAS)
      const er = calcER(pop, cap.ER, LARGURAS_MINIMAS)
      const cur = prev[updated.id] || {}
      return { ...prev, [updated.id]: { AD: cur.AD>=ad.la ? cur.AD : undefined, ER: cur.ER>=er.la ? cur.ER : undefined, PT: cur.PT>=pt.la ? cur.PT : undefined } }
    })
  }

  const dadosPav = pavimentos.map(p => {
    const pop      = calcPopPav(p, TAXA_POPULACIONAL)
    const cap      = capPavimento(p, TAXA_POPULACIONAL)
    const ad       = calcAD(pop, cap.AD, LARGURAS_MINIMAS)
    const pt       = calcPT(pop, cap.PT, LARGURAS_MINIMAS)
    const unica    = getSaidaUnica(p.id, ad.n)
    const nSaidas  = unica ? 1 : 2
    const dist     = getDistanciaPavimento(p, nSaidas, temChuveiros, temDeteccao, BLOCOS_DISTANCIA)
    return { pav:p, pop, cap, ad, pt, dist, unica, laAD: largAdotada[p.id]?.AD ?? ad.la, laPT: largAdotada[p.id]?.PT ?? pt.la }
  })

  const erDados = govPav ? (() => {
    const pop = calcPopPav(govPav, TAXA_POPULACIONAL)
    const cap = capPavimento(govPav, TAXA_POPULACIONAL)
    const er  = calcER(pop, cap.ER, LARGURAS_MINIMAS)
    return { pop, capER:cap.ER, ...er, laER: largAdotada[govPav.id]?.ER ?? er.la }
  })() : null

  const temPavimentos = pavimentos.length > 0

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Saídas de Emergência</div>
              <h2 className="text-[22px] font-bold text-ink mb-1.5">Dimensionamento</h2>
              <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
                Configure os ambientes de cada pavimento do projeto. Resultados calculados automaticamente conforme {info?.nome || 'NT vigente'} / NBR 9077.
              </p>
            </div>
            <div className="shrink-0">
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
              <button className="btn-ghost flex items-center gap-1.5 whitespace-nowrap" onClick={() => fileInputRef.current?.click()}>
                <Icon name="upload" size={13}/>
                Importar do Revit
              </button>
              <div className="text-[10px] text-ink-faint mt-[5px] text-right">
                firedata.json
              </div>
            </div>
          </div>

          {importInfo && (
            <div className="ibox green mb-0">
              <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
              <span className="text-xs">Dados importados do Revit — última exportação: <strong>{importInfo}</strong>. Confira os nomes dos ambientes e ajuste se necessário.</span>
            </div>
          )}
          {importErro && (
            <div className="ibox red mb-0">
              <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
              <span className="text-xs">Erro ao importar: {importErro}</span>
            </div>
          )}
        </div>

        {/* Pavimentos */}
        <div className="bg-surface border border-solid border-border rounded-lg overflow-hidden mb-7">
          <div className="py-3.5 px-5 border-b border-solid border-border flex items-center justify-between">
            <div className="text-sm font-semibold text-ink flex items-center gap-2">
              Pavimentos
              {govPav && <span className="text-[11px] font-normal text-ink-faint">— Mais populoso: <span className="text-red font-semibold">{govPav.nome} ({calcPopPav(govPav, TAXA_POPULACIONAL)} pess.)</span></span>}
            </div>
          </div>

          {temPavimentos && (
            <div className={`grid ${MAIN_COL} gap-3.5 py-2 px-5 bg-surface-2 border-b border-solid border-border text-[10px] text-ink-faint uppercase tracking-[.06em]`}>
              <span>Pavimento</span><span className="text-center">Amb.</span><span className="text-center">Pop.</span><span>Divisões</span>
            </div>
          )}

          {pavimentos.map(p => {
            const pop  = calcPopPav(p, TAXA_POPULACIONAL)
            const divs = [...new Set(p.ambientes.map(a => a.divisao).filter(Boolean))]
            const isGov = govPav?.id === p.id
            return (
              <div key={p.id}
                onClick={() => setOpenId(p.id)}
                className={`grid ${MAIN_COL} gap-3.5 items-center py-[13px] px-5 border-b border-solid border-border-2 cursor-pointer transition-colors duration-100 hover:bg-white/[.025]`}
              >
                <div>
                  <div className="flex items-center gap-[7px]">
                    <span className="text-[13px] font-semibold text-ink">{p.nome}</span>
                    {p.tipo==='descarga'
                      ? <span className="text-[9px] py-0.5 px-1.5 rounded-[3px] bg-amber-dim border border-solid border-amber-border text-amber font-semibold">DESCARGA</span>
                      : <span className="text-[9px] py-0.5 px-1.5 rounded-[3px] bg-surface-2 border border-solid border-border text-ink-faint">TIPO</span>}
                  </div>
                  {isGov && <div className="text-[10px] text-red font-medium mt-0.5">Mais populoso · referência para ER</div>}
                </div>
                <div className={`text-center text-[15px] font-bold ${p.ambientes.length ? 'text-red' : 'text-ink-faint'}`}>{p.ambientes.length}</div>
                <div className={`text-center text-sm font-bold ${pop>0 ? 'text-red' : 'text-ink-faint'}`}>{pop>0 ? `${pop} pess.` : <span className="text-[11px] font-normal">—</span>}</div>
                <div className="flex gap-1 flex-wrap">{divs.map(d=><DivBadge key={d} label={d}/>)}{!divs.length && <span className="text-[11px] text-ink-faint">—</span>}</div>
              </div>
            )
          })}

          {!temPavimentos && (
            <div className="p-9 text-center text-ink-faint text-[13px]">
              Nenhum pavimento configurado. Cadastre os pavimentos da edificação na Etapa 2 (Edificação).
            </div>
          )}
        </div>

        {temPavimentos && !pavimentos.some(p => p.tipo==='descarga') && (
          <div className="ibox amber mb-6">
            <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
            <span className="text-xs">Nenhum piso de descarga definido. Marque o pavimento térreo na Etapa 2 (Edificação) para o cálculo correto das distâncias máximas.</span>
          </div>
        )}

        {/* Resultados */}
        {temPavimentos && (
          <div className="flex flex-col gap-7">

            <div>
              <SectionTitle label="Acessos e Descargas (AD)" desc={`Todos os pavimentos · ${fmt(LARGURAS_MINIMAS.LARG_UP)} m/UP · mínimo ${fmt(LARGURAS_MINIMAS.AD)} m`}/>
              <DimTable>
                <thead><tr><TH>Pavimento</TH><TH center>Pop.</TH><TH center>Cap./UP</TH><TH center>N° UPs</TH><TH right>L calculada</TH><TH right>L mínima</TH><TH right>L adotada</TH></tr></thead>
                <tbody>
                  {dadosPav.map(({ pav,pop,cap,ad,laAD }) => (
                    <tr key={pav.id}><TD bold>{pav.nome}</TD><TD center red>{pop}</TD><TD center muted>{cap.AD}</TD><TD center red bold>{ad.n} UP</TD><TD right muted>{fmtM(ad.lc)}</TD><TD right muted>{fmtM(ad.lMin)}</TD>
                      <LargAdotadaInput laMin={ad.la} value={laAD} onChange={v => setLarg(pav.id,'AD',v)}/>
                    </tr>
                  ))}
                </tbody>
              </DimTable>
            </div>

            <div>
              <SectionTitle label="Escadas e Rampas (ER)" desc={`Pavimento mais populoso (excl. piso de descarga) · mínimo ${fmt(LARGURAS_MINIMAS.ER)} m`}/>
              {erDados ? (
                <DimTable>
                  <thead><tr><TH>Pav. mais populoso</TH><TH center>Pop.</TH><TH center>Cap./UP</TH><TH center>N° UPs</TH><TH right>L calculada</TH><TH right>L mínima</TH><TH right>L adotada</TH></tr></thead>
                  <tbody>
                    <tr><TD bold>{govPav.nome}</TD><TD center red>{erDados.pop}</TD><TD center muted>{erDados.capER}</TD><TD center red bold>{erDados.n} UP</TD><TD right muted>{fmtM(erDados.lc)}</TD><TD right muted>{fmtM(erDados.lMin)}</TD>
                      <LargAdotadaInput laMin={erDados.la} value={erDados.laER} onChange={v => setLarg(govPav.id,'ER',v)}/>
                    </tr>
                  </tbody>
                </DimTable>
              ) : (
                <div className="ibox amber"><Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/><span className="text-xs">Nenhum pavimento tipo configurado. O piso de descarga não é referência para ER.</span></div>
              )}
            </div>

            <div>
              <SectionTitle label="Portas (PT)" desc="Todos os pavimentos · 1 UP→0,80 m · 2 UPs→1,00 m · 3 UPs→1,50 m · 4 UPs→2,00 m"/>
              <DimTable>
                <thead><tr><TH>Pavimento</TH><TH center>Pop.</TH><TH center>Cap./UP</TH><TH center>N° UPs</TH><TH right>L calculada</TH><TH right>L mínima</TH><TH center>Tipo</TH><TH right>L adotada</TH></tr></thead>
                <tbody>
                  {dadosPav.map(({ pav,pop,cap,pt,laPT }) => (
                    <tr key={pav.id}><TD bold>{pav.nome}</TD><TD center red>{pop}</TD><TD center muted>{cap.PT}</TD><TD center red bold>{pt.n} UP</TD><TD right muted>{fmtM(pt.lc)}</TD><TD right muted>{fmtM(pt.lMin)}</TD><TD center muted>{pt.tipo}</TD>
                      <LargAdotadaInput laMin={pt.la} value={laPT} onChange={v => setLarg(pav.id,'PT',v)}/>
                    </tr>
                  ))}
                </tbody>
              </DimTable>
            </div>

            <div>
              <div className="flex items-start justify-between mb-3">
                <SectionTitle label="Distâncias Máximas a Percorrer" desc="Distância máxima do ponto mais remoto até a saída de emergência (NBR 9077)"/>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Toggle checked={temChuveiros} onChange={setTemChuveiros} label="Chuveiros automáticos"/>
                  <Toggle checked={temDeteccao}  onChange={setTemDeteccao}  label="Detecção de incêndio"/>
                </div>
              </div>
              <DimTable>
                <thead><tr><TH>Pavimento</TH><TH>Tipo</TH><TH center>Saídas</TH><TH>Proteção</TH><TH right>Dist. máxima</TH></tr></thead>
                <tbody>
                  {dadosPav.map(({ pav, ad, dist, unica }) => {
                    const prot = [temChuveiros&&'Chuveiros', temDeteccao&&'Detecção'].filter(Boolean)
                    const minSaidas = ad.n
                    return (
                      <tr key={pav.id}>
                        <TD bold>{pav.nome}</TD>
                        <TD muted>{pav.tipo==='descarga' ? 'Piso de descarga' : 'Demais andares'}</TD>
                        <td className="py-2 px-3.5 border-b border-solid border-border-2 align-middle">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleSaidaUnica(pav.id, true)}
                              className={`text-[11px] py-1 px-2.5 rounded-md border border-solid cursor-pointer transition-all duration-150 ${unica ? 'border-red-border bg-red-dim text-red font-semibold' : 'border-border bg-transparent text-ink-faint font-normal'}`}
                            >Saída única</button>
                            <button
                              onClick={() => toggleSaidaUnica(pav.id, false)}
                              className={`text-[11px] py-1 px-2.5 rounded-md border border-solid cursor-pointer transition-all duration-150 ${!unica ? 'border-green-border bg-green-dim text-green font-semibold' : 'border-border bg-transparent text-ink-faint font-normal'}`}
                            >Mais de uma saída</button>
                            {unica && minSaidas > 1 && (
                              <span className="text-[10px] text-amber flex items-center gap-[3px]">
                                <Icon name="warn" size={10} color="var(--color-amber)"/> mín. {minSaidas} UPs
                              </span>
                            )}
                          </div>
                        </td>
                        <TD muted>{prot.length ? prot.join(' + ') : '—'}</TD>
                        <td className="py-2.5 px-3.5 text-right border-b border-solid border-border-2">
                          {dist!==null ? <Chip val={`${dist} m`} green/> : <span className="text-xs text-ink-faint">Consultar NT</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </DimTable>
              <div className="text-[11px] text-ink-faint leading-[1.6] mt-1.5">Fonte: NBR 9077 — Saídas de Emergência em Edifícios, Tabelas 1 e 2.</div>
            </div>
          </div>
        )}
      </div>

      {openPav && <PavimentoModal pav={openPav} onClose={() => setOpenId(null)} onSave={savePav} seNorma={seNorma} ocupacoes={ocupacoes}/>}
    </div>
  )
}
