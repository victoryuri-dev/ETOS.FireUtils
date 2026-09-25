import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useProjeto } from '../context/ProjetoContext'
import { useNorma } from '../hooks/useNorma'
import { useMedidasObrigatorias } from '../hooks/useMedidasObrigatorias'
import { supabase } from '../lib/supabase'
import Icon from '../components/ui/Icon'
import './DashboardPage.css'

const DIAS_SEMANA_ABREV = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// ── Heatmap de atividade ─────────────────────────────────────────────────
// Uma linha por (projeto, dia) em atividade_diaria, incrementada a cada
// salvamento bem-sucedido no Supabase (ver registrarAtividade em
// ProjetoContext.jsx). Cada quadrado representa um dia; a intensidade do
// vermelho é relativa ao dia de maior contagem na própria janela exibida
// (não um valor absoluto fixo), pra continuar legível tanto num projeto
// pouco editado quanto num muito editado.
//
// O número de dias mostrados não é fixo em 30 — a quantidade de semanas
// (colunas) é calculada a partir do espaço real disponível na box, com
// quadrados de tamanho fixo (não esticados). O dia atual cai sempre na
// última coluna (a mais à direita), igual ao GitHub.
const CELULA_GAP = 3
const LINHA_MES_ALTURA = 16
const MIN_COLUNAS = 5

function buildActivityDays(registros, totalDias) {
  const contagemPorDia = new Map((registros || []).map(r => [r.dia, r.contagem]))
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dias = []
  for (let i = totalDias - 1; i >= 0; i--) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - i)
    const chave = data.toISOString().slice(0, 10)
    dias.push({ data, chave, contagem: contagemPorDia.get(chave) || 0 })
  }
  return dias
}

function ActivityHeatmap({ registros }) {
  const containerRef = useRef(null)
  const [grade, setGrade] = useState(null) // { colunas, celula } — null até a primeira medição

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const medir = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      // Tamanho do quadrado nasce da ALTURA (7 linhas fixas de dia da
      // semana) e é reaproveitado pra largura — garante quadrado de
      // verdade, não um retângulo esticado pra caber na altura da box.
      const celula = Math.max(8, Math.floor((height - LINHA_MES_ALTURA - CELULA_GAP * 6) / 7))
      const colunas = Math.max(MIN_COLUNAS, Math.floor((width + CELULA_GAP) / (celula + CELULA_GAP)))
      setGrade(prev => (prev && prev.colunas === colunas && prev.celula === celula) ? prev : { colunas, celula })
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Quantos dias cobrem exatamente `colunas` semanas terminando hoje —
  // a coluna mais à esquerda sempre começa num domingo (semana cheia); só
  // a coluna mais à direita (a semana atual) pode vir parcial.
  const hojeDow = new Date().getDay()
  const totalDias = grade ? (grade.colunas - 1) * 7 + hojeDow + 1 : 0
  const dias = useMemo(() => buildActivityDays(registros, totalDias), [registros, totalDias])
  const maxContagem = Math.max(0, ...dias.map(d => d.contagem))

  const nivel = contagem => {
    if (!contagem || !maxContagem) return 0
    const proporcao = contagem / maxContagem
    if (proporcao <= 0.25) return 1
    if (proporcao <= 0.5) return 2
    if (proporcao <= 0.75) return 3
    return 4
  }

  // `dias[0]` é sempre um domingo por construção (totalDias foi escolhido
  // exatamente pra isso — ver comentário acima) — serve de âncora direta,
  // sem precisar recalcular o início da semana.
  const ancora = dias.length ? dias[0].data : null
  const colunaDe = data => Math.floor((data - ancora) / 86400000 / 7)

  const rotulosMes = []
  let ultimoMes = null
  dias.forEach(d => {
    const mes = d.data.getMonth()
    if (mes !== ultimoMes) {
      rotulosMes.push({ coluna: colunaDe(d.data), texto: MESES_ABREV[mes] })
      ultimoMes = mes
    }
  })

  // O dia atual é sempre o último item de `dias` — cai por construção na
  // última coluna (a mais à direita), igual ao GitHub. Ganha destaque
  // próprio (branco) em vez de seguir a escala de vermelho, pra ficar
  // sempre localizável de primeira, tenha ou não atividade registrada.
  const chaveHoje = dias.length ? dias[dias.length - 1].chave : null

  return (
    <div
      ref={containerRef}
      className="dashboard-activity__grid"
      style={grade ? {
        gridTemplateColumns: `repeat(${grade.colunas}, ${grade.celula}px)`,
        gridTemplateRows: `${LINHA_MES_ALTURA}px repeat(7, ${grade.celula}px)`,
        justifyContent: 'end',
      } : undefined}
    >
      {rotulosMes.map(r => (
        <span key={r.coluna} className="dashboard-activity__month" style={{ gridColumn: r.coluna + 1 }}>{r.texto}</span>
      ))}
      {dias.map(d => {
        const ehHoje = d.chave === chaveHoje
        const rotulo = `${d.contagem} ${d.contagem === 1 ? 'atividade' : 'atividades'} — ${DIAS_SEMANA_ABREV[d.data.getDay()]}, ${d.data.getDate()} de ${MESES_ABREV[d.data.getMonth()]}${ehHoje ? ' (hoje)' : ''}`
        return (
          <span
            key={d.chave}
            className={`dashboard-activity__cell ${ehHoje ? 'dashboard-activity__cell--today' : `dashboard-activity__cell--l${nivel(d.contagem)}`}`}
            style={{ gridColumn: colunaDe(d.data) + 1, gridRow: d.data.getDay() + 2 }}
            title={rotulo}
            aria-label={rotulo}
            role="img"
          />
        )
      })}
    </div>
  )
}

