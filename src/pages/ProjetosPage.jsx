import { useState, useMemo } from 'react'
import Icon from '../components/ui/Icon'
import { useNorma } from '../hooks/useNorma'

// ── helpers ───────────────────────────────────────────────────────────

function calcCompletude(s) {
  const checks = [
    !!(s.nome && s.endereco && s.cidade),
    !!(s.areaTotal && s.altura),
    !!s.propNome,
    !!(s.rtNome && s.artNumero),
    !!(s.pavimentos?.length > 0 && s.pavimentos.every(p => p.cnae)),
    !!(Object.keys(s.cargaState || {}).length > 0),
    true,
    !!(s.nome && s.areaTotal && s.pavimentos?.length > 0),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

function statusInfo(pct) {
  if (pct === 100) return { label:'Concluído',    bg:'var(--green-dim)',         border:'var(--green-border)',  color:'var(--green)'      }
  if (pct >= 25)  return { label:'Em andamento',  bg:'var(--amber-dim)',         border:'var(--amber-border)',  color:'var(--amber)'      }
                  return { label:'Rascunho',       bg:'rgba(255,255,255,.04)',    border:'var(--border)',        color:'var(--text-faint)' }
}

function barColor(pct) {
  if (pct === 100) return 'var(--green)'
  if (pct >= 30)   return 'var(--amber)'
  return 'var(--red)'
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
    stroke={active ? 'var(--text)' : 'var(--text-faint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const IcoList = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={active ? 'var(--text)' : 'var(--text-faint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
    <rect x="3" y="5" width="3" height="3" rx=".5"/><rect x="3" y="11" width="3" height="3" rx=".5"/><rect x="3" y="17" width="3" height="3" rx=".5"/>
  </svg>
)

// ── Stat card ─────────────────────────────────────────────────────────

function StatCard({ dot, label, value, sub }) {
  return (
    <div style={{ flex:1, background:'var(--surface-2)', border:'.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px 22px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:dot, flexShrink:0 }}/>
        <span style={{ fontSize:11, color:'var(--text-faint)' }}>{label}</span>
      </div>
      <div style={{ fontSize:32, fontWeight:700, color:'var(--text)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:6 }}>{sub}</div>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────

function Badge({ label, bg, border, color }) {
  return (
    <span style={{
      fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, whiteSpace:'nowrap',
      background:bg, border:`.5px solid ${border}`, color,
    }}>{label}</span>
  )
}

// ── Project card (grid) ───────────────────────────────────────────────

function ProjectCard({ proj, onOpen, onDelete }) {
  const pct    = calcCompletude(proj)
  const st     = statusInfo(pct)
  const grupo  = primaryGrupo(proj.pavimentos)
  const div    = primaryDivisao(proj.pavimentos)
  const q      = maxCarga(proj.cargaState)
  const [hov, setHov] = useState(false)
  const [delHov, setDelHov] = useState(false)

  return (
    <div
      onClick={() => onOpen(proj)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--surface)' : 'var(--surface-2)',
        border: `.5px solid ${hov ? 'rgba(255,255,255,.13)' : 'var(--border)'}`,
        borderRadius:'var(--radius-lg)', padding:'16px',
        cursor:'pointer', transition:'background .13s, border-color .13s',
        display:'flex', flexDirection:'column', gap:12,
        position:'relative',
      }}
    >
      {/* Botão excluir */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(proj) }}
        onMouseEnter={() => setDelHov(true)}
        onMouseLeave={() => setDelHov(false)}
        style={{
          position:'absolute', top:10, right:10,
          display:'flex', alignItems:'center', justifyContent:'center',
          width:26, height:26, borderRadius:'var(--radius-md)',
          background: delHov ? 'var(--red-dim)' : 'transparent',
          border: delHov ? '.5px solid var(--red-border)' : '.5px solid transparent',
          color: delHov ? 'var(--red)' : 'var(--text-faint)',
          cursor:'pointer', opacity: hov ? 1 : 0, transition:'opacity .12s, background .12s',
        }}
      >
        <Icon name="trash" size={12}/>
      </button>

      {/* Nome */}
      <div style={{ fontSize:15, fontWeight:600, color:'var(--text)', lineHeight:1.3, minHeight:38 }}>
        {proj.nome || <span style={{ color:'var(--text-faint)' }}>Sem nome</span>}
      </div>

      {/* Badges */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        <Badge {...st}/>
        {q > 1200 && (
          <Badge label="Risco especial" bg="var(--red-dim)" border="var(--red-border)" color="var(--red)"/>
        )}
        {grupo && (
          <Badge
            label={`${grupo} · ${div || '—'}`}
            bg="var(--red-dim)" border="var(--red-border)" color="var(--red)"
          />
        )}
      </div>

      {/* Divisor */}
      <div style={{ height:'.5px', background:'var(--border)' }}/>

      {/* Info em 3 colunas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'0 18px' }}>
        <InfoCol label="Grupo · Div" value={grupo ? `${grupo} · ${div || '—'}` : '—'}/>
        <InfoCol label="UF"   value={proj.uf || '—'}/>
        <InfoCol label="Área" value={fmtArea(proj.areaTotal)} align="right"/>
      </div>

      {/* Barra de completude */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
          <span style={{ fontSize:10, color:'var(--text-faint)' }}>Completude</span>
          <span style={{ fontSize:11, fontWeight:700, color: barColor(pct) }}>{pct}%</span>
        </div>
        <div style={{ height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background: barColor(pct), borderRadius:99, transition:'width .4s' }}/>
        </div>
      </div>

      {/* Rodapé */}
      <div style={{ fontSize:10, color:'var(--text-faint)', display:'flex', alignItems:'center', gap:5 }}>
        <Icon name="file" size={10}/>
        Editado {timeAgo(proj.updatedAt)}
      </div>
    </div>
  )
}

function InfoCol({ label, value, align }) {
  return (
    <div style={{ textAlign: align || 'left' }}>
      <div style={{ fontSize:10, color:'var(--text-faint)', marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{value}</div>
    </div>
  )
}

// ── Project row (list) ────────────────────────────────────────────────

const LIST_COLS = '8px 1fr 110px 90px 52px 90px 140px 110px 32px'

function ListHeader() {
  const cols = ['', 'Nome do projeto', 'Status', 'Grupo · Div', 'UF', 'Área', 'Completude', 'Editado', '']
  return (
    <div style={{
      display:'grid', gridTemplateColumns: LIST_COLS, gap:14, alignItems:'center',
      padding:'8px 16px', borderBottom:'.5px solid var(--border)',
      background:'var(--surface)', position:'sticky', top:0,
    }}>
      {cols.map((h, i) => (
        <span key={i} style={{ fontSize:10, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'.07em', whiteSpace:'nowrap' }}>
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
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={() => onOpen(proj)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'grid', gridTemplateColumns: LIST_COLS, gap:14, alignItems:'center',
        padding:'11px 16px', borderBottom:'.5px solid var(--border-2)',
        background: hov ? 'rgba(255,255,255,.02)' : 'transparent',
        cursor:'pointer', transition:'background .1s',
      }}
    >
      {/* Dot status */}
      <div style={{ width:7, height:7, borderRadius:'50%', background: st.color, flexShrink:0 }}/>

      {/* Nome */}
      <span style={{ fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {proj.nome || <span style={{ color:'var(--text-faint)', fontStyle:'italic' }}>Sem nome</span>}
      </span>

      {/* Status badge */}
      <Badge {...st}/>

      {/* Grupo · Div */}
      <span style={{ fontSize:11, fontWeight:700, color:'var(--red)', whiteSpace:'nowrap' }}>
        {grupo ? `${grupo} · ${div || '—'}` : '—'}
      </span>

      {/* UF */}
      <span style={{ fontSize:12, fontWeight:600, color:'var(--text)', textAlign:'center' }}>
        {proj.uf || '—'}
      </span>

      {/* Área */}
      <span style={{ fontSize:12, color:'var(--text)', textAlign:'right', whiteSpace:'nowrap' }}>
        {fmtArea(proj.areaTotal)}
      </span>

      {/* Barra + % */}
      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
        <div style={{ flex:1, height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background: barColor(pct), borderRadius:99 }}/>
        </div>
        <span style={{ fontSize:11, fontWeight:700, color: barColor(pct), width:28, textAlign:'right' }}>{pct}%</span>
      </div>

      {/* Editado */}
      <span style={{ fontSize:11, color:'var(--text-faint)', whiteSpace:'nowrap' }}>
        {timeAgo(proj.updatedAt)}
      </span>

      {/* Ações */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ display:'flex', justifyContent:'center', opacity: hov ? 1 : 0, transition:'opacity .12s' }}
      >
        <button
          onClick={() => onDelete(proj)}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:26, height:26, borderRadius:'var(--radius-md)',
            background:'transparent', border:'.5px solid transparent',
            color:'var(--text-faint)', cursor:'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--red-dim)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='var(--red-border)' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-faint)'; e.currentTarget.style.borderColor='transparent' }}
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
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'var(--surface)', border:'.5px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:'28px 32px',
          width:400, maxWidth:'90vw', boxShadow:'0 20px 60px rgba(0,0,0,.5)',
        }}
      >
        {/* Ícone */}
        <div style={{
          width:44, height:44, borderRadius:'50%',
          background:'var(--red-dim)', border:'.5px solid var(--red-border)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 18px',
        }}>
          <Icon name="trash" size={18} style={{ color:'var(--red)' }}/>
        </div>

        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
            Excluir projeto?
          </div>
          <div style={{ fontSize:13, color:'var(--text-faint)', lineHeight:1.6 }}>
            O projeto{' '}
            <strong style={{ color:'var(--text)' }}>
              {proj.nome || 'Sem nome'}
            </strong>{' '}
            será excluído permanentemente. Esta ação não pode ser desfeita.
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button
            className="btn-ghost"
            onClick={onCancel}
            style={{ flex:1 }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'0 16px', height:36, borderRadius:'var(--radius-md)',
              background:'var(--red)', border:'none', color:'#fff',
              fontSize:13, fontWeight:500, cursor:'pointer',
            }}
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
    <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-faint)' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        style={{ margin:'0 auto 16px', display:'block', opacity:.3 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <path d="M14 2v6h6"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
      <div style={{ fontSize:15, fontWeight:500, color:'var(--text-muted)', marginBottom:6 }}>
        {hasFilter ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
      </div>
      <div style={{ fontSize:13, marginBottom:20 }}>
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
      if (sort === 'area')    return (parseFloat(b.areaTotal) || 0) - (parseFloat(a.areaTotal) || 0)
      if (sort === 'pct')     return calcCompletude(b) - calcCompletude(a)
      return 0
    })

    return list
  }, [allProjects, search, sort, filterUF, filterGrupo])

  const hasFilter = !!(search || filterUF || filterGrupo)

  // Estilos do botão de view toggle
  const viewBtn = (active) => ({
    display:'flex', alignItems:'center', justifyContent:'center',
    width:32, height:32, borderRadius:'var(--radius-md)', cursor:'pointer',
    background: active ? 'var(--surface-2)' : 'transparent',
    border: active ? '.5px solid var(--border)' : '.5px solid transparent',
    color: active ? 'var(--text)' : 'var(--text-faint)',
    transition:'all .12s',
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', background:'var(--bg)' }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 40px 60px' }}>

          {/* Título + botão */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Meus projetos</h1>
              <p style={{ fontSize:13, color:'var(--text-faint)' }}>Todos os memoriais descritivos e dimensionamentos</p>
            </div>
            <button className="btn-primary" onClick={onNewProject}>
              <Icon name="plus" size={13}/> Novo projeto
            </button>
          </div>

          {/* ── Stats ── */}
          <div style={{ display:'flex', gap:12, marginBottom:24 }}>
            <StatCard
              dot="var(--text-muted)"
              label="Total de projetos"
              value={stats.total}
              sub={stats.total > 0 ? `${stats.andamento + stats.concluidos} ativos` : 'Nenhum projeto ainda'}
            />
            <StatCard
              dot="var(--amber)"
              label="Em andamento"
              value={stats.andamento}
              sub={stats.andamento > 0 ? 'Com prazo em aberto' : 'Nenhum em progresso'}
            />
            <StatCard
              dot="var(--green)"
              label="Concluídos"
              value={stats.concluidos}
              sub={stats.concluidos > 0 ? `Último: ${timeAgo(allProjects.filter(p => calcCompletude(p) === 100).sort((a, b) => new Date(b.updatedAt||0) - new Date(a.updatedAt||0))[0]?.updatedAt)}` : 'Nenhum concluído'}
            />
            <StatCard
              dot="var(--text-faint)"
              label="Rascunhos"
              value={stats.rascunhos}
              sub="Aguardando dados"
            />
          </div>

          {/* ── Toolbar ── */}
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>

            {/* Busca */}
            <div style={{ flex:1, minWidth:200, position:'relative' }}>
              <Icon name="search" size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-faint)', pointerEvents:'none' }}/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, endereço ou ID..."
                style={{ paddingLeft:32 }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', padding:2 }}>
                  <Icon name="x" size={12}/>
                </button>
              )}
            </div>

            {/* Ordenar */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ width:'auto' }}>
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="name">Nome A → Z</option>
              <option value="area">Maior área</option>
              <option value="pct">Mais completos</option>
            </select>

            {/* Estado */}
            <select value={filterUF} onChange={e => setFilterUF(e.target.value)} style={{ width:'auto' }}>
              <option value="">Todos os estados</option>
              {ufsDisponiveis.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>

            {/* Grupo */}
            <select value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)} style={{ width:'auto' }}>
              <option value="">Todos os grupos</option>
              {gruposDisponiveis.map(g => <option key={g} value={g}>{g} — {grupos[g] || g}</option>)}
            </select>

            {/* Separador */}
            <div style={{ width:'.5px', height:24, background:'var(--border)', flexShrink:0 }}/>

            {/* View toggle */}
            <div style={{ display:'flex', gap:2 }}>
              <button style={viewBtn(view === 'grid')} onClick={() => setView('grid')} title="Grade">
                <IcoGrid active={view === 'grid'}/>
              </button>
              <button style={viewBtn(view === 'list')} onClick={() => setView('list')} title="Lista">
                <IcoList active={view === 'list'}/>
              </button>
            </div>
          </div>

          {/* Contagem + filtros ativos */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18, fontSize:12, color:'var(--text-faint)' }}>
            <span>{filtered.length} projeto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
            {filterUF && (
              <FilterChip label={filterUF} onRemove={() => setFilterUF('')}/>
            )}
            {filterGrupo && (
              <FilterChip label={`Grupo ${filterGrupo} — ${GRUPO_NOMES[filterGrupo] || filterGrupo}`} onRemove={() => setFilterGrupo('')}/>
            )}
          </div>

          {/* ── Conteúdo ── */}
          {filtered.length === 0 ? (
            <EmptyState hasFilter={hasFilter} onNew={onNewProject}/>
          ) : view === 'grid' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(272px, 1fr))', gap:12 }}>
              {filtered.map(proj => (
                <ProjectCard key={proj.id} proj={proj} onOpen={onOpenProject} onDelete={setToDelete}/>
              ))}
            </div>
          ) : (
            <div style={{ background:'var(--surface-2)', border:'.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
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
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:10, padding:'2px 8px 2px 10px', borderRadius:20,
      background:'var(--surface-2)', border:'.5px solid var(--border)', color:'var(--text-muted)',
    }}>
      {label}
      <button onClick={onRemove} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
        <Icon name="x" size={10}/>
      </button>
    </span>
  )
}
