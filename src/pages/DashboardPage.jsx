import { useMemo, useState } from 'react'
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

function getSystemProgress(key, state) {
  if (key === 'hidrantes') {
    if (state.hidrantes?.dimensionamento) return { tone: 'done', label: 'Sincronizado com o Revit', detail: 'Cálculo hidráulico disponível' }
    if (state.hidrantes?.tipo) return { tone: 'progress', label: 'Em dimensionamento', detail: 'Classificação definida' }
  }
  if (key === 'extintores' && state.extintores?.length) return { tone: 'progress', label: `${state.extintores.length} lançamento${state.extintores.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'iluminacao' && state.iluminacao?.length) return { tone: 'progress', label: `${state.iluminacao.length} lançamento${state.iluminacao.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'sinalizacao' && state.sinalizacao?.length) return { tone: 'progress', label: `${state.sinalizacao.length} lançamento${state.sinalizacao.length === 1 ? '' : 's'}`, detail: 'Dados iniciados' }
  if (key === 'acesso_viatura' && state.acessoViatura?.larguraAdotada) {
    return { tone: 'progress', label: 'Em preenchimento', detail: 'Parâmetros informados' }
  }
  return { tone: 'todo', label: 'A desenvolver', detail: 'Abra para dimensionar' }
}

function Metric({ label, value, unit, detail }) {
  return <div className="dashboard-metric"><span>{label}</span><strong>{value}<small>{unit}</small></strong><p>{detail}</p></div>
}

export default function DashboardPage({ onGoConfig, onNavigate }) {
  const { state } = useProjeto()
  const { info } = useNorma()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const [selectedStructureId, setSelectedStructureId] = useState('all')

  const data = useMemo(() => {
    const structures = state.estruturas || []
    const activeSystems = SYSTEMS
      .filter(system => sistemas[system.key]?.ativo || sistemas[system.key]?.obrigatorio)
      .map(system => ({ ...system, required: Boolean(sistemas[system.key]?.obrigatorio), progress: getSystemProgress(system.key, state) }))
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
    const summaryGroups = [...new Set(selectedPavements.map(item => item.grupo).filter(Boolean))].sort()
    const summaryDivisions = [...new Set(selectedPavements.map(item => item.divisao).filter(Boolean))].sort()
    const summary = selectedStructure ? {
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
      label: 'Visão geral', area, height, floorCount, basementCount, fireLoad,
      groups: summaryGroups, divisions: summaryDivisions,
      systemCount: activeSystems.length,
      requiredCount: activeSystems.filter(system => system.required).length,
    }

    return { activeSystems, configuredSteps, configStepCount: configSteps.length, groups, divisions, systemsWithData, configPercent, hasTechnicalData, summary }
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

          <article className="dashboard-panel dashboard-technical" aria-label="Resumo técnico">
            <div className="dashboard-section-heading dashboard-technical__heading">
              <div><h2>Resumo técnico</h2><p>Dados da visão selecionada</p></div>
              <label className="dashboard-building-filter">
                <span>Edificação</span>
                <select value={selectedStructureId} onChange={event => setSelectedStructureId(event.target.value)}>
                  <option value="all">Visão geral</option>
                  {(state.estruturas || []).map(structure => <option key={structure.id} value={structure.id}>{structure.nome}</option>)}
                </select>
              </label>
            </div>
            <div className="dashboard-metrics">
              <Metric label="Área construída" value={fmtNumber(data.summary.area)} unit={data.summary.area ? 'm²' : ''} detail={selectedStructureId === 'all' ? `${(state.estruturas || []).length} edificações` : data.summary.label}/>
              <Metric label="Altura" value={fmtNumber(data.summary.height)} unit={data.summary.height ? 'm' : ''} detail={`${data.summary.floorCount} pavimento${data.summary.floorCount === 1 ? '' : 's'}${data.summary.basementCount ? ` · ${data.summary.basementCount} subsolo${data.summary.basementCount === 1 ? '' : 's'}` : ''}`}/>
              <Metric label="Carga de incêndio" value={fmtNumber(data.summary.fireLoad)} unit={data.summary.fireLoad ? 'MJ/m²' : ''} detail={data.summary.fireLoad ? (data.summary.fireLoad <= 300 ? 'Risco baixo' : data.summary.fireLoad <= 1200 ? 'Risco médio' : 'Risco alto') : 'Aguardando classificação'}/>
              <Metric label="Classificação" value={data.summary.groups.join(', ') || '—'} unit="" detail={data.summary.divisions.join(', ') || 'Divisões não definidas'}/>
              <Metric label="Sistemas aplicáveis" value={data.summary.systemCount || '—'} unit="" detail={`${data.summary.requiredCount} obrigatórios`}/>
              <Metric label="Situação" value={state.situacao === 'existente' ? 'Existente' : state.situacao === 'nova' ? 'Nova' : '—'} unit="" detail={info?.nome || 'Norma não definida'}/>
            </div>
          </article>
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