const SYSTEMS = [
  { key: 'acesso_viatura', icon: 'van', label: 'Acesso de Viatura' },
  { key: 'seg_estrutural', icon: 'wallFire', label: 'Segurança Estrutural' },
  { key: 'compart_horizontal', icon: 'stair', label: 'Compartimentação Horizontal' },
  { key: 'saida_emergencia', icon: 'exit', label: 'Saídas de Emergência' },
  { key: 'brigada', icon: 'shieldAlert', label: 'Brigada de Incêndio' },
  { key: 'iluminacao', icon: 'sun', label: 'Iluminação de Emergência' },
  { key: 'sinalizacao', icon: 'sign', label: 'Sinalização de Emergência' },
  { key: 'extintores', icon: 'ext', label: 'Extintores' },
  { key: 'hidrantes', icon: 'hidranteMedida', label: 'Hidrantes / Mangotinhos' },
  { key: 'alarme', icon: 'bellElectric', label: 'Alarme de Incêndio' },
  { key: 'deteccao', icon: 'detectorMedida', label: 'Detecção de Incêndio' },
  { key: 'sprinklers', icon: 'spray', label: 'Chuveiros Automáticos' },
  { key: 'controle_fumaca', icon: 'flame', label: 'Controle de Fumaça' },
  { key: 'compart_vertical', icon: 'stair', label: 'Compartimentação Vertical' },
  { key: 'controle_acabamento', icon: 'sign', label: 'Controle de Acabamento' },
  { key: 'gerenciamento_risco', icon: 'warn', label: 'Gerenciamento de Risco' },
  { key: 'central_gas', icon: 'info', label: 'Central de Gás' },
  { key: 'spda', icon: 'warn', label: 'SPDA' },
]

// Sistemas com uma tela de dimensionamento própria implementada (ver rotas
// em App.jsx) — os demais caem na página genérica "em construção" e por
// isso nunca são cobrados como pendentes no status do dashboard.
const SCREENS_DISPONIVEIS = new Set([
  'acesso_viatura', 'seg_estrutural', 'compart_horizontal', 'compart_vertical',
  'saida_emergencia', 'extintores', 'iluminacao', 'sinalizacao', 'hidrantes', 'gerenciamento_risco',
])

// Status consolidado exibido no card do sistema: 'done' (verde) quando o
// sistema está com todos os dados exigíveis preenchidos, 'progress'
// (amarelo) quando é obrigatório e ainda falta preencher, e 'todo' (cinza)
// quando foi dispensado (não obrigatório) ou ainda não tem tela própria.
function getStatusTone(key, required, progressTone) {
  if (!required || !SCREENS_DISPONIVEIS.has(key)) return 'todo'
  return progressTone === 'done' ? 'done' : 'progress'
}

