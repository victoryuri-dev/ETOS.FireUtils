import { useProjeto } from '../../context/ProjetoContext'
import Icon from '../ui/Icon'

const S = {
  section: 'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',
  header: 'mb-[26px]',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
  block: 'mb-[26px]',
  blockTitle: 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border',
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

  const optClass = (sel) =>
    `border border-solid ${sel ? 'border-red-border bg-red-dim' : 'border-border bg-transparent'} rounded-md py-3.5 px-4 cursor-pointer flex items-center gap-3`

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa 2 de 8</div>
        <h2 className={S.title}>Edificacao</h2>
        <p className={S.desc}>Situacao e dados dimensionais da edificacao. O numero de pavimentos informado aqui gera automaticamente os cards de classificacao na etapa 5.</p>
      </div>

      {/* Situacao: nova ou existente */}
      <div className={S.block}>
        <div className={S.blockTitle}>Situacao</div>
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          {[
            { k:'nova',      icon:'newbld', t:'Edificacao nova',      s:'Em projeto ou construcao' },
            { k:'existente', icon:'oldbld', t:'Edificacao existente', s:'Regularizacao / adequacao' },
          ].map(o => (
            <div key={o.k} className={optClass(state.situacao === o.k)}
              onClick={() => dispatch({ type:'SET_FIELD', field:'situacao', value:o.k })}>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${state.situacao===o.k ? 'bg-red-dim text-red' : 'bg-white/5 text-ink-faint'}`}>
                <Icon name={o.icon} size={17}/>
              </div>
              <div>
                <div className={`text-[13px] font-medium ${state.situacao===o.k ? 'text-red' : 'text-ink-muted'}`}>{o.t}</div>
                <div className="text-[11px] text-ink-faint mt-0.5">{o.s}</div>
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
            <div className="ibox amber mt-2">
              <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
              <span>Para edificacoes existentes o CBMMA pode aceitar medidas compensatorias. Documente as condicoes atuais com precisao.</span>
            </div>
            <div className="g2 mb-3">
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
            <div className="g2 mb-3">
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
      <div className={S.block}>
        <div className={S.blockTitle}>Dimensoes</div>
        <div className="g2 mb-3">
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
        <div key={i} className={`ibox ${m.t} mb-2.5`}>
          <Icon name={m.i} size={14} color={`var(--color-${m.t})`} className="shrink-0"/>
          <span>{m.txt}</span>
        </div>
      ))}

      {/* Estrutura */}
      <div className={S.block}>
        <div className={S.blockTitle}>Sistema construtivo</div>
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
