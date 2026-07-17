import { useState, useMemo } from 'react'
import Icon from '../components/ui/Icon'
import { useNorma } from '../hooks/useNorma'

// ── helpers ───────────────────────────────────────────────────────────

function totalArea(proj) {
  return (proj.estruturas || []).reduce((s, e) => s + (parseFloat(e.areaTotal) || 0), 0)
}

function calcCompletude(s) {
  const area = totalArea(s)
  const checks = [
    !!(s.nome && s.endereco && s.cidade),
    !!(s.estruturas?.length && s.estruturas.every(e => e.areaTotal && e.altura)),
    !!s.propNome,
    !!(s.rtNome && s.artNumero),
    !!(s.pavimentos?.length > 0 && s.pavimentos.every(p => p.cnae)),
    !!(Object.keys(s.cargaState || {}).length > 0),
    true,
    !!(s.nome && area > 0 && s.pavimentos?.length > 0),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

function statusInfo(pct) {
  if (pct === 100) return { label:'Concluído',   tone:'green' }
  if (pct >= 25)  return { label:'Em andamento', tone:'amber' }
                  return { label:'Rascunho',      tone:'muted' }
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

function maxCarga(cargaState) {
  return Object.values(cargaState || {}).reduce((acc, c) => {
    const q = c?.metodo === 'levantamento' ? parseFloat(c?.valorManual) || 0 : c?.cargaIncendio || 0
    return Math.max(acc, q)
  }, 0)
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

// ── Stat card ─────────────────────────────────────────────────────────

function StatCard({ dot, label, value, sub }) {
  return (
    <div className="flex-1 bg-surface-2 border border-solid border-border rounded-lg py-[18px] px-[22px]">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className={`w-[7px] h-[7px] rounded-full shrink-0 ${dot}`}/>
        <span className="text-[11px] text-ink-faint">{label}</span>
      </div>
      <div className="text-[32px] font-bold text-ink leading-none">{value}</div>
      {sub && <div className="text-[11px] text-ink-faint mt-1.5">{sub}</div>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────

function Badge({ label, tone }) {
  const toneClass = {
    green: 'bg-green-dim border-green-border text-green',
    amber: 'bg-amber-dim border-amber-border text-amber',
    red:   'bg-red-dim border-red-border text-red',
    muted: 'bg-white/[.04] border-border text-ink-faint',
  }[tone] || 'bg-white/[.04] border-border text-ink-faint'
  return (
    <span className={`text-[10px] font-semibold py-0.5 px-2 rounded-[20px] whitespace-nowrap border border-solid ${toneClass}`}>{label}</span>
  )
}

// ── Project card (grid) ───────────────────────────────────────────────

function ProjectCard({ proj, onOpen, onDelete }) {
  const pct    = calcCompletude(proj)
  const st     = statusInfo(pct)
  const grupo  = primaryGrupo(proj.pavimentos)
  const div    = primaryDivisao(proj.pavimentos)
  const q      = maxCarga(proj.cargaState)
  const bar    = barToneClasses(pct)

  return (
    <div
      onClick={() => onOpen(proj)}
      className="group relative bg-surface-2 hover:bg-surface border border-solid border-border hover:border-white/13 rounded-lg p-4 cursor-pointer transition-colors duration-150 flex flex-col gap-3"
    >
      {/* Botão excluir */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(proj) }}
        className="absolute top-2.5 right-2.5 flex items-center justify-center w-[26px] h-[26px] rounded-md bg-transparent border border-solid border-transparent text-ink-faint cursor-pointer opacity-0 group-hover:opacity-100 transition-[opacity,background-color,color,border-color] duration-150 hover:bg-red-dim hover:text-red hover:border-red-border"
      >
        <Icon name="trash" size={12}/>
      </button>

      {/* Nome */}
      <div className="text-[15px] font-semibold text-ink leading-[1.3] min-h-[38px]">
        {proj.nome || <span className="text-ink-faint">Sem nome</span>}
      </div>

      {/* Badges */}
      <div className="flex gap-1.5 flex-wrap">
        <Badge {...st}/>
        {q > 1200 && (
          <Badge label="Risco especial" tone="red"/>
        )}
        {grupo && (
          <Badge label={`${grupo} · ${div || '—'}`} tone="red"/>
        )}
      </div>

      {/* Divisor */}
      <div className="h-px bg-border"/>

      {/* Info em 3 colunas */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-y-0 gap-x-[18px]">
        <InfoCol label="Grupo · Div" value={grupo ? `${grupo} · ${div || '—'}` : '—'}/>
        <InfoCol label="UF"   value={proj.uf || '—'}/>
        <InfoCol label="Área" value={fmtArea(totalArea(proj))} align="right"/>
      </div>

      {/* Barra de completude */}
      <div>
        <div className="flex justify-between items-center mb-[5px]">
          <span className="text-[10px] text-ink-faint">Completude</span>
          <span className={`text-[11px] font-bold ${bar.text}`}>{pct}%</span>
        </div>
        <div className="h-[3px] bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-[width] duration-400 ${bar.bg}`} style={{width:`${pct}%`}}/>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-[10px] text-ink-faint flex items-center gap-[5px]">
        <Icon name="file" size={10}/>
        Editado {timeAgo(proj.updatedAt)}
      </div>
    </div>
  )
}

function InfoCol({ label, value, align }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="text-[10px] text-ink-faint mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold text-ink">{value}</div>
    </div>
  )
}

// ── Project row (list) ────────────────────────────────────────────────

const LIST_GRID_COLS = 'grid-cols-[8px_1fr_110px_90px_52px_90px_140px_110px_32px]'

function ListHeader() {
  const cols = ['', 'Nome do projeto', 'Status', 'Grupo · Div', 'UF', 'Área', 'Completude', 'Editado', '']
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

function ProjectRow({ proj, onOpen, onDelete }) {
  const pct   = calcCompletude(proj)
  const st    = statusInfo(pct)
  const grupo = primaryGrupo(proj.pavimentos)
  const div   = primaryDivisao(proj.pavimentos)
  const bar   = barToneClasses(pct)

  return (
    <div
      onClick={() => onOpen(proj)}
      className={`group grid ${LIST_GRID_COLS} gap-3.5 items-center py-[11px] px-4 border-b border-solid border-border-2 cursor-pointer transition-colors duration-100 hover:bg-white/[.02]`}
    >
      {/* Dot status */}
      <div className={`w-[7px] h-[7px] rounded-full shrink-0 ${st.tone === 'green' ? 'bg-green' : st.tone === 'amber' ? 'bg-amber' : 'bg-ink-faint'}`}/>

      {/* Nome */}
      <span className="text-[13px] font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">
        {proj.nome || <span className="text-ink-faint italic">Sem nome</span>}
      </span>

      {/* Status badge */}
      <Badge {...st}/>

      {/* Grupo · Div */}
      <span className="text-[11px] font-bold text-red whitespace-nowrap">
        {grupo ? `${grupo} · ${div || '—'}` : '—'}
      </span>

      {/* UF */}
      <span className="text-xs font-semibold text-ink text-center">
        {proj.uf || '—'}
      </span>

      {/* Área */}
      <span className="text-xs text-ink text-right whitespace-nowrap">
        {fmtArea(totalArea(proj))}
      </span>

      {/* Barra + % */}
      <div className="flex items-center gap-[7px]">
        <div className="flex-1 h-[3px] bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bar.bg}`} style={{width:`${pct}%`}}/>
        </div>
        <span className={`text-[11px] font-bold w-7 text-right ${bar.text}`}>{pct}%</span>
      </div>

      {/* Editado */}
      <span className="text-[11px] text-ink-faint whitespace-nowrap">
        {timeAgo(proj.updatedAt)}
      </span>

      {/* Ações */}
      <div
        onClick={e => e.stopPropagation()}
        className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        <button
          onClick={() => onDelete(proj)}
          className="flex items-center justify-center w-[26px] h-[26px] rounded-md bg-transparent border border-solid border-transparent text-ink-faint cursor-pointer hover:bg-red-dim hover:text-red hover:border-red-border"
        >
          <Icon name="trash" size={12}/>
        </button>
      </div>
    </div>
  )
}

// ── Modal de confirmação de exclusão ──────────────────────────────────

function DeleteModal({ proj, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-solid border-border rounded-lg py-7 px-8 w-[400px] max-w-[90vw] shadow-[0_20px_60px_rgba(0,0,0,.5)]"
      >
        {/* Ícone */}
        <div className="w-11 h-11 rounded-full bg-red-dim border border-solid border-red-border flex items-center justify-center mx-auto mb-[18px]">
          <Icon name="trash" size={18} className="text-red"/>
        </div>

        <div className="text-center mb-5">
          <div className="text-base font-semibold text-ink mb-2">
            Excluir projeto?
          </div>
          <div className="text-[13px] text-ink-faint leading-[1.6]">
            O projeto{' '}
            <strong className="text-ink">
              {proj.nome || 'Sem nome'}
            </strong>{' '}
            será excluído permanentemente. Esta ação não pode ser desfeita.
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            className="btn-ghost flex-1"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 h-9 rounded-md bg-red border-none text-white text-[13px] font-medium cursor-pointer"
          >
            <Icon name="trash" size={12}/> Excluir permanentemente
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

// ── Header Logo ───────────────────────────────────────────────────────

// ── ProjetosPage ──────────────────────────────────────────────────────

export default function ProjetosPage({ onOpenProject, onNewProject }) {
  const { grupos } = useNorma()
  const [view,        setView]        = useState('grid')
  const [tick,        setTick]        = useState(0)
  const [toDelete,    setToDelete]    = useState(null)
  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState('recent')
  const [filterUF,    setFilterUF]    = useState('')
  const [filterGrupo, setFilterGrupo] = useState('')

  // Lê todos os projetos do localStorage
  const allProjects = useMemo(() => {
    try {
      const raw = localStorage.getItem('etos-projetos')
      return raw ? Object.values(JSON.parse(raw)) : []
    } catch { return [] }
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteConfirm = () => {
    if (!toDelete) return
    try {
      const raw = localStorage.getItem('etos-projetos')
      const all = raw ? JSON.parse(raw) : {}
      delete all[toDelete.id]
      localStorage.setItem('etos-projetos', JSON.stringify(all))
    } catch {}
    setToDelete(null)
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
        p.endereco?.toLowerCase().includes(q) ||
        p.seqId?.toLowerCase().includes(q)
      )
    }
    if (filterUF)    list = list.filter(p => p.uf === filterUF)
    if (filterGrupo) list = list.filter(p => p.pavimentos?.some(pav => pav.grupo === filterGrupo))

    list.sort((a, b) => {
      if (sort === 'recent')  return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      if (sort === 'oldest')  return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)
      if (sort === 'name')    return (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
      if (sort === 'area')    return totalArea(b) - totalArea(a)
      if (sort === 'pct')     return calcCompletude(b) - calcCompletude(a)
      return 0
    })

    return list
  }, [allProjects, search, sort, filterUF, filterGrupo])

  const hasFilter = !!(search || filterUF || filterGrupo)

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
              <h1 className="text-2xl font-bold text-ink mb-1">Meus projetos</h1>
              <p className="text-[13px] text-ink-faint">Todos os memoriais descritivos e dimensionamentos</p>
            </div>
            <button className="btn-primary" onClick={onNewProject}>
              <Icon name="plus" size={13}/> Novo projeto
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="flex gap-3 mb-6">
            <StatCard
              dot="bg-ink-muted"
              label="Total de projetos"
              value={stats.total}
              sub={stats.total > 0 ? `${stats.andamento + stats.concluidos} ativos` : 'Nenhum projeto ainda'}
            />
            <StatCard
              dot="bg-amber"
              label="Em andamento"
              value={stats.andamento}
              sub={stats.andamento > 0 ? 'Com prazo em aberto' : 'Nenhum em progresso'}
            />
            <StatCard
              dot="bg-green"
              label="Concluídos"
              value={stats.concluidos}
              sub={stats.concluidos > 0 ? `Último: ${timeAgo(allProjects.filter(p => calcCompletude(p) === 100).sort((a, b) => new Date(b.updatedAt||0) - new Date(a.updatedAt||0))[0]?.updatedAt)}` : 'Nenhum concluído'}
            />
            <StatCard
              dot="bg-ink-faint"
              label="Rascunhos"
              value={stats.rascunhos}
              sub="Aguardando dados"
            />
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

            {/* Estado */}
            <select value={filterUF} onChange={e => setFilterUF(e.target.value)} className="w-auto">
              <option value="">Todos os estados</option>
              {ufsDisponiveis.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>

            {/* Grupo */}
            <select value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)} className="w-auto">
              <option value="">Todos os grupos</option>
              {gruposDisponiveis.map(g => <option key={g} value={g}>{g} — {grupos[g] || g}</option>)}
            </select>

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

          {/* Contagem + filtros ativos */}
          <div className="flex items-center gap-2 mb-[18px] text-xs text-ink-faint">
            <span>{filtered.length} projeto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
            {filterUF && (
              <FilterChip label={filterUF} onRemove={() => setFilterUF('')}/>
            )}
            {filterGrupo && (
              <FilterChip label={`Grupo ${filterGrupo} — ${grupos[filterGrupo] || filterGrupo}`} onRemove={() => setFilterGrupo('')}/>
            )}
          </div>

          {/* ── Conteúdo ── */}
          {filtered.length === 0 ? (
            <EmptyState hasFilter={hasFilter} onNew={onNewProject}/>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-3">
              {filtered.map(proj => (
                <ProjectCard key={proj.id} proj={proj} onOpen={onOpenProject} onDelete={setToDelete}/>
              ))}
            </div>
          ) : (
            <div className="bg-surface-2 border border-solid border-border rounded-lg overflow-hidden">
              <ListHeader/>
              {filtered.map(proj => (
                <ProjectRow key={proj.id} proj={proj} onOpen={onOpenProject} onDelete={setToDelete}/>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modal de confirmação */}
      {toDelete && (
        <DeleteModal
          proj={toDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
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
