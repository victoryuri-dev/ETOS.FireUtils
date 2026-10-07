import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/fireutils-landing.svg'
import Icon from '../components/ui/Icon'
import './PricingPage.css'

const PERIODS = [
  { id: 'thirty', label: '30 dias', note: 'Sem permanência' },
  { id: 'semester', label: 'Semestral', note: 'Compromisso de 6 meses' },
  { id: 'annual', label: 'Anual', note: '12 meses, pagamento à vista' },
]

const PLANS = [
  {
    id: 'saidas',
    icon: 'saidaEmergenciaMedida',
    name: 'Saídas',
    description: 'Dimensione as saídas de emergência com os recursos necessários ao módulo.',
    prices: { thirty: 160, semester: 129, annual: 1290 },
    features: ['População por pavimento e ambiente', 'Larguras e distâncias de percurso', 'Documentação de cálculo', 'Famílias necessárias ao módulo'],
  },
  {
    id: 'memorial',
    icon: 'documentosMedida',
    name: 'Memorial',
    description: 'Elabore, organize e revise o memorial descritivo diretamente na plataforma Web.',
    prices: { thirty: 297, semester: 229, annual: 2290 },
    features: ['Cadastro e classificação da edificação', 'Carga de incêndio e medidas de segurança', 'Memorial descritivo', 'Uso independente do Revit'],
  },
  {
    id: 'hidrantes',
    icon: 'hidranteMedida',
    name: 'Hidrantes',
    description: 'Dimensione hidraulicamente a rede com os recursos necessários ao módulo.',
    prices: { thirty: 347, semester: 269, annual: 2690 },
    features: ['Percurso da rede por conectores MEP', 'Perdas de carga e ponto de operação', 'Pressão e vazão do hidrante crítico', 'Famílias necessárias ao módulo'],
  },
]

const PRO = {
  prices: { thirty: 597, semester: 449, annual: 4490 },
  features: ['Memorial', 'Hidrantes', 'Saídas', 'FireUtils BIM exclusivo'],
}

const formatPrice = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
}).format(value)

const periodPayment = (prices, period) => ({
  value: period === 'semester' ? `6x ${formatPrice(prices[period])}` : formatPrice(prices[period]),
  detail: period === 'semester' ? `Total de ${formatPrice(prices[period] * 6)}` : period === 'annual' ? 'Pagamento único à vista' : 'Pagamento único',
})

function PriceOptions({ prices }) {
  return <div className="pp-price-options" aria-label="Valores por período">{PERIODS.map(item => {
    const payment = periodPayment(prices, item.id)
    return <div className={`pp-price-option ${item.id === 'annual' ? 'is-best' : ''}`} key={item.id}>
      <span><strong>{item.label}</strong><small>{item.note}</small></span>
      <span><b>{payment.value}</b><small>{payment.detail}</small></span>
    </div>
  })}</div>
}

function FeatureList({ items }) {
  return <ul>{items.map(item => <li key={item}><Icon name="check" size={15}/><span>{item}</span></li>)}</ul>
}

