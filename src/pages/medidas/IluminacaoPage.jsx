import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { calcularAclaramento, calcularBalizamento, nomeEspecificacao } from '../../data/iluminacao_calc'
import Icon from '../../components/ui/Icon'
import luminaria30ledsImg from '../../assets/luminaria 30 leds.png'
import blocoIluminacaoImg from '../../assets/bloco de iluminacao.png'

// Imagens de referência dos dois equipamentos de aclaramento aceitos — chave
// igual à de EQUIPAMENTOS_ACLARAMENTO (normas/MA/iluminacao.js).
const IMAGENS_EQUIPAMENTO = {
  luminaria_30leds: luminaria30ledsImg,
  bloco_emergencia: blocoIluminacaoImg,
}

// Gerado aqui (em vez de deixar o reducer decidir) para que quem despacha a
// criação já saiba o id da especificação nova e possa abri-la expandida
// assim que ela aparecer na lista — ver EquipamentoBase.
let especSeq = 0
function gerarIdEspecificacao() {
  especSeq += 1
  return `spec-${Date.now().toString(36)}-${especSeq}-${Math.random().toString(36).slice(2, 5)}`
}

// ── Shared UI ─────────────────────────────────────────────────────────
const inputClass = 'bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 w-full outline-none box-border'
function Label({ children }) {
  return <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">{children}</div>
}
function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}
function CardHeader({ children }) {
  return <div className="py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 flex-wrap">{children}</div>
}
function SectionTitle({ label }) {
  return <h3 className="text-sm font-bold text-ink mb-3">{label}</h3>
}
function Chip({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md font-semibold text-xs border border-solid ${ok ? 'bg-green-dim border-green-border text-green' : 'bg-red-dim border-red-border text-red'}`}>
      {ok ? '✓' : '✗'} {children}
    </span>
  )
}
function EmptyState({ texto }) {
  return (
    <div className="border border-solid border-border rounded-lg py-12 px-6 text-center bg-surface mb-8">
      <Icon name="sun" size={28} className="mx-auto mb-3 block text-ink-faint opacity-40"/>
      <div className="text-[13px] text-ink-faint leading-[1.6] max-w-[420px] mx-auto">{texto}</div>
    </div>
  )
}
function PerguntaSimNao({ pergunta, valor, onSim, onNao }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[12px] text-ink-muted flex-1 min-w-[140px]">{pergunta}</span>
      <button type="button" onClick={onSim}
        className={`text-[11px] py-1 px-2.5 rounded-md border border-solid cursor-pointer transition-all duration-150 bg-transparent ${valor === true ? 'border-green-border text-green font-semibold' : 'border-border text-ink-faint font-normal hover:bg-white/[.03]'}`}
      >Sim</button>
      <button type="button" onClick={onNao}
        className={`text-[11px] py-1 px-2.5 rounded-md border border-solid cursor-pointer transition-all duration-150 bg-transparent ${valor === false ? 'border-red-border text-red font-semibold' : 'border-border text-ink-faint font-normal hover:bg-white/[.03]'}`}
      >Não</button>
    </div>
  )
}

// ── Sistema utilizado no projeto (pergunta obrigatória antes das quantidades) ──
function SistemaSelecionado({ sistema, tiposSistema, dispatch }) {
  const setTipo         = tipo   => dispatch({ type: 'SET_ILUMINACAO_SISTEMA', changes: { tipo } })
  const setLocalizacao  = valor  => dispatch({ type: 'SET_ILUMINACAO_SISTEMA', changes: { localizacaoFonte: valor } })
  const precisaLocalizacao = sistema.tipo === 'central' || sistema.tipo === 'motogerador'

  return (
    <Card className="mb-8">
      <CardHeader><span className="text-[13px] font-semibold text-ink">Sistema utilizado no projeto</span></CardHeader>
      <div className="py-3.5 px-[18px]">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {tiposSistema.map(t => (
            <button key={t.key} type="button" onClick={() => setTipo(t.key)}
              className={`text-left p-3 rounded-md border border-solid cursor-pointer transition-colors duration-150 bg-transparent ${sistema.tipo === t.key ? 'border-red-border' : 'border-border hover:bg-white/[.03]'}`}
            >
              <div className={`text-[13px] font-semibold mb-1 ${sistema.tipo === t.key ? 'text-red' : 'text-ink'}`}>{t.label}</div>
              <div className="text-[11px] text-ink-faint leading-[1.5]">{t.descricao}</div>
            </button>
          ))}
        </div>
        {precisaLocalizacao && (
          <div className="max-w-[420px]">
            <Label>Localização da fonte ({sistema.tipo === 'motogerador' ? 'grupo motogerador' : 'central de baterias'})</Label>
            <input className={inputClass} placeholder="ex.: Casa de máquinas, Térreo, Depósito..."
              value={sistema.localizacaoFonte} onChange={e => setLocalizacao(e.target.value)}/>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Uma especificação cadastrada para um tipo base de equipamento ────
// Um mesmo tipo base pode ter várias especificações (ex.: variantes com
// fluxo luminoso diferente) — cada uma vira uma opção própria nos
// quantitativos por pavimento (diferenciadas pelo fluxo). Recolhida por
// padrão para não sobrecarregar a tela quando há várias cadastradas — o
// nome e o resumo (lâmpada · fluxo) já dizem o essencial sem abrir. Exceção:
// uma especificação recém-criada (`defaultAberto`) nasce aberta, para o
// usuário não esquecer de conferir/preencher os dados — ele fecha depois se
// quiser.
function EspecificacaoRow({ spec, eqLabel, campos, dispatch, defaultAberto }) {
  const [aberto, setAberto] = useState(!!defaultAberto)
  const setField = (key, value) => dispatch({ type: 'UPDATE_ESPECIFICACAO_EQUIPAMENTO', id: spec.id, changes: { [key]: value } })
  const nome = nomeEspecificacao(spec, eqLabel)
  const resumo = [spec.tipoLampada, spec.fluxoLuminosoLm && `${spec.fluxoLuminosoLm} lm`].filter(Boolean).join(' · ')

  return (
    <div className="border-t border-solid border-border">
      <div className="flex items-center gap-2 py-2 px-3">
        <button type="button" onClick={() => setAberto(a => !a)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer bg-transparent border-none p-0"
        >
          <Icon name="chevD" size={12} className={`text-ink-faint shrink-0 transition-transform duration-150 ${aberto ? 'rotate-180' : ''}`}/>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-ink truncate">{nome}</div>
            {resumo && <div className="text-[10px] text-ink-faint truncate">{resumo}</div>}
          </div>
        </button>
        <button type="button" onClick={() => dispatch({ type: 'REMOVE_ESPECIFICACAO_EQUIPAMENTO', id: spec.id })} className="btn-del shrink-0">
          <Icon name="trash" size={12}/>
        </button>
      </div>
      {aberto && (
        <div className="pb-3 px-3">
          <div className="mb-2.5">
            <Label>Identificação</Label>
            <input className={inputClass} placeholder={nomeEspecificacao({ ...spec, identificacao: '' }, eqLabel)}
              value={spec.identificacao} onChange={e => setField('identificacao', e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {campos.map(c => (
              <div key={c.key}>
                <Label>{c.label}{c.unidade ? ` (${c.unidade})` : ''}</Label>
                <input className={inputClass} value={spec[c.key]} onChange={e => setField(c.key, e.target.value)}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Switch liga/desliga — mesmo estilo do Toggle usado em Saída de Emergência ──
function SwitchToggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="shrink-0 cursor-pointer bg-transparent border-none p-0">
      <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? 'bg-red' : 'bg-border'}`}>
        <div className={`absolute top-0.5 ${checked ? 'left-[18px]' : 'left-0.5'} w-4 h-4 rounded-full bg-white transition-[left] duration-200`}/>
      </div>
    </button>
  )
}

