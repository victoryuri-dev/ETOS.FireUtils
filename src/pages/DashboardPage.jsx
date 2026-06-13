import { useState } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { useNorma } from '../hooks/useNorma'
import Icon from '../components/ui/Icon'

// ── helpers ──────────────────────────────────────────────────────────
const getCargaCls = (q) => q <= 300 ? 'low' : q <= 1200 ? 'med' : 'high'
const getCargaLbl = (q) => q <= 300 ? 'Risco baixo · Classe I' : q <= 1200 ? 'Risco medio · Classe II' : 'Risco alto · Classe III/IV'
const fmtNum = (n) => n ? Number(n).toLocaleString('pt-BR') : '—'

const SIST_DISPLAY = [
  { key:'acesso_viatura',      icon:'exit',   label:'Acesso de Viatura' },
  { key:'seg_estrutural',      icon:'newbld', label:'Seg. Estrutural' },
  { key:'saida_emergencia',    icon:'exit',   label:'Saidas de Emergencia' },
  { key:'brigada',             icon:'drop',   label:'Brigada de Incendio' },
  { key:'iluminacao',          icon:'sun',    label:'Iluminacao de Emergencia' },
  { key:'sinalizacao',         icon:'sign',   label:'Sinalizacao de Emergencia' },
  { key:'extintores',          icon:'ext',    label:'Extintores' },
  { key:'hidrantes',           icon:'drop',   label:'Hidrantes / Mangotinho' },
  { key:'alarme',              icon:'bell',   label:'Alarme de Incendio' },
  { key:'deteccao',            icon:'sensor', label:'Deteccao de Incendio' },
  { key:'sprinklers',          icon:'spray',  label:'Chuveiros Automaticos' },
  { key:'controle_fumaca',     icon:'flame',  label:'Controle de Fumaca' },
  { key:'compart_vertical',    icon:'stair',  label:'Compartimentacao Vertical' },
  { key:'controle_acabamento', icon:'sign',   label:'Controle de Acabamento' },
  { key:'gerenciamento_risco', icon:'warn',   label:'Gerenciamento de Risco' },
  { key:'central_gas',         icon:'info',   label:'Central de Gas' },
  { key:'spda',                icon:'warn',   label:'SPDA' },
]

const CHECKLIST_ITEMS = [
  { id:'plantas',    label:'Plantas baixas do projeto (PDF)',          tag:'Obrigatorio' },
  { id:'memorial',   label:'Memorial descritivo',                      tag:'Obrigatorio' },
  { id:'art',        label:'ART do responsavel tecnico',               tag:'Obrigatorio' },
  { id:'cnpj',       label:'CNPJ / documentacao do proprietario',      tag:'Obrigatorio' },
  { id:'calc_hid',   label:'Memorial de calculo — hidrantes',          tag:'Obrigatorio' },
  { id:'calc_said',  label:'Memorial de calculo — saidas de emergencia',tag:'Obrigatorio' },
  { id:'laudo_cob',  label:'Laudo de cobertura (se aplicavel)',         tag:'Condicional' },
  { id:'alvara',     label:'Habite-se / alvara de construcao',         tag:'Obrigatorio' },
]

// ── subcomponentes ────────────────────────────────────────────────────

function StatCell({ label, value, unit, sub, subTag, subTagColor }) {
  return (
    <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'18px 22px',flex:1}}>
      <div style={{fontSize:11,color:'var(--text-faint)',marginBottom:8}}>{label}</div>
      <div style={{fontSize:30,fontWeight:700,color:'var(--text)',lineHeight:1}}>
        {value}<span style={{fontSize:14,fontWeight:400,color:'var(--text-faint)',marginLeft:4}}>{unit}</span>
      </div>
      {sub && (
        <div style={{fontSize:12,color:'var(--text-faint)',marginTop:6,display:'flex',alignItems:'center',gap:6}}>
          {sub}
          {subTag && (
            <span style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:20,
              background: subTagColor === 'green' ? 'var(--green-dim)' : subTagColor === 'amber' ? 'var(--amber-dim)' : 'var(--red-dim)',
              border: `.5px solid ${subTagColor === 'green' ? 'var(--green-border)' : subTagColor === 'amber' ? 'var(--amber-border)' : 'var(--red-border)'}`,
              color: `var(--${subTagColor || 'green'})`,
            }}>{subTag}</span>
          )}
        </div>
      )}
    </div>
  )
}

