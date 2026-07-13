import { useProjeto } from '../../context/ProjetoContext'
import Icon from '../ui/Icon'
const S={section:'max-w-[720px] mx-auto px-12 pt-[34px] pb-24',header:'mb-[26px]',stepLbl:'text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]',title:'text-[22px] font-semibold text-ink mb-[5px]',desc:'text-[13px] text-ink-faint leading-[1.6]',block:'mb-[26px]',blockTitle:'text-[11px] font-medium text-ink-faint uppercase tracking-[.08em] mb-3 pb-2 border-b border-solid border-border'}
export default function Step3() {
  const {state,dispatch}=useProjeto()
  const set=f=>e=>dispatch({type:'SET_FIELD',field:f,value:e.target.value})
  return (
    <div className={S.section}>
      <div className={S.header}><div className={S.stepLbl}>Etapa 3 de 8</div><h2 className={S.title}>Proprietario e uso</h2><p className={S.desc}>Dados do proprietario e responsavel pela ocupacao.</p></div>
      <div className={S.block}>
        <div className={S.blockTitle}>Proprietario do imovel</div>
        <div className="g2 mb-3">
          <div className="fg"><label>Nome / Razao social <span className="req">*</span></label><input value={state.propNome} onChange={set('propNome')}/></div>
          <div className="fg"><label>CPF / CNPJ <span className="req">*</span></label><input value={state.propDocumento} onChange={set('propDocumento')}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>Telefone</label><input type="tel" value={state.propTelefone} onChange={set('propTelefone')} placeholder="(99) 99999-9999"/></div>
          <div className="fg"><label>E-mail</label><input type="email" value={state.propEmail} onChange={set('propEmail')}/></div>
        </div>
      </div>
      <div className={S.block}>
        <div className={S.blockTitle}>Responsavel pelo uso</div>
        <div className="ibox blue"><Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/><span>Pode ser diferente do proprietario — locatario, empresa gestora ou administrador.</span></div>
        <div className="g2 mb-3">
          <div className="fg"><label>Razao social <span className="req">*</span></label><input value={state.respRazaoSocial} onChange={set('respRazaoSocial')}/></div>
          <div className="fg"><label>Nome fantasia</label><input value={state.respFantasia} onChange={set('respFantasia')}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>CNPJ <span className="req">*</span></label><input value={state.respCNPJ} onChange={set('respCNPJ')} placeholder="00.000.000/0000-00"/></div>
          <div className="fg"><label>Telefone</label><input type="tel" value={state.respTelefone} onChange={set('respTelefone')}/></div>
        </div>
      </div>
    </div>
  )
}
