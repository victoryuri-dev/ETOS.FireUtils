import { useState, useRef } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { supabase } from '../../lib/supabase'
import Icon from '../../components/ui/Icon'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import FormularioSistema from '../../components/hidrantes/FormularioSistema'
import { calcPotenciaBomba } from '../../data/hidrantes_calc'
import { getHidrantes } from '../../data/normas/index'

// ── Formatação ────────────────────────────────────────────────────────
const f4  = n => Number(n).toFixed(4)
const f2  = n => Number(n).toFixed(2)
const f3  = n => Number(n).toFixed(3)
const fmca = n => `${f4(n)} mca`
const fm   = n => `${f4(n)} m`
const lmin = n => `${f2(n)} L/min`
const m3s  = n => `${Number(n).toFixed(4)} m³/s`
const ms   = n => `${f3(n)} m/s`

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
function ResumoExecutivo({ d, potCv, potKw }) {
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
        { label:'Σhf percurso',       val: fmca(res.j.t3.J) },
      ],
      atende: p01 >= pmin && p01 <= pmax,
    },
    {
      id: 'HID-02', label: '2º MAIS DESFAVORÁVEL', color: 'var(--color-amber)',
      rows: [
        { label: labelPressao,        val: fmca(p02) },
        { label:'Vazão real',         val: lmin(res.Q_hd02) },
        { label:'Σhf percurso',       val: fmca(res.j.t4.J) },
      ],
      atende: p02 >= pmin && p02 <= pmax,
    },
    {
      id: 'BOMBA', label: 'PONTO DE OPERAÇÃO', color: 'var(--color-green)',
      rows: [
        { label:'Altura manométrica (Ht)', val: fmca(res.P_RTI) },
        { label:'Vazão total (Qt)',        val: lmin(res.Qt) },
        { label:'Qt em m³/h',              val: `${f2(res.Qt / 1000 * 60)} m³/h` },
        { label:'Potência mínima',         val: potCv != null ? `${f2(potCv)} cv` : '— (informe a eficiência)' },
        { label:'Potência mínima',         val: potKw != null ? `${f2(potKw)} kW` : '—' },
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
function DadosNormativos({ d, norma }) {
  const { dados_sistema, valor_sistema, metodo, C_HW, res } = d
  const isEsguicho = res.esguicho
  const rows = [
    { param:'Classificação',          val: valor_sistema,                                                     ref:'NT 22 CBMMA' },
    { param:'Método de cálculo',      val: metodo,                                                            ref:'—' },
    { param:'Vazão mínima (Qmin)',    val: `${dados_sistema.q_min} L/min = ${(dados_sistema.q_min/1000/60).toFixed(4)} m³/s`, ref:'NT 22' },
    { param:'Vazão total convergida (Qt)', val: `${f2(res.Qt)} L/min = ${(res.Qt/1000/60).toFixed(4)} m³/s`,  ref:'Equilíbrio hidráulico HD01+HD02' },
    { param:'Pressão mínima (Pmin)',  val: `${dados_sistema.p_min} mca`,                                       ref:'NT 22' },
    { param:'Pressão máxima',         val: '100 mca',                                                         ref:'NT 22' },
    { param:'Coef. Hazen-Williams (C)', val: String(C_HW),                                                    ref:'Perfil normativo do estado' },
    { param:'Velocidade máxima',      val: `${norma.V_MAX_TUBULACAO.toFixed(1)} m/s (recalque/descarga) · ${norma.V_MAX_SUCCAO_POSITIVA.toFixed(1)}/${norma.V_MAX_SUCCAO_NEGATIVA.toFixed(1)} m/s (sucção positiva/negativa)`, ref:'NT 22' },
  ]
  if (isEsguicho) {
    rows.push({ param:'Comp. mangueira', val:`${dados_sistema.mang_comp} m — DN ${dados_sistema.mang_dn}`, ref:'Projeto' })
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
  const { cotas } = d
  const { dH } = d.res
  const pontos = [
    { id:'RTI (reservatório)',       z: cotas.z_rti },
    { id:'Sucção (entrada da bomba)', z: cotas.z_succao },
    { id:'Descarga da bomba',        z: cotas.z_recalque },
    { id:'Ponto A (distribuição)',   z: cotas.z_ponto_a },
    { id:'HD01 (mais desfavorável)', z: cotas.z_hd01 },
    { id:'HD02 (2º mais desfavorável)', z: cotas.z_hd02 },
  ]
  const percursos = [
    { label:'HD01 → Ponto A',              dz: dH.t3 },
    { label:'HD02 → Ponto A',              dz: dH.t4 },
    { label:'Ponto A → Descarga da bomba', dz: dH.t2 },
    { label:'Sucção → RTI',                dz: dH.t1 },
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
        <thead><tr><TH>Trecho</TH><TH right>∆Z (m)</TH><TH center>Sentido</TH></tr></thead>
        <tbody>
          {percursos.map(p => (
            <tr key={p.label}>
              <TD bold>{p.label}</TD>
              <td className="py-[9px] px-3.5 text-right border-b border-solid border-border-2">
                <span className="font-mono font-bold text-amber">{f4(p.dz)}</span>
              </td>
              <td className="py-[9px] px-3.5 text-center border-b border-solid border-border-2">
                <span className={`text-[11px] py-[3px] px-2 rounded font-medium border border-solid ${p.dz >= 0 ?'bg-blue-dim border-blue-border text-[#6aabff]':'bg-red-dim border-red-border text-red'}`}>
                  {p.dz >= 0 ? 'Favorável (cota inicial acima)' : 'Desfavorável (cota inicial abaixo)'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="text-[11px] text-ink-faint leading-[1.6]">
        ∆Z = Hi − Hf, na direção da marcha de cálculo. Negativo aumenta a altura manométrica exigida da bomba.
      </div>
    </div>
  )
}

// ── S3: Perdas de Carga ───────────────────────────────────────────────
// Ordem da narrativa: os dois ramais até o Ponto A, depois o recalque até
// a bomba, depois a sucção — mesma sequência da marcha de cálculo.
const ORDEM_TRECHOS = ['t3', 't4', 't2', 't1']

function limiteVelocidade(trechoId, succao, norma) {
  if (trechoId === 't1') return succao === 'positiva' ? norma.V_MAX_SUCCAO_POSITIVA : norma.V_MAX_SUCCAO_NEGATIVA
  return norma.V_MAX_TUBULACAO
}

function SegmentoDiametro({ seg, vLimite }) {
  return (
    <div className="mb-3 last:mb-0">
      <Table>
        <thead><tr><TH>Item — DN{Number(seg.d_mm).toFixed(1)} mm</TH><TH>Valor</TH></tr></thead>
        <tbody>
          <tr><TD muted>Comprimento real (L)</TD><TD>{fm(seg.L)}</TD></tr>
          <tr><TD muted>Comprimento equivalente (Leq)</TD><TD>{fm(seg.Leq)}</TD></tr>
          <tr><TD muted>Comprimento total (Ltotal = L + Leq)</TD><TD red bold>{fm(seg.Ltotal)}</TD></tr>
          <tr><TD muted>Perda unitária (Jun)</TD><TD mono>{Number(seg.Jun).toFixed(6)} m/m</TD></tr>
          <tr><TD muted>Perda de carga (J = Ltotal · Jun)</TD><TD red bold>{fmca(seg.J)}</TD></tr>
          <tr>
            <TD muted>Velocidade (V)</TD>
            <td className="py-[9px] px-3.5 border-b border-solid border-border-2"><VelChip v={seg.V} limite={vLimite}/></td>
          </tr>
        </tbody>
      </Table>
      {seg.acessorios.length > 0 && (
        <Table>
          <thead><tr><TH w={48}>Qtd</TH><TH>Conexão / acessório</TH><TH right>Leq unit. (m)</TH><TH right>Σ Leq (m)</TH></tr></thead>
          <tbody>
            {seg.acessorios.map((a, i) => (
              <tr key={i}>
                <TD red bold center>{a.qtd}</TD>
                <TD>{a.nome}</TD>
                <TD right mono muted>{f4(a.leq_unit)}</TD>
                <TD right mono red bold>{f4(a.leq_tot)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

function TrechoCard({ id, t, succao, norma }) {
  const vLimite = limiteVelocidade(id, succao, norma)
  return (
    <Card className="mb-3">
      <CardHeader>
        <span className="text-[11px] font-bold py-0.5 px-2 rounded bg-surface border border-solid border-border text-ink-faint font-mono">{id.toUpperCase()}</span>
        <span className="text-[13px] font-semibold text-ink">{t.label}</span>
        <span className="text-[11px] text-ink-faint ml-auto">Q = {lmin(t.Q_lmin)}</span>
      </CardHeader>
      <div className="py-3.5 px-[18px]">
        {t.segmentos.map((seg, i) => <SegmentoDiametro key={i} seg={seg} vLimite={vLimite}/>)}
        <Formula>
          J do trecho (soma dos diâmetros) = <FormulaVal>{fmca(t.J)}</FormulaVal>
        </Formula>
      </div>
    </Card>
  )
}

function PerdasCarga({ d, norma }) {
  const trechos = ORDEM_TRECHOS.map(id => [id, d.res.j[id]])
  return (
    <div>
      {trechos.map(([id, t]) => <TrechoCard key={id} id={id} t={t} succao={d.succao} norma={norma}/>)}
      <div className="mt-4">
        <div className="text-xs text-ink-faint uppercase tracking-[.07em] mb-2">Resumo dos Trechos</div>
        <Table>
          <thead><tr><TH>Trecho</TH><TH right>Q (L/min)</TH><TH right>Ltotal (m)</TH><TH right>J (mca)</TH></tr></thead>
          <tbody>
            {trechos.map(([id, t]) => (
              <tr key={id}>
                <TD bold>{t.label}</TD>
                <TD right red mono>{f2(t.Q_lmin)}</TD>
                <TD right mono muted>{f4(t.L + t.Leq)}</TD>
                <TD right bold red mono>{f4(t.J)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

// ── S4: Altura Manométrica ────────────────────────────────────────────
// Ht (= P_RTI) é construído em 3 estágios: pressão no Ponto A (ramal
// governante) → pressão na saída da bomba (+ recalque) → pressão referida
// à RTI (+ sucção) — não uma fórmula fechada de uma linha só.
function AlturaMano({ d }) {
  const { res } = d
  const ramalGov = res.hid_governa
  const trechoGov = ramalGov === 'HD01' ? 't3' : 't4'
  const jGov = res.j[trechoGov]
  const dHGov = res.dH[trechoGov]
  const pRefLbl = res.esguicho ? 'P_valv (ramal governante)' : 'Pmin'

  const etapas = [
    { etapa: pRefLbl,                                  val: fmca(res.P_valv_ref), desc: `Pressão de referência do ramal governante (${ramalGov})` },
    { etapa: `J — ${ramalGov} → Ponto A`,               val: fmca(jGov.J),         desc: 'Perda de carga do ramal governante' },
    { etapa: '∆Z (com sinal)',                          val: `${f4(dHGov)} m`,     desc: dHGov >= 0 ? 'Hidrante acima do Ponto A — favorável' : 'Hidrante abaixo do Ponto A — desfavorável' },
    { etapa: '= Pressão no Ponto A (P_PA)',              val: fmca(res.P_PA),      desc: 'Pressão-alvo do Ponto A (maior entre os dois ramais)' },
    { etapa: 'J — Ponto A → Bomba (recalque)',           val: fmca(res.j.t2.J),    desc: 'Perda de carga no recalque' },
    { etapa: '∆Z (recalque, com sinal)',                 val: `${f4(res.dH.t2)} m`, desc: '' },
    { etapa: '= Pressão na saída da bomba (P_SB)',       val: fmca(res.P_SB),      desc: '' },
    { etapa: 'J — Sucção (bomba → RTI)',                 val: fmca(res.j.t1.J),    desc: 'Perda de carga na sucção' },
    { etapa: '∆Z (sucção, com sinal)',                   val: `${f4(res.dH.t1)} m`, desc: '' },
  ]

  return (
    <div>
      <div className="text-xs text-ink-faint mb-2.5">
        Ramal governante: <strong className="text-red">{ramalGov}</strong>
      </div>
      <Table>
        <thead><tr><TH>Etapa</TH><TH>Valor</TH><TH>Descrição</TH></tr></thead>
        <tbody>
          {etapas.map((r, i) => (
            <tr key={i}>
              <TD muted>{r.etapa}</TD>
              <TD red bold mono>{r.val}</TD>
              <TD muted>{r.desc}</TD>
            </tr>
          ))}
        </tbody>
      </Table>
      <Formula>
        Ht = P_RTI = <FormulaVal>{fmca(res.P_RTI)}</FormulaVal>
      </Formula>
    </div>
  )
}

// ── S5: Pressão e Vazão ───────────────────────────────────────────────
function PressaoVazao({ d }) {
  const { res, dados_sistema } = d
  const pmin = dados_sistema.p_min
  const pmax = 100
  const labelPressao = res.esguicho ? 'Pressão no esguicho (P)' : 'Pressão na válvula (P)'

  const hids = [
    { id: 'HID-01', label: '1º mais desfavorável', J: res.j.t3.J, dZ: res.dH.t3, P: pressaoHidrante(res, 'hd01'), Q: res.Q_hd01 },
    { id: 'HID-02', label: '2º mais desfavorável', J: res.j.t4.J, dZ: res.dH.t4, P: pressaoHidrante(res, 'hd02'), Q: res.Q_hd02 },
  ]

  return (
    <div className="flex flex-col gap-3">
      <Formula>
        Equilíbrio hidráulico convergido em {res.equilibrio.historico.length} iteração(ões) — erro final {f4(res.equilibrio.erro)} mca (tolerância {res.equilibrio.tolerancia} mca) · Fator K = {f4(res.K)}
      </Formula>
      {hids.map(h => (
        <Card key={h.id}>
          <CardHeader>
            <span className="text-[11px] font-bold py-0.5 px-2 rounded bg-red-dim border border-solid border-red-border text-red font-mono">{h.id}</span>
            <span className="text-xs text-ink-faint">{h.label}</span>
          </CardHeader>
          <div className="py-3.5 px-[18px]">
            <Table>
              <thead><tr><TH>Parâmetro</TH><TH right>Resultado</TH></tr></thead>
              <tbody>
                <tr>
                  <TD muted>Σhf do ramal (hidrante → Ponto A)</TD>
                  <TD right red bold mono>{fmca(h.J)}</TD>
                </tr>
                <tr>
                  <TD muted>∆Z do ramal</TD>
                  <TD right red bold mono>{f4(h.dZ)} m</TD>
                </tr>
                <tr>
                  <TD muted>{labelPressao}</TD>
                  <TD right red bold mono>{fmca(h.P)}</TD>
                </tr>
                <tr>
                  <TD muted>Vazão real (Q = K·√P)</TD>
                  <TD right red bold mono>{lmin(h.Q)}</TD>
                </tr>
                <tr>
                  <TD muted>Verificação normativa (Pmin = {pmin} / Pmax = {pmax} mca)</TD>
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
function Bomba({ d, eta, potCv, potKw }) {
  const { res } = d
  const Qt_m3s = res.Qt / 1000 / 60
  const Qt_m3h = res.Qt / 1000 * 60
  const temEta = potCv != null

  const rows = [
    { param:'Vazão total convergida (Qt)', val:`${lmin(res.Qt)} = ${m3s(Qt_m3s)}`, obs:'Q_HID-01 + Q_HID-02' },
    { param:'Altura manométrica (Ht)',     val: fmca(res.P_RTI),                     obs:`Percurso crítico: ${res.hid_governa}` },
    { param:'Eficiência global (η)',       val: eta ? `${eta}%` : '—',               obs:'Informada na seção Bomba de Incêndio' },
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
      {temEta ? (
        <Formula>
          Pcv = (1000 × {m3s(Qt_m3s)} × {f4(res.P_RTI)}) / (75 × {eta/100}) = <FormulaVal>{f2(potCv)} cv</FormulaVal>
        </Formula>
      ) : (
        <div className="ibox amber mt-2">
          <span className="text-xs">Informe a eficiência global da bomba na seção "Bomba de Incêndio", acima, pra calcular a potência mínima.</span>
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
  const fileInputRef = useRef(null)

  const aplicarHidrantes = payload => {
    dispatch({ type: 'SET_HIDRANTES', changes: { dimensionamento: payload } })
    setImportErro(null)
  }

  const eta = state.hidrantes.bombaEficiencia
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

  const sections = dados ? [
    { n:1, label:'Dados Normativos do Sistema',           content: <DadosNormativos d={dados} norma={norma}/> },
    { n:2, label:'Cotas Altimétricas e Desníveis',        content: <Cotas d={dados}/> },
    { n:3, label:'Perdas de Carga por Trecho (Hazen-Williams)', content: <PerdasCarga d={dados} norma={norma}/> },
    { n:4, label:'Altura Manométrica Total (Ht)',          content: <AlturaMano d={dados}/> },
    { n:5, label:'Pressão e Vazão nos Hidrantes',          content: <PressaoVazao d={dados}/> },
    { n:6, label:'Dimensionamento da Bomba de Recalque',   content: <Bomba d={dados} eta={eta} potCv={potCv} potKw={potKw}/> },
  ] : []

  return (
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

        <FormularioSistema/>

        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <h3 className="text-sm font-bold text-ink m-0 mb-1">Dimensionamento (plugin Revit)</h3>
            <p className="text-[12px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
              Resultados calculados pelo plugin a partir da classificação acima.
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

            <ResumoExecutivo d={dados} potCv={potCv} potKw={potKw}/>

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
