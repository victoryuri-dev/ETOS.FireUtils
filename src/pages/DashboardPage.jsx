import { useState, useEffect } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNorma } from '../hooks/useNorma'
import { useMedidasObrigatorias } from '../hooks/useMedidasObrigatorias'
import Icon from '../components/ui/Icon'

// ── helpers ──────────────────────────────────────────────────────────
const getCargaCls = (q) => q <= 300 ? 'low' : q <= 1200 ? 'med' : 'high'
const getCargaLbl = (q) => q <= 300 ? 'Risco baixo · Classe I' : q <= 1200 ? 'Risco medio · Classe II' : 'Risco alto · Classe III/IV'
const fmtNum = (n) => n ? Number(n).toLocaleString('pt-BR') : '—'

const SIST_DISPLAY = [
  { key:'acesso_viatura',      icon:'exit',   label:'Acesso de Viatura' },
  { key:'seg_estrutural',      icon:'newbld', label:'Seg. Estrutural' },
  { key:'saida_emergencia',    icon:'exit',   label:'Saidas de Emergencia' },
  { key:'brigada',             icon:'drop',   label:'Brigada de Incendio' },
  { key:'iluminacao',          icon:'sun',    label:'Iluminacao de Emergencia' },
  { key:'sinalizacao',         icon:'sign',   label:'Sinalizacao de Emergencia' },
  { key:'extintores',          icon:'ext',    label:'Extintores' },
  { key:'hidrantes',           icon:'drop',   label:'Hidrantes / Mangotinho' },
  { key:'alarme',              icon:'bell',   label:'Alarme de Incendio' },
  { key:'deteccao',            icon:'sensor', label:'Deteccao de Incendio' },
  { key:'sprinklers',          icon:'spray',  label:'Chuveiros Automaticos' },
  { key:'controle_fumaca',     icon:'flame',  label:'Controle de Fumaca' },
  { key:'compart_vertical',    icon:'stair',  label:'Compartimentacao Vertical' },
  { key:'controle_acabamento', icon:'sign',   label:'Controle de Acabamento' },
  { key:'gerenciamento_risco', icon:'warn',   label:'Gerenciamento de Risco' },
  { key:'central_gas',         icon:'info',   label:'Central de Gas' },
  { key:'spda',                icon:'warn',   label:'SPDA' },
]

const CHECKLIST_ITEMS = [
  { id:'plantas',    label:'Plantas baixas do projeto (PDF)',          tag:'Obrigatorio' },
  { id:'memorial',   label:'Memorial descritivo',                      tag:'Obrigatorio' },
  { id:'art',        label:'ART do responsavel tecnico',               tag:'Obrigatorio' },
  { id:'cnpj',       label:'CNPJ / documentacao do proprietario',      tag:'Obrigatorio' },
  { id:'calc_hid',   label:'Memorial de calculo — hidrantes',          tag:'Obrigatorio' },
  { id:'calc_said',  label:'Memorial de calculo — saidas de emergencia',tag:'Obrigatorio' },
  { id:'laudo_cob',  label:'Laudo de cobertura (se aplicavel)',         tag:'Condicional' },
  { id:'alvara',     label:'Habite-se / alvara de construcao',         tag:'Obrigatorio' },
]

// ── subcomponentes ────────────────────────────────────────────────────

function StatCell({ label, value, unit, sub, subTag, subTagColor }) {
  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg py-[18px] px-[22px] flex-1">
      <div className="text-[11px] text-ink-faint mb-2">{label}</div>
      <div className="text-[30px] font-bold text-ink leading-none">
        {value}<span className="text-sm font-normal text-ink-faint ml-1">{unit}</span>
      </div>
      {sub && (
        <div className="text-xs text-ink-faint mt-1.5 flex items-center gap-1.5">
          {sub}
          {subTag && (
            <span className={`text-[10px] font-semibold py-0.5 px-[7px] rounded-[20px] border border-solid ${subTagColor === 'green' ? 'bg-green-dim border-green-border' : subTagColor === 'amber' ? 'bg-amber-dim border-amber-border' : 'bg-red-dim border-red-border'} ${subTagColor === 'amber' ? 'text-amber' : subTagColor === 'red' ? 'text-red' : 'text-green'}`}>{subTag}</span>
          )}
        </div>
      )}
    </div>
  )
}

