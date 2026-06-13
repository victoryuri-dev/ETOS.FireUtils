import { useProjeto } from '../../context/ProjetoContext'
import Icon from '../ui/Icon'
const S={section:{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'},header:{marginBottom:26},stepLbl:{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5},title:{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5},desc:{fontSize:13,color:'var(--text-faint)',lineHeight:1.6},block:{marginBottom:26},blockTitle:{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)'}}
export default function Step3() {
  const {state,dispatch}=useProjeto()
  const set=f=>e=>dispatch({type:'SET_FIELD',field:f,value:e.target.value})
  return (
    <div style={S.section}>
      <div style={S.header}><div style={S.stepLbl}>Etapa 3 de 8</div><h2 style={S.title}>Proprietario e uso</h2><p style={S.desc}>Dados do proprietario e responsavel pela ocupacao.</p></div>
      <div style={S.block}>
        <div style={S.blockTitle}>Proprietario do imovel</div>
        <div className="g2" style={{marginBottom:12}}>
          <div className="fg"><label>Nome / Razao social <span className="req">*</span></label><input value={state.propNome} onChange={set('propNome')}/></div>
          <div className="fg"><label>CPF / CNPJ <span className="req">*</span></label><input value={state.propDocumento} onChange={set('propDocumento')}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>Telefone</label><input type="tel" value={state.propTelefone} onChange={set('propTelefone')} placeholder="(99) 99999-9999"/></div>
          <div className="fg"><label>E-mail</label><input type="email" value={state.propEmail} onChange={set('propEmail')}/></div>
        </div>
      </div>
      <div style={S.block}>
        <div style={S.blockTitle}>Responsavel pelo uso</div>
        <div className="ibox blue"><Icon name="info" size={14} color="rgba(80,140,220,.85)" style={{flexShrink:0}}/><span>Pode ser diferente do proprietario — locatario, empresa gestora ou administrador.</span></div>
        <div className="g2" style={{marginBottom:12}}>
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