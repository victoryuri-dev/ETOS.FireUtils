import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { nomeEspecificacao } from '../../data/iluminacao_calc'
import Icon from '../../components/ui/Icon'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import QuantityStepper from '../../components/ui/QuantityStepper'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { statusPorProgresso, statusEstrutura } from '../../utils/statusEstrutura'
import { fmtUn } from '../../utils/numero'
import SwitchToggle from '../../components/ui/SwitchToggle'
import luminaria30ledsImg from '../../assets/luminaria 30 leds.png'
import blocoIluminacaoImg from '../../assets/bloco de iluminacao.png'

// Imagens de referência dos dois equipamentos de aclaramento aceitos — chave
// igual à de EQUIPAMENTOS_ACLARAMENTO (normas/MA/iluminacao.js).
const IMAGENS_EQUIPAMENTO = {
  luminaria_30leds: luminaria30ledsImg,
  bloco_emergencia: blocoIluminacaoImg,
}

// Gerado aqui (em vez de deixar o reducer decidir) para que quem despacha a
// criação já saiba o id do item novo e possa abri-lo expandido assim que
// aparecer na lista — ver BlocoAclaramento.
let aclaramentoSeq = 0
function gerarIdAclaramento() {
  aclaramentoSeq += 1
  return `ilu-${Date.now().toString(36)}-${aclaramentoSeq}-${Math.random().toString(36).slice(2, 5)}`
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
function EmptyState({ texto }) {
  return (
    <div className="border border-solid border-border rounded-lg py-12 px-6 text-center bg-surface mb-8">
      <Icon name="sun" size={28} className="mx-auto mb-3 block text-ink-faint opacity-40"/>
      <div className="text-[13px] text-ink-faint leading-[1.6] max-w-[420px] mx-auto">{texto}</div>
    </div>
  )
}
// ── Pergunta: mesmo sistema de iluminação para todas as edificações? ────
// Gate no topo da página — decide se o sistema é escolhido uma vez pro
// projeto todo (SistemaSelecionado global) ou dentro de cada estrutura
// (uma instância de SistemaSelecionado por EstruturaSection). Começa em
// `true` (ver INITIAL_STATE.iluminacaoMesmoSistema) pra não quebrar o fluxo
// de projetos existentes, que sempre tiveram um único sistema.
function MesmoSistemaPergunta({ mesmoSistema, dispatch }) {
  const setMesmoSistema = valor => dispatch({ type: 'SET_ILUMINACAO_MESMO_SISTEMA', valor })
  return (
    <Card className="mb-8">
      <div className="py-3.5 px-[18px] flex items-center gap-3">
        <span className="text-[12px] text-ink-muted flex-1">
          Todas as edificações do projeto utilizam o mesmo sistema de iluminação de emergência (bloco autônomo, sistema centralizado ou grupo motogerador)?
        </span>
        <SwitchToggle checked={mesmoSistema} onChange={setMesmoSistema}/>
      </div>
    </Card>
  )
}

// ── Sistema utilizado (no projeto todo, ou numa estrutura) ───────────────
function SistemaSelecionado({ titulo, sistema, tiposSistema, onChange }) {
  const setTipo         = tipo   => onChange({ tipo })
  const setLocalizacao  = valor  => onChange({ localizacaoFonte: valor })
  const precisaLocalizacao = sistema.tipo === 'central' || sistema.tipo === 'motogerador'

  return (
    <Card className="mb-8">
      <CardHeader><span className="text-[13px] font-semibold text-ink">{titulo}</span></CardHeader>
      <div className="py-3.5 px-[18px]">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {tiposSistema.map(t => {
            const ativo = sistema.tipo === t.key
            return (
              <button key={t.key} type="button" onClick={() => setTipo(t.key)} aria-pressed={ativo}
                className={`text-left p-3 rounded-md border border-solid cursor-pointer transition-colors duration-150 ${ativo ? 'border-red-border bg-red-dim' : 'border-border bg-bg hover:border-ink-faint'}`}
              >
                <div className={`text-[13px] font-semibold mb-1 ${ativo ? 'text-red' : 'text-ink'}`}>{t.label}</div>
                <div className="text-[11px] text-ink-faint leading-[1.5]">{t.descricao}</div>
              </button>
            )
          })}
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

// ── Um equipamento de aclaramento cadastrado neste pavimento — a
// especificação técnica e a quantidade são preenchidas juntas, num único
// card (antes eram duas etapas: cadastrar a luminária, depois achar outro
// checklist pra informar quanto tinha de cada uma). A quantidade fica no
// header do card, sempre visível. Recolhido por padrão pra não sobrecarregar
// a tela quando há vários cadastrados — o nome e o resumo (lâmpada · fluxo)
// já dizem o essencial sem abrir. Exceção: um equipamento recém-criado
// (`defaultAberto`) nasce aberto, pro usuário não esquecer de conferir os
// dados técnicos — ele fecha depois se quiser. Cada pavimento tem sua
// própria lista independente (duas estruturas, ou dois andares, usando o
// "mesmo modelo" cadastram cada um a sua cópia — sem catálogo compartilhado).
function EquipamentoCard({ item, equipamentosDef, campos, dispatch, defaultAberto }) {
  const [aberto, setAberto] = useState(!!defaultAberto)
  const eqLabel = equipamentosDef.find(eq => eq.key === item.tipoBase)?.label || item.tipoBase
  const nome = nomeEspecificacao(item, eqLabel)
  const resumo = [item.tipoLampada, item.fluxoLuminosoLm && fmtUn(item.fluxoLuminosoLm, 'lm', 2, `${item.fluxoLuminosoLm} lm`)].filter(Boolean).join(' · ')
  const setField = (key, value) => dispatch({ type: 'UPDATE_ILUMINACAO', id: item.id, changes: { [key]: value } })

  return (
    <div className="border border-solid border-border rounded-md overflow-hidden bg-surface">
      <div className="flex items-center gap-2 py-2 px-3">
        <img src={IMAGENS_EQUIPAMENTO[item.tipoBase]} alt="" className="w-8 h-8 object-contain rounded bg-surface-2 shrink-0"/>
        <button type="button" onClick={() => setAberto(a => !a)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer bg-transparent border-none p-0"
        >
          <Icon name="chevD" size={12} className={`text-ink-faint shrink-0 transition-transform duration-150 ${aberto ? 'rotate-180' : ''}`}/>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-ink truncate">{nome}</div>
            {!aberto && resumo && <div className="text-[10px] text-ink-faint truncate">{resumo}</div>}
          </div>
        </button>
        <QuantityStepper value={item.quantidade || 0} onChange={v => setField('quantidade', v)}/>
        <button type="button" onClick={() => dispatch({ type: 'REMOVE_ILUMINACAO', id: item.id })} className="btn-del shrink-0">
          <Icon name="trash" size={12}/>
        </button>
      </div>
      {aberto && (
        <div className="pb-3 px-3 pt-2.5 border-t border-solid border-border">
          <div className="mb-2.5">
            <Label>Identificação</Label>
            <input className={inputClass} placeholder={nomeEspecificacao({ ...item, identificacao: '' }, eqLabel)}
              value={item.identificacao} onChange={e => setField('identificacao', e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {campos.map(c => (
              <div key={c.key}>
                <Label>{c.label}{c.unidade ? ` (${c.unidade})` : ''}</Label>
                <input className={inputClass} value={item[c.key]} onChange={e => setField(c.key, e.target.value)}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Botão "+ Adicionar equipamento" com menu de presets agrupado por tipo
// base ──────────────────────────────────────────────────────────────────
// Botão de verdade (não um <select> disfarçado) — abre um menu com os dois
// tipos base de equipamento (ver EQUIPAMENTOS_ACLARAMENTO), cada um com
// "Adicionar Luminária" (em branco) + seus presets de catálogo; escolher uma
// opção já cria o item neste pavimento (especificação + quantidade inicial 1
// num só passo). O menu é renderizado via portal em document.body e
// posicionado por coordenadas fixas — os cartões desta tela ficam dentro de
// vários containers com overflow-hidden (para os cantos arredondados), que
// cortariam um menu posicionado como filho normal. Fecha ao clicar fora ou
// ao rolar a página — sem overlay de tela cheia (isso bloqueava o scroll: o
// shell do app rola por uma div interna, e um overlay via portal fica fora
// dela na árvore do DOM, então a roda do mouse sobre o overlay não achava
// nada pra rolar).
function AdicionarEquipamentoMenu({ equipamentosDef, presets, onAdicionar }) {
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  // Abre pra cima quando não há espaço suficiente embaixo do botão (ex.:
  // botão perto do fim da tela, dentro de um card de pavimento no fim da
  // lista) — sem isso o menu extrapolava a viewport e ficava cortado, sem
  // como rolar até as últimas opções. Altura máxima sempre limitada ao
  // espaço realmente disponível no lado escolhido.
  const abrir = () => {
    const r = btnRef.current.getBoundingClientRect()
    const margem = 8
    const espacoAbaixo = window.innerHeight - r.bottom - margem
    const espacoAcima = r.top - margem
    const paraCima = espacoAbaixo < 200 && espacoAcima > espacoAbaixo
    setPos({
      left: r.left, width: r.width,
      top: paraCima ? null : r.bottom + 4,
      bottom: paraCima ? window.innerHeight - r.top + 4 : null,
      maxHeight: Math.max(120, Math.min(320, paraCima ? espacoAcima - 4 : espacoAbaixo - 4)),
    })
  }
  const fechar = () => setPos(null)
  const escolher = (tipoBase, preset) => { onAdicionar(tipoBase, preset); fechar() }

  useEffect(() => {
    if (!pos) return
    const aoClicarFora = e => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      fechar()
    }
    document.addEventListener('mousedown', aoClicarFora)
    // capture:true — scroll não borbulha, só assim pega o scroll da div
    // interna do app (não é a window que rola aqui).
    document.addEventListener('scroll', fechar, true)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('scroll', fechar, true)
    }
  }, [pos])

  return (
    <>
      <button ref={btnRef} type="button" className="btn-add w-full justify-center py-2" onClick={() => (pos ? fechar() : abrir())}>
        <Icon name="plus" size={11}/> Adicionar equipamento
      </button>
      {pos && createPortal(
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top ?? undefined, bottom: pos.bottom ?? undefined, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
          className="z-[1000] bg-surface border border-solid border-border rounded-md shadow-[0_8px_24px_rgba(0,0,0,.4)] overflow-hidden overflow-y-auto"
        >
          {equipamentosDef.map(eq => (
            <div key={eq.key}>
              <div className="py-1.5 px-3 text-[10px] text-ink-faint uppercase tracking-[.06em] bg-surface-2">{eq.label}</div>
              <button type="button" onClick={() => escolher(eq.key, undefined)}
                className="w-full text-left py-2 px-3 text-[12px] text-ink-muted cursor-pointer bg-transparent border-none border-b border-solid border-border-2 hover:bg-white/[.05] hover:text-ink"
              ><Icon name="plus" size={10} className="inline-block mr-1.5 align-[-1px]"/>Adicionar Luminária</button>
              {presets.filter(p => p.tipoBase === eq.key).map(p => (
                <button key={p.key} type="button" onClick={() => escolher(eq.key, p)}
                  className="w-full text-left py-2 px-3 text-[12px] text-ink-muted cursor-pointer bg-transparent border-none border-b border-solid border-border-2 hover:bg-white/[.05] hover:text-ink"
                >{p.label}</button>
              ))}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

// ── Bloco de Aclaramento de um pavimento ─────────────────────────────
function BlocoAclaramento({ estruturaId, pavimentoId, itens, equipamentosDef, presets, campos, dispatch }) {
  const [recemCriadoId, setRecemCriadoId] = useState(null)

  const adicionar = (tipoBase, preset) => {
    const id = gerarIdAclaramento()
    setRecemCriadoId(id)
    dispatch({
      type: 'ADD_ILUMINACAO', estruturaId, pavimentoId, categoria: 'aclaramento', id,
      overrides: {
        tipoBase, identificacao: '',
        tipoLampada: preset?.tipoLampada || '',
        potenciaW: preset?.potenciaW || '',
        tensaoV: preset?.tensaoV || '',
        fluxoLuminosoLm: preset?.fluxoLuminosoLm || '',
        autonomia: preset?.autonomia || '',
        quantidade: 1,
      },
    })
  }

  return (
    <div>
      <div className="text-[13px] font-semibold text-ink mb-2">Aclaramento</div>
      <div className="flex flex-col gap-2.5">
        {itens.map(item => (
          <EquipamentoCard key={item.id} item={item} equipamentosDef={equipamentosDef} campos={campos} dispatch={dispatch}
            defaultAberto={item.id === recemCriadoId}/>
        ))}
        <AdicionarEquipamentoMenu equipamentosDef={equipamentosDef} presets={presets} onAdicionar={adicionar}/>
      </div>
    </div>
  )
}

// ── Card de um pavimento ──────────────────────────────────────────────
function PavimentoCard({ pavimento, estruturaId, alturaPisoPiso, itensAclaramento, equipamentosDef, presets, campos, dispatch }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">{pavimento.label}</span>
        {pavimento.area && <span className="text-[11px] text-ink-faint">{fmtUn(pavimento.area, 'm²', 2, `${pavimento.area} m²`)}</span>}
        {alturaPisoPiso > 0 && <span className="text-[11px] text-ink-faint">· pé-direito {alturaPisoPiso} m</span>}
      </CardHeader>
      <div className="py-3.5 px-[18px]">
        <BlocoAclaramento
          estruturaId={estruturaId} pavimentoId={pavimento.id}
          itens={itensAclaramento}
          equipamentosDef={equipamentosDef} presets={presets} campos={campos} dispatch={dispatch}
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
          <div className="grid grid-cols-2 gap-4">
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
          {NOTAS.aclaramento}<br/>{NOTAS.autonomia}<br/>{NOTAS.tempoResposta}
        </div>
      </div>}
    </Card>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function IluminacaoPage() {
  const { state, dispatch } = useProjeto()
  const { iluminacao: iluNorma } = useNorma()
  const { porEstrutura } = useMedidasObrigatorias()
  const { TIPOS_SISTEMA, EQUIPAMENTOS_ACLARAMENTO, CAMPOS_EQUIPAMENTO, PRESETS_EQUIPAMENTO } = iluNorma
  // Default true (ver INITIAL_STATE) — projetos existentes, que sempre
  // tiveram um único sistema pro projeto todo, continuam exatamente como
  // estavam até o usuário responder "Não" à pergunta no topo da página.
  const mesmoSistema = state.iluminacaoMesmoSistema !== false

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.iluminacao} size={20} color="var(--color-red)" className="shrink-0"/>
            Sistema de Iluminação de Emergência
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
            Escolha o sistema utilizado e os equipamentos de aclaramento, e depois cadastre as quantidades por pavimento, conforme a NT 18 CBMMA / NBR 10898.
          </p>
        </div>

        <ReferenciaNormativa iluNorma={iluNorma}/>

        <MesmoSistemaPergunta mesmoSistema={mesmoSistema} dispatch={dispatch}/>

        {mesmoSistema && (
          <SistemaSelecionado titulo="Sistema utilizado no projeto" sistema={state.iluminacaoSistema} tiposSistema={TIPOS_SISTEMA}
            onChange={changes => dispatch({ type: 'SET_ILUMINACAO_SISTEMA', changes })}/>
        )}

        {mesmoSistema && !state.iluminacaoSistema.tipo ? (
          <EmptyState texto="Selecione o sistema de iluminação de emergência utilizado no projeto para liberar os equipamentos e as quantidades por pavimento."/>
        ) : (
          state.estruturas.map(est => {
            const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
            const comItens = pavimentos.filter(pav => state.iluminacao.some(i => i.pavimentoId === pav.id)).length
            const pe = porEstrutura.find(p => p.estrutura.id === est.id)
            const exigido = !!pe?.sistemas?.iluminacao?.ativo
            const status = !exigido
              ? statusEstrutura('concluido', 'Não exigida')
              : statusPorProgresso(comItens, Math.max(pavimentos.length, 1), {
                  pendente: 'Aguardando dados', andamento: `${comItens} de ${pavimentos.length} pavimentos`, concluido: 'Dados carregados',
                })

            // Sistema e especificações desta estrutura — o sistema vem do
            // card global quando `mesmoSistema`, senão do próprio card por
            // estrutura; as especificações são sempre por estrutura (uma
            // edificação pode usar luminárias diferentes de outra).
            const sistemaDaEstrutura = mesmoSistema ? state.iluminacaoSistema : (state.iluminacaoSistemaPorEstrutura[est.id] || { tipo: '', localizacaoFonte: '' })
            const sistemaDefinido = !!sistemaDaEstrutura.tipo

            return (
              <EstruturaSection key={est.id} titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est} semArea/>} status={status} conclusao={exigido ? { estruturaId: est.id, medida: 'iluminacao' } : null} defaultOpen={false}>
                {!exigido ? (
                  <div className="ibox green">
                    <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
                    <span className="text-xs">Iluminação de emergência não exigida para a ocupação/altura atual desta estrutura, conforme NT 01 CBMMA.</span>
                  </div>
                ) : (
                  <>
                    {!mesmoSistema && (
                      <SistemaSelecionado titulo="Sistema utilizado nesta edificação" sistema={sistemaDaEstrutura} tiposSistema={TIPOS_SISTEMA}
                        onChange={changes => dispatch({ type: 'SET_ILUMINACAO_SISTEMA_ESTRUTURA', estruturaId: est.id, changes })}/>
                    )}

                    {!sistemaDefinido ? (
                      <EmptyState texto="Selecione o sistema de iluminação de emergência utilizado nesta edificação para liberar as quantidades por pavimento."/>
                    ) : pavimentos.length === 0 ? (
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
                        equipamentosDef={EQUIPAMENTOS_ACLARAMENTO} presets={PRESETS_EQUIPAMENTO} campos={CAMPOS_EQUIPAMENTO}
                        dispatch={dispatch}
                      />
                    ))}
                  </>
                )}
              </EstruturaSection>
            )
          })
        )}
      </div>
    </div>
  )
}
