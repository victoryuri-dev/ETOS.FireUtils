import { useState, useRef } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { supabase } from '../../lib/supabase'
import Icon from '../../components/ui/Icon'
import StepsNav from '../../components/layout/StepsNav'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import FormularioSistema from '../../components/hidrantes/FormularioSistema'
import { calcPotenciaBomba } from '../../data/hidrantes_calc'
import { getHidrantes } from '../../data/normas/index'

// ── Formatação ────────────────────────────────────────────────────────
const f4  = n => Number(n).toFixed(4)
const f2  = n => Number(n).toFixed(2)
const f3  = n => Number(n).toFixed(3)
const fmca = n => `${f4(n)} mca`
const lmin = n => `${f2(n)} L/min`
const m3s  = n => `${Number(n).toFixed(4)} m³/s`
const ms   = n => `${f3(n)} m/s`

// ── Shared UI ─────────────────────────────────────────────────────────
function Table({ children }) {
  return <div className="border border-solid border-border rounded-md overflow-hidden mb-1"><table className="w-full border-collapse">{children}</table></div>
}
function TH({ children, right, center, w }) {
  return <th style={{width:w}} className={`text-[10px] text-ink-faint uppercase tracking-[.07em] font-medium py-[9px] px-3.5 border-b border-solid border-border bg-surface-2 whitespace-nowrap ${right?'text-right':center?'text-center':'text-left'}`}>{children}</th>
}
function TD({ children, red, green, bold, muted, right, center, mono }) {
  const colorClass = red ? 'text-red' : green ? 'text-green' : muted ? 'text-ink-faint' : 'text-ink'
  return <td className={`py-[9px] px-3.5 text-[13px] ${colorClass} ${bold?'font-bold':'font-normal'} border-b border-solid border-border-2 align-middle ${right?'text-right':center?'text-center':'text-left'} ${mono?'font-mono':'font-sans'}`}>{children}</td>
}
// `limite` é o limite normativo de velocidade DESTE trecho (recalque/
// descarga sempre 5,0 m/s; sucção 3,0 ou 2,0 m/s conforme positiva/negativa
// — ver normas/<UF>/hidrantes.js) — nunca um valor fixo pra todos os trechos.
function VelChip({ v, limite }) {
  const ok = v <= limite
  return <span className={`inline-flex items-center gap-1 py-[3px] px-2 rounded font-mono font-bold text-xs border border-solid ${ok?'bg-green-dim border-green-border text-green':'bg-red-dim border-red-border text-red'}`}>{ok?'✓':' ✗'} {ms(v)}</span>
}
function AtendeChip({ ok }) {
  return <span className={`inline-block py-[3px] px-2.5 rounded font-bold text-[11px] border border-solid ${ok?'bg-green-dim border-green-border text-green':'bg-red-dim border-red-border text-red'}`}>{ok ? 'ATENDE' : 'NÃO ATENDE'}</span>
}
function Formula({ children }) {
  return <div className="bg-bg border border-solid border-border rounded-md py-2.5 px-3.5 text-xs text-ink-muted font-mono leading-[1.6] mt-2">{children}</div>
}
function FormulaVal({ children }) {
  return <strong className="text-red">{children}</strong>
}
function Card({ children, className='' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}
function CardHeader({ children }) {
  return <div className="py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2">{children}</div>
}

// Pressão de referência no hidrante (o que se compara contra Pmin): na
// ponta do esguicho quando o método é "Ponta do Esguicho Regulável", na
// válvula quando é "Válvula do Hidrante" — ver hidrantes/calc.py.
function pressaoHidrante(res, hd) {
  if (!res.esguicho) return hd === 'hd01' ? res.P_hd01 : res.P_hd02
  return res.esg[hd].P_esg
}

// ── Resumo Executivo ──────────────────────────────────────────────────
// Só os dois hidrantes mais desfavoráveis — o ponto de operação da bomba
// (Ht/Qt/potência) fica na Etapa 3 (Dimensionamento da Bomba), junto da
// eficiência e da potência adotada.
function ResumoExecutivo({ d }) {
  const { res, dados_sistema } = d
  const pmin = dados_sistema.p_min
  const pmax = 100
  const p01 = pressaoHidrante(res, 'hd01')
  const p02 = pressaoHidrante(res, 'hd02')
  const labelPressao = res.esguicho ? 'Pressão no esguicho' : 'Pressão na válvula'

  const cards = [
    {
      id: 'HID-01', label: '1º MAIS DESFAVORÁVEL', color: 'var(--color-red)',
      rows: [
        { label: labelPressao,        val: fmca(p01) },
        { label:'Vazão real',         val: lmin(res.Q_hd01) },
      ],
      atende: p01 >= pmin && p01 <= pmax,
    },
    {
      id: 'HID-02', label: '2º MAIS DESFAVORÁVEL', color: 'var(--color-amber)',
      rows: [
        { label: labelPressao,        val: fmca(p02) },
        { label:'Vazão real',         val: lmin(res.Q_hd02) },
      ],
      atende: p02 >= pmin && p02 <= pmax,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {cards.map(c => (
        <Card key={c.id}>
          <CardHeader>
            <span style={{color:c.color}} className="text-[11px] font-bold py-0.5 px-2 rounded bg-surface border border-solid border-border font-mono">{c.id}</span>
            <span className="text-[10px] text-ink-faint font-medium uppercase tracking-[.06em]">{c.label}</span>
          </CardHeader>
          <div className="py-3.5 px-[18px] flex flex-col gap-2.5">
            {c.rows.map((r, i) => (
              <div key={i} className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-ink-faint">{r.label}</span>
                <span className="text-sm font-bold text-ink font-mono whitespace-nowrap">{r.val}</span>
              </div>
            ))}
            {c.atende !== null && (
              <div className="mt-1">
                <AtendeChip ok={c.atende}/>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Dados do Sistema (resumo compacto) ─────────────────────────────────
// Só o que o RT precisa pra conferir que os requisitos normativos certos
// foram usados — o detalhamento completo (referência de cada valor,
// mangueira, velocidade máxima por trecho etc.) fica no memorial de
// cálculo impresso (memorial/hidrantesCalculo.js), não duplicado aqui.
function DadosDoSistema({ d }) {
  const { dados_sistema, valor_sistema, metodo, C_HW, res } = d
  const stats = [
    { label: 'Classificação', val: valor_sistema },
    { label: 'Método', val: metodo },
    { label: 'Vazão mínima', val: `${dados_sistema.q_min} L/min` },
    { label: 'Pressão mín.–máx.', val: `${dados_sistema.p_min}–100 mca` },
    { label: 'Coef. C', val: String(C_HW) },
  ]
  if (res.esguicho) {
    stats.push({ label: 'Mangueira', val: `DN${dados_sistema.mang_dn} · ${dados_sistema.mang_comp} m` })
  }
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {stats.map(s => (
        <div key={s.label} className="bg-surface border border-solid border-border rounded-md py-3 px-3.5 text-center">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.05em] mb-1 whitespace-nowrap">{s.label}</div>
          <div className="text-[13px] font-bold text-ink">{s.val}</div>
        </div>
      ))}
    </div>
  )
}

// ── Perdas de Carga por Trecho ───────────────────────────────────────────
// Ordem da narrativa: os dois ramais até o Ponto A, depois o recalque até
// a bomba, depois a sucção — mesma sequência da marcha de cálculo. Mostra
// o RESULTADO por trecho/diâmetro (comprimento real, equivalente, perda de
// carga, velocidade) e os componentes (conexões/acessórios) que geram
// perda localizada — sem o passo a passo de como cada valor foi calculado
// (Jun, fórmula de Hazen-Williams etc.), que fica só no memorial de
// cálculo impresso (memorial/hidrantesCalculo.js).
const ORDEM_TRECHOS = ['t3', 't4', 't2', 't1']

function limiteVelocidade(trechoId, succao, norma) {
  if (trechoId === 't1') return succao === 'positiva' ? norma.V_MAX_SUCCAO_POSITIVA : norma.V_MAX_SUCCAO_NEGATIVA
  return norma.V_MAX_TUBULACAO
}

function MiniStat({ label, val, destaque }) {
  return (
    <div>
      <div className="text-[10px] text-ink-faint uppercase tracking-[.05em] mb-1 whitespace-nowrap">{label}</div>
      <div className={`text-[13px] font-mono ${destaque ? 'font-bold text-red' : 'text-ink'}`}>{val}</div>
    </div>
  )
}

function SegmentoTrecho({ seg, vLimite }) {
  return (
    <div>
      <span className="inline-block text-[11px] font-bold text-ink-faint font-mono bg-surface-2 border border-solid border-border rounded px-1.5 py-0.5 mb-2">
        DN{Number(seg.d_mm).toFixed(0)}
      </span>
      <div className="grid grid-cols-4 gap-3 mb-2">
        <MiniStat label="Comp. Real (L)" val={`${f4(seg.L)} m`}/>
        <MiniStat label="Comp. Equivalente (Leq)" val={`${f4(seg.Leq)} m`}/>
        <MiniStat label="Comp. Total (Ltotal)" val={`${f4(seg.Ltotal)} m`} destaque/>
        <MiniStat label="Perda de Carga (J)" val={fmca(seg.J)} destaque/>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <VelChip v={seg.V} limite={vLimite}/>
        {seg.acessorios.map((a, i) => (
          <span key={i} className="text-[11px] text-ink-faint">
            {a.qtd}× {a.nome} <span className="text-ink font-medium">{f2(a.leq_tot)} m</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function TrechoDetalhe({ id, t, succao, norma }) {
  const vLimite = limiteVelocidade(id, succao, norma)
  return (
    <Card className="mb-3">
      <CardHeader>
        <span className="text-[11px] font-bold py-0.5 px-2 rounded bg-surface border border-solid border-border text-ink-faint font-mono">{id.toUpperCase()}</span>
        <span className="text-[13px] font-semibold text-ink">{t.label}</span>
        <span className="text-[11px] text-ink-faint ml-auto">Q = {lmin(t.Q_lmin)} · J total = {fmca(t.J)}</span>
      </CardHeader>
      <div className="py-3.5 px-[18px] flex flex-col gap-3.5">
        {t.segmentos.map((seg, i) => (
          <div key={i} className={t.segmentos.length > 1 && i < t.segmentos.length - 1 ? 'pb-3.5 border-b border-solid border-border-2' : ''}>
            <SegmentoTrecho seg={seg} vLimite={vLimite}/>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PerdasPorTrecho({ d, norma }) {
  const trechos = ORDEM_TRECHOS.map(id => [id, d.res.j[id]])
  return (
    <div>
      {trechos.map(([id, t]) => <TrechoDetalhe key={id} id={id} t={t} succao={d.succao} norma={norma}/>)}
    </div>
  )
}

// ── Resultado Hidráulico ─────────────────────────────────────────────────
// Ht/Qt já convergidos — o passo a passo de como Ht foi montado (Ponto A →
// saída da bomba → RTI) fica só no memorial de cálculo impresso.
function ResultadoHidraulico({ d }) {
  const { res } = d
  const cards = [
    { label: 'Altura Manométrica Total (Ht)', val: fmca(res.P_RTI) },
    { label: 'Vazão Total (Qt)',              val: lmin(res.Qt) },
    { label: 'Ramal Governante',              val: res.hid_governa },
  ]
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {cards.map(c => (
        <div key={c.label} className="bg-surface border border-solid border-border rounded-lg py-4 px-5">
          <div className="text-[11px] text-ink-faint uppercase tracking-[.06em] mb-1">{c.label}</div>
          <div className="text-xl font-bold text-red font-mono">{c.val}</div>
        </div>
      ))}
    </div>
  )
}

// ── Eficiência e Potência Adotada ────────────────────────────────────
// Eficiência (η) e potência adotada são os dois únicos campos que o RT
// informa na Etapa 3 — sincronizados direto com a dockpane via Supabase
// (state.hidrantes.bombaEficiencia/bombaPotenciaAdotada), sem transformação.
function EficienciaPotenciaAdotada({ eta, onChangeEta, potenciaAdotada, onChangePotenciaAdotada, potCv }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Eficiência global da bomba (η)</div>
        <div className="relative max-w-[220px]">
          <input type="number" step="1" min={1} max={100}
            className="bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 pr-8 w-full outline-none box-border"
            value={eta} onChange={e => onChangeEta(e.target.value)}/>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">%</span>
        </div>
      </div>
      <div>
        <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Potência adotada</div>
        <div className="relative max-w-[220px]">
          <input type="number" step="0.5" min={0}
            className="bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 pr-8 w-full outline-none box-border"
            value={potenciaAdotada} onChange={e => onChangePotenciaAdotada(e.target.value)}/>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">cv</span>
        </div>
        {potenciaAdotada !== '' && potCv != null && (
          <div className={`text-[11px] mt-1 ${Number(potenciaAdotada) >= potCv ? 'text-green' : 'text-red'}`}>
            {Number(potenciaAdotada) >= potCv ? 'Atende a potência mínima' : `Abaixo da potência mínima calculada (${f2(potCv)} cv)`}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Ponto de Operação para Seleção da Bomba ────────────────────────────
// Qt/Ht já foram mostrados na Etapa 2 (ResultadoHidraulico) e a eficiência
// já está logo acima (EficienciaPotenciaAdotada) — aqui só o que falta:
// a fórmula da potência mínima e as 4 grandezas que o RT leva pro catálogo
// do fabricante pra escolher a bomba.
function Bomba({ d, eta, potCv, potKw }) {
  const { res } = d
  const Qt_m3s = res.Qt / 1000 / 60
  const Qt_m3h = res.Qt / 1000 * 60
  const temEta = potCv != null

  return (
    <div>
      {temEta ? (
        <Formula>
          Pcv = (1000 × {m3s(Qt_m3s)} × {f4(res.P_RTI)}) / (75 × {eta/100}) = <FormulaVal>{f2(potCv)} cv</FormulaVal>
        </Formula>
      ) : (
        <div className="ibox amber mb-2">
          <span className="text-xs">Informe a eficiência global da bomba, acima, pra calcular a potência mínima.</span>
        </div>
      )}
      <div className="text-xs text-ink-faint uppercase tracking-[.07em] mt-4 mb-2">Ponto de operação para seleção</div>
      <Table>
        <thead><tr><TH center>Q (m³/h)</TH><TH center>Hm (mca)</TH><TH center>Potência mínima (cv)</TH><TH center>Potência mínima (kW)</TH></tr></thead>
        <tbody>
          <tr>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-red font-mono">{f2(Qt_m3h)}</span></td>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-red font-mono">{f2(res.P_RTI)}</span></td>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-amber font-mono">{temEta ? f2(potCv) : '—'}</span></td>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-amber font-mono">{temEta ? f2(potKw) : '—'}</span></td>
          </tr>
        </tbody>
      </Table>
    </div>
  )
}

// ── Etapas ────────────────────────────────────────────────────────────
// Mesmo componente de menu lateral do wizard de configuração inicial do
// projeto (StepsNav.jsx, ver ConfiguracaoPage.jsx) — aqui sem trava entre
// etapas (isUnlocked sempre true, o RT pode ir e voltar livremente), só
// com um indicativo de "concluído"/"pendente" por etapa.
const ETAPAS_HIDRANTES = [
  { label: 'Classificação do Sistema',          sub: 'Tipo, RTI e sistema aplicado' },
  { label: 'Dimensionamento do Sistema',         sub: 'Perdas de carga, cotas e pressão' },
  { label: 'Dimensionamento da Bomba de Incêndio', sub: 'Eficiência e potência' },
]

// ── Page Principal ────────────────────────────────────────────────────
export default function HidrantesPage() {
  const { state, dispatch } = useProjeto()
  // Persistido em state.hidrantes.dimensionamento (não mais useState local)
  // pra sobreviver navegação/reload e alimentar também o memorial de
  // cálculo (memorial/hidrantesCalculo.js, sempre a última folha do
  // memorial) — mesmo payload sincronizado pelo plugin, sem transformação.
  const dados = state.hidrantes.dimensionamento
  const norma = getHidrantes(state.uf)
  const [importErro, setImportErro] = useState(null)
  const [buscando,   setBuscando]   = useState(false)
  const [etapa, setEtapa] = useState(1)
  const fileInputRef = useRef(null)

  const aplicarHidrantes = payload => {
    dispatch({ type: 'SET_HIDRANTES', changes: { dimensionamento: payload } })
    setImportErro(null)
  }

  const eta = state.hidrantes.bombaEficiencia
  const potenciaAdotada = state.hidrantes.bombaPotenciaAdotada
  const { potCv, potKw } = dados ? calcPotenciaBomba(dados.res.Qt, dados.res.P_RTI, eta) : { potCv: null, potKw: null }

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result)
        if (!json.hidrantes) throw new Error('Chave "hidrantes" não encontrada no arquivo.')
        aplicarHidrantes(json.hidrantes)
      } catch (err) {
        setImportErro(err.message || 'Arquivo inválido.')
        dispatch({ type: 'SET_HIDRANTES', changes: { dimensionamento: null } })
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  // Hidrantes é a única medida que fica geral (compartilhada entre todas
  // as estruturas do projeto, sem escopo) — se mais de um arquivo Revit
  // sincronizar hidrantes, o último a enviar substitui o anterior sem
  // aviso. Por isso confirma antes de puxar, já que é sempre uma troca
  // completa do dimensionamento atual.
  const handleBuscarRevit = async () => {
    if (dados && !window.confirm('Isso substitui o dimensionamento de hidrantes atual pelo mais recente sincronizado do Revit. Continuar?')) return
    setBuscando(true)
    const { data, error } = await supabase
      .from('revit_syncs_latest').select('payload').eq('projeto_id', state.id).eq('medida', 'hidrantes').maybeSingle()
    setBuscando(false)
    if (error || !data) {
      setImportErro('Nenhum dado de hidrantes sincronizado do Revit ainda para este projeto.')
      dispatch({ type: 'SET_HIDRANTES', changes: { dimensionamento: null } })
      return
    }
    aplicarHidrantes(data.payload)
  }

  // Status por etapa pro menu lateral (mesmo esquema visual de
  // useStepStatus.js: 'done' = concluída, 'partial' = com algo pendente,
  // undefined = ainda não iniciada) — aqui calculado direto, sem hook
  // próprio, já que são só 3 etapas com critério simples.
  const getStatus = n => {
    if (n === 1) return state.hidrantes.tipo ? 'done' : undefined
    if (n === 2) return dados ? 'done' : undefined
    if (n === 3) return eta && potenciaAdotada ? 'done' : dados ? 'partial' : undefined
    return undefined
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <StepsNav
        steps={ETAPAS_HIDRANTES}
        current={etapa}
        isUnlocked={() => true}
        getStatus={getStatus}
        onGo={setEtapa}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
            <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
              <Icon name={SISTEMA_ICON.hidrantes} size={20} color="var(--color-red)" className="shrink-0"/>
              Hidrantes / Mangotinho
            </h2>
            <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
              Classificação conforme NT 22 CBMMA / NBR 13714 — o dimensionamento hidráulico é calculado pelo plugin Revit a partir dela.
            </p>
          </div>
        </div>

        {etapa === 1 && (
          <FormularioSistema/>
        )}

        {etapa === 2 && (
          <>
            <div className="flex items-center justify-between gap-4 mb-7">
              <div>
                <h3 className="text-sm font-bold text-ink m-0 mb-1">Dimensionamento (plugin Revit)</h3>
                <p className="text-[12px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
                  Resultados calculados pelo plugin a partir da classificação da Etapa 1.
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
                <button className="btn-ghost flex items-center gap-1.5 whitespace-nowrap" onClick={handleBuscarRevit} disabled={buscando}>
                  <Icon name="upload" size={13}/>
                  {buscando ? 'Buscando…' : 'Buscar do Revit'}
                </button>
                <button type="button" className="text-[10px] text-ink-faint hover:text-ink underline bg-transparent border-none cursor-pointer p-0" onClick={() => fileInputRef.current?.click()}>
                  ou importar de um arquivo .json
                </button>
              </div>
            </div>

            {importErro && (
              <div className="ibox red mb-6">
                <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
                <span className="text-xs">Erro ao importar: {importErro}</span>
              </div>
            )}

            {!dados && !importErro && (
              <div className="py-[60px] px-10 text-center border border-dashed border-border rounded-lg text-ink-faint">
                <Icon name="upload" size={32} color="var(--color-border)"/>
                <div className="mt-3 text-[13px]">Importe o <strong>firedata.json</strong> gerado pelo plugin Revit para visualizar o dimensionamento.</div>
              </div>
            )}

            {dados && (
              <>
                {dados._timestamp && (
                  <div className="ibox green mb-6">
                    <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
                    <span className="text-xs">Dados importados do Revit — exportação: <strong>{dados._timestamp}</strong> · Método: <strong>{dados.metodo}</strong></span>
                  </div>
                )}

                <DadosDoSistema d={dados}/>

                <ResumoExecutivo d={dados}/>

                <ResultadoHidraulico d={dados}/>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-[.05em] mb-3">Perdas de Carga por Trecho</h4>
                  <PerdasPorTrecho d={dados} norma={norma}/>
                </div>
              </>
            )}
          </>
        )}

        {etapa === 3 && (
          <>
            {!dados ? (
              <div className="ibox amber mb-6">
                <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
                <span className="text-xs">Calcule o dimensionamento na Etapa 2 (Dimensionamento do Sistema) antes de dimensionar a bomba.</span>
              </div>
            ) : (
              <>
                <EficienciaPotenciaAdotada
                  eta={eta}
                  onChangeEta={v => dispatch({ type: 'SET_HIDRANTES', changes: { bombaEficiencia: v } })}
                  potenciaAdotada={potenciaAdotada}
                  onChangePotenciaAdotada={v => dispatch({ type: 'SET_HIDRANTES', changes: { bombaPotenciaAdotada: v } })}
                  potCv={potCv}
                />
                <h4 className="text-xs font-bold text-ink uppercase tracking-[.05em] mb-3">Dimensionamento da Bomba de Recalque</h4>
                <Bomba d={dados} eta={eta} potCv={potCv} potKw={potKw}/>
              </>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
