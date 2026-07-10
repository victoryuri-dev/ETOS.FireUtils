import { useState, useRef, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import Icon from '../ui/Icon'

const blockTitle = {
  fontSize:11, fontWeight:500, color:'var(--text-faint)',
  textTransform:'uppercase', letterSpacing:'.08em',
  marginBottom:12, paddingBottom:8, borderBottom:'.5px solid var(--border)',
  display:'flex', alignItems:'center', justifyContent:'space-between',
}

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
    <div ref={ref} style={{position:'relative'}}>
      <div className="fg" style={{marginBottom:0}}>
        <label style={{fontSize:11}}>
          CNAE <span className="req">*</span>
          <span className="fhint"> — clique para ver todos ou digite para filtrar</span>
        </label>
        <div style={{position:'relative'}}>
          <Icon name="search" size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-faint)',pointerEvents:'none'}}/>
          <input value={query} onChange={handleInput} onFocus={handleFocus}
            placeholder="Clique para ver todos os CNAEs desta divisao..."
            style={{paddingLeft:32, paddingRight:query?30:12}}/>
          {query && (
            <button onClick={handleClear} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-faint)',cursor:'pointer',padding:2}}>
              <Icon name="x" size={12}/>
            </button>
          )}
        </div>
        {open && results.length > 0 && (
          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--surface)',border:'.5px solid var(--red-border)',borderRadius:'var(--radius-md)',zIndex:400,maxHeight:260,overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,.5)'}}>
            <div style={{padding:'6px 12px',fontSize:10,color:'var(--text-faint)',borderBottom:'.5px solid var(--border-2)',background:'var(--surface-2)'}}>
              {results.length} resultado{results.length !== 1 ? 's' : ''} {query ? `para "${query}"` : `em ${divisao}`}
            </div>
            {results.map((r, i) => (
              <div key={i} onClick={() => handleSelect(r)}
                style={{padding:'10px 12px',cursor:'pointer',borderBottom:'.5px solid var(--border-2)',display:'grid',gridTemplateColumns:'90px 1fr 72px',gap:12,alignItems:'center'}}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{fontSize:12,fontFamily:'monospace',color:'var(--red)',fontWeight:600}}>{r.cnae}</span>
                <span style={{fontSize:12,color:'var(--text)',lineHeight:1.4}}>{r.descricao}</span>
                <div style={{textAlign:'center',background:r.cargaIncendio<=300?'var(--green-dim)':r.cargaIncendio<=1200?'var(--amber-dim)':'var(--red-dim)',border:`.5px solid ${r.cargaIncendio<=300?'var(--green-border)':r.cargaIncendio<=1200?'var(--amber-border)':'var(--red-border)'}`,borderRadius:'var(--radius-sm)',padding:'4px 6px'}}>
                  <div style={{fontSize:14,fontWeight:700,lineHeight:1,color:r.cargaIncendio<=300?'var(--green)':r.cargaIncendio<=1200?'var(--amber)':'var(--red)'}}>{r.cargaIncendio}</div>
                  <div style={{fontSize:9,color:'var(--text-faint)',marginTop:1}}>MJ/m2</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedData && (
        <div style={{marginTop:6,fontSize:11,color:'var(--text-muted)',padding:'6px 10px',background:'var(--surface-2)',borderRadius:'var(--radius-md)',border:'.5px solid var(--border)'}}>
          <span style={{fontFamily:'monospace',color:'var(--red)',marginRight:8}}>{value}</span>
          {selectedData.descricao}
        </div>
      )}
      {naoEncontrado && (
        <div className="fg" style={{marginTop:8}}>
          <label style={{fontSize:11}}>CNAE nao encontrado — descreva a atividade</label>
          <input value={descValue || ''} onChange={e => onDescChange(e.target.value)} placeholder="Descreva a atividade para referencia no memorial"/>
        </div>
      )}
    </div>
  )
}