const COMPLETE_CONFIG_STEPS = [
  { label: 'Identificação', test: s => [s.nome, s.endereco, s.cidade, s.propNome, s.propDocumento, s.respRazaoSocial, s.respCNPJ].every(Boolean) },
  { label: 'Edificação', test: s => (s.estruturas || []).length > 0 && s.estruturas.every(e => e.areaTotal && e.altura) },
  { label: 'Responsável técnico', test: s => Boolean(s.rtNome && (!s.usaArt || s.artNumero)) },
  { label: 'Classificação', test: s => (s.pavimentos || []).length > 0 && s.pavimentos.every(p => p.divisao && p.cnae) },
  { label: 'Carga de incêndio', test: s => {
    const values = Object.values(s.cargaState || {}).flatMap(item => Object.values(item || {}))
    return values.length > 0 && values.every(c => c?.metodo === 'levantamento' ? c.valorManual : c?.cargaIncendio)
  } },
  { label: 'Medidas de segurança', test: (_s, activeSystems) => activeSystems.length > 0 },
]

const DIMENSIONING_CONFIG_STEPS = [
  { label: 'Edificação', test: s => Boolean(s.nome) && (s.estruturas || []).length > 0 && s.estruturas.every(e => e.areaTotal && e.altura) },
  COMPLETE_CONFIG_STEPS[3],
  COMPLETE_CONFIG_STEPS[4],
  COMPLETE_CONFIG_STEPS[5],
]

const fmtNumber = value => value ? Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'

function getFireLoad(cargaState) {
  return Object.values(cargaState || {})
    .flatMap(item => item && ('metodo' in item || 'cargaIncendio' in item || 'valorManual' in item)
      ? [item]
      : Object.values(item || {}))
    .reduce((highest, item) => {
      const value = item?.metodo === 'levantamento' ? Number(item?.valorManual) || 0 : item?.cargaIncendio || 0
      return Math.max(highest, value)
    }, 0)
}

