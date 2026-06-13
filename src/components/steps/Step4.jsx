import { useProjeto } from '../../context/ProjetoContext'
const S={section:{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'},header:{marginBottom:26},stepLbl:{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5},title:{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5},desc:{fontSize:13,color:'var(--text-faint)',lineHeight:1.6},block:{marginBottom:26},blockTitle:{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)'}}
export default function Step4() {
  const {state,dispatch}=useProjeto()
  const set=f=>e=>dispatch({type:'SET_FIELD',field:f,value:e.target.value})
  return (
    <div style={S.section}>
      <div style={S.header}><div style={S.stepLbl}>Etapa 4 de 8</div><h2 style={S.title}>Responsavel tecnico</h2><p style={S.desc}>Dados do engenheiro ou arquiteto responsavel pelo PPCI e informacoes da ART.</p></div>
      <div style={S.block}>
        <div style={S.blockTitle}>Projetista</div>
        <div className="g2" style={{marginBottom:12}}>
          <div className="fg"><label>Nome completo <span className="req">*</span></label><input value={state.rtNome} onChange={set('rtNome')}/></div>
          <div className="fg"><label>CREA / CAU <span className="req">*</span></label><input value={state.rtConselho} onChange={set('rtConselho')} placeholder="CREA-MA MA00000000/D"/></div>
        </div>
        <div className="g2" style={{marginBottom:12}}>
          <div className="fg"><label>Especialidade</label>
            <select value={state.rtEspecialidade} onChange={set('rtEspecialidade')}>
              <option>Engenharia Civil</option><option>Engenharia Eletrica</option><option>Arquitetura</option><option>Engenharia de Seguranca</option>
            </select>
          </div>
          <div className="fg"><label>Empresa / Escritorio</label><input value={state.rtEmpresa} onChange={set('rtEmpresa')}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>E-mail</label><input type="email" value={state.rtEmail} onChange={set('rtEmail')}/></div>
          <div className="fg"><label>Telefone</label><input type="tel" value={state.rtTelefone} onChange={set('rtTelefone')}/></div>
        </div>
      </div>
      <div style={S.block}>
        <div style={S.blockTitle}>ART</div>
        <div className="g2" style={{marginBottom:12}}>
          <div className="fg"><label>Numero da ART <span className="req">*</span></label><input value={state.artNumero} onChange={set('artNumero')}/></div>
          <div className="fg"><label>Data de emissao</label><input type="date" value={state.artData} onChange={set('artData')}/></div>
        </div>
        <div className="g2">
          <div className="fg"><label>Tipo de servico</label>
            <select value={state.artTipoServico} onChange={set('artTipoServico')}>
              <option>Projeto</option><option>Execucao</option><option>Projeto e execucao</option><option>Consultoria / Laudo</option>
            </select>
          </div>
          <div className="fg"><label>Valor da obra (R$)</label><input value={state.artValorObra} onChange={set('artValorObra')} placeholder="R$ 0,00"/></div>
        </div>
      </div>
    </div>
  )
}