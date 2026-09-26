import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import Icon from '../ui/Icon'
import EstruturaSection from '../ui/EstruturaSection'
import EstruturaHeaderInfo from '../ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

const SIST_CONFIG = [
  { key:'acesso_viatura',      icon:'van',         label:'Acesso de Viatura em Edificacoes'   },
  { key:'seg_estrutural',      icon:'wallFire',    label:'Seg. Estrutural Contra Incendio'    },
  { key:'compart_horizontal',  icon:'wallCompart', label:'Compartimentacao Horizontal'        },
  { key:'compart_vertical',    icon:'stair',       label:'Compartimentacao Vertical'          },
  { key:'controle_acabamento', icon:'sign',        label:'Controle de Materiais de Acabamento'},
  { key:'saida_emergencia',    icon:'exit',        label:'Saida de Emergencia'                },
  { key:'gerenciamento_risco', icon:'warn',        label:'Gerenciamento de Risco de Incendio' },
  { key:'brigada',             icon:'shieldAlert', label:'Brigada de Incendio'                },
  { key:'iluminacao',          icon:'sun',         label:'Iluminacao de Emergencia'           },
  { key:'sinalizacao',         icon:'sign',        label:'Sinalizacao de Emergencia'          },
  { key:'extintores',          icon:'ext',         label:'Protecao por Extintores'            },
  { key:'hidrantes',           icon:'drop',        label:'Hidrantes / Mangotinho'             },
  { key:'alarme',              icon:'bellElectric',label:'Alarme de Incendio'                 },
  { key:'deteccao',            icon:'alarmSmoke',  label:'Deteccao de Incendio'               },
  { key:'sprinklers',          icon:'spray',       label:'Chuveiros Automaticos'              },
  { key:'controle_fumaca',     icon:'flame',       label:'Controle de Fumaca'                 },
  { key:'central_gas',         icon:'info',        label:'Central de Gas'                     },
  { key:'spda',                icon:'warn',        label:'SPDA'                                },
]

// Projeto "apenas dimensionamento" (ver ProjetoContext.jsx tipoProjeto) só
// dimensiona esses 3 sistemas — os outros nem entram no wizard reduzido
// (Step2/Classificação/Carga de Incêndio ficam mais simples, sem dado
// suficiente pra decidir obrigatoriedade dos demais). sprinklers ainda não
// tem tela de dimensionamento própria (cai no MedidaPage genérico — ver
// App.jsx), mas já fica disponível como sistema, igual no modo completo.
const SIST_CONFIG_DIMENSIONAMENTO = [
  { key:'saida_emergencia', icon:'exit', label:'Saida de Emergencia'      },
  { key:'hidrantes',        icon:'drop', label:'Hidrantes / Mangotinho'   },
  { key:'sprinklers',       icon:'spray',label:'Chuveiros Automaticos'    },
]

const RISCOS_CONFIG = [
  { key:'liquidos_inflamaveis', icon:'flame',    label:'Armazenamento de liquidos inflamaveis' },
  { key:'fogos_artificio',      icon:'warn',     label:'Armazenamento ou revenda de fogos de artificio' },
  { key:'glp',                  icon:'drop',     label:'Uso de Gas Liquefeito de Petroleo' },
  { key:'vasos_pressao',        icon:'settings', label:'Vasos sob pressao (caldeiras)' },
  { key:'produtos_perigosos',   icon:'warn',     label:'Armazenamento de produtos perigosos' },
  { key:'outros',               icon:'info',     label:'Outros (especificar)' },
]

const RISCOS_DEFAULT = {
  liquidos_inflamaveis: false, fogos_artificio: false, glp: false,
  vasos_pressao: false, produtos_perigosos: false, outros: false,
}

const blockTitle = 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border'

