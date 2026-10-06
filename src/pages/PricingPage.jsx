import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/fireutils-landing.svg'
import Icon from '../components/ui/Icon'
import './PricingPage.css'

const PERIODS = [
  { id: 'thirty', label: '30 dias', note: 'Sem permanência' },
  { id: 'semester', label: 'Semestral', note: '6 meses' },
  { id: 'annual', label: 'Anual', note: 'Melhor custo' },
]

const PLANS = [
  {
    id: 'memorial',
    name: 'Memorial',
    description: 'Organize os dados técnicos e gere o memorial descritivo no ambiente Web.',
    prices: { thirty: 297, semester: 229, annual: 2290 },
    features: ['Cadastro e classificação da edificação', 'Carga de incêndio e medidas de segurança', 'Memorial descritivo', 'Uso independente do Revit'],
  },
  {
    id: 'bim',
    name: 'BIM',
    description: 'Leve produtividade, famílias e integração FireUtils para dentro do Revit.',
    prices: { thirty: 297, semester: 229, annual: 2290 },
    features: ['Dockpane integrada ao Revit', 'Biblioteca ampliada de famílias', 'Ferramentas de produtividade', 'Integração entre Revit e Web'],
  },
  {
    id: 'saidas',
    name: 'Saídas',
    description: 'Dimensione saídas de emergência com dados conectados ao modelo.',
    prices: { thirty: 347, semester: 269, annual: 2690 },
    features: ['População por pavimento e ambiente', 'Larguras necessárias', 'Distâncias máximas de percurso', 'Documentação de cálculo'],
  },
  {
    id: 'hidrantes',
    name: 'Hidrantes',
    description: 'Modele e dimensione a rede hidráulica diretamente no Revit.',
    prices: { thirty: 447, semester: 329, annual: 3290 },
    features: ['Percurso da rede por conectores MEP', 'Perdas de carga e ponto de operação', 'Pressão e vazão do hidrante crítico', 'Memorial de cálculo hidráulico'],
  },
]

const PRO = {
  prices: { thirty: 797, semester: 597, annual: 5970 },
  features: ['Memorial', 'BIM', 'Hidrantes', 'Saídas', 'Biblioteca ampliada de famílias', 'Atualizações durante a licença'],
}

const formatPrice = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
}).format(value)

function Price({ prices, period }) {
  const value = prices[period]
  if (period === 'semester') {
    return <div className="pp-price"><span>6x de</span><strong>{formatPrice(value)}</strong><small>por mês</small></div>
  }
  if (period === 'annual') {
    return <div className="pp-price"><span>12 meses de acesso</span><strong>{formatPrice(value)}</strong><small>pagamento à vista</small></div>
  }
  return <div className="pp-price"><span>Acesso flexível</span><strong>{formatPrice(value)}</strong><small>por 30 dias</small></div>
}

function FeatureList({ items }) {
  return <ul>{items.map(item => <li key={item}><Icon name="check" size={15}/><span>{item}</span></li>)}</ul>
}

