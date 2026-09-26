import { useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import Icon from '../ui/Icon'
import EstruturaSection from '../ui/EstruturaSection'
import EstruturaHeaderInfo from '../ui/EstruturaHeaderInfo'
import FormSection from '../ui/FormSection'

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
  section: 'max-w-[980px] mx-auto pt-8 px-10 pb-20',
  header: 'mb-8',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
}

// ── Bloco de carga de incendio de uma unica estrutura ──────────────────
function EstruturaCarga({ est, divMap, keys, cargaDaEst, dispatch, ocupacoes, cnaesDiv }) {
  const setMetodo = (code, metodo) => {
    const changes = { metodo }
    if (metodo === 'tabela') {
      // Reseta para carga do CNAE configurado
      const cnae = divMap[code]?.cnae
      const cargaCNAE = cnae ? cnaesDiv(code)[cnae]?.cargaIncendio : null
      changes.valorManual = ''
      changes.cargaIncendio = cargaCNAE || null
    }
    dispatch({ type:'SET_CARGA', estruturaId: est.id, code, changes })
  }

  const setValor = (code, v) => {
    dispatch({ type:'SET_CARGA', estruturaId: est.id, code, changes:{ valorManual: v } })
  }

  const getCarga = (code) => {
    const st = cargaDaEst[code]
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
    <EstruturaSection titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>
      {keys.length === 0 ? (
        <div className="ibox amber"><Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/><span>Nenhuma divisao configurada nesta estrutura.</span></div>
      ) : <>
        <div className="border border-solid border-border rounded-lg overflow-hidden">
          {keys.map((code, i) => {
            const st = cargaDaEst[code] || { metodo:'tabela', valorManual:'' }
            const cnae = divMap[code]?.cnae
            const q = getCarga(code)
            const cls = q ? getCls(q) : null
            const semCNAE = !cnae
            const porLevantamento = st.metodo === 'levantamento'
            // Algumas divisoes (ex: J-1..J-4, varias do grupo M) nao tem
            // nenhum CNAE cadastrado na base normativa — a carga ja vem
            // definida no proprio nome da divisao, e o usuario preenche por
            // levantamento. Pra essas, o aviso de "volte a etapa 4" nunca
            // seria resolvivel, entao nem aparece.
            const temCnaeDisponivel = Object.keys(cnaesDiv(code)).length > 0
            const descCnae = cnae ? (divMap[code]?.cnaeDesc || cnaesDiv(code)[cnae]?.descricao || '') : ''

            return (
              <div key={code} className={`py-4 px-5 grid grid-cols-[minmax(0,1fr)_auto] gap-x-8 gap-y-3 items-center ${i < keys.length - 1 ? 'border-b border-solid border-border-2' : ''}`}>
                {/* Identificacao: divisao (principal), CNAE e pavimentos (apoio) */}
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-ink leading-[1.35]">
                    <span className="font-mono text-[12px] text-ink-faint mr-2">{code}</span>{getDivLabel(code)}
                  </div>
                  {cnae ? (
                    <div className="text-[12px] text-ink-muted leading-[1.5] mt-1.5">
                      <span className="font-mono text-ink-faint mr-1.5">{cnae}</span>{descCnae}
                    </div>
                  ) : temCnaeDisponivel && (
                    <div className="text-[12px] text-amber mt-1.5">Sem CNAE configurado — volte a etapa 4</div>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-hint mt-1.5">
                    <Icon name="stair" size={12}/>{divMap[code]?.pavs?.join(', ')}
                  </div>
                </div>

                {/* Carga: metodo, valor e classe */}
                <div className="flex flex-col items-end gap-2.5">
                  <div className="inline-flex p-0.5 rounded-md bg-surface-2 border border-solid border-border" role="group" aria-label="Método de determinação da carga">
                    {[['tabela', 'Tabela', 'Por tabela normativa'], ['levantamento', 'Levantamento', 'Por levantamento']].map(([valor, rotulo, dica]) => (
                      <button
                        key={valor}
                        type="button"
                        title={dica}
                        aria-pressed={st.metodo === valor}
                        onClick={() => setMetodo(code, valor)}
                        className={`py-1 px-3 rounded text-[11px] font-medium border-0 cursor-pointer transition-colors duration-150 ${st.metodo === valor ? 'bg-white/[.10] text-ink' : 'bg-transparent text-ink-faint hover:text-ink-muted'}`}
                      >{rotulo}</button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {cls && <span className={`carga-class ${cls}`}>{getLbl(porLevantamento ? (parseFloat(st.valorManual) || 0) : (q || 0))}</span>}
                    <div className="flex items-baseline gap-1.5">
                      {porLevantamento ? (
                        <input type="number" value={st.valorManual} onChange={e => setValor(code, e.target.value)}
                          className="w-[96px] text-right" placeholder="0" aria-label={`Carga de incêndio de ${code}`}/>
                      ) : (
                        <span className={`text-[22px] font-bold leading-none tabular-nums ${!cls ? 'text-ink-faint' : cls === 'low' ? 'text-green' : cls === 'med' ? 'text-amber' : 'text-red'} ${semCNAE ? 'opacity-50' : ''}`}>{q ?? '—'}</span>
                      )}
                      <span className="text-[11px] text-ink-faint whitespace-nowrap">MJ/m²</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Com mais de uma divisao, destaca qual define a estrutura (o valor
              unico ja aparece na propria linha e a classe, no cabecalho). */}
          {keys.length > 1 && maxQ > 0 && (
            <div className="py-3 px-5 bg-surface-2 border-t border-solid border-border-2 flex items-center justify-between gap-4 text-[12px]">
              <span className="text-ink-muted">Maior carga da estrutura</span>
              <span className={`font-semibold ${maxCls === 'low' ? 'text-green' : maxCls === 'med' ? 'text-amber' : 'text-red'}`}>{maxQ} MJ/m² — {getLbl(maxQ)}</span>
            </div>
          )}
        </div>
      </>}
    </EstruturaSection>
  )
}

export default function Step5({ step, totalSteps }) {
  const { state, dispatch } = useProjeto()
  const { ocupacoes, cnaesDiv } = useNorma()

  const estruturasDivs = state.estruturas.map(est => {
    const pavsEst = state.pavimentos.filter(p => p.estruturaId === est.id)
    const divMap = collectDivs(pavsEst)
    return { est, divMap, keys: Object.keys(divMap) }
  })

  const initDepsKey = estruturasDivs.map(e => `${e.est.id}:${e.keys.join('|')}`).join(';')

  useEffect(() => {
    estruturasDivs.forEach(({ est, keys }) => {
      if (keys.length) dispatch({ type:'INIT_CARGA', estruturaId: est.id, divisoes: keys })
    })
  }, [initDepsKey])

  // Mantem o cargaIncendio salvo em sincronia com o CNAE da divisao quando o
  // metodo e "tabela". Sem isso, o valor so fica gravado quando o usuario
  // mexe manualmente no seletor de metodo (ver setMetodo em EstruturaCarga) —
  // se o CNAE ja estava configurado antes da divisao nascer aqui (INIT_CARGA
  // sempre inicia com cargaIncendio: null), o numero mostrado nesta tela fica
  // certo (getCarga recalcula ao vivo), mas o valor persistido continua nulo,
  // e riscoDoPavimento (usado por Extintores e Brigada) le so o valor salvo —
  // o risco aparece como "nao classificado" mesmo com o CNAE preenchido.
  const cargaSnapshotKey = estruturasDivs.map(({ est, keys, divMap }) => keys.map(code => {
    const st = (state.cargaState[est.id] || {})[code]
    return `${est.id}.${code}=${divMap[code]?.cnae || ''}:${st?.metodo || ''}:${st?.cargaIncendio ?? ''}`
  }).join(',')).join(';')

  useEffect(() => {
    estruturasDivs.forEach(({ est, keys, divMap }) => {
      keys.forEach(code => {
        const st = (state.cargaState[est.id] || {})[code]
        if (!st || st.metodo !== 'tabela') return
        const cnae = divMap[code]?.cnae
        if (!cnae) return
        const resolvido = cnaesDiv(code)[cnae]?.cargaIncendio
        if (resolvido != null && resolvido !== st.cargaIncendio) {
          dispatch({ type: 'SET_CARGA', estruturaId: est.id, code, changes: { cargaIncendio: resolvido } })
        }
      })
    })
  }, [cargaSnapshotKey])

  const totalDivisoes = estruturasDivs.reduce((acc, e) => acc + e.keys.length, 0)

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa {step} de {totalSteps}</div>
        <h2 className={S.title}>Carga de Incendio</h2>
        <p className={S.desc}>A carga de incendio de cada divisao e determinada pelo CNAE configurado na etapa anterior, classificada por estrutura. Por tabela: valor normativo automatico. Por levantamento: campo livre.</p>
      </div>

      <div className="ibox blue">
        <Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/>
        <span>Divisoes sem CNAE configurado nao terao carga automatica. Volte a etapa 4 para configurar o CNAE de cada pavimento.</span>
      </div>

      {totalDivisoes === 0 ? (
        <div className="ibox amber"><Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/><span>Nenhuma divisao configurada.</span></div>
      ) : (
        <FormSection title="Carga por divisao" extra={<span className="text-[11px] text-ink-hint">gerado da classificacao, por estrutura</span>}>
          {estruturasDivs.map(({ est, divMap, keys }) => (
            <EstruturaCarga
              key={est.id}
              est={est}
              divMap={divMap}
              keys={keys}
              cargaDaEst={state.cargaState[est.id] || {}}
              dispatch={dispatch}
              ocupacoes={ocupacoes}
              cnaesDiv={cnaesDiv}
            />
          ))}
        </FormSection>
      )}
    </div>
  )
}