// ── Cabeçalho de seção com descrição normativa ────────────────────────
function SectionHead({ titulo, descricao, aviso }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{titulo}</div>
      {descricao && <p style={{fontSize:11,color:'var(--text-faint)',lineHeight:1.55,margin:'0 0 4px',maxWidth:600}}>{descricao}</p>}
      {aviso && <p style={{fontSize:11,color:'var(--amber)',lineHeight:1.55,margin:0,maxWidth:600}}>{aviso}</p>}
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
    <div style={{border:'.5px solid var(--border)',borderRadius:'var(--radius-md)',padding:'14px',background:'var(--bg)'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 120px',gap:10,marginBottom:12}}>
        <div className="fg">
          <label style={{fontSize:11}}>Grupo</label>
          <select value={grupoAtual} onChange={e => setGrupo(e.target.value)}>
            {gruposKeys.map(g => (
              <option key={g} value={g}>{g} — {grupos[g] || g}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label style={{fontSize:11}}>Divisao</label>
          <select value={acess.divisao} onChange={e => setDivisao(e.target.value)}>
            {Object.entries(divisoesGrp).map(([code, label]) => {
              const jaUsada = usadas.has(code) && code !== acess.divisao
              return <option key={code} value={code} disabled={jaUsada}>{code} — {label}{jaUsada?' (ja utilizada)':''}</option>
            })}
          </select>
        </div>
        <div className="fg">
          <label style={{fontSize:11}}>Area (m2)</label>
          <input type="number" value={acess.area} onChange={e => setArea(e.target.value)} placeholder="m2"/>
        </div>
      </div>
      <CnaeBusca divisao={acess.divisao} value={acess.cnae || ''} descValue={acess.cnaeDesc || ''}
        onSelect={setCNAE} onDescChange={setCnaeDesc} onAutoFill={handleAutoFill}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
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
      style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{background:'var(--surface)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',width:700,maxWidth:'96vw',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,.55)'}}
      >
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'.5px solid var(--border)',flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:3}}>{pav.label}</div>
            <div style={{fontSize:11,color:'var(--text-faint)'}}>Classificacao de ocupacao</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {pav.id === 'P1' && (
              <button className="btn-ghost" style={{fontSize:11,borderColor:'var(--red-border)',color:'var(--red)'}}
                onClick={() => dispatch({ type:'REPLICATE_TERREO' })}>
                <Icon name="check" size={11}/> Repetir para todos
              </button>
            )}
            <button className="btn-ghost" style={{padding:'6px'}} onClick={onClose}>
              <Icon name="x" size={14}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 22px'}}>

          {/* Ocupação principal */}
          <SectionHead
            titulo="Ocupacao principal ou predominante"
            descricao="Atividade ou uso principal exercido na edificacao ou area de risco."
          />

          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 120px',gap:10,marginBottom:14}}>
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

          <div style={{marginBottom:22}}>
            <CnaeBusca divisao={pav.divisao} value={pav.cnae} descValue={pav.cnaeDesc}
              onSelect={setCNAE} onDescChange={setCnaeDesc} onAutoFill={handleAutoFill}/>
          </div>

          {/* Ocupações subsidiárias */}
          <SectionHead
            titulo="Ocupacao subsidiaria"
            descricao="Atividade ou uso de apoio ou suporte, vinculada a atividade ou uso principal da ocupacao predominante em edificacao ou area de risco."
            aviso="Quando a ocupacao subsidiaria ultrapassa 10% da area total da edificacao, ela passa a ser tratada como ocupacao mista ou secundaria."
          />

          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {pav.acess.map((a, i) => (
              <AcessRow key={i} pav={pav} acess={a} index={i} usadas={usadas}/>
            ))}
          </div>
          <button className="btn-add" style={{marginTop:10}}
            onClick={() => dispatch({ type:'ADD_ACESS', id:pav.id })}>
            <Icon name="plus" size={11}/> Adicionar ocupacao subsidiaria
          </button>
        </div>

        {/* Footer */}
        <div style={{padding:'14px 22px',borderTop:'.5px solid var(--border)',display:'flex',justifyContent:'flex-end',flexShrink:0}}>
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
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red-border)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = configured ? 'rgba(192,21,42,.25)' : 'var(--border)'}
      style={{
        background:'var(--surface-2)',
        border:`.5px solid ${configured ? 'rgba(192,21,42,.25)' : 'var(--border)'}`,
        borderRadius:'var(--radius-lg)',marginBottom:8,
        cursor:'pointer',transition:'border-color .15s',
      }}
    >
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px'}}>
        {/* Left: ícone + nome + resumo */}
        <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
          <div style={{width:32,height:32,borderRadius:'var(--radius-md)',background: configured ? 'var(--red-dim)' : 'var(--surface)',border:`.5px solid ${configured ? 'var(--red-border)' : 'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color: configured ? 'var(--red)' : 'var(--text-faint)',flexShrink:0}}>
            {pav.grupo || '?'}
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:3}}>{pav.label}</div>
            {configured ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:'3px 12px'}}>
                {/* Principal */}
                <span style={{fontSize:11,color:'var(--text-faint)'}}>
                  <span style={{fontFamily:'monospace',color:'var(--red)',fontWeight:600,marginRight:4}}>{pav.divisao}</span>
                  {divLabel}
                </span>
                {pav.cnae && (
                  <span style={{fontSize:11,color:'var(--text-faint)'}}>
                    CNAE <span style={{fontFamily:'monospace',color:'var(--text-muted)'}}>{pav.cnae}</span>
                  </span>
                )}
                {pav.area && (
                  <span style={{fontSize:11,color:'var(--text-faint)'}}>
                    {pav.area} m²
                  </span>
                )}
              </div>
            ) : (
              <div style={{fontSize:11,color:'var(--text-faint)'}}>Clique para classificar</div>
            )}
            {/* Subsidiárias */}
            {pav.acess.length > 0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:'3px 8px',marginTop:4}}>
                {pav.acess.map((a, i) => {
                  const aLabel = (ocupacoes[a.divisao?.charAt(0)]?.divisoes || {})[a.divisao] || a.divisao
                  return (
                    <span key={i} style={{fontSize:10,color:'var(--text-faint)'}}>
                      <span style={{fontFamily:'monospace',color:'var(--text-muted)',fontWeight:600}}>{a.divisao}</span>
                      {aLabel && aLabel !== a.divisao && <span style={{marginLeft:3}}>{aLabel}</span>}
                      {a.area && <span style={{color:'var(--text-hint)',marginLeft:4}}>{a.area} m²</span>}
                      {a.cnae && <span style={{fontFamily:'monospace',color:'var(--text-hint)',marginLeft:4}}>{a.cnae}</span>}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: badges + seta */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0,marginLeft:12}}>
          {pav.acess.length > 0 && (
            <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:'var(--surface)',border:'.5px solid var(--border)',color:'var(--text-faint)'}}>
              +{pav.acess.length} sub.
            </span>
          )}
          <div style={{color:'var(--text-faint)'}}>
            <Icon name="chevD" size={14} style={{transform:'rotate(-90deg)'}}/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 5 principal ──────────────────────────────────────────────────
export default function Step5() {
  const { state }    = useProjeto()
  const { grupos: gruposNomes } = useNorma()
  const [openId, setOpenId] = useState(null)

  const areaTotal = parseFloat(state.areaTotal) || 0
  const threshold = areaTotal * 0.10

  const principaisDivs = [...new Set(state.pavimentos.map(p => p.divisao).filter(Boolean))]

  const subsidiariasRaw = []
  state.pavimentos.forEach(p => {
    p.acess.forEach(a => {
      if (!a.divisao) return
      const area    = parseFloat(a.area) || 0
      const isMista = areaTotal > 0 && area > threshold
      subsidiariasRaw.push({ divisao: a.divisao, isMista })
    })
  })

  const principaisSet = new Set(principaisDivs)
  const mistasExtra   = [...new Set(subsidiariasRaw.filter(s => s.isMista && !principaisSet.has(s.divisao)).map(s => s.divisao))]
  const subsidiarias  = [...new Set(subsidiariasRaw.filter(s => !s.isMista && !principaisSet.has(s.divisao)).map(s => s.divisao))]
  const edificacaoMista = principaisDivs.length > 1 || mistasExtra.length > 0
  const mistaDivs     = [...principaisSet, ...mistasExtra]
  const temOcupacoes  = principaisDivs.length > 0

  const openPav = state.pavimentos.find(p => p.id === openId)

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'}}>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5}}>Etapa 5 de 8</div>
        <h2 style={{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5}}>Classificacao por pavimento</h2>
        <p style={{fontSize:13,color:'var(--text-faint)',lineHeight:1.6}}>Clique em um pavimento para classificar sua ocupacao principal e ocupacoes subsidiarias.</p>
      </div>

      {/* Classificacao derivada */}
      <div style={{marginBottom:26}}>
        <div style={blockTitle}>Classificacao geral derivada</div>
        <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'16px 18px',display:'flex',flexDirection:'column',gap:12}}>
          {!temOcupacoes
            ? <span style={{color:'var(--text-hint)',fontSize:13}}>Nenhuma ocupacao configurada</span>
            : <>
                <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
                  <span style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em',color:edificacaoMista?'var(--amber)':'var(--red)',minWidth:140,flexShrink:0}}>
                    {edificacaoMista ? 'Ocupacao mista' : 'Ocupacao principal'}:
                  </span>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                    {(edificacaoMista ? mistaDivs : principaisDivs).map((div, i) => (
                      <span key={div} style={{display:'inline-flex',alignItems:'center',gap:4}}>
                        {i > 0 && <span style={{color:'var(--text-faint)',fontSize:12}}>/</span>}
                        <span style={{padding:'3px 10px',borderRadius:4,fontWeight:700,fontSize:13,fontFamily:'monospace',background:edificacaoMista?'var(--amber-dim)':'var(--red-dim)',border:`.5px solid ${edificacaoMista?'var(--amber-border)':'var(--red-border)'}`,color:edificacaoMista?'var(--amber)':'var(--red)'}}>{div}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {subsidiarias.length > 0 && (
                  <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--text-faint)',minWidth:140,flexShrink:0}}>
                      {subsidiarias.length === 1 ? 'Ocupacao subsidiaria' : 'Ocupacoes subsidiarias'}:
                    </span>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      {subsidiarias.map(div => (
                        <span key={div} style={{padding:'3px 10px',borderRadius:4,fontWeight:600,fontSize:12,fontFamily:'monospace',background:'var(--surface)',border:'.5px solid var(--border)',color:'var(--text-muted)'}}>{div}</span>
                      ))}
                    </div>
                  </div>
                )}

                {areaTotal === 0 && subsidiariasRaw.length > 0 && (
                  <div style={{fontSize:11,color:'var(--amber)',paddingTop:4,borderTop:'.5px solid var(--border-2)'}}>
                    Informe a area total na Etapa 2 para identificar automaticamente ocupacoes mistas (acima de 10%).
                  </div>
                )}
              </>
          }
        </div>
      </div>

      {/* Cards */}
      <div>
        <div style={blockTitle}>Pavimentos</div>
        {state.pavimentos.length === 0
          ? <div className="ibox amber"><Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/><span>Defina o numero de pavimentos na Etapa 2.</span></div>
          : state.pavimentos.map(pav => (
              <PavCard key={pav.id} pav={pav} onOpen={() => setOpenId(pav.id)}/>
            ))
        }
      </div>

      {openPav && <PavModal pav={openPav} onClose={() => setOpenId(null)}/>}
    </div>
  )
}
