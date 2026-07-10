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
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
      <div style={{ width:24, height:24, borderRadius:6, background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{n}</div>
      <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text)', margin:0 }}>{label}</h3>
    </div>
  )
}
function Table({ children }) {
  return <div style={{ border:'.5px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', marginBottom:4 }}><table style={{ width:'100%', borderCollapse:'collapse' }}>{children}</table></div>
}
function TH({ children, right, center, w }) {
  return <th style={{ fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', fontWeight:500, padding:'9px 14px', textAlign: right?'right':center?'center':'left', borderBottom:'.5px solid var(--border)', background:'var(--surface-2)', whiteSpace:'nowrap', width:w }}>{children}</th>
}
function TD({ children, red, green, bold, muted, right, center, mono }) {
  const color = red ? 'var(--red)' : green ? 'var(--green)' : muted ? 'var(--text-faint)' : 'var(--text)'
  return <td style={{ padding:'9px 14px', fontSize:13, color, fontWeight:bold?700:400, borderBottom:'.5px solid var(--border-2)', textAlign:right?'right':center?'center':'left', verticalAlign:'middle', fontFamily:mono?'monospace':'inherit' }}>{children}</td>
}
function VelChip({ v }) {
  const ok = v <= V_MAX
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:4, background: ok?'var(--green-dim)':'var(--red-dim)', border:`.5px solid ${ok?'var(--green-border)':'var(--red-border)'}`, color: ok?'var(--green)':'var(--red)', fontWeight:700, fontSize:12, fontFamily:'monospace' }}>{ok?'✓':' ✗'} {ms(v)}</span>
}
function AtendeChip({ ok }) {
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:4, background: ok?'var(--green-dim)':'var(--red-dim)', border:`.5px solid ${ok?'var(--green-border)':'var(--red-border)'}`, color: ok?'var(--green)':'var(--red)', fontWeight:700, fontSize:11 }}>{ok ? 'ATENDE' : 'NÃO ATENDE'}</span>
}
function Formula({ children }) {
  return <div style={{ background:'var(--bg)', border:'.5px solid var(--border)', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:12, color:'var(--text-muted)', fontFamily:'monospace', lineHeight:1.6, marginTop:8 }}>{children}</div>
}
function FormulaVal({ children }) {
  return <strong style={{ color:'var(--red)' }}>{children}</strong>
}
function Card({ children, style }) {
  return <div style={{ background:'var(--surface)', border:'.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', ...style }}>{children}</div>
}
function CardHeader({ children }) {
  return <div style={{ padding:'12px 18px', borderBottom:'.5px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', gap:8 }}>{children}</div>
}

