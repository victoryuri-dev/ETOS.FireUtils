import { useState, useCallback, useRef } from 'react'
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

function pavimentosIniciais(projetoPavs) {
  if (!projetoPavs?.length) return []
  return projetoPavs.map(p => ({
    id: p.id, nome: p.label,
    tipo: p.id === 'P1' ? 'descarga' : 'tipo',
    ambientes: [],
  }))
}

// ── Shared UI ─────────────────────────────────────────────────────────
const inputSt = {
  background:'var(--bg)', border:'.5px solid var(--border)',
  borderRadius:'var(--radius-md)', color:'var(--text)',
  fontSize:12, padding:'6px 10px', width:'100%',
  outline:'none', boxSizing:'border-box',
}
function Label({ children }) {
  return <div style={{ fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{children}</div>
}
function DivBadge({ label }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:26, height:22, padding:'0 6px', borderRadius:4, background:'var(--red)', color:'#fff', fontSize:11, fontWeight:700 }}>{label || '?'}</span>
  )
}
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ display:'flex', alignItems:'center', gap:8, background:'transparent', border:'.5px solid var(--border)', borderRadius:'var(--radius-md)', padding:'6px 12px', cursor:'pointer', fontSize:12, color: checked ? 'var(--text)' : 'var(--text-faint)', fontWeight: checked ? 500 : 400 }}>
      <div style={{ width:28, height:16, borderRadius:8, flexShrink:0, position:'relative', transition:'background .2s', background: checked ? 'var(--red)' : 'var(--border)' }}>
        <div style={{ position:'absolute', top:2, left: checked ? 14 : 2, width:12, height:12, borderRadius:'50%', background:'#fff', transition:'left .2s' }}/>
      </div>
      {label}
    </button>
  )
}
function TH({ children, right, center }) {
  return <th style={{ fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', fontWeight:500, padding:'9px 14px', textAlign: right ? 'right' : center ? 'center' : 'left', borderBottom:'.5px solid var(--border)', whiteSpace:'nowrap', background:'var(--surface-2)' }}>{children}</th>
}
function TD({ children, red, bold, muted, right, center }) {
  return <td style={{ padding:'10px 14px', fontSize:13, color: red ? 'var(--red)' : muted ? 'var(--text-faint)' : 'var(--text)', fontWeight: bold ? 700 : 400, borderBottom:'.5px solid var(--border-2)', textAlign: right ? 'right' : center ? 'center' : 'left', verticalAlign:'middle' }}>{children}</td>
}
function Chip({ val, green }) {
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:4, background: green ? 'var(--green-dim)' : 'var(--red-dim)', border: `.5px solid ${green ? 'var(--green-border)' : 'var(--red-border)'}`, color: green ? 'var(--green)' : 'var(--red)', fontWeight:700, fontSize:13, fontFamily:'monospace' }}>{val}</span>
}
function DimTable({ children }) {
  return <div style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', marginBottom:4 }}><table style={{ width:'100%', borderCollapse:'collapse' }}>{children}</table></div>
}
function SectionTitle({ label, desc }) {
  return (
    <div style={{ marginBottom: desc ? 8 : 12 }}>
      <h3 style={{ fontSize:13, fontWeight:600, color:'var(--text)', margin:'0 0 4px' }}>{label}</h3>
      {desc && <p style={{ fontSize:11, color:'var(--text-faint)', margin:0, lineHeight:1.5 }}>{desc}</p>}
    </div>
  )
}
function LargAdotadaInput({ laMin, value, onChange }) {
  const [err, setErr] = useState(false)
  const display = value != null ? value : laMin
  return (
    <td style={{ padding:'6px 14px', borderBottom:'.5px solid var(--border-2)', textAlign:'right', verticalAlign:'middle' }}>
      <div style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:4 }}>
        <input type="number" step="0.05" min={laMin} value={display}
          onChange={e => { const v = parseFloat(e.target.value); if (isNaN(v)||v<laMin){setErr(true);onChange(laMin)}else{setErr(false);onChange(+v.toFixed(2))} }}
          onBlur={e => { const v = parseFloat(e.target.value); if (isNaN(v)||v<laMin){setErr(false);onChange(laMin)} }}
          style={{ width:90, background:'var(--surface)', border:`.5px solid ${err?'var(--red)':'var(--border)'}`, borderRadius:'var(--radius-md)', color:'var(--green)', fontWeight:700, fontSize:13, padding:'4px 8px', textAlign:'right', outline:'none', fontFamily:'monospace' }}
        />
        <span style={{ fontSize:11, color:'var(--text-faint)' }}>m</span>
        {err && <div style={{ position:'absolute', top:'calc(100% + 4px)', right:0, whiteSpace:'nowrap', fontSize:10, background:'var(--red)', color:'#fff', padding:'3px 7px', borderRadius:4, zIndex:10 }}>Mín: {fmtM(laMin)}</div>}
      </div>
    </td>
  )
}