function InfoPanel({ title, icon, fields, onEdit }) {
  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden flex-1">
      <div className="flex items-center justify-between py-3 px-4 border-b border-solid border-border">
        <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
          <Icon name={icon} size={13}/> {title}
        </span>
        {onEdit && (
          <button onClick={onEdit} className="bg-transparent border-none text-ink-faint text-[11px] cursor-pointer flex items-center gap-1">
            <Icon name="settings" size={11}/> Editar
          </button>
        )}
      </div>
      <div className="py-3 px-4">
        {fields.map((f, i) => (
          <div key={i} className={`flex justify-between items-center py-1.5 ${i < fields.length-1 ? 'border-b border-solid border-border-2' : ''}`}>
            <span className="text-xs text-ink-faint">{f.label}</span>
            <span className={`text-ink ${f.big ? 'text-xl font-bold' : 'text-[13px] font-medium'}`}>{f.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SistemasGrid({ sistemas, onNavigate }) {
  const sistAtivos = SIST_DISPLAY.filter(s => sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio)
  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between py-3 px-4 border-b border-solid border-border">
        <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
          <Icon name="drop" size={13}/> Sistemas de seguranca
        </span>
        <span className="text-[11px] text-ink-faint">{sistAtivos.length} sistemas habilitados</span>
      </div>
      <div className="grid grid-cols-4 gap-px bg-border">
        {SIST_DISPLAY.map(s => {
          const sist   = sistemas[s.key]
          const ativo  = sist?.ativo || sist?.obrigatorio
          const obrig  = sist?.obrigatorio
          if (!ativo) return null
          return (
            <div key={s.key}
              onClick={() => onNavigate && onNavigate(s.key)}
              className="bg-surface-2 hover:bg-surface p-3.5 cursor-pointer flex flex-col gap-2 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className={`w-[26px] h-[26px] rounded-md flex items-center justify-center ${obrig ? 'bg-red-dim text-red' : 'bg-green-dim text-green'}`}>
                  <Icon name={s.icon} size={13}/>
                </div>
                {/* Status: sem dimensionamento por enquanto = pendente */}
                <span className="text-[9px] font-semibold py-0.5 px-1.5 rounded-[20px] bg-amber-dim border border-solid border-amber-border text-amber">
                  Pendente
                </span>
              </div>
              <div className="text-[11px] font-medium text-ink-muted leading-[1.3]">{s.label}</div>
              <div className="text-[10px] text-ink-hint">
                {obrig ? 'Obrigatorio — NT 42/2019' : 'Opcional habilitado'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Integração Revit ─────────────────────────────────────────────────
// Mostra o sync_token do projeto (Supabase, tabela `projetos`) — token que
// o plugin do Revit usa pra enviar dados sem precisar de firedata.json.
function IntegracaoRevit({ projetoId, userId }) {
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!projetoId || !userId) return
    let cancelado = false
    setLoading(true)
    supabase.from('projetos').select('sync_token').eq('id', projetoId).eq('user_id', userId).maybeSingle()
      .then(({ data }) => { if (!cancelado) { setToken(data?.sync_token || null); setLoading(false) } })
    return () => { cancelado = true }
  }, [projetoId, userId])

  const copiar = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  const gerarNovo = async () => {
    if (!window.confirm(
      'Gerar um novo token invalida o atual — se o plugin do Revit já estiver configurado com ele, para de sincronizar até você colar o novo lá. Continuar?'
    )) return
    setBusy(true)
    const novo = crypto.randomUUID()
    const { error } = await supabase.from('projetos').update({ sync_token: novo }).eq('id', projetoId).eq('user_id', userId)
    if (!error) setToken(novo)
    setBusy(false)
  }

  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden mb-5">
      <div className="flex items-center justify-between py-3 px-4 border-b border-solid border-border">
        <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
          <Icon name="upload" size={13}/> Integração Revit
        </span>
      </div>
      <div className="p-4">
        <div className="text-[11px] text-ink-faint mb-2.5">
          Cole este token nas configurações do plugin Fire Utils no Revit para sincronizar os dados sem precisar exportar arquivo.
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-surface border border-solid border-border rounded-md px-3 py-2 text-[12px] text-ink-muted font-mono overflow-x-auto whitespace-nowrap">
            {loading ? 'Carregando…' : (token || 'Token indisponível')}
          </code>
          <button className="btn-ghost" onClick={copiar} disabled={loading || !token}>
            <Icon name={copiado ? 'check' : 'file'} size={12}/> {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button className="btn-ghost" onClick={gerarNovo} disabled={loading || busy}>
            <Icon name="settings" size={12}/> Gerar novo
          </button>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ sistemas }) {
  const ativos  = SIST_DISPLAY.filter(s => sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio)
  const feitos  = 0 // dimensionamentos concluidos (sera populado quando o plugin integrar)
  const pct     = ativos.length > 0 ? (feitos / ativos.length) * 100 : 0

  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg py-4 px-5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-ink-muted">Completude do projeto</span>
        <span className="text-xs text-ink-faint">{feitos} de {ativos.length} sistemas dimensionados</span>
      </div>
      <div className="h-1.5 bg-border rounded-full mb-3.5 overflow-hidden">
        <div className="h-full bg-green rounded-full transition-[width] duration-400" style={{width:`${pct}%`}}/>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {ativos.map(s => (
          <div key={s.key} className="flex items-center gap-[5px]">
            <div className="w-[7px] h-[7px] rounded-full bg-amber"/>
            <span className="text-[10px] text-ink-faint">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Checklist() {
  const [checked, setChecked] = useState({})
  const total   = CHECKLIST_ITEMS.length
  const done    = Object.values(checked).filter(Boolean).length

  return (
    <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between py-3 px-4 border-b border-solid border-border">
        <span className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
          <Icon name="file" size={13}/> Documentacao para entrega
        </span>
        <span className="text-[11px] text-ink-faint">{done} de {total} itens</span>
      </div>
      <div>
        {CHECKLIST_ITEMS.map((item) => {
          const ok = checked[item.id]
          return (
            <div key={item.id}
              onClick={() => setChecked(c => ({ ...c, [item.id]: !c[item.id] }))}
              className="flex items-center gap-3 py-2.5 px-4 cursor-pointer border-b border-solid border-border-2 transition-colors duration-100 hover:bg-white/[.02]"
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border border-solid ${ok ? 'bg-green border-green' : 'bg-transparent border-border'}`}>
                {ok && <Icon name="check" size={10} color="#fff"/>}
              </div>
              <span className={`flex-1 text-[13px] ${ok ? 'text-ink-faint line-through' : 'text-ink no-underline'}`}>
                {item.label}
              </span>
              <span className={`text-[10px] py-0.5 px-[7px] rounded-[20px] border border-solid border-border ${item.tag === 'Condicional' ? 'bg-amber-dim text-amber' : 'bg-surface text-ink-faint'}`}>
                {item.tag}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardPage({ onGoConfig }) {
  const { state } = useProjeto()
  const { user } = useAuth()
  const { info, ocupacoes } = useNorma()
  const { sistemas } = useMedidasObrigatorias()
  const maxQ       = Object.values(state.cargaState || {}).reduce((acc, c) => {
    const q = c?.metodo === 'levantamento' ? parseFloat(c?.valorManual) || 0 : c?.cargaIncendio || 0
    return Math.max(acc, q)
  }, 0)
  const cargaCls   = maxQ ? getCargaCls(maxQ) : null
  const cargaLbl   = maxQ ? getCargaLbl(maxQ) : null

  // Classificacao derivada dos pavimentos
  const grupos = {}
  ;(state.pavimentos || []).forEach(p => {
    if (!grupos[p.grupo]) grupos[p.grupo] = []
    if (!grupos[p.grupo].includes(p.divisao)) grupos[p.grupo].push(p.divisao)
  })
  const gruposStr = Object.keys(grupos).sort().join(', ') || '—'
  const divisoesStr = Object.values(grupos).flat().join(', ') || '—'

  // Agregados das estruturas (torres/blocos)
  const estruturas    = state.estruturas || []
  const areaTotalSum  = estruturas.reduce((s, e) => s + (parseFloat(e.areaTotal) || 0), 0)
  const alturaNum     = estruturas.reduce((mx, e) => Math.max(mx, parseFloat(e.altura) || 0), 0)
  const pavimentosSum = estruturas.reduce((s, e) => s + (parseInt(e.nPavimentos) || 0), 0)
  const subsolosSum   = estruturas.reduce((s, e) => s + (parseInt(e.nSubsolos) || 0), 0)
  const estruturaTipos = [...new Set(estruturas.flatMap(e => Array.isArray(e.estrutura) ? e.estrutura : [e.estrutura]).filter(Boolean))].join(', ') || '—'
  const estruturasNomes = estruturas.map(e => e.nome).join(', ')
  const alturaLbl  = alturaNum <= 6 ? 'Terrea' : alturaNum <= 12 ? 'Baixa altura' : alturaNum <= 23 ? 'Media altura' : 'Alta'
  const alturaColor= alturaNum <= 12 ? 'green' : alturaNum <= 23 ? 'amber' : 'red'

  const isConfigurado = state.nome && state.uf && state.pavimentos?.length > 0

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto pt-8 px-10 pb-[60px]">

          {/* Titulo do projeto */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-ink mb-1.5">
                {state.nome || 'Projeto sem nome'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-ink-faint">
                <span className="flex items-center gap-1"><Icon name="info" size={11}/>{state.cidade || '—'} — {state.uf || 'MA'}</span>
                <span className="opacity-30">·</span>
                <span>{info?.nome || 'NT 42/2019 CBMMA'}</span>
                {gruposStr !== '—' && <>
                  <span className="opacity-30">·</span>
                  <span>Grupos: {gruposStr}</span>
                </>}
              </div>
            </div>
            <button className="btn-primary" onClick={onGoConfig}>
              <Icon name="settings" size={13}/> Editar configuracao
            </button>
          </div>

          {/* Aviso se nao configurado */}
          {!isConfigurado && (
            <div className="ibox amber mb-6">
              <Icon name="warn" size={14} color="var(--color-amber)" className="shrink-0"/>
              <span>Projeto nao configurado ainda. <button onClick={onGoConfig} className="bg-transparent border-none text-amber cursor-pointer font-semibold underline">Clique aqui para configurar.</button></span>
            </div>
          )}

          {/* Barra de progresso */}
          <div className="mb-5">
            <ProgressBar sistemas={sistemas}/>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-5">
            <StatCell
              label="Area construida"
              value={fmtNum(areaTotalSum)}
              unit="m2"
              sub={estruturasNomes || null}
            />
            <StatCell
              label="Altura da edificacao"
              value={alturaNum || '—'}
              unit={alturaNum ? 'm' : ''}
              sub={pavimentosSum ? `${pavimentosSum} pavimentos` : null}
              subTag={alturaNum ? alturaLbl : null}
              subTagColor={alturaColor}
            />
            <StatCell
              label="Carga de incendio"
              value={maxQ || '—'}
              unit={maxQ ? 'MJ/m2' : ''}
              subTag={cargaLbl}
              subTagColor={cargaCls === 'low' ? 'green' : cargaCls === 'med' ? 'amber' : cargaCls === 'high' ? 'red' : null}
            />
          </div>

          {/* Paineis de info */}
          <div className="flex gap-3 mb-5">
            <InfoPanel
              title="Classificacao"
              icon="settings"
              onEdit={onGoConfig}
              fields={[
                { label:'Grupos', value: gruposStr },
                { label:'Divisoes', value: divisoesStr },
                { label:'Situacao', value: state.situacao === 'nova' ? 'Edificacao nova' : state.situacao === 'existente' ? 'Edificacao existente' : '—' },
                { label:'Norma', value: info?.nome || 'NT 42/2019 CBMMA' },
              ]}
            />
            <InfoPanel
              title="Edificacao"
              icon="newbld"
              onEdit={onGoConfig}
              fields={[
                { label:'Altura maxima', value: alturaNum ? `${alturaNum} m` : '—', big:true },
                { label:'Pavimentos', value: pavimentosSum || '—' },
                { label:'Subsolos', value: subsolosSum || 0 },
                { label:'Area construida', value: areaTotalSum ? `${fmtNum(areaTotalSum)} m2` : '—' },
                { label:'Sistema construtivo', value: estruturaTipos },
              ]}
            />
            <InfoPanel
              title="Responsaveis"
              icon="info"
              onEdit={onGoConfig}
              fields={[
                { label:'Proprietario', value: state.propNome || '—' },
                { label:'Responsavel pelo uso', value: state.respRazaoSocial || '—' },
                { label:'Projetista', value: state.rtNome || '—' },
                { label:'CREA / CAU', value: state.rtConselho || '—' },
              ]}
            />
          </div>

          {/* Integração Revit */}
          {state.id && user && <IntegracaoRevit projetoId={state.id} userId={user.id}/>}

          {/* Sistemas de seguranca */}
          <div className="mb-5">
            <SistemasGrid sistemas={sistemas}/>
          </div>

          {/* Checklist documentacao */}
          <Checklist/>

        </div>
      </div>
    </div>
  )
}
