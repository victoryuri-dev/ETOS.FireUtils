// FormularioSistema.jsx — classificação do Sistema de Hidrantes/Mangotinhos
// (NT 22 CBMMA) pro memorial descritivo. Registro único por projeto (ver
// comentário de state.hidrantes em ProjetoContext.jsx) — o dimensionamento
// hidráulico continua vindo do plugin Revit; aqui só a classificação que o
// site decide e envia pra ele (ver hidrantes_calc.js e site-sync).
import { useEffect, useMemo } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { cargaDaDivisao, classificarRisco } from '../../data/extintores_calc'
import { sugerirClassificacao, dadosDoTipo, exigeRecalqueDuplo, bombaReservaObrigatoria, rtiParaTipoNaFaixa } from '../../data/hidrantes_calc'
import SwitchToggle from '../ui/SwitchToggle'
import FormSection from '../ui/FormSection'
import Icon from '../ui/Icon'

const inputClass = 'bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 w-full outline-none box-border'

function Field({ label, hint, children }) {
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em]">{label}</div>
          {hint && <div className="text-[10px] text-ink-faint font-mono whitespace-nowrap">{hint}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
function ReadOnly({ children, className = '' }) {
  return <div className={`${inputClass} bg-surface-2 flex items-center font-bold text-ink ${className}`}>{children}</div>
}
function Pill({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left py-2 px-3 rounded-md border border-solid text-xs transition-colors ${active ? 'border-red bg-red-dim text-ink font-semibold' : 'border-border bg-bg text-ink-faint hover:text-ink'}`}>
      {children}
    </button>
  )
}
function Nota({ children }) {
  return (
    <div className="ibox amber mt-2">
      <Icon name="info" size={13} color="var(--color-amber)" className="shrink-0"/>
      <span className="text-xs">{children}</span>
    </div>
  )
}
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-ink">{label}</span>
      <SwitchToggle checked={checked} onChange={onChange}/>
    </div>
  )
}

export default function FormularioSistema() {
  const { state, dispatch } = useProjeto()
  const { hidrantes: norma, extintores: extNorma } = useNorma()
  const { sistemas } = useMedidasObrigatorias()
  const h = state.hidrantes
  const set = changes => dispatch({ type: 'SET_HIDRANTES', changes })

  const temSprinklers = !!(sistemas.sprinklers?.ativo || sistemas.sprinklers?.obrigatorio)

  const areaTotal = useMemo(
    () => state.estruturas.reduce((s, e) => s + (parseFloat(e.areaTotal) || 0), 0),
    [state.estruturas],
  )

  // Divisões presentes no projeto inteiro (principal + subsidiárias de todo
  // pavimento, de toda estrutura), cada uma com a maior carga de incêndio já
  // classificada — insumo da sugestão automática de Tipo/RTI.
  const divisoesComCarga = useMemo(() => {
    const porDivisao = new Map()
    state.pavimentos.forEach(p => {
      const cargaState = state.cargaState[p.estruturaId] || {}
      const divs = [p.divisao, ...(p.acess || []).map(a => a.divisao)].filter(Boolean)
      divs.forEach(divisao => {
        const carga = cargaDaDivisao(divisao, cargaState)
        if (carga == null) return
        const atual = porDivisao.get(divisao)
        if (!atual || carga > atual) porDivisao.set(divisao, carga)
      })
    })
    return [...porDivisao.entries()].map(([divisao, cargaMJm2]) => ({ divisao, cargaMJm2 }))
  }, [state.pavimentos, state.cargaState])

  const sugestao = useMemo(
    () => sugerirClassificacao(areaTotal, divisoesComCarga, temSprinklers, norma),
    [areaTotal, divisoesComCarga, temSprinklers, norma],
  )

  const maiorCarga = divisoesComCarga.length ? Math.max(...divisoesComCarga.map(d => d.cargaMJm2)) : 0
  const risco = classificarRisco(maiorCarga, extNorma.LIMIARES_RISCO)
  const reservaSugerida = bombaReservaObrigatoria(risco, norma)

  const tipoAtual = h.tipo || (sugestao.opcoes[0]?.tipo ?? '')
  const dadosTipo = tipoAtual ? dadosDoTipo(tipoAtual, h.tipoVariante || 0, norma) : null
  const recalqueDuplo = dadosTipo ? exigeRecalqueDuplo(dadosTipo.vazaoMin, norma) : false

  const escolherOpcao = opcao => set({ tipo: opcao.tipo, rti: opcao.rti, tipoVariante: 0 })

  const escolherTipoManual = tipo => {
    const rti = rtiParaTipoNaFaixa(tipo, sugestao.faixaIndex, norma)
    set({ tipo, rti, tipoVariante: 0 })
  }

  // RTI é sempre automática (Tabela 3) — assim que a classificação vira uma
  // sugestão sem ambiguidade (uma única opção de Tipo), grava direto no
  // projeto sem esperar o RT clicar em nada. Quando há 2 opções (coluna 1 —
  // ver escolherOpcao), o RT decide qual das duas adotar.
  useEffect(() => {
    if (!h.tipo && sugestao.opcoes.length === 1) {
      set({ tipo: sugestao.opcoes[0].tipo, rti: sugestao.opcoes[0].rti })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sugestao.opcoes.length, sugestao.opcoes[0]?.tipo, h.tipo])

  return (
    <div className="mb-8">

      {/* A — Classificação do sistema */}
      <FormSection title="Classificação do Sistema" description="Cruzamento área construída × ocupação, conforme Tabela 3 da NT 22 CBMMA.">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Área total construída do projeto">
            <ReadOnly>{areaTotal ? `${areaTotal.toLocaleString('pt-BR')} m²` : '—'}</ReadOnly>
          </Field>
          <Field label="Ocupação usada na classificação" hint={sugestao.divisao ? `coluna ${sugestao.coluna} da Tabela 3` : undefined}>
            <ReadOnly>{sugestao.divisao || 'Nenhuma divisão classificada ainda (Etapa 4/5)'}</ReadOnly>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 py-1 mb-3">
          <span className="text-xs text-ink">Edificação possui chuveiros automáticos (sprinklers)?</span>
          <span className={`text-[11px] font-bold py-1 px-2.5 rounded border border-solid ${temSprinklers ? 'bg-green-dim border-green-border text-green' : 'bg-surface-2 border-border text-ink-faint'}`}>
            {temSprinklers ? 'SIM' : 'NÃO'}
          </span>
        </div>
        <div className="text-[11px] text-ink-faint -mt-2 mb-3">
          Detectado automaticamente da Etapa 6 (Medidas de Segurança) — não editável aqui.
        </div>

        {sugestao.opcoes.length > 1 && (
          <div className="mb-4">
            <Field label="A norma permite dois sistemas para esta ocupação — escolha qual adotar" />
            <div className="grid grid-cols-2 gap-2 mt-1">
              {sugestao.opcoes.map(op => (
                <Pill key={op.tipo} active={h.tipo === op.tipo} onClick={() => escolherOpcao(op)}>
                  Tipo {op.tipo} — RTI {op.rti} m³
                </Pill>
              ))}
            </div>
          </div>
        )}

        {sugestao.opcoes.length === 1 && sugestao.opcoes[0].nota && (
          <Nota>{sugestao.opcoes[0].nota}</Nota>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field label="Tipo de sistema adotado" hint={sugestao.opcoes[0] ? `sugerido: Tipo ${sugestao.opcoes[0].tipo}` : undefined}>
            <select className={inputClass} value={tipoAtual} onChange={e => escolherTipoManual(Number(e.target.value))}>
              <option value="">Selecione...</option>
              {[1, 2, 3, 4, 5].map(t => <option key={t} value={t}>Tipo {t}</option>)}
            </select>
          </Field>
          <Field label="Reserva Técnica de Incêndio (RTI)" hint="automática — Tabela 3, NT 22">
            <ReadOnly>{h.rti ? `${h.rti} m³` : '—'}</ReadOnly>
          </Field>
        </div>

        {dadosTipo && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-solid border-border">
            <Field label="Esguicho regulável"><ReadOnly>DN{dadosTipo.esguicho}</ReadOnly></Field>
            <Field label="Mangueira de incêndio"><ReadOnly>DN{dadosTipo.mangueiraDn} — {dadosTipo.mangueiraComprimento} m</ReadOnly></Field>
            <Field label="Nº de expedições"><ReadOnly className="capitalize">{dadosTipo.expedicoes}</ReadOnly></Field>
            <Field label="Vazão mínima na válvula"><ReadOnly>{dadosTipo.vazaoMin} L/min</ReadOnly></Field>
            <Field label="Pressão mínima na válvula"><ReadOnly>{dadosTipo.pressaoMin} mca</ReadOnly></Field>
          </div>
        )}

        {dadosTipo?.esguicho && norma.TIPOS_SISTEMA[tipoAtual]?.variantes.length > 1 && (
          <div className="mt-4">
            <Field label="Variante do Tipo 4"/>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {norma.TIPOS_SISTEMA[tipoAtual].variantes.map((v, i) => (
                <Pill key={i} active={(h.tipoVariante || 0) === i} onClick={() => set({ tipoVariante: i })}>
                  Esguicho DN{v.esguicho} — mangueira DN{v.mangueiraDn} — {v.pressaoMin} mca
                </Pill>
              ))}
            </div>
          </div>
        )}
      </FormSection>

      {/* B — RTI e reservatório */}
      <FormSection title="Reservatório" description="A posição (elevado, nível do solo etc.) vem do modelo Revit — aqui só o material e o regime de uso.">
        <div className="mb-3">
          <Field label="Material do reservatório">
            <select className={inputClass} value={h.reservatorioMaterial} onChange={e => set({ reservatorioMaterial: e.target.value })}>
              <option value="">Selecione...</option>
              {norma.MATERIAIS_RESERVATORIO.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </Field>
        </div>
        <ToggleRow label="Reservatório exclusivo para combate a incêndio?" checked={h.reservatorioExclusivo} onChange={v => set({ reservatorioExclusivo: v })}/>
        {!h.reservatorioExclusivo && (
          <div className="mt-3">
            <Field label="Volume total do reservatório (incêndio + outros usos)" hint="a reserva efetiva de incêndio deve ficar sempre garantida dentro desse total">
              <div className="relative">
                <input type="number" step="0.5" min={0} className={inputClass + ' pr-10'}
                  value={h.reservatorioVolumeTotal} onChange={e => set({ reservatorioVolumeTotal: e.target.value })}/>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">m³</span>
              </div>
            </Field>
          </div>
        )}
      </FormSection>

      {/* C — Bomba de incêndio */}
      <FormSection title="Bomba de Incêndio" description="Só identifica quais bombas existem — vazão, pressão e potência são calculadas pelo plugin.">
        <ToggleRow label="Bomba principal" checked={h.bombaExiste} onChange={v => set({ bombaExiste: v })}/>
        {h.bombaExiste && (
          <>
            <ToggleRow label="Bomba reserva" checked={h.bombaReserva} onChange={v => set({ bombaReserva: v })}/>
            {h.bombaReserva && (
              <div className="grid grid-cols-2 gap-2 my-3 pl-4">
                {norma.ACIONAMENTOS_BOMBA.map(op => (
                  <Pill key={op.key} active={h.bombaReservaAcionamento === op.key} onClick={() => set({ bombaReservaAcionamento: op.key })}>
                    {op.label}
                  </Pill>
                ))}
              </div>
            )}
            <ToggleRow label="Bomba jockey (pressurização)" checked={h.bombaJockey} onChange={v => set({ bombaJockey: v })}/>
            {reservaSugerida && !h.bombaReserva && (
              <Nota>
                Risco {risco} classificado — a NT 22 (Anexo C, C.3.12) exige bomba reserva: {reservaSugerida.tipo}.
              </Nota>
            )}
          </>
        )}
      </FormSection>

      {/* D — Rede de tubulação */}
      <FormSection title="Rede de Tubulação">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Material">
            <select className={inputClass} value={h.redeMaterial} onChange={e => set({ redeMaterial: e.target.value })}>
              <option value="">Selecione...</option>
              {norma.MATERIAIS_TUBULACAO.map(m => (
                <option key={m.key} value={m.key}>{m.label} (C={m.fatorC})</option>
              ))}
            </select>
          </Field>
          <Field label="Configuração da rede">
            <select className={inputClass} value={h.redeConfiguracao} onChange={e => set({ redeConfiguracao: e.target.value })}>
              {norma.CONFIGURACOES_REDE.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="text-[11px] text-ink-faint mt-3">
          Diâmetro mínimo da rede: DN65 (DN50 permitido apenas em sistemas Tipo 1 ou 2, item 5.11.6).
        </div>
      </FormSection>

      {/* E — Dispositivo de recalque */}
      <FormSection title="Dispositivo de Recalque (Corpo de Bombeiros)">
        <div className="grid grid-cols-1 gap-2 mb-3">
          {norma.TIPOS_RECALQUE.map(op => (
            <Pill key={op.key} active={h.recalqueTipo === op.key} onClick={() => set({ recalqueTipo: op.key })}>
              {op.label}
            </Pill>
          ))}
        </div>
        {h.recalqueTipo === 'passeio' && (
          <Field label="Justificativa técnica de impossibilidade">
            <textarea className={inputClass + ' min-h-[70px] resize-y'} value={h.recalqueJustificativaPasseio}
              onChange={e => set({ recalqueJustificativaPasseio: e.target.value })}/>
          </Field>
        )}
        <div className="text-[11px] text-ink-faint mt-3">
          Nº de entradas: <strong className="text-ink">{recalqueDuplo ? '2 (vazão do sistema acima de 1.000 L/min)' : '1'}</strong>
        </div>
      </FormSection>

      {/* F — Abrigos e mangueiras (derivado da Tabela 4, somente leitura) */}
      {dadosTipo && (
        <FormSection title="Abrigos e Mangueiras" description="Componentes obrigatórios para o Tipo de sistema adotado (Tabela 4, NT 22).">
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-ink-faint">Abrigo</span><span className="text-ink font-medium capitalize">{dadosTipo.componentes.abrigo}</span>
            <span className="text-ink-faint">Mangueira de incêndio</span><span className="text-ink font-medium">{norma.LABEL_MANGUEIRA_INCENDIO[dadosTipo.componentes.mangueiraIncendio] || (dadosTipo.componentes.mangueiraIncendio ? dadosTipo.componentes.mangueiraIncendio : 'Não se aplica')}</span>
            <span className="text-ink-faint">Diâmetro / comprimento da mangueira</span><span className="text-ink font-medium">DN{dadosTipo.mangueiraDn} — {dadosTipo.mangueiraComprimento} m</span>
            <span className="text-ink-faint">Esguicho regulável</span><span className="text-ink font-medium">DN{dadosTipo.esguicho}</span>
            <span className="text-ink-faint">Chave para hidrante / engate</span><span className="text-ink font-medium">{dadosTipo.componentes.chaveEngate ? 'Sim' : 'Não'}</span>
            <span className="text-ink-faint">Esguicho avulso</span><span className="text-ink font-medium">{dadosTipo.componentes.esguichoAvulso ? 'Sim' : 'Não'}</span>
            <span className="text-ink-faint">Mangueira semirrígida com esguicho</span><span className="text-ink font-medium">{dadosTipo.componentes.mangueiraSemirrigida ? 'Sim' : 'Não'}</span>
          </div>
        </FormSection>
      )}

      {/* G — Válvulas */}
      <FormSection title="Válvulas">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Válvula do hidrante (globo angular)">
            <select className={inputClass} value={h.valvulaHidranteDn} onChange={e => set({ valvulaHidranteDn: Number(e.target.value) })}>
              <option value={65}>DN65 (2 ½")</option>
              <option value={50}>DN50 (2") — só Tipo 1/2 com rede DN50</option>
            </select>
          </Field>
          <Field label="Válvulas de bloqueio">
            <select className={inputClass} value={h.valvulaBloqueioTipo} onChange={e => set({ valvulaBloqueioTipo: e.target.value })}>
              <option value="gaveta">Gaveta</option>
              <option value="gaveta_os_y">Gaveta de haste ascendente (OS&Y)</option>
            </select>
          </Field>
        </div>
        <div className="text-[11px] text-ink-faint mt-3">
          Válvula do mangotinho: esfera de abertura rápida, DN25 (1") — fixo pela NT 22, item 5.5.4.
        </div>
      </FormSection>

      {/* H — Observações */}
      <FormSection title="Observações Complementares">
        <textarea className={inputClass + ' min-h-[90px] resize-y'} placeholder="Qualquer particularidade do projeto que não se encaixa nos campos acima..."
          value={h.observacoes} onChange={e => set({ observacoes: e.target.value })}/>
      </FormSection>
    </div>
  )
}
