import { MODULOS, formatarData, situacaoLicenca, temAcesso, useLicencas } from '../../hooks/useLicencas'
import Icon from '../ui/Icon'
import Loader from '../ui/Loader'

const TOM = {
  green:  'border-green-border bg-green-dim text-green',
  blue:   'border-blue-border bg-blue-dim text-ink',
  amber:  'border-amber-border bg-amber-dim text-amber',
  red:    'border-red-border bg-red-dim text-red',
  neutro: 'border-border bg-transparent text-ink-faint',
}

function Selo({ tom, children }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 rounded-full border border-solid text-[11px] font-semibold whitespace-nowrap ${TOM[tom]}`}>
      {children}
    </span>
  )
}

function Campo({ rotulo, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[.06em] text-ink-faint mb-1">{rotulo}</div>
      <div className="text-[13px] text-ink">{children}</div>
    </div>
  )
}

function CartaoModulo({ modulo, licencas }) {
  const licenca = licencas[modulo.key]
  const s = situacaoLicenca(licenca)
  const acesso = temAcesso(licencas, modulo.key)
  // Sem licença própria válida, mas liberado pelo PRO.
  const peloPro = acesso && !s.valida

  return (
    <article className={`profile-tool-card ${modulo.key === 'pro' ? 'is-pro' : ''}`}>
      <div className="profile-tool-main">
        <div className="profile-tool-icon">
          <Icon name={modulo.icon} size={18}/>
        </div>
        <div className="profile-tool-copy">
          <div className="profile-tool-title-row">
            <h3 className="text-[15px] font-semibold text-ink">{modulo.nome}</h3>
          </div>
          <p className="text-[12px] text-ink-faint leading-[1.5] mt-1 mb-0">{modulo.descricao}</p>
        </div>
      </div>

      <div className="profile-tool-meta">
        <div className="profile-tool-badges">
          <Selo tom={peloPro ? 'green' : s.tom}>
            {!acesso && <Icon name="lock" size={11} className="mr-1.5"/>}
            {peloPro ? 'Incluído no PRO' : s.rotulo}
          </Selo>
        </div>
        {licenca && (
          <div className="profile-tool-meta-grid">
            <Campo rotulo="Plano">{licenca.plano || '—'}</Campo>
            <Campo rotulo="Situação">{s.rotulo}</Campo>
            <Campo rotulo="Início">{formatarData(licenca.inicio_em) || '—'}</Campo>
            <Campo rotulo="Validade">{licenca.expira_em ? formatarData(licenca.expira_em) : 'Sem data de término'}</Campo>
          </div>
        )}
        <p className="text-[12px] leading-[1.5] m-0 text-ink-muted">
          {peloPro ? 'Liberado pela licença do FireUtils PRO desta conta.' : s.detalhe}
        </p>
      </div>
    </article>
  )
}

// Aba "Ferramentas" do perfil: o que a conta tem licenciado e em que situação.
export default function FerramentasDisponiveis() {
  const { licencas, erro } = useLicencas()

  if (!licencas) {
    return <div className="flex items-center justify-center py-16"><Loader size={32}/></div>
  }

  return (
    <div className="profile-tools-content">
      {erro && (
        <div className="ibox red mb-5" role="alert">
          <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
          <span className="text-xs">{erro}</span>
        </div>
      )}
      {!erro && <div className="profile-tools-grid">{MODULOS.map(m => (
        <CartaoModulo key={m.key} modulo={m} licencas={licencas}/>
      ))}</div>}
    </div>
  )
}
