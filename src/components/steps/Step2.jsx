import { useProjeto } from '../../context/ProjetoContext'
import Icon from '../ui/Icon'

const S = {
  section:{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'},
  header:{marginBottom:26},
  stepLbl:{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5},
  title:{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5},
  desc:{fontSize:13,color:'var(--text-faint)',lineHeight:1.6},
  block:{marginBottom:26},
  blockTitle:{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)'},
}

const ALERTAS = (h, a, sub) => {
  const m = []
  if (h > 0  && h <= 6)  m.push({ t:'green', i:'check', txt:'Edificacao terrea — Classe: Terrea.' })
  if (h > 6  && h <= 12) m.push({ t:'green', i:'check', txt:'Altura 6-12 m — Classe: Baixa altura.' })
  if (h > 12 && h <= 23) m.push({ t:'amber', i:'warn',  txt:'Altura acima de 12 m — Classe: Media altura. Verifique exigencia de escada enclausurada.' })
  if (h > 23 && h <= 30) m.push({ t:'amber', i:'warn',  txt:'Altura acima de 23 m — Classe: Media-alta. Escada pressurizada geralmente exigida.' })
  if (h > 30)            m.push({ t:'red',   i:'warn',  txt:'Altura acima de 30 m — Classe: Alta. Exigencias maximas.' })
  if (a > 750)           m.push({ t:'amber', i:'info',  txt:'Area construida maior que 750 m2 — Sistema de hidrantes obrigatorio.' })
  if (sub > 0)           m.push({ t:'amber', i:'warn',  txt:'Subsolo(s) declarado(s) — a classificacao de uso sera feita no Step 5.' })
  return m
}

export default function Step2() {
  const { state, dispatch } = useProjeto()
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })

  const h   = parseFloat(state.altura)    || 0
  const a   = parseFloat(state.areaTotal) || 0
  const sub = parseInt(state.nSubsolos)   || 0

  const handleNPav = e => {
    const v = parseInt(e.target.value) || 1
    dispatch({ type:'SET_FIELD', field:'nPavimentos', value:v })
    dispatch({ type:'REBUILD_PAVIMENTOS', nPav:v, nSub:sub })
  }
  const handleNSub = e => {
    const v = parseInt(e.target.value) || 0
    dispatch({ type:'SET_FIELD', field:'nSubsolos', value:v })
    dispatch({ type:'REBUILD_PAVIMENTOS', nPav:state.nPavimentos, nSub:v })
  }

  const optStyle = (sel) => ({
    border:`.5px solid ${sel ? 'var(--red-border)' : 'var(--border)'}`,
    borderRadius:'var(--radius-md)', padding:'14px 16px', cursor:'pointer',
    display:'flex', alignItems:'center', gap:12,
    background: sel ? 'var(--red-dim)' : 'transparent',
  })

  return (
    <div style={S.section}>
      <div style={S.header}>
        <div style={S.stepLbl}>Etapa 2 de 8</div>
        <h2 style={S.title}>Edificacao</h2>
        <p style={S.desc}>Situacao e dados dimensionais da edificacao. O numero de pavimentos informado aqui gera automaticamente os cards de classificacao na etapa 5.</p>
      </div>

      {/* Situacao: nova ou existente */}
      <div style={S.block}>
        <div style={S.blockTitle}>Situacao</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14}}>
          {[
            { k:'nova',      icon:'newbld', t:'Edificacao nova',      s:'Em projeto ou construcao' },
            { k:'existente', icon:'oldbld', t:'Edificacao existente', s:'Regularizacao / adequacao' },
          ].map(o => (
            <div key={o.k} style={optStyle(state.situacao === o.k)}
              onClick={() => dispatch({ type:'SET_FIELD', field:'situacao', value:o.k })}>
              <div style={{width:32,height:32,borderRadius:'var(--radius-md)',background:state.situacao===o.k?'var(--red-dim)':'rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'center',color:state.situacao===o.k?'var(--red)':'var(--text-faint)',flexShrink:0}}>
                <Icon name={o.icon} size={17}/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:state.situacao===o.k?'var(--red)':'var(--text-muted)'}}>{o.t}</div>
                <div style={{fontSize:11,color:'var(--text-faint)',marginTop:2}}>{o.s}</div>
              </div>
            </div>
          ))}
        </div>

        {state.situacao === 'nova' && (
          <div className="g2">
            <div className="fg"><label>Ano previsto de conclusao</label><input type="number" value={state.anoAlvara} onChange={set('anoAlvara')} placeholder="2027"/></div>
            <div className="fg"><label>Numero do alvara</label><input value={state.numeroAlvara} onChange={set('numeroAlvara')}/></div>
          </div>
        )}

        {state.situacao === 'existente' && (
          <>
            <div className="ibox amber" style={{marginTop:8}}>
              <Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/>
              <span>Para edificacoes existentes o CBMMA pode aceitar medidas compensatorias. Documente as condicoes atuais com precisao.</span>
            </div>
            <div className="g2" style={{marginBottom:12}}>
              <div className="fg"><label>Ano de construcao</label><input type="number" value={state.anoConstrucao} onChange={set('anoConstrucao')} placeholder="Ex: 1998"/></div>
              <div className="fg"><label>Situacao perante o CBMMA</label>
                <select value={state.situacaoCBM} onChange={set('situacaoCBM')}>
                  <option>Sem AVCB anterior</option>
                  <option>AVCB vencido</option>
                  <option>AVCB em vigor — renovacao</option>
                  <option>Em regularizacao</option>
                </select>
              </div>
            </div>
            <div className="g2" style={{marginBottom:12}}>
              <div className="fg"><label>No do AVCB anterior</label><input value={state.numeroAVCB} onChange={set('numeroAVCB')}/></div>
              <div className="fg"><label>Validade do AVCB</label><input type="date" value={state.validadeAVCB} onChange={set('validadeAVCB')}/></div>
            </div>
            <div className="fg">
              <label>Condicoes atuais relevantes para o PPCI</label>
              <textarea value={state.condicoesAtuais} onChange={set('condicoesAtuais')} placeholder="Descreva brevemente..."/>
            </div>
          </>
        )}
      </div>

      {/* Dimensoes */}
      <div style={S.block}>
        <div style={S.blockTitle}>Dimensoes</div>
        <div className="g2" style={{marginBottom:12}}>
          <div className="fg"><label>Area construida total (m2) <span className="req">*</span></label><input type="number" value={state.areaTotal} onChange={set('areaTotal')}/></div>
          <div className="fg"><label>Area do terreno (m2)</label><input type="number" value={state.areaTerrero} onChange={set('areaTerrero')}/></div>
        </div>
        <div className="g3">
          <div className="fg"><label>Altura total (m) <span className="req">*</span></label><input type="number" step="0.1" value={state.altura} onChange={set('altura')}/></div>
          <div className="fg"><label>No de pavimentos acima do solo <span className="req">*</span></label><input type="number" min="1" max="50" value={state.nPavimentos} onChange={handleNPav}/></div>
          <div className="fg"><label>No de subsolos</label><input type="number" min="0" value={state.nSubsolos} onChange={handleNSub}/></div>
        </div>
      </div>

      {/* Alertas contextuais */}
      {ALERTAS(h, a, sub).map((m, i) => (
        <div key={i} className={`ibox ${m.t}`} style={{marginBottom:10}}>
          <Icon name={m.i} size={14} color={`var(--${m.t})`} style={{flexShrink:0}}/>
          <span>{m.txt}</span>
        </div>
      ))}

      {/* Estrutura */}
      <div style={S.block}>
        <div style={S.blockTitle}>Sistema construtivo</div>
        <div className="g2">
          <div className="fg"><label>Estrutura principal</label>
            <select value={state.estrutura} onChange={set('estrutura')}>
              <option>Concreto armado</option>
              <option>Estrutura metalica</option>
              <option>Alvenaria estrutural</option>
              <option>Madeira</option>
              <option>Misto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