// ── Card com dados de uma estrutura usados na dosagem das medidas ───────
function EstruturaResumo({ pe }) {
  const { classificacao, gruposFaltantes } = pe
  const { subsidiarias } = classificacao

  return (
    <div className="border border-solid border-border rounded-lg p-4 mb-3">
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

// ── Grid de medidas de seguranca de uma estrutura ───────────────────────
// Obrigatorio nao trava mais o clique: o usuario pode desativar por conta e
// risco proprios (ex.: medida compensatoria, dispensa em analise) — o card
// so muda de "vermelho solido" pra "vermelho contorno" (continua sinalizando
// que a norma exige), nunca vira verde/neutro como um opcional.
function MedidasGrid({ pe, dispatch, sistConfig }) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(max(170px, calc((100% - 24px) / 4)), 1fr))' }}
    >
      {sistConfig.map(s => {
        const sist = pe.sistemas[s.key] || { obrigatorio: false, ativo: false }
        const on    = sist.ativo
        const obrig = sist.obrigatorio

        const toneClass = obrig
          ? (on ? 'border-red-border bg-red-dim' : 'border-red-border bg-transparent')
          : (on ? 'border-green-border bg-green-dim' : 'border-border bg-transparent')
        // O estado aparece so na cor do simbolo (sem caixa, fundo nem texto de status):
        // ligado = vermelho (obrigatoria) ou verde (opcional); desligado = cinza. A borda
        // vermelha do cartao marca o que a norma exige (ver legenda). Cor via prop, nao
        // classe: os simbolos proprios do Icon fixam a cor inline.
        const iconColor = on ? (obrig ? 'var(--color-red)' : '#2FBF92') : 'rgba(255,255,255,.35)'
        const labelClass = on || obrig ? 'text-ink' : 'text-ink-muted'

        return (
          <div key={s.key}
            onClick={() => dispatch({ type:'TOGGLE_SISTEMA_ESTRUTURA', estruturaId: pe.estrutura.id, key:s.key })}
            role="switch"
            aria-checked={on}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dispatch({ type:'TOGGLE_SISTEMA_ESTRUTURA', estruturaId: pe.estrutura.id, key:s.key }) } }}
            title={on ? 'Habilitada' : 'Desabilitada'}
            className={`group border border-solid rounded-md p-3.5 flex items-center relative cursor-pointer transition-[border-color,background-color,transform,box-shadow] duration-150 motion-safe:hover:-translate-y-[2px] hover:shadow-[0_10px_22px_rgba(0,0,0,.3)] ${toneClass}`}>
            {/* Simbolo + nome, alinhados */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon name={SISTEMA_ICON[s.key] || s.icon} size={26} color={iconColor} className="shrink-0"/>
              <div className={`min-w-0 [overflow-wrap:anywhere] text-xs font-medium leading-[1.3] ${labelClass}`}>
                {s.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Grid de riscos especiais de uma estrutura ───────────────────────────
function RiscosGrid({ estruturaId, riscos, outrosDesc, dispatch }) {
  return (
    <>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(max(170px, calc((100% - 24px) / 4)), 1fr))' }}
      >
        {RISCOS_CONFIG.map(r => {
          const on = !!riscos[r.key]
          const alternar = () => dispatch({ type:'TOGGLE_RISCO_ESTRUTURA', estruturaId, key:r.key })
          // Mesmo desenho das medidas: o estado esta na cor do proprio simbolo
          // (ligado = vermelho, desligado = cinza), sem caixa nem marcador.
          return (
            <div key={r.key}
              role="switch"
              aria-checked={on}
              tabIndex={0}
              onClick={alternar}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar() } }}
              className={`border border-solid rounded-md p-3.5 flex items-center gap-2.5 cursor-pointer transition-[border-color,background-color] duration-150 ${on ? 'border-red-border bg-red-dim' : 'border-border bg-transparent'}`}>
              <Icon name={r.icon} size={26} color={on ? 'var(--color-red)' : 'rgba(255,255,255,.35)'} className="shrink-0"/>
              <div className={`min-w-0 [overflow-wrap:anywhere] text-xs font-medium leading-[1.3] ${on ? 'text-ink' : 'text-ink-muted'}`}>{r.label}</div>
            </div>
          )
        })}
      </div>
      {riscos.outros && (
        <div className="fg mt-3">
          <label>Descreva o risco especial</label>
          <input value={outrosDesc} onChange={e => dispatch({ type:'SET_RISCO_OUTROS_DESC', estruturaId, value:e.target.value })}/>
        </div>
      )}
    </>
  )
}

export default function Step6({ step, totalSteps }) {
  const { state, dispatch } = useProjeto()
  const { porEstrutura } = useMedidasObrigatorias()
  const dimensionamento = state.tipoProjeto === 'dimensionamento'
  const sistConfig = dimensionamento ? SIST_CONFIG_DIMENSIONAMENTO : SIST_CONFIG

  return (
    <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">
      <div className="mb-[26px]">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">Etapa {step} de {totalSteps}</div>
        <h2 className="text-[22px] font-semibold text-ink mb-[5px]">Medidas de Seguranca contra Incendio</h2>
        <p className="text-[13px] text-ink-faint leading-[1.6]">Sistemas e riscos especiais identificados por estrutura, com base na area construida, altura e ocupacao de cada uma. Obrigatorios podem ser desativados manualmente, mas continuam sinalizados em vermelho.</p>
      </div>

      {/* Legenda: o estado esta na cor do simbolo de cada medida */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 text-[11px] text-ink-faint">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-red"/>
          Obrigatória (exigida pela norma)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-[#2FBF92]"/>
          Opcional
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-[rgba(255,255,255,.35)]"/>
          Desabilitada
        </div>
      </div>

      {porEstrutura.map(pe => {
        const est = pe.estrutura
        const riscos = state.riscosEspeciaisPorEstrutura[est.id] || RISCOS_DEFAULT
        const outrosDesc = state.riscosOutrosDescPorEstrutura[est.id] || ''

        return (
          <EstruturaSection key={est.id} titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>
            {(pe.classificacao.subsidiarias.length > 0 || pe.gruposFaltantes.length > 0) && (
              <div className="mb-4">
                <div className={blockTitle}>Dados usados na dosagem</div>
                <EstruturaResumo pe={pe}/>
              </div>
            )}

            <div className="mb-6">
              <MedidasGrid pe={pe} dispatch={dispatch} sistConfig={sistConfig}/>
            </div>

            {/* Riscos especiais alimentam o Anexo B (NT 01) — sem sentido
                num projeto "apenas dimensionamento", que nem gera esse
                documento (ver DocumentosPage.jsx). */}
            {!dimensionamento && (
              <div>
                <div className={blockTitle}>Riscos especiais</div>
                <p className="text-[13px] text-ink-faint leading-[1.6] mb-3">Marque os riscos especiais presentes nesta estrutura ou area de risco, conforme Anexo B da NT 01.</p>
                <RiscosGrid estruturaId={est.id} riscos={riscos} outrosDesc={outrosDesc} dispatch={dispatch}/>
              </div>
            )}
          </EstruturaSection>
        )
      })}
    </div>
  )
}