// ── Resumo Executivo ──────────────────────────────────────────────────
function ResumoExecutivo({ d }) {
  const { res, dados_sistema } = d
  const pmin = dados_sistema.pressao_min
  const pmax = 100

  const cards = [
    {
      id: 'HID-01', label: '1º MAIS DESFAVORÁVEL', color: 'var(--red)',
      rows: [
        { label:'Pressão na válvula', val: fmca(res.p_hid01) },
        { label:'Vazão real',         val: lmin(res.Q_h01) },
        { label:'Σhf percurso',       val: fmca(res.Hf_Hid01) },
      ],
      atende: res.p_hid01 >= pmin && res.p_hid01 <= pmax,
    },
    {
      id: 'HID-02', label: '2º MAIS DESFAVORÁVEL', color: 'var(--amber)',
      rows: [
        { label:'Pressão na válvula', val: fmca(res.p_hid02) },
        { label:'Vazão real',         val: lmin(res.Q_h02) },
        { label:'Σhf percurso',       val: fmca(res.Hf_Hid02) },
      ],
      atende: res.p_hid02 >= pmin && res.p_hid02 <= pmax,
    },
    {
      id: 'BOMBA', label: 'PONTO DE OPERAÇÃO', color: 'var(--green)',
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
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:32 }}>
      {cards.map(c => (
        <Card key={c.id}>
          <CardHeader>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background:'var(--surface)', border:`.5px solid var(--border)`, color: c.color, fontFamily:'monospace' }}>{c.id}</span>
            <span style={{ fontSize:10, color:'var(--text-faint)', fontWeight:500, textTransform:'uppercase', letterSpacing:'.06em' }}>{c.label}</span>
          </CardHeader>
          <div style={{ padding:'14px 18px', display:'flex', flexDirection:'column', gap:10 }}>
            {c.rows.map((r, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8 }}>
                <span style={{ fontSize:12, color:'var(--text-faint)' }}>{r.label}</span>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'monospace', whiteSpace:'nowrap' }}>{r.val}</span>
              </div>
            ))}
            {c.atende !== null && (
              <div style={{ marginTop:4 }}>
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
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <Table>
        <thead><tr><TH>Ponto</TH><TH right>Cota Z (m)</TH></tr></thead>
        <tbody>
          {pontos.map(p => (
            <tr key={p.id}>
              <TD bold>{p.id}</TD>
              <td style={{ padding:'9px 14px', textAlign:'right', borderBottom:'.5px solid var(--border-2)' }}>
                <span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--amber)' }}>{f3(p.z)} m</span>
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
              <td style={{ padding:'9px 14px', textAlign:'right', borderBottom:'.5px solid var(--border-2)' }}>
                <span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--amber)' }}>{f3(p.dz)}</span>
              </td>
              <td style={{ padding:'9px 14px', textAlign:'center', borderBottom:'.5px solid var(--border-2)' }}>
                <span style={{ fontSize:11, padding:'3px 8px', borderRadius:4, background: p.abaixo?'var(--blue-dim)':'var(--red-dim)', border:`.5px solid ${p.abaixo?'var(--blue-border)':'var(--red-border)'}`, color: p.abaixo?'#6aabff':'var(--red)', fontWeight:500 }}>
                  {p.abaixo ? 'Hidrante abaixo da RTI' : 'Hidrante acima da RTI'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div style={{ fontSize:11, color:'var(--text-faint)', lineHeight:1.6 }}>
        ΔZ = Z<sub>RTI</sub> − Z<sub>Hidrante</sub>. Negativo indica hidrante acima da RTI — a bomba precisa vencer essa altura.
      </div>
    </div>
  )
}

// ── S3: Perdas de Carga ───────────────────────────────────────────────
function TrechoCard({ id, t, d }) {
  const dmm = (t.D * 1000).toFixed(1)
  return (
    <Card style={{ marginBottom:12 }}>
      <CardHeader>
        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background:'var(--surface)', border:'.5px solid var(--border)', color:'var(--text-faint)', fontFamily:'monospace' }}>{id.toUpperCase()}</span>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{t.label}</span>
      </CardHeader>
      <div style={{ padding:'14px 18px' }}>
        <Table>
          <thead><tr><TH>Item</TH><TH>Valor</TH></tr></thead>
          <tbody>
            <tr><TD muted>Comprimento real (L)</TD><TD>{fm(t.L)}</TD></tr>
            <tr><TD muted>Diâmetro interno médio (D)</TD><TD red bold>{dmm} mm ({f4(t.D)} m)</TD></tr>
            <tr><TD muted>Vazão no trecho (Q)</TD><TD red bold>{lmin(t.Q_lmin)} ({m3s(t.Q_m3s)})</TD></tr>
            <tr>
              <TD muted>Velocidade (V = Q/A)</TD>
              <td style={{ padding:'9px 14px', borderBottom:'.5px solid var(--border-2)' }}><VelChip v={t.V}/></td>
            </tr>
          </tbody>
        </Table>

        <div style={{ fontSize:11, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', margin:'12px 0 6px' }}>
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
      <div style={{ marginTop:16 }}>
        <div style={{ fontSize:12, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Resumo dos Trechos</div>
        <Table>
          <thead><tr><TH>Trecho</TH><TH right>Q (L/min)</TH><TH right>D (mm)</TH><TH right>Lt (m)</TH><TH center>V (m/s)</TH><TH right>Hf (mca)</TH></tr></thead>
          <tbody>
            {trechos.map(([id, t]) => (
              <tr key={id}>
                <TD bold>{t.label}</TD>
                <TD right red mono>{f2(t.Q_lmin)}</TD>
                <TD right mono muted>{(t.D*1000).toFixed(1)}</TD>
                <TD right mono muted>{f4(t.Lt)}</TD>
                <td style={{ padding:'9px 14px', textAlign:'center', borderBottom:'.5px solid var(--border-2)' }}><VelChip v={t.V}/></td>
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
      <div style={{ fontSize:12, color:'var(--text-faint)', marginBottom:10 }}>
        Percurso crítico: <strong style={{ color:'var(--red)' }}>{res.hid_governa}</strong>
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
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <Formula>P = Ht + ΔZ − Σhf &nbsp;|&nbsp; Q = K × √P &nbsp;|&nbsp; Iteração convergida em {res.iteracoes} ciclo(s) · K = {f4(res.K)} · ΔP = {fmca(res.dZ_max_H1)}</Formula>
      {hids.map(h => (
        <Card key={h.id}>
          <CardHeader>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background:'var(--red-dim)', border:'.5px solid var(--red-border)', color:'var(--red)', fontFamily:'monospace' }}>{h.id}</span>
            <span style={{ fontSize:12, color:'var(--text-faint)' }}>{h.label}</span>
          </CardHeader>
          <div style={{ padding:'14px 18px' }}>
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
                  <td style={{ padding:'9px 14px', textAlign:'right', borderBottom:'.5px solid var(--border-2)' }}>
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
      <div style={{ fontSize:12, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', margin:'16px 0 8px' }}>Ponto de operação para seleção</div>
      <Table>
        <thead><tr><TH center>Q (m³/h)</TH><TH center>Hm (mca)</TH><TH center>Potência mínima (cv)</TH><TH center>Potência mínima (kW)</TH></tr></thead>
        <tbody>
          <tr>
            <td style={{ padding:'12px 14px', textAlign:'center', borderBottom:'.5px solid var(--border-2)' }}><span style={{ fontSize:18, fontWeight:700, color:'var(--red)', fontFamily:'monospace' }}>{f2(Qt_m3h)}</span></td>
            <td style={{ padding:'12px 14px', textAlign:'center', borderBottom:'.5px solid var(--border-2)' }}><span style={{ fontSize:18, fontWeight:700, color:'var(--red)', fontFamily:'monospace' }}>{f2(res.Ht)}</span></td>
            <td style={{ padding:'12px 14px', textAlign:'center', borderBottom:'.5px solid var(--border-2)' }}><span style={{ fontSize:18, fontWeight:700, color:'var(--amber)', fontFamily:'monospace' }}>{f2(pot_cv)}</span></td>
            <td style={{ padding:'12px 14px', textAlign:'center', borderBottom:'.5px solid var(--border-2)' }}><span style={{ fontSize:18, fontWeight:700, color:'var(--amber)', fontFamily:'monospace' }}>{f2(pot_kw)}</span></td>
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
    <div style={{ flex:1, overflowY:'auto' }}>
      <div style={{ maxWidth:980, margin:'0 auto', padding:'32px 40px 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:28 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--red)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:600, marginBottom:4 }}>Medidas de Segurança</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:6 }}>Hidrantes / Mangotinho</h2>
            <p style={{ fontSize:13, color:'var(--text-faint)', lineHeight:1.6, maxWidth:600, margin:0 }}>
              Resultados gerados pelo plugin Revit e apresentados conforme NT 22 CBMMA / NBR 13714.
            </p>
          </div>
          <div style={{ flexShrink:0 }}>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImport}/>
            <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
              <Icon name="upload" size={13}/>
              Importar do Revit
            </button>
            <div style={{ fontSize:10, color:'var(--text-faint)', marginTop:5, textAlign:'right' }}>firedata.json</div>
          </div>
        </div>

        {importErro && (
          <div className="ibox red" style={{ marginBottom:24 }}>
            <Icon name="warn" size={13} color="var(--red)" style={{flexShrink:0}}/>
            <span style={{fontSize:12}}>Erro ao importar: {importErro}</span>
          </div>
        )}

        {!dados && !importErro && (
          <div style={{ padding:'60px 40px', textAlign:'center', border:'.5px dashed var(--border)', borderRadius:'var(--radius-lg)', color:'var(--text-faint)' }}>
            <Icon name="upload" size={32} color="var(--border)"/>
            <div style={{ marginTop:12, fontSize:13 }}>Importe o <strong>firedata.json</strong> gerado pelo plugin Revit para visualizar o dimensionamento.</div>
          </div>
        )}

        {dados && (
          <>
            {importTs && (
              <div className="ibox green" style={{ marginBottom:24 }}>
                <Icon name="check" size={13} color="var(--green)" style={{flexShrink:0}}/>
                <span style={{fontSize:12}}>Dados importados do Revit — exportação: <strong>{importTs}</strong> · Método: <strong>{dados.calculo_escolha}</strong></span>
              </div>
            )}

            <ResumoExecutivo d={dados}/>

            {sections.map(s => (
              <div key={s.n} style={{ marginBottom:32 }}>
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
