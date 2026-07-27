import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import Icon from '../ui/Icon'

const SIST_CONFIG = [
  { key:'acesso_viatura',      icon:'exit',    label:'Acesso de Viatura em Edificacoes'   },
  { key:'seg_estrutural',      icon:'newbld',  label:'Seg. Estrutural Contra Incendio'    },
  { key:'compart_vertical',    icon:'stair',   label:'Compartimentacao Vertical'          },
  { key:'controle_acabamento', icon:'sign',    label:'Controle de Materiais de Acabamento'},
  { key:'saida_emergencia',    icon:'exit',    label:'Saida de Emergencia'                },
  { key:'gerenciamento_risco', icon:'warn',    label:'Gerenciamento de Risco de Incendio' },
  { key:'brigada',             icon:'drop',    label:'Brigada de Incendio'                },
  { key:'iluminacao',          icon:'sun',     label:'Iluminacao de Emergencia'           },
  { key:'sinalizacao',         icon:'sign',    label:'Sinalizacao de Emergencia'          },
  { key:'extintores',          icon:'ext',     label:'Protecao por Extintores'            },
  { key:'hidrantes',           icon:'drop',    label:'Hidrantes / Mangotinho'             },
  { key:'alarme',              icon:'bell',    label:'Alarme de Incendio'                 },
  { key:'deteccao',            icon:'sensor',  label:'Deteccao de Incendio'               },
  { key:'sprinklers',          icon:'spray',   label:'Chuveiros Automaticos'              },
  { key:'controle_fumaca',     icon:'flame',   label:'Controle de Fumaca'                 },
  { key:'central_gas',         icon:'info',    label:'Central de Gas'                     },
  { key:'spda',                icon:'warn',    label:'SPDA'                                },
]

const RISCOS_CONFIG = [
  { key:'liquidos_inflamaveis', icon:'flame',    label:'Armazenamento de liquidos inflamaveis' },
  { key:'fogos_artificio',      icon:'warn',     label:'Armazenamento ou revenda de fogos de artificio' },
  { key:'glp',                  icon:'drop',     label:'Uso de Gas Liquefeito de Petroleo' },
  { key:'vasos_pressao',        icon:'settings', label:'Vasos sob pressao (caldeiras)' },
  { key:'produtos_perigosos',   icon:'warn',     label:'Armazenamento de produtos perigosos' },
  { key:'outros',               icon:'info',     label:'Outros (especificar)' },
]

const blockTitle = 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border'
const divTag = (mista) => `py-[3px] px-2.5 rounded font-bold text-[12px] font-mono border border-solid ${mista ? 'bg-amber-dim border-amber-border text-amber' : 'bg-red-dim border-red-border text-red'}`

// ── Card com dados de uma estrutura usados na dosagem das medidas ───────
function EstruturaResumo({ pe }) {
  const { estrutura: est, areaEstrutura, alturaEstrutura, classificacao, gruposFaltantes } = pe
  const { principaisDivs, subsidiarias, edificacaoMista, mistaDivs, temOcupacoes } = classificacao

  return (
    <div className="border border-solid border-border rounded-lg p-4 mb-3">
      <div className="text-[13px] font-semibold text-ink mb-3">{est.nome}</div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Area construida</div>
          <div className="text-[13px] font-medium text-ink">{areaEstrutura ? `${areaEstrutura} m2` : '—'}</div>
        </div>
        <div>
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Altura piso a piso</div>
          <div className="text-[13px] font-medium text-ink">{alturaEstrutura ? `${alturaEstrutura} m` : '—'}</div>
        </div>
        <div>
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">
            {edificacaoMista ? 'Ocupacao mista' : 'Ocupacao principal'}
          </div>
          {temOcupacoes ? (
            <div className="flex gap-1 flex-wrap">
              {(edificacaoMista ? mistaDivs : principaisDivs).map(d => (
                <span key={d} className={divTag(edificacaoMista)}>{d}</span>
              ))}
            </div>
          ) : <div className="text-[13px] text-ink-hint">—</div>}
        </div>
      </div>

      {subsidiarias.length > 0 && (
        <div className="mb-1">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">
            {subsidiarias.length === 1 ? 'Ocupacao secundaria' : 'Ocupacoes secundarias'}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {subsidiarias.map(d => (
              <span key={d} className="py-[3px] px-2.5 rounded font-semibold text-xs font-mono bg-surface border border-solid border-border text-ink-muted">{d}</span>
            ))}
          </div>
        </div>
      )}

      {gruposFaltantes.length > 0 && (
        <div className="ibox amber mt-2 mb-0">
          <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
          <span>
            Dados normativos completos (processo normal) ainda nao cadastrados nesta versao para o(s) grupo(s) <strong>{gruposFaltantes.join(', ')}</strong> nesta estrutura.
            Exigencias minimas de referencia foram aplicadas — confirme manualmente com o CBMMA.
          </span>
        </div>
      )}
    </div>
  )
}

