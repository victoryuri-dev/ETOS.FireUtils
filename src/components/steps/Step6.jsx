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
  section: 'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',
  header: 'mb-[26px]',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
  block: 'mb-[26px]',
  blockTitle: 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border flex items-center justify-between',
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
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa 6 de 8</div>
        <h2 className={S.title}>Carga de Incendio</h2>
        <p className={S.desc}>A carga de incendio de cada divisao e determinada pelo CNAE configurado na etapa anterior. Por tabela: valor normativo automatico. Por levantamento: campo livre.</p>
      </div>

      <div className="ibox blue">
        <Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/>
        <span>Divisoes sem CNAE configurado nao terao carga automatica. Volte a etapa 5 para configurar o CNAE de cada pavimento.</span>
      </div>

      {keys.length === 0 ? (
        <div className="ibox amber"><Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/><span>Nenhuma divisao configurada.</span></div>
      ) : <>
        <div className={S.block}>
          <div className={S.blockTitle}>
            <span>Carga por divisao</span>
            <span className="text-[11px] text-ink-hint normal-case font-normal">gerado da classificacao</span>
          </div>
          {keys.map(code => {
            const st = state.cargaState[code] || { metodo:'tabela', valorManual:'' }
            const cnae = divMap[code]?.cnae
            const q = getCarga(code)
            const cls = q ? getCls(q) : null
            const semCNAE = !cnae

            return (
              <div key={code} className="py-3 border-b border-solid border-border-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="text-[13px] text-ink font-medium">
                      <span className="font-mono text-red mr-1.5">{code}</span>
                      {getDivLabel(code)}
                    </div>
                    <div className="text-[11px] text-ink-faint mt-0.5">
                      {cnae
                        ? <><span className="font-mono text-red">{cnae}</span> — {divMap[code]?.cnaeDesc || cnaesDiv(code)[cnae]?.descricao || ''}</>
                        : <span className="text-amber">Sem CNAE configurado — volte a etapa 5</span>
                      }
                    </div>
                    <div className="text-[11px] text-ink-hint mt-0.5">{divMap[code]?.pavs?.join(', ')}</div>
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
                    {cls && <span className={`carga-class ${cls}`}>{getLbl(st.metodo === 'levantamento' ? (parseFloat(st.valorManual)||0) : (q||0))}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo */}
        {maxQ > 0 && (
          <div className={S.block}>
            <div className={S.blockTitle}>Carga representativa da edificacao</div>
            <div className="bg-surface-2 border border-solid border-border rounded-lg py-4 px-5 flex items-center gap-5">
              <div>
                <div className={`text-[32px] font-bold leading-none ${maxCls === 'low' ? 'text-green' : maxCls === 'med' ? 'text-amber' : 'text-red'}`}>{maxQ}</div>
                <div className="text-[13px] text-ink-faint mt-1">MJ/m2</div>
              </div>
              <div>
                <div className={`text-sm font-semibold mb-[3px] ${maxCls === 'low' ? 'text-green' : maxCls === 'med' ? 'text-amber' : 'text-red'}`}>{getLbl(maxQ)}</div>
                <div className="text-xs text-ink-muted leading-[1.5]">
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
