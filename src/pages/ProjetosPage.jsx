import { useState, useMemo, useEffect, useRef } from 'react'
import Icon from '../components/ui/Icon'
import { useNorma } from '../hooks/useNorma'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { newIds } from '../context/ProjetoContext'
import { criarProjetoExemploFixo, EXEMPLO_FIXO_ID } from '../data/projetoExemplo'
import { temCNAECadastrado } from '../data/normas/index'

// Garante que o projeto de exemplo fixo sempre exista pra este usuário — se
// foi excluido em uma sessao anterior, recria-lo ao carregar a pagina. O id
// leva o user_id porque a tabela `projetos` é compartilhada entre contas
// (id sozinho é a chave primária), então o id fixo original colidiria entre
// usuários diferentes.
async function garantirProjetoExemploFixo(userId) {
  const idExemplo = `${EXEMPLO_FIXO_ID}-${userId}`
  const { data } = await supabase.from('projetos').select('id').eq('id', idExemplo).maybeSingle()
  if (data) return
  const dados = { ...criarProjetoExemploFixo(), id: idExemplo, updatedAt: new Date().toISOString() }
  await supabase.from('projetos').insert({
    id: idExemplo,
    user_id: userId,
    nome: dados.nome || 'Projeto de exemplo',
    dados,
  })
}

// ── helpers ───────────────────────────────────────────────────────────

// Area construida total do projeto: sempre o valor gravado no campo (manual
// ou somado das estruturas pelo switch da Etapa 2) — a soma das estruturas
// so entra como fallback quando esse campo ainda nao foi preenchido.
function totalArea(proj) {
  const soma = (proj.estruturas || []).reduce((s, e) => s + (parseFloat(e.areaTotal) || 0), 0)
  return parseFloat(proj.areaConstruidaTotal) || soma
}

function calcCompletude(s) {
  const area = totalArea(s)
  const uf = s.uf || 'MA'
  // Divisoes sem nenhum CNAE cadastrado (ex: J-1..J-4) nunca terao p.cnae
  // preenchido — contam como classificadas so com a divisao definida.
  const pavClassificado = p => !!(p.divisao && (p.cnae || !temCNAECadastrado(uf, p.divisao)))
  const checks = [
    !!(s.nome && s.endereco && s.cidade),
    !!(s.estruturas?.length && s.estruturas.every(e => e.areaTotal && e.altura)),
    !!s.propNome,
    !!(s.rtNome && s.artNumero),
    !!(s.pavimentos?.length > 0 && s.pavimentos.every(pavClassificado)),
    !!(Object.keys(s.cargaState || {}).length > 0),
    true,
    !!(s.nome && area > 0 && s.pavimentos?.length > 0),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

function barToneClasses(pct) {
  if (pct === 100) return { text:'text-green', bg:'bg-green' }
  if (pct >= 30)   return { text:'text-amber', bg:'bg-amber' }
  return { text:'text-red', bg:'bg-red' }
}

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30)   return `há ${d} dia${d !== 1 ? 's' : ''}`
  const mo = Math.floor(d / 30)
  return `há ${mo} ${mo !== 1 ? 'meses' : 'mês'}`
}

