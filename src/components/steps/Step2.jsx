import { useState, useEffect } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import Icon from '../ui/Icon'
import FormSection from '../ui/FormSection'
import SwitchToggle from '../ui/SwitchToggle'

const S = {
  section: 'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',
  header: 'mb-8',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
}

const ALERTAS = (h, sub) => {
  const m = []
  if (h > 0  && h <= 6)  m.push({ t:'green', i:'check', txt:'Edificacao terrea — Classe: Terrea.' })
  if (h > 6  && h <= 12) m.push({ t:'green', i:'check', txt:'Altura 6-12 m — Classe: Baixa altura.' })
  if (h > 12 && h <= 23) m.push({ t:'amber', i:'warn',  txt:'Altura acima de 12 m — Classe: Media altura. Verifique exigencia de escada enclausurada.' })
  if (h > 23 && h <= 30) m.push({ t:'amber', i:'warn',  txt:'Altura acima de 23 m — Classe: Media-alta. Escada pressurizada geralmente exigida.' })
  if (h > 30)            m.push({ t:'red',   i:'warn',  txt:'Altura acima de 30 m — Classe: Alta. Exigencias maximas.' })
  if (sub > 0)           m.push({ t:'amber', i:'warn',  txt:'Subsolo(s) declarado(s) — a classificacao de uso sera feita no Step 5.' })
  return m
}

const MATERIAIS_ESTRUTURA = ['Concreto armado', 'Estrutura metalica', 'Alvenaria estrutural', 'Madeira']