export default function Step6() {
  const { state, dispatch } = useProjeto()
  const { porEstrutura, sistemas } = useMedidasObrigatorias()

  return (
    <div className="max-w-[720px] mx-auto px-12 pt-[34px] pb-24">
      <div className="mb-[26px]">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">Etapa 6 de 7</div>
        <h2 className="text-[22px] font-semibold text-ink mb-[5px]">Medidas de Seguranca contra Incendio</h2>
        <p className="text-[13px] text-ink-faint leading-[1.6]">Sistemas identificados com base na area construida, altura e ocupacao de cada estrutura. Obrigatorios nao podem ser removidos.</p>
      </div>

      {/* Dados usados na dosagem, por estrutura */}
      <div className="mb-[26px]">
        <div className={blockTitle}>Estruturas consideradas</div>
        {porEstrutura.map(pe => (
          <EstruturaResumo key={pe.estrutura.id} pe={pe}/>
        ))}
      </div>

      <div className="ibox red">
        <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
        <span>Sistemas <strong className="text-red">obrigatorios</strong> sao definidos pela NT 42/2019 CBMMA para a ocupacao, altura e area de cada estrutura. Sistemas opcionais podem ser habilitados conforme necessidade tecnica.</span>
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
          const sist = sistemas[s.key] || { obrigatorio: false, ativo: false }
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

      {/* Riscos especiais */}
      <div className="mt-[26px]">
        <div className={blockTitle}>Riscos especiais</div>
        <p className="text-[13px] text-ink-faint leading-[1.6] mb-3">Marque os riscos especiais presentes na edificacao ou area de risco, conforme Anexo B da NT 01.</p>
        <div className="grid grid-cols-3 gap-2">
          {RISCOS_CONFIG.map(r => {
            const on = !!state.riscosEspeciais?.[r.key]
            return (
              <div key={r.key}
                onClick={() => dispatch({ type:'TOGGLE_RISCO', key:r.key })}
                className={`border border-solid rounded-md p-3.5 flex flex-col gap-2 relative cursor-pointer transition-[border-color,background-color] duration-150 ${on ? 'border-green-border bg-green-dim' : 'border-border bg-transparent'}`}>
                <div className={`absolute top-[9px] right-[9px] w-4 h-4 rounded-full border border-solid flex items-center justify-center ${on ? 'bg-green border-green' : 'bg-transparent border-border'}`}>
                  {on && <Icon name="check" size={9} color="#fff"/>}
                </div>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${on ? 'bg-green-dim text-green' : 'bg-white/[.04] text-ink-faint'}`}>
                  <Icon name={r.icon} size={14}/>
                </div>
                <div className={`text-xs font-medium leading-[1.3] ${on ? 'text-green' : 'text-ink-muted'}`}>{r.label}</div>
              </div>
            )
          })}
        </div>
        {state.riscosEspeciais?.outros && (
          <div className="fg mt-3">
            <label>Descreva o risco especial</label>
            <input value={state.riscosOutrosDesc} onChange={e => dispatch({ type:'SET_FIELD', field:'riscosOutrosDesc', value:e.target.value })}/>
          </div>
        )}
      </div>
    </div>
  )
}