function fmtArea(v) {
  if (!v) return '—'
  return Number(v).toLocaleString('pt-BR') + ' m²'
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

// Cor determinística por UF (mesmo hash sempre gera a mesma cor pra mesma
// sigla) — dá pra identificar o estado de relance sem precisar de uma
// tabela de cores mantida à mão pra cada uma das 27 UFs.
function ufColor(uf) {
  if (!uf) return { bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.16)', text: 'var(--color-ink-faint)' }
  // MA é o estado principal do app — usa o vermelho da marca em vez da cor
  // derivada do hash, que fica só pras demais UFs.
  if (uf === 'MA') return { bg: 'var(--color-red-dim)', border: 'var(--color-red-border)', text: 'var(--color-red)' }
  let hash = 0
  for (let i = 0; i < uf.length; i++) hash = uf.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return {
    bg: `hsla(${hue}, 70%, 55%, .16)`,
    border: `hsla(${hue}, 70%, 55%, .4)`,
    text: `hsl(${hue}, 85%, 72%)`,
  }
}

function primaryGrupo(pavimentos) {
  if (!pavimentos?.length) return null
  const count = {}
  pavimentos.forEach(p => { if (p.grupo) count[p.grupo] = (count[p.grupo] || 0) + 1 })
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || null
}

function primaryDivisao(pavimentos) {
  if (!pavimentos?.length) return null
  return [...pavimentos].sort((a, b) => (parseFloat(b.area) || 0) - (parseFloat(a.area) || 0))[0]?.divisao || null
}

// ── Ícones inline ─────────────────────────────────────────────────────

const IcoGrid = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={active ? 'var(--color-ink)' : 'var(--color-ink-faint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const IcoList = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={active ? 'var(--color-ink)' : 'var(--color-ink-faint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
    <rect x="3" y="5" width="3" height="3" rx=".5"/><rect x="3" y="11" width="3" height="3" rx=".5"/><rect x="3" y="17" width="3" height="3" rx=".5"/>
  </svg>
)

// ── Pill de status (filtro clicável) ────────────────────────────────────
// Substitui os antigos quadrados grandes de estatística: agora é um filtro
// — clicar ativa (borda + fundo na cor do status) e filtra a lista; clicar
// de novo desativa.
function StatusPill({ dot, tone, label, active, onClick }) {
  const activeClass = {
    green: 'border-green-border bg-green-dim text-green',
    amber: 'border-amber-border bg-amber-dim text-amber',
    muted: 'border-white/25 bg-white/[.08] text-ink',
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[11px] py-1 px-2.5 rounded-[20px] border border-solid whitespace-nowrap cursor-pointer transition-colors duration-150 ${active ? activeClass : 'border-border bg-transparent text-ink-faint hover:border-white/20 hover:text-ink-muted'}`}
    >
      <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${dot}`}/>
      {label}
    </button>
  )
}

// ── Menu de ações do card (excluir / duplicar) ─────────────────────────
// Botão de "3 pontos" que, ao ser hovereado, se transforma numa bandeja com
// os dois ícones de ação — a bandeja tem um fundo em degradê que vai de
// opaco (perto dos ícones, à direita) a transparente (à esquerda).
function CardActions({ onDelete, onDuplicate, className = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      onClick={e => e.stopPropagation()}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`h-[26px] w-[26px] shrink-0 ${className}`}
    >
      <div
        className={`absolute right-0 top-0 flex items-center gap-1 py-0.5 pl-9 rounded-md transition-opacity duration-150 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'linear-gradient(to left, var(--color-surface-2) 55%, transparent 100%)' }}
      >
        <button
          onClick={onDuplicate}
          title="Duplicar projeto"
          className="flex items-center justify-center w-[26px] h-[26px] rounded-md bg-transparent border border-solid border-transparent text-ink-faint cursor-pointer transition-colors duration-150 hover:bg-white/[.07] hover:text-ink hover:border-border"
        >
          <Icon name="copy" size={12}/>
        </button>
        <button
          onClick={onDelete}
          title="Excluir projeto"
          className="flex items-center justify-center w-[26px] h-[26px] rounded-md bg-transparent border border-solid border-transparent text-ink-faint cursor-pointer transition-colors duration-150 hover:bg-red-dim hover:text-red hover:border-red-border"
        >
          <Icon name="trash" size={12}/>
        </button>
      </div>
      <button
        title="Mais opções"
        className={`flex items-center justify-center w-[26px] h-[26px] rounded-md bg-transparent border border-solid border-transparent text-ink-faint cursor-pointer transition-opacity duration-150 ${open ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <Icon name="moreVert" size={14}/>
      </button>
    </div>
  )
}

// ── Project card (grid) ───────────────────────────────────────────────

function ProjectCard({ proj, onOpen, onDelete, onDuplicate }) {
  const pct   = calcCompletude(proj)
  const bar   = barToneClasses(pct)
  const grupo = primaryGrupo(proj.pavimentos)
  const div   = primaryDivisao(proj.pavimentos)
  const uf    = ufColor(proj.uf)

  return (
    <div
      onClick={() => onOpen(proj)}
      className="group relative bg-surface-2 hover:bg-surface border border-solid border-border hover:border-white/13 rounded-lg p-4 cursor-pointer transition-colors duration-150 flex flex-col gap-3.5"
    >
      {/* Ações (excluir / duplicar) */}
      <CardActions
        className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100"
        onDelete={() => onDelete(proj)}
        onDuplicate={() => onDuplicate(proj)}
      />

      {/* Nome + UF */}
      <div className="flex items-center gap-2 pr-7">
        <span className="font-heading text-[15px] font-bold text-ink uppercase tracking-[.01em] leading-[1.3] truncate">
          {proj.nome || <span className="text-ink-faint normal-case">Sem nome</span>}
        </span>
        <span
          className="text-[10px] font-bold py-0.5 px-2.5 rounded-[20px] whitespace-nowrap border border-solid shrink-0"
          style={{ background: uf.bg, borderColor: uf.border, color: uf.text }}
        >
          {proj.uf || '—'}
        </span>
      </div>

      {/* Edificações / Ocupação / A.C.T. */}
      <div className="flex items-center justify-between gap-2">
        <StatInline label="Edificações" value={pad2(proj.estruturas?.length || 0)}/>
        <StatInline label="Ocup." value={div || grupo || '—'}/>
        <StatInline label="A.C.T." value={fmtArea(totalArea(proj))}/>
      </div>

      {/* Barra de status */}
      <div className="h-[3px] bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-[width] duration-400 ${bar.bg}`} style={{width:`${pct}%`}}/>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between text-[10px] text-ink-faint">
        <span>Criado em {fmtDate(proj.createdAt)}</span>
        <span>Editado {timeAgo(proj.updatedAt)}</span>
      </div>
    </div>
  )
}

function StatInline({ label, value }) {
  return (
    <div className="text-[11px] whitespace-nowrap">
      <span className="text-ink-faint uppercase tracking-wide">{label}: </span>
      <span className="font-heading text-ink font-bold">{value}</span>
    </div>
  )
}

// ── Project row (list) ────────────────────────────────────────────────
// Mesmas informações do card da grade (nome+UF, Edificações/Ocup./A.C.T.,
// barra de status, Criado/Editado), só que em linha — os rótulos dos
// campos saem daqui e vão só uma vez pro cabeçalho da lista.

const LIST_GRID_COLS = 'grid-cols-[1fr_90px_80px_110px_220px_32px]'

function ListHeader() {
  const cols = ['Nome do projeto', 'Edificações', 'Ocupação', 'A.C.T.', 'Criado / Editado', '']
  return (
    <div className={`grid ${LIST_GRID_COLS} gap-3.5 items-center py-2 px-4 border-b border-solid border-border bg-surface sticky top-0`}>
      {cols.map((h, i) => (
        <span key={i} className="text-[10px] text-ink-faint uppercase tracking-[.07em] whitespace-nowrap">
          {h}
        </span>
      ))}
    </div>
  )
}

function ProjectRow({ proj, onOpen, onDelete, onDuplicate }) {
  const pct   = calcCompletude(proj)
  const bar   = barToneClasses(pct)
  const grupo = primaryGrupo(proj.pavimentos)
  const div   = primaryDivisao(proj.pavimentos)
  const uf    = ufColor(proj.uf)

  return (
    <div
      onClick={() => onOpen(proj)}
      className={`group grid ${LIST_GRID_COLS} gap-3.5 items-center py-[11px] px-4 border-b border-solid border-border-2 cursor-pointer transition-colors duration-100 hover:bg-white/[.02]`}
    >
      {/* Nome + UF */}
      <span className="flex items-center gap-2 min-w-0">
        <span className="font-heading text-[13px] font-bold text-ink uppercase tracking-[.01em] overflow-hidden text-ellipsis whitespace-nowrap">
          {proj.nome || <span className="text-ink-faint normal-case">Sem nome</span>}
        </span>
        <span
          className="text-[10px] font-bold py-0.5 px-2.5 rounded-[20px] whitespace-nowrap border border-solid shrink-0"
          style={{ background: uf.bg, borderColor: uf.border, color: uf.text }}
        >
          {proj.uf || '—'}
        </span>
      </span>

      {/* Edificações */}
      <span className="font-heading text-[12px] font-bold text-ink whitespace-nowrap">
        {pad2(proj.estruturas?.length || 0)}
      </span>

      {/* Ocupação */}
      <span className="font-heading text-[12px] font-bold text-ink whitespace-nowrap">
        {div || grupo || '—'}
      </span>

      {/* A.C.T. */}
      <span className="font-heading text-[12px] font-bold text-ink whitespace-nowrap">
        {fmtArea(totalArea(proj))}
      </span>

      {/* Barra de status + datas */}
      <div className="flex flex-col gap-1.5">
        <div className="h-[3px] bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bar.bg}`} style={{width:`${pct}%`}}/>
        </div>
        <div className="flex items-center justify-between text-[10px] text-ink-faint">
          <span>Criado em {fmtDate(proj.createdAt)}</span>
          <span>Editado {timeAgo(proj.updatedAt)}</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <CardActions className="relative" onDelete={() => onDelete(proj)} onDuplicate={() => onDuplicate(proj)}/>
      </div>
    </div>
  )
}

// ── Modal de confirmação (excluir / duplicar) ──────────────────────────
// Ambas as ações do card (excluir e duplicar) passam por aqui antes de
// acontecer — o usuário sempre precisa confirmar.

function ConfirmModal({ tone, icon, title, message, confirmLabel, onConfirm, onCancel }) {
  const toneClass = tone === 'red'
    ? { dot: 'bg-red-dim border-red-border text-red', btn: 'bg-red hover:bg-[#a01122]' }
    : { dot: 'bg-blue-dim border-blue-border text-ink', btn: 'bg-ink-muted hover:bg-ink text-bg' }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-solid border-border rounded-lg py-7 px-8 w-[400px] max-w-[90vw] shadow-[0_20px_60px_rgba(0,0,0,.5)]"
      >
        {/* Ícone */}
        <div className={`w-11 h-11 rounded-full border border-solid flex items-center justify-center mx-auto mb-[18px] ${toneClass.dot}`}>
          <Icon name={icon} size={18}/>
        </div>

        <div className="text-center mb-5">
          <div className="font-heading text-base font-semibold text-ink mb-2">
            {title}
          </div>
          <div className="text-[13px] text-ink-faint leading-[1.6]">
            {message}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button className="btn-ghost flex-1" onClick={onCancel}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 h-9 rounded-md border-none text-white text-[13px] font-medium cursor-pointer transition-colors duration-150 ${toneClass.btn}`}
          >
            <Icon name={icon} size={12}/> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Estado vazio ──────────────────────────────────────────────────────

function EmptyState({ hasFilter, onNew }) {
  return (
    <div className="text-center py-20 px-5 text-ink-faint">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        className="mx-auto mb-4 block opacity-30">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <path d="M14 2v6h6"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
      <div className="text-[15px] font-medium text-ink-muted mb-1.5">
        {hasFilter ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
      </div>
      <div className="text-[13px] mb-5">
        {hasFilter
          ? 'Tente ajustar os filtros de busca.'
          : 'Crie seu primeiro projeto de PPCI.'}
      </div>
      {!hasFilter && (
        <button className="btn-primary" onClick={onNew}>
          <Icon name="plus" size={13}/> Novo projeto
        </button>
      )}
    </div>
  )
}

// ── Botão "Novo projeto" com atalho pra "Apenas dimensionamento" ───────
// A seta abre um dropdown com o segundo modo de criação — um projeto sem
// responsável pelo uso/localização/responsável técnico, só com o
// necessário pra dimensionar Saída de Emergência, Hidrantes e Chuveiros
// Automáticos (ver ConfiguracaoPage.jsx).
function NovoProjetoBotao({ onNewProject }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [aberto])

  return (
    <div ref={ref} className="relative flex">
      <button
        className="btn-primary btn-primary-novo rounded-r-none uppercase tracking-wide font-heading font-bold"
        onClick={() => onNewProject('completo')}
      >
        <Icon name="plus" size={13}/> Criar novo projeto
      </button>
      <button
        className="btn-primary btn-primary-novo rounded-l-none border-l border-solid border-white/20 px-2 shrink-0"
        onClick={() => setAberto(v => !v)}
        title="Outros tipos de projeto"
      >
        <Icon name="chevD" size={11}/>
      </button>
      {aberto && (
        <div className="absolute top-full right-0 mt-1.5 min-w-[240px] bg-surface-2 border border-solid border-border rounded-lg shadow-[0_12px_32px_rgba(0,0,0,.4)] z-50 py-1.5 overflow-hidden">
          <button
            className="w-full text-left px-3.5 py-2.5 bg-transparent border-none cursor-pointer hover:bg-white/[.04] flex flex-col gap-0.5"
            onClick={() => { setAberto(false); onNewProject('dimensionamento') }}
          >
            <span className="font-heading text-[13px] font-medium text-ink">Apenas dimensionamento</span>
            <span className="text-[11px] text-ink-faint leading-[1.4]">Gera apenas memorial de cálculo</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Dropdown de filtro (prefixo fixo no botão, lista só com os valores) ─
// Um <select> nativo usa o mesmo texto da opção tanto fechado quanto na
// lista aberta — não dá pra ter "UF: MA" fechado e só "MA" nos itens. Por
// isso os filtros de Grupo/UF usam este dropdown customizado.
function FilterDropdown({ prefix, value, options, onChange }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [aberto])

  const atual = options.find(o => o.value === value) || options[0]

  return (
    <div ref={ref} className="relative w-auto shrink-0">
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        className="flex items-center gap-2 bg-surface-2 border border-solid border-border text-ink text-[13px] py-[9px] px-3 rounded-md cursor-pointer whitespace-nowrap"
      >
        {prefix}: {atual.label}
        <Icon name="chevD" size={11} className="text-ink-faint"/>
      </button>
      {aberto && (
        <div className="absolute top-full left-0 mt-1.5 min-w-full bg-surface-2 border border-solid border-border rounded-lg shadow-[0_12px_32px_rgba(0,0,0,.4)] z-50 py-1.5 overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setAberto(false) }}
              className={`w-full text-left px-3.5 py-2 bg-transparent border-none cursor-pointer whitespace-nowrap hover:bg-white/[.04] text-[13px] ${o.value === value ? 'text-ink font-semibold' : 'text-ink-muted'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Header Logo ───────────────────────────────────────────────────────

// ── ProjetosPage ──────────────────────────────────────────────────────

export default function ProjetosPage({ onOpenProject, onNewProject, onNovoProjetoExemplo }) {
  const { grupos } = useNorma()
  const { user } = useAuth()
  const [view,        setView]        = useState('grid')
  const [tick,        setTick]        = useState(0)
  const [toDelete,    setToDelete]    = useState(null)
  const [toDuplicate, setToDuplicate] = useState(null)
  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState('recent')
  const [filterUF,     setFilterUF]     = useState('')
  const [filterGrupo,  setFilterGrupo]  = useState('')
  const [filterStatus, setFilterStatus] = useState([]) // multiselect: 'concluidos' | 'andamento' | 'rascunhos'
  const [allProjects, setAllProjects] = useState([])
  const [loading,     setLoading]     = useState(true)

  // Roda a cada vez que a pagina "Meus projetos" monta (ou apos delete/recarga) —
  // garante o exemplo fixo e busca a lista de projetos do usuário no Postgres.
  useEffect(() => {
    if (!user) return
    let cancelado = false
    setLoading(true)
    ;(async () => {
      await garantirProjetoExemploFixo(user.id)
      const { data, error } = await supabase
        .from('projetos').select('dados').eq('user_id', user.id)
      if (cancelado) return
      setAllProjects(error ? [] : (data || []).map(row => row.dados))
      setLoading(false)
    })()
    return () => { cancelado = true }
  }, [user, tick])

  const handleDeleteConfirm = async () => {
    if (!toDelete) return
    await supabase.from('projetos').delete().eq('id', toDelete.id)
    setToDelete(null)
    setTick(t => t + 1)
  }

  const handleDuplicateConfirm = async () => {
    if (!toDuplicate || !user) return
    const { id, createdAt } = newIds()
    const dados = {
      ...toDuplicate,
      id,
      createdAt,
      updatedAt: createdAt,
      nome: `${toDuplicate.nome || 'Sem nome'} (cópia)`,
      exemploFixo: false,
    }
    await supabase.from('projetos').insert({ id, user_id: user.id, nome: dados.nome, dados })
    setToDuplicate(null)
    setTick(t => t + 1)
  }

  // Estatísticas
  const stats = useMemo(() => {
    const pcts = allProjects.map(calcCompletude)
    return {
      total:      allProjects.length,
      andamento:  pcts.filter(p => p >= 25 && p < 100).length,
      concluidos: pcts.filter(p => p === 100).length,
      rascunhos:  pcts.filter(p => p < 25).length,
    }
  }, [allProjects])

  // Opções dos filtros
  const ufsDisponiveis = useMemo(() =>
    [...new Set(allProjects.map(p => p.uf).filter(Boolean))].sort(),
  [allProjects])

  const gruposDisponiveis = useMemo(() => {
    const gs = new Set()
    allProjects.forEach(p => p.pavimentos?.forEach(pav => { if (pav.grupo) gs.add(pav.grupo) }))
    return [...gs].sort()
  }, [allProjects])

  // Filtro + ordenação
  const filtered = useMemo(() => {
    let list = [...allProjects]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.nome?.toLowerCase().includes(q) ||
        p.cidade?.toLowerCase().includes(q) ||
        p.endereco?.toLowerCase().includes(q)
      )
    }
    if (filterUF)    list = list.filter(p => p.uf === filterUF)
    if (filterGrupo) list = list.filter(p => p.pavimentos?.some(pav => pav.grupo === filterGrupo))
    if (filterStatus.length) {
      list = list.filter(p => {
        const pct = calcCompletude(p)
        const key = pct === 100 ? 'concluidos' : pct >= 25 ? 'andamento' : 'rascunhos'
        return filterStatus.includes(key)
      })
    }

    list.sort((a, b) => {
      if (sort === 'recent')  return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      if (sort === 'oldest')  return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)
      if (sort === 'name')    return (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
      if (sort === 'area')    return totalArea(b) - totalArea(a)
      if (sort === 'pct')     return calcCompletude(b) - calcCompletude(a)
      return 0
    })

    return list
  }, [allProjects, search, sort, filterUF, filterGrupo, filterStatus])

  const hasFilter = !!(search || filterUF || filterGrupo || filterStatus.length)

  const toggleFilterStatus = key =>
    setFilterStatus(v => v.includes(key) ? v.filter(x => x !== key) : [...v, key])

  // Classes do botão de view toggle
  const viewBtnClass = (active) =>
    `flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-all duration-150 border border-solid ${active ? 'bg-surface-2 border-border text-ink' : 'border-transparent text-ink-faint'}`

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto pt-8 px-10 pb-[60px]">

          {/* Título + botão */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-ink mb-1">Meus projetos</h1>
              <p className="text-[13px] text-ink-faint">Todos os memoriais descritivos e dimensionamentos</p>
            </div>
            <div className="flex gap-2">
              {onNovoProjetoExemplo && (
                <button className="btn-ghost" onClick={onNovoProjetoExemplo} title="Cria um projeto com todos os campos preenchidos, para testes">
                  <Icon name="file" size={13}/> Projeto de teste
                </button>
              )}
              <NovoProjetoBotao onNewProject={onNewProject}/>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex gap-2 items-center mb-3.5 flex-wrap">

            {/* Busca */}
            <div className="flex-1 min-w-[200px] relative">
              <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, endereço ou ID..."
                className="pl-8"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-ink-faint cursor-pointer p-0.5">
                  <Icon name="x" size={12}/>
                </button>
              )}
            </div>

            {/* Ordenar */}
            <select value={sort} onChange={e => setSort(e.target.value)} className="w-auto">
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="name">Nome A → Z</option>
              <option value="area">Maior área</option>
              <option value="pct">Mais completos</option>
            </select>

            {/* Grupo */}
            <FilterDropdown
              prefix="Grupos"
              value={filterGrupo}
              onChange={setFilterGrupo}
              options={[
                { value: '', label: 'TODOS' },
                ...gruposDisponiveis.map(g => ({ value: g, label: `${g} — ${grupos[g] || g}` })),
              ]}
            />

            {/* Estado */}
            <FilterDropdown
              prefix="UF"
              value={filterUF}
              onChange={setFilterUF}
              options={[
                { value: '', label: 'TODOS' },
                ...ufsDisponiveis.map(uf => ({ value: uf, label: uf })),
              ]}
            />

            {/* Separador */}
            <div className="w-px h-6 bg-border shrink-0"/>

            {/* View toggle */}
            <div className="flex gap-0.5">
              <button className={viewBtnClass(view === 'grid')} onClick={() => setView('grid')} title="Grade">
                <IcoGrid active={view === 'grid'}/>
              </button>
              <button className={viewBtnClass(view === 'list')} onClick={() => setView('list')} title="Lista">
                <IcoList active={view === 'list'}/>
              </button>
            </div>
          </div>

          {/* Contagem + filtros ativos + filtro de status */}
          <div className="flex items-center justify-between gap-2 mb-[18px] flex-wrap">
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <span>{filtered.length} projeto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
              {filterUF && (
                <FilterChip label={filterUF} onRemove={() => setFilterUF('')}/>
              )}
              {filterGrupo && (
                <FilterChip label={`Grupo ${filterGrupo} — ${grupos[filterGrupo] || filterGrupo}`} onRemove={() => setFilterGrupo('')}/>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {stats.concluidos > 0 && (
                <StatusPill
                  dot="bg-green" tone="green"
                  label={`${stats.concluidos} Concluído${stats.concluidos !== 1 ? 's' : ''}`}
                  active={filterStatus.includes('concluidos')}
                  onClick={() => toggleFilterStatus('concluidos')}
                />
              )}
              {stats.andamento > 0 && (
                <StatusPill
                  dot="bg-amber" tone="amber"
                  label={`${stats.andamento} Em andamento`}
                  active={filterStatus.includes('andamento')}
                  onClick={() => toggleFilterStatus('andamento')}
                />
              )}
              {stats.rascunhos > 0 && (
                <StatusPill
                  dot="bg-ink-faint" tone="muted"
                  label={`${stats.rascunhos} Rascunho${stats.rascunhos !== 1 ? 's' : ''}`}
                  active={filterStatus.includes('rascunhos')}
                  onClick={() => toggleFilterStatus('rascunhos')}
                />
              )}
            </div>
          </div>

          {/* ── Conteúdo ── */}
          {loading ? (
            <div className="py-16 text-center text-[12px] text-ink-faint">Carregando projetos…</div>
          ) : filtered.length === 0 ? (
            <EmptyState hasFilter={hasFilter} onNew={onNewProject}/>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-3">
              {filtered.map(proj => (
                <ProjectCard key={proj.id} proj={proj} onOpen={onOpenProject} onDelete={setToDelete} onDuplicate={setToDuplicate}/>
              ))}
            </div>
          ) : (
            <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden">
              <ListHeader/>
              {filtered.map(proj => (
                <ProjectRow key={proj.id} proj={proj} onOpen={onOpenProject} onDelete={setToDelete} onDuplicate={setToDuplicate}/>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modais de confirmação */}
      {toDelete && (
        <ConfirmModal
          tone="red"
          icon="trash"
          title="Excluir projeto?"
          message={(
            <>
              O projeto{' '}
              <strong className="text-ink">{toDelete.nome || 'Sem nome'}</strong>{' '}
              será excluído permanentemente. Esta ação não pode ser desfeita.
            </>
          )}
          confirmLabel="Excluir permanentemente"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toDuplicate && (
        <ConfirmModal
          tone="blue"
          icon="copy"
          title="Duplicar projeto?"
          message={(
            <>
              Uma cópia do projeto{' '}
              <strong className="text-ink">{toDuplicate.nome || 'Sem nome'}</strong>{' '}
              será criada com os mesmos dados.
            </>
          )}
          confirmLabel="Duplicar projeto"
          onConfirm={handleDuplicateConfirm}
          onCancel={() => setToDuplicate(null)}
        />
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] py-0.5 pr-2 pl-2.5 rounded-[20px] bg-surface-2 border border-solid border-border text-ink-muted">
      {label}
      <button onClick={onRemove} className="bg-transparent border-none text-ink-faint cursor-pointer p-0 flex items-center">
        <Icon name="x" size={10}/>
      </button>
    </span>
  )
}
