import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import logo from '../assets/fireutils-landing.svg'
import revitVideo from '../assets/revit-fireutils.mp4'
import Icon from '../components/ui/Icon'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { usePerfil } from '../hooks/usePerfil'
import './LandingPage.css'
import { useBuildingMotion, useLandingMotion } from '../hooks/useLandingMotion'

const REVIT_VIDEO_URL = revitVideo
const stages = [
  { name: 'FireUtils', title: 'Configure o projeto e as medidas.', description: 'Revise a classificação da edificação e habilite os sistemas exigidos para o projeto.', label: 'FIREUTILS / PROJETO', status: 'Configuração do projeto', icon: 'extintorMedida' },
  { name: 'Revit', title: 'Modele e dimensione no Revit com o Plugin FireUtils.', description: 'Desenvolva os sistemas de incêndio no modelo e envie os dados técnicos pelo plugin FireUtils.', label: 'REVIT / MODELO', status: 'Sistemas de incêndio', icon: 'hidranteMedida' },
  { name: 'Memorial', title: 'Gere e revise o memorial.', description: 'Transforme os dimensionamentos cadastrados em documentação técnica pronta para conferência.', label: 'FIREUTILS / DOCUMENTOS', status: 'Memorial descritivo', icon: 'segEstruturalMedida' },
]

const modules = [
  { icon: 'documentosMedida', name: 'Memorial descritivo automático', description: 'Gera a documentação técnica a partir dos dados consolidados do projeto e prepara o memorial para revisão.' },
  { icon: 'settings', name: 'Ferramentas de produtividade BIM', description: 'Acelera tarefas de modelagem, organização e atualização das informações do PPCI no ambiente Revit.' },
  { icon: 'saidaEmergenciaMedida', name: 'Dimensionamento de saídas', description: 'Verifica as exigências de abandono usando ocupação, população e características reais da edificação.' },
  { icon: 'hidranteMedida', name: 'Dimensionamento de hidrantes', description: 'Processa vazões, pressões e perdas de carga com os dados do sistema modelado no Revit.' },
  { icon: 'sprinklerMedida', name: 'Dimensionamento de sprinklers', description: 'Levará a rede modelada ao cálculo hidráulico dentro do mesmo fluxo FireUtils.', soon: true },
  { icon: 'flame', name: 'Ember', description: 'Audita o memorial descritivo, identifica inconsistências e sugere soluções normativas.', ember: true },
]

const networkPaths = [
  'M 580 315 L 155 125',
  'M 580 315 L 445 65',
  'M 580 315 L 165 435',
  'M 580 315 L 1005 145',
  'M 580 315 L 995 440',
  'M 580 315 L 460 561',
]

const networkMeshPaths = [
  'M 155 125 L 445 65',
  'M 155 125 L 165 435',
  'M 445 65 L 1005 145',
  'M 1005 145 L 995 440',
  'M 995 440 L 460 561',
  'M 460 561 L 165 435',
  'M 445 65 L 460 561',
  'M 165 435 L 995 440',
]

const networkMeshLinks = [[0, 1], [0, 2], [1, 3], [3, 4], [4, 5], [5, 2], [1, 5], [2, 4]]

const networkNodePoints = [
  { x: 155, y: 125 }, { x: 445, y: 65 }, { x: 165, y: 435 },
  { x: 1005, y: 145 }, { x: 995, y: 440 }, { x: 460, y: 561 },
]

// Pontos distribuídos pelo comprimento real da elipse. Em uma elipse, dividir
// apenas o ângulo aproxima os módulos nas laterais; estes ângulos preservam um
// intervalo visual mais constante sem transformar a órbita em um círculo.
const networkOrbitAngles = [0, 1.135089, 2.006535, Math.PI, 4.276681, 5.148128]
const networkHighlightSequence = [0, 3, 1, 4, 2, 5]

const networkAuxNodes = [
  { kind: 'label', text: 'PRODUTIVIDADE', x: 290, y: 175, link: 1 },
  { kind: 'label', text: 'NT 11', x: 275, y: 345, link: 2 },
  { kind: 'label', text: 'NT 22', x: 835, y: 235, link: 3 },
  { kind: 'label', text: 'PRESSÃO', x: 790, y: 320, link: 3 },
  { kind: 'label', text: 'VAZÃO', x: 875, y: 340, link: 3 },
  { kind: 'label', text: 'POPULAÇÃO', x: 285, y: 470, link: 2 },
  { kind: 'label', text: 'AUDITORIA', x: 700, y: 565, link: 5 },
  { kind: 'label', text: 'DOCUMENTAÇÃO', x: 250, y: 250, link: 0 },
  { kind: 'particle', x: 110, y: 45, size: 6, link: 0 },
  { kind: 'particle', x: 260, y: 70, size: 5, link: 1 },
  { kind: 'particle', x: 610, y: 65, size: 7, link: 1 },
  { kind: 'particle', x: 770, y: 90, size: 5, link: 3 },
  { kind: 'particle', x: 1090, y: 250, size: 7, link: 3 },
  { kind: 'particle', x: 1080, y: 540, size: 5, link: 4 },
  { kind: 'particle', x: 820, y: 625, size: 6, link: 4 },
  { kind: 'particle', x: 610, y: 655, size: 5, link: 5 },
  { kind: 'particle', x: 225, y: 625, size: 7, link: 2 },
  { kind: 'particle', x: 85, y: 560, size: 5, link: 2 },
  { kind: 'particle', x: 620, y: 185, size: 6, link: 1 },
  { kind: 'particle', x: 745, y: 470, size: 7, link: 5 },
]

