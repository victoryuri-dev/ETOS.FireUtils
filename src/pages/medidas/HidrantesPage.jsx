import { useState, useRef } from 'react'
import Icon from '../../components/ui/Icon'

// ── Formatação ────────────────────────────────────────────────────────
const f4  = n => Number(n).toFixed(4)
const f2  = n => Number(n).toFixed(2)
const f3  = n => Number(n).toFixed(3)
const fmca = n => `${f4(n)} mca`
const fm   = n => `${f4(n)} m`
const lmin = n => `${f2(n)} L/min`
const m3s  = n => `${n.toFixed(4)} m³/s`
const ms   = n => `${f3(n)} m/s`
const V_MAX = 3.0

// ── Shared UI ─────────────────────────────────────────────────────────
function SecTitle({ n, label }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-md bg-red flex items-center justify-center text-[11px] font-bold text-white shrink-0">{n}</div>
      <h3 className="text-sm font-bold text-ink m-0">{label}</h3>
    </div>
  )
}
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
function VelChip({ v }) {
  const ok = v <= V_MAX
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

// ── Resumo Executivo ──────────────────────────────────────────────────
function ResumoExecutivo({ d }) {
  const { res, dados_sistema } = d
  const pmin = dados_sistema.pressao_min
  const pmax = 100

  const cards = [
    {
      id: 'HID-01', label: '1º MAIS DESFAVORÁVEL', color: 'var(--color-red)',
      rows: [
        { label:'Pressão na válvula', val: fmca(res.p_hid01) },
        { label:'Vazão real',         val: lmin(res.Q_h01) },
        { label:'Σhf percurso',       val: fmca(res.Hf_Hid01) },
      ],
      atende: res.p_hid01 >= pmin && res.p_hid01 <= pmax,
    },
    {
      id: 'HID-02', label: '2º MAIS DESFAVORÁVEL', color: 'var(--color-amber)',
      rows: [
        { label:'Pressão na válvula', val: fmca(res.p_hid02) },
        { label:'Vazão real',         val: lmin(res.Q_h02) },
        { label:'Σhf percurso',       val: fmca(res.Hf_Hid02) },
      ],
      atende: res.p_hid02 >= pmin && res.p_hid02 <= pmax,
    },
    {
      id: 'BOMBA', label: 'PONTO DE OPERAÇÃO', color: 'var(--color-green)',
      rows: [
        { label:'Altura manométrica (Ht)', val: fmca(res.Ht) },
        { label:'Vazão total (Qt)',        val: lmin(res.Qt_final) },
        { label:'Qt em m³/h',             val: `${f2(res.Qt_final / 1000 * 60)} m³/h` },
        { label:'Potência mínima',         val: `${f2(d.pot_cv)} cv` },
        { label:'Potência mínima',         val: `${f2(d.pot_kw)} kW` },
      ],
      atende: null,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
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

// ── S1: Dados Normativos ──────────────────────────────────────────────
function DadosNormativos({ d }) {
  const { dados_sistema, valor_sistema, calculo_escolha, C_HW } = d
  const rows = [
    { param:'Classificação',          val: valor_sistema,                                                     ref:'NT 22 CBMMA' },
    { param:'Método de cálculo',      val: calculo_escolha,                                                   ref:'—' },
    { param:'Vazão mínima (Qmin)',    val: `${dados_sistema.vazao_min} L/min = ${(dados_sistema.vazao_min/1000/60).toFixed(4)} m³/s`, ref:'NT 22' },
    { param:'Vazão total (Qt)',       val: `${dados_sistema.vazao_min * 2} L/min = ${(dados_sistema.vazao_min*2/1000/60).toFixed(4)} m³/s`, ref:'2 hidrantes simultâneos' },
    { param:'Pressão mínima (Pmin)',  val: `${dados_sistema.pressao_min} mca`,                                ref:'NT 22' },
    { param:'Pressão máxima',         val: '100 mca',                                                         ref:'NT 22' },
    { param:'Coef. Hazen-Williams (C)', val: String(C_HW),                                                   ref:'Aço / Ferro galvanizado' },
    { param:'Velocidade máxima',      val: `${V_MAX.toFixed(1)} m/s`,                                         ref:'NBR 13714' },
  ]
  if (calculo_escolha !== 'Válvula do Hidrante') {
    rows.push({ param:'Comp. mangueira', val:`${dados_sistema.mangueira_comp} m — DN ${dados_sistema.mangueira_dn}`, ref:'Projeto' })
  }
  return (
    <Table>
      <thead><tr><TH w="35%">Parâmetro</TH><TH>Valor</TH><TH>Referência</TH></tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <TD muted>{r.param}</TD>
            <TD bold>{r.val}</TD>
            <TD muted>{r.ref}</TD>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

// ── S2: Cotas ─────────────────────────────────────────────────────────
function Cotas({ d }) {
  const pontos = [
    { id:'RTI',    z: d.Z_RTI },
    { id:'HID-01', z: d.Z_HID01 },
    { id:'HID-02', z: d.Z_HID02 },
  ]
  const percursos = [
    { label:'RTI → HID-01', dz: d.Hz_H1, abaixo: d.Z_HID01 < d.Z_RTI },
    { label:'RTI → HID-02', dz: d.Hz_H2, abaixo: d.Z_HID02 < d.Z_RTI },
  ]
  return (
    <div className="flex flex-col gap-3.5">
      <Table>
        <thead><tr><TH>Ponto</TH><TH right>Cota Z (m)</TH></tr></thead>
        <tbody>
          {pontos.map(p => (
            <tr key={p.id}>
              <TD bold>{p.id}</TD>
              <td className="py-[9px] px-3.5 text-right border-b border-solid border-border-2">
                <span className="font-mono font-bold text-amber">{f3(p.z)} m</span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Table>
        <thead><tr><TH>Percurso</TH><TH right>ΔZ (m)</TH><TH center>Condição</TH></tr></thead>
        <tbody>
          {percursos.map(p => (
            <tr key={p.label}>
              <TD bold>{p.label}</TD>
              <td className="py-[9px] px-3.5 text-right border-b border-solid border-border-2">
                <span className="font-mono font-bold text-amber">{f3(p.dz)}</span>
              </td>
              <td className="py-[9px] px-3.5 text-center border-b border-solid border-border-2">
                <span className={`text-[11px] py-[3px] px-2 rounded font-medium border border-solid ${p.abaixo?'bg-blue-dim border-blue-border text-[#6aabff]':'bg-red-dim border-red-border text-red'}`}>
                  {p.abaixo ? 'Hidrante abaixo da RTI' : 'Hidrante acima da RTI'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="text-[11px] text-ink-faint leading-[1.6]">
        ΔZ = Z<sub>RTI</sub> − Z<sub>Hidrante</sub>. Negativo indica hidrante acima da RTI — a bomba precisa vencer essa altura.
      </div>
    </div>
  )
}

// ── S3: Perdas de Carga ───────────────────────────────────────────────
function TrechoCard({ id, t, d }) {
  const dmm = (t.D * 1000).toFixed(1)
  return (
    <Card className="mb-3">
      <CardHeader>
        <span className="text-[11px] font-bold py-0.5 px-2 rounded bg-surface border border-solid border-border text-ink-faint font-mono">{id.toUpperCase()}</span>
        <span className="text-[13px] font-semibold text-ink">{t.label}</span>
      </CardHeader>
      <div className="py-3.5 px-[18px]">
        <Table>
          <thead><tr><TH>Item</TH><TH>Valor</TH></tr></thead>
          <tbody>
            <tr><TD muted>Comprimento real (L)</TD><TD>{fm(t.L)}</TD></tr>
            <tr><TD muted>Diâmetro interno médio (D)</TD><TD red bold>{dmm} mm ({f4(t.D)} m)</TD></tr>
            <tr><TD muted>Vazão no trecho (Q)</TD><TD red bold>{lmin(t.Q_lmin)} ({m3s(t.Q_m3s)})</TD></tr>
            <tr>
              <TD muted>Velocidade (V = Q/A)</TD>
              <td className="py-[9px] px-3.5 border-b border-solid border-border-2"><VelChip v={t.V}/></td>
            </tr>
          </tbody>
        </Table>

        <div className="text-[11px] text-ink-faint uppercase tracking-[.07em] mt-3 mb-1.5">
          Acessórios ({t.n_aces} tipo{t.n_aces !== 1 ? 's' : ''}):
        </div>
        <Table>
          <thead><tr><TH w={48}>Qtd</TH><TH>Descrição</TH><TH right>Le unit. (m)</TH><TH right>Σ Le (m)</TH></tr></thead>
          <tbody>
            {t.acessorios.map((a, i) => (
              <tr key={i}>
                <TD red bold center>{a.qtd}</TD>
                <TD>{a.nome}</TD>
                <TD right mono muted>{f4(a.leq_unit)}</TD>
                <TD right mono red bold>{f4(a.leq_tot)}</TD>
              </tr>
            ))}
            <tr>
              <TD muted center>—</TD>
              <TD bold>Total</TD>
              <TD muted right>—</TD>
              <TD right bold red>{fm(t.Leq)}</TD>
            </tr>
          </tbody>
        </Table>

        <Formula>
          Lt = L + Σ Le = {f4(t.L)} + {f4(t.Leq)} = <FormulaVal>{fm(t.Lt)}</FormulaVal>
        </Formula>
        <Formula>
          hf = 10,643 × {f4(t.Lt)} × {f4(t.Q_m3s)}<sup>1,852</sup> / ({d.C_HW}<sup>1,852</sup> × {f4(t.D)}<sup>4,871</sup>) = <FormulaVal>{fmca(t.Hf)}</FormulaVal>
        </Formula>
      </div>
    </Card>
  )
}

function PerdasCarga({ d }) {
  const trechos = Object.entries(d.res.hf).sort(([a],[b]) => a.localeCompare(b))
  return (
    <div>
      {trechos.map(([id, t]) => <TrechoCard key={id} id={id} t={t} d={d}/>)}
      <div className="mt-4">
        <div className="text-xs text-ink-faint uppercase tracking-[.07em] mb-2">Resumo dos Trechos</div>
        <Table>
          <thead><tr><TH>Trecho</TH><TH right>Q (L/min)</TH><TH right>D (mm)</TH><TH right>Lt (m)</TH><TH center>V (m/s)</TH><TH right>Hf (mca)</TH></tr></thead>
          <tbody>
            {trechos.map(([id, t]) => (
              <tr key={id}>
                <TD bold>{t.label}</TD>
                <TD right red mono>{f2(t.Q_lmin)}</TD>
                <TD right mono muted>{(t.D*1000).toFixed(1)}</TD>
                <TD right mono muted>{f4(t.Lt)}</TD>
                <td className="py-[9px] px-3.5 text-center border-b border-solid border-border-2"><VelChip v={t.V}/></td>
                <TD right bold red mono>{f4(t.Hf)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

// ── S4: Altura Manométrica ────────────────────────────────────────────
function AlturaMano({ d }) {
  const { res, dados_sistema, Hm_mangueira, calculo_escolha } = d
  const pmin = dados_sistema.pressao_min
  const isEsguicho = calculo_escolha !== 'Válvula do Hidrante'

  const rows = [
    { parcela: 'Σhf (percurso crítico)', val: fmca(res.Hf_governa), desc: 'Soma das perdas por atrito' },
    { parcela: 'ΔZ (com sinal)',         val: `${f4(res.Hz_governa)} m`, desc: res.Hz_governa > 0 ? 'RTI acima do hidrante — favorável (reduz Ht)' : 'RTI abaixo do hidrante — desfavorável (aumenta Ht)' },
    ...(isEsguicho ? [{ parcela: 'Hm (mangueira)', val: fmca(Hm_mangueira), desc: 'Perda de carga na mangueira' }] : []),
    { parcela: 'Pmin', val: `${pmin} mca`, desc: 'NT 22 CBMMA' },
  ]

  const formula = isEsguicho
    ? `Ht = Σhf − ΔZ + Hm + Pmin = ${f4(res.Hf_governa)} − (${f4(res.Hz_governa)}) + ${f4(Hm_mangueira)} + ${pmin} = `
    : `Ht = Σhf − ΔZ + Pmin = ${f4(res.Hf_governa)} − (${f4(res.Hz_governa)}) + ${pmin} = `

  return (
    <div>
      <div className="text-xs text-ink-faint mb-2.5">
        Percurso crítico: <strong className="text-red">{res.hid_governa}</strong>
      </div>
      <Table>
        <thead><tr><TH>Parcela</TH><TH>Valor</TH><TH>Descrição</TH></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <TD muted>{r.parcela}</TD>
              <TD red bold mono>{r.val}</TD>
              <TD muted>{r.desc}</TD>
            </tr>
          ))}
        </tbody>
      </Table>
      <Formula>{formula}<FormulaVal>{fmca(res.Ht)}</FormulaVal></Formula>
    </div>
  )
}

// ── S5: Pressão e Vazão ───────────────────────────────────────────────
function PressaoVazao({ d }) {
  const { res, dados_sistema } = d
  const pmin = dados_sistema.pressao_min
  const pmax = 100

  const hids = [
    {
      id: 'HID-01', label: '1º mais desfavorável',
      Hf: res.Hf_Hid01, dZ: d.Hz_H1, P: res.p_hid01, Q: res.Q_h01,
      trechos: 'T1 + T2 + trecho exclusivo',
    },
    {
      id: 'HID-02', label: '2º mais desfavorável',
      Hf: res.Hf_Hid02, dZ: d.Hz_H2, P: res.p_hid02, Q: res.Q_h02,
      trechos: 'T1 + T2 + trecho exclusivo',
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <Formula>P = Ht + ΔZ − Σhf &nbsp;|&nbsp; Q = K × √P &nbsp;|&nbsp; Iteração convergida em {res.iteracoes} ciclo(s) · K = {f4(res.K)} · ΔP = {fmca(res.dZ_max_H1)}</Formula>
      {hids.map(h => (
        <Card key={h.id}>
          <CardHeader>
            <span className="text-[11px] font-bold py-0.5 px-2 rounded bg-red-dim border border-solid border-red-border text-red font-mono">{h.id}</span>
            <span className="text-xs text-ink-faint">{h.label}</span>
          </CardHeader>
          <div className="py-3.5 px-[18px]">
            <Table>
              <thead><tr><TH>Parâmetro</TH><TH>Desenvolvimento</TH><TH right>Resultado</TH></tr></thead>
              <tbody>
                <tr>
                  <TD muted>Σhf do percurso</TD>
                  <TD muted>{h.trechos}</TD>
                  <TD right red bold mono>{fmca(h.Hf)}</TD>
                </tr>
                <tr>
                  <TD muted>ΔZ</TD>
                  <TD muted>Z<sub>RTI</sub> − Z<sub>{h.id}</sub></TD>
                  <TD right red bold mono>{f4(h.dZ)} m</TD>
                </tr>
                <tr>
                  <TD muted>Pressão na válvula (P)</TD>
                  <TD muted>{f4(res.Ht)} + ({f4(h.dZ)}) − {f4(h.Hf)}</TD>
                  <TD right red bold mono>{fmca(h.P)}</TD>
                </tr>
                <tr>
                  <TD muted>Vazão real (Q)</TD>
                  <TD muted>{f4(res.K)} × √{f4(h.P)}</TD>
                  <TD right red bold mono>{lmin(h.Q)}</TD>
                </tr>
                <tr>
                  <TD muted>Verificação normativa</TD>
                  <TD muted>Pmin = {pmin} / Pmax = {pmax} mca</TD>
                  <td className="py-[9px] px-3.5 text-right border-b border-solid border-border-2">
                    <AtendeChip ok={h.P >= pmin && h.P <= pmax}/>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── S6: Bomba ─────────────────────────────────────────────────────────
function Bomba({ d }) {
  const { res, eta, pot_cv, pot_kw } = d
  const Qt_m3s = res.Qt_final / 1000 / 60
  const Qt_m3h = res.Qt_final / 1000 * 60

  const rows = [
    { param:'Vazão total convergida (Qt)', val:`${lmin(res.Qt_final)} = ${m3s(Qt_m3s)}`, obs:`Q_HID-01 + Q_HID-02` },
    { param:'Altura manométrica (Ht)',     val: fmca(res.Ht),                              obs:`Percurso crítico: ${res.hid_governa}` },
    { param:'Eficiência global (η)',       val:`${eta}%`,                                  obs:'Informada pelo projetista' },
  ]

  return (
    <div>
      <Table>
        <thead><tr><TH>Parâmetro</TH><TH>Valor</TH><TH>Observação</TH></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <TD muted>{r.param}</TD>
              <TD red bold mono>{r.val}</TD>
              <TD muted>{r.obs}</TD>
            </tr>
          ))}
        </tbody>
      </Table>
      <Formula>
        Pcv = (1000 × {m3s(Qt_m3s)} × {f4(res.Ht)}) / (75 × {eta/100}) = <FormulaVal>{f2(pot_cv)} cv</FormulaVal>
      </Formula>
      <div className="text-xs text-ink-faint uppercase tracking-[.07em] mt-4 mb-2">Ponto de operação para seleção</div>
      <Table>
        <thead><tr><TH center>Q (m³/h)</TH><TH center>Hm (mca)</TH><TH center>Potência mínima (cv)</TH><TH center>Potência mínima (kW)</TH></tr></thead>
        <tbody>
          <tr>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-red font-mono">{f2(Qt_m3h)}</span></td>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-red font-mono">{f2(res.Ht)}</span></td>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-amber font-mono">{f2(pot_cv)}</span></td>
            <td className="py-3 px-3.5 text-center border-b border-solid border-border-2"><span className="text-lg font-bold text-amber font-mono">{f2(pot_kw)}</span></td>
          </tr>
        </tbody>
      </Table>
    </div>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function HidrantesPage() {
  const [dados,      setDados]      = useState(null)
  const [importErro, setImportErro] = useState(null)
  const [importTs,   setImportTs]   = useState(null)
  const fileInputRef = useRef(null)

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result)
        if (!json.hidrantes) throw new Error('Chave "hidrantes" não encontrada no arquivo.')
        setDados(json.hidrantes)
        setImportTs(json.hidrantes._timestamp || null)
        setImportErro(null)
      } catch (err) {
        setImportErro(err.message || 'Arquivo inválido.')
        setDados(null)
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  const sections = dados ? [
    { n:1, label:'Dados Normativos do Sistema',           content: <DadosNormativos d={dados}/> },
    { n:2, label:'Cotas Altimétricas e Desníveis',        content: <Cotas d={dados}/> },
    { n:3, label:'Perdas de Carga por Trecho (Hazen-Williams)', content: <PerdasCarga d={dados}/> },
    { n:4, label:'Altura Manométrica Total (Ht)',          content: <AlturaMano d={dados}/> },
    { n:5, label:'Pressão e Vazão nos Hidrantes',          content: <PressaoVazao d={dados}/> },
    { n:6, label:'Dimensionamento da Bomba de Recalque',   content: <Bomba d={dados}/> },
  ] : []

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
            <h2 className="text-[22px] font-bold text-ink mb-1.5">Hidrantes / Mangotinho</h2>
            <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
              Resultados gerados pelo plugin Revit e apresentados conforme NT 22 CBMMA / NBR 13714.
            </p>
          </div>
          <div className="shrink-0">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
            <button className="btn-ghost flex items-center gap-1.5 whitespace-nowrap" onClick={() => fileInputRef.current?.click()}>
              <Icon name="upload" size={13}/>
              Importar do Revit
            </button>
            <div className="text-[10px] text-ink-faint mt-[5px] text-right">firedata.json</div>
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
            {importTs && (
              <div className="ibox green mb-6">
                <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
                <span className="text-xs">Dados importados do Revit — exportação: <strong>{importTs}</strong> · Método: <strong>{dados.calculo_escolha}</strong></span>
              </div>
            )}

            <ResumoExecutivo d={dados}/>

            {sections.map(s => (
              <div key={s.n} className="mb-8">
                <SecTitle n={s.n} label={s.label}/>
                {s.content}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
