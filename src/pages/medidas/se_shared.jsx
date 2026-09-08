// ─────────────────────────────────────────────────────────────────────────────
// se_shared.jsx — UI compartilhada entre SaidaEmergenciaPage.jsx e
// AcessosDescargasView.jsx (formulário de ambiente, badges, toggle,
// formatação). Módulo próprio pra evitar import circular entre as duas
// páginas (a principal renderiza a árvore; a árvore reaproveita o
// formulário de ambiente da principal).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import { taxaOpcoes, popTipoPadrao } from '../../data/se_calc'

export const fmt  = n => Number(n).toFixed(2).replace('.', ',')
export const fmtM = n => `${fmt(n)} m`

const inputClass = 'bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2.5 w-full outline-none box-border'

function Label({ children }) {
  return <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">{children}</div>
}

export function DivBadge({ label }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded bg-red text-white text-[11px] font-bold">{label || '?'}</span>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} className={`flex items-center gap-2 bg-transparent border border-solid border-border rounded-md py-1.5 px-3 cursor-pointer text-xs ${checked ? 'text-ink font-medium' : 'text-ink-faint font-normal'}`}>
      <div className={`w-7 h-4 rounded-[8px] shrink-0 relative transition-colors duration-200 ${checked ? 'bg-red' : 'bg-border'}`}>
        <div className={`absolute top-0.5 ${checked ? 'left-3.5' : 'left-0.5'} w-3 h-3 rounded-full bg-white transition-[left] duration-200`}/>
      </div>
      {label}
    </button>
  )
}

// ── DivisaoSelect — usa OCUPACOES do estado vigente ───────────────────
function DivisaoSelect({ value, onChange, ocupacoes }) {
  return (
    <select className={inputClass} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Selecionar divisão...</option>
      {Object.keys(ocupacoes).sort().map(grupo => (
        <optgroup key={grupo} label={`Grupo ${grupo} — ${ocupacoes[grupo]?.descricao || grupo}`}>
          {Object.keys(ocupacoes[grupo]?.divisoes || {}).map(div => (
            <option key={div} value={div}>{div} — {ocupacoes[grupo].divisoes[div]}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ── Formulário de ambiente ────────────────────────────────────────────
export function AmbienteForm({ initial, onSave, onCancel, autoFocus, seNorma, ocupacoes }) {
  const { TAXA_POPULACIONAL } = seNorma
  const blank = { nome:'', divisao:'', popTipo:'area', area:'', assentos:'', popManual:'' }
  const [form, setForm] = useState(() => initial ? {
    nome: initial.nome, divisao: initial.divisao, popTipo: initial.popTipo,
    area: initial.area ? String(initial.area) : '',
    assentos: initial.assentos ? String(initial.assentos) : '',
    popManual: initial.popManual ? String(initial.popManual) : '',
  } : blank)

  const taxa    = TAXA_POPULACIONAL[form.divisao]
  const opcoes  = taxaOpcoes(form.divisao, TAXA_POPULACIONAL)
  const isManual = form.popTipo === 'manual'
  const isFixo   = form.popTipo === 'fixo'
  const isArea   = form.popTipo === 'area'

  const popCalc = () => {
    if (isFixo)   return parseInt(form.assentos)  || 0
    if (isManual) return parseInt(form.popManual) || 0
    return taxa?.A && form.area ? Math.ceil(parseFloat(form.area) / taxa.A) : 0
  }

  const setDivisao = div => setForm(f => ({ ...f, divisao: div, popTipo: popTipoPadrao(div, TAXA_POPULACIONAL), area:'', assentos:'', popManual:'' }))
  const setTipo    = tipo => setForm(f => ({ ...f, popTipo: tipo, area:'', assentos:'', popManual:'' }))

  const canSave = () => {
    if (!form.nome || !form.divisao) return false
    if (isArea && !form.area) return false
    if (isFixo && !form.assentos) return false
    if (isManual && !form.popManual) return false
    return true
  }

  const handleSave = () => {
    if (!canSave()) return
    onSave({ nome: form.nome.trim(), divisao: form.divisao, popTipo: form.popTipo, area: parseFloat(form.area)||0, assentos: parseInt(form.assentos)||0, popManual: parseInt(form.popManual)||0 })
  }

  const inputLabel = isArea ? 'Área (m²)' : isFixo ? 'N° de assentos' : 'N° de pessoas'

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-[1fr_1.5fr] gap-2.5">
        <div>
          <Label>Nome do ambiente</Label>
          <input className={inputClass} placeholder="ex.: Sala 101, Loja..." autoFocus={autoFocus}
            value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} onKeyDown={e => e.key==='Enter' && handleSave()}/>
        </div>
        <div>
          <Label>Divisão de ocupação</Label>
          <DivisaoSelect value={form.divisao} onChange={setDivisao} ocupacoes={ocupacoes}/>
        </div>
      </div>

      {form.divisao && (
        <div className={`grid gap-2.5 items-end ${opcoes.length > 1 ? 'grid-cols-[1.4fr_1fr_100px]' : 'grid-cols-[1.8fr_1fr_100px]'}`}>
          <div>
            <Label>Taxa normativa — {form.divisao}</Label>
            {opcoes.length > 1 ? (
              <select className={inputClass} value={form.popTipo} onChange={e => setTipo(e.target.value)}>
                {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <div className={`${inputClass} bg-surface text-ink-faint flex items-center`}>
                {opcoes[0]?.label || '—'}
              </div>
            )}
          </div>
          <div>
            <Label>{inputLabel}</Label>
            {isArea   && <input className={inputClass} type="number" min="0" placeholder="ex.: 64,5" value={form.area}     onChange={e => setForm(f=>({...f,area:e.target.value}))}     onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
            {isFixo   && <input className={inputClass} type="number" min="0" placeholder="ex.: 120"  value={form.assentos} onChange={e => setForm(f=>({...f,assentos:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
            {isManual && <input className={inputClass} type="number" min="0" placeholder="ex.: 8"    value={form.popManual} onChange={e => setForm(f=>({...f,popManual:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleSave()}/>}
          </div>
          <div>
            <Label>Pop. calculada</Label>
            <div className={`${inputClass} bg-surface flex items-center justify-center font-bold text-[15px] ${popCalc()>0 ? 'text-red' : 'text-ink-faint'}`}>
              {popCalc() || '—'}
            </div>
          </div>
        </div>
      )}

      {taxa?.notas?.length > 0 && taxa.A === null && (
        <div className="ibox amber mb-0">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-[11px]">{taxa.obs}</span>
        </div>
      )}

      <div className="flex gap-1.5 justify-end">
        <button className="btn-ghost" onClick={onCancel}><Icon name="x" size={12}/> Cancelar</button>
        <button className={`btn-primary ${canSave() ? 'opacity-100 pointer-events-auto' : 'opacity-45 pointer-events-none'}`} onClick={handleSave}>
          <Icon name="check" size={12}/> {initial ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}