// ── DivisaoSelect — usa OCUPACOES do estado vigente ───────────────────
function DivisaoSelect({ value, onChange, ocupacoes }) {
  return (
    <select style={inputSt} value={value} onChange={e => onChange(e.target.value)}>
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
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:10 }}>
        <div>
          <Label>Nome do ambiente</Label>
          <input style={inputSt} placeholder="ex.: Sala 101, Loja..." autoFocus={autoFocus}
            value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} onKeyDown={e => e.key==='Enter' && handleSave()}/>
        </div>
        <div>
          <Label>Divisão de ocupação</Label>
          <DivisaoSelect value={form.divisao} onChange={setDivisao} ocupacoes={ocupacoes}/>
        </div>
      </div>

      {form.divisao && (
        <div style={{ display:'grid', gridTemplateColumns: opcoes.length > 1 ? '1.4fr 1fr 100px' : '1.8fr 1fr 100px', gap:10, alignItems:'flex-end' }}>
          <div>
            <Label>Taxa normativa — {form.divisao}</Label>
            {opcoes.length > 1 ? (
              <select style={inputSt} value={form.popTipo} onChange={e => setTipo(e.target.value)}>
                {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <div style={{ ...inputSt, background:'var(--surface)', color:'var(--text-faint)', display:'flex', alignItems:'center' }}>
                {opcoes[0]?.label || '—'}
              </div>
            )}
          </div>
          <div>
            <Label>{inputLabel}</Label>
            {isArea   && <input style={inputSt} type="number" min="0" placeholder="ex.: 64,5" value={form.area}     onChange={e => setForm(f=>({...f,area:e.target.value}))}     onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
            {isFixo   && <input style={inputSt} type="number" min="0" placeholder="ex.: 120"  value={form.assentos} onChange={e => setForm(f=>({...f,assentos:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
            {isManual && <input style={inputSt} type="number" min="0" placeholder="ex.: 8"    value={form.popManual} onChange={e => setForm(f=>({...f,popManual:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
          </div>
          <div>
            <Label>Pop. calculada</Label>
            <div style={{ ...inputSt, background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', color: popCalc()>0 ? 'var(--red)' : 'var(--text-faint)', fontWeight:700, fontSize:15 }}>
              {popCalc() || '—'}
            </div>
          </div>
        </div>
      )}

      {taxa?.notas?.length > 0 && taxa.A === null && (
        <div className="ibox amber" style={{ marginBottom:0 }}>
          <Icon name="warn" size={13} color="var(--amber)" style={{flexShrink:0}}/>
          <span style={{fontSize:11}}>{taxa.obs}</span>
        </div>
      )}

      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
        <button className="btn-ghost" onClick={onCancel}><Icon name="x" size={12}/> Cancelar</button>
        <button className="btn-primary" onClick={handleSave} style={{ opacity: canSave()?1:0.45, pointerEvents: canSave()?'auto':'none' }}>
          <Icon name="check" size={12}/> {initial ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}

// ── PavimentoModal ────────────────────────────────────────────────────
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
  const COL = '1.4fr 56px 1.6fr 80px 54px 48px'

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:'var(--radius-lg)', width:900, maxWidth:'96vw', maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.55)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'18px 22px', borderBottom:'.5px solid var(--border)', flexShrink:0 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>{pav.nome}</span>
              {pav.tipo === 'descarga'
                ? <span style={{ fontSize:10, padding:'3px 8px', borderRadius:4, background:'var(--amber-dim)', border:'.5px solid var(--amber-border)', color:'var(--amber)', fontWeight:600 }}>PISO DE DESCARGA</span>
                : <span style={{ fontSize:10, padding:'3px 8px', borderRadius:4, background:'var(--surface-2)', border:'.5px solid var(--border)', color:'var(--text-faint)', fontWeight:500 }}>PAVIMENTO TIPO</span>}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 14px', fontSize:11, color:'var(--text-faint)' }}>
              <span>{ambientes.length} ambiente{ambientes.length!==1?'s':''}</span>
              <span style={{opacity:.25}}>·</span>
              <span>Pop. total: <strong style={{ color:'var(--red)', fontWeight:700 }}>{totalPop} pessoas</strong></span>
              {divisoes.length > 0 && <><span style={{opacity:.25}}>·</span><span style={{ display:'flex', alignItems:'center', gap:4 }}>Divisões: {divisoes.map(d=><DivBadge key={d} label={d}/>)}</span></>}
            </div>
          </div>
          <button className="btn-ghost" style={{ padding:'6px', marginLeft:12 }} onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Col headers */}
        <div style={{ display:'grid', gridTemplateColumns:COL, gap:8, padding:'8px 22px', background:'var(--surface-2)', borderBottom:'.5px solid var(--border)', flexShrink:0, fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.06em' }}>
          <span>Nome</span><span>Div.</span><span>Taxa / Entrada</span><span>Valor</span><span style={{textAlign:'right'}}>Pop.</span><span/>
        </div>

        {/* Rows */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {ambientes.length === 0 && !showAdd && (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--text-faint)', fontSize:13 }}>
              Nenhum ambiente adicionado. Clique em "Adicionar ambiente".
            </div>
          )}
          {ambientes.map(a => {
            const pop = calcPopAmb(a, TAXA_POPULACIONAL)
            const opcoes = taxaOpcoes(a.divisao, TAXA_POPULACIONAL)
            const taxaLabel = opcoes.find(o => o.value===a.popTipo)?.label || TAXA_POPULACIONAL[a.divisao]?.obs || '—'
            if (editId === a.id) {
              return (
                <div key={a.id} style={{ padding:'14px 22px', background:'rgba(192,21,42,.04)', borderBottom:'.5px solid var(--red-border)' }}>
                  <div style={{ fontSize:10, color:'var(--red)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>Editando: {a.nome}</div>
                  <AmbienteForm initial={a} autoFocus onSave={d => saveAmb(a.id,d)} onCancel={() => setEditId(null)} seNorma={seNorma} ocupacoes={ocupacoes}/>
                </div>
              )
            }
            return (
              <div key={a.id}
                onClick={() => { setShowAdd(false); setEditId(a.id) }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.025)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                style={{ display:'grid', gridTemplateColumns:COL, gap:8, alignItems:'center', padding:'11px 22px', borderBottom:'.5px solid var(--border-2)', cursor:'pointer', transition:'background .1s' }}
              >
                <span style={{ fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.nome}</span>
                <DivBadge label={a.divisao||'?'}/>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-faint)', lineHeight:1.3 }}>{taxaLabel}</div>
                  {a.popTipo==='manual' && <div style={{ fontSize:10, color:'var(--amber)', marginTop:1 }}>Manual</div>}
                </div>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                  {a.popTipo==='area' ? `${a.area} m²` : a.popTipo==='fixo' ? `${a.assentos} assentos` : `${a.popManual} pess.`}
                </span>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--red)', textAlign:'right' }}>{pop}</span>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={e => { e.stopPropagation(); delAmb(a.id) }}
                    style={{ background:'transparent', border:'.5px solid transparent', borderRadius:'var(--radius-md)', color:'var(--text-faint)', cursor:'pointer', padding:'4px 5px', display:'flex' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--red-border)'; e.currentTarget.style.color='var(--red)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--text-faint)' }}
                  ><Icon name="trash" size={12}/></button>
                </div>
              </div>
            )
          })}
          {showAdd && (
            <div style={{ padding:'16px 22px', background:'rgba(192,21,42,.05)', borderTop:'.5px solid var(--red-border)' }}>
              <div style={{ fontSize:10, color:'var(--red)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12 }}>Novo ambiente</div>
              <AmbienteForm autoFocus onSave={addAmb} onCancel={() => setShowAdd(false)} seNorma={seNorma} ocupacoes={ocupacoes}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ flexShrink:0 }}>
          {notasAtivas.length > 0 && (
            <div style={{ padding:'8px 22px', background:'var(--surface-2)', borderTop:'.5px solid var(--border)' }}>
              {notasAtivas.map(k => NOTAS_NORMATIVAS[k] && <div key={k} style={{ fontSize:10, color:'var(--text-faint)', lineHeight:1.5 }}>{NOTAS_NORMATIVAS[k]}</div>)}
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px', borderTop:'.5px solid var(--border)' }}>
            <div style={{ display:'flex', gap:24 }}>
              {[{ label:'Ambientes', val:String(ambientes.length), red:false },{ label:'Área (m²)', val:totalArea.toLocaleString('pt-BR'), red:false },{ label:'Pop. total', val:`${totalPop} pess.`, red:true }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize:9, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:18, fontWeight:700, color: s.red ? 'var(--red)' : 'var(--text)' }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
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
export default function SaidaEmergenciaPage() {
  const { state }       = useProjeto()
  const { uf, info, ocupacoes } = useNorma()
  const seNorma         = getSE(uf)
  const { TAXA_POPULACIONAL, NOTAS_NORMATIVAS: _, LARGURAS_MINIMAS, BLOCOS_DISTANCIA } = seNorma

  const [pavimentos,   setPavimentos]   = useState(() => pavimentosIniciais(state.pavimentos))
  const [openId,       setOpenId]       = useState(null)
  const [addForm,      setAddForm]      = useState(false)
  const [newPav,       setNewPav]       = useState({ nome:'', tipo:'tipo' })
  const [temChuveiros, setTemChuveiros] = useState(false)
  const [temDeteccao,  setTemDeteccao]  = useState(false)
  const [largAdotada,  setLargAdotada]  = useState({})
  const [importInfo,   setImportInfo]   = useState(null)
  const [importErro,   setImportErro]   = useState(null)
  const [saidaUnica,   setSaidaUnica]   = useState({})
  const fileInputRef = useRef(null)

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

  const addPavimento = () => {
    if (!newPav.nome.trim()) return
    setPavimentos(prev => [...prev, { id:uid(), nome:newPav.nome.trim(), tipo:newPav.tipo, ambientes:[] }])
    setNewPav({ nome:'', tipo:'tipo' })
    setAddForm(false)
  }

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
    <div style={{ flex:1, overflowY:'auto' }}>
      <div style={{ maxWidth:980, margin:'0 auto', padding:'32px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, color:'var(--red)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:4 }}>Saídas de Emergência</div>
              <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:6 }}>Dimensionamento</h2>
              <p style={{ fontSize:13, color:'var(--text-faint)', lineHeight:1.6, maxWidth:600, margin:0 }}>
                Adicione pavimentos e configure os ambientes de cada um. Resultados calculados automaticamente conforme {info?.nome || 'NT vigente'} / NBR 9077.
              </p>
            </div>
            <div style={{ flexShrink:0 }}>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImport}/>
              <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
                <Icon name="upload" size={13}/>
                Importar do Revit
              </button>
              <div style={{ fontSize:10, color:'var(--text-faint)', marginTop:5, textAlign:'right' }}>
                firedata.json
              </div>
            </div>
          </div>

          {importInfo && (
            <div className="ibox green" style={{ marginBottom:0 }}>
              <Icon name="check" size={13} color="var(--green)" style={{flexShrink:0}}/>
              <span style={{fontSize:12}}>Dados importados do Revit — última exportação: <strong>{importInfo}</strong>. Confira os nomes dos ambientes e ajuste se necessário.</span>
            </div>
          )}
          {importErro && (
            <div className="ibox red" style={{ marginBottom:0 }}>
              <Icon name="warn" size={13} color="var(--red)" style={{flexShrink:0}}/>
              <span style={{fontSize:12}}>Erro ao importar: {importErro}</span>
            </div>
          )}
        </div>

        {/* Pavimentos */}
        <div style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:28 }}>
          <div style={{ padding:'14px 20px', borderBottom:'.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', display:'flex', alignItems:'center', gap:8 }}>
              Pavimentos
              {govPav && <span style={{ fontSize:11, fontWeight:400, color:'var(--text-faint)' }}>— Mais populoso: <span style={{ color:'var(--red)', fontWeight:600 }}>{govPav.nome} ({calcPopPav(govPav, TAXA_POPULACIONAL)} pess.)</span></span>}
            </div>
            {!addForm && <button className="btn-ghost" onClick={() => setAddForm(true)}><Icon name="plus" size={12}/> Adicionar pavimento</button>}
          </div>

          {temPavimentos && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 130px 1fr 28px', gap:14, padding:'8px 20px', background:'var(--surface-2)', borderBottom:'.5px solid var(--border)', fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.06em' }}>
              <span>Pavimento</span><span style={{textAlign:'center'}}>Amb.</span><span style={{textAlign:'center'}}>Pop.</span><span>Divisões</span><span/>
            </div>
          )}

          {pavimentos.map(p => {
            const pop  = calcPopPav(p, TAXA_POPULACIONAL)
            const divs = [...new Set(p.ambientes.map(a => a.divisao).filter(Boolean))]
            const isGov = govPav?.id === p.id
            return (
              <div key={p.id}
                onClick={() => setOpenId(p.id)}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.025)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                style={{ display:'grid', gridTemplateColumns:'1fr 80px 130px 1fr 28px', gap:14, alignItems:'center', padding:'13px 20px', borderBottom:'.5px solid var(--border-2)', cursor:'pointer', transition:'background .1s' }}
              >
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{p.nome}</span>
                    {p.tipo==='descarga'
                      ? <span style={{ fontSize:9, padding:'2px 6px', borderRadius:3, background:'var(--amber-dim)', border:'.5px solid var(--amber-border)', color:'var(--amber)', fontWeight:600 }}>DESCARGA</span>
                      : <span style={{ fontSize:9, padding:'2px 6px', borderRadius:3, background:'var(--surface-2)', border:'.5px solid var(--border)', color:'var(--text-faint)' }}>TIPO</span>}
                  </div>
                  {isGov && <div style={{ fontSize:10, color:'var(--red)', fontWeight:500, marginTop:2 }}>Mais populoso · referência para ER</div>}
                </div>
                <div style={{ textAlign:'center', fontSize:15, fontWeight:700, color: p.ambientes.length ? 'var(--red)' : 'var(--text-faint)' }}>{p.ambientes.length}</div>
                <div style={{ textAlign:'center', fontSize:14, fontWeight:700, color: pop>0 ? 'var(--red)' : 'var(--text-faint)' }}>{pop>0 ? `${pop} pess.` : <span style={{fontSize:11,fontWeight:400}}>—</span>}</div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{divs.map(d=><DivBadge key={d} label={d}/>)}{!divs.length && <span style={{fontSize:11,color:'var(--text-faint)'}}>—</span>}</div>
                <div onClick={e => { e.stopPropagation(); setPavimentos(prev=>prev.filter(x=>x.id!==p.id)) }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-faint)'}
                  style={{ color:'var(--text-faint)', cursor:'pointer', display:'flex' }}><Icon name="trash" size={13}/></div>
              </div>
            )
          })}

          {!temPavimentos && !addForm && <div style={{ padding:'36px', textAlign:'center', color:'var(--text-faint)', fontSize:13 }}>Nenhum pavimento adicionado.</div>}

          {addForm && (
            <div style={{ padding:'16px 20px', background:'rgba(192,21,42,.05)', borderTop: temPavimentos ? '.5px solid var(--red-border)' : 'none' }}>
              <div style={{ fontSize:10, color:'var(--red)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12 }}>Novo pavimento</div>
              <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                <div style={{ flex:1 }}>
                  <Label>Nome</Label>
                  <input style={inputSt} autoFocus placeholder="ex.: Térreo, 1º Pavimento..."
                    value={newPav.nome} onChange={e => setNewPav(f=>({...f,nome:e.target.value}))} onKeyDown={e => e.key==='Enter' && addPavimento()}/>
                </div>
                <div>
                  <Label>Tipo de pavimento</Label>
                  <select style={{ ...inputSt, width:'auto' }} value={newPav.tipo} onChange={e => setNewPav(f=>({...f,tipo:e.target.value}))}>
                    <option value="tipo">Pavimento tipo</option>
                    <option value="descarga">Piso de descarga (Térreo)</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={addPavimento}>Adicionar</button>
                <button className="btn-ghost" onClick={() => setAddForm(false)}>Cancelar</button>
              </div>
              <div style={{ marginTop:10, fontSize:11, color:'var(--text-faint)', lineHeight:1.5 }}>
                <strong>Piso de descarga</strong>: pavimento de saída da edificação (térreo). Conta para AD e PT, mas não para ER.
              </div>
            </div>
          )}
        </div>

        {temPavimentos && !pavimentos.some(p => p.tipo==='descarga') && (
          <div className="ibox amber" style={{ marginBottom:24 }}>
            <Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/>
            <span style={{fontSize:12}}>Nenhum piso de descarga definido. Identifique o térreo como "Piso de descarga" para o cálculo correto das distâncias máximas.</span>
          </div>
        )}

        {/* Resultados */}
        {temPavimentos && (
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

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
                <div className="ibox amber"><Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/><span style={{fontSize:12}}>Nenhum pavimento tipo configurado. O piso de descarga não é referência para ER.</span></div>
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
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <SectionTitle label="Distâncias Máximas a Percorrer" desc="Distância máxima do ponto mais remoto até a saída de emergência (NBR 9077)"/>
                <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:16 }}>
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
                        <td style={{ padding:'8px 14px', borderBottom:'.5px solid var(--border-2)', verticalAlign:'middle' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <button
                              onClick={() => toggleSaidaUnica(pav.id, true)}
                              style={{ fontSize:11, padding:'4px 10px', borderRadius:'var(--radius-md)', border:`.5px solid ${unica ? 'var(--red-border)' : 'var(--border)'}`, background: unica ? 'var(--red-dim)' : 'transparent', color: unica ? 'var(--red)' : 'var(--text-faint)', cursor:'pointer', fontWeight: unica ? 600 : 400, transition:'all .15s' }}
                            >Saída única</button>
                            <button
                              onClick={() => toggleSaidaUnica(pav.id, false)}
                              style={{ fontSize:11, padding:'4px 10px', borderRadius:'var(--radius-md)', border:`.5px solid ${!unica ? 'var(--green-border)' : 'var(--border)'}`, background: !unica ? 'var(--green-dim)' : 'transparent', color: !unica ? 'var(--green)' : 'var(--text-faint)', cursor:'pointer', fontWeight: !unica ? 600 : 400, transition:'all .15s' }}
                            >Mais de uma saída</button>
                            {unica && minSaidas > 1 && (
                              <span style={{ fontSize:10, color:'var(--amber)', display:'flex', alignItems:'center', gap:3 }}>
                                <Icon name="warn" size={10} color="var(--amber)"/> mín. {minSaidas} UPs
                              </span>
                            )}
                          </div>
                        </td>
                        <TD muted>{prot.length ? prot.join(' + ') : '—'}</TD>
                        <td style={{ padding:'10px 14px', textAlign:'right', borderBottom:'.5px solid var(--border-2)' }}>
                          {dist!==null ? <Chip val={`${dist} m`} green/> : <span style={{ fontSize:12, color:'var(--text-faint)' }}>Consultar NT</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </DimTable>
              <div style={{ fontSize:11, color:'var(--text-faint)', lineHeight:1.6, marginTop:6 }}>Fonte: NBR 9077 — Saídas de Emergência em Edifícios, Tabelas 1 e 2.</div>
            </div>
          </div>
        )}
      </div>

      {openPav && <PavimentoModal pav={openPav} onClose={() => setOpenId(null)} onSave={savePav} seNorma={seNorma} ocupacoes={ocupacoes}/>}
    </div>
  )
}