export default function PricingPage() {
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
            <h1>Planos simples.<br/><span>Escolha pelo seu fluxo.</span></h1>
            <p className="pp-hero-subtitle">Uma oferta completa ou três módulos específicos. Sem cobrança por projeto ou por cálculo.</p>
            <div className="pp-hero-facts"><span><Icon name="check" size={13}/> Projetos ilimitados</span><span><Icon name="check" size={13}/> Licença individual</span><span><Icon name="check" size={13}/> Valores em reais</span></div>
          </div>
        </section>

        <section className="pp-pricing" id="planos">
          <div className="pp-offers-heading">
            <div><span className="pp-section-label">01 / PLANO COMPLETO</span><h2>FireUtils PRO</h2><p>Memorial, Hidrantes, Saídas e FireUtils BIM em uma única licença.</p></div>
            <div className="pp-heading-includes"><span>TUDO INCLUÍDO</span><FeatureList items={PRO.features}/></div>
          </div>

          <section className="pp-pro-showcase" aria-labelledby="pro-title">
            <h2 id="pro-title" className="pp-visually-hidden">Modalidades do FireUtils PRO</h2>
            <div className="pp-pro-period-grid">
              {PERIODS.map(item => {
                const payment = periodPayment(PRO.prices, item.id)
                return <article className={`pp-pro-period-card ${item.id === 'annual' ? 'is-best' : ''}`} key={item.id}>
                  <span>{item.id === 'annual' ? 'MELHOR CUSTO' : 'FIREUTILS PRO'}</span>
                  <h3>{item.label}</h3>
                  <p>{item.note}</p>
                  <strong>{payment.value}</strong>
                  <small>{payment.detail}</small>
                  <Link to="/login">Escolher {item.label} <Icon name="right" size={14}/></Link>
                </article>
              })}
            </div>
            <div className="pp-bim-exclusive">
              <div className="pp-bim-icon"><Icon name="settings" size={25}/></div>
              <div><span>EXCLUSIVO FIREUTILS PRO</span><h3>FireUtils BIM</h3><p>Desbloqueie a experiência completa de integração com o Autodesk Revit: biblioteca de famílias, ferramentas de produtividade, automações, quantitativos e integração avançada com o FireUtils Web.</p></div>
              <div className="pp-bim-tags"><span>FAMÍLIAS</span><span>AUTOMAÇÕES</span><span>QUANTITATIVOS</span><span>REVIT + WEB</span></div>
            </div>
          </section>

          <div className="pp-module-heading">
            <div><span className="pp-section-label">02 / MÓDULOS AVULSOS</span><h2>Assinaturas por módulo</h2><p>Para uma necessidade específica, contrate somente a solução necessária.</p></div>
            <span>OS MÓDULOS NÃO INCLUEM FIREUTILS BIM</span>
          </div>
          <div className="pp-module-offer-grid">
            {PLANS.map(plan => (
              <article className="pp-offer-card" key={plan.id}>
                <div className="pp-offer-icon"><Icon name={plan.icon} size={23}/></div>
                <span className="pp-offer-label">FIREUTILS / MÓDULO</span>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <PriceOptions prices={plan.prices}/>
                <div className="pp-offer-features"><span>Incluído no módulo</span><FeatureList items={plan.features}/></div>
                <Link to="/login">Escolher {plan.name} <Icon name="right" size={14}/></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="pp-faq" id="duvidas">
          <div><h2>O essencial,<br/>antes de escolher.</h2></div>
          <div>
            <details><summary>Existe limite de projetos?<span>+</span></summary><p>Não. Durante a vigência da licença, você pode trabalhar em quantos projetos precisar, sem cobrança individual por projeto ou por cálculo.</p></details>
            <details><summary>Como funciona o acesso por 30 dias?<span>+</span></summary><p>É uma contratação pontual, sem compromisso de permanência. O módulo escolhido permanece disponível por 30 dias.</p></details>
            <details><summary>Qual é o compromisso do plano semestral?<span>+</span></summary><p>O plano semestral possui compromisso de seis meses, com seis pagamentos mensais no valor mostrado acima.</p></details>
            <details><summary>O plano anual é parcelado?<span>+</span></summary><p>O valor anual corresponde a 12 meses de acesso e é pago antecipadamente, à vista.</p></details>
            <details><summary>Preciso do Revit para usar o Memorial?<span>+</span></summary><p>Não. O FireUtils Memorial pode ser usado no ambiente Web com preenchimento manual. Os módulos BIM, Hidrantes e Saídas participam do fluxo conectado ao Revit.</p></details>
            <details><summary>O FireUtils BIM pode ser contratado separadamente?<span>+</span></summary><p>Não. O FireUtils BIM é uma vantagem exclusiva do PRO e reúne famílias, ferramentas de produtividade, automações, quantitativos e a integração avançada entre Revit e FireUtils Web.</p></details>
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
