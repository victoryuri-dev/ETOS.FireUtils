import Obrigatorio from '../ui/Obrigatorio'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProjeto } from '../../context/ProjetoContext'
import { getEstadosDisponiveis } from '../../data/normas/index'
import { alturaEdificacaoBase } from '../../data/trrf_calc'
import { resumoEstrutura } from '../../data/resumoEstrutura'
import Icon from '../ui/Icon'
import FormSection from '../ui/FormSection'
import SwitchToggle from '../ui/SwitchToggle'
import InfoTip from '../ui/InfoTip'
import { Chip } from '../ui/EstruturaHeaderInfo'
import { fmtUn } from '../../utils/numero'

const S = {
  section: 'max-w-[980px] mx-auto pt-8 px-10 pb-20',
  header: 'mb-8',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
}

// ── Modal de edicao de uma Estrutura (torre/bloco) ─────────────────────
function EstruturaModal({ est, index, dispatch, onClose }) {
  const set = f => e => dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field: f, value: e.target.value })

  const nPav   = parseInt(est.nPavimentos) || 1
  const sub    = parseInt(est.nSubsolos)   || 0
  const resumo = resumoEstrutura(est)

  // Altura calculada e sempre bloqueada — soma Profundidade do subsolo +
  // Altura da edificacao. Predio terreo (1 pavimento acima do solo) nao tem
  // o campo "Altura da edificacao" na tela (o proprio terreo e o "ultimo
  // pavimento"): a soma vira so a profundidade do subsolo, ou 0 sem subsolo
  // — mesma excecao do item 4.31, NT 03 CBMMA, ja embutida em
  // alturaEdificacaoBase (ver trrf_calc.js, usada tambem na classificacao
  // de TRRF, pra nunca ter duas fontes de verdade sobre essa altura).
  const alturaPisoPisoSoma = candidato => {
    const base = alturaEdificacaoBase(candidato)
    const nPavCand = parseInt(candidato.nPavimentos) || 1
    return nPavCand === 1 ? base : (parseFloat(candidato.profundidadeSubsolo) || 0) + base
  }

  const handleNPav = e => {
    const v = parseInt(e.target.value) || 1
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'nPavimentos', value:v })
    dispatch({ type:'REBUILD_PAVIMENTOS', estruturaId: est.id, nPav:v, nSub:sub })
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaPisoPisoSoma({ ...est, nPavimentos:v }) })
  }
  const handleNSub = e => {
    const v = parseInt(e.target.value) || 0
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'nSubsolos', value:v })
    dispatch({ type:'REBUILD_PAVIMENTOS', estruturaId: est.id, nPav: est.nPavimentos, nSub:v })
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaPisoPisoSoma({ ...est, nSubsolos:v }) })
  }
  const handleProfundidade = e => {
    const v = e.target.value
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'profundidadeSubsolo', value:v })
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaPisoPisoSoma({ ...est, profundidadeSubsolo:v }) })
  }
  const handleAlturaEdificacao = e => {
    const v = e.target.value
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaEdificacao', value:v })
    dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'alturaPisoPiso', value: alturaPisoPisoSoma({ ...est, alturaEdificacao:v }) })
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
            <Obrigatorio id={`${est.id}.nome`}/><Icon name="edit" size={12} className="text-ink-hint shrink-0"/>
          </div>
          <button className="btn-ghost p-1.5 shrink-0" onClick={onClose}>
            <Icon name="x" size={14}/>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-5 px-[22px]">
          <div className="mb-3.5">
            <div className="text-[10px] font-medium text-ink-faint uppercase tracking-[.06em] mb-2">Dimensoes</div>
            <div className="g2 mb-3">
              <div className="fg"><label>Area construida total (m2) <Obrigatorio id={`${est.id}.areaTotal`}/></label><input type="number" value={est.areaTotal} onChange={set('areaTotal')}/></div>
              <div className="fg">
                <label>Altura total (m) <Obrigatorio id={`${est.id}.altura`}/><InfoTip text="medida entre o nível do solo ao ponto mais alto da edificação"/></label>
                <input type="number" step="0.1" value={est.altura} onChange={set('altura')}/>
              </div>

            </div>
            <div className="g2">
              <div className="fg"><label>No de pavimentos acima do solo <Obrigatorio id={`${est.id}.nPavimentos`}/></label><input type="number" min="1" max="50" value={est.nPavimentos} onChange={handleNPav}/></div>
              <div className="fg"><label>No de subsolos</label><input type="number" min="0" value={est.nSubsolos} onChange={handleNSub}/></div>
            </div>
            {(sub > 0 || nPav > 1) && (
              <div className="g2 mt-3">
                {sub > 0 && (
                  <div className="fg">
                    <label>Profundidade do subsolo (m) <Obrigatorio id={`${est.id}.profundidadeSubsolo`}/><InfoTip text="medida entre o piso de descarga da edificação ao piso do subsolo"/></label>
                    <input type="number" step="0.1" min="0" value={est.profundidadeSubsolo ?? ''} onChange={handleProfundidade}/>
                  </div>
                )}
                {nPav > 1 && (
                  <div className="fg">
                    <label>Altura da edificação (m) <Obrigatorio id={`${est.id}.alturaEdificacao`}/><InfoTip text="medida entre o nível do piso de descarga ao piso do último pavimento"/></label>
                    <input type="number" step="0.1" min="0" value={est.alturaEdificacao ?? ''} onChange={handleAlturaEdificacao}/>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-md border border-solid border-border bg-surface-2 p-4 mt-4">
            <dl className="space-y-3 text-xs">
              <div><dt className="text-ink-muted">Quantidade de pavimentos (subsolos + pavimentos)</dt><dd className="text-ink font-semibold mt-1">{resumo.pavimentos ?? 'Preencha os pavimentos'}</dd></div>
              <div><dt className="text-ink-muted">Altura para fins de medidas de segurança</dt><dd className="text-ink font-semibold mt-1">{resumo.altura == null ? 'Preencha as alturas' : fmtUn(resumo.altura, 'm')}</dd></div>
              <div><dt className="text-ink-muted">Classificação quanto à altura</dt><dd className="text-ink font-semibold mt-1">{resumo.classificacao || 'Preencha as alturas'}</dd></div>
            </dl>
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

  const terrea = parseInt(est.nPavimentos) === 1
  const pavimentos = `${terrea ? 'Térrea' : `${est.nPavimentos} pavimentos`}${sub > 0 ? ` + ${sub} subsolo${sub > 1 ? 's' : ''}` : ''}`

  return (
    <div
      onClick={onOpen}
      className={`bg-surface rounded-lg mb-2 cursor-pointer transition-colors duration-150 border border-solid hover:border-ink-hint ${configured ? 'border-border' : 'border-dashed border-border-2'}`}
    >
      <div className="flex items-center gap-4 py-3.5 px-4">
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          {/* Nome */}
          <div className="min-w-0 sm:flex-1 flex items-center gap-2.5">
            <Icon name="newbld" size={16} className="text-ink-faint shrink-0"/>
            <div className="min-w-0 text-[14px] font-semibold text-ink leading-[1.3] truncate">{est.nome || `Estrutura ${index + 1}`}</div>
          </div>

          {/* Resumo em badges (mesmo estilo do cabecalho das estruturas) */}
          {configured ? (
            <div className="flex items-center gap-1.5 flex-wrap pl-[26px] sm:pl-0 sm:justify-end">
              <Chip icon="area">{fmtUn(a, 'm²', 2, `${a} m²`)}</Chip>
              <Chip icon="stair">{pavimentos}</Chip>
            </div>
          ) : (
            <span className="text-[13px] text-ink-faint pl-[26px] sm:pl-0">Clique para preencher</span>
          )}
        </div>

        {/* Remover + seta */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {canRemove && (
            <button
              className="btn-del"
              onClick={e => { e.stopPropagation(); dispatch({ type:'REMOVE_ESTRUTURA', id: est.id }) }}
              title="Remover estrutura"
              aria-label={`Remover ${est.nome || `estrutura ${index + 1}`}`}
            >
              <Icon name="trash" size={13}/>
            </button>
          )}
          <span className="text-ink-faint">
            <Icon name="chevD" size={14} className="-rotate-90"/>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Step2({ step, totalSteps }) {
  const { state, dispatch } = useProjeto()
  const dimensionamento = state.tipoProjeto === 'dimensionamento'
  const { search } = useLocation()
  const alvoAudit = new URLSearchParams(search).get('audit') || ''
  const [openId, setOpenId] = useState(() => state.estruturas.find(e => alvoAudit.startsWith(`${e.id}.`))?.id || null)
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })
  const estadosDisponiveis = getEstadosDisponiveis()

  // Informar alvará/AVCB/ano de construção? Projeto que já tem algum desses
  // dados preenchido conta como "sim" (sem perder o que foi digitado).
  const jaTemDadosLegais = !!(state.numeroAlvara || state.anoConstrucao || state.numeroAVCB || state.validadeAVCB)
  const informarLegais = state.informarDadosLegais || (jaTemDadosLegais ? 'sim' : '')
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
        <div className={S.stepLbl}>Etapa {step} de {totalSteps}</div>
        <h2 className={S.title}>Edificacao</h2>
        <p className={S.desc}>Situacao da edificacao e as estruturas (torres/blocos) que a compoem. Clique em uma estrutura para editar suas dimensoes e sistema construtivo — o numero de pavimentos de cada uma gera automaticamente os cards de classificacao na etapa 4.</p>
      </div>

      {/* Projeto "apenas dimensionamento" pula Identificacao (Step1) — nome
          do projeto e estado (usado pra escolher a norma) entram aqui. */}
      {dimensionamento && (
        <FormSection title="Identificacao">
          <div className="g2 mb-3">
            <div className="fg">
              <label>Nome do projeto <Obrigatorio id={'nome'}/></label>
              <input value={state.nome} onChange={set('nome')} placeholder="Ex: Edificio Comercial Centro"/>
            </div>
            <div className="fg">
              <label>Estado <Obrigatorio id={'uf'}/></label>
              <select value={state.uf} onChange={set('uf')}>
                {estadosDisponiveis.map(e => {
                  const habilitado = e.ativo || e.ativoDimensionamento
                  return (
                    <option key={e.uf} value={e.uf} disabled={!habilitado}>
                      {e.nome}{!habilitado ? ' — em breve' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </FormSection>
      )}

      {/* Situacao: nova ou existente — nao se aplica a um projeto que so
          dimensiona sistemas, sem gerar o Anexo B/PPCI completo. */}
      {!dimensionamento && (
        <FormSection title="Situacao">
          <div className="grid grid-cols-2 gap-2 mb-3.5">
            {[
              { k:'nova',      icon:'newbld', t:'Edificacao nova',      s:'Em projeto ou construcao' },
              { k:'existente', icon:'oldbld', t:'Edificacao existente', s:'Regularizacao / adequacao' },
            ].map(o => (
              <div key={o.k} className={optClass(state.situacao === o.k)}
                onClick={() => dispatch({ type:'SET_FIELD', field:'situacao', value:o.k })}>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${state.situacao===o.k ? 'bg-red-dim text-red' : 'bg-surface-2 text-ink-faint'}`}>
                  <Icon name={o.icon} size={17}/>
                </div>
                <div>
                  <div className={`text-[13px] font-medium ${state.situacao===o.k ? 'text-red' : 'text-ink-muted'}`}>{o.t}</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">{o.s}</div>
                </div>
              </div>
            ))}
          </div>

          {state.situacao === 'existente' && (
            <div className="ibox amber mt-2 mb-3.5">
              <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
              <span>Para edificacoes existentes o CBMMA pode aceitar medidas compensatorias. Documente as condicoes atuais com precisao.</span>
            </div>
          )}

          {/* Pergunta: informar alvará / AVCB / ano de construção? Projetos que já
              têm algum desses dados preenchidos contam como "sim". */}
          <div className="mb-3.5 flex items-center justify-between gap-4 py-3 px-4 rounded-md border border-solid border-border">
            <div className="text-[13px] font-medium text-ink">
              {state.situacao === 'existente'
                ? 'Deseja informar os dados de alvará, AVCB e ano de construção?'
                : 'Deseja informar o número do alvará?'}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className={`text-xs font-medium w-7 text-right ${informarLegais === 'sim' ? 'text-ink' : 'text-ink-faint'}`}>
                {informarLegais === 'sim' ? 'Sim' : 'Não'}
              </span>
              <SwitchToggle checked={informarLegais === 'sim'}
                onChange={v => dispatch({ type:'SET_FIELD', field:'informarDadosLegais', value: v ? 'sim' : 'nao' })}/>
            </div>
          </div>

          {informarLegais === 'sim' && state.situacao === 'nova' && (
            <div className="fg">
              <label>Numero do alvara <Obrigatorio id="numeroAlvara"/></label><input value={state.numeroAlvara} onChange={set('numeroAlvara')}/>
            </div>
          )}

          {state.situacao === 'existente' && informarLegais === 'sim' && (
            <>
              <div className="fg mb-3 max-w-[calc(50%-8px)]"><label>Numero do alvara <Obrigatorio id="numeroAlvara"/></label><input value={state.numeroAlvara} onChange={set('numeroAlvara')}/></div>
              <div className="g2 mb-3">
                <div className="fg"><label>Ano de construcao <Obrigatorio id="anoConstrucao"/></label><input type="number" value={state.anoConstrucao} onChange={set('anoConstrucao')} placeholder="Ex: 1998"/></div>
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
                <div className="fg"><label>No do AVCB anterior <Obrigatorio id="numeroAVCB"/></label><input value={state.numeroAVCB} onChange={set('numeroAVCB')}/></div>
                <div className="fg"><label>Validade do AVCB <Obrigatorio id="validadeAVCB"/></label><input type="date" value={state.validadeAVCB} onChange={set('validadeAVCB')}/></div>
              </div>
            </>
          )}

          <div className="fg">
            <label>Observações complementares <Obrigatorio id="condicoesAtuais"/></label>
            <textarea value={state.condicoesAtuais} onChange={set('condicoesAtuais')} placeholder="Descreva brevemente..."/>
          </div>
        </FormSection>
      )}

      {/* Terreno e area construida (parametros globais do projeto) — no modo
          dimensionamento so a area construida total interessa (nenhum
          calculo de saida/hidrante/sprinkler usa terreno, publico ou area
          complementar). */}
      <FormSection title={dimensionamento ? 'Area construida' : 'Terreno e area construida'}>
        <div className={dimensionamento ? '' : 'g2 mb-3'}>
          {!dimensionamento && (
            <div className="fg"><label>Area do terreno (m2) <Obrigatorio id="areaTerreno"/></label><input type="number" value={state.areaTerreno} onChange={set('areaTerreno')}/></div>
          )}
          <div className="fg">
            <label>
              Area construida total (m2) <Obrigatorio id="areaConstruidaTotal"/>
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
        {!dimensionamento && (
          <div className="g2">
            <div className="fg"><label>Quantidade de publico <Obrigatorio id="quantidadePublico"/></label><input type="number" value={state.quantidadePublico} onChange={set('quantidadePublico')} placeholder="Lotacao maxima estimada"/></div>
            <div className="fg"><label>Area complementar (m2) <Obrigatorio id="areaComplementar"/></label><input type="number" value={state.areaComplementar} onChange={set('areaComplementar')} placeholder="Area de risco nao habitavel"/></div>
          </div>
        )}
      </FormSection>

      {/* Estruturas */}
      <FormSection title={<>Estruturas <Obrigatorio id="estruturas"/></>}>
        {state.estruturas.map((est, i) => (
          <EstruturaCard key={est.id} est={est} index={i} canRemove={state.estruturas.length > 1} dispatch={dispatch} onOpen={() => setOpenId(est.id)}/>
        ))}
        <button className="btn-add" onClick={() => dispatch({ type:'ADD_ESTRUTURA' })}>
          <Icon name="plus" size={11}/> Adicionar estrutura
        </button>
      </FormSection>

      <FormSection title="Características construtivas">
        <div className="space-y-5">
          {[
            { field:'caracteristicasEstrutura', label:'Estrutura', placeholder:'Descreva os materiais da estrutura', opcoes:['Concreto armado', 'Estrutura metálica', 'Alvenaria estrutural', 'Madeira'] },
            { field:'cobertura', label:'Elementos de cobertura', placeholder:'Descreva os materiais da cobertura', opcoes:['Laje impermeabilizada', 'Telha metálica', 'Telha de fibrocimento', 'Telha cerâmica'] },
            { field:'fachada', label:'Elementos de vedação', placeholder:'Descreva os materiais de vedação', opcoes:['Alvenaria de blocos cerâmicos', 'Alvenaria de blocos de concreto', 'Painéis metálicos', 'Vidro'] },
          ].map(c => <div key={c.field} className="fg">
            <label htmlFor={`construtiva-${c.field}`}>{c.label} <Obrigatorio id={c.field}/></label>
            <input id={`construtiva-${c.field}`} required value={state[c.field] || ''} onChange={set(c.field)} placeholder={c.placeholder}/>
            <div className="flex flex-wrap gap-2 mt-2" aria-label={`Preenchimento rápido: ${c.label}`}>
              {c.opcoes.map(value => <button key={value} type="button" className="btn-ghost text-xs" onClick={() => {
                const atual = (state[c.field] || '').trim()
                dispatch({ type:'SET_FIELD', field:c.field, value: atual ? `${atual}, ${value}` : value })
              }}>{value}</button>)}
            </div>
          </div>)}
        </div>
      </FormSection>

      {openEst && <EstruturaModal est={openEst} index={openIndex} dispatch={dispatch} onClose={() => setOpenId(null)}/>}
    </div>
  )
}
