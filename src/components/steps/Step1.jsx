import { useProjeto } from '../../context/ProjetoContext'
import { ESTADOS_DISPONIVEIS, getNormaInfo } from '../../data/normas/index'
import Icon from '../ui/Icon'

const S = {
  section: 'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',
  header: 'mb-[26px]',
  stepLbl: 'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',
  title: 'text-[22px] font-semibold text-ink mb-[5px]',
  desc: 'text-[13px] text-ink-faint leading-[1.6]',
  block: 'mb-[26px]',
  blockTitle: 'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border',
}

export default function Step1() {
  const { state, dispatch } = useProjeto()
  const set = f => e => dispatch({ type:'SET_FIELD', field:f, value:e.target.value })
  const normaInfo = getNormaInfo(state.uf || 'MA')

  return (
    <div className={S.section}>
      <div className={S.header}>
        <div className={S.stepLbl}>Etapa 1 de 8</div>
        <h2 className={S.title}>Identificacao do projeto</h2>
        <p className={S.desc}>Dados gerais de identificacao e localizacao. A norma e vinculada ao estado selecionado.</p>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Identificacao</div>
        <div className="fg mb-3">
          <label>Nome do projeto <span className="req">*</span></label>
          <input value={state.nome} onChange={set('nome')} placeholder="Ex: Edificio Comercial Centro"/>
        </div>
        <div className="fg">
          <label>Data de inicio</label>
          <input type="date" value={state.dataInicio} onChange={set('dataInicio')} className="max-w-[220px]"/>
        </div>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Localizacao</div>
        <div className="fg mb-3">
          <label>Endereco completo <span className="req">*</span></label>
          <input value={state.endereco} onChange={set('endereco')} placeholder="Rua, numero, complemento, bairro"/>
        </div>
        <div className="g3">
          <div className="fg"><label>Cidade <span className="req">*</span></label><input value={state.cidade} onChange={set('cidade')} placeholder="Sao Luis"/></div>
          <div className="fg">
            <label>Estado <span className="req">*</span></label>
            <select value={state.uf} onChange={set('uf')}>
              {ESTADOS_DISPONIVEIS.map(e => (
                <option key={e.uf} value={e.uf} disabled={!e.ativo}>
                  {e.nome}{!e.ativo ? ' — em breve' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="fg"><label>CEP</label><input value={state.cep} onChange={set('cep')} placeholder="65000-000"/></div>
        </div>
      </div>

      <div className={S.block}>
        <div className={S.blockTitle}>Norma aplicavel</div>
        <div className="ibox amber">
          <Icon name="info" size={14} color="var(--color-amber)" className="shrink-0"/>
          <span>Norma vinculada ao estado selecionado. Verifique a versao vigente antes de iniciar o dimensionamento.</span>
        </div>
        {normaInfo && (
          <div className="norma-badge">
            <Icon name="file" size={13}/>
            <span>{normaInfo.nome} — {normaInfo.desc}</span>
          </div>
        )}
      </div>
    </div>
  )
}
