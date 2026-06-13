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

// Formata dígitos brutos como XXXX-X/XX
function maskCNAE(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 7)
  if (d.length <= 4) return d
  if (d.length === 5) return d.slice(0, 4) + '-' + d[4]
  return d.slice(0, 4) + '-' + d[4] + '/' + d.slice(5, 7)
}

// Busca um CNAE em todas as divisões do mapa
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

  // Sincroniza quando valor externo muda (ex: trocar divisao)
  useEffect(() => { setQuery(value || '') }, [value])

  // Popula com TODOS os CNAEs da divisao ao abrir sem query
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

  // Fecha ao clicar fora
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleFocus = () => {
    populate(query)
    setOpen(true)
  }

  const handleInput = (e) => {
    const masked = maskCNAE(e.target.value)
    setQuery(masked)

    // CNAE completo digitado (XXXX-X/XX = 9 chars) → busca global
    if (masked.length === 9) {
      const found = findGlobally(cargaMap, masked)
      if (found) {
        setOpen(false)
        onAutoFill?.(found)
        return
      }
    }

    populate(masked)
    setOpen(true)
  }

  const handleSelect = (item) => {
    setQuery(item.cnae)
    setOpen(false)
    onSelect(item)
  }

  const handleClear = () => {
    setQuery('')
    onSelect({ cnae:'', descricao:'', cargaIncendio:null })
    setOpen(false)
  }

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
          <input
            value={query}
            onChange={handleInput}
            onFocus={handleFocus}
            placeholder="Clique para ver todos os CNAEs desta divisao..."
            style={{paddingLeft:32, paddingRight:query?30:12}}
          />
          {query && (
            <button onClick={handleClear} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-faint)',cursor:'pointer',padding:2}}>
              <Icon name="x" size={12}/>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div style={{
            position:'absolute', top:'100%', left:0, right:0,
            background:'var(--surface)',
            border:'.5px solid var(--red-border)',
            borderRadius:'var(--radius-md)',
            zIndex:200, maxHeight:260, overflowY:'auto',
            boxShadow:'0 8px 32px rgba(0,0,0,.5)',
          }}>
            <div style={{padding:'6px 12px', fontSize:10, color:'var(--text-faint)', borderBottom:'.5px solid var(--border-2)', background:'var(--surface-2)'}}>
              {results.length} resultado{results.length !== 1 ? 's' : ''} {query ? `para "${query}"` : `em ${divisao}`}
            </div>
            {results.map((r, i) => (
              <div key={i} onClick={() => handleSelect(r)}
                style={{
                  padding:'10px 12px', cursor:'pointer',
                  borderBottom:'.5px solid var(--border-2)',
                  display:'grid',
                  gridTemplateColumns:'90px 1fr 72px',
                  gap:12, alignItems:'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{fontSize:12, fontFamily:'monospace', color:'var(--red)', fontWeight:600}}>
                  {r.cnae}
                </span>
                <span style={{fontSize:12, color:'var(--text)', lineHeight:1.4}}>
                  {r.descricao}
                </span>
                <div style={{
                  textAlign:'center',
                  background: r.cargaIncendio <= 300 ? 'var(--green-dim)' : r.cargaIncendio <= 1200 ? 'var(--amber-dim)' : 'var(--red-dim)',
                  border: `.5px solid ${r.cargaIncendio <= 300 ? 'var(--green-border)' : r.cargaIncendio <= 1200 ? 'var(--amber-border)' : 'var(--red-border)'}`,
                  borderRadius:'var(--radius-sm)',
                  padding:'4px 6px',
                }}>
                  <div style={{
                    fontSize:14, fontWeight:700, lineHeight:1,
                    color: r.cargaIncendio <= 300 ? 'var(--green)' : r.cargaIncendio <= 1200 ? 'var(--amber)' : 'var(--red)',
                  }}>
                    {r.cargaIncendio}
                  </div>
                  <div style={{fontSize:9, color:'var(--text-faint)', marginTop:1}}>MJ/m2</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Descricao do CNAE selecionado */}
      {selectedData && (
        <div style={{marginTop:6, fontSize:11, color:'var(--text-muted)', padding:'6px 10px', background:'var(--surface-2)', borderRadius:'var(--radius-md)', border:'.5px solid var(--border)'}}>
          <span style={{fontFamily:'monospace', color:'var(--red)', marginRight:8}}>{value}</span>
          {selectedData.descricao}
        </div>
      )}

      {/* Campo livre se nao encontrou */}
      {naoEncontrado && (
        <div className="fg" style={{marginTop:8}}>
          <label style={{fontSize:11}}>CNAE nao encontrado — descreva a atividade</label>
          <input value={descValue || ''} onChange={e => onDescChange(e.target.value)}
            placeholder="Descreva a atividade para referencia no memorial"/>
        </div>
      )}
    </div>
  )
}

// ── Card de pavimento ─────────────────────────────────────────────────
function PavCard({ pav }) {
  const { dispatch } = useProjeto()
  const { ocupacoes } = useNorma()
  const [open, setOpen] = useState(false)

  const grupos   = Object.keys(ocupacoes)
  const divisoes = ocupacoes[pav.grupo] || {}

  const GRUPO_NOMES = {
    A:'Residencial', B:'Hospedagem', C:'Comercio', D:'Serv. ess.',
    E:'Serv. prof.', F:'Reuniao', G:'Depositos', H:'Saude', I:'Industrial',
  }

  const setGrupo  = (g) => {
    const firstDiv = Object.keys(ocupacoes[g] || {})[0] || ''
    dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ grupo:g, divisao:firstDiv, cnae:'', cnaeDesc:'' } })
  }
  const setDivisao  = (d) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ divisao:d, cnae:'', cnaeDesc:'' } })
  const setArea     = (v) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ area:v } })
  const setCNAE     = (item) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ cnae:item.cnae, cnaeDesc:item.descricao } })
  const setCnaeDesc = (v) => dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{ cnaeDesc:v } })

  // CNAE digitado manualmente → preenche grupo + divisão automaticamente
  const handleAutoFill = (found) => {
    dispatch({ type:'UPDATE_PAV', id:pav.id, changes:{
      grupo:    found.grupo,
      divisao:  found.divisao,
      cnae:     found.cnae,
      cnaeDesc: found.descricao,
    }})
  }

  return (
    <div style={{
      background:'var(--surface-2)',
      border:`.5px solid ${pav.cnae ? 'rgba(192,21,42,.25)' : 'var(--border)'}`,
      borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:8,
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',cursor:'pointer',userSelect:'none'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:'var(--radius-md)',background:'var(--red-dim)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'var(--red)',flexShrink:0}}>
            {pav.label.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:'var(--text-muted)'}}>{pav.label}</div>
            <div style={{fontSize:11,color:'var(--text-faint)',marginTop:2}}>
              {(divisoes[pav.divisao] || pav.divisao) || '—'}
              {pav.cnae && <span style={{marginLeft:8,color:'var(--text-hint)',fontFamily:'monospace'}}>{pav.cnae}</span>}
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'var(--red-dim)',border:'.5px solid var(--red-border)',color:'var(--red)'}}>{pav.grupo}</span>
          {pav.acess.map((a, i) => (
            <span key={i} style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,background:'rgba(255,255,255,.05)',border:'.5px solid var(--border)',color:'var(--text-faint)'}}>
              {a.divisao?.charAt(0)}
            </span>
          ))}
          <div style={{color:'var(--text-faint)',transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}>
            <Icon name="chevD" size={15}/>
          </div>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{padding:'0 16px 16px',borderTop:'.5px solid var(--border)'}}>
          <div style={{paddingTop:14}}>

            {/* Botao replicar (so no terreo) */}
            {pav.id === 'P1' && (
              <button className="btn-add" style={{marginBottom:16,borderColor:'var(--red-border)',color:'var(--red)'}}
                onClick={e => { e.stopPropagation(); dispatch({ type:'REPLICATE_TERREO' }) }}>
                <Icon name="check" size={11}/> Repetir para todos os pavimentos
              </button>
            )}

            {/* Grid de grupos (keys primarias do OCUPACOES) */}
            <div style={{fontSize:11,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>
              Grupo de ocupacao principal
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(9,1fr)',gap:5,marginBottom:14}}>
              {grupos.map(g => (
                <div key={g} onClick={() => setGrupo(g)}
                  style={{border:`.5px solid ${pav.grupo===g?'var(--red-border)':'var(--border)'}`,borderRadius:'var(--radius-md)',padding:'8px 4px',cursor:'pointer',textAlign:'center',background:pav.grupo===g?'var(--red-dim)':'transparent'}}>
                  <div style={{fontSize:15,fontWeight:700,color:pav.grupo===g?'var(--red)':'var(--text-faint)'}}>{g}</div>
                  <div style={{fontSize:9,color:'var(--text-hint)',marginTop:2,lineHeight:1.2}}>{GRUPO_NOMES[g]||g}</div>
                </div>
              ))}
            </div>

            {/* Divisao + Area */}
            <div className="g2" style={{marginBottom:16}}>
              <div className="fg">
                <label>Divisao (keys secundarias do grupo {pav.grupo})</label>
                <select value={pav.divisao} onChange={e => setDivisao(e.target.value)}>
                  {Object.entries(divisoes).map(([code, label]) => {
                    const jaUsada = pav.acess.some(a => a.divisao === code)
                    return (
                      <option key={code} value={code} disabled={jaUsada}>
                        {label}{jaUsada ? ' — já utilizada' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="fg">
                <label>Area do pavimento (m2)</label>
                <input type="number" value={pav.area} onChange={e => setArea(e.target.value)} placeholder="m2"/>
              </div>
            </div>

            {/* CNAE autocomplete */}
            <div style={{marginBottom:16}}>
              <CnaeBusca
                divisao={pav.divisao}
                value={pav.cnae}
                descValue={pav.cnaeDesc}
                onSelect={setCNAE}
                onDescChange={setCnaeDesc}
                onAutoFill={handleAutoFill}
              />
            </div>

            {/* Acessorias */}
            <div style={{fontSize:11,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>
              Ocupacoes acessorias
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {(() => {
                // Conjunto de todas as divisões já em uso neste pavimento
                const usadas = new Set([pav.divisao, ...pav.acess.map(a => a.divisao)])
                return pav.acess.map((a, i) => (
                  <AcessRow key={i} pav={pav} acess={a} index={i} usadas={usadas}/>
                ))
              })()}
            </div>
            <button className="btn-add" style={{marginTop:8}}
              onClick={() => dispatch({ type:'ADD_ACESS', id:pav.id })}>
              <Icon name="plus" size={11}/> Adicionar ocupacao acessoria
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AcessRow({ pav, acess, index, usadas }) {
  const { dispatch } = useProjeto()
  const { ocupacoes } = useNorma()
  const todasDivisoes = Object.keys(ocupacoes).flatMap(g =>
    Object.entries(ocupacoes[g] || {}).map(([code, label]) => ({ code, label }))
  )
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
      <div className="fg" style={{flex:2,marginBottom:0}}>
        <label style={{fontSize:11}}>Divisao acessoria</label>
        <select value={acess.divisao} onChange={e => dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ divisao:e.target.value } })}>
          {todasDivisoes.map(d => {
            const jaUsada = usadas.has(d.code) && d.code !== acess.divisao
            return (
              <option key={d.code} value={d.code} disabled={jaUsada}>
                {d.label}{jaUsada ? ' — já utilizada' : ''}
              </option>
            )
          })}
        </select>
      </div>
      <div className="fg" style={{width:80,marginBottom:0}}>
        <label style={{fontSize:11}}>Area (m2)</label>
        <input type="number" value={acess.area} onChange={e => dispatch({ type:'UPDATE_ACESS', id:pav.id, index, changes:{ area:e.target.value } })} placeholder="m2"/>
      </div>
      <button className="btn-del" style={{marginBottom:0}} onClick={() => dispatch({ type:'REMOVE_ACESS', id:pav.id, index })}>
        <Icon name="trash" size={12}/>
      </button>
    </div>
  )
}

// ── Step 5 principal ──────────────────────────────────────────────────
export default function Step5() {
  const { state } = useProjeto()
  const { ocupacoes } = useNorma()

  const grupos = {}
  state.pavimentos.forEach(p => {
    if (!grupos[p.grupo]) grupos[p.grupo] = new Set()
    grupos[p.grupo].add(p.divisao)
    p.acess.forEach(a => {
      const g = a.divisao?.charAt(0)
      if (g) { if (!grupos[g]) grupos[g] = new Set(); grupos[g].add(a.divisao) }
    })
  })

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'}}>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5}}>Etapa 5 de 8</div>
        <h2 style={{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5}}>Classificacao por pavimento</h2>
        <p style={{fontSize:13,color:'var(--text-faint)',lineHeight:1.6}}>Selecione o grupo, a divisao e busque o CNAE. O CNAE determina automaticamente a carga de incendio na etapa seguinte.</p>
      </div>

      <div className="ibox blue">
        <Icon name="info" size={14} color="rgba(80,140,220,.85)" style={{flexShrink:0}}/>
        <span>Clique no campo CNAE para ver todos os codigos disponiveis para aquela divisao. Digite para filtrar por codigo ou descricao.</span>
      </div>

      {/* Classificacao derivada */}
      <div style={{marginBottom:26}}>
        <div style={blockTitle}>Classificacao geral derivada</div>
        <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'14px 18px'}}>
          <div style={{fontSize:10,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Grupos identificados</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {Object.keys(grupos).length === 0
              ? <span style={{color:'var(--text-hint)',fontSize:13}}>Nenhuma ocupacao configurada</span>
              : Object.keys(grupos).sort().map(g => (
                  <span key={g} className="ctag">{g} — {[...grupos[g]].join(', ')}</span>
                ))
            }
          </div>
        </div>
      </div>

      {/* Cards */}
      <div>
        <div style={blockTitle}>Pavimentos</div>
        {state.pavimentos.length === 0
          ? <div className="ibox amber"><Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/><span>Defina o numero de pavimentos na Etapa 2.</span></div>
          : state.pavimentos.map(pav => <PavCard key={pav.id} pav={pav}/>)
        }
      </div>
    </div>
  )
}