// ── Modal de edicao de uma Estrutura (torre/bloco) ─────────────────────
function EstruturaModal({ est, index, dispatch, onClose }) {
  const set = f => e => dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field: f, value: e.target.value })

  const h   = parseFloat(est.alturaPisoPiso) || 0
  const sub = parseInt(est.nSubsolos)        || 0

  // Normaliza dado antigo (string unica) salvo antes do campo virar multi-selecao.
  const materiais = Array.isArray(est.estrutura) ? est.estrutura : [est.estrutura].filter(Boolean)
  const toggleMaterial = (m) => {
    const next = materiais.includes(m) ? materiais.filter(x => x !== m) : [...materiais, m]
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'estrutura', value: next })
  }

  // Predio terreo (1 pavimento acima do solo): a altura piso a piso (piso de
  // descarga ao ultimo pavimento habitado) e 0 sem subsolo, ou igual a
  // profundidade do subsolo quando ele existe — o "ultimo pavimento" e o
  // proprio terreo, entao a medida parte do subsolo (item 4.31, NT 03 CBMMA).
  const alturaTerrea = (novoSub, novaProfundidade) => novoSub > 0 ? novaProfundidade : 0

  const handleNPav = e => {
    const v = parseInt(e.target.value) || 1
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'nPavimentos', value:v })
    dispatch({ type:'REBUILD_PAVIMENTOS', estruturaId: est.id, nPav:v, nSub:sub })
    if (v === 1) {
      dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaTerrea(sub, est.profundidadeSubsolo) })
    } else if (parseInt(est.nPavimentos) === 1) {
      dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value:'' })
    }
  }
  const handleNSub = e => {
    const v = parseInt(e.target.value) || 0
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'nSubsolos', value:v })
    dispatch({ type:'REBUILD_PAVIMENTOS', estruturaId: est.id, nPav: est.nPavimentos, nSub:v })
    if (parseInt(est.nPavimentos) === 1) {
      dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaTerrea(v, est.profundidadeSubsolo) })
    }
  }
  const handleProfundidade = e => {
    const v = e.target.value
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'profundidadeSubsolo', value:v })
    if (parseInt(est.nPavimentos) === 1) {
      dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaTerrea(sub, v) })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[500] bg-black/65 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-solid border-border rounded-lg w-[560px] max-w-[96vw] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.55)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 py-[18px] px-[22px] border-b border-solid border-border shrink-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <input
              value={est.nome}
              onChange={e => dispatch({ type:'RENAME_ESTRUTURA', id: est.id, nome: e.target.value })}
              placeholder={`Estrutura ${index + 1}`}
              title="Clique para renomear a estrutura"
              className="bg-transparent border-0 border-b border-dashed border-border-2 hover:border-ink-hint focus:border-red-border outline-none text-base font-bold text-ink px-0 py-0.5 w-auto min-w-0 flex-1 transition-colors"
            />
            <Icon name="edit" size={12} className="text-ink-hint shrink-0"/>
          </div>
          <button className="btn-ghost p-1.5 shrink-0" onClick={onClose}>
            <Icon name="x" size={14}/>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-5 px-[22px]">
          <div className="mb-3.5">
            <div className="text-[10px] font-medium text-ink-faint uppercase tracking-[.06em] mb-2">Dimensoes</div>
            <div className="g3 mb-3">
              <div className="fg"><label>Area construida total (m2) <span className="req">*</span></label><input type="number" value={est.areaTotal} onChange={set('areaTotal')}/></div>
              <div className="fg"><label>Altura total (m) <span className="req">*</span></label><input type="number" step="0.1" value={est.altura} onChange={set('altura')}/></div>
              <div className="fg">
                <label>Altura piso a piso (m) <span className="req">*</span></label>
                <input type="number" step="0.1" value={est.alturaPisoPiso ?? ''} onChange={set('alturaPisoPiso')} readOnly={parseInt(est.nPavimentos) === 1}/>
              </div>
            </div>
            <div className="g2">
              <div className="fg"><label>No de pavimentos acima do solo <span className="req">*</span></label><input type="number" min="1" max="50" value={est.nPavimentos} onChange={handleNPav}/></div>
              <div className="fg"><label>No de subsolos</label><input type="number" min="0" value={est.nSubsolos} onChange={handleNSub}/></div>
            </div>
            {sub > 0 && (
              <div className="g2 mt-3">
                <div className="fg">
                  <label>Profundidade do subsolo (m) <span className="req">*</span></label>
                  <input type="number" step="0.1" min="0" value={est.profundidadeSubsolo ?? ''} onChange={handleProfundidade}/>
                </div>
              </div>
            )}
          </div>

          {ALERTAS(h, sub).map((m, i) => (
            <div key={i} className={`ibox ${m.t} mb-2.5`}>
              <Icon name={m.i} size={14} color={`var(--color-${m.t})`} className="shrink-0"/>
              <span>{m.txt}</span>
            </div>
          ))}

          <div>
            <div className="text-[10px] font-medium text-ink-faint uppercase tracking-[.06em] mb-2">Sistema construtivo</div>
            <div className="fg">
              <label>Estrutura principal <span className="req">*</span></label>
              <div className="flex flex-wrap gap-2 mt-1">
                {MATERIAIS_ESTRUTURA.map(m => (
                  <button key={m} type="button" onClick={() => toggleMaterial(m)}
                    className={`text-xs py-1.5 px-3 rounded-md border border-solid cursor-pointer ${materiais.includes(m) ? 'border-red-border bg-red-dim text-red font-semibold' : 'border-border bg-transparent text-ink-faint'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {materiais.length > 1 && (
                <div className="text-[11px] text-ink-faint mt-1.5">Estrutura mista — a metodologia de cada material sera citada no memorial.</div>
              )}
              {materiais.length === 0 && (
                <div className="text-[11px] text-amber mt-1.5">Selecione ao menos um material estrutural.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-3.5 px-[22px] border-t border-solid border-border flex justify-end shrink-0">
          <button className="btn-primary" onClick={onClose}>Concluir</button>
        </div>
      </div>
    </div>
  )
}

// ── Card resumo de uma Estrutura ────────────────────────────────────────
function EstruturaCard({ est, index, canRemove, dispatch, onOpen }) {
  const a   = parseFloat(est.areaTotal) || 0
  const sub = parseInt(est.nSubsolos)   || 0
  const alturaPPPreenchida = est.alturaPisoPiso !== '' && est.alturaPisoPiso != null
  const configured = !!(est.areaTotal && est.altura) && alturaPPPreenchida

  return (
    <div
      onClick={onOpen}
      className={`bg-surface-2 rounded-lg mb-2 cursor-pointer transition-colors duration-150 border border-solid hover:border-red-border ${configured ? 'border-[rgba(192,21,42,.25)]' : 'border-border'}`}
    >
      <div className="flex items-center justify-between py-3 px-4">
        {/* Left: icone + nome + resumo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-md border border-solid flex items-center justify-center shrink-0 ${configured ? 'bg-red-dim border-red-border text-red' : 'bg-surface border-border text-ink-faint'}`}>
            <Icon name="newbld" size={15}/>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink mb-[3px]">{est.nome || `Estrutura ${index + 1}`}</div>
            {configured ? (
              <div className="flex flex-wrap gap-x-3 gap-y-[3px]">
                <span className="text-[11px] text-ink-faint">{a} m² construida</span>
                <span className="text-[11px] text-ink-faint">{parseInt(est.nPavimentos) === 1 ? 'Terrea' : `${est.nPavimentos} pavimentos`}</span>
                {sub > 0 && (
                  <span className="text-[11px] text-ink-faint">{sub} subsolo{sub > 1 ? 's' : ''}</span>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-ink-faint">Clique para preencher</div>
            )}
          </div>
        </div>

        {/* Right: remover + seta */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {canRemove && (
            <button
              className="btn-del"
              onClick={e => { e.stopPropagation(); dispatch({ type:'REMOVE_ESTRUTURA', id: est.id }) }}
              title="Remover estrutura"
            >
              <Icon name="trash" size={12}/>
            </button>
          )}
          <div className="text-ink-faint">
            <Icon name="chevD" size={14} className="-rotate-90"/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Step2() {
  const { state, dispatch } = useProjeto()
  const [openId, setOpenId] = useState(null)
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })

  const optClass = (sel) =>
    `border border-solid ${sel ? 'border-red-border bg-red-dim' : 'border-border bg-transparent'} rounded-md py-3.5 px-4 cursor-pointer flex items-center gap-3`

  const openEst = state.estruturas.find(e => e.id === openId)
  const openIndex = state.estruturas.findIndex(e => e.id === openId)

  // Soma das areas construidas de cada estrutura — usada como valor da area
  // construida total quando o switch "somar das estruturas" esta ligado.
  const somaEstruturas = state.estruturas.reduce((s, e) => s + (parseFloat(e.areaTotal) || 0), 0)
  const somaEstruturasStr = somaEstruturas ? String(somaEstruturas) : ''

  // O switch nao e persistido (o projeto so guarda o valor final de
  // areaConstruidaTotal, nunca "como" ele foi calculado) — ao abrir o
  // projeto, comeca ligado se o valor salvo ja bate com a soma das
  // estruturas (sinal de que foi preenchido assim da ultima vez) e
  // desligado caso contrario (valor manual, possivelmente maior que a soma
  // — ex.: area complementar computada junto). O usuario ainda liga/desliga
  // livremente durante a sessao.
  const [areaAuto, setAreaAuto] = useState(() => {
    const total = parseFloat(state.areaConstruidaTotal) || 0
    return somaEstruturas > 0 && total === somaEstruturas
  })

  // Mantem areaConstruidaTotal sincronizada com a soma enquanto o switch
  // estiver ligado — assim quem le state.areaConstruidaTotal em outras telas
  // (memorial, etc.) nao precisa saber que ela pode vir de uma soma.
  useEffect(() => {
    if (areaAuto && state.areaConstruidaTotal !== somaEstruturasStr) {
      dispatch({ type:'SET_FIELD', field:'areaConstruidaTotal', value: somaEstruturasStr })
    }
  }, [areaAuto, somaEstruturasStr])

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa 2 de 7</div>
        <h2 className={S.title}>Edificacao</h2>
        <p className={S.desc}>Situacao da edificacao e as estruturas (torres/blocos) que a compoem. Clique em uma estrutura para editar suas dimensoes e sistema construtivo — o numero de pavimentos de cada uma gera automaticamente os cards de classificacao na etapa 4.</p>
      </div>

      {/* Situacao: nova ou existente */}
      <FormSection title="Situacao">
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
      </FormSection>

      {/* Terreno e area construida (parametros globais do projeto) */}
      <FormSection title="Terreno e area construida">
        <div className="g2 mb-3">
          <div className="fg"><label>Area do terreno (m2)</label><input type="number" value={state.areaTerreno} onChange={set('areaTerreno')}/></div>
          <div className="fg">
            <label>
              Area construida total (m2)
              <span className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] text-ink-faint normal-case font-normal whitespace-nowrap">Somar das estruturas</span>
                <SwitchToggle checked={areaAuto} onChange={setAreaAuto}/>
              </span>
            </label>
            <input
              type="number"
              value={areaAuto ? somaEstruturasStr : state.areaConstruidaTotal}
              onChange={set('areaConstruidaTotal')}
              readOnly={areaAuto}
              className={areaAuto ? 'opacity-70 cursor-not-allowed' : ''}
              title={areaAuto ? 'Somada automaticamente das estruturas — desligue o switch pra editar manualmente' : undefined}
            />
          </div>
        </div>
        <div className="g2">
          <div className="fg"><label>Quantidade de publico</label><input type="number" value={state.quantidadePublico} onChange={set('quantidadePublico')} placeholder="Lotacao maxima estimada"/></div>
          <div className="fg"><label>Area complementar (m2)</label><input type="number" value={state.areaComplementar} onChange={set('areaComplementar')} placeholder="Area de risco nao habitavel"/></div>
        </div>
      </FormSection>

      {/* Estruturas */}
      <FormSection title="Estruturas">
        {state.estruturas.map((est, i) => (
          <EstruturaCard key={est.id} est={est} index={i} canRemove={state.estruturas.length > 1} dispatch={dispatch} onOpen={() => setOpenId(est.id)}/>
        ))}
        <button className="btn-add" onClick={() => dispatch({ type:'ADD_ESTRUTURA' })}>
          <Icon name="plus" size={11}/> Adicionar estrutura
        </button>
      </FormSection>

      {openEst && <EstruturaModal est={openEst} index={openIndex} dispatch={dispatch} onClose={() => setOpenId(null)}/>}
    </div>
  )
}