function InfoPanel({ title, icon, fields, onEdit }) {
  return (
    <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden',flex:1}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'.5px solid var(--border)'}}>
        <span style={{fontSize:12,fontWeight:500,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}>
          <Icon name={icon} size={13}/> {title}
        </span>
        {onEdit && (
          <button onClick={onEdit} style={{background:'none',border:'none',color:'var(--text-faint)',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
            <Icon name="settings" size={11}/> Editar
          </button>
        )}
      </div>
      <div style={{padding:'12px 16px'}}>
        {fields.map((f, i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom: i < fields.length-1 ? '.5px solid var(--border-2)' : 'none'}}>
            <span style={{fontSize:12,color:'var(--text-faint)'}}>{f.label}</span>
            <span style={{fontSize:f.big ? 20 : 13, fontWeight: f.big ? 700 : 500, color:'var(--text)'}}>{f.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SistemasGrid({ sistemas, onNavigate }) {
  const sistAtivos = SIST_DISPLAY.filter(s => sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio)
  return (
    <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'.5px solid var(--border)'}}>
        <span style={{fontSize:12,fontWeight:500,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}>
          <Icon name="drop" size={13}/> Sistemas de seguranca
        </span>
        <span style={{fontSize:11,color:'var(--text-faint)'}}>{sistAtivos.length} sistemas habilitados</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'var(--border)'}}>
        {SIST_DISPLAY.map(s => {
          const sist   = sistemas[s.key]
          const ativo  = sist?.ativo || sist?.obrigatorio
          const obrig  = sist?.obrigatorio
          if (!ativo) return null
          return (
            <div key={s.key}
              onClick={() => onNavigate && onNavigate(s.key)}
              style={{
                background:'var(--surface-2)', padding:'14px',
                cursor:'pointer', display:'flex', flexDirection:'column', gap:8,
                transition:'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
            >
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{width:26,height:26,borderRadius:'var(--radius-md)',
                  background: obrig ? 'var(--red-dim)' : 'var(--green-dim)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color: obrig ? 'var(--red)' : 'var(--green)'}}>
                  <Icon name={s.icon} size={13}/>
                </div>
                {/* Status: sem dimensionamento por enquanto = pendente */}
                <span style={{fontSize:9,fontWeight:600,padding:'2px 6px',borderRadius:20,
                  background:'var(--amber-dim)',border:'.5px solid var(--amber-border)',color:'var(--amber)'}}>
                  Pendente
                </span>
              </div>
              <div style={{fontSize:11,fontWeight:500,color:'var(--text-muted)',lineHeight:1.3}}>{s.label}</div>
              <div style={{fontSize:10,color:'var(--text-hint)'}}>
                {obrig ? 'Obrigatorio — NT 42/2019' : 'Opcional habilitado'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressBar({ sistemas }) {
  const ativos  = SIST_DISPLAY.filter(s => sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio)
  const feitos  = 0 // dimensionamentos concluidos (sera populado quando o plugin integrar)
  const pct     = ativos.length > 0 ? (feitos / ativos.length) * 100 : 0

  return (
    <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'16px 20px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:500,color:'var(--text-muted)'}}>Completude do projeto</span>
        <span style={{fontSize:12,color:'var(--text-faint)'}}>{feitos} de {ativos.length} sistemas dimensionados</span>
      </div>
      <div style={{height:6,background:'var(--border)',borderRadius:99,marginBottom:14,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:'var(--green)',borderRadius:99,transition:'width .4s'}}/>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {ativos.map(s => (
          <div key={s.key} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'var(--amber)'}}/>
            <span style={{fontSize:10,color:'var(--text-faint)'}}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Checklist() {
  const [checked, setChecked] = useState({})
  const total   = CHECKLIST_ITEMS.length
  const done    = Object.values(checked).filter(Boolean).length

  return (
    <div style={{background:'var(--surface-2)',border:'.5px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'.5px solid var(--border)'}}>
        <span style={{fontSize:12,fontWeight:500,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}>
          <Icon name="file" size={13}/> Documentacao para entrega
        </span>
        <span style={{fontSize:11,color:'var(--text-faint)'}}>{done} de {total} itens</span>
      </div>
      <div>
        {CHECKLIST_ITEMS.map((item) => {
          const ok = checked[item.id]
          return (
            <div key={item.id}
              onClick={() => setChecked(c => ({ ...c, [item.id]: !c[item.id] }))}
              style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',cursor:'pointer',borderBottom:'.5px solid var(--border-2)',transition:'background .1s'}}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{width:16,height:16,borderRadius:4,flexShrink:0,
                background: ok ? 'var(--green)' : 'transparent',
                border: `.5px solid ${ok ? 'var(--green)' : 'var(--border)'}`,
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                {ok && <Icon name="check" size={10} color="#fff"/>}
              </div>
              <span style={{flex:1,fontSize:13,color: ok ? 'var(--text-faint)' : 'var(--text)',textDecoration: ok ? 'line-through' : 'none'}}>
                {item.label}
              </span>
              <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,
                background: item.tag === 'Condicional' ? 'var(--amber-dim)' : 'var(--surface)',
                border:'.5px solid var(--border)',
                color: item.tag === 'Condicional' ? 'var(--amber)' : 'var(--text-faint)'}}>
                {item.tag}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardPage({ onGoConfig }) {
  const { state } = useProjeto()
  const { info, ocupacoes } = useNorma()

  // Dados derivados do state
  const sistemas   = state.sistemas || {}
  const maxQ       = Object.values(state.cargaState || {}).reduce((acc, c) => {
    const q = c?.metodo === 'levantamento' ? parseFloat(c?.valorManual) || 0 : c?.cargaIncendio || 0
    return Math.max(acc, q)
  }, 0)
  const cargaCls   = maxQ ? getCargaCls(maxQ) : null
  const cargaLbl   = maxQ ? getCargaLbl(maxQ) : null

  // Classificacao derivada dos pavimentos
  const grupos = {}
  ;(state.pavimentos || []).forEach(p => {
    if (!grupos[p.grupo]) grupos[p.grupo] = []
    if (!grupos[p.grupo].includes(p.divisao)) grupos[p.grupo].push(p.divisao)
  })
  const gruposStr = Object.keys(grupos).sort().join(', ') || '—'
  const divisoesStr = Object.values(grupos).flat().join(', ') || '—'

  const alturaNum  = parseFloat(state.altura) || 0
  const alturaLbl  = alturaNum <= 6 ? 'Terrea' : alturaNum <= 12 ? 'Baixa altura' : alturaNum <= 23 ? 'Media altura' : 'Alta'
  const alturaColor= alturaNum <= 12 ? 'green' : alturaNum <= 23 ? 'amber' : 'red'

  const isConfigurado = state.nome && state.uf && state.pavimentos?.length > 0

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden',background:'var(--bg)'}}>
      <div style={{flex:1,overflowY:'auto'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 40px 60px'}}>

          {/* Titulo do projeto */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24}}>
            <div>
              <h1 style={{fontSize:24,fontWeight:700,color:'var(--text)',marginBottom:6}}>
                {state.nome || 'Projeto sem nome'}
              </h1>
              <div style={{display:'flex',alignItems:'center',gap:12,fontSize:12,color:'var(--text-faint)'}}>
                <span style={{display:'flex',alignItems:'center',gap:4}}><Icon name="info" size={11}/>{state.cidade || '—'} — {state.uf || 'MA'}</span>
                <span style={{opacity:.3}}>·</span>
                <span>{info?.nome || 'NT 42/2019 CBMMA'}</span>
                {gruposStr !== '—' && <>
                  <span style={{opacity:.3}}>·</span>
                  <span>Grupos: {gruposStr}</span>
                </>}
              </div>
            </div>
            <button className="btn-primary" onClick={onGoConfig}>
              <Icon name="settings" size={13}/> Editar configuracao
            </button>
          </div>

          {/* Aviso se nao configurado */}
          {!isConfigurado && (
            <div className="ibox amber" style={{marginBottom:24}}>
              <Icon name="warn" size={14} color="var(--amber)" style={{flexShrink:0}}/>
              <span>Projeto nao configurado ainda. <button onClick={onGoConfig} style={{background:'none',border:'none',color:'var(--amber)',cursor:'pointer',fontWeight:600,textDecoration:'underline'}}>Clique aqui para configurar.</button></span>
            </div>
          )}

          {/* Barra de progresso */}
          <div style={{marginBottom:20}}>
            <ProgressBar sistemas={sistemas}/>
          </div>

          {/* Stats */}
          <div style={{display:'flex',gap:12,marginBottom:20}}>
            <StatCell
              label="Area construida"
              value={fmtNum(state.areaTotal)}
              unit="m2"
              sub={state.areaTerrero ? `Terreno: ${fmtNum(state.areaTerrero)} m2` : null}
            />
            <StatCell
              label="Altura da edificacao"
              value={state.altura || '—'}
              unit={state.altura ? 'm' : ''}
              sub={state.nPavimentos ? `${state.nPavimentos} pavimentos` : null}
              subTag={alturaNum ? alturaLbl : null}
              subTagColor={alturaColor}
            />
            <StatCell
              label="Carga de incendio"
              value={maxQ || '—'}
              unit={maxQ ? 'MJ/m2' : ''}
              subTag={cargaLbl}
              subTagColor={cargaCls === 'low' ? 'green' : cargaCls === 'med' ? 'amber' : cargaCls === 'high' ? 'red' : null}
            />
          </div>

          {/* Paineis de info */}
          <div style={{display:'flex',gap:12,marginBottom:20}}>
            <InfoPanel
              title="Classificacao"
              icon="settings"
              onEdit={onGoConfig}
              fields={[
                { label:'Grupos', value: gruposStr },
                { label:'Divisoes', value: divisoesStr },
                { label:'Situacao', value: state.situacao === 'nova' ? 'Edificacao nova' : state.situacao === 'existente' ? 'Edificacao existente' : '—' },
                { label:'Norma', value: info?.nome || 'NT 42/2019 CBMMA' },
              ]}
            />
            <InfoPanel
              title="Edificacao"
              icon="newbld"
              onEdit={onGoConfig}
              fields={[
                { label:'Altura total', value: state.altura ? `${state.altura} m` : '—', big:true },
                { label:'Pavimentos', value: state.nPavimentos || '—' },
                { label:'Subsolos', value: state.nSubsolos || 0 },
                { label:'Area construida', value: state.areaTotal ? `${fmtNum(state.areaTotal)} m2` : '—' },
                { label:'Estrutura', value: state.estrutura || '—' },
              ]}
            />
            <InfoPanel
              title="Responsaveis"
              icon="info"
              onEdit={onGoConfig}
              fields={[
                { label:'Proprietario', value: state.propNome || '—' },
                { label:'Responsavel pelo uso', value: state.respRazaoSocial || '—' },
                { label:'Projetista', value: state.rtNome || '—' },
                { label:'CREA / CAU', value: state.rtConselho || '—' },
              ]}
            />
          </div>

          {/* Sistemas de seguranca */}
          <div style={{marginBottom:20}}>
            <SistemasGrid sistemas={sistemas}/>
          </div>

          {/* Checklist documentacao */}
          <Checklist/>

        </div>
      </div>
    </div>
  )
}