function getSystemProgress(key, state, structureId = null) {
  const scopedItems = items => structureId
    ? (items || []).filter(item => item.estruturaId === structureId)
    : (items || [])
  if (key === 'hidrantes') {
    if (state.hidrantes?.dimensionamento) return { tone: 'done', label: 'Sincronizado com o Revit', detail: 'Cálculo hidráulico disponível' }
    if (state.hidrantes?.tipo) return { tone: 'progress', label: 'Em dimensionamento', detail: 'Classificação definida' }
  }
  const extintores = scopedItems(state.extintores)
  const iluminacao = scopedItems(state.iluminacao)
  const sinalizacao = scopedItems(state.sinalizacao)
  if (key === 'extintores' && extintores.length) return { tone: 'progress', label: `${extintores.length} lançamento${extintores.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'iluminacao' && iluminacao.length) return { tone: 'progress', label: `${iluminacao.length} lançamento${iluminacao.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'sinalizacao' && sinalizacao.length) return { tone: 'progress', label: `${sinalizacao.length} lançamento${sinalizacao.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'acesso_viatura' && state.acessoViatura?.larguraAdotada) {
    return { tone: 'progress', label: 'Em preenchimento', detail: 'Parâmetros informados' }
  }
  return { tone: 'todo', label: 'A desenvolver', detail: 'Abra para dimensionar' }
}

const getRiskLabel = fireLoad => {
  if (!fireLoad) return 'Aguardando classificação'
  if (fireLoad <= 300) return 'Risco baixo'
  if (fireLoad <= 1200) return 'Risco médio'
  return 'Risco alto'
}

function TechnicalCardStack({ cards, selectedId, systemsCount, onSelect }) {
  const cardRef = useRef(null)
  const drag = useRef({ active: false, startX: 0, deltaX: 0 })
  const activeIndex = Math.max(0, cards.findIndex(card => card.id === selectedId))
  const activeCard = cards[activeIndex] || cards[0]
  const stackedCards = cards.length > 1
    ? Array.from({ length: Math.min(2, cards.length - 1) }, (_, index) => cards[(activeIndex + index + 1) % cards.length])
    : []

  const moveTo = direction => {
    if (cards.length < 2) return
    const nextIndex = (activeIndex + direction + cards.length) % cards.length
    const node = cardRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!node || reduceMotion) {
      onSelect(cards[nextIndex].id)
      return
    }
    gsap.killTweensOf(node)
    gsap.to(node, {
      x: direction > 0 ? -90 : 90,
      rotate: direction > 0 ? -2.2 : 2.2,
      opacity: 0,
      duration: .18,
      ease: 'power2.in',
      onComplete: () => {
        onSelect(cards[nextIndex].id)
        requestAnimationFrame(() => {
          gsap.fromTo(node,
            { x: direction > 0 ? 70 : -70, rotate: direction > 0 ? 1.5 : -1.5, opacity: 0 },
            { x: 0, rotate: 0, opacity: 1, duration: .38, ease: 'power3.out', clearProps: 'transform,opacity' })
        })
      },
    })
  }

  const handlePointerDown = event => {
    drag.current = { active: true, startX: event.clientX, deltaX: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    gsap.killTweensOf(cardRef.current)
  }

  const handlePointerMove = event => {
    if (!drag.current.active) return
    const deltaX = Math.max(-150, Math.min(150, event.clientX - drag.current.startX))
    drag.current.deltaX = deltaX
    gsap.set(cardRef.current, { x: deltaX, rotate: deltaX * .012, opacity: 1 - Math.abs(deltaX) / 500 })
  }

  const handlePointerEnd = () => {
    if (!drag.current.active) return
    drag.current.active = false
    const deltaX = drag.current.deltaX
    if (Math.abs(deltaX) > 64) {
      moveTo(deltaX < 0 ? 1 : -1)
      return
    }
    gsap.to(cardRef.current, { x: 0, rotate: 0, opacity: 1, duration: .35, ease: 'power3.out', clearProps: 'transform,opacity' })
  }

  if (!activeCard) return null

  return (
    <div className="dashboard-card-stack">
      <div className="dashboard-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {activeCard.name}. {systemsCount} sistema{systemsCount === 1 ? '' : 's'} aplicáve{systemsCount === 1 ? 'l' : 'is'}.
      </div>
      <div className="dashboard-card-stack__stage">
        {stackedCards.slice().reverse().map((card, reverseIndex) => (
          <div className="dashboard-technical-card dashboard-technical-card--back" data-depth={stackedCards.length - reverseIndex} key={card.id} aria-hidden="true">
            <span>{card.name}</span>
          </div>
        ))}
        <article
          ref={cardRef}
          className="dashboard-technical-card dashboard-technical-card--active"
          tabIndex={0}
          aria-label={`${activeCard.name}. Arraste para os lados ou use as setas para trocar de edificação.`}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') moveTo(-1)
            if (event.key === 'ArrowRight') moveTo(1)
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="dashboard-technical-card__name">
            <span>Nome da edificação</span>
            <h3>{activeCard.name}</h3>
          </div>
          <dl className="dashboard-technical-card__metrics">
            <div><dt>Área construída</dt><dd>{fmtNumber(activeCard.area)}<small>{activeCard.area ? ' m²' : ''}</small></dd></div>
            <div><dt>Quantidade de pavimentos</dt><dd>{activeCard.floorCount || '—'}</dd><small>{activeCard.height ? `${fmtNumber(activeCard.height)} m de altura${activeCard.id === 'all' ? ' máxima' : ''}` : 'Altura não informada'}</small></div>
            <div><dt>Risco de incêndio</dt><dd>{getRiskLabel(activeCard.fireLoad)}</dd><small>{activeCard.fireLoad ? `${fmtNumber(activeCard.fireLoad)} MJ/m² de carga de incêndio` : 'Carga de incêndio não informada'}</small></div>
          </dl>
        </article>
      </div>
      <div className="dashboard-card-stack__navigation">
        <div className="dashboard-card-stack__arrows">
          <button type="button" onClick={() => moveTo(-1)} disabled={cards.length < 2} aria-label="Edificação anterior"><Icon name="chevL" size={16}/></button>
          <span><strong>{String(activeIndex + 1).padStart(2, '0')}</strong> / {String(cards.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => moveTo(1)} disabled={cards.length < 2} aria-label="Próxima edificação"><Icon name="chevR" size={16}/></button>
        </div>
        <div className="dashboard-card-stack__dots" role="radiogroup" aria-label="Selecionar visão técnica">
          {cards.map(card => <button type="button" role="radio" className={card.id === selectedId ? 'is-active' : ''} key={card.id} onClick={() => onSelect(card.id)} aria-label={`Ver ${card.name}`} aria-checked={card.id === selectedId}/>) }
        </div>
        <span>Arraste para explorar as edificações</span>
      </div>
    </div>
  )
}

export default function DashboardPage({ onGoConfig, onNavigate }) {
  const { state } = useProjeto()
  const { info } = useNorma()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const [selectedStructureId, setSelectedStructureId] = useState('all')
  const [atividade, setAtividade] = useState([])

  // O heatmap decide em tempo real quantos dias cabem na box (ver
  // ActivityHeatmap) — busca uma janela generosa o bastante pra cobrir até
  // o cenário de quadrados bem pequenos (~180 dias), nunca menos do que o
  // heatmap possa vir a precisar.
  useEffect(() => {
    if (!state.id) { setAtividade([]); return }
    let cancelado = false
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - 179)
    supabase
      .from('atividade_diaria')
      .select('dia,contagem')
      .eq('projeto_id', state.id)
      .gte('dia', inicio.toISOString().slice(0, 10))
      .then(({ data: registros, error }) => {
        if (cancelado) return
        if (error) { console.error('Falha ao carregar atividade do projeto:', error.message); setAtividade([]); return }
        setAtividade(registros || [])
      })
    return () => { cancelado = true }
  }, [state.id])

  const data = useMemo(() => {
    const structures = state.estruturas || []
    const activeSystems = SYSTEMS
      .filter(system => sistemas[system.key]?.ativo || sistemas[system.key]?.obrigatorio)
      .map(system => {
        const required = Boolean(sistemas[system.key]?.obrigatorio)
        const progress = getSystemProgress(system.key, state)
        return { ...system, required, progress, statusTone: getStatusTone(system.key, required, progress.tone) }
      })
      .sort((a, b) => Number(b.required) - Number(a.required))
    const configSteps = state.tipoProjeto === 'dimensionamento' ? DIMENSIONING_CONFIG_STEPS : COMPLETE_CONFIG_STEPS
    const configuredSteps = configSteps.filter(step => step.test(state, activeSystems))
    const groups = [...new Set((state.pavimentos || []).map(p => p.grupo).filter(Boolean))].sort()
    const divisions = [...new Set((state.pavimentos || []).map(p => p.divisao).filter(Boolean))].sort()
    const floorCount = structures.reduce((sum, item) => sum + (Number(item.nPavimentos) || 0), 0)
    const basementCount = structures.reduce((sum, item) => sum + (Number(item.nSubsolos) || 0), 0)
    const area = Number(state.areaConstruidaTotal) || structures.reduce((sum, item) => sum + (Number(item.areaTotal) || 0), 0)
    const height = structures.reduce((highest, item) => Math.max(highest, Number(item.altura) || 0), 0)
    const fireLoad = getFireLoad(state.cargaState)
    const systemsWithData = activeSystems.filter(system => system.progress.tone !== 'todo')
    const configPercent = Math.round((configuredSteps.length / configSteps.length) * 100)
    const hasTechnicalData = Boolean(state.nome || area || height || fireLoad || groups.length || state.rtNome)

    const selectedStructure = structures.find(item => item.id === selectedStructureId)
    const selectedPavements = selectedStructure
      ? (state.pavimentos || []).filter(item => item.estruturaId === selectedStructure.id)
      : (state.pavimentos || [])
    const structureSystems = selectedStructure
      ? porEstrutura.find(item => item.estrutura.id === selectedStructure.id)?.sistemas || {}
      : sistemas
    const summarySystems = SYSTEMS.filter(system => structureSystems[system.key]?.ativo || structureSystems[system.key]?.obrigatorio)
    const displayedSystems = summarySystems
      .map(system => {
        const required = Boolean(structureSystems[system.key]?.obrigatorio)
        const progress = getSystemProgress(system.key, state, selectedStructure?.id)
        return { ...system, required, progress, statusTone: getStatusTone(system.key, required, progress.tone) }
      })
      .sort((a, b) => Number(b.required) - Number(a.required))
    const summaryGroups = [...new Set(selectedPavements.map(item => item.grupo).filter(Boolean))].sort()
    const summaryDivisions = [...new Set(selectedPavements.map(item => item.divisao).filter(Boolean))].sort()
    const makeStructureSummary = structure => {
      const structurePavements = (state.pavimentos || []).filter(item => item.estruturaId === structure.id)
      return {
        id: structure.id,
        name: structure.nome || 'Edificação sem nome',
        area: Number(structure.areaTotal) || 0,
        height: Number(structure.altura) || 0,
        floorCount: Number(structure.nPavimentos) || 0,
        basementCount: Number(structure.nSubsolos) || 0,
        fireLoad: getFireLoad(state.cargaState?.[structure.id]),
        groups: [...new Set(structurePavements.map(item => item.grupo).filter(Boolean))].sort(),
        divisions: [...new Set(structurePavements.map(item => item.divisao).filter(Boolean))].sort(),
      }
    }
    const summary = selectedStructure ? {
      id: selectedStructure.id,
      name: selectedStructure.nome || 'Edificação sem nome',
      label: selectedStructure.nome,
      area: Number(selectedStructure.areaTotal) || 0,
      height: Number(selectedStructure.altura) || 0,
      floorCount: Number(selectedStructure.nPavimentos) || 0,
      basementCount: Number(selectedStructure.nSubsolos) || 0,
      fireLoad: getFireLoad(state.cargaState?.[selectedStructure.id]),
      groups: summaryGroups,
      divisions: summaryDivisions,
      systemCount: summarySystems.length,
      requiredCount: summarySystems.filter(system => structureSystems[system.key]?.obrigatorio).length,
    } : {
      id: 'all', name: 'Visão geral do projeto', label: 'Visão geral', area, height, floorCount, basementCount, fireLoad,
      groups: summaryGroups, divisions: summaryDivisions,
      systemCount: activeSystems.length,
      requiredCount: activeSystems.filter(system => system.required).length,
    }

    const technicalCards = [{ id: 'all', name: 'Visão geral do projeto', area, height, floorCount, basementCount, fireLoad }, ...structures.map(makeStructureSummary)]

    return { activeSystems, displayedSystems, configuredSteps, configStepCount: configSteps.length, groups, divisions, systemsWithData, configPercent, hasTechnicalData, summary, technicalCards }
  }, [state, sistemas, porEstrutura, selectedStructureId])

  const projectReady = data.configPercent === 100
  const address = [state.endereco, state.numero, state.bairro, state.cidade && `${state.cidade} — ${state.uf || 'MA'}`].filter(Boolean).join(', ')
  return (
    <main className="dashboard-shell">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-status-line"><span className={projectReady ? 'is-ready' : ''}/>{projectReady ? 'Configuração concluída' : `${data.configPercent}% da configuração concluída`}</div>
            <h1>{state.nome || 'Projeto sem nome'}</h1>
            <p>{[state.cidade && `${state.cidade} — ${state.uf || 'MA'}`, info?.nome || 'NT 01/2019 CBMMA', data.groups.length && `Grupos ${data.groups.join(', ')}`].filter(Boolean).join(' · ')}</p>
          </div>
          <button type="button" className="btn-primary dashboard-header__button" onClick={onGoConfig}><Icon name="settings" size={14}/> Editar configuração</button>
        </header>

        <div className="dashboard-top-row">
          <section className="dashboard-overview" aria-label="Situação geral do projeto">
            <div className="dashboard-overview__lead">
              <div className="dashboard-overview__copy">
                <span>Situação do projeto</span>
                <h2>{projectReady ? 'Configuração pronta para dimensionamento.' : data.hasTechnicalData ? 'Há dados da base técnica para revisar.' : 'Comece pela configuração do projeto.'}</h2>
                <p>{projectReady ? `${data.activeSystems.length} sistemas foram identificados para desenvolvimento e conferência.` : data.hasTechnicalData ? `${data.configStepCount - data.configuredSteps.length} etapa${data.configStepCount - data.configuredSteps.length === 1 ? '' : 's'} da configuração ainda precisa${data.configStepCount - data.configuredSteps.length === 1 ? '' : 'm'} de atenção.` : 'Cadastre a edificação para identificar as exigências e iniciar os dimensionamentos.'}</p>
              </div>
              <div className="dashboard-overview__score" aria-label={`${data.configPercent}% concluído`}><strong>{data.configPercent}<small>%</small></strong><span>base técnica</span></div>
            </div>
            <div className="dashboard-stages">
              <div className={projectReady ? 'is-complete' : 'is-current'}><span>01</span><strong>Configuração</strong><small>{data.configuredSteps.length} de {data.configStepCount} etapas</small></div>
              <div className={projectReady ? 'is-current' : ''}><span>02</span><strong>Sistemas</strong><small>{data.systemsWithData.length} com dados cadastrados</small></div>
              <div><span>03</span><strong>Documentação</strong><small>Memorial e anexos</small></div>
            </div>
          </section>

          <aside className="dashboard-panel dashboard-activity" aria-label="Atividade recente do projeto — últimos 30 dias">
            <ActivityHeatmap registros={atividade}/>
          </aside>
        </div>

        <section className="dashboard-information-grid">
          <article className="dashboard-panel dashboard-identification">
            <div className="dashboard-section-heading"><div><h2>Identificação do projeto</h2><p>Dados administrativos e responsáveis</p></div><Icon name="info" size={15}/></div>
            <dl>
              <div><dt>Nome do projeto</dt><dd>{state.nome || 'Não informado'}</dd></div>
              <div><dt>Localização</dt><dd>{address || 'Não informada'}</dd></div>
              <div><dt>Proprietário</dt><dd>{state.propNome || 'Não informado'}</dd></div>
              <div><dt>Responsável pelo uso</dt><dd>{state.respRazaoSocial || 'Não informado'}</dd></div>
              {state.tipoProjeto === 'dimensionamento' ? <div><dt>Modalidade</dt><dd>Apenas dimensionamento</dd></div> : <>
                <div><dt>Responsável técnico</dt><dd>{state.rtNome || 'Não informado'}</dd></div>
                <div><dt>Registro / ART</dt><dd>{[state.rtConselho, state.artNumero].filter(Boolean).join(' · ') || 'Não informado'}</dd></div>
              </>}
            </dl>
            <button type="button" className="dashboard-text-button" onClick={onGoConfig}>Editar identificação <Icon name="right" size={13}/></button>
          </article>

        </section>

        <section className="dashboard-technical" aria-label="Resumo técnico">
          <div className="dashboard-section-heading dashboard-technical__heading">
            <div><h2>Resumo técnico</h2><p>O card selecionado define os sistemas exibidos abaixo</p></div>
            <span>{selectedStructureId === 'all' ? 'Todas as edificações' : data.summary.label}</span>
          </div>
          <TechnicalCardStack cards={data.technicalCards} selectedId={selectedStructureId} systemsCount={data.displayedSystems.length} onSelect={setSelectedStructureId}/>
        </section>

        <section className="dashboard-systems">
          <div className="dashboard-section-heading dashboard-section-heading--systems"><div><h2>Sistemas aplicados</h2><p>{selectedStructureId === 'all' ? 'Status consolidado de todas as edificações' : `Sistemas aplicáveis a ${data.summary.label}`}</p></div><span>{data.displayedSystems.length} aplicáveis</span></div>
          {data.displayedSystems.length ? <div className="dashboard-system-list">{data.displayedSystems.map(system => (
            <button type="button" className="dashboard-system" key={system.key} onClick={() => onNavigate?.(system.key)}>
              <span className={`dashboard-system__icon dashboard-system__icon--${system.statusTone}`}><Icon name={system.icon} size={17}/></span>
              <span className="dashboard-system__name"><strong>{system.label}</strong><small>{system.required ? 'Obrigatório' : 'Opcional habilitado'}</small></span>
              <span className={`dashboard-system__status dashboard-system__status--${system.statusTone}`}><strong>{system.progress.label}</strong><small>{system.progress.detail}</small></span>
              <Icon name="right" size={15} className="dashboard-system__arrow"/>
            </button>
          ))}</div> : <div className="dashboard-empty"><Icon name="settings" size={18}/><div><strong>Nenhum sistema definido</strong><p>Conclua a classificação e as medidas de segurança na configuração.</p></div><button type="button" onClick={onGoConfig}>Configurar projeto</button></div>}
        </section>

        <section className={`dashboard-documents ${!data.hasTechnicalData ? 'dashboard-documents--disabled' : ''}`}>
          <div><span className="dashboard-documents__icon"><Icon name="file" size={19}/></span><div><h2>Memorial e documentos do projeto</h2><p>{state.tipoProjeto === 'dimensionamento' ? 'Revise o memorial descritivo montado a partir dos dimensionamentos.' : 'Revise o memorial descritivo e o Anexo B montados a partir desta configuração.'}</p></div></div>
          <button type="button" className="btn-ghost" disabled={!data.hasTechnicalData} onClick={() => onNavigate?.('documentos')}>{data.hasTechnicalData ? 'Abrir documentos' : 'Aguardando configuração'} {data.hasTechnicalData && <Icon name="right" size={14}/>}</button>
        </section>
      </div>
    </main>
  )
}
