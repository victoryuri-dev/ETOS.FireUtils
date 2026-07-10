import { useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import Icon from '../ui/Icon'

const getCls = q => q <= 300 ? 'low' : q <= 1200 ? 'med' : 'high'
const getLbl = q => q <= 300 ? 'Baixo — Classe I' : q <= 1200 ? 'Medio — Classe II' : 'Alto — Classe III/IV'

function collectDivs(pavimentos) {
  const map = {}
  pavimentos.forEach(p => {
    if (!map[p.divisao]) map[p.divisao] = { pavs:[], cnae: p.cnae, cnaeDesc: p.cnaeDesc }
    if (!map[p.divisao].pavs.includes(p.label)) map[p.divisao].pavs.push(p.label)
    if (p.cnae && !map[p.divisao].cnae) map[p.divisao].cnae = p.cnae
    p.acess.forEach(a => {
      if (!a.divisao) return
      if (!map[a.divisao]) map[a.divisao] = { pavs:[], cnae: a.cnae || '', cnaeDesc: a.cnaeDesc || '' }
      const tag = p.label + ' (subsidiaria)'
      if (!map[a.divisao].pavs.includes(tag)) map[a.divisao].pavs.push(tag)
      if (a.cnae && !map[a.divisao].cnae) { map[a.divisao].cnae = a.cnae; map[a.divisao].cnaeDesc = a.cnaeDesc || '' }
    })
  })
  return map
}

const S = {
  section:{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'},
  header:{marginBottom:26},
  stepLbl:{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5},
  title:{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5},
  desc:{fontSize:13,color:'var(--text-faint)',lineHeight:1.6},
  block:{marginBottom:26},
  blockTitle:{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'},
}

export default function Step6() {
  const { state, dispatch } = useProjeto()
  const { ocupacoes, cnaesDiv } = useNorma()
  const divMap = collectDivs(state.pavimentos)
  const keys = Object.keys(divMap)

  useEffect(() => {
    dispatch({ type:'INIT_CARGA', divisoes: keys })
  }, [keys.join(',')])

  const setMetodo = (code, metodo) => {
    const changes = { metodo }
    if (metodo === 'tabela') {
      // Reseta para carga do CNAE configurado
      const cnae = divMap[code]?.cnae
      const cargaCNAE = cnae ? cnaesDiv(code)[cnae]?.cargaIncendio : null
      changes.valorManual = ''
      changes.cargaIncendio = cargaCNAE || null
    }
    dispatch({ type:'SET_CARGA', code, changes })
  }

  const setValor = (code, v) => {
    dispatch({ type:'SET_CARGA', code, changes:{ valorManual: v } })
  }

  const getCarga = (code) => {
    const st = state.cargaState[code]
    if (!st) return null
    if (st.metodo === 'levantamento') return parseFloat(st.valorManual) || null
    const cnae = divMap[code]?.cnae
    if (!cnae) return st.cargaIncendio
    return cnaesDiv(code)[cnae]?.cargaIncendio || st.cargaIncendio
  }

  const maxQ = keys.reduce((acc, k) => Math.max(acc, getCarga(k) || 0), 0)
  const maxCls = getCls(maxQ)

  const getDivLabel = (code) => {
    const g = code?.charAt(0)
    return (ocupacoes[g]?.divisoes || {})[code] || code
  }

  return (
    <div style={S.section}>
      <div style={S.header}>
        <div style={S.stepLbl}>Etapa 6 de 8</div>
        <h2 style={S.title}>Carga de Incendio</h2>
        <p style={S.desc}>A carga de incendio de cada divisao e determinada pelo CNAE configurado na etapa anterior. Por tabela: valor normativo automatico. Por levantamento: campo livre.</p>
      </div>

      <div className="ibox blue">
        <Icon name="info" size={14} color="rgba(80,140,220,.85)" style={{flexShrink:0}}/>
        <span>Divisoes sem CNAE configurado nao terao carga automatica. Volte a etapa 5 para configurar o CNAE de cada pavimento.</span>
      </div>

      {keys.length === 0 ? (
        <div className="ibox amber"><Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/><span>Nenhuma divisao configurada.</span></div>
      ) : <>
        <div style={S.block}>
          <div style={S.blockTitle}>
            <span>Carga por divisao</span>
            <span style={{fontSize:11,color:'var(--text-hint)',textTransform:'none',fontWeight:400}}>gerado da classificacao</span>
          </div>
          {keys.map(code => {
            const st = state.cargaState[code] || { metodo:'tabela', valorManual:'' }
            const cnae = divMap[code]?.cnae
            const q = getCarga(code)
            const cls = q ? getCls(q) : null
            const semCNAE = !cnae

            return (
              <div key={code} style={{padding:'12px 0',borderBottom:'.5px solid var(--border-2)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>
                      <span style={{fontFamily:'monospace',color:'var(--red)',marginRight:6}}>{code}</span>
                      {getDivLabel(code)}
                    </div>
                    <div style={{fontSize:11,color:'var(--text-faint)',marginTop:2}}>
                      {cnae
                        ? <><span style={{fontFamily:'monospace',color:'var(--red)'}}>{cnae}</span> — {divMap[code]?.cnaeDesc || cnaesDiv(code)[cnae]?.descricao || ''}</>
                        : <span style={{color:'var(--amber)'}}>Sem CNAE configurado — volte a etapa 5</span>
                      }
                    </div>
                    <div style={{fontSize:11,color:'var(--text-hint)',marginTop:2}}>{divMap[code]?.pavs?.join(', ')}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <select value={st.metodo} onChange={e => setMetodo(code, e.target.value)}
                      style={{background:'var(--surface-2)',border:'.5px solid var(--border)',color:'var(--text)',fontSize:11,padding:'6px 10px',borderRadius:'var(--radius-md)',outline:'none',width:'auto'}}>
                      <option value="tabela">Por tabela normativa</option>
                      <option value="levantamento">Por levantamento</option>
                    </select>
                    {st.metodo === 'levantamento' ? (
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <input type="number" value={st.valorManual} onChange={e => setValor(code, e.target.value)}
                          style={{width:90,textAlign:'right'}} placeholder="0"/>
                        <span style={{fontSize:12,color:'var(--text-faint)',whiteSpace:'nowrap'}}>MJ/m2</span>
                      </div>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:90,textAlign:'right',padding:'9px 12px',background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:13,color:semCNAE?'var(--text-faint)':'var(--text)',opacity:semCNAE?.5:1}}>
                          {q ?? '—'}
                        </div>
                        <span style={{fontSize:12,color:'var(--text-faint)',whiteSpace:'nowrap'}}>MJ/m2</span>
                      </div>
                    )}
                    {cls && <span className={`carga-class ${cls}`}>{getLbl(st.metodo === 'levantamento' ? (parseFloat(st.valorManual)||0) : (q||0))}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo */}
        {maxQ > 0 && (
          <div style={S.block}>
            <div style={S.blockTitle}>Carga representativa da edificacao</div>
            <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'16px 20px',display:'flex',alignItems:'center',gap:20}}>
              <div>
                <div style={{fontSize:32,fontWeight:700,lineHeight:1,color:`var(--${maxCls === 'low' ? 'green' : maxCls === 'med' ? 'amber' : 'red'})`}}>{maxQ}</div>
                <div style={{fontSize:13,color:'var(--text-faint)',marginTop:4}}>MJ/m2</div>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:3,color:`var(--${maxCls === 'low' ? 'green' : maxCls === 'med' ? 'amber' : 'red'})`}}>{getLbl(maxQ)}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.5}}>
                  Maior carga entre as divisoes.{' '}
                  {maxCls==='low'&&'Extintores e saidas obrigatorios.'}
                  {maxCls==='med'&&'Hidrantes e sinalizacao obrigatorios. Avaliar sprinkler conforme altura.'}
                  {maxCls==='high'&&'Sistemas ativos obrigatorios. Sprinkler e deteccao exigidos (NT 42/2019).'}
                </div>
              </div>
            </div>
          </div>
        )}
      </>}
    </div>
  )
}