// ── Botão "+ Adicionar especificação" com menu de presets ─────────────
// Botão de verdade (não um <select> disfarçado) — abre um menu com os
// presets do tipo + "Personalizado"; escolher um cria a especificação já
// preenchida (ou em branco, no caso do personalizado). O menu é renderizado
// via portal em document.body e posicionado por coordenadas fixas — os
// cartões desta tela ficam dentro de vários containers com overflow-hidden
// (para os cantos arredondados), que cortariam um menu posicionado como
// filho normal.
function AdicionarEspecificacaoMenu({ presetsDoTipo, onAdicionar }) {
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)

  const abrir = () => {
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }
  const fechar = () => setPos(null)
  const escolher = preset => { onAdicionar(preset); fechar() }

  return (
    <>
      <button ref={btnRef} type="button" className="btn-add w-full justify-center py-2" onClick={() => (pos ? fechar() : abrir())}>
        <Icon name="plus" size={11}/> Adicionar especificação
      </button>
      {pos && createPortal(
        <>
          <div className="fixed inset-0 z-[999]" onClick={fechar}/>
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
            className="z-[1000] bg-surface border border-solid border-border rounded-md shadow-[0_8px_24px_rgba(0,0,0,.4)] overflow-hidden max-h-[240px] overflow-y-auto"
          >
            {presetsDoTipo.map(p => (
              <button key={p.key} type="button" onClick={() => escolher(p)}
                className="w-full text-left py-2 px-3 text-[12px] text-ink-muted cursor-pointer bg-transparent border-none border-b border-solid border-border-2 hover:bg-white/[.05] hover:text-ink"
              >{p.label}</button>
            ))}
            <button type="button" onClick={() => escolher(undefined)}
              className="w-full text-left py-2 px-3 text-[12px] text-ink-faint italic cursor-pointer bg-transparent border-none hover:bg-white/[.05] hover:text-ink"
            >Personalizado (em branco)</button>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

// ── Cartão de um tipo base de equipamento — imagem, nome, switch e suas
// especificações. O switch liga cria uma especificação default (o primeiro
// preset do tipo, se houver); o menu "Adicionar especificação" (abaixo da
// lista) cadastra variantes extras, por preset ou em branco. Em ambos os
// casos a especificação nasce com o id gerado aqui mesmo (em vez de deixar
// o reducer gerar) para saber exatamente qual linha acabou de aparecer e
// abri-la já expandida — ver `recemCriadoId`.
function EquipamentoBase({ eqKey, eqLabel, eqImg, especificacoes, presets, campos, dispatch }) {
  const specs = especificacoes.filter(s => s.tipoBase === eqKey)
  const usado = specs.length > 0
  const presetsDoTipo = presets.filter(p => p.tipoBase === eqKey)
  const [recemCriadoId, setRecemCriadoId] = useState(null)

  const toggleUsado = v => {
    if (v) {
      const id = gerarIdEspecificacao()
      setRecemCriadoId(id)
      dispatch({ type: 'SET_EQUIPAMENTO_USADO', tipoBase: eqKey, usado: v, preset: presetsDoTipo[0], id })
    } else {
      dispatch({ type: 'SET_EQUIPAMENTO_USADO', tipoBase: eqKey, usado: v })
    }
  }
  const adicionar = preset => {
    const id = gerarIdEspecificacao()
    setRecemCriadoId(id)
    dispatch({ type: 'ADD_ESPECIFICACAO_EQUIPAMENTO', tipoBase: eqKey, preset, id })
  }

  return (
    <div className="rounded-md border border-solid border-border h-fit">
      <div className="flex items-center gap-3.5 py-3 px-3 rounded-t-md overflow-hidden">
        <img src={eqImg} alt={eqLabel} className="w-24 h-24 object-contain rounded bg-surface-2 shrink-0"/>
        <span className="text-[13px] font-semibold text-ink flex-1">{eqLabel}</span>
        <SwitchToggle checked={usado} onChange={toggleUsado}/>
      </div>
      {specs.map(spec => (
        <EspecificacaoRow key={spec.id} spec={spec} eqLabel={eqLabel} campos={campos} dispatch={dispatch}
          defaultAberto={spec.id === recemCriadoId}/>
      ))}
      {usado && (
        <div className="px-3 pb-3 pt-2.5 border-t border-solid border-border">
          <AdicionarEspecificacaoMenu presetsDoTipo={presetsDoTipo} onAdicionar={adicionar}/>
        </div>
      )}
    </div>
  )
}

function EquipamentosAclaramento({ equipamentosDef, especificacoes, presets, campos, dispatch }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">Equipamentos de aclaramento utilizados no projeto</span>
        <span className="text-[11px] text-ink-faint">dados necessários para o memorial (item 5.2, NBR 10898) — escolha um preset ou cadastre manualmente</span>
      </CardHeader>
      <div className="py-3.5 px-[18px] grid grid-cols-2 gap-3 items-start">
        {equipamentosDef.map(eq => (
          <EquipamentoBase key={eq.key} eqKey={eq.key} eqLabel={eq.label} eqImg={IMAGENS_EQUIPAMENTO[eq.key]} especificacoes={especificacoes} presets={presets} campos={campos} dispatch={dispatch}/>
        ))}
      </div>
    </Card>
  )
}

// ── Stepper de quantidade (− valor +) ─────────────────────────────────
function QuantityStepper({ value, onChange }) {
  const dec = () => onChange(Math.max(0, (value || 0) - 1))
  const inc = () => onChange((value || 0) + 1)
  return (
    <div className="inline-flex items-center gap-1.5">
      <button type="button" onClick={dec}
        className="w-6 h-6 flex items-center justify-center rounded-md border border-solid border-border bg-transparent text-ink-faint text-sm leading-none cursor-pointer hover:bg-white/[.05] hover:text-ink"
      >−</button>
      <span className="w-7 text-center text-[13px] font-bold text-red font-mono">{value || 0}</span>
      <button type="button" onClick={inc}
        className="w-6 h-6 flex items-center justify-center rounded-md border border-solid border-border bg-transparent text-ink-faint text-sm leading-none cursor-pointer hover:bg-white/[.05] hover:text-ink"
      >+</button>
    </div>
  )
}

// ── Checklist de quantidades por pavimento (usado por aclaramento e balizamento) ──
function ChecklistQuantidades({ estruturaId, pavimentoId, categoria, campoTipo, opcoes, itens, dispatch }) {
  const setQuantidade = (opcaoKey, valor) => {
    const item = itens.find(i => i[campoTipo] === opcaoKey)
    if (item) {
      if (valor <= 0) dispatch({ type: 'REMOVE_ILUMINACAO', id: item.id })
      else dispatch({ type: 'UPDATE_ILUMINACAO', id: item.id, changes: { quantidade: valor } })
    } else if (valor > 0) {
      dispatch({ type: 'ADD_ILUMINACAO', estruturaId, pavimentoId, categoria, overrides: { [campoTipo]: opcaoKey, quantidade: valor } })
    }
  }

  return (
    <div className="border border-solid border-border rounded-md overflow-hidden">
      <table className="w-full border-collapse">
        <tbody>
          {opcoes.map(o => {
            const item = itens.find(i => i[campoTipo] === o.key)
            return (
              <tr key={o.key}>
                <td className="py-1.5 px-2.5 text-[13px] text-ink-muted border-b border-solid border-border-2">{o.label}</td>
                <td className="py-1.5 px-2.5 border-b border-solid border-border-2 w-[100px]">
                  <QuantityStepper value={item?.quantidade || 0} onChange={v => setQuantidade(o.key, v)}/>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Bloco de Aclaramento de um pavimento ─────────────────────────────
function BlocoAclaramento({ estruturaId, pavimentoId, itens, areaPavimento, equipamentosUsados, equipamentosSpec, iluNorma, dispatch }) {
  const { ILUMINANCIA_MINIMA, FATOR_UTILIZACAO_ACLARAMENTO } = iluNorma
  const resultado = calcularAclaramento(itens, areaPavimento, {
    equipamentos: equipamentosSpec,
    iluminanciaMinima: ILUMINANCIA_MINIMA.aclaramento_normal,
    fatorUtilizacao: FATOR_UTILIZACAO_ACLARAMENTO,
  })

  return (
    <div className="mb-4">
      <div className="text-[13px] font-semibold text-ink mb-2">Aclaramento</div>
      <ChecklistQuantidades
        estruturaId={estruturaId} pavimentoId={pavimentoId}
        categoria="aclaramento" campoTipo="tipoEquipamento"
        opcoes={equipamentosUsados} itens={itens} dispatch={dispatch}
      />
      <div className="mt-2">
        <Chip ok={resultado.minimoAtendido}>
          {resultado.areaCobertaTotal.toFixed(1)} m² cobertos / {resultado.area.toFixed(1)} m² do pavimento
        </Chip>
      </div>
    </div>
  )
}

// ── Bloco de Balizamento (checklist) de um pavimento ─────────────────
// Antes de abrir o checklist de quantidades, pergunta explicitamente se
// luminárias de balizamento foram aplicadas neste pavimento.
function BlocoBalizamento({ estruturaId, pavimentoId, itens, aplicado, dispatch, iluNorma }) {
  const { PONTOS_BALIZAMENTO } = iluNorma
  const resultado = calcularBalizamento(itens, PONTOS_BALIZAMENTO)
  const setAplicado = valor => dispatch({ type: 'SET_BALIZAMENTO_APLICADO', pavimentoId, valor })

  return (
    <div>
      <div className="text-[13px] font-semibold text-ink mb-2">Balizamento</div>
      <div className="mb-2.5">
        <PerguntaSimNao
          pergunta="Foram aplicadas luminárias de balizamento neste pavimento?"
          valor={aplicado} onSim={() => setAplicado(true)} onNao={() => setAplicado(false)}
        />
      </div>

      {aplicado === true && (
        <>
          <ChecklistQuantidades
            estruturaId={estruturaId} pavimentoId={pavimentoId}
            categoria="balizamento" campoTipo="pontoTipo"
            opcoes={PONTOS_BALIZAMENTO} itens={itens} dispatch={dispatch}
          />
          <div className="mt-2">
            <Chip ok={resultado.minimoAtendido}>{resultado.pontosCadastrados} de {PONTOS_BALIZAMENTO.length} tipos de ponto balizados — {resultado.quantidadeTotal} luminária{resultado.quantidadeTotal !== 1 ? 's' : ''}</Chip>
          </div>
        </>
      )}
      {aplicado === false && (
        <div className="text-[11px] text-ink-faint py-1.5">Sem luminárias de balizamento neste pavimento.</div>
      )}
    </div>
  )
}

// ── Card de um pavimento ──────────────────────────────────────────────
function PavimentoCard({ pavimento, estruturaId, alturaPisoPiso, itensAclaramento, itensBalizamento, balizamentoAplicado, equipamentosUsados, equipamentosSpec, iluNorma, dispatch }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">{pavimento.label}</span>
        {pavimento.area && <span className="text-[11px] text-ink-faint">{pavimento.area} m²</span>}
        {alturaPisoPiso > 0 && <span className="text-[11px] text-ink-faint">· pé-direito {alturaPisoPiso} m</span>}
      </CardHeader>
      <div className="py-3.5 px-[18px] grid grid-cols-2 gap-6">
        <BlocoAclaramento
          estruturaId={estruturaId} pavimentoId={pavimento.id}
          itens={itensAclaramento} areaPavimento={pavimento.area}
          equipamentosUsados={equipamentosUsados} equipamentosSpec={equipamentosSpec}
          iluNorma={iluNorma} dispatch={dispatch}
        />
        <BlocoBalizamento
          estruturaId={estruturaId} pavimentoId={pavimento.id}
          itens={itensBalizamento} aplicado={balizamentoAplicado} iluNorma={iluNorma} dispatch={dispatch}
        />
      </div>
    </Card>
  )
}

// ── Referência normativa (topo da página) ────────────────────────────
function RefLabel({ children }) {
  return <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">{children}</div>
}

function ReferenciaNormativa({ iluNorma }) {
  const { ILUMINANCIA_MINIMA, RAZAO_UNIFORMIDADE_MAX, AUTONOMIA_MINIMA_HORAS, TEMPO_RESPOSTA_MAX_S, NOTAS } = iluNorma
  const [open, setOpen] = useState(false)

  return (
    <Card className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 text-left"
      >
        <span className="text-[13px] font-semibold text-ink">Parâmetros normativos (NT 18 CBMMA)</span>
        <span className="text-[11px] text-ink-faint">iluminância mínima, autonomia e tempo de resposta</span>
        <Icon name="chevD" size={14} className={`ml-auto text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && <div className="py-3.5 px-[18px] flex flex-col gap-4">
        <div>
          <RefLabel>Iluminância mínima</RefLabel>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-muted">Balizamento</span><span className="font-mono font-semibold text-ink">{ILUMINANCIA_MINIMA.balizamento} lux</span></div>
            <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-muted">Aclaramento (normal)</span><span className="font-mono font-semibold text-ink">{ILUMINANCIA_MINIMA.aclaramento_normal} lux</span></div>
            <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-muted">Aclaramento (risco/público)</span><span className="font-mono font-semibold text-ink">{ILUMINANCIA_MINIMA.aclaramento_risco} lux</span></div>
          </div>
        </div>

        <div>
          <RefLabel>Uniformidade, autonomia e tempo de resposta</RefLabel>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-muted">Uniformidade máx.</span><span className="font-mono font-semibold text-ink">{RAZAO_UNIFORMIDADE_MAX}:1</span></div>
            <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-muted">Autonomia mínima</span><span className="font-mono font-semibold text-ink">{AUTONOMIA_MINIMA_HORAS} h</span></div>
            <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-muted">Tempo de resposta</span><span className="font-mono font-semibold text-ink">≤ {TEMPO_RESPOSTA_MAX_S} s</span></div>
          </div>
        </div>

        <div className="text-[11px] text-ink-faint leading-[1.6] pt-2 border-t border-solid border-border-2">
          {NOTAS.aclaramento}<br/>{NOTAS.balizamento}<br/>{NOTAS.autonomia}<br/>{NOTAS.tempoResposta}
        </div>
      </div>}
    </Card>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function IluminacaoPage() {
  const { state, dispatch } = useProjeto()
  const { iluminacao: iluNorma } = useNorma()
  const { TIPOS_SISTEMA, EQUIPAMENTOS_ACLARAMENTO, CAMPOS_EQUIPAMENTO, PRESETS_EQUIPAMENTO } = iluNorma
  const sistema = state.iluminacaoSistema

  const especificacoes = sistema.especificacoes || []
  const sistemaDefinido = !!sistema.tipo
  const podeConfigurarPavimentos = sistemaDefinido && especificacoes.length > 0

  // Opções do checklist de aclaramento por pavimento — uma por especificação
  // cadastrada (não por tipo base), rotuladas com o fluxo luminoso para
  // diferenciar variantes do mesmo tipo. `equipamentosSpecById` é o mapa
  // usado pelo cálculo de área coberta (iluminacao_calc.js espera o fluxo
  // luminoso indexado pela mesma chave de item.tipoEquipamento).
  const opcoesAclaramento = especificacoes.map(spec => {
    const base = EQUIPAMENTOS_ACLARAMENTO.find(eq => eq.key === spec.tipoBase)
    return { key: spec.id, label: nomeEspecificacao(spec, base?.label || spec.tipoBase) }
  })
  const equipamentosSpecById = Object.fromEntries(especificacoes.map(spec => [spec.id, spec]))

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="text-[22px] font-bold text-ink mb-1.5">Sistema de Iluminação de Emergência</h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
            Escolha o sistema utilizado no projeto e os equipamentos de aclaramento, e depois cadastre as quantidades por pavimento, conforme a NT 18 CBMMA / NBR 10898.
          </p>
        </div>

        <ReferenciaNormativa iluNorma={iluNorma}/>

        <SistemaSelecionado sistema={sistema} tiposSistema={TIPOS_SISTEMA} dispatch={dispatch}/>

        {!sistemaDefinido ? (
          <EmptyState texto="Selecione o sistema de iluminação de emergência utilizado no projeto para liberar as quantidades por pavimento."/>
        ) : (
          <>
            <EquipamentosAclaramento equipamentosDef={EQUIPAMENTOS_ACLARAMENTO} especificacoes={especificacoes} presets={PRESETS_EQUIPAMENTO} campos={CAMPOS_EQUIPAMENTO} dispatch={dispatch}/>

            {!podeConfigurarPavimentos ? (
              <EmptyState texto="Cadastre ao menos uma especificação de equipamento de aclaramento acima para liberar as quantidades por pavimento."/>
            ) : (
              state.estruturas.map(est => {
                const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
                return (
                  <div key={est.id} className="mb-9">
                    <SectionTitle label={est.nome}/>
                    {pavimentos.length === 0 ? (
                      <div className="ibox amber">
                        <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
                        <span className="text-xs">Nenhum pavimento cadastrado nesta estrutura ainda — configure os pavimentos na Etapa 2.</span>
                      </div>
                    ) : pavimentos.map(pav => (
                      <PavimentoCard
                        key={pav.id}
                        pavimento={pav}
                        estruturaId={est.id}
                        alturaPisoPiso={est.alturaPisoPiso}
                        itensAclaramento={state.iluminacao.filter(i => i.pavimentoId === pav.id && i.categoria === 'aclaramento')}
                        itensBalizamento={state.iluminacao.filter(i => i.pavimentoId === pav.id && i.categoria === 'balizamento')}
                        balizamentoAplicado={state.iluminacaoBalizamentoAplicado[pav.id]}
                        equipamentosUsados={opcoesAclaramento}
                        equipamentosSpec={equipamentosSpecById}
                        iluNorma={iluNorma}
                        dispatch={dispatch}
                      />
                    ))}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}
