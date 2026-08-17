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
  section: 'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',
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

            return (
              <div key={code} className={`py-3.5 px-4 ${i < keys.length - 1 ? 'border-b border-solid border-border-2' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="py-[3px] px-2 rounded font-bold text-[12px] font-mono border border-solid bg-red-dim border-red-border text-red shrink-0">{code}</span>
                      <span className="text-[14px] text-ink font-bold">{getDivLabel(code)}</span>
                    </div>
                    <div className="text-[11px] text-ink-faint mt-1.5">
                      {cnae
                        ? <><span className="font-mono text-red">{cnae}</span> — {divMap[code]?.cnaeDesc || cnaesDiv(code)[cnae]?.descricao || ''}</>
                        : <span className="text-amber">Sem CNAE configurado — volte a etapa 4</span>
                      }
                    </div>
                    <div className="text-[11px] text-ink-hint mt-1">{divMap[code]?.pavs?.join(', ')}</div>
                  </div>
                  {cls && <span className={`carga-class ${cls} shrink-0`}>{getLbl(st.metodo === 'levantamento' ? (parseFloat(st.valorManual)||0) : (q||0))}</span>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={st.metodo} onChange={e => setMetodo(code, e.target.value)}
                    className="bg-surface-2 border border-solid border-border text-ink text-[11px] py-1.5 px-2.5 rounded-md outline-none w-auto">
                    <option value="tabela">Por tabela normativa</option>
                    <option value="levantamento">Por levantamento</option>
                  </select>
                  {st.metodo === 'levantamento' ? (
                    <div className="flex items-center gap-1.5">
                      <input type="number" value={st.valorManual} onChange={e => setValor(code, e.target.value)}
                        className="w-[90px] text-right" placeholder="0"/>
                      <span className="text-xs text-ink-faint whitespace-nowrap">MJ/m2</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className={`w-[90px] text-right py-2.5 px-3 bg-surface-2 border border-solid border-border rounded-md text-[13px] ${semCNAE ? 'text-ink-faint opacity-50' : 'text-ink opacity-100'}`}>
                        {q ?? '—'}
                      </div>
                      <span className="text-xs text-ink-faint whitespace-nowrap">MJ/m2</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo da estrutura */}
        {maxQ > 0 && (
          <div className="bg-surface-2 border border-solid border-border rounded-lg py-3.5 px-5 flex items-center gap-5 mt-3">
            <div>
              <div className={`text-[26px] font-bold leading-none ${maxCls === 'low' ? 'text-green' : maxCls === 'med' ? 'text-amber' : 'text-red'}`}>{maxQ}</div>
              <div className="text-[11px] text-ink-faint mt-1">MJ/m2</div>
            </div>
            <div>
              <div className={`text-[13px] font-semibold mb-[3px] ${maxCls === 'low' ? 'text-green' : maxCls === 'med' ? 'text-amber' : 'text-red'}`}>{getLbl(maxQ)}</div>
              <div className="text-xs text-ink-muted leading-[1.5]">Maior carga entre as divisoes desta estrutura.</div>
            </div>
          </div>
        )}
      </>}
    </EstruturaSection>
  )
}

export default function Step5() {
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

  const totalDivisoes = estruturasDivs.reduce((acc, e) => acc + e.keys.length, 0)

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa 5 de 7</div>
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
