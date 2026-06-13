import { useProjeto } from '../../context/ProjetoContext'
import Icon from '../ui/Icon'

const SIST_CONFIG = [
  { key:'acesso_viatura',      icon:'exit',    label:'Acesso de Viatura em Edificacoes',  obrig:true  },
  { key:'seg_estrutural',      icon:'newbld',  label:'Seg. Estrutural Contra Incendio',    obrig:true  },
  { key:'compart_vertical',    icon:'stair',   label:'Compartimentacao Vertical',          obrig:false },
  { key:'controle_acabamento', icon:'sign',    label:'Controle de Materiais de Acabamento',obrig:false },
  { key:'saida_emergencia',    icon:'exit',    label:'Saida de Emergencia',                obrig:true  },
  { key:'gerenciamento_risco', icon:'warn',    label:'Gerenciamento de Risco de Incendio', obrig:false },
  { key:'brigada',             icon:'drop',    label:'Brigada de Incendio',                obrig:true  },
  { key:'iluminacao',          icon:'sun',     label:'Iluminacao de Emergencia',           obrig:true  },
  { key:'sinalizacao',         icon:'sign',    label:'Sinalizacao de Emergencia',          obrig:true  },
  { key:'extintores',          icon:'ext',     label:'Protecao por Extintores',            obrig:true  },
  { key:'hidrantes',           icon:'drop',    label:'Hidrantes / Mangotinho',             obrig:false },
  { key:'alarme',              icon:'bell',    label:'Alarme de Incendio',                 obrig:false },
  { key:'deteccao',            icon:'sensor',  label:'Deteccao de Incendio',               obrig:false },
  { key:'sprinklers',          icon:'spray',   label:'Chuveiros Automaticos',              obrig:false },
  { key:'controle_fumaca',     icon:'flame',   label:'Controle de Fumaca',                 obrig:false },
  { key:'central_gas',         icon:'info',    label:'Central de Gas',                     obrig:false },
  { key:'spda',                icon:'warn',    label:'SPDA',                               obrig:false },
]

// Estado inicial expandido para todos os sistemas
const SISTEMAS_INIT = Object.fromEntries(
  SIST_CONFIG.map(s => [s.key, { obrigatorio: s.obrig, ativo: s.obrig }])
)

export default function Step7() {
  const { state, dispatch } = useProjeto()

  // Garante que todos os sistemas existam no state
  const sistemas = { ...SISTEMAS_INIT, ...state.sistemas }

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'}}>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5}}>Etapa 7 de 8</div>
        <h2 style={{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5}}>Medidas de Seguranca contra Incendio</h2>
        <p style={{fontSize:13,color:'var(--text-faint)',lineHeight:1.6}}>Sistemas identificados com base nas configuracoes anteriores. Obrigatorios nao podem ser removidos.</p>
      </div>

      <div className="ibox red">
        <Icon name="warn" size={14} color="var(--red)" style={{flexShrink:0}}/>
        <span>Sistemas <strong style={{color:'var(--red)'}}>obrigatorios</strong> sao definidos pela NT 42/2019 CBMMA para esta ocupacao, altura e area. Sistemas opcionais podem ser habilitados conforme necessidade tecnica.</span>
      </div>

      {/* Legenda */}
      <div style={{display:'flex',gap:16,marginBottom:20,fontSize:11,color:'var(--text-faint)'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--red)'}}/>
          Obrigatorio (NT 42/2019)
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--green)'}}/>
          Opcional habilitado
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--border)',border:'.5px solid var(--border)'}}/>
          Opcional desabilitado
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {SIST_CONFIG.map(s => {
          const sist = sistemas[s.key] || { obrigatorio: s.obrig, ativo: s.obrig }
          const on    = sist.ativo
          const obrig = sist.obrigatorio

          return (
            <div key={s.key}
              onClick={() => !obrig && dispatch({ type:'TOGGLE_SISTEMA', key:s.key })}
              style={{
                border:`.5px solid ${obrig ? 'var(--red-border)' : on ? 'var(--green-border)' : 'var(--border)'}`,
                borderRadius:'var(--radius-md)', padding:13, cursor:obrig?'default':'pointer',
                display:'flex', flexDirection:'column', gap:8,
                background: obrig ? 'var(--red-dim)' : on ? 'var(--green-dim)' : 'transparent',
                position:'relative', transition:'border-color .15s, background .15s',
              }}>
              {/* Checkbox no canto */}
              <div style={{position:'absolute',top:9,right:9,width:16,height:16,borderRadius:'50%',
                background: obrig ? 'var(--red)' : on ? 'var(--green)' : 'transparent',
                border:`.5px solid ${obrig ? 'var(--red)' : on ? 'var(--green)' : 'var(--border)'}`,
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                {(on || obrig) && <Icon name="check" size={9} color="#fff"/>}
              </div>
              {/* Icone */}
              <div style={{width:28,height:28,borderRadius:'var(--radius-md)',
                background: obrig ? 'var(--red-dim)' : on ? 'var(--green-dim)' : 'rgba(255,255,255,.04)',
                display:'flex',alignItems:'center',justifyContent:'center',
                color: obrig ? 'var(--red)' : on ? 'var(--green)' : 'var(--text-faint)'}}>
                <Icon name={s.icon} size={14}/>
              </div>
              {/* Nome */}
              <div style={{fontSize:12,fontWeight:500,color: obrig ? 'var(--red)' : on ? 'var(--green)' : 'var(--text-muted)',lineHeight:1.3}}>
                {s.label}
              </div>
              {/* Status */}
              <div style={{fontSize:10,color: obrig ? 'rgba(192,21,42,.6)' : on ? 'rgba(29,158,117,.65)' : 'var(--text-hint)'}}>
                {obrig ? 'Obrigatorio — NT 42/2019' : on ? 'Opcional — habilitado' : 'Opcional — desabilitado'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