export default function PricingPage() {
  const [period, setPeriod] = useState('annual')

  const handlePeriodKey = (event, currentIndex) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    let nextIndex = currentIndex
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + PERIODS.length) % PERIODS.length
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % PERIODS.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = PERIODS.length - 1
    setPeriod(PERIODS[nextIndex].id)
    event.currentTarget.parentElement?.children[nextIndex]?.focus()
  }

  useEffect(() => {
    const previous = document.title
    document.title = 'Planos FireUtils — Escolha seu acesso'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="pricing-page">
      <a className="pp-skip" href="#planos">Ir para os planos</a>
      <header className="pp-header">
        <Link to="/landing" aria-label="Voltar para a página inicial"><img src={logo} alt="FireUtils"/></Link>
        <nav aria-label="Navegação principal">
          <Link to="/landing#recursos">Recursos</Link>
          <a href="#planos" aria-current="page">Planos</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <Link className="pp-login" to="/login">Acessar plataforma <Icon name="right" size={14}/></Link>
      </header>

      <main>
        <section className="pp-hero">
          <div className="pp-beams" aria-hidden="true"><i/><i/><i/></div>
          <div className="pp-hero-copy">
            <span className="pp-kicker"><i/> PLANOS FIREUTILS</span>
            <h1>Escolha o que precisa.<br/><span>Projete sem limite.</span></h1>
          </div>
          <div className="pp-hero-aside">
            <p>Ative um módulo específico ou use o fluxo completo. Todos os planos permitem trabalhar em projetos ilimitados durante o período contratado.</p>
            <div className="pp-unlimited"><Icon name="checkCircle" size={18}/><span><strong>Projetos ilimitados</strong><small>Sem cobrança por projeto ou por cálculo</small></span></div>
          </div>
        </section>

        <section className="pp-pricing" id="planos">
          <div className="pp-period-heading">
            <div><h2>Defina o período de acesso</h2><p>Compare todos os módulos com a mesma modalidade.</p></div>
            <div className="pp-periods" role="radiogroup" aria-label="Período da licença">
              {PERIODS.map((item, index) => (
                <button type="button" role="radio" aria-checked={period === item.id} tabIndex={period === item.id ? 0 : -1} className={period === item.id ? 'is-active' : ''} onClick={() => setPeriod(item.id)} onKeyDown={event => handlePeriodKey(event, index)} key={item.id}>
                  <strong>{item.label}</strong><small>{item.note}</small>
                </button>
              ))}
            </div>
          </div>

          <article className="pp-pro-card">
            <div className="pp-pro-intro">
              <span className="pp-recommended">RECOMENDADO</span>
              <h2>FireUtils PRO</h2>
              <p>O fluxo completo, do modelo BIM ao memorial técnico.</p>
              <Price prices={PRO.prices} period={period}/>
              <Link className="pp-primary" to="/login">Começar com o PRO <Icon name="right" size={16}/></Link>
            </div>
            <div className="pp-pro-includes"><span>Tudo em uma licença</span><FeatureList items={PRO.features}/></div>
            <div className="pp-pro-mark" aria-hidden="true">PRO</div>
          </article>

          <div className="pp-modules-heading"><h2>Ou contrate por módulo</h2><p>Comece pela necessidade atual e adicione novos módulos quando quiser.</p></div>
          <div className="pp-plan-grid">
            {PLANS.map(plan => (
              <article className="pp-plan-card" key={plan.id}>
                <div className="pp-plan-top"><span>FIREUTILS</span><h3>{plan.name}</h3><p>{plan.description}</p></div>
                <Price prices={plan.prices} period={period}/>
                <FeatureList items={plan.features}/>
                <Link to="/login">Escolher {plan.name} <Icon name="right" size={14}/></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="pp-bonus">
          <div className="pp-bonus-heading"><span>BÔNUS POR COMBINAÇÃO</span><h2>Combine dois módulos.<br/>O BIM entra junto.</h2><p>Enquanto os dois módulos estiverem ativos simultaneamente, o FireUtils BIM fica incluído sem custo adicional.</p></div>
          <div className="pp-bonus-list">
            {['Memorial + Hidrantes', 'Memorial + Saídas', 'Hidrantes + Saídas'].map(combo => <div key={combo}><strong>{combo}</strong><span><Icon name="checkCircle" size={16}/> BIM incluído</span></div>)}
            <p><strong>Exemplo:</strong> no acesso de 30 dias, Memorial + Hidrantes custam R$ 744. Por mais R$ 53, o PRO também libera o módulo Saídas.</p>
          </div>
        </section>

        <section className="pp-faq" id="duvidas">
          <div><span className="pp-kicker"><i/> CONTRATAÇÃO SEM SURPRESAS</span><h2>O essencial,<br/>antes de escolher.</h2></div>
          <div>
            <details><summary>Existe limite de projetos?<span>+</span></summary><p>Não. Durante a vigência da licença, você pode trabalhar em quantos projetos precisar, sem cobrança individual por projeto ou por cálculo.</p></details>
            <details><summary>Como funciona o acesso por 30 dias?<span>+</span></summary><p>É uma contratação pontual, sem compromisso de permanência. O módulo escolhido permanece disponível por 30 dias.</p></details>
            <details><summary>Qual é o compromisso do plano semestral?<span>+</span></summary><p>O plano semestral possui compromisso de seis meses, com seis pagamentos mensais no valor mostrado acima.</p></details>
            <details><summary>O plano anual é parcelado?<span>+</span></summary><p>O valor anual corresponde a 12 meses de acesso e é pago antecipadamente, à vista.</p></details>
            <details><summary>Preciso do Revit para usar o Memorial?<span>+</span></summary><p>Não. O FireUtils Memorial pode ser usado no ambiente Web com preenchimento manual. Os módulos BIM, Hidrantes e Saídas participam do fluxo conectado ao Revit.</p></details>
            <details><summary>Como funciona o BIM incluído nas combinações?<span>+</span></summary><p>O benefício permanece ativo enquanto os dois módulos elegíveis estiverem simultaneamente ativos. O FireUtils PRO já inclui BIM e todos os demais módulos.</p></details>
          </div>
        </section>

        <section className="pp-final">
          <span>FIREUTILS / DO MODELO AO MEMORIAL</span>
          <h2>Um plano para o projeto de agora.<br/>Uma plataforma para os próximos.</h2>
          <p>Escolha o período, crie sua conta e leve o FireUtils para o seu fluxo de PPCI.</p>
          <Link className="pp-primary" to="/login">Criar minha conta <Icon name="right" size={16}/></Link>
          <small>Licença individual. Valores e condições válidos para novas contratações e sujeitos a atualização.</small>
        </section>
      </main>

      <footer className="pp-footer"><img src={logo} alt="FireUtils"/><span>ENGENHARIA DE INCÊNDIO. CONECTADA.</span><span>© {new Date().getFullYear()} FireUtils</span></footer>
    </div>
  )
}
