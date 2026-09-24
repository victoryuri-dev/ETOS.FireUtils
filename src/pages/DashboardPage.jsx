import { useMemo } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { useNorma } from '../hooks/useNorma'
import { useMedidasObrigatorias } from '../hooks/useMedidasObrigatorias'
import Icon from '../components/ui/Icon'
import './DashboardPage.css'

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

const COMPLETE_CONFIG_STEPS = [
  { label: 'Identificação', test: s => [s.nome, s.endereco, s.cidade, s.propNome, s.propDocumento, s.respRazaoSocial, s.respCNPJ].every(Boolean) },
  { label: 'Edificação', test: s => (s.estruturas || []).length > 0 && s.estruturas.every(e => e.areaTotal && e.altura) },
  { label: 'Responsável técnico', test: s => Boolean(s.rtNome && s.artNumero) },
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

function getFireLoad(state) {
  return Object.values(state.cargaState || {})
    .flatMap(item => Object.values(item || {}))
    .reduce((highest, item) => {
      const value = item?.metodo === 'levantamento' ? Number(item?.valorManual) || 0 : item?.cargaIncendio || 0
      return Math.max(highest, value)
    }, 0)
}

function getSystemProgress(key, state) {
  if (key === 'hidrantes') {
    if (state.hidrantes?.dimensionamento) return { tone: 'done', label: 'Sincronizado com o Revit', detail: 'Cálculo hidráulico disponível' }
    if (state.hidrantes?.tipo) return { tone: 'progress', label: 'Em dimensionamento', detail: 'Classificação definida' }
  }
  if (key === 'extintores' && state.extintores?.length) return { tone: 'progress', label: `${state.extintores.length} lançamento${state.extintores.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'iluminacao' && state.iluminacao?.length) return { tone: 'progress', label: `${state.iluminacao.length} lançamento${state.iluminacao.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'sinalizacao' && state.sinalizacao?.length) return { tone: 'progress', label: `${state.sinalizacao.length} lançamento${state.sinalizacao.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'acesso_viatura' && (state.acessoViatura?.larguraAdotada || state.acessoViatura?.distanciaAdotada)) {
    return { tone: 'progress', label: 'Em preenchimento', detail: 'Parâmetros informados' }
  }
  return { tone: 'todo', label: 'A desenvolver', detail: 'Abra para dimensionar' }
}

function Metric({ label, value, unit, detail }) {
  return <div className="dashboard-metric"><span>{label}</span><strong>{value}<small>{unit}</small></strong><p>{detail}</p></div>
}

function ActionItem({ index, title, description, button, onClick, tone = 'default' }) {
  return (
    <li className={`dashboard-action dashboard-action--${tone}`}>
      <span className="dashboard-action__index">{String(index).padStart(2, '0')}</span>
      <div><strong>{title}</strong><p>{description}</p></div>
      <button type="button" onClick={onClick} aria-label={`${button}: ${title}`}>{button}<Icon name="right" size={14}/></button>
    </li>
  )
}

export default function DashboardPage({ onGoConfig, onNavigate }) {
  const { state } = useProjeto()
  const { info } = useNorma()
  const { sistemas } = useMedidasObrigatorias()

  const data = useMemo(() => {
    const structures = state.estruturas || []
    const activeSystems = SYSTEMS
      .filter(system => sistemas[system.key]?.ativo || sistemas[system.key]?.obrigatorio)
      .map(system => ({ ...system, required: Boolean(sistemas[system.key]?.obrigatorio), progress: getSystemProgress(system.key, state) }))
      .sort((a, b) => Number(b.required) - Number(a.required))
    const configSteps = state.tipoProjeto === 'dimensionamento' ? DIMENSIONING_CONFIG_STEPS : COMPLETE_CONFIG_STEPS
    const configuredSteps = configSteps.filter(step => step.test(state, activeSystems))
    const nextConfigStep = configSteps.find(step => !step.test(state, activeSystems))
    const groups = [...new Set((state.pavimentos || []).map(p => p.grupo).filter(Boolean))].sort()
    const divisions = [...new Set((state.pavimentos || []).map(p => p.divisao).filter(Boolean))].sort()
    const floorCount = structures.reduce((sum, item) => sum + (Number(item.nPavimentos) || 0), 0)
    const basementCount = structures.reduce((sum, item) => sum + (Number(item.nSubsolos) || 0), 0)
    const area = Number(state.areaConstruidaTotal) || structures.reduce((sum, item) => sum + (Number(item.areaTotal) || 0), 0)
    const height = structures.reduce((highest, item) => Math.max(highest, Number(item.altura) || 0), 0)
    const fireLoad = getFireLoad(state)
    const resolvedSystems = activeSystems.filter(system => system.progress.tone === 'done')
    const systemsWithData = activeSystems.filter(system => system.progress.tone !== 'todo')
    const configPercent = Math.round((configuredSteps.length / configSteps.length) * 100)
    const hasTechnicalData = Boolean(state.nome || area || height || fireLoad || groups.length || state.rtNome)
    const actions = []

    if (nextConfigStep) actions.push({ title: `Concluir ${nextConfigStep.label.toLowerCase()}`, description: 'Há informações essenciais que ainda precisam ser confirmadas na configuração.', button: 'Configurar', onClick: onGoConfig, tone: 'urgent' })
    if (hasTechnicalData) {
      const hydrants = activeSystems.find(system => system.key === 'hidrantes')
      if (hydrants && hydrants.progress.tone !== 'done') actions.push({ title: 'Dimensionar hidrantes', description: state.hidrantes?.tipo ? 'A classificação está pronta. Importe o cálculo hidráulico produzido no Revit.' : 'Defina a classificação do sistema e prepare o cálculo hidráulico.', button: 'Abrir sistema', onClick: () => onNavigate?.('hidrantes') })
      const nextSystem = activeSystems.find(system => system.key !== 'hidrantes' && system.progress.tone !== 'done')
      if (nextSystem) actions.push({ title: `Revisar ${nextSystem.label.toLowerCase()}`, description: nextSystem.required ? 'Sistema exigido pela classificação do projeto.' : 'Sistema opcional habilitado para este projeto.', button: 'Continuar', onClick: () => onNavigate?.(nextSystem.key) })
      actions.push({ title: 'Revisar a documentação', description: 'Confira os documentos montados com os dados atuais do projeto.', button: 'Ver documentos', onClick: () => onNavigate?.('documentos') })
    }

    return { activeSystems, configuredSteps, configStepCount: configSteps.length, groups, divisions, floorCount, basementCount, area, height, fireLoad, resolvedSystems, systemsWithData, configPercent, hasTechnicalData, actions: actions.slice(0, 3) }
  }, [state, sistemas, onGoConfig, onNavigate])

  const projectReady = data.configPercent === 100
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

        <section className="dashboard-main-grid">
          <div className="dashboard-panel dashboard-priorities">
            <div className="dashboard-section-heading"><div><h2>Próximas ações</h2><p>O que merece sua atenção agora</p></div><span>{data.actions.length}</span></div>
            <ol>{data.actions.map((action, index) => <ActionItem key={action.title} index={index + 1} {...action}/>)}</ol>
          </div>
          <aside className="dashboard-panel dashboard-context">
            <div className="dashboard-section-heading"><div><h2>Contexto técnico</h2><p>Referências para decisão</p></div></div>
            <dl>
              <div><dt>Classificação</dt><dd>{data.divisions.join(', ') || 'Não definida'}</dd></div>
              <div><dt>Situação</dt><dd>{state.situacao === 'existente' ? 'Edificação existente' : state.situacao === 'nova' ? 'Edificação nova' : 'Não definida'}</dd></div>
              {state.tipoProjeto === 'dimensionamento' ? <div><dt>Modalidade</dt><dd>Apenas dimensionamento</dd></div> : <>
                <div><dt>Responsável técnico</dt><dd>{state.rtNome || 'Não informado'}</dd></div>
                <div><dt>CREA / CAU</dt><dd>{state.rtConselho || 'Não informado'}</dd></div>
              </>}
              <div><dt>Estruturas</dt><dd>{(state.estruturas || []).length}</dd></div>
            </dl>
            <button type="button" className="dashboard-text-button" onClick={onGoConfig}>Ver configuração completa <Icon name="right" size={13}/></button>
          </aside>
        </section>

        <section className="dashboard-technical" aria-label="Resumo técnico">
          <div className="dashboard-section-heading"><div><h2>Resumo técnico</h2><p>Dados consolidados da edificação</p></div></div>
          <div className="dashboard-metrics">
            <Metric label="Área construída" value={fmtNumber(data.area)} unit={data.area ? 'm²' : ''} detail={`${(state.estruturas || []).length} estrutura${(state.estruturas || []).length === 1 ? '' : 's'}`}/>
            <Metric label="Altura máxima" value={fmtNumber(data.height)} unit={data.height ? 'm' : ''} detail={`${data.floorCount} pavimento${data.floorCount === 1 ? '' : 's'}${data.basementCount ? ` · ${data.basementCount} subsolo${data.basementCount === 1 ? '' : 's'}` : ''}`}/>
            <Metric label="Carga de incêndio" value={fmtNumber(data.fireLoad)} unit={data.fireLoad ? 'MJ/m²' : ''} detail={data.fireLoad ? (data.fireLoad <= 300 ? 'Risco baixo' : data.fireLoad <= 1200 ? 'Risco médio' : 'Risco alto') : 'Aguardando classificação'}/>
            <Metric label="Sistemas aplicáveis" value={data.activeSystems.length || '—'} unit="" detail={`${data.activeSystems.filter(item => item.required).length} obrigatórios`}/>
          </div>
        </section>

        <section className="dashboard-systems">
          <div className="dashboard-section-heading dashboard-section-heading--systems"><div><h2>Sistemas do projeto</h2><p>Status baseado nos dados cadastrados em cada medida</p></div><span>{data.activeSystems.length} aplicáveis</span></div>
          {data.activeSystems.length ? <div className="dashboard-system-list">{data.activeSystems.map(system => (
            <button type="button" className="dashboard-system" key={system.key} onClick={() => onNavigate?.(system.key)}>
              <span className={`dashboard-system__icon dashboard-system__icon--${system.progress.tone}`}><Icon name={system.icon} size={17}/></span>
              <span className="dashboard-system__name"><strong>{system.label}</strong><small>{system.required ? 'Obrigatório' : 'Opcional habilitado'}</small></span>
              <span className={`dashboard-system__status dashboard-system__status--${system.progress.tone}`}><strong>{system.progress.label}</strong><small>{system.progress.detail}</small></span>
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
