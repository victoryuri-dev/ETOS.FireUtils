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
    <div className="max-w-[720px] mx-auto px-12 pt-[34px] pb-24">
      <div className="mb-[26px]">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">Etapa 7 de 8</div>
        <h2 className="text-[22px] font-semibold text-ink mb-[5px]">Medidas de Seguranca contra Incendio</h2>
        <p className="text-[13px] text-ink-faint leading-[1.6]">Sistemas identificados com base nas configuracoes anteriores. Obrigatorios nao podem ser removidos.</p>
      </div>

      <div className="ibox red">
        <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
        <span>Sistemas <strong className="text-red">obrigatorios</strong> sao definidos pela NT 42/2019 CBMMA para esta ocupacao, altura e area. Sistemas opcionais podem ser habilitados conforme necessidade tecnica.</span>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 mb-5 text-[11px] text-ink-faint">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red"/>
          Obrigatorio (NT 42/2019)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green"/>
          Opcional habilitado
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border border border-solid border-border"/>
          Opcional desabilitado
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SIST_CONFIG.map(s => {
          const sist = sistemas[s.key] || { obrigatorio: s.obrig, ativo: s.obrig }
          const on    = sist.ativo
          const obrig = sist.obrigatorio

          return (
            <div key={s.key}
              onClick={() => !obrig && dispatch({ type:'TOGGLE_SISTEMA', key:s.key })}
              className={`border border-solid rounded-md p-3.5 flex flex-col gap-2 relative transition-[border-color,background-color] duration-150 ${obrig ? 'cursor-default border-red-border bg-red-dim' : on ? 'cursor-pointer border-green-border bg-green-dim' : 'cursor-pointer border-border bg-transparent'}`}>
              {/* Checkbox no canto */}
              <div className={`absolute top-[9px] right-[9px] w-4 h-4 rounded-full border border-solid flex items-center justify-center ${obrig ? 'bg-red border-red' : on ? 'bg-green border-green' : 'bg-transparent border-border'}`}>
                {(on || obrig) && <Icon name="check" size={9} color="#fff"/>}
              </div>
              {/* Icone */}
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${obrig ? 'bg-red-dim text-red' : on ? 'bg-green-dim text-green' : 'bg-white/[.04] text-ink-faint'}`}>
                <Icon name={s.icon} size={14}/>
              </div>
              {/* Nome */}
              <div className={`text-xs font-medium leading-[1.3] ${obrig ? 'text-red' : on ? 'text-green' : 'text-ink-muted'}`}>
                {s.label}
              </div>
              {/* Status */}
              <div className={`text-[10px] ${obrig ? 'text-[rgba(192,21,42,.6)]' : on ? 'text-[rgba(29,158,117,.65)]' : 'text-ink-hint'}`}>
                {obrig ? 'Obrigatorio — NT 42/2019' : on ? 'Opcional — habilitado' : 'Opcional — desabilitado'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