const networkAuxPaths = networkAuxNodes.map(node => {
  const source = networkNodePoints[node.link]
  return `M ${source.x} ${source.y} L ${node.x} ${node.y}`
})

function Mark() {
  return <svg className="fl-mark" viewBox="0 0 168 216" aria-hidden="true"><path d="M168 0V154.523H121.426V50.9454L168 0Z"/><path d="M103.129 61.4769V216H58.2179V112.422L103.129 61.4769Z"/><path d="M44.9109 112.985H0V164.492L44.9109 112.985Z"/></svg>
}

export function ModuleNetwork() {
  const boardRef = useRef(null)
  const userInteractionRef = useRef(false)
  const automaticModuleIndexRef = useRef(0)
  const [activeModule, setActiveModule] = useState(null)
  const [decodedDescription, setDecodedDescription] = useState('')
  const activateModule = index => {
    userInteractionRef.current = true
    setDecodedDescription('')
    setActiveModule(index)
  }
  const deactivateModules = () => {
    userInteractionRef.current = false
    setDecodedDescription('')
    setActiveModule(null)
  }

  useEffect(() => {
    const board = boardRef.current
    if (!board || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const nodes = [...board.querySelectorAll('.fl-network-node')]
    const items = [...board.querySelectorAll('.fl-network-item')]
    const auxNodes = [...board.querySelectorAll('.fl-network-aux')]
    const auxAnchors = [...board.querySelectorAll('.fl-network-aux-anchor')]
    const core = board.querySelector('.fl-network-core')
    const coreTraces = [...board.querySelectorAll('.fl-network-trace')]
    const coreSignals = [...board.querySelectorAll('.fl-network-signal')]
    const meshTraces = [...board.querySelectorAll('.fl-network-mesh')]
    const meshSignals = [...board.querySelectorAll('.fl-network-mesh-signal')]
    const auxTraces = [...board.querySelectorAll('.fl-network-aux-trace')]
    const movers = nodes.map(element => ({
      element,
      moveX: gsap.quickTo(element, 'x', { duration: .45, ease: 'power3.out' }),
      moveY: gsap.quickTo(element, 'y', { duration: .45, ease: 'power3.out' }),
      strength: 7,
    }))
    let orbitActive = false
    const pointFor = (element, boardBounds) => {
      const bounds = element.getBoundingClientRect()
      return {
        x: (bounds.left + bounds.width / 2 - boardBounds.left) / boardBounds.width * 1160,
        y: (bounds.top + bounds.height / 2 - boardBounds.top) / boardBounds.height * 720,
      }
    }
    const updateOrbit = (time = 0) => {
      const useOrbit = window.innerWidth > 900 || Boolean(board.closest('.login-network'))
      if (!useOrbit) {
        if (orbitActive) {
          gsap.set(items, { clearProps: 'left,top' })
          gsap.set(auxAnchors, { clearProps: 'left,top' })
          orbitActive = false
        }
        return false
      }
      orbitActive = true
      const motionTime = time * .15
      const modulePoints = items.map((item, index) => {
        const baseAngle = networkOrbitAngles[index] - Math.PI * .72
        const angle = baseAngle + motionTime * .105 + Math.sin(motionTime * .16 + index * 1.13) * .045
        const radiusX = 408 + Math.sin(motionTime * .11 + index * 1.47) * 18
        const radiusY = 248 + Math.cos(motionTime * .14 + index * 1.21) * 14
        const x = 580 + Math.cos(angle) * radiusX
        const y = 350 + Math.sin(angle) * radiusY
        gsap.set(item, { left: `${(x - 115) / 11.6}%`, top: `${(y - 36) / 7.2}%` })
        return { x, y }
      })
      auxAnchors.forEach((anchor, index) => {
        const config = networkAuxNodes[index]
        const source = modulePoints[config.link]
        const phase = index * 1.73 + motionTime * (.34 + index % 4 * .045)
        const radius = config.kind === 'particle' ? 130 + index % 5 * 10 : 176 + index % 3 * 17
        const flatten = config.kind === 'particle' ? .78 : .66
        const x = source.x + Math.cos(phase) * radius
        const y = source.y + Math.sin(phase) * radius * flatten
        gsap.set(anchor, { left: `${x / 11.6}%`, top: `${y / 7.2}%` })
      })
      return true
    }
    const updateConnections = (time = 0) => {
      if (!core || !board.offsetParent) return
      if (!updateOrbit(time)) return
      const boardBounds = board.getBoundingClientRect()
      const corePoint = pointFor(core, boardBounds)
      const nodePoints = nodes.map(node => pointFor(node, boardBounds))
      nodes.forEach((_, index) => {
        const nodePoint = nodePoints[index]
        const path = `M ${corePoint.x} ${corePoint.y} L ${nodePoint.x} ${nodePoint.y}`
        coreTraces[index]?.setAttribute('d', path)
        coreSignals[index]?.setAttribute('d', path)
      })
      networkMeshLinks.forEach(([from, to], index) => {
        const fromPoint = nodePoints[from]
        const toPoint = nodePoints[to]
        const path = `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`
        meshTraces[index]?.setAttribute('d', path)
        meshSignals[index]?.setAttribute('d', path)
      })
      auxNodes.forEach((auxiliary, index) => {
        const sourcePoint = nodePoints[networkAuxNodes[index].link]
        const auxiliaryPoint = pointFor(auxiliary, boardBounds)
        auxTraces[index]?.setAttribute('d', `M ${sourcePoint.x} ${sourcePoint.y} L ${auxiliaryPoint.x} ${auxiliaryPoint.y}`)
      })
    }
    const repel = event => {
      movers.forEach(({ element, moveX, moveY, strength }) => {
        const bounds = element.getBoundingClientRect()
        const dx = bounds.left + bounds.width / 2 - event.clientX
        const dy = bounds.top + bounds.height / 2 - event.clientY
        const distance = Math.hypot(dx, dy)
        const radius = 190
        const force = distance < radius ? (1 - distance / radius) * strength : 0
        moveX(distance ? dx / distance * force : 0)
        moveY(distance ? dy / distance * force : 0)
      })
    }
    const reset = () => movers.forEach(({ moveX, moveY }) => { moveX(0); moveY(0) })
    board.addEventListener('pointermove', repel)
    board.addEventListener('pointerleave', reset)
    gsap.ticker.add(updateConnections)
    updateConnections()
    return () => {
      board.removeEventListener('pointermove', repel)
      board.removeEventListener('pointerleave', reset)
      gsap.ticker.remove(updateConnections)
      gsap.killTweensOf([...nodes, ...auxNodes])
    }
  }, [])

  useEffect(() => {
    if (window.innerWidth <= 700 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cycleTimer
    let closeTimer
    let cancelled = false
    const queueNext = () => {
      if (cancelled) return
      const delay = 2500
      cycleTimer = window.setTimeout(() => {
        if (userInteractionRef.current) {
          queueNext()
          return
        }
        const next = networkHighlightSequence[automaticModuleIndexRef.current]
        automaticModuleIndexRef.current = (automaticModuleIndexRef.current + 1) % networkHighlightSequence.length
        setDecodedDescription('')
        setActiveModule(next)
        closeTimer = window.setTimeout(() => {
          if (!userInteractionRef.current) {
            setDecodedDescription('')
            setActiveModule(null)
          }
          queueNext()
        }, 6000)
      }, delay)
    }
    queueNext()
    return () => {
      cancelled = true
      window.clearTimeout(cycleTimer)
      window.clearTimeout(closeTimer)
    }
  }, [])

  useEffect(() => {
    if (activeModule === null) return
    const source = modules[activeModule].description
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}'
    let revealed = 0
    const timer = window.setInterval(() => {
      revealed += 1.7
      setDecodedDescription([...source].map((character, index) => {
        if (character === ' ') return ' '
        if (index < revealed) return character
        return glyphs[Math.floor(Math.random() * glyphs.length)]
      }).join(''))
      if (revealed >= source.length) window.clearInterval(timer)
    }, 28)
    const detail = boardRef.current?.querySelector('.fl-network-item-detail')
    if (detail) gsap.fromTo(detail, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' })
    return () => window.clearInterval(timer)
  }, [activeModule])

  return <div ref={boardRef} className="fl-network-board" onPointerLeave={deactivateModules}>
    <svg className="fl-network-lines" viewBox="0 0 1160 720" preserveAspectRatio="none" aria-hidden="true">{networkAuxPaths.map((path,index) => <path className={`fl-network-aux-trace ${activeModule === networkAuxNodes[index].link ? 'is-active' : ''}`} d={path} key={`aux-${index}`}/>)}{networkMeshPaths.map((path,index) => <g key={path}><path className="fl-network-mesh" d={path}/><path className={`fl-network-mesh-signal mesh-signal-${index + 1} ${activeModule !== null && networkMeshLinks[index].includes(activeModule) ? 'is-active' : ''}`} d={path} pathLength="100"/></g>)}{networkPaths.map((path,index) => <g key={path}><path className={`fl-network-trace ${activeModule === index ? 'is-active' : ''}`} d={path}/><path className={`fl-network-signal signal-${index + 1} ${activeModule === index ? 'is-active' : ''}`} d={path} pathLength="100"/></g>)}</svg>
    <div className="fl-network-core"><Loader size={62} className="fl-network-core-loader" label="FireUtils"/></div>
    {networkAuxNodes.map((node,index) => <span className="fl-network-aux-anchor" style={{ left: `${node.x / 11.6}%`, top: `${node.y / 7.2}%` }} key={`${node.kind}-${index}`} aria-hidden="true"><span className={`fl-network-aux is-${node.kind} ${activeModule === node.link ? 'is-related' : ''}`} style={node.kind === 'particle' ? { width: node.size, height: node.size } : undefined}>{node.text}</span></span>)}
    {modules.map((module,index) => <div className={`fl-network-item item-${index + 1}`} key={module.name} onPointerEnter={() => activateModule(index)} onPointerLeave={deactivateModules}><div className="fl-network-float"><button type="button" className={`fl-network-node ${activeModule === index ? 'is-active' : ''} ${module.soon ? 'is-soon' : ''}`} onFocus={() => activateModule(index)} onBlur={deactivateModules} onClick={() => activateModule(index)}><span><Icon name={module.icon} size={23}/></span><h3>{module.name}</h3>{module.soon && <small>EM BREVE</small>}</button>{activeModule === index && <div className="fl-network-item-detail" aria-live="polite"><span>0{index + 1} / MÓDULO</span><p>{decodedDescription}</p></div>}</div></div>)}
  </div>
}

function Building({ small = false }) {
  const gridId = useId()
  const buildingRef = useRef(null)
  useBuildingMotion(buildingRef)
  return <svg ref={buildingRef} className={`fl-building ${small ? 'is-small' : ''}`} viewBox="0 0 680 380" role="img" aria-label="Ilustração de uma edificação com rede de proteção contra incêndio em vermelho">
    <defs><pattern id={gridId} width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="matrix(1 .45 -1 .45 340 30)"><path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth=".5"/></pattern></defs>
    <rect width="680" height="380" fill={`url(#${gridId})`} opacity=".2"/>
    <g className="fl-building-shell" fill="none" stroke="currentColor" strokeWidth="1.2">
      {[0, 55, 110, 165].map(y => <g className="fl-floor" key={y} transform={`translate(0 ${y})`}><path d="M160 115L350 25 545 115 350 208Z"/><path d="M160 115V139L350 231 545 139V115M350 208V231"/><path d="M208 93L398 185M255 70L447 161M303 48L496 138M208 138L398 48M255 162L448 71M303 185L497 94" opacity=".36"/></g>)}
      <path d="M160 115V304M350 25V190M545 115V304M350 208V373"/>
    </g>
    <g className="fl-pipes" fill="none" strokeWidth="3"><path d="M350 351V191L253 145 350 99 449 145M350 246L448 199 497 223M350 299L254 253 207 275"/><path d="M301 123V148M399 122V146M448 199V221M254 253V274"/>
      {[ [350,351], [253,145], [350,99], [449,145], [497,223], [207,275] ].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4"/>)}
    </g>
    <g fill="currentColor" fontSize="9" fontFamily="monospace"><text x="550" y="120">03 / COBERTURA</text><text x="550" y="175">02 / PAVIMENTO</text><text x="550" y="230">01 / PAVIMENTO</text><text x="550" y="285">00 / TÉRREO</text></g>
  </svg>
}

function RevitPreview({ onReady }) {
  return <div className="fl-revit-preview">
    <div className="fl-revit-canvas">{REVIT_VIDEO_URL ? <video className="fl-revit-video" autoPlay muted loop playsInline preload="auto" src={REVIT_VIDEO_URL} onCanPlay={event => { onReady?.(); event.currentTarget.play().catch(() => {}) }} onEnded={event => { event.currentTarget.currentTime = 0; event.currentTarget.play().catch(() => {}) }}/> : <Building/>}</div>
  </div>
}

function ConnectedHero({ onVideoReady, onPreviewReady }) {
  useEffect(() => { onPreviewReady?.() }, [onPreviewReady])
  return <div className="fl-connected-hero">
    <div className="fl-revit-layer" tabIndex={0} aria-label="Prévia do plugin FireUtils no Revit"><RevitPreview onReady={onVideoReady}/></div>
    <div className="fl-web-layer" tabIndex={0} aria-label="Prévia do dimensionamento de hidrantes na plataforma FireUtils"><Preview stage={1} compact view="hydrants"/></div>
  </div>
}

const platformNav = [
  ['Dashboard', 'dashboard'], ['Configuração', 'config'], ['MEDIDAS DE SEGURANÇA', 'section'],
  ['Acesso de Viatura', 'acesso'], ['Seg. Estrutural', 'estrutural'], ['Compartimentação Horizontal', 'horizontal'],
  ['Compartimentação Vertical', 'vertical'], ['Controle de Acabamento', 'acabamento'], ['Saídas de Emergência', 'saidas'],
  ['Brigada de Incêndio', 'brigada'], ['Iluminação de Emergência', 'iluminacao'], ['Sinalização', 'sinalizacao'],
  ['Extintores', 'extintores'], ['Hidrantes / Mangotinho', 'hidrantes'], ['Alarme de Incêndio', 'alarme'],
  ['Detecção de Incêndio', 'deteccao'], ['Chuveiros Automáticos', 'chuveiros'], ['DOCUMENTOS', 'section'], ['Documentos', 'documentos'],
]

const platformNavIcons = { dashboard: 'dash', config: 'settings', acesso: 'viaturaMedida', estrutural: 'segEstruturalMedida', horizontal: 'compartHorizontalMedida', vertical: 'compartVerticalMedida', acabamento: 'controleAcabamentoMedida', saidas: 'saidaEmergenciaMedida', brigada: 'brigadaMedida', iluminacao: 'iluminacaoMedida', sinalizacao: 'sinalizacaoMedida', extintores: 'extintorMedida', hidrantes: 'hidranteMedida', alarme: 'alarmeMedida', deteccao: 'detectorMedida', chuveiros: 'sprinklerMedida', documentos: 'documentosMedida' }

function ProductSidebar({ active, compact = false }) {
  return <aside className={`fl-preview-sidebar ${compact ? 'is-compact' : ''}`}><div className="fl-sidebar-brand">{compact ? <Mark/> : <img src={logo} alt="FireUtils"/>}<span>◫</span></div><div className="fl-sidebar-back">← <b>Projetos</b></div>{platformNav.map(([name, key]) => key === 'section' ? <span className="fl-sidebar-section" key={name}>{name}</span> : <div className={active === key ? 'selected' : ''} key={key}>{compact ? <Icon name={platformNavIcons[key]} size={12}/> : <span className="fl-sidebar-square"/>}<span className="fl-sidebar-label">{name}</span></div>)}</aside>
}

function DashboardMock() {
  return <div className="fl-app-dashboard">
    <div className="fl-completion"><span>Completude do projeto</span><b>0 de 8 sistemas dimensionados</b><i/></div>
    <div className="fl-stat-row"><div><span>Área construída</span><strong>650<small> m²</small></strong></div><div><span>Altura da edificação</span><strong>12<small> m</small></strong></div><div><span>Carga de incêndio</span><strong>300<small> MJ/m²</small></strong></div></div>
    <div className="fl-summary-row"><div><span>Classificação</span><b>Grupos A, C, G</b><small>NT 01/2019 CBMMA</small></div><div><span>Edificação</span><b>4 pavimentos</b><small>Concreto armado</small></div><div><span>Responsáveis</span><b>Projetista cadastrado</b><small>CREA / CAU</small></div></div>
  </div>
}

function HydrantMock() {
  const losses = [
    ['T3', 'Trecho HD01 ao Ponto A', 'DN65', '10.0756 m', '1.7751 mca'],
    ['T4', 'Trecho HD02 ao Ponto A', 'DN65', '10.0713 m', '1.7744 mca'],
    ['T2', 'Trecho Bomba ao Ponto A', 'DN80', '246.3884 m', '56.9285 mca'],
    ['T1', 'Trecho de Sucção (RTI à Bomba)', 'DN100', '18.4700 m', '1.4395 mca'],
  ]
  return <div className="fl-hydrant-shell">
    <aside className="fl-hydrant-steps"><span>ETAPAS</span><div className="done"><i>✓</i><b>Classificação do Sistema</b><small>Tipo, RTI e sistema aplicado</small></div><div className="active"><i>2</i><b>Dimensionamento do Sistema</b><small>Perdas de carga, cotas e pressão</small></div><div className="done"><i>✓</i><b>Dimensionamento da Bomba</b><small>Eficiência e potência</small></div></aside>
    <div className="fl-hydrant-viewport"><div className="fl-hydrant-page"><span className="fl-micro fl-red-label">MEDIDAS DE SEGURANÇA</span><h4>Hidrantes / Mangotinho</h4><p>Classificação conforme NT 22 CBMMA / NBR 13714 — dimensionamento hidráulico calculado pelo plugin Revit.</p><div className="fl-hydrant-import">✓ &nbsp; Dados importados do Revit — Método: Válvula do Hidrante</div><div className="fl-hydrant-metrics"><span>CLASSIFICAÇÃO<b>Tipo 5</b></span><span>MÉTODO<b>Válvula do Hidrante</b></span><span>VAZÃO MÍNIMA<b>600 L/min</b></span><span>PRESSÃO<b>60–100 mca</b></span></div><h5>VERIFICAÇÃO DO HIDRANTE MAIS DESFAVORÁVEL</h5><div className="fl-hydrant-table"><b>HIDRANTE</b><b>PERDA DE CARGA</b><b>SITUAÇÃO</b><span>H-01</span><span>18.7364 mca</span><em>1º mais desfavorável</em><span>H-02</span><span>18.5563 mca</span><em className="amber">2º mais desfavorável</em><span>H-32</span><span>5.9321 mca</span><em className="neutral">Mais favorável</em></div><div className="fl-hydrant-results"><span>ALTURA MANOMÉTRICA TOTAL<b>121.1337 mca</b></span><span>VAZÃO TOTAL<b>1200.00 L/min</b></span><span>RAMAL GOVERNANTE<b>HD01</b></span></div><h5>VERIFICAÇÃO DE VELOCIDADE</h5><div className="fl-hydrant-speed">{[['Trecho HD01 ao Ponto A','DN65','3.013 m/s'],['Trecho HD02 ao Ponto A','DN65','3.014 m/s'],['Trecho Bomba ao Ponto A','DN80','3.979 m/s'],['Trecho de Sucção (RTI à Bomba)','DN100','2.546 m/s']].map(row => <div key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><em>✓ {row[2]}</em></div>)}</div><h5>PERDAS DE CARGA POR TRECHO</h5>{losses.map(([tag,name,dn,total,loss]) => <section className="fl-hydrant-loss" key={tag}><header><span>{tag}</span><b>{name}</b></header><div><strong>{dn}</strong><small>Comprimento total</small><b>{total}</b><small>Perda de carga do trecho</small><em>{loss}</em></div></section>)}</div></div>
  </div>
}

function ConfigurationMock() {
  const measures = [
    ['Acesso de Viatura em Edificações','Obrigatório — NT 42/2019','required'], ['Seg. Estrutural Contra Incêndio','Obrigatório — NT 42/2019','required'], ['Compartimentação Vertical','Opcional — desabilitado','mouse-1'],
    ['Controle de Materiais de Acabamento','Obrigatório — NT 42/2019','required'], ['Saída de Emergência','Obrigatório — NT 42/2019','required'], ['Gerenciamento de Risco de Incêndio','Obrigatório — NT 42/2019','required'],
    ['Brigada de Incêndio','Obrigatório — NT 42/2019','required'], ['Iluminação de Emergência','Obrigatório — NT 42/2019','required'], ['Sinalização de Emergência','Obrigatório — NT 42/2019','required'],
    ['Proteção por Extintores','Obrigatório — NT 42/2019','required'], ['Hidrantes / Mangotinho','Obrigatório — NT 42/2019','required'], ['Alarme de Incêndio','Obrigatório — NT 42/2019','required'],
    ['Detecção de Incêndio','Opcional — desabilitado','optional'], ['Chuveiros Automáticos','Opcional — desabilitado','optional'], ['Controle de Fumaça','Opcional — desabilitado','optional'],
    ['Central de Gás','Opcional — desabilitado','optional'], ['SPDA','Opcional — desabilitado','optional'],
  ]
  const risks = [
    ['Armazenamento de líquidos inflamáveis','optional'], ['Armazenamento ou revenda de fogos de artifício','optional'], ['Uso de Gás Liquefeito de Petróleo','mouse-2'],
    ['Vasos sob pressão (caldeiras)','optional'], ['Armazenamento de produtos perigosos','optional'], ['Outros (especificar)','optional'],
  ]
  const steps = [['1','Identificação','Local, norma, proprietário e empresa'],['✓','Edificação','Tipo, dimensões, estrutura'],['3','Responsável técnico','Projetista e ART'],['✓','Classificação','Ocupação por pavimento'],['✓','Carga de Incêndio','CNAE e carga por divisão'],['6','Medidas de segurança','Sistemas exigidos']]
  const card = ([name,detail,state]) => <button type="button" className={`fl-security-card ${state === 'required' ? 'is-required' : 'is-optional'} ${state.startsWith('mouse') ? `fl-${state}` : ''}`} key={name}><span className="fl-choice-icon">◇</span><b>{name}</b>{detail && <small>{detail}</small>}<i className="fl-security-check"><b>✓</b></i></button>
  return <div className="fl-config-mock">
    <aside className="fl-config-steps"><span className="fl-micro">ETAPAS</span>{steps.map(([number,name,detail],index) => <div className={index === 5 ? 'active' : number === '✓' ? 'done' : ''} key={name}><i>{number}</i><span><b>{name}</b><small>{detail}</small></span></div>)}</aside>
    <div className="fl-safety-viewport"><div className="fl-safety-page"><span className="fl-micro fl-red-label">ETAPA 6 DE 7</span><h4>Medidas de Segurança contra Incêndio</h4><p>Sistemas e riscos especiais identificados por estrutura, com base na área construída, altura e ocupação de cada uma. Obrigatórios não podem ser removidos.</p><div className="fl-config-alert">△ Sistemas obrigatórios são definidos pela NT 42/2019 CBMMA para a ocupação, altura e área de cada estrutura. Sistemas opcionais podem ser habilitados por estrutura conforme necessidade técnica.</div><div className="fl-config-legend"><span className="required">● Obrigatório (NT 42/2019)</span><span className="enabled">● Opcional habilitado</span><span>● Opcional desabilitado</span></div><section className="fl-structure-panel"><header><b>⌄ &nbsp; Estrutura 1</b><span>▧ 5.000 m²</span><span>♨ Risco médio</span><span>▣ C-2</span></header><div className="fl-structure-data"><small>DADOS USADOS NA DOSAGEM</small><div><span>ÁREA CONSTRUÍDA<b>5.000 m²</b></span><span>ALTURA PISO A PISO<b>—</b></span><span>OCUPAÇÃO PRINCIPAL<b>C-2</b></span></div></div><small className="fl-grid-label">MEDIDAS DE SEGURANÇA</small><div className="fl-security-grid">{measures.map(card)}</div><div className="fl-risk-section"><span className="fl-grid-label">RISCOS ESPECIAIS</span><p>Marque os riscos especiais presentes nesta estrutura ou área de risco, conforme Anexo B da NT 01.</p><div className="fl-risk-grid">{risks.map(([name,state]) => card([name,'',state]))}</div></div></section></div></div>
    <svg className="fl-demo-cursor" viewBox="0 0 32 42" aria-hidden="true"><path d="M2 2v31l8-7 6 14 6-3-6-13h11L2 2Z"/></svg>
  </div>
}

function DocumentsMock() {
  const summary = ['OBJETIVO','SOBRE A LEGISLAÇÃO','SOBRE A EDIFICAÇÃO','CARACTERIZAÇÃO DA EDIFICAÇÃO E DO RISCO','MEDIDAS DE SEGURANÇA APLICADAS','SISTEMA DE PROTEÇÃO POR HIDRANTES E MANGOTINHOS','SISTEMA DE PROTEÇÃO POR EXTINTORES DE INCÊNDIO','SINALIZAÇÃO DE EMERGÊNCIA']
  const applied = ['Acesso de viatura às edificações e áreas de risco','Segurança estrutural contra incêndio','Compartimentação horizontal','Compartimentação vertical','Controle de Material de Acabamento e Revestimento','Saídas de emergência','Brigada de incêndio','Iluminação de emergência','Detecção de incêndio','Alarme de incêndio','Sinalização de emergência','Extintores','Hidrantes e mangotinhos','Chuveiros automáticos']
  return <div className="fl-memorial-viewer"><div className="fl-memorial-toolbar"><span>← &nbsp; Voltar</span><b>▱ &nbsp; Imprimir / Salvar PDF</b></div><div className="fl-pdf-viewport"><div className="fl-pdf-stack"><section className="fl-pdf-page fl-pdf-cover"><img className="fl-pdf-company-logo" src={logo} alt="FireUtils"/><div><h4>MEMORIAL DESCRITIVO</h4><p>PROJETO DE PREVENÇÃO E COMBATE A INCÊNDIO</p></div></section><section className="fl-pdf-page fl-pdf-summary"><h4>SUMÁRIO</h4>{summary.map((item,index) => <div key={item}><b>{item}</b><i/><span>{String(index + 3).padStart(2,'0')}</span></div>)}</section><section className="fl-pdf-page fl-pdf-copy"><b>1. Objetivo</b><p>Memorial Técnico Descritivo apresentado ao Corpo de Bombeiros Militar, como requisito para análise e aprovação do Projeto de Segurança Contra Incêndio e Pânico da edificação.</p><b>2. Sobre a Legislação</b><p>O projeto foi desenvolvido atendendo às normas e instruções técnicas aplicáveis à segurança contra incêndio.</p>{['NT 01 — Procedimentos administrativos e medidas de segurança','NT 03 — Terminologia de segurança contra incêndio e emergências','NT 11 — Saída de emergência','NT 18 — Iluminação de emergência','NT 21 — Sistema de proteção por extintores','NT 22 — Sistema de hidrantes e mangotinhos'].map(item => <span key={item}>{item}</span>)}</section><section className="fl-pdf-page fl-pdf-measures"><h4>5. MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E EMERGÊNCIA DO PROJETO</h4><table><thead><tr><th>Medidas de Segurança Aplicadas</th></tr></thead><tbody>{applied.map(item => <tr key={item}><td>{item}</td></tr>)}</tbody></table></section></div></div></div>
}

function Preview({ stage, compact = false, view }) {
  if (stage === 1 && !view) return <RevitPreview/>
  const currentView = view || (stage === 2 ? 'documents' : 'configuration')
  const meta = currentView === 'dashboard' ? ['LOJA COMERCIAL CENTRO / VISÃO GERAL', 'Dashboard'] : currentView === 'documents' ? ['LOJA COMERCIAL CENTRO / DOCUMENTOS', 'Documentos'] : ['LOJA COMERCIAL CENTRO / CONFIGURAÇÃO', 'Configuração do projeto']
  return <div className={`fl-preview ${compact ? 'fl-preview-compact' : ''}`}>
    <div className="fl-workspace">
      <ProductSidebar compact={compact} active={currentView === 'dashboard' ? 'dashboard' : currentView === 'documents' ? 'documentos' : currentView === 'hydrants' ? 'hidrantes' : 'config'}/>
      <div className={`fl-app-frame is-${currentView}`}><div className="fl-app-topbar"><span>PROJETOS <i>/</i> MA <i>/</i> <b>{currentView === 'dashboard' ? 'LOJA COMERCIAL CENTRO' : currentView === 'hydrants' ? 'FRIGOBALSAS' : 'Sem nome'}</b></span><span className="fl-save-state"><i/> {currentView === 'configuration' ? 'Salvando...' : 'Salvo'}</span><span className="fl-profile-dot">♙</span></div><div className={`fl-preview-main ${currentView === 'documents' ? 'is-memorial-view' : ''}`}>{currentView === 'dashboard' && <div className="fl-preview-heading"><div><span className="fl-micro">{meta[0]}</span><h3>{meta[1]}</h3></div></div>}
          {currentView === 'dashboard' ? <DashboardMock/> : currentView === 'documents' ? <DocumentsMock/> : currentView === 'hydrants' ? <HydrantMock/> : <ConfigurationMock/>}
        </div>
      </div>
    </div>
  </div>
}

export default function LandingPage() {
  const landingRef = useRef(null)
  const { user, loading: authLoading } = useAuth()
  const { perfil } = usePerfil()
  const [stage, setStage] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)
  const [loadTimedOut, setLoadTimedOut] = useState(false)
  const heroReady = (videoReady && previewReady) || loadTimedOut
  const handleVideoReady = useCallback(() => setVideoReady(true), [])
  const handlePreviewReady = useCallback(() => setPreviewReady(true), [])
  useLandingMotion(landingRef, stage, setStage, heroReady)
  const [menu, setMenu] = useState(false)
  const profileName = perfil?.nome?.trim()
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Perfil'
  useEffect(() => {
    const fallback = window.setTimeout(() => setLoadTimedOut(true), 3000)
    return () => window.clearTimeout(fallback)
  }, [])
  useEffect(() => {
    const previous = document.title
    document.title = 'FireUtils — Do Revit ao memorial'
    return () => { document.title = previous }
  }, [])
  return <div ref={landingRef} className={`fire-landing ${heroReady ? 'is-ready' : 'is-loading'}`}>
    {!heroReady && <div className="fl-entry-loader" role="status" aria-label="Carregando experiência FireUtils"><Loader size={44}/></div>}
    <a className="fl-skip" href="#conteudo">Ir para o conteúdo</a>
    <header className="fl-header"><a href="#inicio" aria-label="FireUtils início"><img src={logo} alt="FireUtils"/></a><nav aria-label="Navegação principal" className={menu ? 'is-open' : ''}><a href="#demonstracao" onClick={() => setMenu(false)}>Demonstração</a><a href="#recursos" onClick={() => setMenu(false)}>Recursos</a></nav><div className="fl-header-account">{authLoading || (user && !perfil) ? <span className="fl-account-skeleton" aria-hidden="true"/> : user ? <Link className="fl-profile-link" to="/perfil" onClick={() => setMenu(false)} title={profileName}><span>{profileName}</span><span className="fl-profile-icon"><Icon name="user" size={14}/></span></Link> : <Link className="fl-signin-link" to="/login" onClick={() => setMenu(false)}><span>Entrar</span><Icon name="user" size={14}/></Link>}</div><button className="fl-menu" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Abrir menu">{menu ? '✕' : '☰'}</button></header>
    <main id="conteudo">
      <section className="fl-hero" id="inicio"><div className="fl-beams" aria-hidden="true"><i/><i/><i/></div><div className="fl-hero-copy"><h1>A FERRAMENTA DEFINITIVA PARA <span className="fl-title-accent">PPCI</span></h1><p className="fl-hero-subtitle">Integre projeto, dimensionamento e documentação do seu PPCI em um único fluxo.</p><div className="fl-actions"><Link className="fl-primary" to="/pricing">Ver planos e preços <span>↗</span></Link><a className="fl-secondary" href="#demonstracao"><span className="fl-play">▶</span> Conheça o fluxo</a></div></div><div className="fl-hero-product"><ConnectedHero onVideoReady={handleVideoReady} onPreviewReady={handlePreviewReady}/></div><div className="fl-hero-bottom"><span>PROJETE. CONECTE. DOCUMENTE.</span><a href="#demonstracao">CONTINUE EXPLORANDO ↓</a></div></section>
      <section className="fl-section fl-demo" id="demonstracao"><div className="fl-section-head"><h2>Do modelo ao memorial.<br/><span>Veja o projeto avançar.</span></h2></div><div className="fl-demo-sticky"><div id="fl-demo-panel" className="fl-demo-desktop" aria-live="polite"><div className="fl-demo-stage" key={stage}><div className="fl-demo-caption"><div className="fl-demo-title"><span className="fl-demo-step">#0{stage + 1} {stages[stage].name}</span><h3>{stages[stage].title}</h3></div><p>{stages[stage].description}</p></div><div className="fl-demo-window"><Preview stage={stage}/></div></div></div><div className="fl-demo-mobile">{stages.map((item,index) => <article className={`fl-mobile-stage is-stage-${index + 1}`} key={item.name}><div className="fl-demo-caption"><div className="fl-demo-title"><span className="fl-demo-step">#0{index + 1} {item.name}</span><h3>{item.title}</h3></div><p>{item.description}</p></div><div className="fl-demo-window"><Preview stage={index}/></div></article>)}</div></div></section>
      <section className="fl-section fl-modules-section" id="recursos"><div className="fl-section-head fl-head-split"><div><span className="fl-modules-kicker">MÓDULOS FIREUTILS</span><h2>Uma rede de ferramentas.<br/><span>Um único processo.</span></h2></div><p>Explore a rede FireUtils: cada módulo troca dados com o núcleo do projeto e revela sua função quando você se aproxima.</p></div><ModuleNetwork/></section>
      <section className="fl-section fl-audience"><h2>Seu ritmo.<br/><span>Uma nova forma de trabalhar.</span></h2><div className="fl-audience-grid"><article><span className="fl-micro">/ ENGENHEIROS AUTÔNOMOS</span><h3>Mais espaço para a engenharia.</h3><p>Concentre as informações dos seus projetos e simplifique o caminho entre modelar, dimensionar e documentar.</p></article><article><span className="fl-micro">/ ESCRITÓRIOS DE PROJETOS</span><h3>Um processo que faz sentido.</h3><p>Adote uma sequência consistente para organizar dados, revisar medidas e preparar os documentos de cada entrega.</p></article></div></section>
      <section className="fl-section fl-faq"><div><span className="fl-eyebrow">ANTES DE COMEÇAR</span><h2>Vamos aos detalhes.</h2></div><div>{[['Preciso trabalhar com Revit?','O FireUtils foi pensado para engenheiros e escritórios que utilizam Revit. O plugin e a plataforma web participam de etapas complementares do projeto.'],['Quais estados e versões são atendidos?','A cobertura varia conforme a medida de segurança e o estado. A lista comercial de estados, módulos e versões compatíveis do Revit está em definição para o lançamento.'],['O que posso ver nesta demonstração?','Esta é uma prévia interativa com dados ilustrativos. As abas mostram a proposta de conexão entre modelo, medidas de segurança e documentação.']].map(([question,answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className="fl-cta"><div className="fl-cta-glow"/><Mark/><span className="fl-eyebrow">FIREUTILS / ENGENHARIA CONECTADA</span><h2>Seu próximo projeto.<br/>Um novo fluxo.</h2><p>Conheça uma forma mais integrada de projetar no Revit.</p><a className="fl-primary" href="#demonstracao">Explorar demonstração <span>↗</span></a></section>
    </main><footer className="fl-footer"><img src={logo} alt="FireUtils"/><span>ENGENHARIA DE INCÊNDIO. CONECTADA.</span><span>© {new Date().getFullYear()} FireUtils</span></footer>
  </div>
}
